/** Sininho: leitura dos avisos (1 doc geral + 1 pessoal, com cache de 10 min), "visto" no aparelho e contador. */
import { useCallback, useEffect, useState } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from './firebase';
import { cacheGet, cacheSet } from './readCache';
import { InboxItem, mergeInbox, unreadCount } from './inboxRules';

const SEEN_KEY = 'lagosgo_inbox_seen_v1';
const TTL = 10 * 60_000;
const SEEN_EVENT = 'lagosgo-inbox-seen';

export const getSeen = (): string | null => { try { return localStorage.getItem(SEEN_KEY); } catch { return null; } };
export const markSeen = () => {
  try { localStorage.setItem(SEEN_KEY, new Date().toISOString()); } catch { /* ok */ }
  window.dispatchEvent(new Event(SEEN_EVENT));
};

/** Abre um caminho interno do app sem recarregar. */
export const goToLink = (link: string) => {
  try { window.history.pushState({}, '', link || '/'); window.dispatchEvent(new PopStateEvent('popstate')); } catch { window.location.assign(link || '/'); }
};

const readDoc = async (cacheKey: string, col: string, id: string, force: boolean): Promise<InboxItem[]> => {
  const hit = !force && cacheGet<InboxItem[]>(cacheKey, TTL);
  if (hit) return hit;
  try {
    const s = await getDoc(doc(db, col, id));
    const items = s.exists() ? (((s.data() as any).items as InboxItem[]) || []) : [];
    cacheSet(cacheKey, items);
    return items;
  } catch { return []; }
};

export const loadInbox = async (uid?: string | null, force = false): Promise<InboxItem[]> => {
  const [g, p] = await Promise.all([
    readDoc('inbox', 'meta', 'inbox', force),
    uid ? readDoc('inbox_user:' + uid, 'inbox_user', uid, force) : Promise.resolve([] as InboxItem[]),
  ]);
  return mergeInbox(g, p);
};

/** Contador de não lidos para a bolinha do sino. */
export const useInboxUnread = (uid?: string | null) => {
  const [items, setItems] = useState<InboxItem[]>([]);
  const [seen, setSeen] = useState<string | null>(getSeen());
  useEffect(() => { const t = setTimeout(() => { loadInbox(uid).then(setItems).catch(() => {}); }, 2500); return () => clearTimeout(t); }, [uid]);
  useEffect(() => { const on = () => setSeen(getSeen()); window.addEventListener(SEEN_EVENT, on); return () => window.removeEventListener(SEEN_EVENT, on); }, []);
  return unreadCount(items, seen);
};

export const useInbox = (uid?: string | null) => {
  const [items, setItems] = useState<InboxItem[] | null>(null);
  const [seenAtOpen] = useState<string | null>(getSeen());
  const refresh = useCallback(() => { loadInbox(uid, true).then(setItems).catch(() => setItems([])); }, [uid]);
  useEffect(() => { refresh(); }, [refresh]);
  return { items, seenAtOpen, refresh };
};
