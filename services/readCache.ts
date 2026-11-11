/**
 * Cache com validade no aparelho (localStorage) para listas grandes e públicas.
 * Objetivo: não reler o banco inteiro a cada visita (custo do Firestore é por documento lido).
 * Falha sempre em silêncio: sem cache, o app simplesmente lê do banco como antes.
 */
type StorageLike = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

const PREFIX = 'lagosgo_cache_v1:';
/** Acima disso não vale guardar (limite do localStorage é ~5 MB para o site todo). */
export const MAX_CACHE_CHARS = 1_500_000;

const store = (): StorageLike | null => { try { return typeof localStorage !== 'undefined' ? localStorage : null; } catch { return null; } };

export const cacheGet = <T>(key: string, ttlMs: number, now = Date.now(), s: StorageLike | null = store()): T | null => {
  if (!s) return null;
  try {
    const raw = s.getItem(PREFIX + key);
    if (!raw) return null;
    const { t, v } = JSON.parse(raw) as { t: number; v: T };
    if (typeof t !== 'number' || now - t > ttlMs || now < t) { s.removeItem(PREFIX + key); return null; }
    return v;
  } catch { return null; }
};

export const cacheSet = (key: string, value: unknown, now = Date.now(), s: StorageLike | null = store()): boolean => {
  if (!s) return false;
  try {
    const raw = JSON.stringify({ t: now, v: value });
    if (raw.length > MAX_CACHE_CHARS) return false;
    s.setItem(PREFIX + key, raw);
    return true;
  } catch { return false; }
};

export const cacheClear = (key?: string, s: StorageLike | null = store()) => {
  if (!s) return;
  try {
    if (key) { s.removeItem(PREFIX + key); return; }
    if (typeof localStorage !== 'undefined' && s === localStorage) {
      Object.keys(localStorage).filter(k => k.startsWith(PREFIX)).forEach(k => localStorage.removeItem(k));
    }
  } catch { /* ok */ }
};

/** Janelas de validade. Curtas o bastante para o Guia parecer "ao vivo". */
export const TTL = { businesses: 10 * 60_000, profiles: 30 * 60_000 } as const;
