import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Clock, Loader2, MapPin, BookOpen, Share2 } from 'lucide-react';
import { shareContent } from '../services/native';
import { BlogPost, BusinessProfile, Coupon } from '../types';
import { getAllBusinesses, getCoupons } from '../services/dataService';
import { getGuideArticles } from '../services/guideService';
import { resolveRelated, discoverCategoryFor, couponsForBusinesses } from '../services/discoverLogic';
import { ArticleCoupons, CollaborationCta } from '../components/RelatedContent';
import { SEO } from '../components/SEO';
import { ArticleCard, BusinessMiniCard, GuideContent, gradientFor } from '../components/GuideCards';

interface Props { slug: string; onNavigate: (page: string, params?: any) => void; }

export const GuideArticle: React.FC<Props> = ({ slug, onNavigate }) => {
  const [articles, setArticles] = useState<BlogPost[]>([]);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [a, b] = await Promise.all([getGuideArticles(false), getAllBusinesses()]);
        if (alive) { setArticles(a); setBusinesses(b); }
        getCoupons().then(c => { if (alive) setCoupons(c); }).catch(() => { /* sem cupons: a seção some */ });
      } finally { if (alive) setLoading(false); }
    })();
    window.scrollTo?.(0, 0);
    return () => { alive = false; };
  }, [slug]);

  const idx = articles.findIndex(a => a.slug === slug || a.id === slug);
  const article = idx >= 0 ? articles[idx] : null;
  const related = useMemo(() => (article ? resolveRelated(article.related, businesses) : []), [article, businesses]);
  const relatedCoupons = useMemo(() => couponsForBusinesses(coupons, related), [coupons, related]);
  const exploreCat = useMemo(() => discoverCategoryFor(related), [related]);
  const relatedArticles = useMemo(() => {
    if (!article) return [];
    const bySlug = (article.relatedSlugs || []).map(s => articles.find(a => a.slug === s)).filter(Boolean) as BlogPost[];
    return bySlug.length ? bySlug : articles.filter(a => a.id !== article.id && (a.collections || []).some(c => (article.collections || []).includes(c))).slice(0, 4);
  }, [article, articles]);

  const [shareMsg, setShareMsg] = useState('');
  const share = async () => {
    if (!article) return;
    const r = await shareContent({ title: article.title, text: article.excerpt, url: `${window.location.origin}/guia/${article.slug}` });
    setShareMsg(r === 'copied' ? 'Link copiado!' : r === 'failed' ? 'Não foi possível compartilhar.' : '');
    if (r === 'copied' || r === 'failed') setTimeout(() => setShareMsg(''), 2500);
  };

  const open = (a: BlogPost) => onNavigate('guide-article', { slug: a.slug || a.id });

  if (loading) return <div className="min-h-screen flex items-center justify-center" role="status" aria-label="Carregando"><Loader2 className="animate-spin text-ocean-600" /></div>;

  if (!article) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center text-center px-6 gap-3" data-testid="article-missing">
        <BookOpen className="text-slate-300" size={40} />
        <h1 className="font-black text-ocean-950 text-xl">Matéria não encontrada</h1>
        <p className="text-sm text-slate-500">Ela pode ter sido despublicada ou o endereço mudou.</p>
        <button onClick={() => onNavigate('blog')} className="mt-2 bg-ocean-600 text-white font-black rounded-full px-6 py-3 text-sm">Ver outras matérias</button>
      </div>
    );
  }

  const prev = idx > 0 ? articles[idx - 1] : null;
  const next = idx < articles.length - 1 ? articles[idx + 1] : null;
  const shown = showAll ? related : related.slice(0, 6);

  return (
    <div className="bg-slate-50 min-h-screen pb-28 font-sans">
      <SEO title={article.metaTitle || article.title} description={article.metaDescription || article.excerpt} image={article.imageUrl} type="article" url={`/guia/${article.slug}`} />

      <header className={`relative bg-gradient-to-br ${gradientFor(article.slug || article.id)} text-white px-4 pt-6 pb-10 overflow-hidden`}>
        {article.imageUrl && <img src={article.imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" referrerPolicy="no-referrer" />}
        <div className="absolute -right-10 -bottom-12 w-56 h-56 rounded-full bg-white/10" />
        <div className="relative max-w-3xl mx-auto">
          <button onClick={() => onNavigate('blog')} className="flex items-center gap-1.5 text-xs font-bold bg-white/20 rounded-full px-3 py-1.5" aria-label="Voltar para o Feed">
            <ArrowLeft size={14} /> Feed
          </button>
          <button onClick={share} aria-label="Compartilhar matéria" data-testid="share" className="absolute right-0 top-0 flex items-center gap-1.5 text-xs font-bold bg-white/20 rounded-full px-3 py-1.5">
            <Share2 size={14} /> Compartilhar
          </button>
          {shareMsg && <p role="status" className="absolute right-0 top-10 text-[11px] font-bold bg-white text-ocean-950 rounded-full px-3 py-1" data-testid="share-msg">{shareMsg}</p>}
          <p className="mt-6 text-[11px] font-black uppercase tracking-[0.2em] text-white/80">{article.category}</p>
          <h1 className="text-3xl md:text-4xl font-black leading-tight tracking-tight mt-1" data-testid="article-title">{article.title}</h1>
          {article.subtitle && <p className="text-base text-white/90 mt-2">{article.subtitle}</p>}
          <div className="flex items-center gap-4 mt-4 text-xs font-bold text-white/80">
            <span className="flex items-center gap-1.5"><Clock size={13} /> {article.readingMinutes || 3} min de leitura</span>
            <span>{article.author}</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 -mt-5 relative">
        <article className="bg-white rounded-3xl shadow-sm border border-slate-100 px-5 md:px-9 py-7">
          <p className="text-lg font-bold text-ocean-950 leading-relaxed">{article.excerpt}</p>
          <GuideContent text={article.content} />
          {article.tags && article.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-8 pt-6 border-t border-slate-100">
              {article.tags.map(t => <span key={t} className="text-[11px] font-bold text-ocean-600 bg-ocean-50 rounded-full px-3 py-1">#{t}</span>)}
            </div>
          )}
        </article>

        {/* Ligação com o Guia */}
        {article.related && (
          <section className="mt-8" aria-label="No Guia" data-testid="related-businesses">
            <h2 className="text-xl font-black text-ocean-950 mb-1">{article.related.label || 'Explorar no Guia'}</h2>
            <p className="text-xs text-slate-500 mb-3">Só aparece o que está cadastrado na Lagos GO.</p>
            {related.length === 0 ? (
              <div className="bg-white border border-dashed border-slate-300 rounded-2xl p-6 text-center text-sm text-slate-500" data-testid="related-empty">
                Ainda não há cadastros ligados a este tema. <button onClick={() => onNavigate('guide')} className="font-black text-ocean-600">Abrir o Guia</button>
              </div>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-2">{shown.map(b => <BusinessMiniCard key={b.id} business={b} onOpen={x => onNavigate('business-detail', { businessId: x.id })} />)}</div>
                {exploreCat && (
                  <button onClick={() => onNavigate('discover', { cat: exploreCat.id })} data-testid="explore-more" className="mt-3 text-sm font-black text-ocean-600 flex items-center gap-1.5">Ver todos em {exploreCat.label} <ArrowRight size={14} /></button>
                )}
                {related.length > 6 && !showAll && (
                  <button onClick={() => setShowAll(true)} className="mt-3 text-sm font-black text-ocean-600 flex items-center gap-1.5"><MapPin size={14} /> Ver todos os {related.length}</button>
                )}
              </>
            )}
          </section>
        )}

        <ArticleCoupons coupons={relatedCoupons} onNavigate={onNavigate} />

        <div className="mt-9 -mx-4"><CollaborationCta onNavigate={onNavigate} /></div>

        {relatedArticles.length > 0 && (
          <section className="mt-9" aria-label="Matérias relacionadas">
            <h2 className="text-xl font-black text-ocean-950 mb-3">Continue explorando</h2>
            <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">{relatedArticles.map(a => <ArticleCard key={a.id} article={a} onOpen={open} />)}</div>
          </section>
        )}

        <nav className="mt-8 grid grid-cols-2 gap-3" aria-label="Navegar entre matérias">
          {prev ? (
            <button onClick={() => open(prev)} className="text-left bg-white rounded-2xl border border-slate-100 p-4 active:scale-[0.98]">
              <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1"><ArrowLeft size={11} /> Anterior</span>
              <span className="block text-sm font-black text-ocean-950 mt-1 line-clamp-3">{prev.title}</span>
            </button>
          ) : <span />}
          {next ? (
            <button onClick={() => open(next)} className="text-right bg-white rounded-2xl border border-slate-100 p-4 active:scale-[0.98]">
              <span className="text-[10px] font-black uppercase text-slate-400 flex items-center gap-1 justify-end">Próxima <ArrowRight size={11} /></span>
              <span className="block text-sm font-black text-ocean-950 mt-1 line-clamp-3">{next.title}</span>
            </button>
          ) : <span />}
        </nav>
      </main>
    </div>
  );
};
