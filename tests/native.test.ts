import { test } from 'node:test';
import assert from 'node:assert/strict';
import { toAppPath } from '../services/native';

test('link https do domínio vira caminho interno', () => {
  assert.equal(toAppPath('https://conecta-lagos-one.vercel.app/guia/praia-do-forno?x=1'), '/guia/praia-do-forno?x=1');
  assert.equal(toAppPath('https://lagosgo.org/'), '/');
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
