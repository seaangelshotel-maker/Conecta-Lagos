import React, { useState, useEffect } from 'react';
import { MapPin, ChevronDown, ChevronRight, Gem, ArrowRight, Star, Ticket } from 'lucide-react';
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
  
  const [loading, setLoading] = useState(true);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [locationName, setLocationName] = useState("Região dos Lagos");

  const fetchData = async () => {
      try {
          const highData = await getHomeHighlights();
          const collData = await getCollections();
          setHighlights(highData);
          setCollections(collData.filter(c => c.active));
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
    if (highlights.length > 1) {
        const interval = setInterval(() => {
            setCurrentHighlightIndex(prev => (prev + 1) % highlights.length);
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
             <div className="flex items-center gap-1.5 bg-slate-50 p-1 rounded-lg border border-slate-100">
                 {['🇧🇷', '🇵🇹', '🇪🇸', '🇺🇸', '🇫🇷'].map((flag, i) => (
                     <button 
                        key={flag} 
                        className={`text-sm w-7 h-7 flex items-center justify-center rounded-md transition-all active:scale-95 ${i === 0 ? 'bg-white shadow-sm opacity-100' : 'opacity-40 hover:opacity-100'}`}
                        title="Alterar Idioma"
                     >
                         {flag}
                     </button>
                 ))}
             </div>
         </div>
      </div>

      <div className="max-w-7xl mx-auto pt-4 relative z-10 space-y-8">
        
        {/* CAROUSEL / BANNERS */}
        <div className="px-4">
            <div className="relative w-full h-40 sm:h-52 md:h-[350px] rounded-2xl overflow-hidden shadow-sm bg-slate-100">
                {highlights.length > 0 ? (
                    highlights.map((h, idx) => (
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
                
                {highlights.length > 1 && (
                    <div className="absolute bottom-3 right-0 w-full flex justify-center gap-1.5 z-20">
                        {highlights.map((_, idx) => (
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
                    {swrCategories.map(cat => {
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
                            <div key={cat.id} className="flex flex-col items-center gap-2 min-w-[72px] cursor-pointer group shrink-0" onClick={() => onNavigate('search')}>
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

        {/* BIG CARDS / HITS (Vale conhecer - Collections) */}
        {collections.length > 0 && (
            <div className="px-4">
                <h3 className="text-slate-900 font-bold mb-3 text-lg px-0.5 tracking-tight">Vale conhecer</h3>
                <div className="grid grid-flow-col auto-cols-max overflow-x-auto hide-scrollbar gap-3 pb-2 -mx-4 px-4 md:mx-0 md:px-0">
                    {collections.map(collection => {
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
        {swrCoupons.length > 0 && (
            <div>
                <div className="flex justify-between items-center mb-3 px-4">
                    <h3 className="text-slate-900 text-lg font-bold tracking-tight">Melhores Cupons</h3>
                    <button className="text-[13px] font-bold text-red-500 hover:text-red-700 active:scale-95 transition-transform" onClick={() => onNavigate('search')}>Ver todos</button>
                </div>
                <div className="flex overflow-x-auto hide-scrollbar gap-4 -mx-4 px-4 pb-4 md:mx-0 md:px-0 md:grid md:grid-cols-4">
                    {swrCoupons.slice(0, 5).map(coupon => (
                        <div key={coupon.id} className="w-[280px] md:w-full flex-shrink-0">
                            <CouponCard coupon={coupon} onGetCoupon={handleCardClick} />
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* LIST - Recomendados para você */}
        <div>
            <h3 className="text-slate-900 text-lg font-bold tracking-tight mb-3 px-4">Recomendados para você</h3>
            
            {/* Quick Filters */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2 px-4 mb-4">
                {['Tudo', 'Lanches', 'Passeios', 'Açaí', 'Mariscos'].map(tag => (
                   <div key={tag} className="border border-slate-200 bg-white px-4 py-1.5 rounded-full text-sm font-semibold text-slate-700 whitespace-nowrap shadow-sm hover:border-slate-300 cursor-pointer active:scale-95 transition-transform text-center">
                       {tag}
                   </div> 
                ))}
            </div>

            {isDataLoading ? (
                <div className="px-4 space-y-4">
                    <div className="h-24 bg-slate-200 rounded-xl animate-pulse"></div>
                    <div className="h-24 bg-slate-200 rounded-xl animate-pulse"></div>
                </div>
            ) : swrBusinesses.length > 0 ? (
                <div className="flex flex-col px-4 gap-0.5">
                    {swrBusinesses.map(biz => {
                        const isOpen = checkIfOpen(biz.openingHours, biz.category);
                        const bizCoupons = swrCoupons.filter(c => c.companyId === biz.id);
                        
                        return (
                            <div 
                                key={biz.id} 
                                onClick={() => onNavigate('business-detail', { businessId: biz.id })}
                                className="bg-white p-3 rounded-lg flex gap-3 cursor-pointer hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 items-center group relative overflow-hidden"
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
                                        {/* Fake distance estimation for visual completeness (iFood style) */}
                                        <div className="text-slate-500">{(Math.random() * 5 + 1).toFixed(1)} km</div>
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
            ) : null}
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
