import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { PricingPlan } from '../types';
import {
  couponSaving, percentOff, formatBRL, isExpired, walletStatus, walletSummary, sortRedemptions,
  normalizeCode, checkRedemptionCode, merchantImpact, couponQuota, couponQuotaState, countsAgainstCouponQuota,
  RedemptionView,
} from '../services/walletRules';

const NOW = Date.parse('2026-11-11T15:00:00Z');

const red = (o: Partial<RedemptionView> & { userId?: string }): RedemptionView & { userId?: string } => ({
  id: o.id || Math.random().toString(36).slice(2), couponId: 'c1', couponTitle: '10% no passeio', companyId: 'ana',
  amountSaved: 20, redeemedAt: '2026-11-10T12:00:00.000Z', status: 'PENDING', verificationCode: '123456', expiryDate: '2026-12-31', ...o,
});

test('economia do cupom: diferença entre preços, nunca negativa, em centavos', () => {
  assert.equal(couponSaving({ originalPrice: 100, discountedPrice: 80 }), 20);
  assert.equal(couponSaving({ originalPrice: 100, discountedPrice: 79.9 }), 20.1); // sem 20.099999999999994
  assert.equal(couponSaving({ originalPrice: 50, discountedPrice: 80 }), 0);
  assert.equal(couponSaving({ originalPrice: NaN as any, discountedPrice: 10 }), 0);
  assert.equal(percentOff({ originalPrice: 200, discountedPrice: 150 }), 25);
  assert.equal(percentOff({ originalPrice: 0, discountedPrice: 0 }), 0);
});

test('formatBRL usa vírgula e duas casas', () => {
  assert.match(formatBRL(1234.5), /^R\$\s1\.234,50$/);
  assert.match(formatBRL(0), /^R\$\s0,00$/);
  assert.match(formatBRL(NaN), /^R\$\s0,00$/);
});

test('validade vale o dia inteiro', () => {
  assert.equal(isExpired('2026-11-11', NOW), false); // hoje ainda vale
  assert.equal(isExpired('2026-11-10', NOW), true);
  assert.equal(isExpired(undefined, NOW), false);
  assert.equal(isExpired('lixo', NOW), false);
});

test('status da carteira: usado, reservado ou expirado', () => {
  assert.equal(walletStatus(red({ status: 'USED' }), NOW), 'used');
  assert.equal(walletStatus(red({ status: 'PENDING' }), NOW), 'reserved');
  assert.equal(walletStatus(red({ status: 'PENDING', expiryDate: '2026-11-01' }), NOW), 'expired');
  // usado antes de vencer continua usado mesmo depois da validade
  assert.equal(walletStatus(red({ status: 'USED', expiryDate: '2026-11-01' }), NOW), 'used');
  assert.equal(walletStatus(red({ status: 'EXPIRED' }), NOW), 'expired');
});

test('só o que o estabelecimento confirmou conta como economizado', () => {
  const s = walletSummary([
    red({ id: 'a', status: 'USED', amountSaved: 30 }),
    red({ id: 'b', status: 'USED', amountSaved: 12.5 }),
    red({ id: 'c', status: 'PENDING', amountSaved: 100 }),
    red({ id: 'd', status: 'PENDING', amountSaved: 40, expiryDate: '2026-11-01' }),
  ], NOW);
  assert.equal(s.saved, 42.5);
  assert.equal(s.usedCount, 2);
  assert.equal(s.reserved, 100);
  assert.equal(s.reservedCount, 1);
  assert.equal(s.expiredCount, 1);
});

test('carteira vazia e valores inválidos não quebram', () => {
  assert.deepEqual(walletSummary([], NOW), { saved: 0, reserved: 0, usedCount: 0, reservedCount: 0, expiredCount: 0 });
  const s = walletSummary([red({ status: 'USED', amountSaved: -5 }), red({ status: 'USED', amountSaved: 'x' as any })], NOW);
  assert.equal(s.saved, 0);
});

test('ordem: mais recente primeiro, estável', () => {
  const l = sortRedemptions([red({ id: 'x', redeemedAt: '2026-11-01T00:00:00Z' }), red({ id: 'y', redeemedAt: '2026-11-09T00:00:00Z' })]);
  assert.deepEqual(l.map(r => r.id), ['y', 'x']);
});

test('código no balcão: só confere se bate, uma vez, dentro da validade', () => {
  const r = red({});
  assert.equal(normalizeCode(' 12 34-56 '), '123456');
  assert.deepEqual(checkRedemptionCode('123456', r, NOW), { ok: true });
  assert.deepEqual(checkRedemptionCode('123 456', r, NOW), { ok: true });
  assert.deepEqual(checkRedemptionCode('654321', r, NOW), { ok: false, reason: 'mismatch' });
  assert.deepEqual(checkRedemptionCode('12345', r, NOW), { ok: false, reason: 'format' });
  assert.deepEqual(checkRedemptionCode('', r, NOW), { ok: false, reason: 'format' });
  assert.deepEqual(checkRedemptionCode('123456', red({ status: 'USED' }), NOW), { ok: false, reason: 'used' });
  assert.deepEqual(checkRedemptionCode('123456', red({ expiryDate: '2026-11-01' }), NOW), { ok: false, reason: 'expired' });
  // resgate sem código gravado nunca valida
  assert.deepEqual(checkRedemptionCode('123456', red({ verificationCode: '' as any }), NOW), { ok: false, reason: 'mismatch' });
});

