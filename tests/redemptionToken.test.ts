import { test } from 'node:test';
import assert from 'node:assert/strict';
import { makeDecisionToken, readDecisionToken } from '../server/redemptions';
import { redemptionAwaiting, redemptionAutoConfirmed, decisionPage } from '../server/mailTemplates';

const env = { CRON_SECRET: 'segredo-de-teste' } as NodeJS.ProcessEnv;

test('token de decisão: ida e volta, adulterado e vencido', () => {
  const t = makeDecisionToken('abc123', env, 1_000);
  assert.equal(readDecisionToken(t, env, 2_000), 'abc123');
  assert.equal(readDecisionToken(t + 'x', env, 2_000), null);
  assert.equal(readDecisionToken(t, { CRON_SECRET: 'outro' } as NodeJS.ProcessEnv, 2_000), null);
  assert.equal(readDecisionToken(t, env, 1_000 + 13 * 86_400_000), null);
  assert.equal(readDecisionToken('lixo', env), null);
  assert.equal(readDecisionToken(t, {} as NodeJS.ProcessEnv, 2_000), null);
});

test('e-mails mostram só o primeiro nome do cliente e escapam HTML', () => {
  const m = redemptionAwaiting({ site: 'https://x.br', businessName: 'Loja <b>', customerName: 'Maria da Silva Souza', couponTitle: 'Café', amount: 12.5, confirmUrl: 'https://x.br/c', refuseUrl: 'https://x.br/r' });
  assert.ok(m.html.includes('Maria'));
  assert.ok(!m.html.includes('Silva'));
  assert.ok(!m.html.includes('Loja <b>'));
  assert.ok(m.html.includes('https://x.br/c') && m.html.includes('https://x.br/r'));
  const a = redemptionAutoConfirmed({ site: 'https://x.br', businessName: 'L', customerName: 'Ana Lima', couponTitle: 'Café', amount: 5, refuseUrl: 'https://x.br/r', contestUntil: '2026-11-20T00:00:00Z' });
  assert.ok(a.subject.includes('automaticamente'));
  const page = decisionPage({ site: 'https://x.br', action: 'refuse', action_url: 'https://x.br/p', couponTitle: 'Café', customerName: 'Ana Lima', amount: 5, businessName: 'L' });
  assert.ok(page.includes('<form method="POST"'));
  assert.ok(!page.includes('Lima'));
});
