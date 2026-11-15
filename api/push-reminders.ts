import type { Req, Res } from '../server/http.js';
import { sendJson } from '../server/http.js';
import { adminDb, getAdminApp } from '../server/firebaseAdmin.js';
import { runReminders } from '../server/reminders.js';

/** Vercel Cron: lembretes pessoais. Exige CRON_SECRET (a Vercel envia "Authorization: Bearer <CRON_SECRET>"). */
export default async function handler(req: Req, res: Res) {
    const secret = process.env.CRON_SECRET;
    if (!secret) return sendJson(res, 503, { error: 'CRON_SECRET não configurado.' });
    if (req.headers.authorization !== `Bearer ${secret}`) return sendJson(res, 401, { error: 'Não autorizado.' });
    if (!process.env.FIREBASE_SERVICE_ACCOUNT) return sendJson(res, 503, { error: 'FIREBASE_SERVICE_ACCOUNT não configurado.' });
    try { getAdminApp(); return sendJson(res, 200, await runReminders(adminDb())); }
    catch (e: any) { console.error('[push-reminders] erro:', String(e?.message || e).slice(0, 200)); return sendJson(res, 500, { error: 'Erro ao enviar lembretes.' }); }
}
