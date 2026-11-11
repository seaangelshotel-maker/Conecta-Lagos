import type { Req, Res } from '../server/http.js';
import { sendJson } from '../server/http.js';
import { adminDb } from '../server/firebaseAdmin.js';
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
                if (u.exists) await u.ref.set({ plan: FREE_PLAN_ID, paymentSubscriptionStatus: 'expired' }, { merge: true });
            }
            downgraded++;
        }
        return sendJson(res, 200, { checked: snap.size, downgraded });
    } catch (error) {
        console.error('[expire-plans] erro:', error);
        return sendJson(res, 500, { error: 'Erro ao rebaixar planos vencidos.' });
    }
}
