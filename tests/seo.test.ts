import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fromFs, injectMeta, buildRobots, buildSitemap, pageMeta, esc } from '../server/seo';

const fsDoc = (id: string, fields: Record<string, any>) => ({
  name: `projects/p/databases/(default)/documents/x/${id}`,
  fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === 'number' ? { doubleValue: v } : typeof v === 'boolean' ? { booleanValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(s => ({ stringValue: s })) } } : { stringValue: v }])),
});

const DB: Record<string, any> = {
  'businesses/b1': fsDoc('b1', { name: 'Praia do Forno', subcategory: 'Praias', category: 'Passeios', status: 'approved', cityId: 'city_arraial_do_cabo', description: 'Enseada calma.', lat: -22.97, lng: -42.0 }),
  'businesses/b2': fsDoc('b2', { name: 'Rascunho', status: 'draft' }),
  'blog_posts/guia_praia-do-forno': fsDoc('guia_praia-do-forno', { kind: 'guia', slug: 'praia-do-forno', title: 'Praia do Forno: guia', excerpt: 'Resumo <b>', content: '## Como chegar\n\n- Trilha\n> Dica: leve água', status: 'published', date: '2026-11-07', tags: ['praia'] }),
  'blog_posts/p1': fsDoc('p1', { title: 'Festival', excerpt: 'Evento', content: 'Texto', status: 'published', date: '2026-10-01' }),
};

const installFetch = () => {
  (globalThis as any).fetch = async (url: string) => {
    const u = new URL(url);
    const path = decodeURIComponent(u.pathname.split('/documents/')[1] || '');
    if (DB[path]) return { ok: true, json: async () => DB[path] };
    const coll = Object.keys(DB).filter(k => k.startsWith(path + '/'));
    if (coll.length) return { ok: true, json: async () => ({ documents: coll.map(k => DB[k]) }) };
    if (['businesses', 'blog_posts', 'collections'].includes(path)) return { ok: true, json: async () => ({ documents: [] }) };
    return { ok: false, json: async () => ({}) };
  };
};

test('fromFs converte tipos do Firestore REST', () => {
  assert.deepEqual(fromFs({ mapValue: { fields: { a: { stringValue: 'x' }, n: { integerValue: '3' }, l: { arrayValue: { values: [{ booleanValue: true }] } } } } }), { a: 'x', n: 3, l: [true] });
});

test('robots aponta o sitemap do domínio e bloqueia painéis', () => {
  const r = buildRobots('https://lagosgo.com.br');
  assert.match(r, /Sitemap: https:\/\/lagosgo\.com\.br\/sitemap\.xml/);
  assert.match(r, /Disallow: \/admin-dashboard/);
  assert.match(r, /Disallow: \/api\//);
});

test('sitemap traz páginas fixas, lugares aprovados, matérias e posts', async () => {
  installFetch();
  const xml = await buildSitemap('https://x.com');
  assert.match(xml, /<loc>https:\/\/x\.com\/business\/b1<\/loc>/);
  assert.ok(!xml.includes('/business/b2'), 'rascunho fora');
  assert.match(xml, /\/guia\/praia-do-forno<\/loc><lastmod>2026-11-07/);
  assert.match(xml, /\/blog\/p1<\/loc>/);
  assert.match(xml, /<loc>https:\/\/x\.com\/privacidade<\/loc>/);
});

test('lugar: título com cidade, JSON-LD de praia com geo e texto no corpo', async () => {
  installFetch();
  const m = await pageMeta('/business/b1', 'https://x.com');
  assert.equal(m.title, 'Praia do Forno em Arraial do Cabo | Lagos GO');
  assert.equal(m.jsonLd[0]['@type'], 'Beach');
  assert.equal(m.jsonLd[0].geo.latitude, -22.97);
  assert.match(m.body, /Enseada calma/);
});

test('lugar em rascunho ou inexistente vira noindex', async () => {
  installFetch();
  assert.equal((await pageMeta('/business/b2', 'https://x.com')).noindex, true);
  assert.equal((await pageMeta('/business/zzz', 'https://x.com')).noindex, true);
});

test('matéria: Article, canônico próprio e conteúdo escapado', async () => {
  installFetch();
  const m = await pageMeta('/guia/praia-do-forno', 'https://x.com');
  assert.equal(m.jsonLd[0]['@type'], 'Article');
  assert.equal(m.canonical, 'https://x.com/guia/praia-do-forno');
  assert.ok(m.body.includes('Resumo &lt;b&gt;'));
  assert.ok(m.body.includes('leve água') && !m.body.includes('Dica:'));
});

test('áreas privadas não são indexadas', async () => {
  assert.equal((await pageMeta('/admin-dashboard', 'https://x.com')).noindex, true);
  assert.equal((await pageMeta('/ajuda/editar/1', 'https://x.com')).noindex, true);
});

test('injectMeta troca título e metatags e insere JSON-LD e texto', async () => {
  installFetch();
  const html = '<html><head><title>Velho</title><meta name="description" content="velho" /><meta property="og:title" content="velho" /></head><body><div id="root"></div></body></html>';
  const m = await pageMeta('/guia/praia-do-forno', 'https://x.com');
  const out = injectMeta(html, m, 'https://x.com');
  assert.equal((out.match(/<title>/g) || []).length, 1);
  assert.ok(!out.includes('content="velho"'));
  assert.ok(out.includes('<link rel="canonical" href="https://x.com/guia/praia-do-forno" />'));
  assert.ok(out.includes('application/ld+json'));
  assert.ok(out.includes('og:image" content="https://x.com/og-image.jpg"'));
  assert.ok(out.includes('<div id="seo-content">'));
});

test('esc neutraliza HTML', () => assert.equal(esc('<a href="x">\'</a>'), '&lt;a href=&quot;x&quot;&gt;&#39;&lt;/a&gt;'));
