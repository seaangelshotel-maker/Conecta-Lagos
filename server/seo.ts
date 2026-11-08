/**
 * SEO no servidor (Vercel Functions), sem credenciais: lê o Firestore pela API REST pública
 * (as regras já liberam leitura de empresas, matérias, posts e coleções).
 *
 * - /sitemap.xml  → buildSitemap()
 * - /robots.txt   → buildRobots()
 * - páginas para robôs (Google, WhatsApp, Facebook…) → renderForBot(): o mesmo index.html com
 *   título, descrição, imagem, canônico, JSON-LD e um resumo em texto de cada página.
 */
import type { Req, Res } from './http.js';

const PROJECT = process.env.FIREBASE_PROJECT_ID || process.env.VITE_FIREBASE_PROJECT_ID || 'conectario-dd04b';
const API_KEY = process.env.VITE_FIREBASE_API_KEY || 'AIzaSyCLyaiF_RVOd4BXNE9sZ4sGNsjlqu6ihdQ';
const FS = `https://firestore.googleapis.com/v1/projects/${PROJECT}/databases/(default)/documents`;
const BRAND = 'Lagos GO';
const DEFAULT_DESC = 'Guia da Região dos Lagos (RJ): praias, restaurantes, passeios, hospedagens, cupons, matérias e dicas de Arraial do Cabo, Cabo Frio e Búzios.';

/* ---------- utilidades ---------- */

/** Domínio público: SITE_URL (quando o domínio próprio estiver ligado) ou o host da requisição. */
export const siteUrl = (req?: Req) => {
  const env = (process.env.SITE_URL || '').replace(/\/+$/, '');
  if (env) return env;
  const host = (req?.headers['x-forwarded-host'] as string) || req?.headers.host || 'conecta-lagos-one.vercel.app';
  return `https://${String(host).split(',')[0].trim()}`;
};

export const esc = (s: unknown) => String(s ?? '')
  .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const clip = (s: string, n: number) => { const t = (s || '').replace(/\s+/g, ' ').trim(); return t.length > n ? `${t.slice(0, n - 1).trimEnd()}…` : t; };

/** Converte o formato de valores do Firestore REST em objeto comum. */
export const fromFs = (v: any): any => {
  if (!v || typeof v !== 'object') return v;
  if ('stringValue' in v) return v.stringValue;
  if ('integerValue' in v) return Number(v.integerValue);
  if ('doubleValue' in v) return v.doubleValue;
  if ('booleanValue' in v) return v.booleanValue;
  if ('nullValue' in v) return null;
  if ('timestampValue' in v) return v.timestampValue;
  if ('arrayValue' in v) return (v.arrayValue.values || []).map(fromFs);
  if ('mapValue' in v) return Object.fromEntries(Object.entries(v.mapValue.fields || {}).map(([k, x]) => [k, fromFs(x)]));
  return v;
};
const docToObj = (d: any) => ({ id: String(d.name).split('/').pop(), ...fromFs({ mapValue: { fields: d.fields || {} } }) });

const fsGet = async (path: string): Promise<any | null> => {
  const r = await fetch(`${FS}/${path}?key=${API_KEY}`);
  if (!r.ok) return null;
  return docToObj(await r.json());
};

/** Lista uma coleção inteira em páginas (limite de segurança de 2.000 documentos). */
const fsList = async (collection: string, mask: string[]): Promise<any[]> => {
  const out: any[] = []; let token = '';
  const fields = mask.map(f => `mask.fieldPaths=${encodeURIComponent(f)}`).join('&');
  for (let i = 0; i < 10; i++) {
    const r = await fetch(`${FS}/${collection}?pageSize=200&${fields}&key=${API_KEY}${token ? `&pageToken=${token}` : ''}`);
    if (!r.ok) break;
    const j: any = await r.json();
    (j.documents || []).forEach((d: any) => out.push(docToObj(d)));
    if (!j.nextPageToken) break;
    token = j.nextPageToken;
  }
  return out;
};

