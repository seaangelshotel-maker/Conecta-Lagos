import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AppEvent, Coupon } from '../types';
import { buildWeeklyDigest, topCoupons, weekendEvents, isCouponLive } from '../services/weeklyDigest';

const TODAY = '2026-11-11'; // quarta-feira → fim de semana = 13 a 15
const NOW = Date.parse('2026-11-11T15:00:00Z');

const ev = (o: Partial<AppEvent>): AppEvent => ({
  id: o.id || o.title || 'e', title: 'Evento', category: 'festa' as any, startDate: '2026-11-14', cityId: 'arraial-do-cabo', status: 'published', ...o,
} as AppEvent);
const cp = (o: Partial<Coupon>): Coupon => ({
  id: o.id || o.title || 'c', companyId: 'a', companyName: 'Ana', title: 'Cupom', description: '', originalPrice: 100, discountedPrice: 80,
  discountPercentage: 20, imageUrl: '', category: 'x', expiryDate: '2026-12-31', code: 'X', active: true, ...o,
} as Coupon);

test('fim de semana: só eventos publicados que tocam sexta a domingo, em ordem', () => {
  const list = weekendEvents([
    ev({ title: 'Sábado', startDate: '2026-11-14' }),
    ev({ title: 'Sexta', startDate: '2026-11-13' }),
    ev({ title: 'Semana que vem', startDate: '2026-11-20' }),
    ev({ title: 'Rascunho', startDate: '2026-11-14', status: 'pending' as any }),
    ev({ title: 'Longo', startDate: '2026-11-10', endDate: '2026-11-16' }),
  ], TODAY);
  assert.deepEqual(list.map(e => e.title), ['Longo', 'Sexta', 'Sábado']);
});

test('cupom vale: ativo, aprovado, na validade, com saldo e com economia', () => {
  assert.equal(isCouponLive(cp({}), NOW), true);
  assert.equal(isCouponLive(cp({ active: false }), NOW), false);
  assert.equal(isCouponLive(cp({ status: 'pending' }), NOW), false);
  assert.equal(isCouponLive(cp({ expiryDate: '2026-11-10' }), NOW), false);
  assert.equal(isCouponLive(cp({ expiryDate: '2026-11-11' }), NOW), true); // vale o dia inteiro
  assert.equal(isCouponLive(cp({ maxRedemptions: 5, currentRedemptions: 5 }), NOW), false);
  assert.equal(isCouponLive(cp({ originalPrice: 50, discountedPrice: 50 }), NOW), false);
});

test('melhores cupons: maior economia primeiro, um por estabelecimento', () => {
  const top = topCoupons([
    cp({ id: '1', companyId: 'a', title: 'A1', originalPrice: 100, discountedPrice: 70 }),
    cp({ id: '2', companyId: 'a', title: 'A2', originalPrice: 200, discountedPrice: 100 }),
    cp({ id: '3', companyId: 'b', companyName: 'Bia', title: 'B1', originalPrice: 60, discountedPrice: 40 }),
    cp({ id: '4', companyId: 'c', companyName: 'Cid', title: 'C1', originalPrice: 30, discountedPrice: 25 }),
  ], 2, NOW);
  assert.deepEqual(top.map(c => c.id), ['2', '3']);
});

test('texto do aviso traz agenda, cupons com a economia em reais e o link', () => {
  const d = buildWeeklyDigest({
    events: [ev({ title: 'Festival do Peixe', startDate: '2026-11-14', locationName: 'Praia dos Anjos', isFree: true, startTime: '18:00' })],
    coupons: [cp({ title: 'Passeio de barco', companyName: 'Ana Tur', originalPrice: 120, discountedPrice: 90 })],
    today: TODAY, now: NOW,
  });
  assert.equal(d.empty, false);
  assert.match(d.text, /Festival do Peixe/);
  assert.match(d.text, /Praia dos Anjos/);
  assert.match(d.text, /grátis/);
  assert.match(d.text, /Ana Tur: Passeio de barco/);
  assert.match(d.text, /R\$\s30,00/);
  assert.match(d.text, /https:\/\/\S+\/eventos/);
  assert.equal(d.push.link, '/eventos');
  assert.ok(d.push.title.length <= 80 && d.push.body.length <= 240);
  assert.match(d.push.title, /1 evento/);
  assert.match(d.push.body, /Festival do Peixe/);
});

test('sem nada para contar, não gera texto (não inventa)', () => {
  const d = buildWeeklyDigest({ events: [], coupons: [], today: TODAY, now: NOW });
  assert.equal(d.empty, true);
  assert.equal(d.text, '');
});

test('só cupons: push aponta para a Home e limita a lista de eventos com "+ N no app"', () => {
  const only = buildWeeklyDigest({ events: [], coupons: [cp({})], today: TODAY, now: NOW });
  assert.equal(only.push.link, '/');
  assert.equal(only.push.title, 'Cupons da semana');
  const many = buildWeeklyDigest({
    events: Array.from({ length: 7 }, (_, i) => ev({ id: `e${i}`, title: `Ev ${i}`, startDate: '2026-11-14' })),
    coupons: [], today: TODAY, now: NOW, maxEvents: 5,
  });
  assert.match(many.text, /\+ 2 no app/);
  assert.match(many.push.title, /7 eventos/);
});
