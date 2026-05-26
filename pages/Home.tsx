
import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, ChevronRight, Gem, ArrowRight, Loader2, Utensils, Bed, Anchor, ShoppingBag, Star, Calendar, Map, Layers, Ticket } from 'lucide-react';
import { Coupon, User, AppCategory, BusinessProfile, BlogPost, Collection, FeaturedConfig, HomeHighlight } from '../types';
import { SEO } from '../components/SEO';
import { CouponCard } from '../components/CouponCard';
import { CouponModal } from '../components/CouponModal';
import { getCoupons, redeemCoupon, getCategories, getBusinesses, getBlogPosts, getCollections, getFeaturedConfig, identifyNeighborhood, checkIfOpen, getHomeHighlights } from '../services/dataService';
import { useBusinesses, useCoupons, useAppCategories } from '../hooks/useFirestore';

interface HomeProps {
  currentUser: User | null;
  onNavigate: (page: string, params?: any) => void;
}

// --- SKELETONS PARA LOADING ---
const SkeletonCard = () => (
    <div className="w-72 flex-shrink-0 h-80 bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm animate-pulse">
        <div className="h-40 bg-slate-200 w-full"></div>
        <div className="p-4 space-y-3">
            <div className="h-4 bg-slate-200 rounded w-3/4"></div>
            <div className="h-3 bg-slate-200 rounded w-1/2"></div>
            <div className="pt-4 flex justify-between items-center">
                <div className="h-6 bg-slate-200 rounded w-16"></div>
                <div className="h-6 bg-slate-200 rounded w-10"></div>
            </div>
        </div>
    </div>
);

const SkeletonList = () => (
    <div className="flex gap-4 overflow-hidden py-2">
        <SkeletonCard /><SkeletonCard /><SkeletonCard />
    </div>
);

