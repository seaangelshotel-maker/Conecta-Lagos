/**
 * Envio de e-mail pelo Resend (API HTTP, sem SDK). Usado pelas funções da Vercel e pelo servidor de desenvolvimento.
 *
 * Variáveis de ambiente:
 *  - RESEND_API_KEY  chave secreta do Resend (obrigatória; sem ela nada é enviado e as rotinas seguem sem erro)
 *  - MAIL_FROM       remetente, ex.: "Lagos GO <comercial@lagosgo.com.br>" (o domínio precisa estar verificado no Resend)
 *  - MAIL_REPLY_TO   para onde vão as respostas (padrão: comercial@lagosgo.com.br)
 *  - MAIL_ADMIN_TO   quem recebe os avisos internos, separados por vírgula (padrão: o MAIL_REPLY_TO)
 *  - MAIL_SECRET     segredo para assinar links de confirmação e descadastro (padrão: CRON_SECRET)
 *  - SITE_URL        endereço público do site (padrão: https://lagosgo.com.br)
 */

export const DEFAULT_FROM = 'Lagos GO <comercial@lagosgo.com.br>';
export const DEFAULT_REPLY_TO = 'comercial@lagosgo.com.br';

export const mailConfigured = (env: NodeJS.ProcessEnv = process.env) => !!env.RESEND_API_KEY;
export const mailFrom = (env: NodeJS.ProcessEnv = process.env) => env.MAIL_FROM?.trim() || DEFAULT_FROM;
export const mailReplyTo = (env: NodeJS.ProcessEnv = process.env) => env.MAIL_REPLY_TO?.trim() || DEFAULT_REPLY_TO;
export const adminRecipients = (env: NodeJS.ProcessEnv = process.env): string[] =>
    (env.MAIL_ADMIN_TO || mailReplyTo(env)).split(',').map(s => s.trim()).filter(isEmail);
export const siteUrl = (env: NodeJS.ProcessEnv = process.env) => (env.SITE_URL?.trim() || 'https://lagosgo.com.br').replace(/\/+$/, '');

const EMAIL_RE = /^[^\s@<>"',;]+@[^\s@<>"',;]+\.[^\s@<>"',;]{2,}$/;
export function isEmail(v: unknown): v is string {
    return typeof v === 'string' && v.length <= 254 && EMAIL_RE.test(v.trim());
}
export const normalizeEmail = (v: unknown) => String(v || '').trim().toLowerCase();

export interface MailInput {
    to: string | string[];
    subject: string;
    html: string;
    text: string;
    /** Rótulos para acompanhar no painel do Resend (ex.: { name: 'type', value: 'welcome' }). */
    tags?: { name: string; value: string }[];
    headers?: Record<string, string>;
    replyTo?: string;
    from?: string;
}

export interface MailResult { ok: boolean; skipped?: boolean; id?: string; error?: string }

const API = 'https://api.resend.com';
type Fetch = typeof fetch;

const toBody = (m: MailInput, env: NodeJS.ProcessEnv) => ({
    from: m.from || mailFrom(env),
    to: Array.isArray(m.to) ? m.to : [m.to],
    subject: m.subject,
    html: m.html,
    text: m.text,
    reply_to: m.replyTo || mailReplyTo(env),
    ...(m.tags?.length ? { tags: m.tags.map(t => ({ name: safeTag(t.name), value: safeTag(t.value) })) } : {}),
    ...(m.headers ? { headers: m.headers } : {}),
});

/** O Resend só aceita letras, números, "_" e "-" nos rótulos. */
export const safeTag = (v: string) => String(v).replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 256);

/** Envia um e-mail. Nunca lança erro: devolve { ok:false } e registra no log do servidor. */
export async function sendMail(m: MailInput, env: NodeJS.ProcessEnv = process.env, fetchImpl: Fetch = fetch): Promise<MailResult> {
    if (!mailConfigured(env)) return { ok: false, skipped: true, error: 'E-mail ainda não configurado (falta RESEND_API_KEY).' };
    const recipients = (Array.isArray(m.to) ? m.to : [m.to]).filter(isEmail);
    if (!recipients.length) return { ok: false, error: 'Destinatário inválido.' };
    try {
        const r = await fetchImpl(`${API}/emails`, {
            method: 'POST',
            headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
            body: JSON.stringify(toBody({ ...m, to: recipients }, env)),
        });
        const data: any = await r.json().catch(() => ({}));
        if (!r.ok) {
            console.error('[mail] Resend recusou o envio:', r.status, data?.message || data?.name);
            return { ok: false, error: String(data?.message || `Resend respondeu ${r.status}`) };
        }
        return { ok: true, id: data?.id };
    } catch (e: any) {
        console.error('[mail] falha de rede ao enviar:', e?.message || e);
        return { ok: false, error: 'Falha de rede ao falar com o Resend.' };
    }
}

/** Envia vários e-mails de uma vez (até 100 por chamada). Devolve quantos foram aceitos e quantos falharam. */
export async function sendMailBatch(list: MailInput[], env: NodeJS.ProcessEnv = process.env, fetchImpl: Fetch = fetch): Promise<{ sent: number; failed: number; skipped?: boolean }> {
    if (!mailConfigured(env)) return { sent: 0, failed: 0, skipped: true };
    const valid = list.filter(m => (Array.isArray(m.to) ? m.to : [m.to]).every(isEmail));
    let sent = 0, failed = list.length - valid.length;
    for (let i = 0; i < valid.length; i += 100) {
        const chunk = valid.slice(i, i + 100);
        try {
            const r = await fetchImpl(`${API}/emails/batch`, {
                method: 'POST',
                headers: { Authorization: `Bearer ${env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
                body: JSON.stringify(chunk.map(m => toBody(m, env))),
            });
            if (r.ok) sent += chunk.length;
            else { failed += chunk.length; console.error('[mail] lote recusado:', r.status); }
        } catch (e: any) {
            failed += chunk.length;
            console.error('[mail] falha de rede no lote:', e?.message || e);
        }
    }
    return { sent, failed };
}