/** Matéria criada pelo admin com outro id: procura pelo slug. */
const fsFindBySlug = async (slug: string): Promise<any | null> => {
  const r = await fetch(`${FS}:runQuery?key=${API_KEY}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ structuredQuery: { from: [{ collectionId: 'blog_posts' }], where: { fieldFilter: { field: { fieldPath: 'slug' }, op: 'EQUAL', value: { stringValue: slug } } }, limit: 1 } }),
  });
  if (!r.ok) return null;
  const rows: any[] = await r.json();
  const d = rows.find(x => x.document)?.document;
  return d ? docToObj(d) : null;
};

const isLive = (b: any) => !b.isBlocked && (!b.status || b.status === 'approved');
const isPublished = (p: any) => p.status !== 'draft' && !!p.title;
const isoDate = (s?: string) => { const m = String(s || '').match(/^\d{4}-\d{2}-\d{2}/); return m ? m[0] : ''; };

/* ---------- sitemap e robots ---------- */

const STATIC_PAGES: { path: string; priority: string; freq: string }[] = [
  { path: '/', priority: '1.0', freq: 'daily' },
  { path: '/descubra', priority: '0.9', freq: 'daily' },
  { path: '/blog', priority: '0.9', freq: 'daily' },
  { path: '/guide', priority: '0.8', freq: 'weekly' },
  { path: '/collections', priority: '0.6', freq: 'weekly' },
  { path: '/ajuda', priority: '0.6', freq: 'daily' },
  { path: '/privacidade', priority: '0.2', freq: 'yearly' },
  { path: '/termos', priority: '0.2', freq: 'yearly' },
  { path: '/excluir-conta', priority: '0.2', freq: 'yearly' },
];

export const sitemapEntries = async () => {
  const [biz, posts, cols] = await Promise.all([
    fsList('businesses', ['status', 'isBlocked', 'name']).catch(() => []),
    fsList('blog_posts', ['status', 'title', 'kind', 'slug', 'date']).catch(() => []),
    fsList('collections', ['active', 'title']).catch(() => []),
  ]);
  const entries: { path: string; lastmod?: string; priority: string; freq: string }[] = [...STATIC_PAGES];
  biz.filter(isLive).forEach(b => entries.push({ path: `/business/${encodeURIComponent(b.id)}`, priority: '0.7', freq: 'weekly' }));
  posts.filter(isPublished).forEach(p => entries.push({
    path: p.kind === 'guia' ? `/guia/${encodeURIComponent(p.slug || p.id)}` : `/blog/${encodeURIComponent(p.id)}`,
    lastmod: isoDate(p.date), priority: p.kind === 'guia' ? '0.8' : '0.6', freq: 'monthly',
  }));
  cols.filter(c => c.active !== false && c.title).forEach(c => entries.push({ path: `/collection/${encodeURIComponent(c.id)}`, priority: '0.5', freq: 'weekly' }));
  return entries;
};

export const buildSitemap = async (base: string) => {
  const entries = await sitemapEntries();
  const urls = entries.map(e => `  <url><loc>${esc(base + e.path)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}<changefreq>${e.freq}</changefreq><priority>${e.priority}</priority></url>`);
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`;
};

export const buildRobots = (base: string) => [
  'User-agent: *',
  'Allow: /',
  'Disallow: /admin-dashboard',
  'Disallow: /journalist-dashboard',
  'Disallow: /user-dashboard',
  'Disallow: /ajuda/gerenciar/',
  'Disallow: /ajuda/editar/',
  'Disallow: /api/',
  '',
  `Sitemap: ${base}/sitemap.xml`,
  '',
].join('\n');

/* ---------- metadados por página ---------- */

export interface PageMeta {
  title: string; description: string; image?: string; type: 'website' | 'article';
  canonical: string; jsonLd: any[]; body: string; noindex?: boolean;
}

const breadcrumbs = (base: string, items: [string, string][]) => ({
  '@context': 'https://schema.org', '@type': 'BreadcrumbList',
  itemListElement: items.map(([name, path], i) => ({ '@type': 'ListItem', position: i + 1, name, item: base + path })),
});

const CITY: Record<string, string> = { city_arraial_do_cabo: 'Arraial do Cabo', city_cabo_frio: 'Cabo Frio', city_buzios: 'Armação dos Búzios', arraial: 'Arraial do Cabo' };
const TOURIST_SUBS = ['praias', 'trilhas', 'natureza', 'mirantes', 'pontos históricos', 'cultura'];

const businessType = (b: any) => {
  const sub = String(b.subcategory || '').toLowerCase();
  const cat = String(b.category || '').toLowerCase();
  if (sub === 'praias') return 'Beach';
  if (TOURIST_SUBS.includes(sub)) return 'TouristAttraction';
  if (cat.includes('hosped')) return 'LodgingBusiness';
  if (cat.includes('gastro')) return 'FoodEstablishment';
  if (cat.includes('compras')) return 'Store';
  return 'LocalBusiness';
};

const realRating = (b: any) => {
  const rs = (b.reviews || []).filter((r: any) => r && typeof r.rating === 'number' && (!r.status || r.status === 'approved'));
  return rs.length ? { avg: rs.reduce((s: number, r: any) => s + r.rating, 0) / rs.length, n: rs.length } : null;
};

const textOf = (md: string) => String(md || '').split('\n').map(l => l.replace(/^#+\s*|^-\s*|^>\s*(Dica|Alerta|Confirme|Prático):\s*/i, '').replace(/\*\*/g, '')).join('\n');

export const pageMeta = async (path: string, base: string): Promise<PageMeta> => {
  const clean = path.replace(/\/+$/, '') || '/';
  const canonical = base + (clean === '/' ? '/' : clean);
  const def: PageMeta = { title: `${BRAND} — Guia da Região dos Lagos`, description: DEFAULT_DESC, type: 'website', canonical, jsonLd: [], body: '' };

  let m: RegExpMatchArray | null;
  if ((m = clean.match(/^\/business\/([^/]+)$/))) {
    const b = await fsGet(`businesses/${decodeURIComponent(m[1])}`).catch(() => null);
    if (!b || !isLive(b)) return { ...def, title: `Lugar não encontrado | ${BRAND}`, noindex: true };
    const city = CITY[b.cityId] || '';
    const desc = clip(b.description || `${b.subcategory || b.category || 'Lugar'} em ${city || 'Região dos Lagos'}.`, 160);
    const rating = realRating(b);
    const ld: any = {
      '@context': 'https://schema.org', '@type': businessType(b), name: b.name, description: clip(b.description || '', 500) || undefined,
      url: canonical, image: b.coverImage || undefined, telephone: b.phone || undefined,
      address: b.address ? { '@type': 'PostalAddress', streetAddress: b.address, addressLocality: city || undefined, addressRegion: 'RJ', addressCountry: 'BR' } : undefined,
      geo: typeof b.lat === 'number' && typeof b.lng === 'number' ? { '@type': 'GeoCoordinates', latitude: b.lat, longitude: b.lng } : undefined,
      sameAs: [b.website, b.instagram && (String(b.instagram).startsWith('http') ? b.instagram : `https://instagram.com/${String(b.instagram).replace('@', '')}`)].filter(Boolean),
      aggregateRating: rating ? { '@type': 'AggregateRating', ratingValue: rating.avg.toFixed(1), reviewCount: rating.n } : undefined,
    };
    return {
      title: `${b.name}${city ? ` em ${city}` : ''} | ${BRAND}`, description: desc, image: b.coverImage, type: 'website', canonical,
      jsonLd: [ld, breadcrumbs(base, [['Início', '/'], ['Lugares', '/descubra'], [b.name, clean]])],
      body: `<h1>${esc(b.name)}</h1><p>${esc(b.subcategory || b.category || '')}${city ? ` — ${esc(city)}` : ''}</p>${b.address ? `<p>${esc(b.address)}</p>` : ''}<p>${esc(b.description || '')}</p>`,
    };
  }

  if ((m = clean.match(/^\/guia\/([^/]+)$/))) {
    const slug = decodeURIComponent(m[1]);
    const a = (await fsGet(`blog_posts/guia_${slug}`).catch(() => null)) || (await fsFindBySlug(slug).catch(() => null));
    if (!a || !isPublished(a)) return { ...def, title: `Matéria não encontrada | ${BRAND}`, noindex: true };
    const ld = {
      '@context': 'https://schema.org', '@type': 'Article', headline: a.title, description: a.excerpt, inLanguage: 'pt-BR',
      datePublished: isoDate(a.date) || undefined, dateModified: isoDate(a.date) || undefined, image: a.imageUrl || undefined,
      author: { '@type': 'Organization', name: a.author || BRAND }, publisher: { '@type': 'Organization', name: BRAND },
      mainEntityOfPage: canonical, keywords: (a.tags || []).join(', ') || undefined, articleSection: a.category,
    };
    return {
      title: `${a.metaTitle || a.title} | ${BRAND}`, description: clip(a.metaDescription || a.excerpt || '', 160), image: a.imageUrl, type: 'article', canonical,
      jsonLd: [ld, breadcrumbs(base, [['Início', '/'], ['Feed', '/blog'], [a.title, clean]])],
      body: `<article><h1>${esc(a.title)}</h1>${a.subtitle ? `<p>${esc(a.subtitle)}</p>` : ''}<p>${esc(a.excerpt)}</p>${textOf(a.content).split('\n').filter(Boolean).map(l => `<p>${esc(l)}</p>`).join('')}</article>`,
    };
  }

  if ((m = clean.match(/^\/blog\/([^/]+)$/))) {
    const p = await fsGet(`blog_posts/${decodeURIComponent(m[1])}`).catch(() => null);
    if (!p || !isPublished(p)) return { ...def, title: `Publicação não encontrada | ${BRAND}`, noindex: true };
    if (p.kind === 'guia') return { ...def, canonical: `${base}/guia/${encodeURIComponent(p.slug || p.id)}` };
    const ld = {
      '@context': 'https://schema.org', '@type': 'BlogPosting', headline: p.title, description: p.excerpt, inLanguage: 'pt-BR',
      datePublished: isoDate(p.date) || undefined, image: p.imageUrl || undefined,
      author: { '@type': 'Person', name: p.author || BRAND }, publisher: { '@type': 'Organization', name: BRAND }, mainEntityOfPage: canonical,
    };
    return {
      title: `${p.title} | ${BRAND}`, description: clip(p.excerpt || '', 160), image: p.imageUrl, type: 'article', canonical,
      jsonLd: [ld, breadcrumbs(base, [['Início', '/'], ['Feed', '/blog'], [p.title, clean]])],
      body: `<article><h1>${esc(p.title)}</h1><p>${esc(p.excerpt)}</p><div>${esc(textOf(p.content || '')).slice(0, 4000)}</div></article>`,
    };
  }

  if ((m = clean.match(/^\/collection\/([^/]+)$/))) {
    const c = await fsGet(`collections/${decodeURIComponent(m[1])}`).catch(() => null);
    if (!c || c.active === false) return { ...def, noindex: true };
    return { ...def, title: `${c.title} | ${BRAND}`, description: clip(c.description || `Coleção ${c.title} no ${BRAND}.`, 160), image: c.coverImage, body: `<h1>${esc(c.title)}</h1><p>${esc(c.description || '')}</p>` };
  }

  const STATIC: Record<string, [string, string]> = {
    '/': [`${BRAND} — Guia da Região dos Lagos`, DEFAULT_DESC],
    '/descubra': [`Lugares na Região dos Lagos | ${BRAND}`, 'Praias, restaurantes, passeios, hospedagens e serviços em Arraial do Cabo, Cabo Frio e Búzios, com filtros e comodidades.'],
    '/blog': [`Feed: notícias, matérias e dicas | ${BRAND}`, 'Notícias, matérias, eventos e dicas da Região dos Lagos para moradores e visitantes.'],
    '/guide': [`Guia de empresas | ${BRAND}`, 'Empresas e serviços da Região dos Lagos.'],
    '/collections': [`Coleções | ${BRAND}`, 'Coleções temáticas de lugares e experiências na Região dos Lagos.'],
    '/ajuda': [`Ajuda Colaborativa | ${BRAND}`, 'Trabalhos pontuais, vagas e colaborações entre pessoas e empresas da Região dos Lagos.'],
    '/privacidade': [`Política de Privacidade | ${BRAND}`, 'Como o Lagos GO trata seus dados pessoais, conforme a LGPD.'],
    '/termos': [`Termos de Uso | ${BRAND}`, 'Regras de uso do Lagos GO.'],
    '/excluir-conta': [`Excluir conta | ${BRAND}`, 'Como excluir sua conta do Lagos GO e os dados associados.'],
  };
  if (STATIC[clean]) {
    const [title, description] = STATIC[clean];
    const jsonLd = clean === '/' ? [
      { '@context': 'https://schema.org', '@type': 'WebSite', name: BRAND, url: base + '/', inLanguage: 'pt-BR',
        potentialAction: { '@type': 'SearchAction', target: `${base}/descubra?q={search_term_string}`, 'query-input': 'required name=search_term_string' } },
      { '@context': 'https://schema.org', '@type': 'Organization', name: BRAND, url: base + '/', logo: `${base}/icons/icon-512.png` },
    ] : [];
    return { ...def, title, description, jsonLd, body: `<h1>${esc(title)}</h1><p>${esc(description)}</p>` };
  }
  const privateArea = /^\/(admin-dashboard|user-dashboard|journalist-dashboard|login|ajuda\/(editar|gerenciar|minhas|interesses|publicar))/.test(clean);
  return { ...def, noindex: privateArea };
};

/** Injeta os metadados no index.html do app (o app React continua igual para quem abre). */
export const injectMeta = (html: string, meta: PageMeta, base: string) => {
  const image = meta.image && /^https?:\/\//.test(meta.image) ? meta.image : `${base}/og-image.jpg`;
  const tags = [
    `<title>${esc(meta.title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    `<link rel="canonical" href="${esc(meta.canonical)}" />`,
    meta.noindex ? '<meta name="robots" content="noindex, follow" />' : '<meta name="robots" content="index, follow, max-image-preview:large" />',
    `<meta property="og:type" content="${meta.type}" />`,
    `<meta property="og:site_name" content="${BRAND}" />`,
    `<meta property="og:locale" content="pt_BR" />`,
    `<meta property="og:title" content="${esc(meta.title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    `<meta property="og:url" content="${esc(meta.canonical)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${esc(meta.title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    ...meta.jsonLd.map(j => `<script type="application/ld+json">${JSON.stringify(j).replace(/</g, '\\u003c')}</script>`),
  ].join('\n    ');
  let out = html
    .replace(/<title>[\s\S]*?<\/title>/i, '')
    .replace(/<meta\s+(name|property)="(description|og:[^"]+|twitter:[^"]+)"[^>]*>\s*/gi, '')
    .replace(/<link\s+rel="canonical"[^>]*>\s*/gi, '');
  out = out.replace(/<head>/i, `<head>\n    ${tags}`);
  if (meta.body) out = out.replace(/<div id="root"><\/div>/i, `<div id="root"><div id="seo-content">${meta.body}</div></div>`);
  return out;
};

/* ---------- handlers ---------- */

const send = (res: Res, status: number, type: string, body: string, cache = 's-maxage=3600, stale-while-revalidate=86400') => {
  res.statusCode = status;
  res.setHeader('Content-Type', type);
  res.setHeader('Cache-Control', cache);
  res.end(body);
};

export const handleSitemap = async (req: Req, res: Res) => {
  try { send(res, 200, 'application/xml; charset=utf-8', await buildSitemap(siteUrl(req))); }
  catch { send(res, 500, 'text/plain; charset=utf-8', 'sitemap indisponível', 'no-store'); }
};

export const handleRobots = (req: Req, res: Res) => send(res, 200, 'text/plain; charset=utf-8', buildRobots(siteUrl(req)), 's-maxage=86400');

export const handleRender = async (req: Req, res: Res) => {
  const base = siteUrl(req);
  const url = new URL(req.url || '/', base);
  const path = url.searchParams.get('path') || '/';
  try {
    const [htmlRes, meta] = await Promise.all([fetch(`${base}/index.html`, { headers: { 'x-seo-render': '1' } }), pageMeta(path, base)]);
    const html = await htmlRes.text();
    send(res, meta.noindex && meta.title.includes('não encontrad') ? 404 : 200, 'text/html; charset=utf-8', injectMeta(html, meta, base), 's-maxage=600, stale-while-revalidate=86400');
  } catch {
    res.statusCode = 302; res.setHeader('Location', '/index.html'); res.end();
  }
};
