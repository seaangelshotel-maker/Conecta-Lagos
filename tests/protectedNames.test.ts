import test from 'node:test';
import assert from 'node:assert/strict';
import { registerNames, clearNames, isProtectedName, maskNames } from '../services/protectedNames';

test('nome da empresa sozinho é protegido (sem diferenciar caixa/espaços)', () => {
    clearNames(); registerNames(['Pousada Sol e Mar', 'Barraca do Pescador']);
    assert.ok(isProtectedName('Pousada Sol e Mar'));
    assert.ok(isProtectedName('  pousada  sol e mar '));
    assert.ok(!isProtectedName('Pousada'));
});

test('nome dentro de frase é mascarado e volta intacto na tradução', () => {
    clearNames(); registerNames(['Barraca do Pescador']);
    const m = maskNames('Almoce na Barraca do Pescador hoje')!;
    assert.ok(!m.masked.includes('Pescador'));
    assert.equal(m.restore(m.masked.replace('Almoce na', 'Have lunch at').replace('hoje', 'today')), 'Have lunch at Barraca do Pescador today');
});

test('se o tradutor comer o marcador, devolve null (mantém o original)', () => {
    clearNames(); registerNames(['Bar do Zé']);
    const m = maskNames('Venha ao Bar do Zé')!;
    assert.equal(m.restore('Come here'), null);
});

test('não mascara pedaço de palavra e ignora nomes curtos', () => {
    clearNames(); registerNames(['Sol', 'Mar Azul']);
    assert.equal(maskNames('A solução está no mar'), null);
    assert.ok(isProtectedName('Sol'));                 // sozinho é nome
    assert.equal(maskNames('O sol nasce cedo'), null); // em frase, nome curto não é mascarado
    assert.ok(maskNames('Hotel Mar Azul fica na praia'));
});

test('nome maior vence nome menor contido nele', () => {
    clearNames(); registerNames(['Mar Azul', 'Pousada Mar Azul']);
    const m = maskNames('Pousada Mar Azul')!;
    assert.equal(m.masked, 'Zq0x');
});
