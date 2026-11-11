import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CheckCircle2, AlertTriangle, XCircle, Loader2, RefreshCw, ExternalLink, Search, Globe2, Target } from 'lucide-react';
import { getAllBusinesses } from '../../services/dataService';
import { BusinessProfile } from '../../types';
import { OFFICIAL_SITE_URL, CITY_LANDINGS } from '../../services/seoRoutes';

type Status = 'ok' | 'warn' | 'fail' | 'loading';
interface Check { id: string; label: string; status: Status; detail: string; }

interface SitemapStats { total: number; places: number; articles: number; posts: number; events: number; cities: number; other: number; }

/** Metas de qualidade: o que o Google (e quem pesquisa) espera de uma ficha completa. */
const GOALS = { description: 90, cover: 90, address: 80, phone: 70 };
const MIN_DESC = 80;

const parseSitemap = (xml: string): SitemapStats => {
  const locs = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1]);
  const st: SitemapStats = { total: locs.length, places: 0, articles: 0, posts: 0, events: 0, cities: 0, other: 0 };
  const citySlugs = new Set(CITY_LANDINGS.map(c => `/${c.slug}`));
  locs.forEach(u => {
    const path = u.replace(/^https?:\/\/[^/]+/, '');
    if (path.startsWith('/business/')) st.places++;
    else if (path.startsWith('/guia/')) st.articles++;
    else if (path.startsWith('/blog/')) st.posts++;
    else if (path.startsWith('/eventos/')) st.events++;
    else if (citySlugs.has(path)) st.cities++;
    else st.other++;
  });
  return st;
};

const icon = (s: Status) => s === 'ok' ? <CheckCircle2 size={18} className="text-emerald-500 shrink-0" aria-hidden />
  : s === 'warn' ? <AlertTriangle size={18} className="text-amber-500 shrink-0" aria-hidden />
  : s === 'fail' ? <XCircle size={18} className="text-red-500 shrink-0" aria-hidden />
  : <Loader2 size={18} className="animate-spin text-slate-400 shrink-0" aria-hidden />;

const Bar: React.FC<{ value: number; goal: number }> = ({ value, goal }) => (
  <div className="relative h-2.5 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={100}>
    <div className={`h-full rounded-full ${value >= goal ? 'bg-emerald-500' : value >= goal * 0.6 ? 'bg-amber-400' : 'bg-red-400'}`} style={{ width: `${Math.min(100, value)}%` }} />
    <div className="absolute top-0 bottom-0 w-0.5 bg-ocean-950/60" style={{ left: `${goal}%` }} title={`Meta: ${goal}%`} />
  </div>
);

const hasText = (v?: string) => !!(v && v.trim());
const isPhoto = (v?: string) => hasText(v) && !/placeholder|picsum|unsplash\.com\/photo-1$/i.test(v || '');

