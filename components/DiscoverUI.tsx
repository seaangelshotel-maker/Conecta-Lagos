import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Search, X, Loader2, RefreshCw } from 'lucide-react';
import { BlogPost } from '../types';
import { fetchFeedPage, diversify, FEED_PAGE_SIZE } from '../services/feedService';
import { ArticleCard } from './GuideCards';
import type { QueryDocumentSnapshot, DocumentData } from 'firebase/firestore';

/** Busca única do produto: campo + botão no mesmo conjunto (usada na Home e no Descubra). */
export const SearchBar: React.FC<{
  value: string; onChange: (v: string) => void; onSubmit?: (v: string) => void; placeholder?: string; className?: string;
}> = ({ value, onChange, onSubmit, placeholder = 'Buscar lugares e matérias', className = '' }) => (
  <form role="search" onSubmit={e => { e.preventDefault(); onSubmit?.(value.trim()); }}
    className={`flex items-center bg-white rounded-2xl shadow-lg pl-4 pr-1.5 h-14 gap-2 ${className}`}>
    <Search size={18} className="text-slate-400 shrink-0" aria-hidden />
    <input value={value} onChange={e => onChange(e.target.value)} aria-label="Buscar lugares, experiências e matérias" placeholder={placeholder}
      enterKeyHint="search" className="flex-1 min-w-0 bg-transparent outline-none text-slate-800 text-[15px] placeholder:text-slate-400" />
    {value && <button type="button" onClick={() => { onChange(''); onSubmit?.(''); }} aria-label="Limpar busca" className="w-8 h-8 flex items-center justify-center text-slate-400 shrink-0"><X size={16} /></button>}
    <button type="submit" aria-label="Buscar" className="h-11 px-5 rounded-xl bg-ocean-600 text-white text-sm font-black shrink-0 active:scale-95 transition-transform">Buscar</button>
  </form>
);

/** Carrossel horizontal padrão: mesma margem, mesmo respiro e encaixe suave em todo o app. */
export const HScroller: React.FC<{ children: React.ReactNode; label?: string; gap?: string }> = ({ children, label, gap = 'gap-3' }) => (
  <div role="group" aria-label={label} className={`flex ${gap} overflow-x-auto no-scrollbar px-4 pb-2 snap-x snap-proximity scroll-px-4 [&>*]:snap-start`}>{children}</div>
);

/** Feed editorial com rolagem infinita: carrega por páginas, sem repetir e com tratamento de erro. */
export const EditorialFeed: React.FC<{ onOpen: (a: BlogPost) => void; title?: string }> = ({ onOpen, title = 'Continue descobrindo' }) => {
  const [items, setItems] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const cursor = useRef<QueryDocumentSnapshot<DocumentData> | null>(null);
  const seen = useRef(new Set<string>());
  const busy = useRef(false);
  const sentinel = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (busy.current || done) return;
    busy.current = true; setLoading(true); setError('');
    try {
      const page = await fetchFeedPage(cursor.current, FEED_PAGE_SIZE);
      cursor.current = page.cursor;
      const fresh = page.items.filter(p => !seen.current.has(p.id));
      fresh.forEach(p => seen.current.add(p.id));
      setItems(prev => [...prev, ...diversify(fresh, prev[prev.length - 1]?.category)]);
      if (page.done) setDone(true);
    } catch {
      setError('Não foi possível carregar mais conteúdos.');
    } finally { busy.current = false; setLoading(false); }
  }, [done]);

  useEffect(() => { loadMore(); /* primeira página */ // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || done || error) return;
    if (typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(es => { if (es[0].isIntersecting) loadMore(); }, { rootMargin: '400px 0px' });
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, done, error, items.length]);

  if (!items.length && done) return null;

  return (
    <section aria-label={title} className="px-4" data-testid="editorial-feed">
      <h2 className="text-xl font-black text-ocean-950 tracking-tight mb-3">{title}</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3" data-testid="feed-items">
        {items.map(a => <ArticleCard key={a.id} article={a} onOpen={onOpen} wide />)}
      </div>
      <div ref={sentinel} className="h-8" aria-hidden />
      {loading && <div className="flex justify-center py-6" role="status" aria-label="Carregando mais"><Loader2 className="animate-spin text-ocean-600" /></div>}
      {error && (
        <div className="text-center py-4" data-testid="feed-error">
          <p className="text-sm text-slate-500 mb-2">{error}</p>
          <button onClick={loadMore} className="inline-flex items-center gap-2 text-sm font-black text-ocean-600"><RefreshCw size={14} /> Tentar de novo</button>
        </div>
      )}
      {done && items.length > 0 && <p className="text-center text-xs text-slate-400 py-4" data-testid="feed-end">Você viu tudo por enquanto. Volte logo: tem conteúdo novo chegando.</p>}
    </section>
  );
};
