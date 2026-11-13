/**
 * Roteador único de e-mail (uma função só, por causa do limite de 12 funções do plano gratuito da Vercel).
 * Ações via ?action=:
 *  público ........ subscribe (POST), confirm (GET), unsubscribe (GET/POST), password-reset (POST),
 *                    redemption-decide (GET mostra a página, POST aplica; vem do botão do e-mail)
 *  usuário logado . welcome, verify-email, notify-admin, redemption-used (POST)
 *  admin .......... status, test, newsletter-preview, newsletter-send (POST)
 *  cron ........... cron-newsletter (GET, Bearer CRON_SECRET)
 */
import { adminAuth, adminDb, isAdminToken, verifyRequestUser } from './firebaseAdmin.js';
import { methodNotAllowed, readJsonBody, sendJson, type Req, type Res } from './http.js';
import { adminRecipients, isEmail, mailConfigured, mailFrom, normalizeEmail, sendMail, siteUrl } from './mail.js';
import * as T from './mailTemplates.js';
import * as N from './newsletter.js';
import * as R from './redemptions.js';
import { readRawBody } from './http.js';

const query = (req: Req, key: string): string => {
    const u = new URL(req.url || '/', 'http://x');
    return u.searchParams.get(key) || '';
};

const html = (res: Res, status: number, body: string) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(body);
};

/** Limita repetições por chave (uid/e-mail/ação) usando um documento em mail_limits. */
export async function allow(key: string, windowMs: number): Promise<boolean> {
  try {
    const ref = adminDb().collection('mail_limits').doc(key.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 200));
    return adminDb().runTransaction(async tx => {
        const s = await tx.get(ref);
        const last = s.exists ? Number(s.data()?.at || 0) : 0;
        if (Date.now() - last < windowMs) return false;
        tx.set(ref, { at: Date.now() });
        return true;
    });
  } catch { return true; } // sem acesso ao banco não há como limitar; o envio segue
}

/** Registro de envios. Se o banco estiver inacessível, o e-mail já foi enviado e o resto segue. */
const log = async (type: string, to: string | string[], ok: boolean, extra: Record<string, unknown> = {}) => {
    try {
        const clean = JSON.parse(JSON.stringify({ type, to: Array.isArray(to) ? to.join(',') : to, ok, at: new Date().toISOString(), ...extra }));
        await adminDb().collection('mail_log').add(clean);
    } catch { /* sem acesso ao banco: ignora */ }
};

/** Aviso à equipe. Falha em silêncio (nunca derruba a ação do usuário). */
export async function notifyAdmins(title: string, lines: [string, string][], link?: string, env = process.env) {
    const to = adminRecipients(env);
    if (!to.length) return { ok: false, skipped: true };
    const t = T.adminAlert({ site: siteUrl(env), title, lines, link });
    const r = await sendMail({ to, ...t, tags: [{ name: 'type', value: 'admin_alert' }] }, env);
    await log('admin_alert', to, r.ok, { title });
    return r;
}

const ADMIN_EVENTS: Record<string, string> = {
    claim: 'Novo pedido para assumir empresa',
    lead: 'Novo contato recebido',
    ad_request: 'Novo pedido de anúncio',
    business_created: 'Nova empresa cadastrada',
};

const clip = (v: unknown, n = 300) => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, n);

