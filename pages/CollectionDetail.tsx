
import React, { useEffect, useState } from 'react';
import { Collection, BusinessProfile } from '../types';
import { getCollectionById, getBusinessById, checkIfOpen, getCoupons } from '../services/dataService';
import { ArrowLeft, Star, Heart, Clock, ShoppingBag, Ticket } from 'lucide-react';
import { toggleFavorite, getCurrentUser } from '../services/dataService';
import { useNotification } from '../components/NotificationSystem';

interface CollectionDetailProps {
  collectionId: string;
  onNavigate: (page: string, params?: any) => void;
}

export const CollectionDetail: React.FC<CollectionDetailProps> = ({ collectionId, onNavigate }) => {
  const { notify } = useNotification();
  const [collection, setCollection] = useState<Collection | null>(null);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [businessesWithCoupons, setBusinessesWithCoupons] = useState<Set<string>>(new Set());
  const user = getCurrentUser();
  const [favorites, setFavorites] = useState<string[]>(user?.favorites?.businesses || []);

  useEffect(() => {
    const fetchData = async () => {
      const col = await getCollectionById(collectionId);
      if (col) {
          setCollection(col);
          const ids = col.businessIds || [];
          const loadedBusinesses = await Promise.all(ids.map((id: string) => getBusinessById(id)));
          const filteredBusinesses = loadedBusinesses.filter((b: BusinessProfile | undefined): b is BusinessProfile => b !== undefined);
          setBusinesses(filteredBusinesses);
      }
      
      // Fetch coupons to see which businesses have active coupons
      try {
          const coupons = await getCoupons();
          const activeCoupons = coupons.filter(c => c.active);
          const bizIdsWithCoupons = new Set(activeCoupons.map(c => c.companyId));
          setBusinessesWithCoupons(bizIdsWithCoupons);
      } catch (e) {
          console.error("Failed to fetch coupons", e);
      }
    };
    fetchData();
  }, [collectionId]);

  const handleToggleFavorite = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (!user) {
          notify('warning', "Você precisa estar logado.");
          return;
      }
      toggleFavorite('business', id);
      setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  if (!collection) return (
    <div className="p-10 text-center flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-ocean-600 border-t-transparent mb-4"></div>
      <p className="text-slate-500 font-medium">Carregando coleção...</p>
    </div>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-24">
        {/* Hero Header */}
        <div className="relative h-64 md:h-[40vh] w-full">
            <img src={collection.coverImage} className="w-full h-full object-cover" alt={collection.title} />
            <div className="absolute inset-0 bg-black/50 backdrop-blur-[2px]" />
            
            <button 
                onClick={() => onNavigate('collections')}
                className="absolute top-4 left-4 bg-white/20 hover:bg-white/40 backdrop-blur-md text-white p-2 rounded-full transition-colors z-20"
            >
                <ArrowLeft size={24} />
            </button>

            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 max-w-4xl mx-auto text-center md:text-left">
                <span className="text-gold-400 font-bold text-xs uppercase tracking-widest mb-2 block">Coleção Exclusiva</span>
                <h1 className="text-3xl md:text-5xl font-bold text-white leading-tight mb-4 shadow-black drop-shadow-lg">
                    {collection.title}
                </h1>
                <p className="text-white/90 text-sm md:text-lg max-w-2xl leading-relaxed">
                    {collection.description}
                </p>
            </div>
        </div>

        {/* Business List */}
        <div className="max-w-7xl mx-auto px-4 py-8 -mt-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {businesses.map(biz => {
                    const isFav = favorites.includes(biz.id);
                    return (
                        <div 
                            key={biz.id} 
                            onClick={() => onNavigate('business-detail', { businessId: biz.id })}
                            className="bg-white rounded-xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow cursor-pointer flex flex-col h-full group relative"
                        >
                            <div className="h-48 w-full relative shrink-0">
                                <img src={biz.coverImage} className="w-full h-full object-cover" alt={biz.name} />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
                                {(() => {
                                    const isOpen = checkIfOpen(biz.openingHours, biz.category);
                                    const today = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][new Date().getDay()];
                                    const todayHours = biz.openingHours[today] || 'Fechado';
                                    return (
                                        <div className="absolute top-2 left-2 flex flex-col gap-1 items-start">
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm ${isOpen ? 'bg-green-500' : 'bg-red-500'}`}>
                                                {isOpen ? 'ABERTO AGORA' : 'FECHADO'}
                                            </span>
                                            {isOpen && (
                                                <span className="bg-black/50 backdrop-blur-md text-white text-[8px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-tighter">
                                                    Hoje: {todayHours}
                                                </span>
                                            )}
                                        </div>
                                    );
                                })()}
                                
                                <button 
                                    onClick={(e) => handleToggleFavorite(e, biz.id)}
                                    className="absolute top-2 right-2 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors z-20 group/heart"
                                >
                                    <Heart size={16} className={`transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-white group-hover/heart:text-red-200'}`} />
                                </button>
                            </div>
                            <div className="p-4 flex flex-col justify-between flex-1">
                                <div>
                                    <div className="flex justify-between items-start">
                                        <h3 className="text-lg font-bold text-ocean-900 line-clamp-1 flex items-center gap-2">
                                            {typeof biz.name === 'string' ? biz.name : 'Nome indisponível'}
                                            {biz.deliveryUrl && (
                                                <span title="Delivery Disponível" className="bg-ocean-50 text-ocean-600 px-2 py-0.5 rounded-full text-[10px] font-bold shrink-0">
                                                    Tem Entrega
                                                </span>
                                            )}
                                        </h3>
                                        <div className="flex items-center gap-1 bg-slate-50 px-1.5 py-0.5 rounded">
                                            <Star size={12} className="text-gold-500 fill-gold-500" />
                                            <span className="text-xs font-bold text-slate-700">{biz.rating}</span>
                                        </div>
                                    </div>
                                    <p className="text-slate-500 text-xs mb-2">
                                        {typeof biz.category === 'string' ? biz.category : ''}
                                    </p>
                                    <p className="text-slate-600 text-sm line-clamp-2 min-h-[2.5rem]">
                                        {typeof biz.description === 'string' ? biz.description : ''}
                                    </p>
                                </div>
                                {businessesWithCoupons.has(biz.id) && (
                                    <div className="absolute bottom-2 right-2 flex items-center gap-1 text-red-500 bg-red-50 px-2 py-1 rounded-lg shadow-sm" title="Cupom Disponível">
                                        <Ticket size={12} className="animate-pulse" />
                                        <span className="text-[9px] font-black uppercase tracking-wider">Cupom</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
            {businesses.length === 0 && (
                <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
                    <p className="text-slate-400">Nenhum lugar cadastrado nesta coleção ainda.</p>
                </div>
            )}
        </div>
    </div>
  );
};
