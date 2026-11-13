import type { Req, Res } from '../server/http.js';
import { sendJson } from '../server/http.js';
import { adminDb } from '../server/firebaseAdmin.js';
import { adminAlert, planExpired, planExpiring } from '../server/mailTemplates.js';
import { adminRecipients, isEmail, mailConfigured, sendMail, siteUrl } from '../server/mail.js';
import { processRedemptions } from '../server/redemptions.js';
import { needsDowngrade, downgradeFields, FREE_PLAN_ID } from '../services/planRules.js';

/**
 * Rotina diária (Vercel Cron): rebaixa empresas com plano vencido.
 * Só roda com CRON_SECRET configurado; a Vercel envia "Authorization: Bearer <CRON_SECRET>" nas chamadas do cron.
 */
export default async function handler(req: Req, res: Res) {
    const secret = process.env.CRON_SECRET;
    if (!secret) return sendJson(res, 503, { error: 'CRON_SECRET não configurado.' });
    if (req.headers.authorization !== `Bearer ${secret}`) return sendJson(res, 401, { error: 'Não autorizado.' });
    try {
        const db = adminDb();
        const nowIso = new Date().toISOString();
        const snap = await db.collection('businesses').where('subscriptionEndsAt', '<', nowIso).get();
        let downgraded = 0;
        for (const d of snap.docs) {
            const b = d.data() as any;
            if (!needsDowngrade({ ...b, id: d.id })) continue;
            await d.ref.set(downgradeFields(b, nowIso), { merge: true });
            const ownerId = b.ownerId || (b.isClaimed === false ? '' : d.id);
            if (ownerId) {
                const u = await db.collection('users').doc(ownerId).get();
                if (u.exists) {
                    await u.ref.set({ plan: FREE_PLAN_ID, paymentSubscriptionStatus: 'expired' }, { merge: true });
                    const ud = u.data() as any;
                    if (mailConfigured() && isEmail(ud?.email)) {
                        await sendMail({ to: ud.email, ...planExpired({ site: siteUrl(), name: ud.name, businessName: b.name || 'sua empresa', planName: String(b.planName || b.plan || 'pago') }), tags: [{ name: 'type', value: 'plan_expired' }] });
                    }
                }
            }
            downgraded++;
        }
        const warned = await warnExpiring(db, nowIso);
        // Cupons: lembrete com 48h e confirmação automática com 72h. Falha aqui não derruba a rotina de planos.
        const redemptions = await processRedemptions(db).catch(e => { console.error('[redemptions] erro:', e); return { error: true }; });
        return sendJson(res, 200, { checked: snap.size, downgraded, warned, redemptions });
    } catch (error) {
        console.error('[expire-plans] erro:', error);
        return sendJson(res, 500, { error: 'Erro ao rebaixar planos vencidos.' });
    }
}

/** Avisa quem tem plano pago vencendo em 7 ou 1 dia(s). Cada aviso é enviado uma única vez (marca na empresa). */
async function warnExpiring(db: ReturnType<typeof adminDb>, nowIso: string): Promise<number> {
    if (!mailConfigured()) return 0;
    const now = Date.parse(nowIso);
    const limit = new Date(now + 8 * 86400000).toISOString();
    const snap = await db.collection('businesses').where('subscriptionEndsAt', '>', nowIso).where('subscriptionEndsAt', '<', limit).get();
    let sent = 0;
    for (const d of snap.docs) {
        const b = d.data() as any;
        const left = Math.ceil((Date.parse(b.subscriptionEndsAt) - now) / 86400000);
        const bucket = left <= 1 ? 1 : left <= 7 ? 7 : 0;
        if (!bucket || b.expiryWarned === `${bucket}:${b.subscriptionEndsAt}`) continue;
        const ownerId = b.ownerId || (b.isClaimed === false ? '' : d.id);
        const u = ownerId ? (await db.collection('users').doc(ownerId).get()).data() as any : null;
        if (!u || !isEmail(u.email)) continue;
        const r = await sendMail({ to: u.email, ...planExpiring({ site: siteUrl(), name: u.name, businessName: b.name || 'sua empresa', planName: String(b.planName || b.plan || 'pago'), endsAt: b.subscriptionEndsAt, days: bucket }), tags: [{ name: 'type', value: 'plan_expiring' }] });
        if (r.ok) { await d.ref.set({ expiryWarned: `${bucket}:${b.subscriptionEndsAt}` }, { merge: true }); sent++; }
    }
    if (sent) await sendMail({ to: adminRecipients(), ...adminAlert({ site: siteUrl(), title: `${sent} aviso(s) de vencimento enviados`, lines: [['Quantidade', String(sent)]] }), tags: [{ name: 'type', value: 'admin_alert' }] });
    return sent;
}