export default async function emailHandler(req: Req, res: Res) {
    const action = query(req, 'action');
    const env = process.env;
    const site = siteUrl(env);
    try {
        // ───── Público
        if (action === 'confirm' || action === 'unsubscribe') {
            if (req.method === 'POST' && action === 'unsubscribe') {
                // clique único do cliente de e-mail (RFC 8058)
                const ok = await N.unsubscribe(query(req, 't'), env);
                return sendJson(res, ok ? 200 : 400, { ok });
            }
            if (req.method !== 'GET') return methodNotAllowed(res, ['GET', 'POST']);
            const token = query(req, 't');
            if (action === 'confirm') {
                const ok = await N.confirm(token, env);
                return html(res, ok ? 200 : 400, T.statusPage({ site, ok, title: ok ? 'Inscrição confirmada' : 'Link inválido ou vencido', message: ok ? 'Pronto! Você vai receber o resumo semanal do Lagos GO.' : 'Peça uma nova confirmação pelo site.' }));
            }
            const ok = await N.unsubscribe(token, env);
            return html(res, ok ? 200 : 400, T.statusPage({ site, ok, title: ok ? 'Inscrição cancelada' : 'Link inválido', message: ok ? 'Você não receberá mais a newsletter. Se foi sem querer, é só se inscrever de novo pelo site.' : 'Não foi possível cancelar por este link. Responda a um e-mail nosso e cancelamos para você.' }));
        }

        if (action === 'subscribe') {
            if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
            const body = await readJsonBody<{ email?: string; source?: string; website?: string }>(req);
            if (body.website) return sendJson(res, 200, { ok: true }); // isca para robôs
            const email = normalizeEmail(body.email);
            if (!isEmail(email)) return sendJson(res, 400, { error: 'Informe um e-mail válido.' });
            if (!mailConfigured(env)) return sendJson(res, 503, { error: 'Newsletter indisponível no momento.' });
            const r = await N.subscribe(email, clip(body.source, 40) || 'site', env);
            if (r === 'unavailable') return sendJson(res, 503, { error: 'Newsletter indisponível no momento.' });
            // Resposta igual para qualquer caso: não revela quem já está inscrito.
            return sendJson(res, 200, { ok: true });
        }

        if (action === 'password-reset') {
            if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
            const body = await readJsonBody<{ email?: string }>(req);
            const email = normalizeEmail(body.email);
            if (!isEmail(email)) return sendJson(res, 400, { error: 'Informe um e-mail válido.' });
            if (!mailConfigured(env)) return sendJson(res, 200, { ok: true, via: 'none' }); // o app usa o e-mail padrão do Firebase
            if (await allow(`reset_${email}`, 60_000)) {
                try {
                    const user = await adminAuth().getUserByEmail(email);
                    const link = await adminAuth().generatePasswordResetLink(email, { url: `${site}/login` });
                    const t = T.passwordReset({ site, name: user.displayName || undefined, link });
                    const r = await sendMail({ to: email, ...t, tags: [{ name: 'type', value: 'password_reset' }] }, env);
                    await log('password_reset', email, r.ok);
                } catch { /* e-mail sem conta: mesma resposta */ }
            }
            return sendJson(res, 200, { ok: true, via: 'lagosgo' });
        }

        // Botão do e-mail da empresa: GET só mostra a página (robôs de e-mail abrem links), o POST decide.
        if (action === 'redemption-decide') {
            const id = R.readDecisionToken(query(req, 't'), env);
            const decision = query(req, 'd') === 'refuse' ? 'refuse' : 'confirm';
            if (!id) return html(res, 400, T.statusPage({ site, ok: false, title: 'Link inválido ou vencido', message: 'Peça um novo aviso ou fale com a gente respondendo qualquer e-mail do Lagos GO.' }));
            if (req.method === 'POST') {
                let reason = '';
                try { reason = new URLSearchParams(await readRawBody(req)).get('reason') || ''; } catch { /* sem motivo */ }
                const out = await R.applyDecision(id, decision, reason);
                return html(res, out.ok ? 200 : 400, T.statusPage({ site, ok: out.ok, title: out.title, message: out.message }));
            }
            if (req.method !== 'GET') return methodNotAllowed(res, ['GET', 'POST']);
            const r = await R.loadForDecision(id);
            if (!r) return html(res, 404, T.statusPage({ site, ok: false, title: 'Resgate não encontrado', message: 'O link pode estar errado.' }));
            return html(res, 200, T.decisionPage({
                site, action: decision, action_url: `${site}/api/email?action=redemption-decide&d=${decision}&t=${encodeURIComponent(query(req, 't'))}`,
                couponTitle: r.couponTitle, customerName: r.userName, amount: Number(r.amountSaved) || 0, businessName: r.companyName || 'sua empresa',
                note: r.status === 'USED' && r.confirmedBy === 'auto' ? 'Este cupom foi confirmado automaticamente. Se não foi usado, você ainda pode avisar.' : undefined,
            }));
        }

        // ───── Cron
        if (action === 'cron-newsletter') {
            const secret = env.CRON_SECRET;
            if (!secret) return sendJson(res, 503, { error: 'CRON_SECRET não configurado.' });
            if (req.headers.authorization !== `Bearer ${secret}`) return sendJson(res, 401, { error: 'Não autorizado.' });
            if (!mailConfigured(env)) return sendJson(res, 200, { skipped: true, reason: 'RESEND_API_KEY ausente' });
            if (env.NEWSLETTER_AUTO === 'false') return sendJson(res, 200, { skipped: true, reason: 'NEWSLETTER_AUTO=false' });
            const r = await N.sendWeekly({ env });
            await log('newsletter_weekly', 'inscritos', !('empty' in r && r.empty), { ...r });
            return sendJson(res, 200, r);
        }

        // ───── Precisam de login
        const user = await verifyRequestUser(req.headers.authorization);
        if (!user) return sendJson(res, 401, { error: 'Entre na sua conta para continuar.' });

        if (action === 'welcome' || action === 'verify-email') {
            if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
            if (!mailConfigured(env)) return sendJson(res, 200, { ok: true, skipped: true });
            const email = normalizeEmail(user.email);
            if (!isEmail(email)) return sendJson(res, 200, { ok: true, skipped: true });
            const name = (user.name as string) || undefined;
            if (action === 'welcome') {
                // uma única vez por usuário
                const ref = adminDb().collection('users').doc(user.uid);
                const first = await adminDb().runTransaction(async tx => {
                    const s = await tx.get(ref);
                    if (s.exists && s.data()?.welcomeEmailAt) return false;
                    tx.set(ref, { welcomeEmailAt: new Date().toISOString() }, { merge: true });
                    return true;
                });
                if (!first) return sendJson(res, 200, { ok: true, already: true });
                const r = await sendMail({ to: email, ...T.welcome({ site, name }), tags: [{ name: 'type', value: 'welcome' }] }, env);
                await log('welcome', email, r.ok);
                return sendJson(res, 200, { ok: r.ok });
            }
            if (user.email_verified) return sendJson(res, 200, { ok: true, already: true });
            if (!(await allow(`verify_${user.uid}`, 60_000))) return sendJson(res, 429, { error: 'Aguarde um minuto para pedir outro e-mail.' });
            const link = await adminAuth().generateEmailVerificationLink(email, { url: `${site}/login` });
            const r = await sendMail({ to: email, ...T.verifyEmail({ site, name, link }), tags: [{ name: 'type', value: 'verify_email' }] }, env);
            await log('verify_email', email, r.ok);
            return sendJson(res, 200, { ok: r.ok });
        }

        if (action === 'redemption-used') {
            if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
            const body = await readJsonBody<{ id?: string }>(req);
            if (!body.id) return sendJson(res, 400, { error: 'Resgate inválido.' });
            const out = await R.notifyCompanyOfUse(String(body.id), user.uid, env);
            return sendJson(res, out.status, out.ok ? { ok: true } : { error: out.error });
        }

        if (action === 'notify-admin') {
            if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
            const body = await readJsonBody<{ type?: string; businessName?: string; message?: string; contact?: string }>(req);
            const title = ADMIN_EVENTS[String(body.type)];
            if (!title) return sendJson(res, 400, { error: 'Tipo inválido.' });
            if (!(await allow(`notify_${user.uid}_${body.type}`, 30_000))) return sendJson(res, 429, { error: 'Aguarde um pouco.' });
            const email = normalizeEmail(user.email);
            await notifyAdmins(title, [
                ['Quem', `${clip(user.name, 80)} ${email ? `<${email}>` : ''}`.trim()],
                ['Empresa', clip(body.businessName, 120)],
                ['Contato', clip(body.contact, 120)],
                ['Mensagem', clip(body.message, 500)],
            ], undefined, env);
            if (body.type === 'claim' && isEmail(email) && mailConfigured(env)) {
                await sendMail({ to: email, ...T.claimReceived({ site, name: (user.name as string) || undefined, businessName: clip(body.businessName, 120) || 'sua empresa' }), tags: [{ name: 'type', value: 'claim_received' }] }, env);
            }
            return sendJson(res, 200, { ok: true });
        }

        // ───── Só admin
        if (!(await isAdminToken(user))) return sendJson(res, 403, { error: 'Apenas administradores.' });

        if (action === 'status') {
            // Sem a conta de serviço do Firebase no servidor, o Firestore fica inacessível: o envio de e-mail funciona, a lista de inscritos não.
            let subscribers = { pending: 0, active: 0, unsubscribed: 0 };
            let database = true;
            try { subscribers = await N.countByStatus(); } catch { database = false; }
            return sendJson(res, 200, {
                configured: mailConfigured(env), from: mailFrom(env), admins: adminRecipients(env),
                autoNewsletter: env.NEWSLETTER_AUTO !== 'false', subscribers, database,
            });
        }
        if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
        const body = await readJsonBody<{ to?: string; subject?: string; intro?: string; mode?: string }>(req);

        if (action === 'test') {
            const to = isEmail(body.to) ? normalizeEmail(body.to) : normalizeEmail(user.email);
            if (!isEmail(to)) return sendJson(res, 400, { error: 'Informe um e-mail de destino.' });
            if (!mailConfigured(env)) return sendJson(res, 503, { error: 'RESEND_API_KEY não configurada na Vercel.' });
            const t = T.welcome({ site, name: (user.name as string) || undefined });
            const r = await sendMail({ to, ...t, subject: `[Teste] ${t.subject}`, tags: [{ name: 'type', value: 'test' }] }, env);
            await log('test', to, r.ok, { error: r.error });
            return sendJson(res, r.ok ? 200 : 502, r);
        }

        if (action === 'newsletter-preview' || action === 'newsletter-send') {
            const data = await N.buildNewsletterData(env, clip(body.intro, 400) || undefined);
            const preview = T.newsletterWeekly({ site, data, unsubscribeUrl: `${site}/`, subject: clip(body.subject, 150) || undefined });
            if (action === 'newsletter-preview') {
                return sendJson(res, 200, { subject: preview.subject, html: preview.html, hasContent: T.newsletterHasContent(data), counts: { events: data.events.length, coupons: data.coupons.length, posts: data.posts.length } });
            }
            if (!mailConfigured(env)) return sendJson(res, 503, { error: 'RESEND_API_KEY não configurada na Vercel.' });
            if (body.mode === 'test') {
                const to = normalizeEmail(user.email);
                const u = N.unsubscribeUrl(to, env);
                const t = T.newsletterWeekly({ site, data, unsubscribeUrl: u, subject: `[Teste] ${preview.subject}` });
                const r = await sendMail({ to, ...t, tags: [{ name: 'type', value: 'newsletter_test' }] }, env);
                return sendJson(res, r.ok ? 200 : 502, r);
            }
            const r = await N.sendWeekly({ env, subject: clip(body.subject, 150) || undefined, intro: clip(body.intro, 400) || undefined });
            await log('newsletter_manual', 'inscritos', !('empty' in r && r.empty), { ...r, by: user.uid });
            return sendJson(res, 200, r);
        }

        return sendJson(res, 400, { error: 'Ação desconhecida.' });
    } catch (error) {
        console.error('[email] erro:', error);
        return sendJson(res, 500, { error: 'Erro ao processar e-mail.' });
    }
}
