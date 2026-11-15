/**
 * Cópia dos avisos para o sininho dentro do app. Um único documento com os últimos 20 (1 leitura por visita).
 * Falha aqui NUNCA pode derrubar o envio do push: quem chama usa try/catch e ignora o erro.
 */
import type { Firestore } from 'firebase-admin/firestore';
import { addToInbox, inboxId, InboxItem } from '../services/inboxRules.js';

export const addBroadcastToInbox = async (db: Firestore, a: { title: string; body: string; link: string; at: string }): Promise<void> => {
  const ref = db.collection('meta').doc('inbox');
  const item: InboxItem = { id: inboxId(a.at, a.title), title: a.title, body: a.body, link: a.link, at: a.at, kind: 'geral' };
  const snap = await ref.get();
  const items = addToInbox((snap.exists ? (snap.data() as any).items : []) as InboxItem[], item);
  await ref.set({ items, updatedAt: a.at });
};

/** Aviso pessoal (lembrete de evento/cupom) na caixa de um usuário. */
export const addPersonalToInbox = async (db: Firestore, uid: string, a: Omit<InboxItem, 'id'> & { id?: string }): Promise<void> => {
  const ref = db.collection('inbox_user').doc(uid);
  const item: InboxItem = { ...a, id: a.id || inboxId(a.at, a.title) };
  const snap = await ref.get();
  const items = addToInbox((snap.exists ? (snap.data() as any).items : []) as InboxItem[], item);
  await ref.set({ items, updatedAt: a.at });
};
