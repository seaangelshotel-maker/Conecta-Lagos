import test from 'node:test';
import assert from 'node:assert/strict';
import { buildExport, privacyDaysLeft, privacyDueDate, USER_REQUEST_TYPES } from '../services/privacyModel';

test('exportação junta partes e marca as que falharam', () => {
  const out = buildExport('u1', 'a@b.com', [
    { key: 'cadastro', label: 'Cadastro', data: { name: 'Ana' } },
    { key: 'cuponsResgatados', label: 'Cupons', data: null, error: 'permission-denied' },
  ], new Date('2026-11-11T00:00:00Z'));
  assert.equal(out.titular.id, 'u1');
  assert.deepEqual(out.dados.cadastro, { name: 'Ana' });
  assert.deepEqual(out.dados.cuponsResgatados, { indisponivel: 'permission-denied' });
  assert.equal(out.geradoEm, '2026-11-11T00:00:00.000Z');
});

test('prazo de 15 dias', () => {
  const created = '2026-11-01T12:00:00Z';
  assert.equal(privacyDueDate(created).toISOString(), '2026-11-16T12:00:00.000Z');
  assert.equal(privacyDaysLeft(created, new Date('2026-11-11T12:00:00Z').getTime()), 5);
  assert.ok(privacyDaysLeft(created, new Date('2026-11-20T12:00:00Z').getTime()) < 0);
});

test('titular não escolhe account_deleted', () => {
  assert.ok(!USER_REQUEST_TYPES.includes('account_deleted' as any));
  assert.ok(USER_REQUEST_TYPES.includes('deletion'));
});
