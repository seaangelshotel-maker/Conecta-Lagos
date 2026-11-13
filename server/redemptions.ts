/**
 * Confirmação de resgates de cupom no servidor:
 *  - avisa a empresa quando o cliente marca "já usei" (e-mail com botões, sem login);
 *  - aplica a decisão do botão do e-mail (confirmar / não foi usado);
 *  - rotina diária: lembrete com 48h e confirmação automática com 72h.
 * Regras de prazo: services/redemptionRules.ts.
 */
import { createHmac, timingSafeEqual } from 'crypto';
import type { Firestore } from 'firebase-admin/firestore';
import { adminDb } from './firebaseAdmin.js';
import { isEmail, mailConfigured, sendMail, siteUrl } from './mail.js';
import * as T from './mailTemplates.js';
import { CONTEST_DAYS, canRefuse, cleanReason, isAutoConfirmDue, isReminderDue, autoConfirmDeadline } from '../services/redemptionRules.js';

const TOKEN_TTL_MS = (CONTEST_DAYS + 5) * 86_400_000; // vale até depois da janela de contestação
const secret = (env: NodeJS.ProcessEnv = process.env) => env.MAIL_SECRET || env.CRON_SECRET || '';

export function makeDecisionToken(id: string, env: NodeJS.ProcessEnv = process.env, now = Date.now()): string {
    const payload = `${Buffer.from(id).toString('base64url')}.${now + TOKEN_TTL_MS}`;
    return `${payload}.${createHmac('sha256', secret(env)).update(`redemption.${payload}`).digest('base64url')}`;
}

