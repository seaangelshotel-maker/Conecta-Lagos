import React, { useEffect, useMemo, useState } from 'react';
import { Sparkles, Gem, ArrowRight } from 'lucide-react';
import { CategoryIcon } from '../components/categoryIcons';
import { useHomeConfig } from '../services/homeConfigService';
import { BlogPost, BusinessProfile, Collection, Coupon, HomeHighlight, User } from '../types';
import { SEO } from '../components/SEO';
import { LegalFooter } from '../components/LegalFooter';
import { NewsletterSignup } from '../components/NewsletterSignup';
import { CouponCard } from '../components/CouponCard';
import { CouponModal } from '../components/CouponModal';
import { WhatYouCanDo } from '../components/WhatYouCanDo';
import { InstallAppPrompt } from '../components/InstallAppPrompt';
import { SpecialistReferral } from '../components/SpecialistReferral';
import { SearchBar, HScroller } from '../components/DiscoverUI';
import { FilterSheet, EMPTY_FILTERS, countFilters, type HomeFilters } from '../components/FilterSheet';
import { ArticleCard, BusinessMiniCard } from '../components/GuideCards';
import { LeadCard, CompactCard, openContent } from '../components/FeedCards';
import { PARTNER_DISCLOSURE } from '../services/partnerBanners';
import { getAllBusinesses, getBlogPosts, getCollections, getHomeHighlights, redeemCoupon } from '../services/dataService';
import { getGuideArticles } from '../services/guideService';
import { orderFeedByGeo } from '../services/regionGeo';
import { pickEditorial } from '../services/editorialPick';
import { useRegionLocation } from '../hooks/useRegionLocation';
import { RegionChip } from '../components/RegionChip';
import { EventsShelf } from '../components/EventCards';
import { WalletCard } from '../components/WalletCard';
import { useWallet } from '../services/walletService';
import { countByCategory, filterBusinesses } from '../services/discoverLogic';
import { needNowCounts } from '../services/needNow';
import { NeedNow } from '../components/NeedNow';
import { PartnerBanners } from '../components/PartnerBanners';
import { C } from '../data/guideArticles';
import { openExternal } from '../services/native';
import { useCoupons } from '../hooks/useFirestore';
import { useLanguage } from '../hooks/useLanguage';

interface HomeProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
}

const FLAGS = ['🇧🇷', '🇵🇹', '🇪🇸', '🇺🇸', '🇫🇷'];

const SectionHead: React.FC<{ title: string; subtitle?: string; action?: string; onAction?: () => void; testId?: string }> = ({ title, subtitle, action, onAction, testId }) => (
  <div className="px-4 mb-3 flex items-end justify-between gap-3">
    <div>
      <h2 className="text-xl font-black text-ocean-950 tracking-tight">{title}</h2>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
    {action && <button onClick={onAction} data-testid={testId} className="text-xs font-black text-ocean-600 flex items-center gap-1 shrink-0">{action} <ArrowRight size={13} /></button>}
  </div>
);

/**
 * Home = vitrine do ecossistema: lugares (busca + categorias), banner, cupons, coleções/roteiros e prévia editorial.
 * O conteúdo editorial completo mora no Feed; a lista completa de lugares, em /descubra.
 */
