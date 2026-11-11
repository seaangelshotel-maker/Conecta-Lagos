import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, Sparkles, MapPin } from 'lucide-react';
import { CategoryIcon } from '../components/categoryIcons';
import { useHomeConfig } from '../services/homeConfigService';
import { BlogPost, BusinessProfile, City, AppAmenity, DEFAULT_AMENITIES } from '../types';
import { getAllBusinesses, getCities, getAmenities } from '../services/dataService';
import { useLanguage } from '../hooks/useLanguage';
import { getGuideArticles } from '../services/guideService';
import {
  CONTEXT_FILTERS, filterBusinesses, countByCategory, countByAmenity, searchArticles, haversineKm,
} from '../services/discoverLogic';
import { ArticleCard, BusinessMiniCard } from '../components/GuideCards';
import { CollaborationCta } from '../components/RelatedContent';
import { SearchBar, HScroller } from '../components/DiscoverUI';
import { nearbyAdaptive, REGION_MUNICIPALITIES } from '../services/regionGeo';
import { useRegionLocation } from '../hooks/useRegionLocation';


interface Props { onNavigate: (page: string, params?: any) => void; }

const FLAGS = ['🇧🇷', '🇵🇹', '🇪🇸', '🇺🇸', '🇫🇷'];

const readUrl = () => {
  const p = new URLSearchParams(typeof window !== 'undefined' ? window.location.search : '');
  return { cat: p.get('cat') || '', f: p.get('f') || '', q: p.get('q') || '', city: p.get('city') || '', am: (p.get('am') || '').split(',').filter(Boolean) };
};

