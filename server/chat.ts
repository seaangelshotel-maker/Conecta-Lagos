/**
 * Chat cliente ↔ empresa (servidor). Roteado por /api/email?action=chat-* (ver emailHandler).
 * O app NUNCA grava em chat_threads/messages: só o servidor, depois de conferir sessão, plano, bloqueio e limites.
 * Coleções: chat_threads/{id}, chat_threads/{id}/messages/{id}, chat_consents/{uid}, chat_reports/{id}.
 */
import type { Firestore } from 'firebase-admin/firestore';
import {
  bumpWindow, CHAT_TERMS_VERSION, cleanMessage, isParticipant, MAX_NEW_THREADS_PER_DAY, MAX_ORDER_LEN, otherParty, previewOf,
  REPORT_REASONS, resolveChannels, sendBlockReason, threadIdFor,
} from '../services/chatRules.js';
import { addToInbox, inboxId, type InboxItem } from '../services/inboxRules.js';

export interface ChatResult { status: number; ok: boolean; error?: string; threadId?: string; notify?: { ownerId: string; businessName: string; customerName: string; preview: string; threadId: string } }
const fail = (status: number, error: string): ChatResult => ({ status, ok: false, error });
const first = (name?: unknown) => String(name || '').trim().split(/\s+/)[0].slice(0, 40) || 'Cliente';
const MSGS = (db: Firestore, id: string) => db.collection('chat_threads').doc(id).collection('messages');

/** Plano da empresa: por id ou nome (como o resto do app). */
async function planOf(db: Firestore, biz: any) {
  const key = String(biz.plan || '');
  if (!key || key === 'free') return null;
  const snap = await db.collection('plans').get();
  const plans = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  return plans.find(p => p.id === key || p.name === key) || null;
}

type Loaded = { err: ChatResult; ref?: undefined; t?: undefined } | { err?: undefined; ref: FirebaseFirestore.DocumentReference; t: any };
async function loadThread(db: Firestore, threadId: unknown, uid: string): Promise<Loaded> {
  if (typeof threadId !== 'string' || !threadId || threadId.length > 400 || threadId.includes('/')) return { err: fail(400, 'Conversa inválida.') };
  const ref = db.collection('chat_threads').doc(threadId);
  const snap = await ref.get();
  if (!snap.exists) return { err: fail(404, 'Conversa não encontrada.') };
  const t = snap.data() as any;
  if (!isParticipant(t, uid)) return { err: fail(404, 'Conversa não encontrada.') }; // não revela que existe
  return { ref, t };
}

async function pushMessage(db: Firestore, ref: FirebaseFirestore.DocumentReference, t: any, uid: string, text: string, kind: 'text' | 'order', now: number): Promise<ChatResult> {
  const win = bumpWindow(t.sendWindow, now);
  if (!win) return fail(429, 'Muitas mensagens nesta conversa. Tente de novo mais tarde.');
  const at = new Date(now).toISOString();
  const other = otherParty(t, uid);
  const msgRef = ref.collection('messages').doc();
  const batch = db.batch();
  batch.set(msgRef, { id: msgRef.id, senderId: uid, text, kind, at });
  batch.update(ref, {
    lastAt: at, lastText: previewOf(text), lastSender: uid, sendWindow: win,
    [`unread.${other}`]: ((t.unread && t.unread[other]) || 0) + 1, [`unread.${uid}`]: 0,
  });
  await batch.commit();
  return { status: 200, ok: true, threadId: ref.id };
}

