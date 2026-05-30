import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, ChevronRight, Gem, ArrowRight, Star, Ticket, Loader2, Compass, Utensils, Sparkles, Newspaper, Lightbulb, Layers, Flame } from 'lucide-react';
import { Coupon, User, AppCategory, BusinessProfile, BlogPost, Collection, HomeHighlight } from '../types';
import { SEO } from '../components/SEO';
import { CouponCard } from '../components/CouponCard';
import { CouponModal } from '../components/CouponModal';
import { redeemCoupon, getBlogPosts, getCollections, getHomeHighlights, identifyNeighborhood, checkIfOpen } from '../services/dataService';
import { useBusinesses, useCoupons, useAppCategories } from '../hooks/useFirestore';

interface HomeProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
}

const SkeletonCard = () => (
    <div className="w-72 flex-shrink-0 h-48 bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm animate-pulse flex gap-4 p-3">
        <div className="w-24 h-24 bg-slate-200 rounded-lg"></div>
        <div className="flex-1 space-y-3 py-2">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            <div className="pt-4 h-6 bg-slate-200 rounded w-16"></div>
        </div>
    </div>
);

const SkeletonList = () => (
    <div className="flex gap-4 overflow-hidden py-2 px-4">
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
    </div>
);

export const Home: React.FC<HomeProps> = ({ currentUser, onNavigate }) => {
  const { coupons: swrCoupons, isLoading: couponsLoading } = useCoupons();
  const { businesses: swrBusinesses, isLoading: businessesLoading } = useBusinesses();
  const { categories: swrCategories, isLoading: categoriesLoading } = useAppCategories();
  
  const [highlights, setHighlights] = useState<HomeHighlight[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationName, setLocationName] = useState("Região dos Lagos");
  
  const [currentLang, setCurrentLang] = useState('🇧🇷');
  const [showLanguages, setShowLanguages] = useState(false);
  const languages = ['🇧🇷', '🇵🇹', '🇪🇸', '🇺🇸', '🇫🇷'];

  const [activeFilter, setActiveFilter] = useState('Tudo');
  const [visibleCount, setVisibleCount] = useState(6);
  const [loadingMoreHome, setLoadingMoreHome] = useState(false);
  const homeLoaderRef = React.useRef<HTMLDivElement | null>(null);

  // Deduplicate helper to prevent React key warning (e.g., local_1765502020338)
  const getUniqueById = <T extends { id: string }>(items: T[]): T[] => {
    const seen = new Set<string>();
    return items.filter(item => {
      if (!item || !item.id) return false;
      const key = String(item.id);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  };

  const uniqueCoupons = getUniqueById(swrCoupons);
  const uniqueBusinesses = getUniqueById(swrBusinesses);
  const uniqueCategories = getUniqueById(swrCategories);
  const uniqueHighlights = getUniqueById(highlights);
  const uniqueCollections = getUniqueById(collections);

  const filteredBusinessesForFeed = React.useMemo(() => {
    const list = [...uniqueBusinesses];
    if (activeFilter === 'Tudo') return list;
    
    const tag = activeFilter.toLowerCase();
    if (tag === 'lanches') {
      return list.filter(b => 
        (b.category || '').toLowerCase().includes('gastro') || 
        (b.subcategory || '').toLowerCase().includes('lanche') || 
        (b.name || '').toLowerCase().includes('burger') || 
        (b.name || '').toLowerCase().includes('lanche') ||
        (b.description || '').toLowerCase().includes('lanche')
      );
    }
    if (tag === 'passeios') {
      return list.filter(b => 
        (b.category || '').toLowerCase().includes('passeio') || 
        (b.subcategory || '').toLowerCase().includes('passeio') ||
        (b.description || '').toLowerCase().includes('passeio')
      );
    }
    if (tag === 'açaí') {
      return list.filter(b => 
        (b.name || '').toLowerCase().includes('açaí') || 
        (b.name || '').toLowerCase().includes('acai') || 
        (b.description || '').toLowerCase().includes('açaí')
      );
    }
    if (tag === 'mariscos') {
      return list.filter(b => 
        (b.name || '').toLowerCase().includes('marisco') || 
        (b.name || '').toLowerCase().includes('camarão') || 
        (b.name || '').toLowerCase().includes('peixe') || 
        (b.description || '').toLowerCase().includes('camarão') || 
        (b.description || '').toLowerCase().includes('marisco')
      );
    }
    return list;
  }, [uniqueBusinesses, activeFilter]);

  useEffect(() => {
    setVisibleCount(6);
  }, [activeFilter]);

  useEffect(() => {
    if (visibleCount >= filteredBusinessesForFeed.length) return;
    
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setLoadingMoreHome(true);
        setTimeout(() => {
          setVisibleCount(prev => Math.min(prev + 6, filteredBusinessesForFeed.length));
          setLoadingMoreHome(false);
         }, 400);
      }
    }, { threshold: 0.1 });

    const currentLoader = homeLoaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [visibleCount, filteredBusinessesForFeed, homeLoaderRef]);

  const fetchData = async () => {
      try {
          const highData = await getHomeHighlights();
          const collData = await getCollections();
          const postsData = await getBlogPosts();
          setHighlights(highData);
          setCollections(collData.filter(c => c.active));
          setBlogPosts(postsData || []);
      } catch (e) {
          console.error("Failed to load home data", e);
      } finally {
          setLoading(false);
      }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('dataUpdated', fetchData);
    const timeout = setTimeout(() => setLoading(false), 8000);

    const storedGps = sessionStorage.getItem('user_gps');
    if (storedGps) {
        const { lat, lng } = JSON.parse(storedGps);
        const area = identifyNeighborhood(lat, lng);
        setLocationName(area);
    } else {
        activateGPS(true);
    }

    return () => {
        window.removeEventListener('dataUpdated', fetchData);
        clearTimeout(timeout);
    }
  }, []);

  useEffect(() => {
    if (uniqueHighlights.length > 1) {
        const interval = setInterval(() => {
            setCurrentHighlightIndex(prev => (prev + 1) % uniqueHighlights.length);
        }, 5000);
        return () => clearInterval(interval);
    }
  }, [highlights]);

  const handleRedeem = async (coupon: Coupon) => {
    if (!currentUser) {
      onNavigate('login');
      return;
    }
    return await redeemCoupon(currentUser.id, coupon);
  };

  const handleCardClick = (coupon: Coupon) => {
      setSelectedCoupon(coupon);
  };

  const activateGPS = (silent = false) => {
      if (!silent) setGpsLoading(true);
      if (!navigator.geolocation) {
          if (!silent) setGpsLoading(false);
          return;
      }
      navigator.geolocation.getCurrentPosition(
          (pos) => {
              if (!silent) setGpsLoading(false);
              const lat = pos.coords.latitude;
              const lng = pos.coords.longitude;
              const areaName = identifyNeighborhood(lat, lng);
              setLocationName(areaName);
              sessionStorage.setItem('user_gps', JSON.stringify({ lat, lng }));
          },
          (err) => {
              if (!silent) setGpsLoading(false);
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
  }

  const isDataLoading = loading || couponsLoading || businessesLoading || categoriesLoading;

  return (
    <div className="pb-28 bg-[#f7f7f7] min-h-screen font-sans">
      <SEO 
        title="O Guia Oficial da Região dos Lagos" 
        description="Descubra o melhor da Região dos Lagos com o Konecta Lagos."
      />
      
      {/* HEADER (iFood Style - Clean & Vibrant) */}
      <div className="sticky top-0 md:top-16 z-30 bg-white border-b border-slate-100 shadow-sm transition-all duration-300">
         <div className="flex justify-between items-center px-4 py-3 max-w-7xl mx-auto w-full">
             
             {/* Location Area - iFood similar but with Konecta touch */}
             <div 
                onClick={() => activateGPS(false)}
                className="flex items-center gap-1.5 cursor-pointer active:scale-95 transition-transform group"
             >
                <div className="bg-red-50 p-1.5 rounded-full group-hover:bg-red-100 transition-colors text-red-500">
                   <MapPin size={16} className="fill-current" />
                </div>
                <div className="flex flex-col justify-center">
                    <span className="text-[10px] uppercase font-black text-slate-400 leading-tight tracking-wider">Entregar ou Explorar em</span>
                    <div className="flex items-center gap-1">
                        <span className="font-bold text-sm text-slate-900 leading-tight">{locationName}</span>
                        <ChevronDown size={14} className="text-red-500 font-bold" />
                    </div>
                </div>
                {gpsLoading && <div className="w-2 h-2 rounded-full border-2 border-red-500 border-t-transparent animate-spin ml-2"/>}
             </div>
             
             {/* Language Selector */}
             <div className="relative">
                 <button 
                     onClick={() => setShowLanguages(!showLanguages)}
                     className="flex items-center justify-center w-9 h-9 bg-slate-50 border border-slate-100 rounded-lg text-lg hover:bg-slate-100 transition-colors active:scale-95 z-50 relative"
                     title="Alterar Idioma"
                 >
                     {currentLang}
                 </button>
                 
                 {showLanguages && (
                     <>
                         <div 
                             className="fixed inset-0 z-40" 
                             onClick={() => setShowLanguages(false)} 
                         ></div>
                         <div className="absolute right-0 mt-2 p-1.5 bg-white border border-slate-100 shadow-xl rounded-xl flex flex-col gap-1 z-50 animate-in fade-in slide-in-from-top-2">
                             {languages.filter(l => l !== currentLang).map((flag) => (
                                 <button 
                                    key={flag} 
                                    onClick={() => {
                                        setCurrentLang(flag);
                                        setShowLanguages(false);
                                    }}
                                    className="w-10 h-10 flex items-center justify-center text-xl rounded-lg hover:bg-slate-50 transition-colors active:scale-95"
                                 >
                                     {flag}
                                 </button>
                             ))}
                         </div>
                     </>
                 )}
             </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto pt-4 relative z-10 space-y-8">
        
        {/* CARTEIRA DE ECONOMIA (Delicate & Discrete) */}
        {currentUser && (
            <div className="px-4">
              <div className="bg-white border border-emerald-100 p-3 rounded-2xl flex items-center justify-between shadow-2xs hover:shadow-xs transition-shadow">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600 shrink-0">
                     <Gem size={16} className="fill-emerald-50 text-emerald-600" />
                  </div>
                  <div>
                    <span className="text-[10px] text-emerald-700 font-extrabold uppercase tracking-widest block leading-none mb-0.5">Minha Carteira de Economia</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {currentUser.savedAmount && currentUser.savedAmount > 0 
                        ? 'Veja o quanto você já poupou usando nossos cupons!' 
                        : 'Ative cupons grátis e comece a economizar!'}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end shrink-0 pl-2">
                   <div className="text-[9px] text-slate-400 font-extrabold uppercase tracking-wider leading-none">Total Economizado</div>
                   <div className="text-base font-black text-emerald-600 font-sans leading-tight mt-0.5">R$ {(currentUser.savedAmount || 0).toFixed(2)}</div>
                </div>
              </div>
            </div>
        )}

        {/* CAROUSEL / BANNERS */}
        <div className="px-4">
            <div className="relative w-full h-40 sm:h-52 md:h-[350px] rounded-2xl overflow-hidden shadow-sm bg-slate-100">
                {uniqueHighlights.length > 0 ? (
                    uniqueHighlights.map((h, idx) => (
                        <div 
                            key={h.id}
                            className={`absolute inset-0 transition-opacity duration-700 ease-in-out cursor-pointer ${idx === currentHighlightIndex ? 'opacity-100' : 'opacity-0 z-0'}`}
                            onClick={() => {
                                if (h.buttonLink.startsWith('http')) window.open(h.buttonLink, '_blank');
                                else onNavigate(h.buttonLink.replace('/', ''));
                            }}
                        >
                            <img src={h.imageUrl} className="w-full h-full object-cover" alt={h.title} />
                            {/* Make it vibrant gradient for iFood vibe */}
                            <div className="absolute inset-0 bg-gradient-to-tr from-black/80 via-black/30 to-transparent flex flex-col justify-end p-4 md:p-10">
                                <span className="bg-red-600 text-white text-[10px] font-black uppercase px-2 py-1 rounded w-fit mb-2">Novo</span>
                                <h2 className="text-white text-xl md:text-4xl font-black mb-1 drop-shadow-md leading-tight">{h.title}</h2>
                                <p className="text-slate-200 text-xs md:text-sm font-medium line-clamp-1">{h.description}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="w-full h-full bg-red-500 flex items-center justify-center p-6 text-white cursor-pointer" onClick={() => onNavigate('search')}>
                        <div className="text-left w-full h-full relative">
                            <span className="bg-white text-red-600 text-[10px] font-black uppercase px-2 py-1 rounded-full w-fit mb-2">Desconto</span>
                            <h2 className="text-2xl md:text-4xl font-black mb-1 leading-tight tracking-tight mt-2 w-2/3">Festival de Vantagens</h2>
                            <p className="text-sm font-medium opacity-90 max-w-[60%]">Atrações com preços especiais</p>
                        </div>
                    </div>
                )}
                
                {uniqueHighlights.length > 1 && (
                    <div className="absolute bottom-3 right-0 w-full flex justify-center gap-1.5 z-20">
                        {uniqueHighlights.map((_, idx) => (
                            <button 
                                key={idx}
                                onClick={() => setCurrentHighlightIndex(idx)}
                                className={`h-1.5 rounded-full transition-all ${idx === currentHighlightIndex ? 'bg-white w-4' : 'bg-white/50 w-1.5'}`}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>

        {/* CATEGORIES GRID (Round Icons) */}
        <div>
            {isDataLoading ? (
                <div className="flex gap-4 overflow-hidden px-4">
                    {[1,2,3,4,5,6].map(i => <div key={i} className="w-16 h-20 bg-slate-200 rounded-lg animate-pulse shrink-0"></div>)}
                </div>
            ) : (
                <div className="grid grid-flow-col auto-cols-max gap-3 md:gap-6 overflow-x-auto px-4 pb-2 hide-scrollbar">
                    {uniqueCategories.map(cat => {
                        // Dummy emojis for visual proxy of realistic icons
                        let emoji = '🗺️';
                        const n = cat.name.toLowerCase();
                        if (n.includes('gastro') || n.includes('restaurante') || n.includes('comida')) emoji = '🍔';
                        if (n.includes('hospedagem') || n.includes('hotel') || n.includes('pousada')) emoji = '🛌';
                        if (n.includes('passeio') || n.includes('barco') || n.includes('ilha')) emoji = '⛵';
                        if (n.includes('serviço') || n.includes('delivery')) emoji = '🛵';
                        if (n.includes('praia')) emoji = '⛱️';
                        if (n.includes('festa') || n.includes('evento')) emoji = '🎉';
                        
                        return (
                           <div key={cat.id} className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer group shrink-0" onClick={() => onNavigate('guide', { category: cat.name })} >
                                <div className="w-[72px] h-[72px] rounded-2xl bg-white shadow-sm border border-slate-100 flex flex-col items-center justify-center text-red-500 overflow-hidden relative active:scale-95 transition-transform group-hover:bg-slate-50">
                                   <div className="text-3xl relative z-10 drop-shadow-sm">{emoji}</div>
                                </div>
                                <span className="text-[11px] font-semibold text-slate-700 text-center leading-tight line-clamp-2 md:text-xs group-hover:text-red-500">{cat.name}</span>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>

        {/* DICAS & NOTÍCIAS LOCAIS (Premium Feed Section) */}
        {blogPosts.length > 0 && (
            <div className="px-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-slate-900 font-extrabold text-lg px-0.5 tracking-tight flex items-center gap-1.5">
                       <Newspaper size={18} className="text-red-500" /> Dicas e Notícias Locais
                    </h3>
                    <button 
                        className="text-[13px] font-black text-red-500 hover:text-red-700 active:scale-95 transition-transform" 
                        onClick={() => onNavigate('blog')}
                    >
                        Ver feed completo
                    </button>
                </div>
                
                {/* Scrollable grid matching the mobile/desktop layout of modern city feeds */}
                <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                    {blogPosts.slice(0, 4).map(post => {
                        const getCategoryIcon = (catName: string, size = 11) => {
                            const c = catName.toLowerCase();
                            if (c.includes('roteiro')) return <Compass size={size} />;
                            if (c.includes('gastro')) return <Utensils size={size} />;
                            if (c.includes('evento')) return <Sparkles size={size} />;
                            if (c.includes('notícia')) return <Newspaper size={size} />;
                            if (c.includes('dica')) return <Lightbulb size={size} />;
                            return <Layers size={size} />;
                        };
                        return (
                            <div 
                                key={post.id}
                                onClick={() => onNavigate('blog-detail', { postId: post.id })}
                                className="w-[190px] md:w-[280px] h-[250px] md:h-[320px] rounded-[1.8rem] flex-shrink-0 p-4 flex flex-col justify-between cursor-pointer relative overflow-hidden shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all active:scale-98 bg-slate-900 group"
                            >
                                {/* Cover Image */}
                                <img 
                                    src={post.imageUrl} 
                                    referrerPolicy="no-referrer"
                                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                                    alt={post.title} 
                                />
                                
                                {/* Gradient Tinted Dark Overlay */}
                                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
                                
                                {/* Top tag */}
                                <span className="absolute top-3.5 left-3.5 bg-white/95 text-slate-800 text-[10px] font-black px-2.5 py-1 rounded-xl uppercase tracking-wider shadow-sm z-10 flex items-center gap-1">
                                   <span className="text-red-500">{getCategoryIcon(post.category, 11)}</span>
                                   <span>{post.category}</span>
                                </span>
                                
                                {/* Bottom contents */}
                                <div className="mt-auto relative z-10">
                                    <div className="flex flex-wrap items-center gap-1.5 text-amber-300 text-[9px] font-bold mb-1 font-mono uppercase">
                                       <span>⏱️ 5 MIN READ</span>
                                       <span className="w-1 h-1 bg-amber-300 rounded-full"></span>
                                       <span>{post.date}</span>
                                       <span className="w-1 h-1 bg-amber-300 rounded-full"></span>
                                       <span className="text-orange-400 font-extrabold flex items-center gap-0.5">⚡ {(() => {
                                          const realList = post.connectedUsers || [];
                                          const baseSeedCount = Math.abs((post.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 25) + 12;
                                          return realList.length > 0 ? (baseSeedCount + realList.length) : baseSeedCount;
                                       })()} KONECTADOS</span>
                                    </div>
                                    <h4 className="text-white font-extrabold text-sm md:text-base leading-snug drop-shadow-sm group-hover:text-amber-200 transition-colors line-clamp-2">
                                       {post.title}
                                    </h4>
                                    <p className="text-slate-300 text-[10px] md:text-xs font-medium mt-1 leading-none">
                                       Por {post.author}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        )}

        {/* BIG CARDS / HITS (Vale conhecer - Collections) */}
        {uniqueCollections.length > 0 && (
            <div className="px-4">
                <div className="flex justify-between items-center mb-3">
                    <h3 className="text-slate-900 font-bold text-lg px-0.5 tracking-tight">Vale conhecer</h3>
                    <button className="text-[13px] font-bold text-red-500 hover:text-red-700 active:scale-95 transition-transform" onClick={() => onNavigate('collections')}>Ver todas</button>
                </div>
                <div className="grid grid-flow-col auto-cols-max overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                    {uniqueCollections.map(collection => {
                        // Apply custom theme or fall back to gradient
                        const bgColor = collection.themeColor || '#1e3a8a'; // default blue
                        const bgOp = collection.gradientOpacity != null ? collection.gradientOpacity : 0.8;
                        
                        return (
                            <div 
                                key={collection.id}
                                className="w-[140px] md:w-[220px] h-[180px] md:h-[260px] rounded-2xl flex-shrink-0 p-3 flex flex-col justify-between cursor-pointer relative overflow-hidden shadow-sm active:scale-95 transition-transform" 
                                onClick={() => onNavigate('collection-detail', { collectionId: collection.id })}
                            >
                                {/* Background Image */}
                                {collection.coverImage ? (
                                    <img src={collection.coverImage} className="absolute inset-0 w-full h-full object-cover" alt={collection.title} />
                                ) : (
                                    <div className="absolute inset-0" style={{ backgroundColor: bgColor }}></div>
                                )}
                                
                                {/* Gradient Overlay */}
                                <div 
                                    className="absolute inset-0"
                                    style={{
                                        background: `linear-gradient(to bottom, transparent 0%, ${bgColor} 100%)`, 
                                        opacity: bgOp 
                                    }}
                                ></div>
                                
                                {/* Alternative semi-transparent solid overlay for readability over the whole image */}
                                <div className="absolute inset-0" style={{ backgroundColor: bgColor, opacity: bgOp * 0.3 }}></div>

                                <span className="text-white font-bold text-sm md:text-lg leading-tight md:max-w-32 z-10 drop-shadow-md">{collection.title}</span>
                            </div>
                        )
                    })}
                </div>
            </div>
        )}

        {/* HORIZONTAL COUPONS (Promotions) */}
        {uniqueCoupons.length > 0 && (
            <div>
                <div className="flex justify-between items-center mb-3 px-4">
                    <h3 className="text-slate-900 text-lg font-bold tracking-tight">Melhores Cupons</h3>
                    <button className="text-[13px] font-bold text-red-500 hover:text-red-700 active:scale-95 transition-transform" onClick={() => onNavigate('search')}>Ver todos</button>
                </div>
                <div className="flex overflow-x-auto hide-scrollbar gap-4 -mx-4 px-4 pb-4 md:mx-0 md:px-0 md:grid md:grid-cols-4">
                    {uniqueCoupons.slice(0, 5).map(coupon => (
                        <div key={coupon.id} className="w-[280px] md:w-full flex-shrink-0">
                            <CouponCard coupon={coupon} onGetCoupon={handleCardClick} />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* LIST - Recomendados para você */}
        <div>
            <div className="flex justify-between items-center mb-3 px-4">
                <h3 className="text-slate-900 font-bold text-lg tracking-tight">Recomendados para você</h3>
                <button className="text-[13px] font-bold text-red-500 hover:text-red-700 active:scale-95 transition-transform" onClick={() => onNavigate('guide')}>Ver todos</button>
            </div>
            
            {/* Quick Filters */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4 mb-4">
                {['Tudo', 'Lanches', 'Passeios', 'Açaí', 'Mariscos'].map(tag => (
                   <div 
                      key={tag} 
                      onClick={() => setActiveFilter(tag)}
                      className={`border px-4 py-1.5 rounded-full text-sm font-semibold whitespace-nowrap shadow-sm hover:border-slate-300 cursor-pointer active:scale-95 transition-all text-center ${activeFilter === tag ? 'bg-red-500 text-white border-red-500 animate-pulse' : 'bg-white text-slate-700 border-slate-200'}`}
                   >
                       {tag}
                   </div> 
                ))}
            </div>

            {isDataLoading ? (
                <div className="px-4 space-y-4">
                    <div className="h-24 bg-slate-200 rounded-xl animate-pulse"></div>
                    <div className="h-24 bg-slate-200 rounded-xl animate-pulse"></div>
                </div>
            ) : filteredBusinessesForFeed.length > 0 ? (
                <div className="flex flex-col px-4 gap-0.5">
                    {filteredBusinessesForFeed.slice(0, visibleCount).map(biz => {
                        const isOpen = checkIfOpen(biz.openingHours, biz.category);
                        const bizCoupons = uniqueCoupons.filter(c => c.companyId === biz.id);
                        
                        return (
                            <div 
                                key={biz.id} 
                                onClick={() => onNavigate('business-detail', { businessId: biz.id })}
                                className="bg-white p-3 rounded-lg flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 items-center group relative overflow-hidden animate-in fade-in"
                            >
                                <img src={biz.coverImage} className="w-[72px] h-[72px] min-w-[72px] rounded-lg object-cover bg-slate-100 border border-slate-100" />
                                
                                <div className="flex-1 overflow-hidden py-1">
                                    <h4 className="font-semibold px-0 text-slate-800 text-[15px] truncate flex items-center gap-1.5 leading-tight mb-1">
                                        {biz.name}
                                        {bizCoupons.length > 0 && <Ticket size={12} className="text-red-500 fill-red-100" />}
                                    </h4>
                                    
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate mb-1">
                                        <div className="flex items-center gap-0.5 text-gold-500">
                                            <Star size={11} className="fill-gold-500" />
                                            <span className="font-bold">{biz.rating}</span>
                                        </div>
                                        <span className="text-slate-300">•</span>
                                        <span className="truncate">{biz.category}</span>
                                        <span className="text-slate-300">•</span>
                                        <span className={`${isOpen ? 'text-green-600' : 'text-slate-400'}`}>
                                            {isOpen ? 'Aberto' : 'Fechado'}
                                        </span>
                                    </div>
                                    
                                    <div className="flex items-center gap-3 text-xs">
                                        <div className="text-slate-500">1.8 km</div>
                                        {bizCoupons.length > 0 && (
                                            <div className="flex items-center gap-1 bg-red-50 text-red-600 px-1.5 py-0.5 rounded font-bold">
                                                <Ticket size={10} /> Cupom
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <div className="text-center py-12 text-slate-400 font-medium text-sm">
                    Nenhum estabelecimento encontrado nesta categoria.
                </div>
            )}

            {visibleCount < filteredBusinessesForFeed.length && (
                <div ref={homeLoaderRef} className="flex flex-col items-center justify-center py-8 text-slate-400 font-semibold text-xs gap-2">
                    <Loader2 className="animate-spin text-red-500" size={24} />
                    <span>Carregando mais estabelecimentos...</span>
                </div>
            )}
            
            {visibleCount >= filteredBusinessesForFeed.length && filteredBusinessesForFeed.length > 0 && (
                <div className="text-center py-8 text-slate-400 font-bold text-xs">
                    Você chegou ao fim dos recomendados.
                </div>
            )}
        </div>

      </div>

      {selectedCoupon && (
          <CouponModal 
            coupon={selectedCoupon} 
            onClose={() => setSelectedCoupon(null)} 
            onRedeem={handleRedeem}
            isRedeemed={false}
          />
      )}
    </div>
  );
};
