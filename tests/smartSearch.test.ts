import test from 'node:test';
import assert from 'node:assert/strict';
import { smartSearch, parseQuery, editDistance, normText } from '../services/smartSearch';
import type { BusinessProfile } from '../types';

const mk = (o: Partial<BusinessProfile>): BusinessProfile => ({ id: o.name || 'x', name: 'X', description: '', category: 'Restaurantes', subcategory: '', amenities: [], ...o } as BusinessProfile);
const L = [
  mk({ name: 'Pizzaria Bella Massa', subcategory: 'Pizzaria', cityId: 'cabo-frio', amenities: ['wifi', 'parking'], coverImage: 'a.jpg' }),
  mk({ name: 'Peixe na Brasa', subcategory: 'Frutos do mar', cityId: 'arraial-do-cabo', description: 'Peixe fresco do dia.' }),
  mk({ name: 'Pousada Brisa do Mar', category: 'Hospedagens', subcategory: 'Pousada', cityId: 'buzios', amenities: ['wifi', 'pet'] }),
  mk({ name: 'Açaí da Praia', subcategory: 'Lanchonete', cityId: 'cabo-frio' }),
  mk({ name: 'Escuna Pirata', category: 'Passeios de barco', subcategory: 'Passeio de barco', cityId: 'arraial-do-cabo', experienceTags: ['familias', 'criancas'] }),
];
const names = (q: string) => smartSearch(L, q).map(b => b.name);

test('acento e maiúscula não importam', () => { assert.deepEqual(names('ACAI'), ['Açaí da Praia']); assert.deepEqual(names('açai'), ['Açaí da Praia']); });
test('erro de digitação leve', () => { assert.ok(names('pizzarai').includes('Pizzaria Bella Massa')); assert.ok(names('pousda').includes('Pousada Brisa do Mar')); });
test('palavra curta não perdoa erro', () => { assert.deepEqual(names('abc'), []); });
test('sinônimos do dia a dia', () => {
  assert.ok(names('onde comer').includes('Peixe na Brasa'));
  assert.deepEqual(names('dormir'), ['Pousada Brisa do Mar']);
  assert.deepEqual(names('lancha'), ['Escuna Pirata']);
});
test('cidade na frase filtra', () => {
  assert.deepEqual(names('pizza em cabo frio'), ['Pizzaria Bella Massa']);
  assert.deepEqual(names('passeio arraial'), ['Escuna Pirata']);
  assert.ok(names('buzios').includes('Pousada Brisa do Mar'));
});
test('comodidade na frase', () => {
  assert.deepEqual(names('pousada com wifi'), ['Pousada Brisa do Mar']);
  assert.deepEqual(names('hospedagem pet'), ['Pousada Brisa do Mar']);
});
test('intenção vira etiqueta', () => { assert.deepEqual(names('passeio para criança'), ['Escuna Pirata']); });
test('nome vale mais que descrição', () => {
  const l = [mk({ name: 'Outro', description: 'tem pizza' }), mk({ name: 'Pizza Boa' })];
  assert.equal(smartSearch(l, 'pizza')[0].name, 'Pizza Boa');
});
test('empate: quem tem foto primeiro', () => {
  const l = [mk({ name: 'Sem Foto Pizza' }), mk({ name: 'Com Foto Pizza', coverImage: 'x' })];
  assert.equal(smartSearch(l, 'pizza')[0].name, 'Com Foto Pizza');
});
test('busca vazia ou só palavras de ligação não filtra', () => { assert.equal(smartSearch(L, '').length, L.length); assert.equal(smartSearch(L, 'de em').length, L.length); });
test('utilitários', () => { assert.equal(editDistance('pousda', 'pousada'), 1); assert.equal(editDistance('abc', 'xyz', 1), 2); assert.equal(normText('Búzios!'), 'buzios'); assert.deepEqual(parseQuery('pizza em cabo frio').cityIds, ['cabo-frio']); });
