import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const svc = readFileSync('services/dataService.ts', 'utf8');
const mod = readFileSync('services/contentI18n.ts', 'utf8');

test('salvar empresa, cupom e matéria traduz ao salvar', () => {
    assert.match(svc, /saveBusiness = async \(b: BusinessProfile\) => \{\s*try \{\s*b = await withI18n\(b, businessTexts\)/);
    assert.match(svc, /await withI18n\(\{ \.\.\.c \}, couponTexts\)/);
    assert.match(svc, /post = await withI18n\(post, postTexts\)/);
});

test('o que vem do banco ensina o tradutor da tela', () => {
    assert.match(svc, /learnAll\(_businesses\)/);
    assert.match(svc, /learnAll\(_coupons\)/);
    assert.match(svc, /learnAll\(_posts\)/);
});

test('falha de tradução nunca trava o salvamento', () => {
    assert.match(svc, /catch \{ \/\* segue sem traduzir \*\/ \}/);
    assert.match(mod, /Nunca lança erro/);
});
