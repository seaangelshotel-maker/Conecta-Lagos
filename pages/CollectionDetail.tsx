
import React, { useEffect, useMemo, useState } from 'react';
import { Collection, BusinessProfile } from '../types';
import { getCollectionById, getBusinessById, checkIfOpen, getCoupons } from '../services/dataService';
import { ArrowLeft, Star, Heart, Ticket, Share2, MapPin, Truck, ChevronRight } from 'lucide-react';
import { shareContent } from '../services/native';
import { SEO } from '../components/SEO';
import { toggleFavorite, getCurrentUser } from '../services/dataService';
import { useNotification } from '../components/NotificationSystem';
import { recordInteraction } from '../services/interactionService';
import { getNavigationSource } from '../services/navigation';

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
  const [filter, setFilter] = useState<'all' | 'open' | 'coupon'>('all');
  const [favorites, setFavorites] = useState<string[]>(user?.favorites?.businesses || []);

  useEffect(() => {
    const fetchData = async () => {
      const col = await getCollectionById(collectionId);
      if (col) recordInteraction('collection_view', col.id, { source: getNavigationSource() });
      if (col) {
          setCollection(col);
          const ids = col.businessIds || [];
          const loadedBusinesses = await Promise.all(ids.map((id: string) => getBusinessById(id)));
          const filteredBusinesses = loadedBusinesses.filter((b: BusinessProfile | undefined): b is BusinessProfile => b !== undefined);
          // Deduplicate by business id
          const uniqueBusinesses = filteredBusinesses.filter((b, index, self) => 
            self.findIndex(x => x.id === b.id) === index
          );
          setBusinesses(uniqueBusinesses);
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

  const todayName = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'][new Date().getDay()];
  const rows = useMemo(() => businesses.map(b => ({ b, open: checkIfOpen(b.openingHours, b.category), coupon: businessesWithCoupons.has(b.id) })), [businesses, businessesWithCoupons]);
  const openCount = rows.filter(r => r.open).length;
  const couponCount = rows.filter(r => r.coupon).length;
  const visible = rows
    .filter(r => filter === 'all' || (filter === 'open' ? r.open : r.coupon))
    .sort((a, b) => Number(b.open) - Number(a.open));

  const handleShare = async () => {
    if (!collection) return;
    const r = await shareContent({ title: collection.title, text: `${collection.title}: coleção no Lagos GO`, url: `https://lagosgo.com.br/collections` });
    if (r === 'copied') notify('success', 'Link copiado!');
  };

  if (!collection) return (
    <div className="p-10 text-center flex flex-col items-center justify-center min-h-screen bg-slate-50">
      <div className="animate-spin rounded-full h-8 w-8 border-4 border-ocean-600 border-t-transparent mb-4"></div>
      <p className="text-slate-500 font-medium">Carregando coleção...</p>
    </div>
  );

  const chip = (id: 'all' | 'open' | 'coupon', label: string, n: number) => (
    <button
      key={id}
      onClick={() => setFilter(id)}
      aria-pressed={filter === id}
      data-testid={`collection-filter-${id}`}
      className={`shrink-0 h-9 px-4 rounded-full text-xs font-black border transition-colors ${filter === id ? 'bg-ocean-600 text-white border-ocean-600' : 'bg-white text-slate-600 border-slate-200'}`}
    >
      {label} <span className={filter === id ? 'text-white/80' : 'text-slate-400'}>{n}</span>
    </button>
  );

  return (
    <div className="bg-slate-50 min-h-screen pb-28" data-testid="collection-detail">
      <SEO title={collection.title} description={collection.description} url={`/collections`} />

      <div className="relative h-72 md:h-[40vh] w-full overflow-hidden">
        <img src={collection.coverImage} className="w-full h-full object-cover" alt="" />
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-950 via-ocean-950/50 to-black/20" />
        <button onClick={() => onNavigate('collections')} aria-label="Voltar para coleções" className="absolute top-4 left-4 bg-black/35 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center z-20 active:scale-95">
          <ArrowLeft size={20} />
        </button>
        <button onClick={handleShare} aria-label="Compartilhar coleção" data-testid="collection-share" className="absolute top-4 right-4 bg-black/35 backdrop-blur-md text-white w-10 h-10 rounded-full flex items-center justify-center z-20 active:scale-95">
          <Share2 size={18} />
        </button>
        <div className="absolute bottom-0 left-0 w-full px-5 pb-8 max-w-4xl">
          <span className="inline-block text-amber-300 font-black text-[11px] uppercase tracking-widest mb-2">Coleção Lagos GO</span>
          <h1 className="text-3xl md:text-5xl font-black text-white leading-tight drop-shadow-lg">{collection.title}</h1>
          <p className="mt-2 text-white/85 text-sm md:text-base max-w-2xl leading-relaxed line-clamp-3">{collection.description}</p>
          <p className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/20 backdrop-blur-md rounded-full px-3 py-1"><MapPin size={12} /> {rows.length} {rows.length === 1 ? 'lugar' : 'lugares'}</p>
        </div>
      </div>

      <div className="sticky top-0 z-30 bg-slate-50/95 backdrop-blur border-b border-slate-100" style={{ paddingTop: 'env(safe-area-inset-top)' }}>
        <div className="max-w-5xl mx-auto px-4 py-3 flex gap-2 overflow-x-auto hide-scrollbar">
          {chip('all', 'Todos', rows.length)}
          {chip('open', 'Abertos agora', openCount)}
          {chip('coupon', 'Com cupom', couponCount)}
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-5">
          {visible.map(({ b: biz, open, coupon }) => {
            const isFav = favorites.includes(biz.id);
            const todayHours = biz.openingHours?.[todayName] || 'Fechado';
            return (
              <article
                key={biz.id}
                onClick={() => onNavigate('business-detail', { businessId: biz.id })}
                data-testid="collection-place"
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 active:scale-[0.99] transition cursor-pointer flex"
              >
                <div className="relative w-32 sm:w-40 shrink-0">
                  <img src={biz.coverImage} className="absolute inset-0 w-full h-full object-cover" alt="" loading="lazy" />
                  <span className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-black text-white shadow ${open ? 'bg-emerald-500' : 'bg-slate-500'}`}>
                    {open ? 'Aberto' : 'Fechado'}
                  </span>
                </div>
                <div className="flex-1 min-w-0 p-3 flex flex-col">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-black text-ocean-950 leading-tight line-clamp-2">{typeof biz.name === 'string' ? biz.name : 'Nome indisponível'}</h3>
                    <button
                      onClick={e => handleToggleFavorite(e, biz.id)}
                      aria-label={isFav ? 'Remover dos favoritos' : 'Favoritar'}
                      aria-pressed={isFav}
                      className="shrink-0 -mr-1 -mt-1 w-8 h-8 rounded-full flex items-center justify-center active:scale-90"
                    >
                      <Heart size={18} className={isFav ? 'fill-red-500 text-red-500' : 'text-slate-300'} />
                    </button>
                  </div>
                  <p className="mt-0.5 flex items-center gap-2 text-xs text-slate-500">
                    <span className="inline-flex items-center gap-0.5 font-bold text-slate-700"><Star size={12} className="text-amber-500 fill-amber-500" /> {biz.rating}</span>
                    <span className="truncate">{typeof biz.category === 'string' ? biz.category : ''}</span>
                  </p>
                  <p className="mt-1.5 text-[13px] text-slate-600 line-clamp-2">{typeof biz.description === 'string' ? biz.description : ''}</p>
                  <div className="mt-auto pt-2 flex items-center gap-1.5 flex-wrap">
                    {open && <span className="text-[10px] font-bold text-slate-500">Hoje: {todayHours}</span>}
                    {biz.deliveryUrl && <span className="inline-flex items-center gap-1 text-[10px] font-black text-ocean-600 bg-ocean-50 rounded-full px-2 py-0.5"><Truck size={10} /> Entrega</span>}
                    {coupon && <span className="inline-flex items-center gap-1 text-[10px] font-black text-red-600 bg-red-50 rounded-full px-2 py-0.5"><Ticket size={10} /> Cupom</span>}
                    <ChevronRight size={16} className="ml-auto text-slate-300" />
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {visible.length === 0 && (
          <div className="text-center py-16 bg-white rounded-2xl border-2 border-dashed border-slate-200" data-testid="collection-empty">
            <p className="font-black text-ocean-950">{rows.length === 0 ? 'Nenhum lugar nesta coleção ainda.' : 'Nenhum lugar com esse filtro agora.'}</p>
            {rows.length > 0 && <button onClick={() => setFilter('all')} className="mt-3 text-xs font-black text-ocean-600 uppercase">Ver todos</button>}
          </div>
        )}
      </div>
    </div>
  );
};