test('regressão: o código digitado nunca é tratado como identificador do comerciante', () => {
  // o bug antigo passava os 6 dígitos no lugar do UID; agora só checkRedemptionCode olha o código
  const r = red({ verificationCode: '999999' });
  assert.equal(checkRedemptionCode('999999', r, NOW).ok, true);
  assert.equal(checkRedemptionCode('ana', r, NOW).ok, false);
});

test('painel do comerciante: valor entregue, clientes e pendentes', () => {
  const m = merchantImpact([
    red({ id: '1', status: 'USED', amountSaved: 20, userId: 'u1' }),
    red({ id: '2', status: 'USED', amountSaved: 30, userId: 'u1' }),
    red({ id: '3', status: 'USED', amountSaved: 10, userId: 'u2' }),
    red({ id: '4', status: 'PENDING', amountSaved: 15, userId: 'u3' }),
    red({ id: '5', status: 'PENDING', amountSaved: 99, userId: 'u4', expiryDate: '2026-11-01' }),
  ], NOW);
  assert.deepEqual(m, { given: 60, usedCount: 3, customers: 2, pendingCount: 1, pendingValue: 15 });
});

const plans = [
  { id: 'basic', name: 'Básico', maxCoupons: 3 },
  { id: 'pro', name: 'Pro', maxCoupons: 10 },
] as PricingPlan[];

test('cota de cupons: do admin, senão do plano, senão sem limite', () => {
  assert.equal(couponQuota({ maxCoupons: 7, plan: 'basic' }, plans), 7);
  assert.equal(couponQuota({ plan: 'basic' }, plans), 3);
  assert.equal(couponQuota({ plan: 'Pro' }, plans), 10);
  assert.equal(couponQuota({ plan: 'inexistente' }, plans), null);
  assert.equal(couponQuota({}, plans), null);
  assert.equal(couponQuota(null, plans), null);
  assert.equal(couponQuota({ maxCoupons: 0 }, plans), 0);
});

test('cupom ocupa vaga se está ativo, não foi recusado e não venceu', () => {
  assert.equal(countsAgainstCouponQuota({ active: true, status: 'approved', expiryDate: '2026-12-01' }, NOW), true);
  assert.equal(countsAgainstCouponQuota({ status: 'pending', expiryDate: '2026-12-01' }, NOW), true); // legado sem active
  assert.equal(countsAgainstCouponQuota({ active: false, status: 'approved', expiryDate: '2026-12-01' }, NOW), false);
  assert.equal(countsAgainstCouponQuota({ active: true, status: 'rejected', expiryDate: '2026-12-01' }, NOW), false);
  assert.equal(countsAgainstCouponQuota({ active: true, status: 'approved', expiryDate: '2026-11-01' }, NOW), false);
  const st = couponQuotaState([
    { active: true, status: 'approved', expiryDate: '2026-12-01' },
    { active: true, status: 'pending', expiryDate: '2026-12-01' },
    { active: false, status: 'approved', expiryDate: '2026-12-01' },
  ], 2, NOW);
  assert.deepEqual(st, { used: 2, quota: 2, canCreate: false });
  assert.equal(couponQuotaState([], null, NOW).canCreate, true);
});

import { couponNeedsReapproval, changedCouponKeys } from '../services/walletRules';
const base = { id: 'c1', title: '10% no passeio', description: 'd', originalPrice: 100, discountedPrice: 90, imageUrl: 'x.jpg', active: true, maxRedemptions: 10, expiryDate: '2026-12-31' } as any;

test('cupom aprovado: ligar/desligar e mudar limite NÃO voltam para aprovação', () => {
  assert.equal(couponNeedsReapproval(base, { ...base, active: false }), false);
  assert.equal(couponNeedsReapproval(base, { ...base, maxRedemptions: 50 }), false);
  assert.equal(couponNeedsReapproval(base, { ...base }), false);
});

test('cupom aprovado: mudar título, preço, imagem ou validade volta para aprovação', () => {
  assert.equal(couponNeedsReapproval(base, { ...base, title: 'Outro' }), true);
  assert.equal(couponNeedsReapproval(base, { ...base, discountedPrice: 10 }), true);
  assert.equal(couponNeedsReapproval(base, { ...base, imageUrl: 'y.jpg' }), true);
  assert.equal(couponNeedsReapproval(base, { ...base, expiryDate: '2027-01-31' }), true);
});

test('campo ausente e null contam como iguais (não gera revisão à toa)', () => {
  assert.deepEqual(changedCouponKeys({ ...base }, { ...base, subcategory: undefined, gallery: null as any }), []);
  assert.equal(couponNeedsReapproval({ ...base, rules: undefined }, { ...base, rules: null as any }), false);
});