/** Cliente abre a conversa (aceitando o aviso) e manda a primeira mensagem ou o pedido. */
export async function chatStart(db: Firestore, uid: string, body: any, now = Date.now()): Promise<ChatResult> {
  const businessId = typeof body?.businessId === 'string' ? body.businessId.trim() : '';
  if (!businessId || businessId.length > 200 || businessId.includes('/')) return fail(400, 'Empresa inválida.');
  const isOrder = body?.kind === 'order';
  const text = cleanMessage(body?.text, isOrder ? MAX_ORDER_LEN : undefined);
  if (!text) return fail(400, 'Escreva uma mensagem.');

  const [userSnap, bizSnap, consentSnap] = await Promise.all([
    db.collection('users').doc(uid).get(), db.collection('businesses').doc(businessId).get(), db.collection('chat_consents').doc(uid).get(),
  ]);
  const user = (userSnap.exists ? userSnap.data() : {}) as any;
  if (user.isBlocked === true) return fail(403, 'Sua conta não pode usar o chat.');
  if (!bizSnap.exists) return fail(404, 'Empresa não encontrada.');
  const biz = bizSnap.data() as any;
  const ownerId = String(biz.ownerId || businessId);
  if (ownerId === uid || businessId === uid) return fail(400, 'Você não pode conversar com a sua própria empresa.');
  if (biz.isBlocked === true || (biz.status && !['APPROVED', 'approved'].includes(String(biz.status)))) return fail(403, 'Esta empresa não está disponível.');

  const plan = await planOf(db, biz);
  if (!resolveChannels(biz, plan).chat) return fail(403, 'Esta empresa não recebe mensagens pelo chat.');

  const consentOk = consentSnap.exists && (consentSnap.data() as any).version === CHAT_TERMS_VERSION;
  if (!consentOk) {
    if (body?.acceptTerms !== true) return fail(412, 'É preciso aceitar o aviso para conversar.');
    await db.collection('chat_consents').doc(uid).set({ version: CHAT_TERMS_VERSION, acceptedAt: new Date(now).toISOString(), ip: String(body?._ip || '').slice(0, 64), userAgent: String(body?._ua || '').slice(0, 300) });
  }

  const id = threadIdFor(businessId, uid);
  const ref = db.collection('chat_threads').doc(id);
  const snap = await ref.get();
  let t: any;
  if (snap.exists) {
    t = snap.data();
    const why = sendBlockReason(t, uid);
    if (why && t.blockedBy) return fail(403, why);
  } else {
    const day = new Date(now - 3 * 3600_000).toISOString().slice(0, 10);
    const quotaRef = db.collection('chat_quota').doc(`${uid}_${day}`);
    const ok = await db.runTransaction(async tx => {
      const q = await tx.get(quotaRef); const n = q.exists ? (q.data() as any).n || 0 : 0;
      if (n >= MAX_NEW_THREADS_PER_DAY) return false;
      tx.set(quotaRef, { n: n + 1 }); return true;
    });
    if (!ok) return fail(429, 'Você abriu muitas conversas hoje. Tente amanhã.');
    t = {
      id, businessId, businessName: String(biz.name || '').slice(0, 120), ownerId, customerId: uid, customerName: first(user.name),
      status: 'open', blockedBy: null, reported: false, createdAt: new Date(now).toISOString(), unread: {}, termsVersion: CHAT_TERMS_VERSION,
    };
    await ref.set(t);
  }
  const out = await pushMessage(db, ref, t, uid, text, isOrder ? 'order' : 'text', now);
  if (out.ok) out.notify = { ownerId, businessName: t.businessName, customerName: t.customerName, preview: previewOf(text, 120), threadId: id };
  return out;
}

export async function chatSend(db: Firestore, uid: string, body: any, now = Date.now()): Promise<ChatResult> {
  const text = cleanMessage(body?.text);
  if (!text) return fail(400, 'Escreva uma mensagem (até 1000 letras).');
  const l = await loadThread(db, body?.threadId, uid); if (l.err) return l.err;
  const why = sendBlockReason(l.t, uid); if (why) return fail(403, why);
  const u = await db.collection('users').doc(uid).get();
  if (u.exists && (u.data() as any).isBlocked === true) return fail(403, 'Sua conta não pode usar o chat.');
  const out = await pushMessage(db, l.ref, l.t, uid, text, 'text', now);
  if (out.ok && uid === l.t.customerId) out.notify = { ownerId: l.t.ownerId, businessName: l.t.businessName, customerName: l.t.customerName, preview: previewOf(text, 120), threadId: l.ref.id };
  return out;
}

export async function chatRead(db: Firestore, uid: string, body: any): Promise<ChatResult> {
  const l = await loadThread(db, body?.threadId, uid); if (l.err) return l.err;
  await l.ref.update({ [`unread.${uid}`]: 0 });
  return { status: 200, ok: true };
}

export async function chatBlock(db: Firestore, uid: string, body: any): Promise<ChatResult> {
  const l = await loadThread(db, body?.threadId, uid); if (l.err) return l.err;
  if (body?.block === false) {
    if (l.t.blockedBy !== uid) return fail(403, 'Só quem bloqueou pode desbloquear.');
    await l.ref.update({ blockedBy: null });
  } else {
    await l.ref.update({ blockedBy: l.t.blockedBy || uid });
  }
  return { status: 200, ok: true };
}

export async function chatReport(db: Firestore, uid: string, body: any, now = Date.now()): Promise<ChatResult & { reportId?: string }> {
  const l = await loadThread(db, body?.threadId, uid); if (l.err) return l.err;
  const reason = REPORT_REASONS.includes(body?.reason) ? body.reason : 'outro';
  const note = (cleanMessage(body?.note, 500) || '');
  const last = await MSGS(db, l.ref.id).orderBy('at', 'desc').limit(30).get();
  const ref = db.collection('chat_reports').doc();
  await ref.set({
    id: ref.id, threadId: l.ref.id, businessId: l.t.businessId, businessName: l.t.businessName, reporterId: uid,
    reportedId: otherParty(l.t, uid), reason, note, at: new Date(now).toISOString(), status: 'open',
    messages: last.docs.map(d => d.data()).reverse(),
  });
  await l.ref.update({ reported: true });
  return { status: 200, ok: true, reportId: ref.id };
}

/** Aviso ao dono da empresa no sininho do app (falha aqui nunca derruba o envio). */
export async function notifyOwnerInbox(db: Firestore, n: NonNullable<ChatResult['notify']>, now = Date.now()) {
  const at = new Date(now).toISOString();
  const item: InboxItem = { id: inboxId(at, `chat-${n.threadId}`), title: `Nova mensagem de ${n.customerName}`, body: `${n.businessName}: ${n.preview}`, link: `/conversas/${encodeURIComponent(n.threadId)}`, at, kind: 'geral' };
  const ref = db.collection('inbox_user').doc(n.ownerId);
  const snap = await ref.get();
  await ref.set({ items: addToInbox((snap.exists ? (snap.data() as any).items : []) as InboxItem[], item), updatedAt: at });
}
