import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isAwaitingCompany, isAutoConfirmDue, isReminderDue, canContest, canRefuse, autoConfirmDeadline, cleanReason,
} from '../services/redemptionRules';
import { walletStatus, walletSummary, merchantImpact, type RedemptionView } from '../services/walletRules';

const T0 = Date.parse('2026-11-10T12:00:00Z');
const H = 3_600_000;
const claimed = (extra: object = {}) => ({ status: 'PENDING', usedClaimedAt: new Date(T0).toISOString(), ...extra });

test('só entra na contagem quem marcou "já usei"', () => {
  assert.equal(isAwaitingCompany({ status: 'PENDING' }), false);
  assert.equal(isAutoConfirmDue({ status: 'PENDING' }, T0 + 500 * H), false);
  assert.equal(isAwaitingCompany(claimed()), true);
});

test('confirmação automática só a partir de 72h', () => {
  assert.equal(isAutoConfirmDue(claimed(), T0 + 71 * H), false);
  assert.equal(isAutoConfirmDue(claimed(), T0 + 72 * H), true);
  assert.equal(autoConfirmDeadline(claimed()), new Date(T0 + 72 * H).toISOString());
});

test('lembrete entre 48h e 72h, uma única vez', () => {
  assert.equal(isReminderDue(claimed(), T0 + 47 * H), false);
  assert.equal(isReminderDue(claimed(), T0 + 48 * H), true);
  assert.equal(isReminderDue(claimed(), T0 + 73 * H), false);
  assert.equal(isReminderDue(claimed({ reminderSentAt: 'x' }), T0 + 50 * H), false);
});

test('já decidido não confirma nem lembra de novo', () => {
  assert.equal(isAutoConfirmDue({ status: 'USED', usedClaimedAt: new Date(T0).toISOString() }, T0 + 100 * H), false);
  assert.equal(isAutoConfirmDue({ status: 'REFUSED', usedClaimedAt: new Date(T0).toISOString() }, T0 + 100 * H), false);
});

test('contestação: só confirmação automática, dentro de 7 dias', () => {
  const auto = { status: 'USED', confirmedBy: 'auto', autoConfirmedAt: new Date(T0).toISOString() };
  assert.equal(canContest(auto, T0 + 6 * 24 * H), true);
  assert.equal(canContest(auto, T0 + 8 * 24 * H), false);
  assert.equal(canContest({ ...auto, confirmedBy: 'company' }, T0 + H), false);
  assert.equal(canRefuse({ status: 'USED', confirmedBy: 'company' }, T0), false);
  assert.equal(canRefuse({ status: 'PENDING' }, T0), true);
  assert.equal(canRefuse({ status: 'REFUSED' }, T0), false);
});

test('motivo da recusa é limpo e limitado', () => {
  assert.equal(cleanReason('  não veio\nninguém  '), 'não veio ninguém');
  assert.equal(cleanReason('x'.repeat(500)).length, 200);
  assert.equal(cleanReason(undefined), '');
});

const view = (o: Partial<RedemptionView> & { userId?: string }): RedemptionView & { userId?: string } => ({
  id: 'r', couponId: 'c', couponTitle: 't', companyId: 'e', amountSaved: 10, redeemedAt: '2026-11-09T10:00:00Z',
  status: 'PENDING', verificationCode: '123456', ...o,
});

test('carteira: aguardando confirmação não conta como economia, automático conta', () => {
  const now = T0 + H;
  assert.equal(walletStatus(view({ usedClaimedAt: new Date(T0).toISOString() }), now), 'awaiting');
  assert.equal(walletStatus(view({ status: 'REFUSED' }), now), 'refused');
  const s = walletSummary([
    view({ id: '1', status: 'USED', confirmedBy: 'auto', amountSaved: 30 }),
    view({ id: '2', usedClaimedAt: new Date(T0).toISOString(), amountSaved: 20 }),
    view({ id: '3', status: 'REFUSED', amountSaved: 99 }),
  ], now);
  assert.equal(s.saved, 30);
  assert.equal(s.awaiting, 20);
  assert.equal(s.awaitingCount, 1);
});

test('painel da empresa separa confirmados automáticos e aguardando', () => {
  const m = merchantImpact([
    view({ id: '1', status: 'USED', confirmedBy: 'auto', amountSaved: 30, userId: 'a' }),
    view({ id: '2', status: 'USED', confirmedBy: 'company', amountSaved: 10, userId: 'b' }),
    view({ id: '3', usedClaimedAt: new Date(T0).toISOString(), amountSaved: 20, userId: 'c' }),
  ], T0 + H);
  assert.equal(m.given, 40);
  assert.equal(m.autoCount, 1);
  assert.equal(m.awaitingCount, 1);
  assert.equal(m.awaitingValue, 20);
});
