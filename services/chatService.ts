/**
 * Chat cliente ↔ empresa (app). Leitura em tempo real direto do Firestore (as regras só deixam cada
 * participante ler as suas conversas); toda escrita passa pelo servidor (/api/email?action=chat-*).
 */
import { useEffect, useState } from 'react';
import { collection, doc, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import { auth, db } from './firebase';

export interface ChatThread {
  id: string; businessId: string; businessName: string; ownerId: string; customerId: string; customerName: string;
  status: 'open' | 'closed'; blockedBy: string | null; reported?: boolean; createdAt: string; lastAt?: string; lastText?: string; lastSender?: string;
  unread?: Record<string, number>;
}
export interface ChatMessage { id: string; senderId: string; text: string; at: string; kind: 'text' | 'order' }

const call = async (action: string, body: Record<string, unknown>): Promise<any> => {
  const token = await auth.currentUser?.getIdToken();
  if (!token) throw new Error('Entre na sua conta para conversar.');
  const res = await fetch(`/api/email?action=${action}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({} as any));
  if (!res.ok) { const e: any = new Error(data?.error || 'Não foi possível concluir agora. Tente de novo.'); e.status = res.status; throw e; }
  return data;
};

export const startChat = (businessId: string, text: string, kind: 'text' | 'order', acceptTerms: boolean): Promise<{ threadId: string }> =>
  call('chat-start', { businessId, text, kind, acceptTerms });
export const sendChatMessage = (threadId: string, text: string) => call('chat-send', { threadId, text });
export const markChatRead = (threadId: string) => call('chat-read', { threadId }).catch(() => undefined);
export const blockChat = (threadId: string, block: boolean) => call('chat-block', { threadId, block });
export const reportChat = (threadId: string, reason: string, note: string) => call('chat-report', { threadId, reason, note });

/** Conversas do usuário (como cliente e como dono de empresa), mais recentes primeiro. */
export const useThreads = (uid?: string) => {
  const [threads, setThreads] = useState<ChatThread[]>([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (!uid) { setThreads([]); setLoading(false); return; }
    const parts: Record<string, ChatThread[]> = { c: [], o: [] };
    const push = () => { setThreads([...parts.c, ...parts.o].filter((t, i, a) => a.findIndex(x => x.id === t.id) === i).sort((a, b) => (b.lastAt || b.createdAt).localeCompare(a.lastAt || a.createdAt))); setLoading(false); };
    const sub = (field: 'customerId' | 'ownerId', key: 'c' | 'o') => onSnapshot(query(collection(db, 'chat_threads'), where(field, '==', uid), limit(100)),
      s => { parts[key] = s.docs.map(d => d.data() as ChatThread); push(); }, () => { parts[key] = []; push(); });
    const u1 = sub('customerId', 'c'); const u2 = sub('ownerId', 'o');
    return () => { u1(); u2(); };
  }, [uid]);
  return { threads, loading };
};

export const useThread = (threadId?: string) => {
  const [thread, setThread] = useState<ChatThread | null | undefined>(undefined);
  useEffect(() => {
    if (!threadId) { setThread(null); return; }
    return onSnapshot(doc(db, 'chat_threads', threadId), s => setThread(s.exists() ? (s.data() as ChatThread) : null), () => setThread(null));
  }, [threadId]);
  return thread;
};

export const useMessages = (threadId?: string) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  useEffect(() => {
    if (!threadId) return;
    return onSnapshot(query(collection(db, 'chat_threads', threadId, 'messages'), orderBy('at', 'asc'), limit(300)),
      s => setMessages(s.docs.map(d => d.data() as ChatMessage)), () => setMessages([]));
  }, [threadId]);
  return messages;
};

export const unreadTotal = (threads: ChatThread[], uid: string) => threads.reduce((n, t) => n + (t.unread?.[uid] || 0), 0);
