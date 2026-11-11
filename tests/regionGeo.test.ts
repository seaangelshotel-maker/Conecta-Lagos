import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  locateMunicipality, nearbyAdaptive, orderFeedByGeo, articleMunicipalityIds, feedTierFor,
  REGION_MUNICIPALITIES, haversineKm,
} from '../services/regionGeo';

const byId = (id: string) => REGION_MUNICIPALITIES.find(m => m.id === id)!;

test('localiza o município mais próximo', () => {
  const r = locateMunicipality({ lat: -22.9840, lng: -42.0224 }); // Praia Grande, Arraial
  assert.equal(r.municipality?.id, 'arraial-do-cabo');
  assert.equal(r.inRegion, true);
});

test('Cabo Frio e Búzios são identificados corretamente', () => {
  assert.equal(locateMunicipality({ lat: -22.8794, lng: -42.0188 }).municipality?.id, 'cabo-frio');
  assert.equal(locateMunicipality({ lat: -22.7469, lng: -41.8817 }).municipality?.id, 'buzios');
});

test('fora da região não recebe município', () => {
  const rio = { lat: -22.9068, lng: -43.1729 }; // centro do Rio
  const r = locateMunicipality(rio);
  assert.equal(r.inRegion, false);
  assert.equal(r.municipality, null);
});

test('raio adaptativo: região densa usa raio pequeno', () => {
  const where = byId('arraial-do-cabo');
  const items = Array.from({ length: 30 }, (_, i) => ({ id: String(i), lat: where.lat + i * 0.0005, lng: where.lng }));
  const r = nearbyAdaptive(items, where, { minResults: 12 });
  assert.equal(r.radiusKm, 1);
  assert.equal(r.exhausted, false);
  assert.ok(r.items.length >= 12);
});

test('raio adaptativo: região esparsa amplia o raio', () => {
  const where = byId('saquarema');
  const items = [
    { id: 'a', lat: where.lat + 0.02, lng: where.lng },
    { id: 'b', lat: byId('araruama').lat, lng: byId('araruama').lng },
    { id: 'c', lat: byId('cabo-frio').lat, lng: byId('cabo-frio').lng },
  ];
  const r = nearbyAdaptive(items, where, { minResults: 3 });
  assert.ok(r.radiusKm > 3);
  assert.equal(r.items.length, 3);
  assert.equal(r.items[0].id, 'a'); // mais próximo primeiro
});

test('itens sem coordenadas são ignorados', () => {
  const r = nearbyAdaptive([{ id: 'x' }, { id: 'y', lat: -22.9, lng: -42.0 }], byId('arraial-do-cabo'), { minResults: 1 });
  assert.equal(r.items.length, 1);
  assert.equal(r.items[0].id, 'y');
});

test('matéria identifica município por título, tags e início do texto', () => {
  const ids = articleMunicipalityIds({ title: 'Festival em Cabo Frio', tags: [], content: '' });
  assert.deepEqual(ids, ['cabo-frio']);
  const ids2 = articleMunicipalityIds({ title: 'Trânsito', tags: ['Búzios'] });
  assert.deepEqual(ids2, ['buzios']);
});

test('nível do feed: município da pessoa, vizinho e região', () => {
  assert.equal(feedTierFor(['arraial-do-cabo'], 'arraial-do-cabo'), 1);
  assert.equal(feedTierFor(['cabo-frio'], 'arraial-do-cabo'), 2);
  assert.equal(feedTierFor(['saquarema'], 'arraial-do-cabo'), 3);
  assert.equal(feedTierFor([], null), 3);
});

test('feed ordena por nível sem esconder matérias de outras cidades', () => {
  const now = Date.parse('2026-11-11T00:00:00Z');
  const arts = [
    { title: 'Saquarema hoje', publishedAt: '2026-11-11T00:00:00Z' },
    { title: 'Cabo Frio ontem', publishedAt: '2026-11-10T00:00:00Z' },
    { title: 'Arraial antiga', publishedAt: '2026-10-01T00:00:00Z' },
  ];
  const out = orderFeedByGeo(arts, 'arraial-do-cabo', now);
  assert.equal(out.length, 3); // nada escondido
  assert.equal(out[0].title, 'Arraial antiga'); // nível 1 vem primeiro, mesmo sendo mais antiga
  assert.equal(out[1].title, 'Cabo Frio ontem'); // nível 2
  assert.equal(out[2].title, 'Saquarema hoje'); // nível 3
});

test('haversine: centros de Arraial e Cabo Frio ficam entre 8 e 12 km', () => {
  const d = haversineKm(byId('arraial-do-cabo'), byId('cabo-frio'));
  assert.ok(d > 8 && d < 12, `dist=${d}`);
});

test('feed usa o campo date das matérias para desempatar dentro do mesmo nível', () => {
  const now = Date.parse('2026-11-11T00:00:00Z');
  const out = orderFeedByGeo([
    { title: 'Búzios antiga', date: '2026-08-01' },
    { title: 'Búzios recente', date: '2026-11-10' },
  ], 'buzios', now);
  assert.equal(out[0].title, 'Búzios recente');
  assert.equal(out[0].tier, 1);
});

test('usuário se desloca: o nível da mesma matéria muda com a cidade', () => {
  const a = { title: 'Festa em Cabo Frio' };
  assert.equal(orderFeedByGeo([a], 'cabo-frio')[0].tier, 1);
  assert.equal(orderFeedByGeo([a], 'arraial-do-cabo')[0].tier, 2);
  assert.equal(orderFeedByGeo([a], 'saquarema')[0].tier, 3);
  assert.equal(orderFeedByGeo([a], null)[0].tier, 3); // sem localização: sem prioridade
});

test('deslocamento: só atualiza quando andou o suficiente', async () => {
  const { movedEnough } = await import('../services/regionGeo');
  const a = { lat: -22.9662, lng: -42.0278 };
  assert.equal(movedEnough(a, { lat: -22.9663, lng: -42.0279 }), false); // ruído do GPS
  assert.equal(movedEnough(a, byId('cabo-frio')), true); // ~10 km
  assert.equal(movedEnough(null, a), true);
});

test('deslocamento de Arraial para Cabo Frio muda o município', async () => {
  const { changedMunicipality } = await import('../services/regionGeo');
  assert.equal(changedMunicipality(byId('arraial-do-cabo'), byId('cabo-frio')), true);
  assert.equal(changedMunicipality(byId('cabo-frio'), { lat: -22.8800, lng: -42.0200 }), false);
  assert.equal(changedMunicipality(null, byId('buzios')), false);
});
