import test from 'node:test';
import assert from 'node:assert/strict';
import { isPullBlocked, PULL_BLOCK_SELECTOR } from '../components/AppExtras';

const el = (matches: boolean) => ({ closest: (sel: string) => (sel === PULL_BLOCK_SELECTOR && matches ? {} : null) }) as any;

test('toque dentro do mapa não dispara puxar-para-atualizar', () => {
  assert.equal(isPullBlocked(el(true)), true);
});
test('toque fora do mapa continua podendo atualizar', () => {
  assert.equal(isPullBlocked(el(false)), false);
  assert.equal(isPullBlocked(null), false);
  assert.equal(isPullBlocked({} as any), false);
});
test('o seletor cobre o mapa (Leaflet) e a marca data-no-pull', () => {
  assert.match(PULL_BLOCK_SELECTOR, /leaflet-container/);
  assert.match(PULL_BLOCK_SELECTOR, /data-no-pull/);
});