export function readDecisionToken(token: string, env: NodeJS.ProcessEnv = process.env, now = Date.now()): string | null {
    const key = secret(env);
    if (!key || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [b64, expRaw, sig] = parts;
    const expected = createHmac('sha256', key).update(`redemption.${b64}.${expRaw}`).digest('base64url');
    const a = Buffer.from(sig), c = Buffer.from(expected);
    if (a.length !== c.length || !timingSafeEqual(a, c)) return null;
    if (!(Number(expRaw) >= now)) return null;
    try { const id = Buffer.from(b64, 'base64url').toString('utf8'); return id && id.length < 200 ? id : null; } catch { return null; }
}

export const decisionUrl = (token: string, action: 'confirm' | 'refuse', env: NodeJS.ProcessEnv = process.env) =>
    `${siteUrl(env)}/api/email?action=redemption-decide&d=${action}&t=${encodeURIComponent(token)}`;

interface Company { email?: string; ownerName?: string; businessName: string }

/** Dono da empresa (e-mail) a partir do documento da empresa. */
export async function companyContact(db: Firestore, companyId: string): Promise<Company | null> {
    const b = await db.collection('businesses').doc(companyId).get();
    const bd = (b.exists ? b.data() : {}) as any;
    const ownerId = bd.ownerId || companyId;
    const u = await db.collection('users').doc(ownerId).get();
    const ud = (u.exists ? u.data() : {}) as any;
    return { email: isEmail(ud.email) ? ud.email : undefined, ownerName: ud.name, businessName: bd.name || 'sua empresa' };
}

const mailOpts = async (db: Firestore, r: any, env: NodeJS.ProcessEnv) => {
    const c = await companyContact(db, r.companyId);
    const token = makeDecisionToken(r.id, env);
    return {
        company: c,
        opts: {
            site: siteUrl(env), name: c?.ownerName, businessName: c?.businessName || r.companyName || 'sua empresa',
            customerName: r.userName, couponTitle: r.couponTitle, amount: Number(r.amountSaved) || 0,
            confirmUrl: decisionUrl(token, 'confirm', env), refuseUrl: decisionUrl(token, 'refuse', env),
            deadline: autoConfirmDeadline(r) || undefined,
        },
    };
};

/** Cliente marcou "já usei": avisa a empresa (uma vez por resgate). */
export async function notifyCompanyOfUse(redemptionId: string, uid: string, env: NodeJS.ProcessEnv = process.env): Promise<{ ok: boolean; status: number; error?: string }> {
    const db = adminDb();
    const ref = db.collection('redemptions').doc(redemptionId);
    const snap = await ref.get();
    if (!snap.exists) return { ok: false, status: 404, error: 'Resgate não encontrado.' };
    const r = { id: redemptionId, ...snap.data() } as any;
    if (r.userId !== uid) return { ok: false, status: 403, error: 'Este resgate não é seu.' };
    if (r.status !== 'PENDING' || !r.usedClaimedAt) return { ok: false, status: 409, error: 'Resgate não está aguardando confirmação.' };
    if (r.companyNotifiedAt) return { ok: true, status: 200 };
    if (!mailConfigured(env)) return { ok: true, status: 200 };
    const { company, opts } = await mailOpts(db, r, env);
    if (company?.email) {
        const m = await sendMail({ to: company.email, ...T.redemptionAwaiting(opts), tags: [{ name: 'type', value: 'redemption_awaiting' }] }, env);
        if (m.ok) await ref.set({ companyNotifiedAt: new Date().toISOString() }, { merge: true });
    }
    return { ok: true, status: 200 };
}

export type Decision = 'confirm' | 'refuse';

export async function loadForDecision(id: string) {
    const snap = await adminDb().collection('redemptions').doc(id).get();
    return snap.exists ? ({ id, ...snap.data() } as any) : null;
}

/** Aplica a decisão da empresa. Retorna uma mensagem pronta para mostrar na página. */
export async function applyDecision(id: string, action: Decision, reason: unknown, now = Date.now()): Promise<{ ok: boolean; title: string; message: string }> {
    const db = adminDb();
    const ref = db.collection('redemptions').doc(id);
    const nowIso = new Date(now).toISOString();
    return db.runTransaction(async tx => {
        const s = await tx.get(ref);
        if (!s.exists) return { ok: false, title: 'Resgate não encontrado', message: 'O link pode estar errado.' };
        const r = s.data() as any;
        if (action === 'confirm') {
            if (r.status === 'USED') return { ok: true, title: 'Já confirmado', message: 'Este cupom já estava confirmado. Obrigado!' };
            if (r.status !== 'PENDING') return { ok: false, title: 'Não foi possível confirmar', message: 'Este resgate já foi encerrado.' };
            tx.update(ref, { status: 'USED', validatedAt: nowIso, confirmedBy: 'company' });
            return { ok: true, title: 'Uso confirmado', message: 'Pronto! O desconto entrou na carteira do cliente. Obrigado por participar do Lagos GO.' };
        }
        if (r.status === 'REFUSED') return { ok: true, title: 'Já registrado', message: 'Já constava que este cupom não foi usado.' };
        if (!canRefuse(r, now)) return { ok: false, title: 'Prazo encerrado', message: 'Passou o prazo para contestar este cupom. Se precisar, fale com a gente respondendo qualquer e-mail do Lagos GO.' };
        tx.update(ref, { status: 'REFUSED', refusedAt: nowIso, refusedReason: cleanReason(reason) });
        return { ok: true, title: 'Registrado: não foi usado', message: 'Avisamos que esse cupom não foi usado. Ele não entra na economia do cliente.' };
    });
}

/** Rotina diária: lembrete (48h) e confirmação automática (72h). */
export async function processRedemptions(db: Firestore = adminDb(), now = Date.now(), env: NodeJS.ProcessEnv = process.env) {
    const snap = await db.collection('redemptions').where('status', '==', 'PENDING').get();
    let reminded = 0, autoConfirmed = 0;
    for (const d of snap.docs) {
        const r = { id: d.id, ...d.data() } as any;
        if (!r.usedClaimedAt) continue;
        if (isAutoConfirmDue(r, now)) {
            const nowIso = new Date(now).toISOString();
            await d.ref.update({ status: 'USED', validatedAt: nowIso, confirmedBy: 'auto', autoConfirmedAt: nowIso });
            autoConfirmed++;
            if (mailConfigured(env)) {
                const { company, opts } = await mailOpts(db, r, env);
                if (company?.email) {
                    const { confirmUrl: _c, deadline: _d, ...rest } = opts;
                    await sendMail({ to: company.email, ...T.redemptionAutoConfirmed({ ...rest, contestUntil: new Date(now + CONTEST_DAYS * 86_400_000).toISOString() }), tags: [{ name: 'type', value: 'redemption_auto' }] }, env);
                }
            }
        } else if (isReminderDue(r, now) && mailConfigured(env)) {
            const { company, opts } = await mailOpts(db, r, env);
            if (company?.email) {
                const m = await sendMail({ to: company.email, ...T.redemptionAwaiting({ ...opts, reminder: true }), tags: [{ name: 'type', value: 'redemption_reminder' }] }, env);
                if (m.ok) { await d.ref.update({ reminderSentAt: new Date(now).toISOString() }); reminded++; }
            }
        }
    }
    return { checked: snap.size, reminded, autoConfirmed };
}

