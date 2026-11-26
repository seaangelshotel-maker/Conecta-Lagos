import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateStudioArticle, validateStudioEvent } from '../server/studioImport';

const SRC = ['https://cabofrio.rj.gov.br/x — data — 26/11/2026 (oficial)', 'https://rc24h.com.br/y — data — 26/11/2026', 'https://folhadoslagos.com/z — horário — 26/11/2026'];
const art = (o: any = {}) => ({ id: 'guia_natal-de-luz', title: 'Natal de Luz', content: '## Programação\n\nTexto.', sources: SRC, ...o });
const evt = (o: any = {}) => ({ id: 'studio_natal-de-luz-2026-12-20', title: 'Natal de Luz', category: 'festa', startDate: '2026-12-20', startTime: '19:00', cityId: 'cabo-frio', locationName: 'Praça Porto Rocha', sources: SRC, ...o });
const TODAY = '2026-11-26';

test('matéria: válida passa', () => assert.equal(validateStudioArticle(art()), null));
test('matéria: menos de 3 fontes é recusada', () => assert.match(validateStudioArticle(art({ sources: SRC.slice(0, 2) }))!, /3 fontes/));
test('matéria: [CONFIRMAR] é recusada', () => assert.match(validateStudioArticle(art({ content: 'Horário [CONFIRMAR]' }))!, /CONFIRMAR/));
test('matéria: id fora do padrão é recusado', () => assert.match(validateStudioArticle(art({ id: 'x' }))!, /id/));
test('matéria: capa precisa ser https', () => assert.match(validateStudioArticle(art({ imageUrl: 'data:image/png;base64,xx' }))!, /https/));

test('evento: válido passa', () => assert.equal(validateStudioEvent(evt(), TODAY), null));
test('evento: data no passado é recusada', () => assert.match(validateStudioEvent(evt({ startDate: '2026-11-01' }), TODAY)!, /passado/));
test('evento: sem fonte oficial é recusado', () => assert.match(validateStudioEvent(evt({ sources: ['https://a.com/1 — x', 'https://b.com/2 — y', 'https://c.com/3 — z'] }), TODAY)!, /oficial/));
test('evento: sem horário só passa marcado como sem horário divulgado', () => {
  assert.match(validateStudioEvent(evt({ startTime: '' }), TODAY)!, /horário/);
  assert.equal(validateStudioEvent(evt({ startTime: '', detailsTentative: true }), TODAY), null);
});
test('evento: cidade fora da região é recusada', () => assert.match(validateStudioEvent(evt({ cityId: 'rio' }), TODAY)!, /cidade/));
test('evento: horário inválido é recusado', () => assert.match(validateStudioEvent(evt({ startTime: '25:00' }), TODAY)!, /HH:MM/));
