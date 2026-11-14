import test from 'node:test';
import assert from 'node:assert/strict';
import { filterBusinesses, EMPTY_BIZ_FILTER, filterCoupons, EMPTY_COUPON_FILTER, filterUsers, filterPosts, EMPTY_POST_FILTER, norm } from '../services/adminFilters';

const biz = (o: any) => ({ id: 'b1', name: 'Bar do Zé', category: 'Gastronomia', plan: 'free', ...o });
const list: any[] = [
  biz({ id: 'a', name: 'Café Açaí', plan: 'pro', cityId: 'c1', isClaimed: true }),
  biz({ id: 'b', name: 'Praia do Farol', category: 'Passeios', cityId: 'c2' }),
  biz({ id: 'srv_x', name: 'UPA Cabo Frio', category: 'Saúde', cityId: 'c2', isBlocked: false }),
  biz({ id: 'd', name: 'Loja Fechada', plan: 'premium', isBlocked: true }),
  biz({ id: 'e', name: 'Nova', status: 'PENDING' }),
];

test('busca ignora acento e caixa', () => {
  assert.equal(norm('Açaí'), 'acai');
  assert.deepEqual(filterBusinesses(list, { ...EMPTY_BIZ_FILTER, q: 'acai' }).map(b => b.id), ['a']);
});
test('filtros combinam: categoria + cidade', () => {
  assert.deepEqual(filterBusinesses(list, { ...EMPTY_BIZ_FILTER, category: 'Passeios', cityId: 'c2' }).map(b => b.id), ['b']);
});
test('pagantes x gratuitas', () => {
  assert.deepEqual(filterBusinesses(list, { ...EMPTY_BIZ_FILTER, kind: 'paid' }).map(b => b.id), ['a', 'd']);
  assert.deepEqual(filterBusinesses(list, { ...EMPTY_BIZ_FILTER, kind: 'free' }).map(b => b.id), ['b', 'srv_x', 'e']);
  assert.deepEqual(filterBusinesses(list, { ...EMPTY_BIZ_FILTER, plan: 'free' }).map(b => b.id), ['b', 'srv_x', 'e']);
});
test('serviços públicos, sem dono e reivindicadas', () => {
  assert.deepEqual(filterBusinesses(list, { ...EMPTY_BIZ_FILTER, kind: 'public' }).map(b => b.id), ['srv_x']);
  assert.deepEqual(filterBusinesses(list, { ...EMPTY_BIZ_FILTER, kind: 'unclaimed' }).map(b => b.id), ['b', 'd', 'e']);
  assert.deepEqual(filterBusinesses(list, { ...EMPTY_BIZ_FILTER, kind: 'claimed' }).map(b => b.id), ['a']);
});
test('status ativa/inativa/pendente', () => {
  assert.deepEqual(filterBusinesses(list, { ...EMPTY_BIZ_FILTER, status: 'blocked' }).map(b => b.id), ['d']);
  assert.deepEqual(filterBusinesses(list, { ...EMPTY_BIZ_FILTER, status: 'pending' }).map(b => b.id), ['e']);
  assert.deepEqual(filterBusinesses(list, { ...EMPTY_BIZ_FILTER, status: 'active' }).map(b => b.id), ['a', 'b', 'srv_x']);
});
test('cupons por status', () => {
  const now = Date.parse('2026-11-14');
  const cs: any[] = [
    { id: '1', title: 'A', companyName: 'X', category: 'Gastronomia', expiryDate: '2026-12-01', status: 'approved' },
    { id: '2', title: 'B', companyName: 'Y', category: 'Passeios', expiryDate: '2026-10-01', status: 'approved' },
    { id: '3', title: 'C', companyName: 'Z', category: 'Passeios', expiryDate: '2026-12-01', status: 'pending' },
  ];
  assert.deepEqual(filterCoupons(cs, { ...EMPTY_COUPON_FILTER, status: 'active' }, now).map(c => c.id), ['1']);
  assert.deepEqual(filterCoupons(cs, { ...EMPTY_COUPON_FILTER, status: 'expired' }, now).map(c => c.id), ['2']);
  assert.deepEqual(filterCoupons(cs, { ...EMPTY_COUPON_FILTER, status: 'pending' }, now).map(c => c.id), ['3']);
  assert.deepEqual(filterCoupons(cs, { ...EMPTY_COUPON_FILTER, category: 'Passeios' }, now).map(c => c.id), ['2', '3']);
});
test('usuários e matérias', () => {
  const us: any[] = [{ id: '1', name: 'Ana', email: 'a@x.com', role: 'COMPANY' }, { id: '2', name: 'Beto', email: 'b@x.com', role: 'JOURNALIST' }];
  assert.deepEqual(filterUsers(us, { q: '', role: 'COMPANY' }).map(u => u.id), ['1']);
  assert.deepEqual(filterUsers(us, { q: 'beto', role: '' }).map(u => u.id), ['2']);
  const ps: any[] = [{ id: 'p1', title: 'Praias', category: 'Dicas', author: 'Z', status: 'draft' }, { id: 'p2', title: 'Bares', category: 'Gastro', author: 'Z', status: 'published' }, { id: 'p3', title: 'Old', category: 'Gastro', author: 'Z' }];
  assert.deepEqual(filterPosts(ps, { ...EMPTY_POST_FILTER, status: 'draft' }).map(p => p.id), ['p1']);
  assert.deepEqual(filterPosts(ps, { ...EMPTY_POST_FILTER, status: 'published' }).map(p => p.id), ['p2', 'p3']);
});
