import { test } from 'node:test';
import assert from 'node:assert/strict';
import { couponPoints, levelFor, levelProgress, POINTS_PER_COUPON, MONTHLY_CAP } from '../services/pointsRules';
import type { RedemptionView } from '../services/walletRules';

const NOW = Date.parse('2026-11-20T12:00:00Z');
const used = (i: number, month = '2026-11'): RedemptionView => ({
  id: 'r' + i, couponId: 'c', couponTitle: 't', companyId: 'x', amountSaved: 10, redeemedAt: `${month}-05T10:00:00.000Z`, status: 'USED', verificationCode: '123456', expiryDate: '2027-01-01',
});

test('só cupom confirmado gera ponto', () => {
  const pend: RedemptionView = { ...used(1), status: 'PENDING' };
  assert.equal(couponPoints([pend], NOW), 0);
  assert.equal(couponPoints([used(1), used(2)], NOW), 2 * POINTS_PER_COUPON);
});

test('teto mensal vale por mês', () => {
  const nov = Array.from({ length: 15 }, (_, i) => used(i, '2026-11'));
  assert.equal(couponPoints(nov, NOW), MONTHLY_CAP);
  const mix = [...nov, used(99, '2026-10')];
  assert.equal(couponPoints(mix, NOW), MONTHLY_CAP + POINTS_PER_COUPON);
});

test('nível e progresso', () => {
  assert.equal(levelFor(0).id, 'explorador');
  assert.equal(levelFor(49).id, 'explorador');
  assert.equal(levelFor(50).id, 'viajante');
  assert.equal(levelFor(400).id, 'embaixador');
  const p = levelProgress(25);
  assert.equal(p.next?.id, 'viajante');
  assert.equal(p.missing, 25);
  assert.equal(p.percent, 50);
  assert.equal(levelProgress(999).next, null);
  assert.equal(levelFor(-5).id, 'explorador');
});

import { couponBreakdown } from '../services/pointsRules';
test('conta mês a mês bate com o total', () => {
  const items = [...Array.from({ length: 12 }, (_, i) => used(i, '2026-11')), used(50, '2026-10')];
  const b = couponBreakdown(items, NOW);
  assert.deepEqual(b.map(l => [l.month, l.coupons, l.counted, l.capped]), [['2026-11', 12, 100, true], ['2026-10', 1, 10, false]]);
  assert.equal(b.reduce((a, l) => a + l.counted, 0), couponPoints(items, NOW));
});
