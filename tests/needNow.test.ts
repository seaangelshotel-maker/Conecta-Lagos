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

import { PUBLIC_SERVICES } from '../data/publicServices';
test('serviços públicos: dados válidos e casam com os atalhos Saúde e Polícia e Bombeiros', () => {
  const names = new Set<string>();
  for (const s of PUBLIC_SERVICES) {
    assert.ok(s.address.trim(), `${s.name}: endereço`);
    assert.ok(s.sources.length > 0 && s.sources.every(u => { try { return !!new URL(u); } catch { return false; } }), `${s.name}: fontes`);
    assert.ok(!s.phone || /^\(\d{2}\) \d{4}-\d{4}$/.test(s.phone), `${s.name}: telefone fixo no formato`);
    assert.ok(!names.has(s.name), `${s.name}: duplicado`); names.add(s.name);
    const b: any = { ...s, id: s.name, status: 'approved' };
    const target = s.category === 'Saúde' ? 'saude' : 'seguranca';
    assert.equal(needMatch(b, item(target)), true, `${s.name} deve casar com ${target}`);
    assert.equal(needMatch(b, item(target === 'saude' ? 'seguranca' : 'saude')), false, `${s.name} não deve casar com o outro`);
  }
});
