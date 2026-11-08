import React, { useEffect, useState } from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { BlogPost } from '../types';
import { getGuideArticles } from '../services/guideService';
import { MAIN_CATEGORIES } from '../services/discoverLogic';
import { ArticleCard } from './GuideCards';
import { SearchBar, HScroller } from './DiscoverUI';

/** Convite da Home para a tela Descubra: busca rápida, categorias e matérias em destaque. */
export const DiscoverTeaser: React.FC<{ onNavigate: (page: string, params?: any) => void }> = ({ onNavigate }) => {
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    let alive = true;
    getGuideArticles(false).then(a => { if (alive) setArticles(a); }).catch(() => { /* a Home segue sem as matérias */ });
    return () => { alive = false; };
  }, []);

  const shown = (articles.filter(a => a.featured).concat(articles.filter(a => !a.featured))).slice(0, 6);

  return (
    <section className="px-4" aria-label="Descubra a Região dos Lagos" data-testid="discover-teaser">
      <div className="rounded-3xl bg-gradient-to-br from-ocean-600 to-ocean-950 text-white p-5 shadow-md">
        <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200 flex items-center gap-1.5"><Sparkles size={13} /> Descubra</p>
        <h2 className="text-xl font-black mt-1 leading-tight">Lugares, roteiros e dicas de quem conhece a região</h2>
        <SearchBar className="mt-4" value={q} onChange={setQ} onSubmit={v => onNavigate('discover', { q: v })} placeholder="O que você quer encontrar?" />
        <div className="flex gap-2 overflow-x-auto no-scrollbar mt-3 -mx-1 px-1">
          {MAIN_CATEGORIES.slice(0, 6).map(c => (
            <button key={c.id} onClick={() => onNavigate('discover', { cat: c.id })} className="px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap bg-white/15 border border-white/30">{c.label}</button>
          ))}
          <button onClick={() => onNavigate('discover')} className="px-3.5 py-1.5 rounded-full text-xs font-black whitespace-nowrap bg-white text-ocean-950 flex items-center gap-1">Ver tudo <ArrowRight size={12} /></button>
        </div>
      </div>
      {shown.length > 0 && (
        <div className="-mx-4 pt-4"><HScroller label="Matérias do Guia">
          {shown.map(a => <ArticleCard key={a.id} article={a} onOpen={x => onNavigate('guide-article', { slug: x.slug || x.id })} />)}
        </HScroller></div>
      )}
    </section>
  );
};
