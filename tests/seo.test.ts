import { test } from 'node:test';
import assert from 'node:assert/strict';
import { fromFs, injectMeta, buildRobots, buildSitemap, pageMeta, esc, siteUrl } from '../server/seo';
import { isKnownPath, cityLandingBySlug } from '../services/seoRoutes';

const fsDoc = (id: string, fields: Record<string, any>) => ({
  name: `projects/p/databases/(default)/documents/x/${id}`,
  fields: Object.fromEntries(Object.entries(fields).map(([k, v]) => [k, typeof v === 'number' ? { doubleValue: v } : typeof v === 'boolean' ? { booleanValue: v } : Array.isArray(v) ? { arrayValue: { values: v.map(s => ({ stringValue: s })) } } : { stringValue: v }])),
});

const DB: Record<string, any> = {
  'businesses/b1': fsDoc('b1', { name: 'Praia do Forno', subcategory: 'Praias', category: 'Passeios', status: 'approved', cityId: 'city_arraial_do_cabo', description: 'Enseada calma.', lat: -22.97, lng: -42.0 }),
  'businesses/b2': fsDoc('b2', { name: 'Rascunho', status: 'draft' }),
  'blog_posts/guia_praia-do-forno': fsDoc('guia_praia-do-forno', { kind: 'guia', slug: 'praia-do-forno', title: 'Praia do Forno: guia', excerpt: 'Resumo <b>', content: '## Como chegar\n\n- Trilha\n> Dica: leve água', status: 'published', date: '2026-11-07', tags: ['praia'] }),
  'events/e1': fsDoc('e1', { title: 'Festival de Verão', status: 'published', startDate: '2099-01-10', endDate: '2099-01-12', startTime: '20:00', cityId: 'arraial-do-cabo', locationName: 'Praça da Cidade', description: 'Shows ao vivo.', isFree: true }),
  'events/e2': fsDoc('e2', { title: 'Aguardando', status: 'pending', startDate: '2099-02-01' }),
  'events/e3': fsDoc('e3', { title: 'Já passou', status: 'published', startDate: '2020-01-01' }),
  'blog_posts/p1': fsDoc('p1', { title: 'Festival', excerpt: 'Evento', content: 'Texto', status: 'published', date: '2026-10-01' }),
};

const installFetch = () => {
  (globalThis as any).fetch = async (url: string, opts?: any) => {
    if (String(url).includes(':runQuery')) {
      // Consulta por igualdade (eventos publicados): devolve só os documentos que batem.
      const q = JSON.parse(opts?.body || '{}').structuredQuery || {};
      const coll = q.from?.[0]?.collectionId; const f = q.where?.fieldFilter;
      const rows = Object.entries(DB).filter(([k, d]: any) => k.startsWith(`${coll}/`) && (!f || d.fields?.[f.field.fieldPath]?.stringValue === f.value.stringValue)).map(([, d]) => ({ document: d }));
      return { ok: true, json: async () => rows };
    }
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

test('sitemap inclui páginas das cidades e só eventos publicados que ainda não acabaram', async () => {
  installFetch();
  const xml = await buildSitemap('https://x.com');
  assert.match(xml, /<loc>https:\/\/x\.com\/cabo-frio<\/loc>/);
  assert.match(xml, /<loc>https:\/\/x\.com\/eventos<\/loc>/);
  assert.match(xml, /<loc>https:\/\/x\.com\/eventos\/e1<\/loc>/);
  assert.ok(!xml.includes('/eventos/e2'), 'evento pendente fora');
  assert.ok(!xml.includes('/eventos/e3'), 'evento encerrado fora');
});

test('evento: Event com datas, local gratuito e canônico', async () => {
  installFetch();
  const m = await pageMeta('/eventos/e1', 'https://x.com');
  assert.equal(m.jsonLd[0]['@type'], 'Event');
  assert.equal(m.jsonLd[0].startDate, '2099-01-10T20:00:00-03:00');
  assert.equal(m.jsonLd[0].location.address.addressLocality, 'Arraial do Cabo');
  assert.equal(m.jsonLd[0].isAccessibleForFree, true);
  assert.match(m.title, /Festival de Verão em Arraial do Cabo/);
  assert.equal(m.canonical, 'https://x.com/eventos/e1');
  assert.ok(!m.notFound);
  const pend = await pageMeta('/eventos/e2', 'https://x.com');
  assert.equal(pend.notFound, true);
});

test('página da cidade: título próprio, lista de lugares e breadcrumbs', async () => {
  installFetch();
  const m = await pageMeta('/arraial-do-cabo', 'https://x.com');
  assert.match(m.title, /^Arraial do Cabo:/);
  assert.equal(m.jsonLd[0]['@type'], 'CollectionPage');
  assert.ok(m.jsonLd.some(j => j['@type'] === 'BreadcrumbList'));
  assert.ok(!m.notFound && !m.noindex);
  assert.equal(cityLandingBySlug('buzios')?.cityId, 'city_buzios');
});

test('endereço inexistente é 404 e sem índice; páginas reais não', async () => {
  installFetch();
  const bad = await pageMeta('/qualquer-coisa-que-nao-existe', 'https://x.com');
  assert.equal(bad.notFound, true); assert.equal(bad.noindex, true);
  assert.equal((await pageMeta('/descubra', 'https://x.com')).notFound, undefined);
  assert.equal((await pageMeta('/eventos', 'https://x.com')).notFound, undefined);
  assert.equal(isKnownPath('/pricing-plans'), true);
  assert.equal(isKnownPath('/login'), true);
  assert.equal(isKnownPath('/nada'), false);
  assert.equal((await pageMeta('/login', 'https://x.com')).noindex, true);
});

test('domínio oficial: o endereço técnico da Vercel nunca vira canônico', () => {
  const vercel = { headers: { host: 'conecta-lagos-one.vercel.app' } } as any;
  assert.equal(siteUrl(vercel), 'https://lagosgo.com.br');
  assert.equal(siteUrl({ headers: { host: 'localhost:3000' } } as any), 'http://localhost:3000');
  assert.match(buildRobots('https://lagosgo.com.br'), /Disallow: \/login/);
});