export const Home: React.FC<HomeProps> = ({ currentUser, onNavigate }) => {
  const wallet = useWallet(currentUser?.id);
  const { t, language, setLanguage } = useLanguage();
  const [showFlags, setShowFlags] = useState(false);
  const [q, setQ] = useState('');
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [placesLoading, setPlacesLoading] = useState(true);
  const [cat, setCat] = useState('');
  const [highlights, setHighlights] = useState<HomeHighlight[]>([]);
  const [slide, setSlide] = useState(0);
  const [collections, setCollections] = useState<Collection[]>([]);
  const loc = useRegionLocation();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState<HomeFilters>(EMPTY_FILTERS);
  const currentMuni = loc.municipality?.id ?? null;
  const [guides, setGuides] = useState<BlogPost[]>([]);
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const { coupons } = useCoupons();
  const { config, categories } = useHomeConfig();
  const HOME_PLACES = config.placesPerCategory;

  useEffect(() => {
    let alive = true;
    getAllBusinesses().then(b => { if (alive) setBusinesses(b); }).catch(() => {}).finally(() => alive && setPlacesLoading(false));
    getHomeHighlights().then(h => { if (alive) setHighlights((h || []).filter(x => x.active !== false)); }).catch(() => {});
    getCollections().then(c => { if (alive) setCollections((c || []).filter(x => x.active)); }).catch(() => {});
    getGuideArticles(false).then(g => { if (alive) setGuides(g); }).catch(() => {});
    getBlogPosts().then(p => { if (alive) setPosts(p || []); }).catch(() => {});
    return () => { alive = false; };
  }, []);

  useEffect(() => {
    if (highlights.length < 2) return;
    const id = setInterval(() => setSlide(s => (s + 1) % highlights.length), 5000);
    return () => clearInterval(id);
  }, [highlights.length]);

  const counts = useMemo(() => countByCategory(businesses, categories), [businesses, categories]);
  const places = useMemo(() => (cat ? filterBusinesses(businesses, { categories, categoryId: cat, filterId: 'populares' }) : []), [businesses, categories, cat]);
  const catLabel = categories.find(c => c.id === cat)?.label || '';
  const needNow = useMemo(() => needNowCounts(businesses), [businesses]);

  const uniqueCoupons = useMemo(() => { const s = new Set<string>(); return (coupons || []).filter(c => c?.id && !s.has(c.id) && s.add(c.id)); }, [coupons]);
  const roteiros = useMemo(() => guides.filter(g => (g.collections || []).includes(C.roteiros)), [guides]);

  // Prévia editorial: matéria em destaque + notícias/dicas recentes + outras matérias em destaque.
  // Com município conhecido, o conteúdo daquela cidade e vizinhas sobe na prévia (sem esconder o resto).
  const gGuides = useMemo(() => (currentMuni ? orderFeedByGeo(guides, currentMuni) : guides), [guides, currentMuni]);
  const gPosts = useMemo(() => (currentMuni ? orderFeedByGeo(posts, currentMuni) : posts), [posts, currentMuni]);
  // Destaque grande e subdestaques: o admin escolhe (Painel > Destaques editoriais); sem escolha, automático.
  const { lead, subs: previews } = useMemo(
    () => pickEditorial(guides, posts, gGuides, gPosts, config.editorial),
    [guides, posts, gGuides, gPosts, config.editorial],
  );

  const openHighlight = (h: HomeHighlight) => {
    const link = h.buttonLink || '';
    if (link.startsWith('http')) openExternal(link); else onNavigate(link.replace(/^\//, '') || 'home');
  };
  const handleRedeem = async (coupon: Coupon) => {
    if (!currentUser) { onNavigate('login'); return; }
    return redeemCoupon(currentUser.id, coupon);
  };

  return (
    <div className="bg-slate-50 min-h-screen pb-28 font-sans" data-testid="home">
      <SEO title={t('O Guia Oficial da Região dos Lagos')} description={t('Descubra o melhor da Região dos Lagos com o Lagos GO.')} />

      {/* A. Exploração de lugares */}
      <header className="bg-gradient-to-br from-ocean-600 to-ocean-950 text-white pt-8 pb-7">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex items-start justify-between gap-3">
            <RegionChip loc={loc} compact />
            <div className="relative shrink-0">
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
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200 flex items-center gap-1.5 mt-4"><Sparkles size={13} /> Lagos GO</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1">Região dos Lagos para explorar</h1>
          <p className="text-sm text-white/80 mt-1 max-w-xl">Lugares, experiências, ofertas e o que está acontecendo na região.</p>
          <SearchBar className="mt-5" value={q} onChange={setQ} onSubmit={v => onNavigate('discover', { q: v, ...filters })}
            onFilters={() => setFiltersOpen(true)} filterCount={countFilters(filters)} />
        </div>
      </header>

      <FilterSheet open={filtersOpen} onClose={() => setFiltersOpen(false)} categories={categories}
        value={filters} onChange={setFilters} onApply={() => { setFiltersOpen(false); onNavigate('discover', { q, ...filters }); }} />

      <div className="max-w-5xl mx-auto space-y-10">
        <section aria-label="Categorias" className="pt-5">
          <HScroller label="Categorias">
            {categories.map(c => {
              const on = cat === c.id;
              return (
                <button key={c.id} onClick={() => setCat(cur => (cur === c.id ? '' : c.id))} aria-pressed={on} data-testid={`cat-${c.id}`}
                  className={`flex flex-col items-center justify-start pt-3 gap-1.5 w-[88px] h-[96px] shrink-0 rounded-2xl border text-center ${on ? 'bg-ocean-600 text-white border-ocean-600' : 'bg-white text-ocean-950 border-slate-100'}`}>
                  <CategoryIcon name={c.icon} size={22} />
                  <span className="text-[11px] font-bold leading-tight px-1 min-h-[26px] flex items-center">{c.label}</span>
                  <span className={`text-[10px] font-bold ${on ? 'text-white/80' : 'text-slate-400'}`}>{counts[c.id] ?? 0}</span>
                </button>
              );
            })}
          </HScroller>

          {cat && <div className="px-4 pt-4" data-testid="home-places">
            {placesLoading ? (
              <div className="grid gap-3 md:grid-cols-2">{[0, 1, 2, 3].map(i => <div key={i} className="h-[88px] bg-white rounded-2xl border border-slate-100 animate-pulse" />)}</div>
            ) : places.length === 0 ? (
              <p className="text-sm text-slate-500 bg-white border border-dashed border-slate-300 rounded-2xl p-5 text-center">Ainda não há lugares cadastrados nesta categoria.</p>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-2">
                  {places.slice(0, HOME_PLACES).map(b => <BusinessMiniCard key={b.id} business={b} onOpen={x => onNavigate('business-detail', { businessId: x.id })} />)}
                </div>
                <button onClick={() => onNavigate('discover', { cat })} data-testid="see-all-places"
                  className="mt-3 w-full h-12 rounded-2xl bg-white border border-slate-200 text-sm font-black text-ocean-600 flex items-center justify-center gap-2">
                  Ver todos{places.length > HOME_PLACES ? ` os ${places.length}` : ''} em {catLabel} <ArrowRight size={15} />
                </button>
              </>
            )}
          </div>}
        </section>

        <NeedNow items={needNow} onOpen={id => onNavigate('discover', { n: id })} />

        {/* B. Banner de destaque (restaurado; conteúdo vem do admin) */}
        <section className="px-4" aria-label="Destaques" data-testid="home-banner">
          <div className="relative w-full h-44 sm:h-56 md:h-[320px] rounded-3xl overflow-hidden shadow-sm bg-slate-100">
            {highlights.length > 0 ? highlights.map((h, idx) => (
              <div key={h.id} onClick={() => openHighlight(h)}
                className={`absolute inset-0 transition-opacity duration-700 cursor-pointer ${idx === slide ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'}`}>
                <img src={h.imageUrl} className="w-full h-full object-cover" alt={h.title} />
                <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/30 to-transparent flex flex-col justify-end p-5 md:p-10">
                  <span className={`${h.partner ? 'bg-slate-900/80' : 'bg-red-600'} text-white text-[10px] font-black uppercase px-2 py-1 rounded w-fit mb-2`}>{h.partner ? 'Parceiro' : 'Novo'}</span>
                  <h2 className="text-white text-xl md:text-4xl font-black mb-1 drop-shadow-md leading-tight">{h.title}</h2>
                  <p className="text-slate-200 text-xs md:text-sm font-medium line-clamp-1">{h.description}</p>
                </div>
              </div>
            )) : (
              <div className="w-full h-full bg-red-500 flex items-center p-6 text-white cursor-pointer" onClick={() => onNavigate('search')}>
                <div>
                  <span className="bg-white text-red-600 text-[10px] font-black uppercase px-2 py-1 rounded-full">Desconto</span>
                  <h2 className="text-2xl md:text-4xl font-black mt-2 leading-tight">Festival de Vantagens</h2>
                  <p className="text-sm opacity-90">Atrações com preços especiais</p>
                </div>
              </div>
            )}
            {highlights.length > 1 && (
              <div className="absolute bottom-3 w-full flex justify-center gap-1.5 z-20">
                {highlights.map((_, i) => <button key={i} aria-label={`Banner ${i + 1}`} onClick={() => setSlide(i)} className={`h-1.5 rounded-full transition-all ${i === slide ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`} />)}
              </div>
            )}
          </div>
          {highlights[slide]?.partner && <p className="text-[10px] text-slate-400 mt-1.5 leading-snug" data-testid="highlight-partner-note">{PARTNER_DISCLOSURE}</p>}
        </section>

        {/* B2. Agenda: o que está acontecendo (cidade da pessoa primeiro; a região toda segue à vista) */}
        <EventsShelf muniId={currentMuni} muniName={loc.municipality?.name} onNavigate={onNavigate} />

        <div className="px-4 space-y-4">
          <WhatYouCanDo onNavigate={onNavigate} isLoggedIn={!!currentUser} />
          <InstallAppPrompt />
        </div>

        {/* C. Cupons e ofertas */}
        {(uniqueCoupons.length > 0 || currentUser) && (
          <section aria-label="Cupons e ofertas" data-testid="home-coupons">
            <SectionHead title={t('Cupons e ofertas')} subtitle="Vantagens de estabelecimentos parceiros" action={t('Ver todos')} onAction={() => onNavigate('search')} />
            {currentUser && (
              <div className="px-4 mb-3">
                <WalletCard summary={wallet.summary} loading={wallet.loading} variant="compact" onOpen={() => onNavigate('user-dashboard')} />
              </div>
            )}
            {uniqueCoupons.length > 0 && (
              <HScroller label="Cupons" gap="gap-4">
                {uniqueCoupons.slice(0, 8).map(c => <div key={c.id} className="w-[280px] shrink-0"><CouponCard coupon={c} onGetCoupon={setSelectedCoupon} /></div>)}
              </HScroller>
            )}
          </section>
        )}

        {/* D. Coleções e roteiros */}
        {(collections.length > 0 || roteiros.length > 0) && (
          <section aria-label="Coleções e roteiros" className="space-y-6" data-testid="home-collections">
            {collections.length > 0 && (
              <div>
                <SectionHead title={t('Vale conhecer')} subtitle="Coleções temáticas da região" action={t('Ver todas')} onAction={() => onNavigate('collections')} />
                <HScroller label="Coleções">
                  {collections.map(col => {
                    const bg = col.themeColor || '#1e3a8a'; const op = col.gradientOpacity != null ? col.gradientOpacity : 0.8;
                    return (
                      <button key={col.id} onClick={() => onNavigate('collection-detail', { collectionId: col.id })}
                        className="w-[150px] md:w-[210px] h-[190px] md:h-[250px] rounded-2xl shrink-0 p-3 flex flex-col justify-end text-left relative overflow-hidden shadow-sm active:scale-95 transition-transform">
                        {col.coverImage ? <img src={col.coverImage} className="absolute inset-0 w-full h-full object-cover" alt="" /> : <div className="absolute inset-0" style={{ backgroundColor: bg }} />}
                        <div className="absolute inset-0" style={{ background: `linear-gradient(to bottom, transparent 0%, ${bg} 100%)`, opacity: op }} />
                        <span className="relative text-white font-bold text-sm md:text-lg leading-tight drop-shadow-md">{t(col.title)}</span>
                      </button>
                    );
                  })}
                </HScroller>
              </div>
            )}
            {roteiros.length > 0 && (
              <div>
                <SectionHead title="Roteiros selecionados" subtitle="Para aproveitar melhor a viagem" action="Mais no Feed" onAction={() => onNavigate('blog', { tipo: 'materia' })} />
                <HScroller label="Roteiros">{roteiros.map(a => <ArticleCard key={a.id} article={a} onOpen={x => openContent(x, onNavigate)} />)}</HScroller>
              </div>
            )}
          </section>
        )}

        {/* E. Destaques editoriais e notícias (prévia do Feed) */}
        {lead && (
          <section aria-label="Destaques editoriais" data-testid="home-editorial">
            <SectionHead title="Destaques da região" subtitle="Notícias, matérias e dicas do Feed" action="Ver tudo no Feed" onAction={() => onNavigate('blog')} testId="home-to-feed" />
            <div className="px-4 grid gap-4 lg:grid-cols-5">
              <div className="lg:col-span-3"><LeadCard post={lead} onOpen={p => openContent(p, onNavigate)} /></div>
              <div className="lg:col-span-2 grid gap-3 content-start">
                {previews.map(p => <CompactCard key={p.id} post={p} onOpen={x => openContent(x, onNavigate)} />)}
                <button onClick={() => onNavigate('blog')} className="h-12 rounded-2xl bg-ocean-950 text-white text-sm font-black flex items-center justify-center gap-2">Abrir o Feed <ArrowRight size={15} /></button>
              </div>
            </div>
          </section>
        )}

        <PartnerBanners />

        <div className="px-4"><SpecialistReferral source="home" /></div>
      </div>
      <NewsletterSignup source="home" />
      <LegalFooter onNavigate={onNavigate} />

      {selectedCoupon && (
        <CouponModal coupon={selectedCoupon} onClose={() => setSelectedCoupon(null)} onRedeem={handleRedeem} isRedeemed={false} />
      )}
    </div>
  );
};
