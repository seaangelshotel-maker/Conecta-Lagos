import { test } from 'node:test';
import assert from 'node:assert/strict';
import { isPlanExpired, needsDowngrade, downgradeFields, FREE_PLAN_ID } from '../services/planRules';

const NOW = Date.parse('2026-11-11T15:00:00Z');

test('vencimento: só vence depois da data; sem data nunca vence', () => {
  assert.equal(isPlanExpired({ subscriptionEndsAt: '2026-11-10T12:00:00.000Z' }, NOW), true);
  assert.equal(isPlanExpired({ subscriptionEndsAt: '2026-11-12T12:00:00.000Z' }, NOW), false);
  assert.equal(isPlanExpired({}, NOW), false);
  assert.equal(isPlanExpired({ subscriptionEndsAt: 'lixo' }, NOW), false);
});

test('rebaixa só quem venceu E ainda tem plano pago ou destaque', () => {
  assert.equal(needsDowngrade({ plan: 'pro', subscriptionEndsAt: '2026-01-01T00:00:00Z' }, NOW), true);
  assert.equal(needsDowngrade({ plan: 'free', isFeatured: true, subscriptionEndsAt: '2026-01-01T00:00:00Z' }, NOW), true);
  assert.equal(needsDowngrade({ plan: 'free', isFeatured: false, subscriptionEndsAt: '2026-01-01T00:00:00Z' }, NOW), false); // já rebaixado
  assert.equal(needsDowngrade({ plan: 'pro', subscriptionEndsAt: '2027-01-01T00:00:00Z' }, NOW), false); // em dia
  assert.equal(needsDowngrade({ plan: 'pro' }, NOW), false); // plano sem data (manual do admin): não mexe
});

test('rebaixe tira destaque, volta para "free" e guarda o plano anterior', () => {
  const f = downgradeFields({ plan: 'pro', isFeatured: true }, '2026-11-11T15:00:00.000Z');
  assert.equal(f.plan, FREE_PLAN_ID);
  assert.equal(f.isFeatured, false);
  assert.equal(f.paymentSubscriptionStatus, 'expired');
  assert.equal(f.previousPlan, 'pro');
  assert.equal(f.planExpiredAt, '2026-11-11T15:00:00.000Z');
});
