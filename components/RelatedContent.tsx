import React, { useEffect, useState } from 'react';
import { HandHeart, Ticket, ArrowRight } from 'lucide-react';
import { BlogPost, BusinessProfile, Coupon } from '../types';
import { getGuideArticles } from '../services/guideService';
import { resolveRelated } from '../services/discoverLogic';
import { ArticleCard } from './GuideCards';
import { HScroller } from './DiscoverUI';

type Nav = (page: string, params?: any) => void;

/** Ligação com a Ajuda Colaborativa: pessoas e empresas publicando necessidades e serviços. */
export const CollaborationCta: React.FC<{ onNavigate: Nav }> = ({ onNavigate }) => (
  <section className="px-4" aria-label="Ajuda Colaborativa" data-testid="collab-cta">
    <button onClick={() => onNavigate('opportunities')} className="w-full text-left bg-white border border-slate-100 rounded-3xl shadow-sm p-5 flex items-center gap-4 active:scale-[0.99] transition-transform">
      <span className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0"><HandHeart size={24} /></span>
      <span className="flex-1 min-w-0">
        <span className="block font-black text-ocean-950">Precisa de ajuda ou quer oferecer um serviço?</span>
        <span className="block text-xs text-slate-500 mt-0.5">Na Ajuda Colaborativa, moradores e empresas publicam trabalhos pontuais, vagas e parcerias.</span>
      </span>
      <ArrowRight size={18} className="text-slate-400 shrink-0" />
    </button>
  </section>
);

/** Cupons de lugares citados na matéria. */
export const ArticleCoupons: React.FC<{ coupons: Coupon[]; onNavigate: Nav }> = ({ coupons, onNavigate }) => {
  if (!coupons.length) return null;
  return (
    <section className="mt-8" aria-label="Cupons" data-testid="article-coupons">
      <h2 className="text-xl font-black text-ocean-950 mb-3">Cupons de lugares desta matéria</h2>
      <div className="grid gap-3 md:grid-cols-2">
        {coupons.slice(0, 4).map(c => (
          <button key={c.id} onClick={() => onNavigate('search', { query: c.companyName })}
            className="text-left bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <span className="w-11 h-11 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0"><Ticket size={20} /></span>
            <span className="min-w-0">
              <span className="block font-black text-sm text-ocean-950 line-clamp-1">{c.title}</span>
              <span className="block text-xs text-slate-500">{c.companyName}{c.discountPercentage ? ` · ${c.discountPercentage}% off` : ''}</span>
            </span>
          </button>
        ))}
      </div>
    </section>
  );
};

/** No perfil de um lugar: matérias do Guia que falam dele (relação calculada, nunca cadastrada à mão). */
export const BusinessArticles: React.FC<{ business: BusinessProfile; onNavigate: Nav }> = ({ business, onNavigate }) => {
  const [items, setItems] = useState<BlogPost[]>([]);
  useEffect(() => {
    let alive = true;
    getGuideArticles(false).then(list => {
      if (alive) setItems(list.filter(a => resolveRelated(a.related, [business]).length > 0).slice(0, 6));
    }).catch(() => { /* o perfil segue sem as matérias */ });
    return () => { alive = false; };
  }, [business.id]);
  if (!items.length) return null;
  return (
    <section className="-mx-4" aria-label="Matérias sobre este lugar" data-testid="business-articles">
      <h3 className="px-4 text-xl font-black text-ocean-950 mb-3">Para ler antes de ir</h3>
      <HScroller label="Matérias">{items.map(a => <ArticleCard key={a.id} article={a} onOpen={x => onNavigate('guide-article', { slug: x.slug || x.id })} />)}</HScroller>
    </section>
  );
};
