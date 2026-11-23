import { test } from 'node:test';
import assert from 'node:assert/strict';
import { journeySteps, maxStage, isAbandoned, funnelDocId, cadastroHint } from '../services/planJourney';

test('jornada: só entram os recursos que o plano tem, cada um com vantagem', () => {
  const basic = journeySteps({ maxCoupons: 0 });
  assert.deepEqual(basic.map(s => s.id), ['ficha']);
  const pro: any = { maxCoupons: 5, maxEvents: 2, isFeatured: true, showGallery: true, showMenu: true, showOrders: true, showChat: true, showSocialMedia: true, extra: 'Post por mês' };
  const ids = journeySteps(pro).map(s => s.id);
  for (const id of ['ficha', 'cupons', 'eventos', 'destaque', 'galeria', 'cardapio', 'pedidos', 'chat', 'redes', 'bonus']) assert.ok(ids.includes(id), id);
  assert.ok(journeySteps(pro).every(s => s.what && s.gain && s.title));
  assert.ok(!journeySteps({ ...pro, showChat: false }).some(s => s.id === 'chat'));
});

test('funil: etapa só sobe e abandono = parado há mais de 1h sem ir ao pagamento', () => {
  assert.equal(maxStage('checkout', 'viewing'), 'checkout');
  assert.equal(maxStage('viewing', 'price'), 'price');
  assert.equal(maxStage(undefined, 'viewing'), 'viewing');
  const now = Date.now();
  assert.equal(isAbandoned({ stage: 'price', updatedAt: new Date(now - 2 * 3_600_000).toISOString() }, now), true);
  assert.equal(isAbandoned({ stage: 'price', updatedAt: new Date(now - 60_000).toISOString() }, now), false);
  assert.equal(isAbandoned({ stage: 'checkout', updatedAt: new Date(now - 9 * 3_600_000).toISOString() }, now), false);
  assert.equal(funnelDocId('u1', 'p1'), 'u1_p1');
});

test('cadastro: cada passo lembra uma vantagem real do plano e etapa cadastro fica entre benefícios e preço', () => {
  const pro: any = { maxCoupons: 5, showGallery: true, showMenu: true, showOrders: true, showChat: true };
  for (const n of [1, 2, 3, 4]) assert.ok(cadastroHint(pro, n).length > 20);
  assert.match(cadastroHint(pro, 4), /chat/);
  assert.doesNotMatch(cadastroHint({ maxCoupons: 0 }, 4), /chat/);
  assert.equal(maxStage('viewing', 'cadastro'), 'cadastro');
  assert.equal(maxStage('price', 'cadastro'), 'price');
});
