/**
 * Envio de notificações push pelo admin (Firebase Cloud Messaging via Firebase Admin).
 * Exige FIREBASE_SERVICE_ACCOUNT na Vercel. Remove tokens que deixaram de existir.
 */
import { getMessaging } from 'firebase-admin/messaging';
import { adminDb, getAdminApp, isAdminToken, verifyRequestUser } from './firebaseAdmin.js';
import { Req, Res, sendJson, readJsonBody, methodNotAllowed } from './http.js';
import { safeLink } from './pushLink.js';

const TOPICS = ['cupons', 'materias', 'eventos', 'ajuda', 'todos'];
const DEAD = ['messaging/registration-token-not-registered', 'messaging/invalid-registration-token', 'messaging/invalid-argument'];

export const pushConfigured = () => !!process.env.FIREBASE_SERVICE_ACCOUNT;

export const handlePushSend = async (req: Req, res: Res) => {
  if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
  const token = await verifyRequestUser(req.headers.authorization);
  if (!token || !(await isAdminToken(token).catch(() => false))) return sendJson(res, 403, { error: 'Apenas o administrador pode enviar notificações.' });
  if (!pushConfigured()) return sendJson(res, 503, { error: 'Envio ainda não configurado: falta a variável FIREBASE_SERVICE_ACCOUNT na Vercel.' });

  const body = await readJsonBody<{ title?: string; body?: string; link?: string; topic?: string; dryRun?: boolean }>(req).catch(() => ({} as any));
  const title = String(body.title || '').trim().slice(0, 80);
  const text = String(body.body || '').trim().slice(0, 240);
  const topic = TOPICS.includes(String(body.topic)) ? String(body.topic) : 'todos';
  if (!title || !text) return sendJson(res, 400, { error: 'Título e texto são obrigatórios.' });
  const link = safeLink(body.link);

  try {
    getAdminApp();
    const db = adminDb();
    const q = topic === 'todos' ? db.collection('push_tokens') : db.collection('push_tokens').where('topics', 'array-contains', topic);
    const snap = await q.get();
    const tokens = snap.docs.map(d => d.id);
    if (body.dryRun) return sendJson(res, 200, { recipients: tokens.length });

    let sent = 0, failed = 0; const dead: string[] = [];
    for (let i = 0; i < tokens.length; i += 500) {
      const chunk = tokens.slice(i, i + 500);
      const r = await getMessaging().sendEachForMulticast({
        tokens: chunk,
        notification: { title, body: text },
        data: { link, title, body: text },
        webpush: { fcmOptions: { link }, notification: { icon: '/icons/icon-192.png', badge: '/icons/icon-192.png' } },
        android: { priority: 'high', notification: { clickAction: 'FCM_PLUGIN_ACTIVITY' } },
        apns: { payload: { aps: { sound: 'default' } } },
      });
      sent += r.successCount; failed += r.failureCount;
      r.responses.forEach((x, k) => { if (!x.success && x.error && DEAD.includes(x.error.code)) dead.push(chunk[k]); });
    }
    await Promise.all(dead.map(t => db.collection('push_tokens').doc(t).delete().catch(() => undefined)));
    await db.collection('push_campaigns').add({ title, body: text, link, topic, sent, failed, removed: dead.length, by: token.uid, at: new Date().toISOString() });
    return sendJson(res, 200, { recipients: tokens.length, sent, failed, removed: dead.length });
  } catch (e: any) {
    return sendJson(res, 500, { error: 'Falha ao enviar. Confira as credenciais do Firebase na Vercel.' });
  }
};
