import test from 'node:test';
import assert from 'node:assert/strict';
import { needNowCounts, needMatch, NEED_NOW_ITEMS } from '../services/needNow';

const biz = (o: any) => ({ id: o.name, status: 'approved', isBlocked: false, ...o });
const item = (id: string) => NEED_NOW_ITEMS.find(i => i.id === id)!;

test('conta só atalhos com lugares aprovados', () => {
  const list: any[] = [
    biz({ name: 'Drogaria Central', category: 'Serviços', subcategory: 'Farmácias', description: '' }),
    biz({ name: 'Princesa', category: 'Serviços', subcategory: 'Supermercados', description: '' }),
    biz({ name: 'Bloqueada', category: 'Serviços', subcategory: 'Farmácias', isBlocked: true }),
  ];
  assert.deepEqual(needNowCounts(list).map(x => [x.id, x.count]), [['farmacia', 1], ['mercado', 1]]);
});

test('Saúde NÃO pega passeio que só cita hospital na descrição ou no endereço', () => {
  const timoneiro = biz({ name: 'Timoneiro Passeios', category: 'Passeios', subcategory: 'Barco', description: 'Saída perto do hospital, com guia e seguro saúde incluso.', address: 'Rua do Hospital, 10' });
  assert.equal(needMatch(timoneiro, item('saude')), false);
  assert.equal(needMatch(biz({ name: 'Hospital Municipal', category: 'Saúde', subcategory: 'Hospitais' }), item('saude')), true);
  assert.equal(needMatch(biz({ name: 'UPA Arraial', category: 'Serviços', subcategory: '' }), item('saude')), true);
});

test('posto não casa com posto de salva-vidas', () => {
  assert.equal(needMatch(biz({ name: 'Posto 3 salva-vidas', category: 'Serviços', subcategory: '' }), item('posto')), false);
  assert.equal(needMatch(biz({ name: 'Auto Posto Lagos', category: 'Serviços', subcategory: '' }), item('posto')), true);
});

test('sem lugares, nenhum atalho', () => { assert.equal(needNowCounts([]).length, 0); });
