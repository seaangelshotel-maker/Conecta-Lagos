import React, { useState, useEffect } from 'react';
import { 
  Search, MapPin, Star, Clock, Check, Heart, Navigation, 
  Loader2, Crown, Compass, Map as MapIcon, X, ChevronDown, 
  ListFilter, ShoppingBag, Ticket, Store, Sparkles, 
  Newspaper, Lightbulb, Layers, Utensils, ArrowRight
} from 'lucide-react';
import { BusinessProfile, AppCategory, AppAmenity, User, City, Neighborhood, BlogPost } from '../types';
import { 
  getBusinesses, getCategories, getAmenities, toggleFavorite, 
  calculateDistance, getCities, getNeighborhoods, identifyNeighborhood, 
  checkIfOpen, getCoupons, getCollections, getBusinessesPaginated, getBlogPosts 
} from '../services/dataService';
import { useNotification } from '../components/NotificationSystem';
import { useLanguage, Translate } from '../hooks/useLanguage';

interface BusinessGuideProps {
  currentUser: User | null;
  initialCategory?: string;
  initialSubcategory?: string;
  onNavigate: (page: string, params?: any) => void;
}

const GuideSplash = () => {
    const { t } = useLanguage();
    return (
        <div className="fixed inset-0 z-[100] bg-slate-50/90 backdrop-blur-md flex flex-col items-center justify-center animate-in fade-in duration-300">
            <div className="relative mb-8 text-center">
                <div className="absolute inset-0 bg-ocean-200 rounded-full animate-ping opacity-15 duration-1000"></div>
                <div className="relative w-28 h-28 bg-white rounded-3xl shadow-xl border-4 border-ocean-50/50 flex items-center justify-center mx-auto">
                    <Compass size={56} className="text-ocean-600 animate-[spin_5s_linear_infinite]" />
                </div>
                <h2 className="text-2xl font-black text-ocean-950 mt-8 tracking-tight animate-pulse">{t('Explorando os Lagos...')}</h2>
                <p className="text-slate-400 text-xs mt-2.5 font-bold uppercase tracking-widest">{t('Sincronizando guia oficial')}</p>
            </div>
        </div>
    );
};

