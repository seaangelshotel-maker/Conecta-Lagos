
import React, { useState, useEffect } from 'react';
import { Search as SearchIcon, X, SlidersHorizontal, Frown, Loader2, Navigation } from 'lucide-react';
import { Coupon, AppCategory, User, Subcategory } from '../types';
import { getCoupons, getCategories, calculateDistance, redeemCoupon, getCurrentUser, getBusinesses } from '../services/dataService';
import { useNotification } from '../components/NotificationSystem';
import { CouponCard } from '../components/CouponCard';
import { CouponModal } from '../components/CouponModal';

interface SearchPageProps {
  onNavigate: (page: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ onNavigate }) => {
  const { notify } = useNotification();
  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('Todos');
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([]);
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  
  const [nearby, setNearby] = useState(false);
  const [locating, setLocating] = useState(false);

  const fetch = async () => {
      const [businesses, couponData, cats] = await Promise.all([
          getBusinesses(),
          getCoupons(),
          getCategories()
      ]);
      
      const mappedCoupons = couponData.map(c => {
          const biz = businesses.find(b => b.id === c.companyId);
          return { ...c, subcategory: biz?.subcategory };
      });
      
      const activeData = mappedCoupons.filter(c => c.active !== false);
      setCoupons(activeData);
      setCategories(cats);
      setCurrentUser(getCurrentUser());
      setLoading(false);
  };

  useEffect(() => {
    fetch();
    window.addEventListener('dataUpdated', fetch);
    return () => window.removeEventListener('dataUpdated', fetch);
  }, []);

  useEffect(() => {
    let result = [...coupons];

    if (selectedCategory !== 'Todos') {
      result = result.filter(c => c.category === selectedCategory);
      if (selectedSubcategory !== 'Todos') {
        result = result.filter(c => c.subcategory === selectedSubcategory);
      }
    }

    if (query) {
      const lowerQuery = query.toLowerCase();
      result = result.filter(c => 
        (c.title || '').toLowerCase().includes(lowerQuery) || 
        (c.companyName || '').toLowerCase().includes(lowerQuery) ||
        (c.description || '').toLowerCase().includes(lowerQuery)
      );
    }

    if (nearby) {
        const storedGps = sessionStorage.getItem('user_gps');
        if (storedGps) {
            const { lat, lng } = JSON.parse(storedGps);
            const withDist = result.map(c => ({
                ...c,
                distance: calculateDistance(lat, lng, c.lat || 0, c.lng || 0)
            }));
            
            result = withDist
                .filter(c => (c.distance || 9999) < 15) 
                .sort((a, b) => (a.distance || 9999) - (b.distance || 9999));
        }
    }

    setFilteredCoupons(result);
  }, [query, selectedCategory, coupons, nearby]);

  const handleNearbyToggle = () => {
      if (nearby) {
          setNearby(false);
          return;
      }

      const storedGps = sessionStorage.getItem('user_gps');
      if (storedGps) {
          setNearby(true);
      } else {
          setLocating(true);
          navigator.geolocation.getCurrentPosition(
              (pos) => {
                  sessionStorage.setItem('user_gps', JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
                  setLocating(false);
                  setNearby(true);
              },
              (err) => {
                  setLocating(false);
                  notify('error', "Não conseguimos obter sua localização.");
              }
          );
      }
  };

  const handleRedeem = async (coupon: Coupon) => {
    if (!currentUser) {
        onNavigate('login');
        return;
    }
    await redeemCoupon(currentUser.id, coupon);
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      <div className="sticky top-0 md:top-16 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200 shadow-[0_2px_10px_rgba(0,0,0,0.02)] transition-all duration-300">
          <div className="max-w-7xl mx-auto px-4 py-4">
            <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1 group">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-ocean-600 transition-colors" size={20} />
                    <input 
                        type="text"
                        placeholder="Buscar restaurantes, passeios..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-3.5 pl-12 pr-10 text-ocean-900 focus:ring-2 focus:ring-ocean-500/20 focus:border-ocean-500 outline-none transition-all shadow-inner"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                    />
                    {query && (
                        <button 
                            onClick={() => setQuery('')} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-full transition-colors"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
                <button 
                    onClick={handleNearbyToggle}
                    disabled={locating}
                    className={`p-3.5 rounded-2xl border transition-colors flex items-center justify-center gap-2 ${nearby ? 'bg-ocean-100 border-ocean-200 text-ocean-700' : 'bg-ocean-50 border-ocean-100 text-ocean-600 hover:bg-ocean-100'}`}
                >
                    {locating ? <Loader2 className="animate-spin" size={20}/> : <Navigation size={20} className={nearby ? "fill-ocean-700" : ""} />}
                    <span className="hidden md:inline text-sm font-bold">{nearby ? 'Perto de mim' : 'Distância'}</span>
                </button>
            </div>

            <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0">
                <button 
                    onClick={() => setSelectedCategory('Todos')}
                    className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === 'Todos' ? 'bg-ocean-600 border-ocean-600 text-white shadow-md shadow-ocean-600/20' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                >
                    Todos
                </button>
                {categories.map(cat => (
                    <button 
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.name); setSelectedSubcategory('Todos'); }}
                        className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap transition-all border ${selectedCategory === cat.name ? 'bg-ocean-600 border-ocean-600 text-white shadow-md shadow-ocean-600/20' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                    >
                        {cat.name}
                    </button>
                ))}
            </div>

            {selectedCategory !== 'Todos' && (categories.find(c => c.name === selectedCategory)?.subcategories?.length ?? 0) > 0 && (
                <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4 md:mx-0 md:px-0 mt-3">
                    <button 
                        onClick={() => setSelectedSubcategory('Todos')}
                        className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${selectedSubcategory === 'Todos' ? 'bg-slate-700 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-500'}`}
                    >
                        Todas
                    </button>
                    {categories.find(c => c.name === selectedCategory)?.subcategories?.map((sub: Subcategory) => (
                        <button 
                            key={sub.id}
                            onClick={() => setSelectedSubcategory(sub.name)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all border ${selectedSubcategory === sub.name ? 'bg-slate-700 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-500'}`}
                        >
                            {sub.name}
                        </button>
                    ))}
                </div>
            )}
          </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-end mb-6">
              <h2 className="text-xl font-bold text-ocean-950">
                  {loading ? 'Buscando ofertas...' : `${filteredCoupons.length} ${filteredCoupons.length === 1 ? 'oferta encontrada' : 'ofertas encontradas'}`}
                  {nearby && <span className="text-sm font-normal text-slate-500 ml-2">(Próximas a você)</span>}
              </h2>
              {(selectedCategory !== 'Todos' || nearby || query) && (
                  <button onClick={() => { setSelectedCategory('Todos'); setNearby(false); setQuery(''); }} className="text-xs text-ocean-600 font-bold hover:underline">
                      Limpar filtros
                  </button>
              )}
          </div>
          
          {loading ? (
               <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                   {[1,2,3,4,5,6].map(i => (
                       <div key={i} className="h-80 bg-white rounded-2xl border border-slate-100 animate-pulse">
                           <div className="h-40 bg-slate-200 w-full rounded-t-2xl"></div>
                           <div className="p-4 space-y-3">
                               <div className="h-4 bg-slate-200 w-3/4 rounded"></div>
                               <div className="h-3 bg-slate-200 w-1/2 rounded"></div>
                           </div>
                       </div>
                   ))}
               </div>
          ) : filteredCoupons.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {filteredCoupons.map(coupon => (
                      <div key={coupon.id} className="h-full">
                        <CouponCard coupon={coupon} onGetCoupon={setSelectedCoupon} />
                      </div>
                  ))}
              </div>
          ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center animate-in fade-in">
                  <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mb-6 text-slate-300">
                      <Frown size={48} />
                  </div>
                  <h3 className="text-xl font-bold text-ocean-950 mb-2">Ops! Nada encontrado.</h3>
                  <p className="text-slate-500 max-w-xs mx-auto mb-6">
                      {nearby 
                        ? "Não encontramos ofertas próximas a sua localização atual." 
                        : `Não encontramos cupons para "${query}" na categoria ${selectedCategory}.`
                      }
                  </p>
                  <button 
                      onClick={() => { setQuery(''); setSelectedCategory('Todos'); setNearby(false); }}
                      className="bg-ocean-600 text-white px-6 py-3 rounded-xl font-bold shadow-lg hover:bg-ocean-700 transition-colors"
                  >
                      Ver todas as ofertas
                  </button>
              </div>
          )}
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
