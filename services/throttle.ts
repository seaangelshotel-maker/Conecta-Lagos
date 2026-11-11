/**
 * Freio de escritas de analytics no navegador (puro, testável).
 * Não bloqueia nenhuma ação do usuário: só evita gravar eventos repetidos ou em volume absurdo
 * (cliques em sequência, aba com bug, script malicioso no próprio aparelho).
 */
export interface Throttle { allow: (key: string, now?: number) => boolean }

export const createThrottle = (opts: { sameKeyMs: number; maxPerWindow: number; windowMs: number }): Throttle => {
  const last = new Map<string, number>();
  let windowStart = 0;
  let count = 0;
  return {
    allow(key, now = Date.now()) {
      if (now - windowStart > opts.windowMs) { windowStart = now; count = 0; }
      const prev = last.get(key);
      if (prev !== undefined && now - prev < opts.sameKeyMs) return false;
      if (count >= opts.maxPerWindow) return false;
      count++;
      last.set(key, now);
      if (last.size > 500) last.clear();
      return true;
    },
  };
};
