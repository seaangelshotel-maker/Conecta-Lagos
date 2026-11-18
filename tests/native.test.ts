import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toAppPath } from '../services/native';

test('link https do domínio vira caminho interno', () => {
  assert.equal(toAppPath('https://conecta-lagos-one.vercel.app/guia/praia-do-forno?x=1'), '/guia/praia-do-forno?x=1');
  assert.equal(toAppPath('https://lagosgo.com.br/'), '/');
});
test('esquema próprio lagosgo:// vira caminho', () => {
  assert.equal(toAppPath('lagosgo://guia/praia-do-forno'), '/guia/praia-do-forno');
  assert.equal(toAppPath('lagosgo://descubra?cat=praias'), '/descubra?cat=praias');
});
test('links de outros sites e esquemas perigosos são recusados', () => {
  assert.equal(toAppPath('https://evil.example.com/guia/x'), null);
  assert.equal(toAppPath('javascript:alert(1)'), null);
  assert.equal(toAppPath('intent://foo'), null);
  assert.equal(toAppPath('lixo'), null);
});
test('host atual é aceito', () => {
  assert.equal(toAppPath('https://staging.lagosgo.dev/blog', 'staging.lagosgo.dev'), '/blog');
});

import { classifyLink, clickLinkAction } from '../services/native';

test('classifica links: do app, do sistema, externos e bloqueados', () => {
  assert.equal(classifyLink('https://lagosgo.com.br/descubra?cat=praias'), 'internal');
  assert.equal(classifyLink('lagosgo://guia/praia-do-forno'), 'internal');
  assert.equal(classifyLink('tel:+5522999999999'), 'system');
  assert.equal(classifyLink('mailto:oi@lagosgo.com.br'), 'system');
  assert.equal(classifyLink('https://wa.me/5522999999999?text=oi'), 'system');
  assert.equal(classifyLink('https://www.google.com/maps/search/?api=1&query=Praia'), 'system');
  assert.equal(classifyLink('https://instagram.com/lagosgo'), 'system');
  assert.equal(classifyLink('https://play.google.com/store/apps/details?id=org.lagosgo.app'), 'system');
  assert.equal(classifyLink('https://www.google.com/search?q=x'), 'external');
  assert.equal(classifyLink('https://restaurante.com.br/cardapio'), 'external');
  assert.equal(classifyLink('javascript:alert(1)'), 'blocked');
  assert.equal(classifyLink('intent://x#Intent;end'), 'blocked');
  assert.equal(classifyLink(''), 'blocked');
});
test('clique em link: no app só o que sai do Lagos GO (ou abre aba nova) passa pela regra', () => {
  assert.equal(clickLinkAction('/descubra', null, 'lagosgo.com.br', true), 'ignore');
  assert.equal(clickLinkAction('https://lagosgo.com.br/blog', null, 'lagosgo.com.br', true), 'ignore');
  assert.equal(clickLinkAction('https://lagosgo.com.br/blog', '_blank', 'lagosgo.com.br', true), 'open');
  assert.equal(clickLinkAction('https://exemplo.com', null, 'lagosgo.com.br', true), 'open');
  assert.equal(clickLinkAction('https://exemplo.com', null, 'lagosgo.com.br', false), 'ignore'); // web: navegador cuida
  assert.equal(clickLinkAction('https://exemplo.com', '_blank', 'lagosgo.com.br', false), 'open');
  assert.equal(clickLinkAction('#topo', null, 'lagosgo.com.br', true), 'ignore');
});
