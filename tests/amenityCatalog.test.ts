import test from 'node:test';
import assert from 'node:assert/strict';
import { AMENITY_CATALOG, AMENITY_BY_ID, businessKind, amenitiesForKind, amenityAppliesTo, groupAmenities } from '../data/amenityCatalog';
import { visibleAmenities, hasAmenity } from '../services/discoverLogic';
import { DEFAULT_AMENITIES, AMENITIES_LABELS } from '../types';

const biz = (o: any) => ({ id: 'x', name: 'N', category: 'Gastronomia', status: 'approved', amenities: [], ...o });

test('ids antigos continuam existindo (nada já cadastrado se perde)', () => {
  for (const id of ['wifi', 'ac', 'parking', 'access', 'kids', 'pet', 'pool', 'breakfast', 'tv', 'bar', 'card', 'delivery']) {
    assert.ok(AMENITY_BY_ID[id], id);
    assert.ok(AMENITIES_LABELS[id]);
  }
});
test('catálogo sem id repetido e com rótulo', () => {
  const ids = AMENITY_CATALOG.map(a => a.id);
  assert.equal(new Set(ids).size, ids.length);
  assert.ok(AMENITY_CATALOG.every(a => a.label.trim()));
  assert.equal(DEFAULT_AMENITIES.length, AMENITY_CATALOG.length);
});
test('tipo do negócio vem da categoria e da subcategoria', () => {
  assert.equal(businessKind({ category: 'Gastronomia', subcategory: 'Restaurantes' }), 'restaurante');
  assert.equal(businessKind({ category: 'Gastronomia', subcategory: 'Bares e Quiosques' }), 'bar');
  assert.equal(businessKind({ category: 'Gastronomia', subcategory: 'Baladas e Casas Noturnas' }), 'bar');
  assert.equal(businessKind({ category: 'Hospedagem', subcategory: 'Pousadas' }), 'hotel');
  assert.equal(businessKind({ category: 'Passeios', subcategory: 'Praias' }), 'atracao');
  assert.equal(businessKind({ category: 'Serviços' }), 'servico');
  assert.equal(businessKind({ category: 'Coisa nova' }), undefined);
});
test('hotel não recebe entrega; restaurante não recebe piscina de hotel nem recepção 24h', () => {
  const hotel = amenitiesForKind('hotel').map(a => a.id);
  assert.ok(!hotel.includes('delivery') && !hotel.includes('free_delivery') && !hotel.includes('takeaway'));
  assert.ok(hotel.includes('pool') && hotel.includes('breakfast') && hotel.includes('reception_24h'));
  const rest = amenitiesForKind('restaurante').map(a => a.id);
  assert.ok(rest.includes('delivery') && rest.includes('free_delivery') && rest.includes('vegetarian'));
  assert.ok(!rest.includes('reception_24h') && !rest.includes('airport_transfer'));
});
test('comodidade sem tipo (criada pelo admin) vale para todos; tipo desconhecido mostra tudo', () => {
  assert.ok(amenityAppliesTo({ }, 'hotel'));
  assert.ok(amenityAppliesTo({ kinds: ['hotel'] }, undefined));
  assert.equal(amenitiesForKind(undefined).length, AMENITY_CATALOG.length);
});
test('agrupa por seção, na ordem do catálogo', () => {
  const g = groupAmenities(amenitiesForKind('hotel'));
  assert.ok(g.length > 1 && g.every(s => s.items.length > 0));
});
test('filtro do usuário: hotel não vê "Faz entrega"; mostra só o que tem empresa', () => {
  const all: any[] = [
    biz({ id: 'r', category: 'Gastronomia', subcategory: 'Restaurantes', amenities: ['delivery', 'wifi'] }),
    biz({ id: 'h1', category: 'Hospedagem', subcategory: 'Pousadas', amenities: ['pool', 'delivery', 'breakfast'] }),
    biz({ id: 'h2', category: 'Hospedagem', subcategory: 'Hotéis', amenities: ['pool'] }),
  ];
  const hotelScope = all.filter(b => b.category === 'Hospedagem');
  const ids = visibleAmenities(DEFAULT_AMENITIES, hotelScope, 'hospedagens').map(x => x.def.id);
  assert.deepEqual(ids, ['pool', 'breakfast']);        // delivery existe no dado, mas não se aplica a hotel
  assert.ok(!ids.includes('wifi'));                       // ninguém do recorte tem: filtro sem resultado não aparece
  const rest = visibleAmenities(DEFAULT_AMENITIES, all.filter(b => b.id === 'r'), 'restaurantes').map(x => x.def.id).sort();
  assert.deepEqual(rest, ['delivery', 'wifi']);
  const none = visibleAmenities(DEFAULT_AMENITIES, all, undefined).map(x => x.def.id);
  assert.ok(none.includes('delivery') && none.includes('pool'));  // sem categoria: tudo que existe
});
test('comodidade marcada continua visível para poder desmarcar', () => {
  const scope: any[] = [biz({ category: 'Hospedagem', amenities: ['pool'] })];
  const ids = visibleAmenities(DEFAULT_AMENITIES, scope, 'hospedagens', ['delivery']).map(x => x.def.id);
  assert.ok(ids.includes('delivery'));
});
test('empresa que salvou o rótulo em vez do id continua achada', () => {
  assert.ok(hasAmenity(biz({ amenities: ['Piscina'] }) as any, 'pool'));
});
