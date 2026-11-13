import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sendMail, sendMailBatch, isEmail, adminRecipients, mailFrom } from '../server/mail';
import * as T from '../server/mailTemplates';
import { makeToken, readToken, subscriberId } from '../server/newsletter';

const env = { RESEND_API_KEY: 're_test', MAIL_SECRET: 'segredo', SITE_URL: 'https://lagosgo.com.br' } as any;

test('sem RESEND_API_KEY nada é enviado e não dá erro', async () => {
  const r = await sendMail({ to: 'a@b.com', subject: 's', html: 'h', text: 't' }, {} as any, (() => { throw new Error('não deveria chamar'); }) as any);
  assert.equal(r.ok, false);
  assert.equal(r.skipped, true);
});

test('envio chama o Resend com remetente, resposta e destinatário válidos', async () => {
  let body: any, url = '';
  const f = (async (u: string, init: any) => { url = u; body = JSON.parse(init.body); return { ok: true, json: async () => ({ id: 'abc' }) }; }) as any;
  const r = await sendMail({ to: ['x@y.com', 'invalido'], subject: 'Oi', html: '<p>oi</p>', text: 'oi', tags: [{ name: 'type', value: 'a b' }] }, env, f);
  assert.equal(r.ok, true);
  assert.equal(url, 'https://api.resend.com/emails');
  assert.deepEqual(body.to, ['x@y.com']);
  assert.match(body.from, /comercial@lagosgo\.com\.br/);
});

test('falha do Resend vira ok:false sem lançar', async () => {
  const f = (async () => ({ ok: false, status: 422, json: async () => ({ message: 'domínio não verificado' }) })) as any;
  const r = await sendMail({ to: 'x@y.com', subject: 's', html: 'h', text: 't' }, env, f);
  assert.equal(r.ok, false);
  assert.match(r.error!, /domínio/);
});

test('lote divide em grupos de 100', async () => {
  let calls = 0;
  const f = (async () => { calls++; return { ok: true, json: async () => ({}) }; }) as any;
  const list = Array.from({ length: 250 }, (_, i) => ({ to: `u${i}@x.com`, subject: 's', html: 'h', text: 't' }));
  const r = await sendMailBatch(list, env, f);
  assert.equal(calls, 3);
  assert.equal(r.sent, 250);
});

test('validação de e-mail e destinatários da equipe', () => {
  assert.equal(isEmail('ok@lagosgo.com.br'), true);
  assert.equal(isEmail('a b@x.com'), false);
  assert.equal(isEmail('x@y'), false);
  assert.deepEqual(adminRecipients({ MAIL_ADMIN_TO: 'a@x.com, lixo ,b@y.com' } as any), ['a@x.com', 'b@y.com']);
  assert.match(mailFrom({} as any), /Lagos GO/);
});

test('token de confirmação: válido, adulterado, vencido e propósito trocado', () => {
  const t = makeToken('Ana@Mail.com', 'confirm', env, 1000);
  assert.equal(readToken(t, 'confirm', env, 2000), 'ana@mail.com');
  assert.equal(readToken(t.slice(0, -2) + 'xx', 'confirm', env, 2000), null);
  assert.equal(readToken(t, 'unsub', env, 2000), null);
  assert.equal(readToken(t, 'confirm', env, 1000 + 8 * 24 * 3600 * 1000), null);
  assert.equal(readToken(t, 'confirm', { ...env, MAIL_SECRET: 'outro' }, 2000), null);
});

test('token de descadastro não vence e id do inscrito é estável', () => {
  const t = makeToken('a@b.com', 'unsub', env, 1);
  assert.equal(readToken(t, 'unsub', env, 9e15), 'a@b.com');
  assert.equal(subscriberId('A@B.com '), subscriberId('a@b.com'));
});

test('modelos escapam HTML e só aceitam links http(s)', () => {
  const r = T.planActivated({ site: 'https://lagosgo.com.br', name: '<b>Eva</b>', businessName: '<script>x</script>', planName: 'Pro', endsAt: '2027-01-10' });
  assert.ok(!r.html.includes('<script>'));
  assert.ok(r.html.includes('&lt;script&gt;'));
  const v = T.verifyEmail({ site: 'https://lagosgo.com.br', link: 'javascript:alert(1)' });
  assert.ok(!v.html.includes('javascript:'));
});

test('newsletter traz descadastro, texto simples e só mostra seções com conteúdo', () => {
  const d = { events: [{ title: 'Festival', subtitle: 'sáb', url: 'https://lagosgo.com.br/eventos/1' }], coupons: [], posts: [] };
  const r = T.newsletterWeekly({ site: 'https://lagosgo.com.br', data: d, unsubscribeUrl: 'https://lagosgo.com.br/u' });
  assert.ok(r.html.includes('Cancelar inscrição'));
  assert.ok(r.html.includes('Neste fim de semana'));
  assert.ok(!r.html.includes('Cupons para usar'));
  assert.ok(r.text.includes('https://lagosgo.com.br/u'));
  assert.equal(T.newsletterHasContent({ events: [], coupons: [], posts: [] }), false);
});
