import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pickEditorial, normalizeEditorial } from '../services/editorialPick';

const g = (id: string, extra = {}) => ({ id, ...extra });
const guides = [g('arraial', { featured: true }), g('buzios', { popular: true }), g('cabofrio', { featured: true })];
const posts = [g('p1'), g('p2'), g('p3')];

test('sem escolha do admin, o destaque grande é o guia de Arraial (automático)', () => {
  const r = pickEditorial(guides, posts, guides, posts, null);
  assert.equal(r.lead?.id, 'arraial');
  assert.equal(r.leadIsManual, false);
});

test('o destaque automático não muda com a ordenação geográfica', () => {
  const geoGuides = [guides[2], guides[1], guides[0]]; // pessoa em Cabo Frio: Cabo Frio sobe
  const r = pickEditorial(guides, posts, geoGuides, posts, null);
  assert.equal(r.lead?.id, 'arraial'); // continua o mesmo para todos
});

test('admin escolhe o destaque grande e ele vence o automático', () => {
  const r = pickEditorial(guides, posts, guides, posts, { leadId: 'p2' });
  assert.equal(r.lead?.id, 'p2');
  assert.equal(r.leadIsManual, true);
  assert.equal(r.autoLead?.id, 'arraial');
});

test('id escolhido que saiu do ar volta ao automático', () => {
  const r = pickEditorial(guides, posts, guides, posts, { leadId: 'apagado' });
  assert.equal(r.lead?.id, 'arraial');
  assert.equal(r.leadIsManual, false);
});

test('subdestaques escolhidos vêm primeiro, na ordem do admin, e o resto é completado', () => {
  const r = pickEditorial(guides, posts, guides, posts, { leadId: 'arraial', subIds: ['p3', 'buzios'] });
  assert.deepEqual(r.subs.slice(0, 2).map(p => p.id), ['p3', 'buzios']);
  assert.equal(r.subs.length, 3);
  assert.ok(!r.subs.some(p => p.id === 'arraial')); // o principal nunca repete
});

test('normalização: sem repetidos, sem o principal e no máximo 3 subdestaques', () => {
  const n = normalizeEditorial({ leadId: ' a ', subIds: ['a', 'b', 'b', 'c', 'd', 'e', ''] });
  assert.equal(n.leadId, 'a');
  assert.deepEqual(n.subIds, ['b', 'c', 'd']);
  assert.deepEqual(normalizeEditorial(null), { leadId: '', subIds: [] });
});
