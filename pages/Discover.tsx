import React, { useEffect, useMemo, useState } from 'react';
import { Search, Waves, Utensils, Ship, Compass, BedDouble, Wine, Mountain, Landmark, Briefcase, Store, X, Loader2, Sparkles, MapPin } from 'lucide-react';
import { BlogPost, BusinessProfile, City } from '../types';
import { getAllBusinesses, getCities } from '../services/dataService';
import { getGuideArticles } from '../services/guideService';
import { COLLECTION_ORDER } from '../data/guideArticles';
import {
  MAIN_CATEGORIES, CONTEXT_FILTERS, filterBusinesses, countByCategory, searchArticles, haversineKm,
} from '../services/discoverLogic';
import { ArticleCard, BusinessMiniCard } from '../components/GuideCards';

const ICONS: Record<string, any> = { Waves, Utensils, Ship, Compass, BedDouble, Wine, Mountain, Landmark, Briefcase, Store };

interface Props { onNavigate: (page: string, params?: any) => void; }

const readUrl = () => {
  const p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  return { cat: p.get('cat') || '', f: p.get('f') || '', q: p.get('q') || '', city: p.get('city') || '' };
};

export const Discover: React.FC<Props> = ({ onNavigate }) => {
  const init = readUrl();
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [cat, setCat] = useState(init.cat);
  const [flt, setFlt] = useState(init.f);
  const [q, setQ] = useState(init.q);
  const [city, setCity] = useState(init.city);
  const [where, setWhere] = useState<{ lat: number; lng: number } | null>(null);
  const [geoMsg, setGeoMsg] = useState('');

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [b, a, c] = await Promise.all([getAllBusinesses(), getGuideArticles(false), getCities()]);
        if (!alive) return;
        setBusinesses(b); setArticles(a); setCities(c.filter((x: City) => x.active !== false));
      } catch (e: any) {
        if (alive) setLoadError('Não foi possível carregar agora. Tente novamente em instantes.');
      } finally { if (alive) setLoading(false); }
    })();
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    const p = new URLSearchParams();
    if (cat) p.set('cat', cat); if (flt) p.set('f', flt); if (q) p.set('q', q); if (city) p.set('city', city);
    const qs = p.toString();
    try { window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : '')); } catch { /* ignora */ }
  }, [cat, flt, q, city]);

  const pickFilter = (id: string) => {
    if (flt === id) { setFlt(''); return; }
    setFlt(id);
    if (id === 'perto' && !where) {
      if (!navigator.geolocation) { setGeoMsg('Seu navegador não permite localização.'); return; }
      setGeoMsg('Buscando sua localização…');
      navigator.geolocation.getCurrentPosition(
        pos => { setWhere({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGeoMsg(''); },
        () => setGeoMsg('Não conseguimos sua localização. Libere a permissão no navegador e tente de novo.'),
        { timeout: 8000 });
    }
  };

  const counts = useMemo(() => countByCategory(businesses), [businesses]);
  const active = !!(cat || flt || q.trim());
  const results = useMemo(() => filterBusinesses(businesses, { categoryId: cat, filterId: flt, cityId: city, query: q, where }), [businesses, cat, flt, city, q, where]);
  const matchedArticles = useMemo(() => (q.trim() ? searchArticles(articles, q) : []), [articles, q]);
  const filterInfo = CONTEXT_FILTERS.find(f => f.id === flt);

  const openArticle = (a: BlogPost) => onNavigate('guide-article', { slug: a.slug || a.id });
  const openBusiness = (b: BusinessProfile) => onNavigate('business-detail', { businessId: b.id });

  const byCollection = useMemo(() => COLLECTION_ORDER
    .map(name => ({ name, items: articles.filter(a => (a.collections || []).includes(name)) }))
    .filter(s => s.items.length > 0), [articles]);
  const featured = articles.filter(a => a.featured);
  const popular = articles.filter(a => a.popular);
  const recent = [...articles].sort((a, b) => (b.date || '').localeCompare(a.date || '')).slice(0, 6);

  const clearAll = () => { setCat(''); setFlt(''); setQ(''); setCity(''); };

  return (
    <div className="bg-slate-50 min-h-screen pb-28 font-sans">
      {/* Cabeçalho + busca */}
      <header className="bg-gradient-to-br from-ocean-600 to-ocean-950 text-white px-4 pt-8 pb-7">
        <div className="max-w-5xl mx-auto">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200 flex items-center gap-1.5"><Sparkles size={13} /> Descubra</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1">Região dos Lagos para explorar</h1>
          <p className="text-sm text-white/80 mt-1 max-w-xl">Encontre lugares, planeje roteiros e descubra dicas de quem conhece a região.</p>
          <label className="mt-5 flex items-center gap-3 bg-white rounded-2xl px-4 py-3 shadow-lg">
            <Search size={18} className="text-slate-400" />
            <input
              value={q} onChange={e => setQ(e.target.value)} type="search" aria-label="Buscar lugares, experiências e matérias"
              placeholder="Buscar praias, restaurantes, roteiros…"
              className="flex-1 bg-transparent outline-none text-slate-800 text-sm placeholder:text-slate-400" />
            {q && <button onClick={() => setQ('')} aria-label="Limpar busca" className="text-slate-400"><X size={16} /></button>}
          </label>
          {cities.length > 1 && (
            <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar" role="group" aria-label="Cidade">
              {[{ id: '', name: 'Toda a região' }, ...cities].map(c => (
                <button key={c.id || 'all'} onClick={() => setCity(c.id)}
                  aria-pressed={city === c.id}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border ${city === c.id ? 'bg-white text-ocean-950 border-white' : 'bg-white/10 text-white border-white/30'}`}>{c.name}</button>
              ))}
            </div>
          )}
        </div>
      </header>

      <div className="max-w-5xl mx-auto">
        {/* Categorias */}
        <section aria-label="Categorias" className="px-4 pt-5">
          <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
            {MAIN_CATEGORIES.map(c => {
              const Icon = ICONS[c.icon] || Compass; const on = cat === c.id;
              return (
                <button key={c.id} onClick={() => setCat(on ? '' : c.id)} aria-pressed={on} data-testid={`cat-${c.id}`}
                  className={`flex flex-col items-center gap-1.5 w-[84px] shrink-0 py-3 rounded-2xl border text-center ${on ? 'bg-ocean-600 text-white border-ocean-600' : 'bg-white text-ocean-950 border-slate-100'}`}>
                  <Icon size={22} />
                  <span className="text-[11px] font-bold leading-tight px-1">{c.label}</span>
                  <span className={`text-[10px] font-bold ${on ? 'text-white/80' : 'text-slate-400'}`}>{counts[c.id] ?? 0}</span>
                </button>
              );
            })}
          </div>
        </section>

        {/* Filtros contextuais */}
        <section aria-label="Filtros" className="px-4 pt-2">
          <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
            {CONTEXT_FILTERS.map(f => (
              <button key={f.id} onClick={() => pickFilter(f.id)} aria-pressed={flt === f.id} data-testid={`flt-${f.id}`}
                className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap border ${flt === f.id ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-200'}`}>{f.label}</button>
            ))}
          </div>
          {geoMsg && <p className="text-xs text-amber-700 font-bold mt-1" role="status">{geoMsg}</p>}
        </section>

        {loading && (
          <div className="flex justify-center py-16" role="status" aria-label="Carregando"><Loader2 className="animate-spin text-ocean-600" /></div>
        )}
        {loadError && <p className="px-4 py-10 text-center text-sm text-red-600">{loadError}</p>}

        {/* Resultados */}
        {!loading && !loadError && active && (
          <section className="px-4 pt-4 space-y-5" aria-label="Resultados">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-ocean-950 text-lg" data-testid="results-count">{results.length} {results.length === 1 ? 'lugar' : 'lugares'}</h2>
              <button onClick={clearAll} className="text-xs font-bold text-ocean-600">Limpar tudo</button>
            </div>
            {filterInfo && <p className="text-xs text-slate-500 -mt-3">{filterInfo.hint}</p>}

            {results.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-8 text-center" data-testid="empty-state">
                <MapPin className="mx-auto text-slate-300 mb-2" />
                <p className="font-black text-ocean-950">Nada por aqui ainda</p>
                <p className="text-sm text-slate-500 mt-1">
                  {flt === 'perto' && !where ? 'Libere a localização para ver o que está perto de você.'
                    : flt && ['gratuito', 'familias', 'casais', 'criancas', 'chuva', 'imperdivel', 'aventura'].includes(flt) ? 'Ainda não há lugares marcados com este perfil. A curadoria é feita pela equipe da Lagos GO.'
                    : flt === 'melhores' ? 'Ainda não há avaliações aprovadas para este recorte.'
                    : flt === 'perto' ? 'Nenhum lugar com coordenadas cadastradas neste recorte.'
                    : 'Tente outra busca ou remova um filtro.'}
                </p>
                <button onClick={clearAll} className="mt-4 text-xs font-black text-white bg-ocean-600 rounded-full px-5 py-2.5">Ver tudo</button>
              </div>
            ) : (
              <div className="grid gap-3 md:grid-cols-2">
                {results.slice(0, 60).map(b => (
                  <BusinessMiniCard key={b.id} business={b} onOpen={openBusiness}
                    distanceKm={flt === 'perto' && where && typeof b.lat === 'number' ? haversineKm(where, { lat: b.lat!, lng: b.lng! }) : undefined} />
                ))}
              </div>
            )}

            {matchedArticles.length > 0 && (
              <div>
                <h2 className="font-black text-ocean-950 text-lg mb-3">Matérias sobre "{q}"</h2>
                <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">{matchedArticles.map(a => <ArticleCard key={a.id} article={a} onOpen={openArticle} />)}</div>
              </div>
            )}
          </section>
        )}

        {/* Navegação editorial */}
        {!loading && !loadError && !active && (
          <div className="pt-6 space-y-9" data-testid="editorial">
            {articles.length === 0 && (
              <p className="px-4 text-sm text-slate-500" data-testid="no-articles">As matérias do Guia ainda não foram publicadas. Volte em breve!</p>
            )}
            {featured.length > 0 && (
              <Row title="Destaques" subtitle="Para começar" items={featured} onOpen={openArticle} />
            )}
            {popular.length > 0 && (
              <Row title="Leituras populares" subtitle="As mais procuradas pelos visitantes" items={popular} onOpen={openArticle} />
            )}
            {byCollection.map(s => <Row key={s.name} title={s.name} items={s.items} onOpen={openArticle} />)}
            {recent.length > 0 && <Row title="Recentes" subtitle="Últimas matérias publicadas" items={recent} onOpen={openArticle} />}
          </div>
        )}
      </div>
    </div>
  );
};

const Row: React.FC<{ title: string; subtitle?: string; items: BlogPost[]; onOpen: (a: BlogPost) => void }> = ({ title, subtitle, items, onOpen }) => (
  <section aria-label={title}>
    <div className="px-4 mb-3">
      <h2 className="text-xl font-black text-ocean-950 tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
    <div className="flex gap-3 overflow-x-auto no-scrollbar px-4 pb-2">
      {items.map(a => <ArticleCard key={a.id} article={a} onOpen={onOpen} />)}
    </div>
  </section>
);