export const BusinessGuide: React.FC<BusinessGuideProps> = ({ currentUser, initialCategory, initialSubcategory, onNavigate }) => {
  const { notify } = useNotification();
  const { t, language } = useLanguage();
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [filtered, setFiltered] = useState<BusinessProfile[]>([]);
  const [isLoadingDB, setIsLoadingDB] = useState(true);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  
  const [categories, setCategories] = useState<AppCategory[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
  const [amenities, setAmenities] = useState<AppAmenity[]>([]);
  const [collections, setCollections] = useState<any[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);

  const [query, setQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(initialCategory || 'Todos');
  const [selectedSubCategory, setSelectedSubCategory] = useState(initialSubcategory || 'Todos'); 
  const [selectedLocation, setSelectedLocation] = useState('Todos');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [sortBy, setSortBy] = useState<'recommended' | 'rating' | 'featured_only'>('recommended');
  const [nearby, setNearby] = useState(false);
  const [locating, setLocating] = useState(false);
  const [currentLocationName, setCurrentLocationName] = useState('Todas as Regiões');
  const [allCoupons, setAllCoupons] = useState<any[]>([]);
  
  const [favorites, setFavorites] = useState<string[]>(currentUser?.favorites?.businesses || []);

  const [lastIndex, setLastIndex] = useState<number>(0);
  const [hasMore, setHasMore] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);

  const [debouncedQuery, setDebouncedQuery] = useState(query);
  const loaderRef = React.useRef<HTMLDivElement | null>(null);

  const businessesWithCoupons = React.useMemo(() => {
    const activeCoupons = allCoupons.filter(c => c.active);
    return new Set(activeCoupons.map(c => c.companyId));
  }, [allCoupons]);

  // Integrated Blog suggestions relevant for active category select
  const filteredBlogPosts = React.useMemo(() => {
    if (!blogPosts || blogPosts.length === 0) return [];
    if (selectedCategory === 'Todos') {
      return blogPosts.slice(0, 3); // Latest editorial suggestions
    }
    const catLower = selectedCategory.toLowerCase();
    const matches = blogPosts.filter(post => 
      (post.category || '').toLowerCase().includes(catLower) || 
      (post.tags || []).some(t => t.toLowerCase().includes(catLower))
    );
    return matches.length > 0 ? matches.slice(0, 3) : blogPosts.slice(0, 3);
  }, [blogPosts, selectedCategory]);

  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query), 300);
    return () => clearTimeout(t);
  }, [query]);

  const syncData = async (isLoadMore = false) => {
    if (isLoadMore) setLoadingMore(true);
    else if (!isInitialLoad) setIsFiltering(true);

    try {
        if (debouncedQuery.length > 2) {
            const { searchBusinesses } = await import('../services/dataService');
            const results = await searchBusinesses(debouncedQuery, selectedCategory, selectedLocation, selectedSubCategory);
            setBusinesses(results);
            setHasMore(false);
        } else {
            const isCity = cities.some(c => c.id === selectedLocation);
            const isNeighborhood = neighborhoods.some(n => n.id === selectedLocation);

            const { docs, lastIndex: newLastIndex, hasMore: more } = await getBusinessesPaginated(
                12, 
                null,
                selectedCategory,
                selectedLocation,
                isCity ? 'city' : (isNeighborhood ? 'neighborhood' : undefined),
                selectedSubCategory,
                isLoadMore ? lastIndex : 0
            );

            if (isLoadMore) {
                setBusinesses(prev => [...prev, ...docs]);
            } else {
                setBusinesses(docs);
            }
            
            setLastIndex(newLastIndex);
            setHasMore(more);
        }

    } catch (e) {
        console.error("Failed to sync data", e);
    } finally {
        setIsLoadingDB(false);
        setIsInitialLoad(false);
        setIsFiltering(false);
        setLoadingMore(false);
    }
  };

  // LOAD STRUCTURAL & CONTENT DATA
  useEffect(() => {
    const loadStructuralData = async () => {
        try {
            const [cats, cts, nbs, cols, ams, posts] = await Promise.all([
                getCategories(),
                getCities(),
                getNeighborhoods(),
                getCollections(),
                getAmenities(),
                getBlogPosts()
            ]);
            
            setCategories(cats);
            setCities(cts);
            setNeighborhoods(nbs);
            setAmenities(ams);
            setCollections(cols.filter(c => c.active).sort((a, b) => a.order - b.order));
            setBlogPosts(posts || []);
        } catch (e) {
            console.error("Failed to load structural data", e);
        }
    };
    loadStructuralData();
  }, []);

  useEffect(() => {
    const fetchCoupons = async () => {
        const coupons = await getCoupons();
        setAllCoupons(coupons);
    };
    fetchCoupons();
  }, []);

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
    if (initialSubcategory) {
      setSelectedSubCategory(initialSubcategory);
    }
  }, [initialCategory, initialSubcategory]);

  useEffect(() => {
    syncData();
    
    const handleUpdate = () => syncData();
    window.addEventListener('dataUpdated', handleUpdate);

    const storedGps = sessionStorage.getItem('user_gps');
    if (storedGps && !nearby && selectedLocation === 'Todos') {
        const { lat, lng } = JSON.parse(storedGps);
        setCurrentLocationName(identifyNeighborhood(lat, lng));
    }

    return () => {
        window.removeEventListener('dataUpdated', handleUpdate);
    };
  }, [selectedCategory, selectedSubCategory, selectedLocation, debouncedQuery]);

  const handleLoadMore = () => {
    if (hasMore && !loadingMore && debouncedQuery.length <= 2) {
        syncData(true);
    }
  };

  useEffect(() => {
    if (!hasMore || loadingMore) return;
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        handleLoadMore();
      }
    }, { threshold: 0.1 });

    const currentLoader = loaderRef.current;
    if (currentLoader) {
      observer.observe(currentLoader);
    }

    return () => {
      if (currentLoader) {
        observer.unobserve(currentLoader);
      }
    };
  }, [hasMore, loadingMore, loaderRef]);

  useEffect(() => {
    let result = [...businesses];

    if (query) {
      const q = query.toLowerCase();
      result = result.filter(b => 
        (b.name || '').toLowerCase().includes(q) || 
        (b.description || '').toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'Todos') result = result.filter(b => b.category === selectedCategory);
    if (selectedSubCategory !== 'Todos') result = result.filter(b => b.subcategory === selectedSubCategory);
    if (selectedLocation !== 'Todos') {
        const isCity = cities.some(c => c.id === selectedLocation);
        if (isCity) {
            result = result.filter(b => b.cityId === selectedLocation);
            setCurrentLocationName(cities.find(c => c.id === selectedLocation)?.name || 'Todas as Regiões');
        } else {
            result = result.filter(b => b.neighborhoodId === selectedLocation);
            setCurrentLocationName(neighborhoods.find(n => n.id === selectedLocation)?.name || 'Todas as Regiões');
        }
    } else if (!nearby) {
        setCurrentLocationName('Todas as Regiões');
    }
    
    if (onlyOpen) result = result.filter(b => checkIfOpen(b.openingHours, b.category));
    
    if (selectedAmenities && selectedAmenities.length > 0) {
        result = result.filter(b => selectedAmenities.every(sa => (b.amenities || []).includes(sa)));
    }

    if (nearby && selectedLocation === 'Todos') {
        const storedGps = sessionStorage.getItem('user_gps');
        if (storedGps) {
            const { lat, lng } = JSON.parse(storedGps);
            
            let currentNeighborhoodId: string | null = null;
            let minDistance = Infinity;
            for (const n of neighborhoods) {
                if (n.lat && n.lng && n.active) {
                    const dist = calculateDistance(lat, lng, n.lat, n.lng);
                    if (dist < minDistance) {
                        minDistance = dist;
                        currentNeighborhoodId = n.id;
                    }
                }
            }
            
            if (currentNeighborhoodId && minDistance < 10) {
                result = result.filter(b => b.neighborhoodId === currentNeighborhoodId);
            } else {
                result = result
                    .map(b => ({...b, distance: calculateDistance(lat, lng, b.lat || 0, b.lng || 0)}))
                    .filter(b => (b.distance || 0) < 15) 
                    .sort((a, b) => (a.distance || 0) - (b.distance || 0));
            }
        }
    } else {
        if (sortBy === 'featured_only') {
            result = result.filter(b => b.isFeatured);
            result.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviewCount || 0) - (a.reviewCount || 0));
        } else if (sortBy === 'rating') {
            result.sort((a, b) => (b.rating || 0) - (a.rating || 0) || (b.reviewCount || 0) - (a.reviewCount || 0));
        } else {
            // default/recommended: prioritize featured first, then sort by rating, then by review count
            result.sort((a, b) => {
                const featA = a.isFeatured ? 1 : 0;
                const featB = b.isFeatured ? 1 : 0;
                if (featB !== featA) return featB - featA;
                
                const rA = a.rating || 0;
                const rB = b.rating || 0;
                if (rB !== rA) return rB - rA;
                
                return (b.reviewCount || 0) - (a.reviewCount || 0);
            });
        }
    }

    setFiltered(result);
  }, [query, selectedCategory, selectedSubCategory, selectedLocation, onlyOpen, selectedAmenities, nearby, businesses, cities, neighborhoods, sortBy]);

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (!currentUser) return notify('warning', "Faça login para favoritar.");
      toggleFavorite('business', id);
      setFavorites(prev => prev.includes(id) ? prev.filter(fid => fid !== id) : [...prev, id]);
  };

  const handleNearbyClick = () => {
      if (nearby) {
          setNearby(false);
          return;
      }
      setLocating(true);
      navigator.geolocation.getCurrentPosition(
          (pos) => {
              sessionStorage.setItem('user_gps', JSON.stringify({ lat: pos.coords.latitude, lng: pos.coords.longitude }));
              setLocating(false);
              setNearby(true);
              setCurrentLocationName(identifyNeighborhood(pos.coords.latitude, pos.coords.longitude));
          },
          () => { setLocating(false); notify('error', "Acesso ao GPS não autorizado."); }
      );
  };

  if (isLoadingDB) return <GuideSplash />;

  const currentCategory = categories.find(c => c.name.toLowerCase() === selectedCategory.toLowerCase());
  const currentSubcategories = currentCategory?.subcategories || [];

  return (
    <div className="pb-24 pt-4 min-h-screen bg-slate-50/50">
      {/* 1. HEADER SECTION (Typography & GPS Polish matching user screenshot) */}
      <div className="px-4 mb-5 max-w-7xl mx-auto w-full">
          <div className="flex justify-between items-start gap-3 pb-3 border-b border-slate-100">
              <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-800 tracking-tight leading-none">
                      Guia Comercial
                  </h1>
                  <p className="text-xs text-slate-400 font-semibold leading-none mt-1">
                      Os melhores lugares da <strong className="text-slate-600">Região dos Lagos</strong> na palma da sua mão.
                  </p>
              </div>

              {/* Dynamic GPS indicator shown as a pill matching user design */}
              <button 
                onClick={handleNearbyClick}
                className="flex items-center gap-1.5 bg-sky-50/70 border border-sky-100 px-3 py-1.5 rounded-full text-xs font-semibold text-sky-700 hover:bg-sky-100/60 transition-all cursor-pointer active:scale-95 shrink-0 select-none shadow-2xs"
              >
                  <MapPin size={13} className={nearby ? 'fill-current animate-pulse text-sky-600' : 'text-sky-500'} />
                  <span>{currentLocationName === 'Todas as Regiões' ? 'Todas as Regiões' : currentLocationName}</span>
                  {nearby && <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse inline-block" />}
              </button>
          </div>
      </div>

      {/* 2. MAIN SEARCH & FILTERS PANEL */}
      <div className="px-4 mb-6 max-w-7xl mx-auto w-full">
          <div className="bg-white p-4 sm:p-5 rounded-3xl shadow-sm border border-slate-200/60">
              
              {/* 2a. Real-time Search Field */}
              <div className="relative flex items-center mb-4">
                  <Search className="absolute left-4 text-slate-400/85 pointer-events-none" size={16} />
                  <input 
                      type="text" 
                      placeholder="O que você procura?"
                      className="w-full bg-slate-50/50 border border-slate-100/90 rounded-2xl py-3.5 pl-11 pr-11 outline-none text-sm font-semibold text-slate-700 placeholder-slate-400/80 focus:ring-4 focus:ring-ocean-500/5 focus:border-ocean-200 transition-all shadow-2xs"
                      value={query} 
                      onChange={(e) => setQuery(e.target.value)}
                  />
                  {query && (
                      <button 
                        onClick={() => setQuery('')}
                        className="absolute right-4 text-slate-400 hover:text-slate-600 transition-colors"
                      >
                          <X size={15} />
                      </button>
                  )}
              </div>

              {/* 2b. Dropdowns stacked on mobile, grid side-by-side on desktop (Clean without emojis as requested) */}
              <div className="flex flex-col md:grid md:grid-cols-3 gap-2.5 md:gap-3 mb-4">
                  {/* Category Dropdown (Clean, no emojis) */}
                  <div className="relative w-full">
                      <select 
                        className="w-full bg-slate-50/50 hover:bg-slate-100/30 border border-slate-150 rounded-xl px-3 py-3.5 outline-none text-xs font-bold tracking-tight text-slate-700 appearance-none cursor-pointer focus:ring-4 focus:ring-ocean-500/5 focus:border-ocean-200 transition-all"
                        value={selectedCategory} 
                        onChange={(e) => { setSelectedCategory(e.target.value); setSelectedSubCategory('Todos'); }}
                      >
                          <option value="Todos">Categorias</option>
                          {categories.map(cat => (
                              <option key={cat.id} value={cat.name}>
                                  {cat.name}
                              </option>
                          ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
                  </div>

                  {/* Location Dropdown (Clean, no emojis) */}
                  <div className="relative w-full">
                      <select 
                        className="w-full bg-slate-50/50 hover:bg-slate-100/30 border border-slate-150 rounded-xl px-3 py-3.5 outline-none text-xs font-bold tracking-tight text-slate-700 appearance-none cursor-pointer focus:ring-4 focus:ring-ocean-500/5 focus:border-ocean-200 transition-all"
                        value={selectedLocation} 
                        onChange={(e) => setSelectedLocation(e.target.value)}
                      >
                          <option value="Todos">Localização</option>
                          {cities.map(city => (
                              <optgroup key={city.id} label={city.name} className="font-extrabold text-xs text-ocean-900 bg-white">
                                  <option value={city.id}>Toda a cidade</option>
                                  {neighborhoods.filter(n => n.cityId === city.id).map(n => (
                                      <option key={n.id} value={n.id} className="font-semibold text-slate-700">
                                          {n.name}
                                      </option>
                                  ))}
                              </optgroup>
                          ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
                  </div>

                  {/* Filters/Amenities Dropdown (Clean, no emojis) */}
                  <div className="relative w-full">
                      <select 
                        className="w-full bg-slate-50/50 hover:bg-slate-100/30 border border-slate-150 rounded-xl px-3 py-3.5 outline-none text-xs font-bold tracking-tight text-slate-700 appearance-none cursor-pointer focus:ring-4 focus:ring-ocean-500/5 focus:border-ocean-200 transition-all"
                        onChange={(e) => { 
                            if (e.target.value) { 
                                const id = e.target.value; 
                                setSelectedAmenities(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); 
                                e.target.value = ""; 
                            } 
                        }}
                      >
                          <option value="">Filtros</option>
                          {amenities.map(am => <option key={am.id} value={am.id}>{am.label}</option>)}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={13} />
                  </div>
              </div>

              {/* Active amenities indicator bubble tags */}
              {selectedAmenities.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-3 mb-2 items-center">
                      {selectedAmenities.map(id => (
                          <button 
                            key={id} 
                            onClick={() => setSelectedAmenities(p => p.filter(x => x !== id))} 
                            className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full bg-ocean-600 text-white text-[10px] font-bold uppercase tracking-wide hover:bg-ocean-700 transition-colors"
                          >
                              <Check size={11} /> {amenities.find(a => a.id === id)?.label || id} 
                              <X size={9} className="ml-1 opacity-75"/>
                          </button>
                      ))}
                  </div>
              )}

              {/* 2c. Perto & Aberto Toggle Buttons (Sleek action rows) */}
              <div className="flex gap-2 items-center mb-4.5">
                  {/* Perto Action button */}
                  <button 
                    onClick={handleNearbyClick} 
                    className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold border uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 ${
                      nearby 
                        ? 'bg-sky-50 border-sky-200 text-sky-700 font-extrabold' 
                        : 'bg-white border-slate-200/80 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                      {locating ? (
                          <Loader2 className="animate-spin text-sky-500" size={12}/>
                      ) : (
                          <Navigation size={12} className={nearby ? "fill-current animate-pulse text-sky-600" : "text-slate-400"} />
                      )} 
                      {locating ? 'GPS...' : 'Perto'}
                  </button>

                  {/* Aberto Toggle button */}
                  <button 
                    onClick={() => setOnlyOpen(!onlyOpen)} 
                    className={`shrink-0 px-4 py-2.5 rounded-xl text-xs font-bold border uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-2xs active:scale-95 ${
                      onlyOpen 
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-700 font-extrabold' 
                        : 'bg-white border-slate-200/80 text-slate-500 hover:bg-slate-50'
                    }`}
                  >
                      <Clock size={12} className={onlyOpen ? 'text-emerald-500' : 'text-slate-400'} /> Aberto
                  </button>
              </div>

              {/* 2d. Horizontal Scrollable Category Slider at the bottom of the card block */}
              <div className="pt-4 border-t border-dashed border-slate-100 overflow-x-auto hide-scrollbar pb-1 px-0.5 mt-4">
                  <div className="flex gap-4.5">
                    {/* TODOS bubble card */}
                    <div 
                      onClick={() => { setSelectedCategory('Todos'); setSelectedSubCategory('Todos'); }} 
                      className="flex flex-col items-center gap-2 min-w-[68px] sm:min-w-[76px] cursor-pointer group shrink-0"
                    >
                      <div className={`w-[60px] h-[60px] rounded-2xl flex items-center justify-center transition-all ${selectedCategory === 'Todos' ? 'bg-gradient-to-tr from-ocean-500 to-ocean-600 text-white shadow-md shadow-ocean-500/20 scale-103' : 'bg-white border border-slate-100 text-slate-400 group-hover:bg-slate-100/50 shadow-2xs'}`}>
                        <Compass size={22} className={selectedCategory === 'Todos' ? 'animate-[spin_4s_linear_infinite]' : ''} />
                      </div>
                      <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider text-center leading-tight ${selectedCategory === 'Todos' ? 'text-ocean-600' : 'text-slate-500 group-hover:text-slate-800'}`}>
                        Todos
                      </span>
                    </div>
                    
                    {/* Database categories round items slider mapping */}
                    {categories.map(cat => {
                      let emoji = '🧭';
                      const n = cat.name.toLowerCase();
                      if (n.includes('gastro') || n.includes('restaurante') || n.includes('comida')) emoji = '🍔';
                      else if (n.includes('hospedagem') || n.includes('hotel') || n.includes('pousada')) emoji = '🛌';
                      else if (n.includes('passeio') || n.includes('barco') || n.includes('ilha')) emoji = '⛵';
                      else if (n.includes('serviço') || n.includes('delivery')) emoji = '🛵';
                      else if (n.includes('praia')) emoji = '⛱️';
                      else if (n.includes('festa') || n.includes('evento')) emoji = '🎉';
                      else if (n.includes('comércio') || n.includes('loja')) emoji = '🛍️';

                      const isActive = selectedCategory.toLowerCase() === cat.name.toLowerCase();

                      return (
                        <div 
                          key={cat.id} 
                          onClick={() => { setSelectedCategory(cat.name); setSelectedSubCategory('Todos'); }} 
                          className="flex flex-col items-center gap-2 min-w-[68px] sm:min-w-[76px] cursor-pointer group shrink-0"
                        >
                          <div className={`w-[60px] h-[60px] rounded-2xl flex items-center justify-center text-2.5xl transition-all relative ${isActive ? 'bg-gradient-to-tr from-ocean-500 to-ocean-600 shadow-md shadow-ocean-500/25 scale-103 text-white' : 'bg-white border border-slate-100 text-slate-700 group-hover:bg-slate-100/50 shadow-2xs'}`}>
                            <span className="relative z-10 drop-shadow-xs select-none">{emoji}</span>
                            {isActive && (
                              <div className="absolute inset-0 bg-white/10 rounded-2xl animate-pulse"></div>
                            )}
                          </div>
                          <span className={`text-[10px] sm:text-xs font-bold text-center leading-tight line-clamp-1 max-w-[72px] ${isActive ? 'text-ocean-600 font-extrabold' : 'text-slate-500 group-hover:text-slate-800'}`}>
                            {cat.name}
                          </span>
                        </div>
                      );
                    })}
                  </div>
              </div>

              {/* 2e. Subcategory chips mapping scope */}
              {currentSubcategories.length > 0 && (
                  <div className="flex gap-2 overflow-x-auto hide-scrollbar pt-3 border-t border-slate-100/75 mt-3.5 items-center">
                      <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider shrink-0 mr-1">Ramos:</span>
                      
                      <button 
                        onClick={() => setSelectedSubCategory('Todos')} 
                        className={`shrink-0 px-3.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${selectedSubCategory === 'Todos' ? 'bg-ocean-950 text-white border-ocean-950 shadow-2xs' : 'bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100/50'}`}
                      >
                          Todos
                      </button>

                      {currentSubcategories.map(sub => (
                          <button 
                            key={sub.id} 
                            onClick={() => setSelectedSubCategory(selectedSubCategory === sub.name ? 'Todos' : sub.name)} 
                            className={`shrink-0 px-3.5 py-1.5 rounded-xl text-[11px] font-bold border transition-all ${selectedSubCategory === sub.name ? 'bg-gradient-to-tr from-ocean-500 to-ocean-600 text-white border-transparent shadow-2xs' : 'bg-slate-50 text-slate-600 border-transparent hover:bg-slate-100'}`}
                          >
                              {sub.name}
                          </button>
                      ))}
                  </div>
              )}
          </div>
      </div>

      {/* 4. INTEGRATED EDITORIAL DICAS CONTENT (Synergy of Commercial + Blog Content) */}
      {filteredBlogPosts.length > 0 && (
          <div className="px-4 mb-8 max-w-7xl mx-auto w-full">
              <div className="flex justify-between items-center mb-4 px-1">
                  <div className="space-y-0.5">
                      <h3 className="text-xs font-black text-slate-900 uppercase tracking-widest flex items-center gap-1.5">
                          <Sparkles size={14} className="text-gold-500 fill-gold-500 animate-pulse" /> 
                          {selectedCategory === 'Todos' ? 'Roteiros e Dicas da Semana' : `O melhor de ${selectedCategory}`}
                      </h3>
                      <p className="text-[11px] text-slate-400 font-medium">Visualização rápida de matérias escritas de nossa redação.</p>
                  </div>
                  <button 
                      onClick={() => onNavigate('blog')} 
                      className="text-[10px] font-black text-ocean-600 hover:text-ocean-700 flex items-center gap-1 uppercase tracking-widest bg-ocean-50/50 hover:bg-ocean-50 px-3.5 py-2.5 rounded-xl border border-ocean-100/40 transition-all active:scale-95 shrink-0"
                  >
                      Ver Feed Geral <ArrowRight size={12} />
                  </button>
              </div>
              
              <div className="flex gap-4.5 overflow-x-auto hide-scrollbar pb-2 px-0.5 -mx-4 px-4 md:mx-0 md:px-0.5">
                  {filteredBlogPosts.map(post => (
                      <div 
                          key={post.id}
                          onClick={() => onNavigate('blog-detail', { postId: post.id })}
                          className="w-[285px] sm:w-[330px] bg-white rounded-[1.8rem] p-3 shadow-xs border border-slate-100 hover:shadow-md transition-all duration-300 cursor-pointer flex gap-3.5 shrink-0 group relative overflow-hidden"
                      >
                          <div className="w-20 h-20 sm:w-[92px] sm:h-[92px] rounded-2xl overflow-hidden shrink-0 relative bg-slate-100">
                              <img 
                                  src={post.imageUrl} 
                                  referrerPolicy="no-referrer"
                                  alt={post.title} 
                                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                              />
                              <div className="absolute inset-0 bg-black/5"></div>
                          </div>
                          <div className="flex-1 py-1 flex flex-col justify-between overflow-hidden">
                              <div className="space-y-1">
                                  <span className="inline-block text-[8px] font-black tracking-widest uppercase text-ocean-600 bg-ocean-50 px-2 py-0.5 rounded-md leading-none select-none">
                                      {post.category}
                                  </span>
                                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-800 leading-snug line-clamp-2 group-hover:text-ocean-600 transition-colors">
                                      {post.title}
                                  </h4>
                              </div>
                              <div className="flex items-center justify-between mt-1.5 flex-wrap gap-1">
                                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1 leading-none select-none">
                                      📖 Ver Roteiro
                                  </p>
                                  <span className="text-[#ff5a1f] font-black text-[9px] uppercase tracking-wider flex items-center gap-0.5">
                                      ⚡ {(() => {
                                        const realList = post.connectedUsers || [];
                                        const baseSeedCount = Math.abs((post.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % 25) + 12;
                                        return realList.length > 0 ? (baseSeedCount + realList.length) : baseSeedCount;
                                      })()}
                                  </span>
                              </div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* 5. FEATURED COLLECTIONS (Vale Conhecer highlight slider) */}
      {collections.length > 0 && selectedCategory === 'Todos' && (
          <div className="px-4 mb-8 max-w-7xl mx-auto w-full">
              <div className="flex items-center gap-2 mb-4 px-1">
                  <h3 className="text-xs font-black text-slate-800 uppercase tracking-widest flex items-center gap-1.5">
                      <MapIcon size={14} className="text-ocean-500" /> Histórias & Coleções em Destaque
                  </h3>
              </div>
              
              <div className="flex gap-4.5 overflow-x-auto hide-scrollbar pb-2 -mx-4 px-4 md:mx-0 md:px-0.5">
                  {collections.map(col => (
                      <div 
                          key={col.id} 
                          onClick={() => onNavigate('collection-detail', { collectionId: col.id })}
                          className="shrink-0 w-64 h-36 rounded-[1.8rem] overflow-hidden relative cursor-pointer group shadow-sm hover:shadow-md transition-all duration-300"
                      >
                          <img 
                            src={col.coverImage} 
                            alt={col.title} 
                            className="w-full h-full object-cover group-hover:scale-103 transition-transform duration-700 brightness-95" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-transparent flex flex-col justify-end p-4">
                              <h3 className="text-white font-extrabold text-sm leading-snug drop-shadow-sm">{col.title}</h3>
                              <p className="text-white/80 text-[10px] font-bold tracking-wider uppercase mt-1">
                                  {(col.businessIds || []).length} locais recomendados
                              </p>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      )}

      {/* 6. BUSINESS RESULTS GRID (With robust card layout) */}
      <div className="px-4 max-w-7xl mx-auto w-full relative">
          
          <div className="mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-4 rounded-[1.8rem] border border-slate-200/80 shadow-2xs w-full">
              <div className="flex items-center gap-2">
                  <Store size={15} className="text-ocean-600 shrink-0" />
                  <span className="text-xs font-black text-slate-800 uppercase tracking-widest leading-none">
                      Recomendados Comercial ({filtered.length})
                  </span>
              </div>
              
              {/* Fluid Sorting Segment Selector Control */}
              <div className="flex bg-slate-100 p-1 rounded-2xl self-stretch sm:self-auto overflow-x-auto hide-scrollbar shrink-0 gap-1">
                  <button
                    onClick={() => setSortBy('recommended')}
                    className={`px-3.5 py-2 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      sortBy === 'recommended' 
                        ? 'bg-white text-ocean-700 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                      <Crown size={11} className={sortBy === 'recommended' ? 'text-amber-500 fill-amber-500/10' : ''} /> Destaques Premium
                  </button>
                  <button
                    onClick={() => setSortBy('rating')}
                    className={`px-3.5 py-2 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      sortBy === 'rating' 
                        ? 'bg-white text-ocean-700 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                      <Star size={11} className={sortBy === 'rating' ? 'text-amber-500 fill-amber-500/10' : ''} /> Avaliação
                  </button>
                  <button
                    onClick={() => setSortBy('featured_only')}
                    className={`px-3.5 py-2 text-[10px] sm:text-[11px] font-black uppercase tracking-wider rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                      sortBy === 'featured_only' 
                        ? 'bg-white text-ocean-700 shadow-xs' 
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                      <Crown size={11} className="text-amber-500" /> Ver Destaques
                  </button>
              </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 relative">
              {isFiltering && (
                  <div className="absolute inset-0 z-10 bg-slate-50/50 backdrop-blur-[1px] flex items-center justify-center min-h-[350px] rounded-3xl">
                      <Loader2 className="animate-spin text-ocean-600" size={36} />
                  </div>
              )}
              
              {filtered.length === 0 && !isFiltering ? (
                  <div className="col-span-full py-24 text-center bg-white rounded-[2.2rem] border border-dashed border-slate-200 shadow-sm px-6">
                      <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-5 text-slate-300 border border-slate-100">
                          <Search size={36} />
                      </div>
                      <h3 className="text-lg font-black text-slate-800 uppercase tracking-tight mb-2">Nenhum estabelecimento correspondente</h3>
                      <p className="text-slate-400 text-xs max-w-sm mx-auto font-medium">Tente alterar os termos da busca, limpar filtros ou ligar o GPS para encontrar locais próximos.</p>
                      <button 
                        onClick={() => {
                            setQuery('');
                            setSelectedCategory('Todos');
                            setSelectedLocation('Todos');
                            setSelectedAmenities([]);
                            setOnlyOpen(false);
                            setNearby(false);
                        }}
                        className="mt-6 inline-flex px-5 py-3 bg-ocean-50 hover:bg-ocean-100 text-ocean-700 rounded-xl font-extrabold text-xs uppercase tracking-wider transition-all"
                      >
                          Limpar todos os filtros
                      </button>
                  </div>
              ) : filtered.map((business) => (
                  <div 
                    key={business.id} 
                    onClick={() => onNavigate('business-detail', { businessId: business.id })} 
                    className={`bg-white rounded-[2rem] overflow-hidden shadow-xs border hover:shadow-xl transition-all duration-300 cursor-pointer flex flex-col h-full relative group hover:-translate-y-1 ${business.isFeatured ? 'ring-[3px] ring-gold-400 ring-offset-2 border-gold-300' : 'border-slate-100'}`}
                  >
                      {/* Premium feature designation label */}
                      {business.isFeatured && (
                          <div className="absolute top-3.5 left-4 bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-slate-950 text-[9px] font-black tracking-widest px-3.5 py-1 rounded-xl z-20 shadow-lg uppercase flex items-center gap-1 leading-none select-none">
                              <Crown size={10} className="fill-slate-950 text-slate-950 shrink-0" /> Parceiro Destaque
                          </div>
                      )}

                      {/* Card Cover Picture container frame */}
                      <div className="h-48 w-full relative bg-slate-100 flex items-center justify-center overflow-hidden">
                          {business.coverImage ? (
                              <img 
                                src={business.coverImage} 
                                className="w-full h-full object-cover duration-500 group-hover:scale-104 transition-all" 
                                alt={business.name} 
                              />
                          ) : (
                              <div className="flex flex-col items-center text-slate-400">
                                  <Store size={36} className="mb-2 opacity-35" />
                                  <span className="text-[10px] uppercase font-black tracking-wider">Sem fotos oficiais</span>
                              </div>
                          )}

                          {/* Top Dark shadow gradient */}
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/15 to-transparent"></div>

                          {/* Floating Glass Favorite Heart Button */}
                          <button 
                            onClick={(e) => handleToggleFavorite(e, business.id)} 
                            className="absolute top-3.5 right-4 p-2.5 rounded-full bg-black/35 hover:bg-black/50 backdrop-blur-md z-20 text-white transition-all shadow-sm active:scale-90"
                          >
                             <Heart size={15} className={`transition-all duration-300 ${favorites.includes(business.id) ? 'fill-rose-500 text-rose-500 scale-110' : 'text-white'}`} />
                          </button>

                          {/* Open Closed Active Hours Tag Badges */}
                          {(() => {
                              const isOpen = checkIfOpen(business.openingHours, business.category);
                              const today = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][new Date().getDay()];
                              const todayHours = (business.openingHours && business.openingHours[today]) || 'Fechado';
                              return (
                                <div className="absolute bottom-3 left-4 flex flex-col gap-1 items-start z-20 select-none">
                                    <span className={`px-2.5 py-1 rounded-lg text-[9px] font-black tracking-wider text-white shadow-md uppercase leading-none ${isOpen ? 'bg-emerald-500/90 backdrop-blur-md' : 'bg-rose-500/90 backdrop-blur-sm'}`}>
                                        {isOpen ? '🟢 Aberto Agora' : '🔴 Fechado'}
                                    </span>
                                    {isOpen && (
                                        <span className="bg-slate-950/75 backdrop-blur-md text-slate-200 text-[8px] font-extrabold px-2 py-0.5 rounded shadow-sm tracking-wide">
                                            Hoje: {todayHours}
                                        </span>
                                    )}
                                </div>
                              );
                          })()}
                      </div>

                      {/* Card Information Body area */}
                      <div className="p-5 flex-1 flex flex-col justify-between">
                          <div>
                              <div className="flex justify-between items-start gap-1 pb-1">
                                  <h3 className="font-extrabold text-slate-800 text-[16px] md:text-lg line-clamp-1 flex items-center gap-1.5 leading-snug">
                                      {business.name}
                                      {business.isFeatured && (
                                          <span className="text-amber-500 hover:scale-110 transition-transform shrink-0" title="Parceiro Destaque Premium">
                                              <Crown size={14} className="fill-current" />
                                          </span>
                                      )}
                                  </h3>
                                  
                                  {/* Compact Rating Tag indicator */}
                                  <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-100/50 px-2 py-0.5 rounded-lg shrink-0">
                                      <Star size={11} className="text-gold-500 fill-gold-500" />
                                      <span className="text-[11px] font-black text-gold-600">{business.rating}</span>
                                  </div>
                              </div>
                              
                              {/* Category and neighborhood markers */}
                              <p className="text-slate-400 text-[11px] font-black uppercase tracking-wider mb-2 select-none">
                                  {business.category} • {neighborhoods.find(n => n.id === business.neighborhoodId)?.name || cities.find(c => c.id === business.cityId)?.name || 'Região dos Lagos'}
                              </p>

                              {/* Core short description with ellipsis line Clamp */}
                              <p className="text-slate-500 text-xs font-medium leading-relaxed line-clamp-2 md:line-clamp-3 mb-4">
                                  {business.description || 'Dica exclusiva Konecta de entretenimento e turismo, agende já a sua viagem.'}
                              </p>
                          </div>

                          {/* Directory Bottom Action Tags Grid (Amenities, Coupons) */}
                          <div className="pt-3 border-t border-slate-50 flex items-center justify-between gap-1.5 overflow-hidden">
                              
                              {/* Row of Amenity mini-tags */}
                              <div className="flex gap-1.5 overflow-hidden select-none">
                                  {(business.amenities || []).slice(0, 2).map(am => (
                                      <span key={am} className="text-[9px] font-black uppercase tracking-widest bg-slate-100 hover:bg-slate-200/50 text-slate-500 px-2.5 py-1 rounded-lg shrink-0 transition-colors">
                                          {amenities.find(a => a.id === am)?.label || am}
                                      </span>
                                  ))}
                              </div>

                              {/* Promotion indicators line */}
                              <div className="flex items-center gap-1.5 shrink-0 select-none">
                                  {business.deliveryUrl && (
                                      <span title="Delivery" className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider border border-emerald-100/60 transition-colors">
                                          🛵 Entrega
                                      </span>
                                  )}

                                  {businessesWithCoupons.has(business.id) && (
                                      <div className="flex items-center gap-1 bg-red-50 text-red-600 px-2.5 py-1 rounded-lg shadow-xs border border-red-100/70" title="Cupom Disponível">
                                          <Ticket size={11} className="animate-pulse text-red-500 fill-red-100" />
                                          <span className="text-[8px] font-black uppercase tracking-wider">Cupom</span>
                                      </div>
                                  )}
                              </div>

                          </div>
                      </div>
                  </div>
              ))}
          </div>

          {/* INFINITE LAZY PAGINATION LOADING BOTTON OR END OF LIST TEXT */}
          {hasMore && (
              <div ref={loaderRef} className="flex justify-center mt-12 mb-20 select-none">
                  <button 
                      onClick={handleLoadMore}
                      disabled={loadingMore}
                      className="bg-white border-2 border-ocean-600 hover:bg-ocean-600 text-ocean-600 hover:text-white px-8 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all duration-300 shadow-md hover:shadow-lg active:scale-95 disabled:opacity-50 flex items-center gap-2.5"
                  >
                      {loadingMore ? (
                          <>
                              <Loader2 className="animate-spin" size={16} />
                              Carregando lista...
                          </>
                      ) : (
                          <>
                              Ver Mais Estabelecimentos
                              <ChevronDown size={16} />
                          </>
                      )}
                  </button>
              </div>
          )}

          {!hasMore && filtered.length > 0 && (
              <div className="text-center mt-12 mb-20 text-slate-400 font-extrabold text-[11px] uppercase tracking-widest select-none">
                  🌴 Fim do guia. Explore outros rumos!
              </div>
          )}
      </div>

    </div>
  );
};
