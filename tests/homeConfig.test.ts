import { test } from 'node:test';
import assert from 'node:assert/strict';
import { normalizeConfig, buildCategories, matchRule, MAIN_CATEGORIES, DEFAULT_PLACES_PER_CATEGORY } from '../services/discoverLogic';

const biz = (o: any) => ({ id: o.id, name: o.name || o.id, category: o.category || '', subcategory: o.subcategory || '', description: o.description || '', status: 'approved', isBlocked: false, ...o });

test('sem configuração salva: 10 categorias padrão e 8 lugares', () => {
  const c = normalizeConfig(null);
  assert.equal(c.placesPerCategory, DEFAULT_PLACES_PER_CATEGORY);
  assert.deepEqual(c.categories.map(x => x.id), MAIN_CATEGORIES.map(m => m.id));
});
test('quantidade fica entre 1 e 24', () => {
  assert.equal(normalizeConfig({ placesPerCategory: 0 } as any).placesPerCategory, 1);
  assert.equal(normalizeConfig({ placesPerCategory: 99 } as any).placesPerCategory, 24);
  assert.equal(normalizeConfig({ placesPerCategory: 'x' } as any).placesPerCategory, 8);
});
test('ordem, nome, ícone e visibilidade do admin são respeitados; padrão novo entra no fim', () => {
  const c = normalizeConfig({ placesPerCategory: 4, categories: [
    { id: 'restaurantes', label: 'Onde comer', icon: 'Pizza', order: 0, active: true },
    { id: 'praias', label: 'Praias', icon: 'Waves', order: 1, active: false },
  ] } as any);
  assert.equal(c.categories[0].id, 'restaurantes');
  assert.equal(c.categories[0].label, 'Onde comer');
  assert.equal(c.categories[0].icon, 'Pizza');
  assert.equal(c.categories.length, MAIN_CATEGORIES.length);
  const visible = buildCategories(c).map(x => x.id);
  assert.ok(!visible.includes('praias'));
  assert.equal(visible[0], 'restaurantes');
});
test('categoria criada usa a própria regra; id desconhecido sem custom é ignorado', () => {
  const c = normalizeConfig({ placesPerCategory: 8, categories: [
    { id: 'c-acai', label: 'Açaí', icon: 'IceCream', order: 0, active: true, custom: true, rule: { keywords: ['açaí'] } },
    { id: 'lixo', label: 'X', icon: 'Star', order: 1, active: true },
  ] } as any);
  assert.ok(!c.categories.some(x => x.id === 'lixo'));
  const acai = buildCategories(c).find(x => x.id === 'c-acai')!;
  assert.ok(acai.match(biz({ id: 'a', name: 'Açaí Forte do Cabo' }) as any));
  assert.ok(!acai.match(biz({ id: 'b', name: 'Pizzaria' }) as any));
});
test('regra casa por categoria, subcategoria ou palavra (sem acento e maiúscula)', () => {
  const r = matchRule({ categories: ['Gastronomia'], subcategories: ['Sorveterias'], keywords: ['kitesurf'] });
  assert.ok(r(biz({ id: '1', category: 'gastronomia' }) as any));
  assert.ok(r(biz({ id: '2', subcategory: 'Sorveterias' }) as any));
  assert.ok(r(biz({ id: '3', description: 'Aulas de KiteSurf na lagoa' }) as any));
  assert.ok(!r(biz({ id: '4', category: 'Hospedagem' }) as any));
  assert.ok(!matchRule(undefined)(biz({ id: '5' }) as any));
});
test('palavra-chave casa palavra inteira, não pedaço', () => {
  const r = matchRule({ keywords: ['açaí'] });
  assert.ok(r(biz({ id: '1', name: 'Açaí Forte do Cabo' }) as any));
  assert.ok(r(biz({ id: '2', description: 'Tigela de acai com frutas' }) as any));
  assert.ok(!r(biz({ id: '3', name: 'Praia da Graçainha' }) as any));
});
