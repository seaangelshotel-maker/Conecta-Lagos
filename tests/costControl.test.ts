import test from 'node:test';
import assert from 'node:assert/strict';
import { cacheGet, cacheSet, cacheClear, MAX_CACHE_CHARS } from '../services/readCache';
import { createThrottle } from '../services/throttle';

const memStore = () => {
  const m = new Map<string, string>();
  return { getItem: (k: string) => m.get(k) ?? null, setItem: (k: string, v: string) => { m.set(k, v); }, removeItem: (k: string) => { m.delete(k); }, m };
};

test('cache devolve o valor dentro da validade e expira depois', () => {
  const s = memStore();
  assert.ok(cacheSet('x', [{ id: 1 }], 1000, s));
  assert.deepEqual(cacheGet('x', 5000, 3000, s), [{ id: 1 }]);
  assert.equal(cacheGet('x', 5000, 7000, s), null);
  assert.equal(s.m.size, 0, 'expirado é removido');
});

test('cache ignora relógio no passado e JSON quebrado', () => {
  const s = memStore();
  cacheSet('x', 1, 5000, s);
  assert.equal(cacheGet('x', 5000, 1000, s), null);
  s.setItem('lagosgo_cache_v1:y', '{bad');
  assert.equal(cacheGet('y', 5000, 1000, s), null);
});

test('cache não grava o que é grande demais e sem storage não quebra', () => {
  const s = memStore();
  assert.equal(cacheSet('big', 'a'.repeat(MAX_CACHE_CHARS + 10), 1, s), false);
  assert.equal(cacheSet('x', 1, 1, null), false);
  assert.equal(cacheGet('x', 1, 1, null), null);
  cacheSet('k', 1, 1, s); cacheClear('k', s);
  assert.equal(s.m.size, 0);
});

test('freio: mesmo evento em sequência conta uma vez, outros passam', () => {
  const t = createThrottle({ sameKeyMs: 3000, maxPerWindow: 100, windowMs: 600000 });
  assert.equal(t.allow('a', 0), true);
  assert.equal(t.allow('a', 1000), false);
  assert.equal(t.allow('b', 1000), true);
  assert.equal(t.allow('a', 3500), true);
});

test('freio: limite por janela e volta depois dela', () => {
  const t = createThrottle({ sameKeyMs: 0, maxPerWindow: 3, windowMs: 1000 });
  assert.deepEqual([1, 2, 3, 4].map(i => t.allow('k' + i, 10)), [true, true, true, false]);
  assert.equal(t.allow('z', 2000), true);
});