export const Home: React.FC<HomeProps> = ({ currentUser, onNavigate }) => {
  const { coupons: swrCoupons, isLoading: couponsLoading } = useCoupons();
  const { businesses: swrBusinesses, isLoading: businessesLoading } = useBusinesses();
  const { categories: swrCategories, isLoading: categoriesLoading } = useAppCategories();
  
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [highlights, setHighlights] = useState<HomeHighlight[]>([]);
  const [currentHighlightIndex, setCurrentHighlightIndex] = useState(0);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  
  // Start loading if no data in memory
  const [loading, setLoading] = useState(true);
  const [isActuallyLoading, setIsActuallyLoading] = useState(true);

  // GPS State
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationName, setLocationName] = useState("Região dos Lagos");

  const fetchData = async () => {
      try {
          const [postData, colData, highData] = await Promise.all([
              getBlogPosts(),
              getCollections(),
              getHomeHighlights()
          ]);
          
          setPosts(postData);
          setCollections(colData || []);
          setHighlights(highData);
      } catch (e) {
          console.error("Failed to load home data", e);
      } finally {
          setLoading(false);
          setIsActuallyLoading(false);
      }
  };

  useEffect(() => {
    fetchData();
    window.addEventListener('dataUpdated', fetchData);
    
    // Safety timeout for loading state
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
    if (highlights.length > 1) {
        const interval = setInterval(() => {
            setCurrentHighlightIndex(prev => (prev + 1) % highlights.length);
        }, 5000);
        return () => clearInterval(interval);
    }
  }, [highlights]);

  const handleCardClick = (coupon: Coupon) => {
      setSelectedCoupon(coupon);
  };

  const handleRedeem = async (coupon: Coupon) => {
    if (!currentUser) {
      onNavigate('login');
      return;
    }
    await redeemCoupon(currentUser.id, coupon);
  };

  const currentSaved = currentUser?.savedAmount || 0;
  
  const getCategoryIcon = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes('gastro') || n.includes('restaurante')) return <Utensils size={24} />;
      if (n.includes('hospedagem') || n.includes('hotel')) return <Bed size={24} />;
      if (n.includes('passeio') || n.includes('turismo')) return <Anchor size={24} />;
      if (n.includes('serviço') || n.includes('delivery')) return <ShoppingBag size={24} />;
      return <Map size={24} />;
  }

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
              if (!silent) {
                  setGpsLoading(false);
                  console.warn("GPS Denied or Error", err);
              }
          },
          { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
      );
  }

  // FORCE LOADING STATE if data is empty (prevents "0 offers" flash)
  const isDataLoading = loading || couponsLoading || businessesLoading || categoriesLoading || isActuallyLoading;

  return (
    <div className="pb-28 bg-slate-50 min-h-screen">
      <SEO 
        title="O Guia Oficial da Região dos Lagos" 
        description="Descubra o melhor da Região dos Lagos com o Lagos GO. Cupons exclusivos, melhores restauraurantes, hotéis e notícias locais de Cabo Frio, Búzios e Arraial do Cabo."
      />
      
      {/* Top Header - Location */}
      <div className="sticky top-0 md:top-16 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200/50 shadow-sm transition-all duration-300">
         <div className="flex justify-between items-center px-4 py-3 max-w-7xl mx-auto w-full">
             <div 
                onClick={() => activateGPS(false)}
                className="flex items-center gap-2 text-ocean-950 cursor-pointer hover:bg-slate-50 px-2 py-1 rounded-lg transition-colors active:scale-95"
             >
                <div className={`bg-ocean-100 p-1.5 rounded-full text-ocean-600 ${gpsLoading ? 'animate-pulse' : ''}`}>
                    <MapPin size={16} />
                </div>
                <div>
                    <span className="text-[10px] text-slate-500 block leading-none">Você está em</span>
                    <div className="flex items-center gap-1">
                        <span className="font-bold text-sm leading-none">{locationName}</span>
                        <ChevronDown size={12} className="text-slate-400" />
                    </div>
                </div>
             </div>
             <div className="w-8"></div> 
         </div>
      </div>

      {/* Hero Section - Carousel */}
      <div className="relative w-full h-auto mb-8 overflow-hidden">
          <div className="h-72 md:h-[450px] w-full relative bg-slate-900">
            {highlights.length > 0 ? (
                highlights.map((h, idx) => (
                    <div 
                        key={h.id}
                        className={`absolute inset-0 transition-all duration-1000 ease-in-out ${idx === currentHighlightIndex ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-full'}`}
                    >
                        <img 
                            src={h.imageUrl} 
                            className="w-full h-full object-cover"
                            alt={h.title} 
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/90 via-ocean-900/40 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-6 md:p-12 max-w-7xl mx-auto w-full">
                            <div className="animate-in slide-in-from-bottom-5 fade-in duration-700">
                                <span className="bg-gold-500 text-white font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-md mb-3 inline-block shadow-lg border border-white/20 backdrop-blur-md">
                                    Destaque Premium
                                </span>
                                <h2 className="text-white text-2xl md:text-5xl font-black mb-2 drop-shadow-xl tracking-tight leading-tight max-w-2xl">{h.title}</h2>
                                <p className="text-slate-100 text-xs md:text-lg mb-6 max-w-xl leading-relaxed opacity-90 line-clamp-2 font-medium">
                                    {h.description}
                                </p>
                                <button 
                                    onClick={() => {
                                        if (h.buttonLink.startsWith('http')) {
                                            window.open(h.buttonLink, '_blank');
                                        } else {
                                            onNavigate(h.buttonLink.replace('/', ''));
                                        }
                                    }}
                                    className="bg-white text-ocean-900 font-black px-8 py-3 rounded-full text-xs md:text-sm shadow-xl hover:bg-ocean-50 active:scale-95 transition-all flex items-center gap-2 w-fit"
                                >
                                    {h.buttonText} <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="absolute inset-0 bg-ocean-950 flex items-center justify-center">
                    <div className="text-center px-4">
                        <h2 className="text-2xl md:text-5xl font-black mb-2 text-white">Bem-vindo ao Lagos GO</h2>
                        <p className="text-xs md:text-lg text-ocean-100 opacity-90">Explore o melhor da região com benefícios exclusivos.</p>
                    </div>
                </div>
            )}

            {/* Carousel Indicators */}
            {highlights.length > 1 && (
                <div className="absolute bottom-6 right-6 flex gap-2 z-20">
                    {highlights.map((_, idx) => (
                        <button 
                            key={idx}
                            onClick={() => setCurrentHighlightIndex(idx)}
                            className={`w-2 h-2 rounded-full transition-all ${idx === currentHighlightIndex ? 'bg-white w-6' : 'bg-white/40'}`}
                        />
                    ))}
                </div>
            )}
          </div>
      </div>

      <div className="px-4 max-w-7xl mx-auto -mt-6 relative z-10 space-y-10">
        
        {/* User Savings Card */}
        {currentUser && (
            <div className="bg-gradient-to-br from-ocean-900 to-ocean-950 rounded-3xl p-6 shadow-2xl shadow-ocean-900/20 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-10 -mt-10 blur-2xl"></div>
                
                <div className="relative z-10 flex items-center justify-between">
                    <div>
                        <p className="text-ocean-200 text-xs uppercase tracking-wider font-medium mb-1">Sua Carteira Inteligente</p>
                        <h3 className="text-3xl font-bold mb-1">R$ {currentSaved.toFixed(2)}</h3>
                        <p className="text-xs text-slate-300">economizados em experiências.</p>
                    </div>
                    <div className="w-12 h-12 rounded-full bg-gold-500 flex items-center justify-center text-ocean-950 shadow-lg shadow-gold-500/20">
                        <Gem size={24} />
                    </div>
                </div>
            </div>
        )}

        {/* Categories */}
        <div>
            <h3 className="text-ocean-950 font-bold mb-4 px-1 text-lg">O que procura hoje?</h3>
            {isActuallyLoading ? (
                <div className="flex gap-4 overflow-hidden">
                    {[1,2,3,4].map(i => <div key={i} className="w-16 h-24 bg-slate-200 rounded-2xl animate-pulse shrink-0"></div>)}
                </div>
            ) : (
                <div className="flex justify-between md:justify-start md:gap-8 overflow-x-auto pb-4 px-1 hide-scrollbar">
                    {swrCategories.slice(0, 4).map(cat => (
                        <div key={cat.id} className="flex flex-col items-center gap-2 min-w-[70px] cursor-pointer group" onClick={() => onNavigate('search')}>
                            <div className="w-16 h-16 rounded-2xl bg-white border border-slate-100 shadow-sm flex items-center justify-center text-ocean-500 group-hover:bg-ocean-50 group-hover:text-ocean-600 group-hover:border-ocean-200 transition-all active:scale-95">
                                {getCategoryIcon(cat.name)}
                            </div>
                            <span className="text-xs font-medium text-slate-600 group-hover:text-ocean-800">{cat.name}</span>
                        </div>
                    ))}
                </div>
            )}
        </div>

        {/* COLLECTIONS */}
        {isActuallyLoading ? <SkeletonList /> : collections.length > 0 && (
            <div>
                <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="text-ocean-950 text-xl font-bold tracking-tight">Coleções Especiais</h3>
                    <button 
                        className="text-sm font-semibold text-ocean-600 hover:text-ocean-800 flex items-center gap-1 active:scale-95 transition-transform"
                        onClick={() => onNavigate('collections')}
                    >
                        Ver todas <ChevronRight size={16} />
                    </button>
                </div>
                
                <div className="flex overflow-x-auto hide-scrollbar gap-4 -mx-4 px-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:mx-0 md:px-0">
                    {collections.filter(col => col.active !== false).slice(0, 3).map(col => (
                        <div 
                            key={col.id} 
                            onClick={() => onNavigate('collection-detail', { collectionId: col.id })}
                            className="w-80 md:w-full flex-shrink-0 h-48 relative rounded-2xl overflow-hidden cursor-pointer group shadow-md hover:shadow-xl transition-all active:scale-[0.98]"
                        >
                            <img src={col.coverImage} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90" />
                            <div className="absolute bottom-0 left-0 p-4 w-full">
                                <h4 className="text-white text-lg font-bold mb-1 leading-tight">{col.title}</h4>
                                <div className="flex items-center gap-2 text-white/80 text-xs">
                                    <span className="bg-white/20 backdrop-blur-md px-2 py-0.5 rounded">{(col.businessIds || []).length} lugares</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* COUPONS */}
        <div>
            <div className="flex justify-between items-center mb-4 px-1">
                <h3 className="text-ocean-950 text-xl font-bold tracking-tight">Melhores Ofertas</h3>
                <button 
                    className="text-sm font-semibold text-ocean-600 hover:text-ocean-800 flex items-center gap-1 active:scale-95 transition-transform"
                    onClick={() => onNavigate('search')}
                >
                    Ver todas <ChevronRight size={16} />
                </button>
            </div>
            
            {isActuallyLoading ? <SkeletonList /> : swrCoupons.length > 0 ? (
                <div className="flex overflow-x-auto hide-scrollbar gap-5 -mx-4 px-4 pb-4 md:grid md:grid-cols-3 lg:grid-cols-4 md:mx-0 md:px-0 md:overflow-visible">
                    {swrCoupons.slice(0, 4).map(coupon => (
                        <div key={coupon.id} className="w-72 flex-shrink-0 md:w-auto h-full">
                            <CouponCard coupon={coupon} onGetCoupon={handleCardClick} />
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white p-6 rounded-2xl border-2 border-dashed border-slate-200 text-center text-slate-400">
                    <p>Nenhuma oferta disponível no momento.</p>
                </div>
            )}
        </div>

        {/* GUIDE */}
        {isActuallyLoading ? <SkeletonList /> : swrBusinesses.length > 0 && (
            <div>
                <div className="flex justify-between items-center mb-4 px-1">
                    <h3 className="text-ocean-950 text-xl font-bold tracking-tight">Lugares Incríveis</h3>
                    <button 
                        className="text-sm font-semibold text-ocean-600 hover:text-ocean-800 flex items-center gap-1 active:scale-95 transition-transform"
                        onClick={() => onNavigate('guide')}
                    >
                        Explorar Guia <ChevronRight size={16} />
                    </button>
                </div>

                <div className="flex overflow-x-auto hide-scrollbar gap-4 -mx-4 px-4 pb-4 md:grid md:grid-cols-2 lg:grid-cols-3 md:mx-0 md:px-0">
                    {swrBusinesses.slice(0, 3).map(biz => (
                        <div 
                            key={biz.id} 
                            onClick={() => onNavigate('business-detail', { businessId: biz.id })}
                            className="w-80 md:w-full flex-shrink-0 bg-white rounded-xl p-3 border border-slate-100 shadow-sm flex gap-4 cursor-pointer hover:shadow-md active:scale-[0.98] transition-all items-center relative"
                        >
                            <img src={biz.coverImage} className="w-20 h-20 rounded-lg object-cover bg-slate-100" />
                            <div className="flex-1 overflow-hidden">
                                <h4 className="font-bold text-ocean-950 truncate flex items-center gap-2">
                                    {biz.name}
                                    {biz.deliveryUrl && (
                                        <span title="Delivery Disponível" className="bg-ocean-50 text-ocean-600 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                                            Tem Entrega
                                        </span>
                                    )}
                                </h4>
                                <p className="text-xs text-slate-500 mb-2 truncate">{biz.category}</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex items-center gap-1 bg-slate-50 px-2 py-0.5 rounded">
                                        <Star size={10} className="text-gold-500 fill-gold-500" />
                                        <span className="text-xs font-bold text-slate-700">{biz.rating}</span>
                                    </div>
                                    {(() => {
                                        const isOpen = checkIfOpen(biz.openingHours, biz.category);
                                        const today = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][new Date().getDay()];
                                        const todayHours = biz.openingHours[today] || 'Fechado';
                                        return (
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] font-bold ${isOpen ? 'text-green-600' : 'text-red-600'}`}>
                                                    {isOpen ? 'Aberto' : 'Fechado'}
                                                </span>
                                                {isOpen && <span className="text-[9px] text-slate-400 font-medium">• {todayHours}</span>}
                                            </div>
                                        );
                                    })()}
                                </div>
                            </div>
                            <div className="h-full flex flex-col items-center justify-center pr-2 gap-2">
                                 <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-400">
                                     <ChevronRight size={18}/>
                                 </div>
                            </div>
                            {swrCoupons.some(c => c.companyId === biz.id) && (
                                <div className="absolute bottom-2 right-2 flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-lg shadow-sm" title="Cupom Disponível">
                                    <Ticket size={12} className="animate-pulse" />
                                    <span className="text-[9px] font-black uppercase tracking-wider">Cupom</span>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* BUSINESS CTA */}
        <div className="bg-white rounded-[3rem] p-8 md:p-12 border border-slate-100 shadow-xl overflow-hidden relative group">
            <div className="absolute top-0 right-0 w-64 h-64 bg-ocean-50 rounded-full -mr-32 -mt-32 blur-3xl transition-all group-hover:bg-ocean-100"></div>
            <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="max-w-xl text-center md:text-left">
                    <h3 className="text-3xl font-black text-ocean-950 mb-4 tracking-tight leading-tight">Tem um negócio na Região?</h3>
                    <p className="text-slate-500 font-medium text-lg leading-relaxed">
                        Aumente suas vendas e visibilidade aparecendo para milhares de turistas e moradores. 
                        <span className="text-ocean-600 font-bold"> Experimente grátis!</span>
                    </p>
                </div>
                <button 
                    onClick={() => onNavigate('pricing-plans')}
                    className="bg-ocean-600 text-white font-black px-10 py-5 rounded-3xl shadow-2xl shadow-ocean-600/30 hover:bg-ocean-700 active:scale-95 transition-all text-lg flex items-center gap-3 shrink-0"
                >
                    Ver Planos do Lagos GO <ArrowRight size={24} />
                </button>
            </div>
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