export const SeoDashboard: React.FC<{ onNavigate?: (page: string, params?: any) => void }> = ({ onNavigate }) => {
  const [checks, setChecks] = useState<Check[]>([]);
  const [stats, setStats] = useState<SitemapStats | null>(null);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showList, setShowList] = useState(false);

  const host = typeof window !== 'undefined' ? window.location.host : '';
  const official = OFFICIAL_SITE_URL.replace(/^https?:\/\//, '');

  const run = useCallback(async () => {
    setLoading(true);
    const out: Check[] = [];
    out.push(host === official || host === `www.${official}`
      ? { id: 'domain', label: 'Domínio oficial', status: 'ok', detail: `Você está em ${host}. Todo canônico e sitemap usam ${official}.` }
      : { id: 'domain', label: 'Domínio oficial', status: 'warn', detail: `Você abriu por ${host}. Para conferir como o Google vê, abra ${OFFICIAL_SITE_URL}.` });
    out.push(window.location.protocol === 'https:' || /^localhost/.test(host)
      ? { id: 'https', label: 'HTTPS', status: 'ok', detail: 'Conexão segura ativa (o Google prioriza sites seguros).' }
      : { id: 'https', label: 'HTTPS', status: 'fail', detail: 'O site precisa abrir em https.' });
    try {
      const r = await fetch('/sitemap.xml', { cache: 'no-store' });
      const xml = r.ok ? await r.text() : '';
      if (xml.includes('<urlset')) {
        const st = parseSitemap(xml); setStats(st);
        out.push({ id: 'sitemap', label: 'Sitemap', status: 'ok', detail: `${st.total} endereços no /sitemap.xml (${st.places} lugares, ${st.articles + st.posts} matérias, ${st.events} eventos, ${st.cities} cidades).` });
        out.push(xml.includes(OFFICIAL_SITE_URL) || /localhost/.test(host)
          ? { id: 'sitemap-host', label: 'Sitemap com o domínio certo', status: 'ok', detail: `Os endereços começam com ${OFFICIAL_SITE_URL}.` }
          : { id: 'sitemap-host', label: 'Sitemap com o domínio certo', status: 'fail', detail: 'O sitemap não está usando o domínio oficial. Confira a variável SITE_URL na Vercel.' });
      } else out.push({ id: 'sitemap', label: 'Sitemap', status: 'fail', detail: 'Não foi possível ler /sitemap.xml.' });
    } catch { out.push({ id: 'sitemap', label: 'Sitemap', status: 'fail', detail: 'Falha ao carregar /sitemap.xml.' }); }
    try {
      const r = await fetch('/robots.txt', { cache: 'no-store' });
      const txt = r.ok ? await r.text() : '';
      out.push(/Sitemap:\s*https?:\/\//i.test(txt) && /Allow:\s*\//i.test(txt)
        ? { id: 'robots', label: 'robots.txt', status: 'ok', detail: 'Libera o site, bloqueia painéis e aponta o sitemap.' }
        : { id: 'robots', label: 'robots.txt', status: 'fail', detail: 'O robots.txt não aponta o sitemap ou bloqueia tudo.' });
    } catch { out.push({ id: 'robots', label: 'robots.txt', status: 'fail', detail: 'Falha ao carregar /robots.txt.' }); }
    try {
      const r = await fetch('/og-image.jpg', { method: 'HEAD', cache: 'no-store' });
      out.push(r.ok ? { id: 'og', label: 'Imagem de compartilhamento', status: 'ok', detail: 'A prévia do WhatsApp, Instagram e Facebook tem imagem.' }
        : { id: 'og', label: 'Imagem de compartilhamento', status: 'fail', detail: 'Falta /og-image.jpg.' });
    } catch { out.push({ id: 'og', label: 'Imagem de compartilhamento', status: 'warn', detail: 'Não deu para verificar agora.' }); }
    setChecks(out);
    try { setBusinesses((await getAllBusinesses()).filter(b => !b.isBlocked)); } catch { setBusinesses([]); }
    setLoading(false);
  }, [host, official]);

  useEffect(() => { run(); }, [run]);

  const quality = useMemo(() => {
    const n = businesses.length || 1;
    const pct = (f: (b: BusinessProfile) => boolean) => (businesses.filter(f).length / n) * 100;
    return {
      total: businesses.length,
      description: pct(b => (b.description || '').trim().length >= MIN_DESC),
      cover: pct(b => isPhoto(b.coverImage)),
      address: pct(b => hasText(b.address)),
      phone: pct(b => hasText(b.phone) || hasText(b.whatsapp)),
    };
  }, [businesses]);

  const weak = useMemo(() => businesses
    .map(b => {
      const miss: string[] = [];
      if ((b.description || '').trim().length < MIN_DESC) miss.push('descrição');
      if (!isPhoto(b.coverImage)) miss.push('foto');
      if (!hasText(b.address)) miss.push('endereço');
      if (!hasText(b.phone) && !hasText(b.whatsapp)) miss.push('telefone');
      return { b, miss };
    })
    .filter(x => x.miss.length)
    .sort((a, c) => c.miss.length - a.miss.length)
    .slice(0, 15), [businesses]);

  const score = useMemo(() => {
    if (!checks.length) return 0;
    const tech = checks.filter(c => c.status === 'ok').length / checks.length;
    const content = businesses.length ? (Math.min(1, quality.description / GOALS.description) + Math.min(1, quality.cover / GOALS.cover) + Math.min(1, quality.address / GOALS.address) + Math.min(1, quality.phone / GOALS.phone)) / 4 : 0;
    return Math.round((tech * 0.5 + content * 0.5) * 100);
  }, [checks, quality, businesses.length]);

  const q = encodeURIComponent(OFFICIAL_SITE_URL);
  const tools: { label: string; hint: string; href: string }[] = [
    { label: 'Google Search Console', hint: 'Enviar o sitemap e ver o que o Google indexou', href: `https://search.google.com/search-console?resource_id=sc-domain%3A${official}` },
    { label: 'O que o Google já indexou', hint: 'Busca site:lagosgo.com.br', href: `https://www.google.com/search?q=site%3A${official}` },
    { label: 'Teste de rich results', hint: 'Valida os dados estruturados da home', href: `https://search.google.com/test/rich-results?url=${q}` },
    { label: 'PageSpeed Insights', hint: 'Velocidade no celular (Core Web Vitals)', href: `https://pagespeed.web.dev/analysis?url=${q}` },
    { label: 'Bing Webmaster Tools', hint: 'Indexação no Bing e no Copilot', href: 'https://www.bing.com/webmasters' },
    { label: 'Google Meu Negócio', hint: 'Perfil do Lagos GO no Google Maps', href: 'https://business.google.com/' },
  ];

  const scoreColor = score >= 80 ? 'text-emerald-600' : score >= 55 ? 'text-amber-500' : 'text-red-500';

  return (
    <section className="space-y-6" data-testid="seo-dashboard" aria-labelledby="seo-title">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h3 id="seo-title" className="text-xl md:text-2xl font-black text-ocean-950 flex items-center gap-2"><Globe2 size={22} className="text-ocean-600" aria-hidden /> SEO e Google</h3>
          <p className="text-sm text-slate-500 font-medium">Saúde técnica do site, qualidade dos dados e atalhos para o Google.</p>
        </div>
        <button onClick={run} disabled={loading} data-testid="seo-refresh" className="px-4 h-10 rounded-xl bg-ocean-950 text-white text-xs font-black flex items-center gap-2 disabled:opacity-60">
          <RefreshCw size={14} className={loading ? 'animate-spin' : ''} aria-hidden /> Verificar de novo
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm flex flex-col items-center justify-center text-center">
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400">Nota de SEO</p>
          <p className={`text-6xl font-black mt-1 ${scoreColor}`} data-testid="seo-score">{loading ? '…' : score}</p>
          <p className="text-xs text-slate-500 font-medium mt-1">50% técnica + 50% qualidade dos dados</p>
        </div>
        <div className="md:col-span-2 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {[
            ['Lugares no Google', stats?.places], ['Matérias e posts', stats ? stats.articles + stats.posts : undefined], ['Eventos futuros', stats?.events],
            ['Páginas de cidade', stats?.cities], ['Outras páginas', stats?.other], ['Total no sitemap', stats?.total],
          ].map(([label, v]) => (
            <div key={String(label)} className="bg-white rounded-2xl border border-slate-100 p-4 shadow-sm">
              <p className="text-2xl font-black text-ocean-950">{v ?? '—'}</p>
              <p className="text-[11px] font-bold text-slate-500 mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
        <h4 className="font-black text-ocean-950 mb-3">Verificações técnicas</h4>
        <ul className="divide-y divide-slate-100">
          {(checks.length ? checks : [{ id: 'l', label: 'Verificando…', status: 'loading' as Status, detail: '' }]).map(c => (
            <li key={c.id} className="py-2.5 flex gap-3 items-start" data-testid={`seo-check-${c.id}`} data-status={c.status}>
              {icon(c.status)}
              <div><p className="text-sm font-black text-ocean-950">{c.label}</p><p className="text-xs text-slate-500 font-medium">{c.detail}</p></div>
            </li>
          ))}
        </ul>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h4 className="font-black text-ocean-950 flex items-center gap-2"><Target size={18} className="text-ocean-600" aria-hidden /> Metas de qualidade dos lugares</h4>
          <span className="text-[11px] font-bold text-slate-400">{quality.total} lugares</span>
        </div>
        <p className="text-xs text-slate-500 font-medium mb-4">Ficha completa ranqueia melhor e converte mais. A linha escura é a meta.</p>
        <div className="space-y-4">
          {([
            ['description', `Descrição com ${MIN_DESC}+ caracteres`, quality.description],
            ['cover', 'Foto de capa', quality.cover],
            ['address', 'Endereço', quality.address],
            ['phone', 'Telefone ou WhatsApp', quality.phone],
          ] as const).map(([k, label, v]) => (
            <div key={k} data-testid={`seo-goal-${k}`}>
              <div className="flex justify-between text-xs font-bold text-ocean-950 mb-1"><span>{label}</span><span>{Math.round(v)}% <span className="text-slate-400 font-medium">(meta {GOALS[k]}%)</span></span></div>
              <Bar value={v} goal={GOALS[k]} />
            </div>
          ))}
        </div>
        {weak.length > 0 && (
          <div className="mt-5">
            <button onClick={() => setShowList(v => !v)} aria-expanded={showList} className="text-xs font-black text-ocean-600 uppercase">{showList ? 'Esconder' : 'Ver'} as fichas que mais precisam de ajuda</button>
            {showList && (
              <ul className="mt-3 divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden" data-testid="seo-weak-list">
                {weak.map(({ b, miss }) => (
                  <li key={b.id}>
                    <button onClick={() => onNavigate?.('business-detail', { businessId: b.id })} className="w-full text-left px-4 py-2.5 hover:bg-slate-50 flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-ocean-950 truncate">{b.name}</span>
                      <span className="text-[11px] font-bold text-amber-600 shrink-0">falta: {miss.join(', ')}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-5 shadow-sm">
        <h4 className="font-black text-ocean-950 flex items-center gap-2 mb-3"><Search size={18} className="text-ocean-600" aria-hidden /> Ferramentas do Google</h4>
        <div className="grid sm:grid-cols-2 gap-3">
          {tools.map(t => (
            <a key={t.label} href={t.href} target="_blank" rel="noopener noreferrer" className="rounded-2xl border border-slate-100 hover:border-ocean-300 p-4 flex items-start justify-between gap-2 transition-colors">
              <span><span className="block text-sm font-black text-ocean-950">{t.label}</span><span className="block text-xs text-slate-500 font-medium mt-0.5">{t.hint}</span></span>
              <ExternalLink size={14} className="text-slate-400 mt-1 shrink-0" aria-hidden />
            </a>
          ))}
        </div>
      </div>
    </section>
  );
};
