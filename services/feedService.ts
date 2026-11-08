/**
 * Feed editorial paginado: matérias do Guia + dicas, mais novas primeiro.
 * Lê em páginas (cursor do Firestore) e nunca baixa tudo de uma vez.
 */
import { collection, getDocs, limit, orderBy, query, startAfter, QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';
import { db } from './firebase';
import { BlogPost } from '../types';

export interface FeedPage { items: BlogPost[]; cursor: QueryDocumentSnapshot<DocumentData> | null; done: boolean; }
export const FEED_PAGE_SIZE = 8;

/** Evita dois cards seguidos da mesma categoria sempre que possível (sensação de variedade). */
export const diversify = (items: BlogPost[], lastCategory?: string): BlogPost[] => {
  const rest = [...items]; const out: BlogPost[] = []; let prev = lastCategory;
  while (rest.length) {
    let i = rest.findIndex(x => x.category !== prev);
    if (i < 0) i = 0;
    const [x] = rest.splice(i, 1); out.push(x); prev = x.category;
  }
  return out;
};

export const fetchFeedPage = async (cursor: QueryDocumentSnapshot<DocumentData> | null, size = FEED_PAGE_SIZE): Promise<FeedPage> => {
  const q = cursor
    ? query(collection(db, 'blog_posts'), orderBy('date', 'desc'), startAfter(cursor), limit(size))
    : query(collection(db, 'blog_posts'), orderBy('date', 'desc'), limit(size));
  const snap = await getDocs(q);
  const items = snap.docs
    .map(d => ({ id: d.id, ...d.data() } as BlogPost))
    .filter(p => p.status !== 'draft' && p.title);
  return { items, cursor: snap.docs.length ? snap.docs[snap.docs.length - 1] : cursor, done: snap.docs.length < size };
};
