import { test } from 'node:test';
import assert from 'node:assert/strict';
import { canClaim, hasOwner, validateClaim, pendingClaimFor, claimApprovalCheck, siblingClaims, releasableForClaim, waLink } from '../services/claimRules';
import { PUBLIC_PLACES_BATCH } from '../data/publicPlaces';

test('só aparece "Esta é sua empresa?" para empresa sem dono e liberada', () => {
  assert.equal(canClaim({ canBeClaimed: true }), true);
  assert.equal(canClaim({}), true); // legado sem o campo = liberada
  assert.equal(canClaim({ canBeClaimed: false }), false);
  assert.equal(canClaim({ canBeClaimed: true, isClaimed: true }), false);
  assert.equal(canClaim({ canBeClaimed: true, ownerId: 'u1' }), false);
  assert.equal(canClaim({ canBeClaimed: true, isBlocked: true }), false);
  assert.equal(hasOwner({ ownerId: '  ' }), false);
});

test('pedido exige nome, WhatsApp com DDD, relação e declaração', () => {
  assert.deepEqual(Object.keys(validateClaim({ ownerName: '', whatsapp: '', role: '', confirmed: false })).sort(), ['confirmed', 'ownerName', 'role', 'whatsapp']);
  assert.deepEqual(validateClaim({ ownerName: 'Maria Souza', whatsapp: '(22) 99999-0000', role: 'Gerente', confirmed: true }), {});
  assert.ok(validateClaim({ ownerName: 'Maria Souza', whatsapp: '99999', role: 'Gerente', confirmed: true }).whatsapp);
});

test('um pedido em análise por pessoa por empresa', () => {
  const reqs = [{ userId: 'u1', companyId: 'b1', type: 'CLAIM', status: 'PENDING' }, { userId: 'u1', companyId: 'b2', type: 'CLAIM', status: 'REJECTED' }] as any[];
  assert.ok(pendingClaimFor(reqs, 'u1', 'b1'));
  assert.equal(pendingClaimFor(reqs, 'u1', 'b2'), undefined); // recusado antes: pode pedir de novo
  assert.equal(pendingClaimFor(reqs, 'u2', 'b1'), undefined);
});

test('aprovação nunca tira a empresa de quem já é dono', () => {
  const req = { type: 'CLAIM', status: 'PENDING', userId: 'u2', companyId: 'b1' } as any;
  assert.equal(claimApprovalCheck(req, { canBeClaimed: true }).ok, true);
  const r1 = claimApprovalCheck(req, { isClaimed: true, ownerId: 'u1' });
  assert.equal(r1.ok === false && r1.reason, 'already_claimed');
  assert.equal((claimApprovalCheck({ ...req, status: 'APPROVED' }, {}) as any).reason, 'not_pending');
  assert.equal((claimApprovalCheck({ ...req, userId: undefined }, {}) as any).reason, 'no_user');
  assert.equal((claimApprovalCheck(req, null) as any).reason, 'no_business');
  assert.equal((claimApprovalCheck({ ...req, type: 'NEW_REGISTRATION' }, {}) as any).reason, 'not_claim');
});

test('ao aprovar um, os outros pedidos da mesma empresa são recusados', () => {
  const reqs = [
    { id: 'a', type: 'CLAIM', status: 'PENDING', companyId: 'b1' }, { id: 'b', type: 'CLAIM', status: 'PENDING', companyId: 'b1' },
    { id: 'c', type: 'CLAIM', status: 'PENDING', companyId: 'b2' }, { id: 'd', type: 'CLAIM', status: 'REJECTED', companyId: 'b1' },
  ] as any[];
  assert.deepEqual(siblingClaims(reqs, { id: 'a', companyId: 'b1' }).map(r => r.id), ['b']);
});

test('liberação em massa: só sem dono, hoje fechadas, não públicas, na categoria escolhida', () => {
  const list = [
    { id: 1, category: 'Restaurante', canBeClaimed: false },
    { id: 2, category: 'Restaurante', canBeClaimed: true },                  // já liberada
    { id: 3, category: 'Restaurante', canBeClaimed: false, isClaimed: true },  // tem dono
    { id: 4, category: 'Restaurante', canBeClaimed: false, importBatch: PUBLIC_PLACES_BATCH }, // lugar público
    { id: 5, category: 'Hospedagem', canBeClaimed: false },
    { id: 6, category: 'Restaurante', canBeClaimed: false, isBlocked: true },
  ] as any[];
  assert.deepEqual(releasableForClaim(list, ['Restaurante']).map(b => b.id), [1]);
  assert.deepEqual(releasableForClaim(list).map(b => b.id), [1, 5]);
});

test('link do WhatsApp coloca o 55 e ignora lixo', () => {
  assert.equal(waLink('(22) 99999-0000'), 'https://wa.me/5522999990000');
  assert.equal(waLink('+55 22 99999-0000', 'Oi'), 'https://wa.me/5522999990000?text=Oi');
  assert.equal(waLink(''), '');
});
