import test from 'node:test';
import assert from 'node:assert/strict';
import { needNowCounts } from '../services/needNow';

const biz = (o: any) => ({ id: o.name, status: 'approved', isBlocked: false, ...o });
test('conta só atalhos com lugares e usa a mesma busca do clique', () => {
  const list: any[] = [
    biz({ name: 'Drogaria Central', category: 'Serviços', subcategory: 'Farmácias', description: '' }),
    biz({ name: 'Princesa', category: 'Serviços', subcategory: 'Supermercados', description: '' }),
    biz({ name: 'Bloqueada', category: 'Serviços', subcategory: 'Farmácias', isBlocked: true }),
  ];
  const r = needNowCounts(list);
  assert.deepEqual(r.map(x => [x.id, x.count]), [['farmacia', 1], ['mercado', 1]]);
});
test('sem lugares, nenhum atalho (a seção some)', () => { assert.equal(needNowCounts([]).length, 0); });