export const Discover: React.FC<Props> = ({ onNavigate }) => {
  const init = readUrl();
  const { language, setLanguage } = useLanguage();
  const { categories } = useHomeConfig();
  const [showFlags, setShowFlags] = useState(false);
  const [amenityDefs, setAmenityDefs] = useState<AppAmenity[]>(DEFAULT_AMENITIES);
  const [am, setAm] = useState<string[]>(init.am);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [cat, setCat] = useState(init.cat);
  const [flt, setFlt] = useState(init.f);
  const [q, setQ] = useState(init.q);
  const [city, setCity] = useState(init.city);
  const loc = useRegionLocation();
  const where = loc.where;
  const [shown, setShown] = useState(24);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [b, a, c] = await Promise.all([getAllBusinesses(), getGuideArticles(false), getCities()]);
        getAmenities().then(list => { if (alive && list?.length) setAmenityDefs(list); }).catch(() => { /* usa a lista padrão */ });
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
    if (cat) p.set('cat', cat); if (flt) p.set('f', flt); if (q) p.set('q', q); if (city) p.set('city', city); if (am.length) p.set('am', am.join(','));
    const qs = p.toString();
    try { window.history.replaceState({}, '', window.location.pathname + (qs ? `?${qs}` : '')); } catch { /* ignora */ }
  }, [cat, flt, q, city, am]);

  const pickFilter = (id: string) => {
    if (flt === id) { setFlt(''); return; }
    setFlt(id);
  };

  const counts = useMemo(() => countByCategory(businesses, categories), [businesses, categories]);
  const active = !!(cat || flt || q.trim() || am.length);
  const amCounts = useMemo(() => countByAmenity(businesses, amenityDefs), [businesses, amenityDefs]);
  const amList = useMemo(() => [...amenityDefs].sort((a, b) => (amCounts[b.id] || 0) - (amCounts[a.id] || 0)), [amenityDefs, amCounts]);
  const toggleAm = (id: string) => setAm(cur => (cur.includes(id) ? cur.filter(x => x !== id) : [...cur, id]));
  const results = useMemo(() => filterBusinesses(businesses, { categories, categoryId: cat, filterId: flt, cityId: city, query: q, where, amenities: am, amenityDefs }), [businesses, categories, cat, flt, city, q, where, am, amenityDefs]);
  const matchedArticles = useMemo(() => (q.trim() ? searchArticles(articles, q) : []), [articles, q]);
  const filterInfo = CONTEXT_FILTERS.find(f => f.id === flt);

  const openArticle = (a: BlogPost) => onNavigate('guide-article', { slug: a.slug || a.id });
  const openBusiness = (b: BusinessProfile) => onNavigate('business-detail', { businessId: b.id });


  useEffect(() => { setShown(24); }, [cat, flt, q, city, am]);
  const clearAll = () => { setCat(''); setFlt(''); setQ(''); setCity(''); setAm([]); };

  return (
    <div className="bg-slate-50 min-h-screen pb-28 font-sans">
      {/* Cabeçalho + busca */}
      <header className="bg-gradient-to-br from-ocean-600 to-ocean-950 text-white pt-8 pb-7">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-center justify-between">
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200 flex items-center gap-1.5"><Sparkles size={13} /> Lugares</p>
            <div className="relative">
              <button onClick={() => setShowFlags(v => !v)} aria-label="Alterar idioma" aria-expanded={showFlags} data-testid="lang-btn" className="w-9 h-9 rounded-full bg-white/15 border border-white/30 text-lg flex items-center justify-center">{language}</button>
              {showFlags && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowFlags(false)} />
                  <div className="absolute right-0 mt-2 p-1.5 bg-white rounded-xl shadow-xl flex flex-col gap-1 z-50">
                    {FLAGS.filter(f => f !== language).map(f => (
                      <button key={f} onClick={() => { setLanguage(f); setShowFlags(false); }} className="w-10 h-10 flex items-center justify-center text-xl rounded-lg hover:bg-slate-50" aria-label={`Idioma ${f}`}>{f}</button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1">Todos os lugares da região</h1>
          <p className="text-sm text-white/80 mt-1 max-w-xl">Praias, restaurantes, passeios, hospedagens e serviços, com filtros e comodidades.</p>
          <SearchBar className="mt-5" value={q} onChange={setQ} />
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
        <section aria-label="Categorias" className="pt-5">
          <HScroller label="Categorias">
            {categories.map(c => {
              const on = cat === c.id;
              return (
                <button key={c.id} onClick={() => setCat(on ? '' : c.id)} aria-pressed={on} data-testid={`cat-${c.id}`}
                  className={`flex flex-col items-center justify-start pt-3 gap-1.5 w-[88px] h-[96px] shrink-0 rounded-2xl border text-center ${on ? 'bg-ocean-600 text-white border-ocean-600' : 'bg-white text-ocean-950 border-slate-100'}`}>
                  <CategoryIcon name={c.icon} size={22} />
                  <span className="text-[11px] font-bold leading-tight px-1 min-h-[26px] flex items-center">{c.label}</span>
                  <span className={`text-[10px] font-bold ${on ? 'text-white/80' : 'text-slate-400'}`}>{counts[c.id] ?? 0}</span>
                </button>
              );
            })}
          </HScroller>
        </section>

        {/* Filtros contextuais */}
        <section aria-label="Filtros" className="pt-1">
          <HScroller label="Filtros" gap="gap-2">
            {CONTEXT_FILTERS.map(f => (
              <button key={f.id} onClick={() => pickFilter(f.id)} aria-pressed={flt === f.id} data-testid={`flt-${f.id}`}
                className={`px-4 h-9 flex items-center rounded-full text-xs font-bold whitespace-nowrap border ${flt === f.id ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-slate-600 border-slate-200'}`}>{f.label}</button>
            ))}
          </HScroller>
        </section>

        {/* Comodidades */}
        <section aria-label="Comodidades" className="pt-1" data-testid="amenities">
          <p className="px-4 text-[11px] font-black uppercase tracking-wider text-slate-400 mb-1.5">Comodidades</p>
          <HScroller label="Comodidades" gap="gap-2">
            {amList.map(a => {
              const on = am.includes(a.id); const n = amCounts[a.id] || 0;
              return (
                <button key={a.id} onClick={() => toggleAm(a.id)} aria-pressed={on} data-testid={`am-${a.id}`}
                  className={`px-4 h-9 flex items-center gap-1.5 rounded-full text-xs font-bold whitespace-nowrap border ${on ? 'bg-emerald-600 text-white border-emerald-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                  {a.label}<span className={on ? 'text-white/80' : 'text-slate-400'}>{n}</span>
                </button>
              );
            })}
          </HScroller>
        </section>

        {loading && (
          <div className="flex justify-center py-16" role="status" aria-label="Carregando"><Loader2 className="animate-spin text-ocean-600" /></div>
        )}
        {loadError && <p className="px-4 py-10 text-center text-sm text-red-600">{loadError}</p>}

        {/* Resultados */}
        {!loading && !loadError && (
          <section className="px-4 pt-4 space-y-5" aria-label="Resultados">
            <div className="flex items-center justify-between">
              <h2 className="font-black text-ocean-950 text-lg" data-testid="results-count">{results.length} {results.length === 1 ? 'lugar' : 'lugares'}</h2>
              {active && <button onClick={clearAll} className="text-xs font-bold text-ocean-600">Limpar tudo</button>}
            </div>
            {filterInfo && <p className="text-xs text-slate-500 -mt-3">{filterInfo.hint}</p>}

            {flt === 'perto' && !where ? (
              <div className="bg-white border border-slate-200 rounded-3xl p-6 space-y-4" data-testid="location-panel">
                <div className="flex items-start gap-3">
                  <MapPin className="text-ocean-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-black text-ocean-950">{loc.outside ? 'Você está fora da Região dos Lagos' : 'Ver o que está perto de você'}</p>
                    <p className="text-sm text-slate-500 mt-1">{loc.outside
                      ? 'Por isso mostramos os destaques gerais da região. Escolha uma cidade para ver o que há por lá ou veja tudo.'
                      : 'Usamos sua localização só para mostrar lugares e matérias próximos. Ela fica apenas neste aparelho, durante a visita, e não guardamos seu trajeto.'}</p>
                  </div>
                </div>
                {loc.outside
                  ? <button onClick={() => setFlt('')} data-testid="see-all" className="w-full h-12 rounded-2xl bg-ocean-600 text-white text-sm font-black">Ver toda a região</button>
                  : <button onClick={loc.request} disabled={loc.status === 'asking'} data-testid="use-location" className="w-full h-12 rounded-2xl bg-ocean-600 text-white text-sm font-black disabled:opacity-60">
                      {loc.status === 'asking' ? 'Buscando sua localização…' : 'Usar minha localização'}
                    </button>}
                {loc.error && <p className="text-xs text-amber-700 font-bold" role="status">{loc.error}</p>}
                <div>
                  <label htmlFor="manual-city" className="block text-xs font-bold text-slate-500 mb-1">Ou escolha sua cidade</label>
                  <select id="manual-city" defaultValue="" onChange={e => e.target.value && loc.choose(e.target.value)} className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-3 text-sm font-semibold text-ocean-950">
                    <option value="" disabled>Selecione…</option>
                    <option value="geral">Toda a Região dos Lagos</option>
                    {REGION_MUNICIPALITIES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                  </select>
                </div>
              </div>
            ) : results.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-8 text-center" data-testid="empty-state">
                <MapPin className="mx-auto text-slate-300 mb-2" />
                <p className="font-black text-ocean-950">Nada por aqui ainda</p>
                <p className="text-sm text-slate-500 mt-1">
                  {flt === 'perto' && !where ? 'Libere a localização para ver o que está perto de você.'
                    : flt && ['gratuito', 'familias', 'casais', 'criancas', 'chuva', 'imperdivel', 'aventura'].includes(flt) ? 'Ainda não há lugares marcados com este perfil. A curadoria é feita pela equipe da Lagos GO.'
                    : am.length && !flt ? 'Nenhum lugar cadastrou esta comodidade neste recorte ainda. As empresas marcam as comodidades no próprio perfil.'
                    : flt === 'melhores' ? 'Ainda não há avaliações aprovadas para este recorte.'
                    : flt === 'perto' ? 'Nenhum lugar com coordenadas cadastradas neste recorte.'
                    : 'Tente outra busca ou remova um filtro.'}
                </p>
                <button onClick={clearAll} className="mt-4 text-xs font-black text-white bg-ocean-600 rounded-full px-5 py-2.5">Ver tudo</button>
              </div>
            ) : (
              <div>
              {flt === 'perto' && where && (() => {
                const near = nearbyAdaptive(results, where);
                const place = loc.municipality ? loc.municipality.name : 'fora da Região dos Lagos';
                return (
                  <p className="text-xs font-bold text-ocean-700 mb-3 flex items-center gap-1" data-testid="nearby-summary">
                    <MapPin size={14} /> Você está em {place} · lugares em até {near.radiusKm} km{near.exhausted ? ' (poucos por aqui)' : ''}
                  </p>
                );
              })()}
              <div className="grid gap-3 md:grid-cols-2">
                {results.slice(0, shown).map(b => (
                  <BusinessMiniCard key={b.id} business={b} onOpen={openBusiness}
                    distanceKm={flt === 'perto' && where && typeof b.lat === 'number' ? haversineKm(where, { lat: b.lat!, lng: b.lng! }) : undefined} />
                ))}
              </div>
              </div>
            )}
            {results.length > shown && <button onClick={() => setShown(n => n + 24)} data-testid="places-more" className="w-full h-12 rounded-2xl bg-white border border-slate-200 text-sm font-black text-ocean-600">Mostrar mais ({results.length - shown} restantes)</button>}

            {matchedArticles.length > 0 && (
              <div className="-mx-4">
                <h2 className="px-4 font-black text-ocean-950 text-lg mb-3">Matérias sobre "{q}"</h2>
                <HScroller label="Matérias encontradas">{matchedArticles.map(a => <ArticleCard key={a.id} article={a} onOpen={openArticle} />)}</HScroller>
              </div>
            )}
          </section>
        )}

        {!loading && !loadError && <div className="pt-8"><CollaborationCta onNavigate={onNavigate} /></div>}
      </div>
    </div>
  );
};
