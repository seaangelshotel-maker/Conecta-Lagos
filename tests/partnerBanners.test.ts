import test from 'node:test';
import assert from 'node:assert/strict';
import { sanitizePartnerBanners, visiblePartnerBanners, PARTNER_DISCLOSURE, PartnerBanner } from '../services/partnerBanners';

const b = (o: Partial<PartnerBanner>): PartnerBanner => ({ id: '1', name: 'Mercado Livre', url: 'https://exemplo.com/a', active: true, ...o });

test('parceiros: só https e com nome; ativos aparecem, inativos não', () => {
  const list = [b({}), b({ id: '2', url: 'http://inseguro.com' }), b({ id: '3', url: 'javascript:alert(1)' }), b({ id: '4', name: '  ' }), b({ id: '5', active: false }), b({ id: '6', imageUrl: 'http://img.com/x.png' })];
  assert.deepEqual(sanitizePartnerBanners(list).map(x => x.id), ['1', '5']);
  assert.deepEqual(visiblePartnerBanners(list).map(x => x.id), ['1']);
});
test('parceiros: lista vazia ou ausente não quebra e o aviso de comissão existe', () => {
  assert.deepEqual(visiblePartnerBanners(undefined), []);
  assert.match(PARTNER_DISCLOSURE, /comissão/);
});
