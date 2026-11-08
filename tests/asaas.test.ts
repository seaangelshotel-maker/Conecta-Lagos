import { test } from 'node:test';
import assert from 'node:assert/strict';
import { asaasBaseUrl, asaasConfigured, buildReference, parseReference, isValidWebhookToken, cleanCpfCnpj, toCents, dueDate, planEndsAt } from '../server/asaasCore';

test('sandbox por padrão; produção só com ASAAS_ENV=production', () => {
  assert.equal(asaasBaseUrl(undefined), 'https://api-sandbox.asaas.com/v3');
  assert.equal(asaasBaseUrl('production'), 'https://api.asaas.com/v3');
});
test('desligado sem as três variáveis', () => {
  assert.equal(asaasConfigured({} as any), false);
  assert.equal(asaasConfigured({ PAYMENTS_ENABLED: 'true', ASAAS_API_KEY: 'k' } as any), false);
  assert.equal(asaasConfigured({ PAYMENTS_ENABLED: 'false', ASAAS_API_KEY: 'k', ASAAS_WEBHOOK_TOKEN: 't' } as any), false);
  assert.equal(asaasConfigured({ PAYMENTS_ENABLED: 'true', ASAAS_API_KEY: 'k', ASAAS_WEBHOOK_TOKEN: 't' } as any), true);
});
test('referência ida e volta; formatos inválidos recusados', () => {
  assert.deepEqual(parseReference(buildReference('u', 'b', 'p')), { userId: 'u', businessId: 'b', planId: 'p' });
  assert.equal(parseReference('u:b'), null);
  assert.equal(parseReference('u:b:p:x'), null);
  assert.equal(parseReference('u::p'), null);
});
test('token do webhook comparado com exatidão', () => {
  const t = 'a'.repeat(40);
  assert.equal(isValidWebhookToken(t, t), true);
  assert.equal(isValidWebhookToken([t], t), true);
  assert.equal(isValidWebhookToken('a'.repeat(39), t), false);
  assert.equal(isValidWebhookToken(undefined, t), false);
  assert.equal(isValidWebhookToken(t, undefined), false);
});
test('CPF/CNPJ só com 11 ou 14 dígitos', () => {
  assert.equal(cleanCpfCnpj('123.456.789-09'), '12345678909');
  assert.equal(cleanCpfCnpj('12.345.678/0001-90'), '12345678000190');
  assert.equal(cleanCpfCnpj('123'), null);
});
test('centavos e vencimento', () => {
  assert.equal(toCents(49.9), 4990);
  assert.equal(toCents('10.005'), 1001);
  assert.equal(dueDate(3, new Date('2026-11-08T12:00:00Z')), '2026-11-11');
});
test('fim do plano soma ao prazo vigente', () => {
  const now = new Date('2026-11-08T00:00:00Z');
  assert.equal(planEndsAt('monthly', undefined, now).slice(0, 10), '2026-12-08');
  assert.equal(planEndsAt('yearly', undefined, now).slice(0, 10), '2027-11-08');
  assert.equal(planEndsAt('monthly', '2026-12-01T00:00:00Z', now).slice(0, 10), '2027-01-01');
  assert.equal(planEndsAt('monthly', '2026-10-01T00:00:00Z', now).slice(0, 10), '2026-12-08');
});
