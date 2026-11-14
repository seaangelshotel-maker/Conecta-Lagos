import React, { useState, useEffect, useMemo } from 'react';
import { Collection } from '../types';
import { getCollections } from '../services/dataService';
import { Layers, ArrowRight, Search, MapPin, Sparkles } from 'lucide-react';
import { SEO } from '../components/SEO';

interface CollectionsProps {
  onNavigate: (page: string, params?: any) => void;
}

const FALLBACK_COLOR = '#0A2242';

/** Gradiente do cartão: usa a cor do tema da coleção (definida no admin) e a opacidade escolhida. */
const overlay = (c: Collection) => {
  const hex = /^#[0-9a-f]{6}$/i.test(c.themeColor || '') ? (c.themeColor as string) : FALLBACK_COLOR;
  const a = Math.min(1, Math.max(0.35, c.gradientOpacity ?? 0.85));
  const alpha = Math.round(a * 255).toString(16).padStart(2, '0');
  return `linear-gradient(to top, ${hex}${alpha} 0%, ${hex}66 45%, transparent 100%)`;
};

const places = (n: number) => `${n} ${n === 1 ? 'lugar' : 'lugares'}`;

const Skeleton: React.FC = () => (
  <div className="space-y-4" aria-hidden="true">
    <div className="h-64 rounded-3xl bg-slate-200 animate-pulse" />
    <div className="grid grid-cols-2 gap-3">
      {[0, 1, 2, 3].map(i => <div key={i} className="aspect-[4/5] rounded-2xl bg-slate-200 animate-pulse" />)}
    </div>
  </div>
);

export const Collections: React.FC<CollectionsProps> = ({ onNavigate }) => {
  const [collections, setCollections] = useState<Collection[] | null>(null);
  const [query, setQuery] = useState('');

  useEffect(() => {
    let alive = true;
    getCollections()
      .then(data => {
        if (!alive) return;
        const unique = data
          .filter(c => c && c.id && c.active !== false)
          .filter((c, i, self) => self.findIndex(x => x.id === c.id) === i)
          .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
        setCollections(unique);
      })
      .catch(() => alive && setCollections([]));
    return () => { alive = false; };
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!collections) return [];
    return q ? collections.filter(c => `${c.title} ${c.description}`.toLowerCase().includes(q)) : collections;
  }, [collections, query]);

  const open = (c: Collection) => onNavigate('collection-detail', { collectionId: c.id });
  const [featured, ...rest] = list;
  const totalPlaces = (collections || []).reduce((n, c) => n + (c.businessIds?.length || 0), 0);

  return (
    <div className="pb-28 min-h-screen bg-slate-50" data-testid="collections-page">
      <SEO title="Coleções" description="Coleções temáticas de lugares e experiências na Região dos Lagos." url="/collections" />

      <header className="bg-gradient-to-br from-ocean-600 to-ocean-950 text-white px-4 pt-6 pb-8 rounded-b-[2rem]">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-2 text-ocean-100 text-[11px] font-black uppercase tracking-widest">
            <Layers size={14} /> Curadoria Lagos GO
          </div>
          <h1 className="mt-2 text-3xl font-black tracking-tight">Coleções</h1>
          <p className="mt-1 text-sm text-white/75">Listas prontas para decidir rápido: o melhor de cada momento na região.</p>
          {collections && collections.length > 0 && (
            <p className="mt-3 inline-flex items-center gap-2 text-xs font-bold bg-white/15 rounded-full px-3 py-1">
              <Sparkles size={12} /> {collections.length} coleções · {places(totalPlaces)}
            </p>
          )}
          <label className="mt-5 flex items-center gap-2 bg-white rounded-2xl px-4 h-12 shadow-lg">
            <Search size={18} className="text-slate-400 shrink-0" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Buscar coleção (ex.: noite, praia, casal)"
              aria-label="Buscar coleção"
              data-testid="collections-search"
              style={{ outline: 'none', boxShadow: 'none' }}
              className="flex-1 min-w-0 bg-transparent border-0 focus:ring-0 text-sm text-ocean-950 placeholder:text-slate-400"
            />
          </label>
        </div>
      </header>

      <div className="max-w-5xl mx-auto px-4 -mt-1 pt-6">
        {collections === null && <Skeleton />}

        {collections !== null && list.length === 0 && (
          <div className="text-center py-16 bg-white rounded-3xl border-2 border-dashed border-slate-200" data-testid="collections-empty">
            <Layers size={36} className="mx-auto text-slate-300" />
            <p className="mt-3 font-black text-ocean-950">{query ? 'Nenhuma coleção encontrada' : 'Novas coleções em breve'}</p>
            <p className="text-sm text-slate-500 mt-1">{query ? 'Tente outra palavra.' : 'Estamos preparando listas especiais para você.'}</p>
            {query && <button onClick={() => setQuery('')} className="mt-4 text-xs font-black text-ocean-600 uppercase">Limpar busca</button>}
          </div>
        )}

        {featured && (
          <button
            onClick={() => open(featured)}
            data-testid="collection-featured"
            className="group relative block w-full text-left rounded-3xl overflow-hidden shadow-lg h-72 md:h-96 active:scale-[0.99] transition-transform animate-in fade-in slide-in-from-bottom-2 duration-500"
          >
            <img src={featured.coverImage} alt="" loading="eager" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0" style={{ background: overlay(featured) }} />
            <span className="absolute top-4 left-4 bg-amber-400 text-ocean-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full">Destaque</span>
            <div className="absolute bottom-0 left-0 right-0 p-5 text-white">
              <h2 className="text-2xl md:text-4xl font-black leading-tight drop-shadow">{featured.title}</h2>
              <p className="mt-1 text-sm text-white/85 line-clamp-2 max-w-xl">{featured.description}</p>
              <div className="mt-4 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-white/20 backdrop-blur-md rounded-full px-3 py-1.5"><MapPin size={12} /> {places(featured.businessIds?.length || 0)}</span>
                <span className="inline-flex items-center gap-1.5 text-sm font-black bg-white text-ocean-700 rounded-full pl-4 pr-3 py-2">Ver lugares <ArrowRight size={16} /></span>
              </div>
            </div>
          </button>
        )}

        {rest.length > 0 && (
          <>
            <h2 className="mt-8 mb-3 text-[11px] font-black uppercase tracking-widest text-slate-400">Mais coleções</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-5">
              {rest.map((c, i) => (
                <button
                  key={c.id}
                  onClick={() => open(c)}
                  data-testid="collection-card"
                  style={{ animationDelay: `${Math.min(i, 8) * 60}ms` }}
                  className="group relative text-left rounded-2xl overflow-hidden shadow-md aspect-[4/5] active:scale-[0.97] transition-transform animate-in fade-in slide-in-from-bottom-2 duration-500 fill-mode-both"
                >
                  <img src={c.coverImage} alt="" loading="lazy" className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                  <div className="absolute inset-0" style={{ background: overlay(c) }} />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white">
                    <h3 className="text-base font-black leading-tight line-clamp-2 drop-shadow">{c.title}</h3>
                    <div className="mt-2 flex items-center justify-between">
                      <span className="text-[11px] font-bold bg-white/20 backdrop-blur-md rounded-full px-2 py-0.5">{places(c.businessIds?.length || 0)}</span>
                      <span className="w-7 h-7 rounded-full bg-white text-ocean-700 flex items-center justify-center"><ArrowRight size={14} /></span>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};
