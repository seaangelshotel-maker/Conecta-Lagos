/**
 * Cliente do /api/email (ver server/emailHandler.ts). Tudo aqui falha em silêncio quando o
 * e-mail ainda não está configurado: o app nunca quebra por causa de e-mail.
 */
import { auth } from './firebase';

const call = async (action: string, body?: unknown, withAuth = false) => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (withAuth) {
        const t = await auth.currentUser?.getIdToken();
        if (!t) throw new Error('Entre na sua conta para continuar.');
        headers.Authorization = `Bearer ${t}`;
    }
    const r = await fetch(`/api/email?action=${action}`, { method: 'POST', headers, body: JSON.stringify(body || {}) });
    const j = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, data: j as any };
};

/** Inscreve na newsletter (o servidor manda o e-mail de confirmação). */
export const subscribeNewsletter = async (email: string, source = 'site', website = ''): Promise<{ ok: boolean; error?: string }> => {
    try {
        const r = await call('subscribe', { email, source, website });
        return r.ok ? { ok: true } : { ok: false, error: r.data?.error || 'Não foi possível se inscrever agora.' };
    } catch { return { ok: false, error: 'Sem conexão. Tente de novo.' }; }
};

/** true = o e-mail de nova senha saiu pelo Lagos GO; false = use o e-mail padrão do Firebase. */
export const requestPasswordResetEmail = async (email: string): Promise<boolean> => {
    try {
        const r = await call('password-reset', { email });
        return r.ok && r.data?.via === 'lagosgo';
    } catch { return false; }
};

/** Boas-vindas: o servidor garante que sai uma única vez por usuário. */
export const sendWelcomeOnce = async () => {
    const uid = auth.currentUser?.uid;
    if (!uid) return;
    const key = `lagosgo_welcome_${uid}`;
    try { if (localStorage.getItem(key)) return; } catch { /* sem storage */ }
    try {
        const r = await call('welcome', {}, true);
        if (r.ok && !r.data?.skipped) { try { localStorage.setItem(key, '1'); } catch { /* ok */ } }
    } catch { /* silencioso */ }
};

export const requestEmailVerification = async (): Promise<{ ok: boolean; error?: string }> => {
    try {
        const r = await call('verify-email', {}, true);
        return r.ok ? { ok: true } : { ok: false, error: r.data?.error || 'Não foi possível enviar.' };
    } catch (e: any) { return { ok: false, error: e?.message || 'Não foi possível enviar.' }; }
};

/** Avisa a equipe de um novo pedido (empresa, contato, anúncio). Nunca bloqueia o fluxo. */
export const notifyTeam = async (type: 'claim' | 'lead' | 'ad_request' | 'business_created', info: { businessName?: string; message?: string; contact?: string }) => {
    try { await call('notify-admin', { type, ...info }, true); } catch { /* silencioso */ }
};

// ───── Admin
export const adminEmail = (action: 'status' | 'test' | 'newsletter-preview' | 'newsletter-send', body?: unknown) => call(action, body, true);
