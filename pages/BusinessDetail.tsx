
import { MenuCatalog } from '../components/MenuCatalog';
import { openLink } from '../services/native';
import { canOrder, orderTarget, cartAdd, cartSetNote, cartCount, cartTotal, cartLines, validateOrder, buildOrderMessage, whatsappUrl, formatBRL, isAvailable, type Cart, type OrderCustomer, type OrderMode } from '../services/orderModel';
import React, { useEffect, useState } from 'react';
import { ClaimBox } from '../components/ClaimBox';
import { 
  ArrowLeft, Clock, MapPin, Phone, Instagram, Globe, 
  MessageCircle, Share2, Loader2, Ticket, Search,
  Star, Heart, Utensils, Navigation, X, ShoppingCart, CalendarDays, Building2, ShoppingBag,
  ChevronLeft, ChevronRight, Store, Sparkles, Plus, Minus
} from 'lucide-react';
import { SEO } from '../components/SEO';
import { AmenityIcons } from '../components/AmenityIcons';
import { BusinessProfile, AMENITIES_LABELS, Coupon, User, PricingPlan, Review } from '../types';
import { getBusinessById, getCoupons, getCurrentUser, toggleFavorite, incrementBusinessView, redeemCoupon, trackAction, checkIfOpen, formatDayHours, todayKey, hasOpeningHours, createCompanyRequest, getPricingPlans, getReviewsByBusinessId, isSubscriptionExpired, getBusinesses } from '../services/dataService';
import { CouponCard } from '../components/CouponCard';
import { getNavigationSource } from '../services/navigation';
import { CouponModal } from '../components/CouponModal';
import { BusinessArticles } from '../components/RelatedContent';
import { useNotification } from '../components/NotificationSystem';
import { useLanguage, Translate } from '../hooks/useLanguage';
import { getPrivatePreview } from '../data/privatePreviews';
import { ReviewsSection } from '../components/ReviewsSection';

export const BusinessDetail: React.FC<{ businessId: string; previewKey?: string; onNavigate: (page: string, params?: any) => void }> = ({ businessId, previewKey, onNavigate }) => {
  const preview = previewKey ? getPrivatePreview(businessId, previewKey) : null;
  const withPreview = (b: BusinessProfile | undefined) => (b && preview ? { ...b, coverImage: preview.coverImage || b.coverImage, gallery: preview.gallery || b.gallery } : b);
  const { notify } = useNotification();
  const { t } = useLanguage();
  const [business, setBusiness] = useState<BusinessProfile | undefined>(undefined);
  const [plan, setPlan] = useState<PricingPlan | undefined>(undefined);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isFav, setIsFav] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showMenuOverlay, setShowMenuOverlay] = useState(false);
  const touchX = React.useRef<number | null>(null);
  const [cart, setCart] = useState<Cart>({});
  const [checkout, setCheckout] = useState(false);
  const [customer, setCustomer] = useState<OrderCustomer>({ name: '', delivery: 'pickup' });
  const [isOpen, setIsOpen] = useState<boolean | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [recommendedBusinesses, setRecommendedBusinesses] = useState<BusinessProfile[]>([]);

  useEffect(() => {
    const loadInitialData = async () => {
        setLoading(true);
        const [busData, revs, allBusinesses] = await Promise.all([
            getBusinessById(businessId),
            getReviewsByBusinessId(businessId),
            getBusinesses()
        ]);
        setBusiness(withPreview(busData));
        setReviews(revs);
        if (busData) {
            const related = allBusinesses
                .filter(b => b.id !== businessId && b.category === busData.category && !b.isBlocked)
                .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
                .slice(0, 4);
            setRecommendedBusinesses(related);
            
            const [allPlans, allCoupons] = await Promise.all([
                getPricingPlans(),
                getCoupons()
            ]);
            
            // O plano pode estar gravado pelo ID (admin/webhook) ou pelo nome (dados antigos).
            const busPlan = allPlans.find(p => p.id === busData.plan || p.name === busData.plan);
            setPlan(isSubscriptionExpired(busData) ? undefined : busPlan);

            incrementBusinessView(businessId, getNavigationSource());
            setIsOpen(checkIfOpen(busData.openingHours, busData.category) ? true : (hasOpeningHours(busData.openingHours) ? false : null));

            setCoupons(allCoupons.filter(c => c.companyId === businessId && c.active));
            const user = getCurrentUser();
            setCurrentUser(user);
            if (user && user.favorites?.businesses.includes(businessId)) setIsFav(true);
        }
        setLoading(false);
    };
    
    const handleDataUpdate = async () => {
        const [busData, revs, allBusinesses] = await Promise.all([
            getBusinessById(businessId),
            getReviewsByBusinessId(businessId),
            getBusinesses()
        ]);
        setBusiness(withPreview(busData));
        setReviews(revs);
        if (busData) {
            const related = allBusinesses
                .filter(b => b.id !== businessId && b.category === busData.category && !b.isBlocked)
                .sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0))
                .slice(0, 4);
            setRecommendedBusinesses(related);
            
            const [allPlans, allCoupons] = await Promise.all([
                getPricingPlans(),
                getCoupons()
            ]);
            
            const busPlan = allPlans.find(p => p.id === busData.plan || p.name === busData.plan);
            setPlan(isSubscriptionExpired(busData) ? undefined : busPlan);
            setIsOpen(checkIfOpen(busData.openingHours, busData.category) ? true : (hasOpeningHours(busData.openingHours) ? false : null));
            setCoupons(allCoupons.filter(c => c.companyId === businessId && c.active));
            const user = getCurrentUser();
            setCurrentUser(user);
            if (user && user.favorites?.businesses.includes(businessId)) setIsFav(true);
        }
    };

    loadInitialData();
    window.addEventListener('dataUpdated', handleDataUpdate);
    return () => window.removeEventListener('dataUpdated', handleDataUpdate);
  }, [businessId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        if (lightboxIndex === null || !business?.gallery) return;
        if (e.key === 'Escape') setLightboxIndex(null);
        if (e.key === 'ArrowLeft') setLightboxIndex(prev => prev !== null && prev > 0 ? prev - 1 : business.gallery!.length - 1);
        if (e.key === 'ArrowRight') setLightboxIndex(prev => prev !== null && prev < business.gallery!.length - 1 ? prev + 1 : 0);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxIndex, business?.gallery]);

  const handleAction = (type: 'menu' | 'social' | 'map' | 'share' | 'phone' | 'website' | 'delivery' | 'booking' | 'whatsapp') => {
      if (!business) return;
      trackAction(businessId, type, getNavigationSource());
      
      switch(type) {
          case 'whatsapp': {
              const digits = (business.whatsapp || '').replace(/\D/g, '');
              const number = digits.length <= 11 ? `55${digits}` : digits;
              const text = encodeURIComponent(`Olá! Encontrei a ${business.name} na Lagos GO.`);
              if (digits) openLink(`https://wa.me/${number}?text=${text}`);
              break;
          }
          case 'menu': setShowMenuOverlay(true); break;
          case 'social': if(business.instagram) {
              // Aceita @perfil, perfil ou o endereço completo do perfil.
              const ig = String(business.instagram).trim();
              openLink(/^https?:\/\//i.test(ig) ? ig : `https://instagram.com/${ig.replace('@', '')}`);
          } break;
          case 'phone': if(business.phone) openLink(`tel:${business.phone}`); break;
          case 'website': if(business.website) openLink(business.website.startsWith('http') ? business.website : `https://${business.website}`); break;
          case 'delivery': if(business.deliveryUrl) openLink(business.deliveryUrl); break;
          case 'booking': if(business.bookingUrl) openLink(business.bookingUrl); break;
          case 'map': {
              // Coordenadas quando houver; senão nome + localização (sem os complementos entre parênteses).
              // Sem coordenadas, o endereço sozinho localiza melhor: o nome pode casar com outro lugar parecido
              // (ex.: "Casa da Piedra" x "Casa da Pedra").
              const cleanAddress = (business.address || '').replace(/\(.*?\)/g, '').trim();
              const q = (typeof business.lat === 'number' && typeof business.lng === 'number')
                  ? `${business.lat},${business.lng}`
                  : (/\d/.test(cleanAddress) && cleanAddress.includes(',') ? cleanAddress : `${business.name}, ${cleanAddress}`);
              openLink(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(q)}`);
              break;
          }
          case 'share': 
            if (navigator.share) {
                navigator.share({ title: business.name, url: window.location.href }).catch(() => {});
            } else {
                navigator.clipboard.writeText(window.location.href);
                notify('success', "Link copiado!");
            }
            break;
      }
  };

  const handleToggleFavorite = () => {
    if (!currentUser) return notify('warning', "Faça login para favoritar.");
    toggleFavorite('business', businessId);
    setIsFav(!isFav);
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-ocean-500" size={40}/></div>;

  if (!business) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
              <div className="max-w-md w-full text-center space-y-6">
                  <div className="w-24 h-24 bg-ocean-100 rounded-full flex items-center justify-center mx-auto text-ocean-600 animate-bounce">
                      <Search size={48} />
                  </div>
                  <div className="space-y-2">
                      <h2 className="text-3xl font-black text-ocean-950">Empresa não encontrada</h2>
                      <p className="text-slate-500 font-medium">O perfil que você está procurando não existe ou foi removido do Lagos GO.</p>
                  </div>
                  <button onClick={() => onNavigate('home')} className="w-full bg-ocean-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-ocean-200 hover:bg-ocean-700 transition-all flex items-center justify-center gap-2">
                      <ArrowLeft size={20} /> VOLTAR AO INÍCIO
                  </button>
              </div>
          </div>
      );
  }

  // Handle Pending status for non-owners
  const isOwner = currentUser && (currentUser.id === business.ownerId || currentUser.role === 'SUPER_ADMIN');
  const isPending = business?.status === 'PENDING';

  if (isPending && !isOwner) {
      return (
          <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 font-sans">
              <div className="max-w-md w-full bg-white p-8 md:p-12 rounded-[2.5rem] shadow-2xl border border-amber-100 text-center space-y-8 animate-in zoom-in-95">
                  <div className="w-24 h-24 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600">
                      <Clock size={48} />
                  </div>
                  <div className="space-y-4">
                      <h2 className="text-3xl font-black text-amber-950 leading-tight">Perfil em Análise ⌛</h2>
                      <p className="text-slate-600 font-medium text-lg leading-relaxed text-center">
                          Esta empresa acabou de se cadastrar ou realizou edições importantes e está sendo revisada por nossa equipe.
                      </p>
                      <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                          <p className="text-amber-800 text-sm font-bold">
                              Em breve ela estará disponível no Guia Lagos GO!
                          </p>
                      </div>
                  </div>
                  <button onClick={() => onNavigate('home')} className="w-full bg-amber-600 text-white font-black py-4 rounded-2xl shadow-xl shadow-amber-200 hover:bg-amber-700 transition-all flex items-center justify-center gap-2">
                      <ArrowLeft size={20} /> VOLTAR AO GUIA
                  </button>
              </div>
          </div>
      );
  }

  return (
    <div className={`bg-white min-h-screen pb-32 ${showMenuOverlay ? 'overflow-hidden' : ''}`}>
        <SEO 
            title={business.name}
            description={(business.description || '').substring(0, 160)}
            image={business.coverImage}
            url={`/business/${businessId}`}
            noindex={!!preview}
        />
        <div className="relative h-[38vh] min-h-[300px] w-full bg-slate-950 flex items-center justify-center overflow-hidden">
            {business.coverImage ? (
                <img src={business.coverImage} className="w-full h-full object-cover opacity-90 transition-transform duration-700 hover:scale-102" alt={business.name} />
            ) : (
                <div className="flex flex-col items-center text-slate-500 z-10">
                    <Store size={48} className="mb-2 opacity-50" />
                    <span className="text-sm font-medium">Sem imagem</span>
                </div>
            )}
            {/* Deep Dark Gradient Overlay to ensure flawless text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/95 via-slate-950/50 to-black/30" />
            
            {/* Elegant Floating Header Buttons */}
            <div className="absolute top-6 left-0 w-full px-6 flex justify-between z-20">
                <button onClick={() => window.history.back()} className="bg-black/30 hover:bg-black/55 text-white p-3 rounded-2xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"><ArrowLeft size={20} /></button>
                <div className="flex gap-2">
                    <button onClick={() => handleAction('share')} className="bg-black/30 hover:bg-black/55 text-white p-3 rounded-2xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm"><Share2 size={20} /></button>
                    <button onClick={handleToggleFavorite} className={`p-3 rounded-2xl backdrop-blur-md hover:scale-105 active:scale-95 transition-all cursor-pointer shadow-sm ${isFav ? 'bg-red-500 text-white' : 'bg-black/30 text-white hover:bg-red-500'}`}><Heart className={isFav ? 'fill-white' : ''} size={20} /></button>
                </div>
            </div>
            
            {/* Title, Category & Status Metadata block */}
            <div className="absolute bottom-6 left-6 right-6 z-10 text-white max-w-4xl">
                <span className="bg-ocean-600 text-white px-3 py-1 rounded-xl text-[10px] font-black uppercase mb-3 inline-block tracking-wider shadow-lg">{business.category}</span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-2 leading-tight tracking-tight drop-shadow-md flex flex-wrap items-center gap-3">
                    <span translate="no" className="notranslate">{business.name}</span>
                    {business.deliveryUrl && (
                        <span title="Delivery Disponível" className="bg-red-500 text-white px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 shadow-md">
                            Tem Entrega
                        </span>
                    )}
                </h1>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-2">
                    <p className="text-xs sm:text-sm text-slate-200 font-bold flex items-center gap-1.5"><MapPin size={14} className="text-ocean-400 shrink-0"/> {business.address}</p>
                    {isOpen !== null && (
                        <div className={`flex items-center gap-1.5 text-xs font-black px-3 py-1 rounded-full shadow-md ${isOpen ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}`}>
                            <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            {isOpen ? 'Aberto Agora' : 'Fechado'}
                        </div>
                    )}
                </div>
            </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-10 space-y-12">
            {/* RÉGUA DE BOTÕES DINÂMICA */}
            <div className="overflow-x-auto hide-scrollbar -mx-6 px-6">
                <div className="flex gap-4 min-w-max pb-2">
                    {business.whatsapp && (
                        <button onClick={() => handleAction('whatsapp')} className="flex flex-col items-center gap-2 group" aria-label="Conversar no WhatsApp">
                            <div className="w-14 h-14 bg-emerald-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-active:scale-95 transition-all"><MessageCircle size={24}/></div>
                            <span className="text-[9px] font-black uppercase text-emerald-600">WhatsApp</span>
                        </button>
                    )}

                    {business.phone && (
                        <button onClick={() => handleAction('phone')} className="flex flex-col items-center gap-2 group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-ocean-600 shadow-md border border-slate-50 group-active:scale-95 transition-all"><Phone size={24}/></div>
                            <span className="text-[9px] font-black uppercase text-slate-400">Ligar</span>
                        </button>
                    )}
                    
                    {business.address && (
                        <button onClick={() => handleAction('map')} className="flex flex-col items-center gap-2 group">
                            <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-ocean-600 shadow-md border border-slate-50 group-active:scale-95 transition-all"><Navigation size={24}/></div>
                            <span className="text-[9px] font-black uppercase text-slate-400">Rota</span>
                        </button>
                    )}

                    {business.instagram && (plan?.showSocialMedia !== false) && (
                        <button onClick={() => handleAction('social')} className="flex flex-col items-center gap-2 group">
                            <div className="w-14 h-14 bg-gradient-to-tr from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-active:scale-95 transition-all"><Instagram size={24}/></div>
                            <span className="text-[9px] font-black uppercase text-slate-400">Instagram</span>
                        </button>
                    )}

                    {business.website && (plan?.showSocialMedia !== false) && (
                        <button onClick={() => handleAction('website')} className="flex flex-col items-center gap-2 group">
                            <div className="w-14 h-14 bg-ocean-100 rounded-2xl flex items-center justify-center text-ocean-600 shadow-md border border-ocean-200 group-active:scale-95 transition-all"><Globe size={24}/></div>
                            <span className="text-[9px] font-black uppercase text-slate-400">Website</span>
                        </button>
                    )}

                    {business.deliveryUrl && (
                        <button onClick={() => handleAction('delivery')} className="flex flex-col items-center gap-2 group">
                            <div className="w-14 h-14 bg-red-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-active:scale-95 transition-all"><ShoppingCart size={24}/></div>
                            <span className="text-[9px] font-black uppercase text-red-500">Delivery</span>
                        </button>
                    )}

                    {business.bookingUrl && (
                        <button onClick={() => handleAction('booking')} className="flex flex-col items-center gap-2 group">
                            <div className="w-14 h-14 bg-orange-500 rounded-2xl flex items-center justify-center text-white shadow-lg group-active:scale-95 transition-all"><CalendarDays size={24}/></div>
                            <span className="text-[9px] font-black uppercase text-orange-500">Reserva</span>
                        </button>
                    )}

                    {(plan?.showMenu !== false) && business.menu && business.menu.length > 0 && (
                        <button onClick={() => handleAction('menu')} className="flex flex-col items-center gap-2 group">
                            <div className="w-14 h-14 bg-ocean-600 rounded-2xl flex items-center justify-center text-white shadow-lg group-active:scale-95 transition-all"><Utensils size={24}/></div>
                            <span className="text-[9px] font-black uppercase text-ocean-600 font-bold">{canOrder(plan) && business.ordersEnabled && orderTarget(business) ? (business.orderMode === 'services' ? 'Solicitar' : 'Pedir') : (business.orderMode === 'services' ? 'Serviços' : 'Cardápio')}</span>
                        </button>
                    )}
                </div>
            </div>

            <BusinessArticles business={business} onNavigate={onNavigate} />

            <div className="space-y-4">
                <h3 className="text-xl font-black text-ocean-950">Sobre o Local</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{business.description}</p>
                {/* Lugares públicos pesquisados: mostra de onde veio a informação */}
                {Array.isArray((business as any).sources) && (business as any).sources.length > 0 && (
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                        Informações baseadas em:{' '}
                        {((business as any).sources as string[]).map((src, i) => {
                            let host = src;
                            try { host = new URL(src).hostname.replace('www.', ''); } catch { /* mantém o texto */ }
                            return <React.Fragment key={src}>{i > 0 && ', '}<a href={src} target="_blank" rel="noreferrer" className="underline hover:text-ocean-600">{host}</a></React.Fragment>;
                        })}
                        . Confira as condições no local antes de ir.
                    </p>
                )}
            </div>

            {/* COMODIDADES VISUAIS (com ícone) */}
            <AmenityIcons amenities={business.amenities} />

            {/* VITRINE DO CARDÁPIO */}
            {(plan?.showMenu !== false) && business.menu && business.menu.some(sec => sec.items?.length) && (() => {
                const all = business.menu.flatMap(sec => (sec.items || []).map(it => ({ ...it, sec: sec.title }))).filter(i => isAvailable(i));
                const feat = [...all.filter(i => i.imageUrl), ...all.filter(i => !i.imageUrl)].slice(0, 10);
                const mode = business.orderMode === 'services' ? 'services' : 'menu';
                return (
                    <div className="space-y-5 pt-2" data-testid="menu-showcase">
                        <div className="flex items-end justify-between gap-4">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-black text-ocean-950 tracking-tight">{mode === 'services' ? 'Serviços' : 'Cardápio'}</h3>
                                <p className="text-xs text-slate-400 font-bold mt-1">{business.menu.filter(x => x.items?.length).map(x => x.title).slice(0, 4).join(' · ')}</p>
                            </div>
                            <button type="button" onClick={() => handleAction('menu')} className="text-xs font-black uppercase tracking-wide text-ocean-600 whitespace-nowrap">Ver tudo</button>
                        </div>
                        <div className="flex gap-4 overflow-x-auto snap-x hide-scrollbar -mx-6 px-6 pb-2">
                            {feat.map(it => (
                                <button type="button" key={it.id} onClick={() => handleAction('menu')} className="snap-start shrink-0 w-40 text-left group">
                                    <div className="w-40 h-40 rounded-3xl overflow-hidden bg-gradient-to-br from-ocean-50 to-slate-100 shadow-md flex items-center justify-center text-ocean-200">
                                        {it.imageUrl ? <img src={it.imageUrl} alt={it.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" /> : <Utensils size={34} />}
                                    </div>
                                    <p className="mt-2 font-black text-sm text-ocean-950 leading-tight line-clamp-2">{it.name}</p>
                                    <p className="font-black text-emerald-700 text-sm">{it.price > 0 ? formatBRL(it.price) : 'Sob consulta'}</p>
                                </button>
                            ))}
                        </div>
                        <button type="button" onClick={() => handleAction('menu')} className="w-full py-4 rounded-2xl bg-ocean-600 text-white font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-ocean-600/20">
                            <Utensils size={18} /> {canOrder(plan) && business.ordersEnabled && orderTarget(business) ? (mode === 'services' ? 'Ver serviços e solicitar' : 'Ver cardápio e pedir') : (mode === 'services' ? 'Ver serviços' : 'Ver cardápio completo')}
                        </button>
                    </div>
                );
            })()}

            {/* GALERIA DE FOTOS */}
            {business.gallery && business.gallery.length > 0 && (preview || plan?.showGallery !== false) && (
                <div className="space-y-6 pt-2 pb-4">
                    <div className="flex flex-col items-center space-y-1 mb-6">
                        <h3 className="text-2xl md:text-3xl font-black text-ocean-950 tracking-tight">Galeria</h3>
                        <div className="w-12 h-1.5 rounded-full bg-ocean-500"></div>
                    </div>
                    <div className="flex gap-4 overflow-x-auto snap-x snap-mandatory hide-scrollbar -mx-6 px-6 pb-4 md:mx-0 md:px-0 md:grid md:grid-cols-3 md:overflow-visible" data-testid="gallery">
                        {business.gallery.map((img, idx) => (
                            <button type="button" key={idx} onClick={() => setLightboxIndex(idx)} aria-label={`Abrir foto ${idx + 1} de ${business.gallery!.length}`}
                                className={`group relative snap-center shrink-0 w-[78%] sm:w-64 md:w-auto aspect-[4/5] md:aspect-[4/3] rounded-[2rem] overflow-hidden shadow-xl shadow-slate-200/60 hover:-translate-y-1 hover:shadow-2xl transition-all duration-300 ${idx === 0 && business.gallery!.length > 3 ? 'md:col-span-2 md:row-span-2 md:aspect-auto' : ''}`}>
                                <img src={img} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" alt={`${business.name} galeria ${idx + 1}`} />
                                <span className="absolute bottom-3 right-3 text-[10px] font-black text-white bg-black/45 backdrop-blur px-2.5 py-1 rounded-full">{idx + 1}/{business.gallery!.length}</span>
                            </button>
                        ))}
                    </div>
                </div>
            )}


            <ClaimBox business={business} currentUser={currentUser} onLogin={() => onNavigate('login')} />

            {hasOpeningHours(business.openingHours) && (
            <div className="space-y-4">
                <h3 className="text-xl font-black text-ocean-950 flex items-center gap-2"><Clock size={20} className="text-ocean-600"/> Horário de Funcionamento</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 bg-slate-50 p-6 rounded-2xl border border-slate-100">
                    {['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'].map(day => {
                        const hours = formatDayHours(business.openingHours, day);
                        const isToday = todayKey() === day;
                        return (
                            <div key={day} className={`p-3 rounded-xl transition-all ${isToday ? 'bg-white shadow-sm border border-ocean-100 ring-1 ring-ocean-500/20' : ''}`}>
                                <div className="flex items-center gap-2 mb-1">
                                    <p className={`font-black text-[10px] uppercase tracking-wider ${isToday ? 'text-ocean-600' : 'text-slate-400'}`}>{day}</p>
                                    {isToday && <span className="w-1.5 h-1.5 rounded-full bg-ocean-500 animate-pulse" />}
                                </div>
                                <p className={`text-sm font-bold ${isToday ? 'text-ocean-950' : 'text-slate-600'}`}>{hours}</p>
                            </div>
                        );
                    })}
                </div>
            </div>
            )}

            {coupons.length > 0 && (
                <div className="space-y-6">
                    <h3 className="text-2xl font-black text-ocean-950 flex items-center gap-2"><Ticket size={24} className="text-ocean-600" /> Ofertas Exclusivas</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {coupons.map(coupon => <CouponCard key={coupon.id} coupon={coupon} onGetCoupon={setSelectedCoupon} />)}
                    </div>
                </div>
            )}

            {/* AVALIAÇÕES (verificadas: cupom usado ou check-in no local) */}
            {plan?.showReviews !== false && (
                <ReviewsSection
                    business={business}
                    currentUser={currentUser}
                    reviews={reviews}
                    onReload={async () => setReviews(await getReviewsByBusinessId(businessId))}
                    onLogin={() => onNavigate('login')}
                />
            )}

            {/* RECOMMENDED BUSINESSES */}
            {recommendedBusinesses.length > 0 && (
                <div className="space-y-6 pt-6 border-t border-slate-100">
                    <h3 className="text-xl font-black text-ocean-950 flex items-center gap-2">Talvez você goste <Sparkles className="text-amber-500" size={20}/></h3>
                    <div className="overflow-x-auto hide-scrollbar -mx-6 px-6 pb-4">
                        <div className="flex gap-4 w-max">
                            {recommendedBusinesses.map(relBus => (
                                <div 
                                    key={relBus.id}
                                    onClick={() => onNavigate('business-detail', { businessId: relBus.id })}
                                    className="w-48 bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm cursor-pointer group hover:-translate-y-1 transition-transform"
                                >
                                    <div className="h-32 w-full overflow-hidden">
                                        <img src={relBus.coverImage || relBus.logo} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={relBus.name}/>
                                    </div>
                                    <div className="p-4">
                                        <h4 className="font-bold text-ocean-950 text-sm line-clamp-1">{relBus.name}</h4>
                                        <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><MapPin size={10}/> {relBus.city}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>

        {showMenuOverlay && (() => {
            const mode: OrderMode = business.orderMode === 'services' ? 'services' : 'menu';
            const target = orderTarget(business);
            const ordersOn = canOrder(plan) && business.ordersEnabled === true && !!target;
            const count = cartCount(cart);
            const total = cartTotal(cart, business.menu || []);
            const sendOrder = () => {
                const err = validateOrder(mode, cart, business.menu || [], customer);
                if (err) { notify('warning', err); return; }
                const msg = buildOrderMessage(business.name, mode, cart, business.menu || [], customer);
                trackAction(businessId, 'order', getNavigationSource());
                openLink(whatsappUrl(target, msg));
                setCart({}); setCheckout(false);
                notify('success', 'Pedido pronto! Finalize a conversa no WhatsApp.');
            };
            return (
            <div className="fixed inset-0 z-[100] bg-white animate-in slide-in-from-bottom flex flex-col" data-testid="menu-overlay">
                <div className="p-6 border-b flex justify-between items-center pt-12">
                    <h2 className="text-2xl font-black text-ocean-950">{checkout ? 'Finalizar pedido' : mode === 'services' ? 'Serviços' : 'Cardápio Digital'}</h2>
                    <button onClick={() => { setShowMenuOverlay(false); setCheckout(false); }} className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center" aria-label="Fechar"><X size={24}/></button>
                </div>
                {!checkout ? (
                <div className="flex-1 overflow-y-auto px-6 pb-32 pt-4 space-y-4 bg-slate-50/60">
                    {ordersOn && <p className="text-xs text-slate-500 bg-ocean-50 rounded-xl p-3 font-bold">Monte seu pedido e envie direto para o WhatsApp de {business.name}. Sem taxas do app.</p>}
                    {business.menu && business.menu.length > 0 && <MenuCatalog menu={business.menu} ordersOn={ordersOn} cart={cart} setCart={setCart} />}
                    {(!business.menu || business.menu.length === 0) && <p className="text-center py-20 text-slate-400">{mode === 'services' ? 'Os serviços serão' : 'O cardápio será'} disponibilizado em breve.</p>}
                </div>
                ) : (
                <div className="flex-1 overflow-y-auto p-6 space-y-5 pb-32" data-testid="checkout">
                    <div className="space-y-3">
                        {cartLines(cart, business.menu || []).map(l => (
                            <div key={l.itemId} className="bg-slate-50 rounded-2xl p-4 space-y-2">
                                <div className="flex justify-between font-bold text-sm text-ocean-950"><span>{l.qty}x {l.item.name}</span><span>{l.item.price > 0 ? formatBRL(l.item.price * l.qty) : ''}</span></div>
                                <input className="w-full text-xs bg-white border border-slate-200 rounded-lg p-2" placeholder="Observação (ex.: sem cebola)" maxLength={140} value={l.note || ''} onChange={e => setCart(c => cartSetNote(c, l.itemId, e.target.value))} />
                            </div>
                        ))}
                        {total > 0 && <div className="flex justify-between font-black text-ocean-950 px-1"><span>Total estimado</span><span data-testid="order-total">{formatBRL(total)}</span></div>}
                    </div>
                    <input data-testid="cust-name" className="w-full border border-slate-200 rounded-xl p-3 text-sm font-bold" placeholder="Seu nome" value={customer.name} onChange={e => setCustomer({ ...customer, name: e.target.value })} />
                    {mode === 'menu' ? (<>
                        <div className="flex gap-2">
                            {(['pickup', 'delivery'] as const).map(m => (
                                <button key={m} type="button" data-testid={`recv-${m}`} onClick={() => setCustomer({ ...customer, delivery: m })} className={`flex-1 p-3 rounded-xl text-xs font-black uppercase border ${(customer.delivery || 'pickup') === m ? 'bg-ocean-600 text-white border-ocean-600' : 'bg-white text-slate-500 border-slate-200'}`}>{m === 'pickup' ? 'Retirar no local' : 'Entrega'}</button>
                            ))}
                        </div>
                        {customer.delivery === 'delivery' && <input data-testid="cust-address" className="w-full border border-slate-200 rounded-xl p-3 text-sm" placeholder="Endereço completo para entrega" value={customer.address || ''} onChange={e => setCustomer({ ...customer, address: e.target.value })} />}
                    </>) : (<>
                        <input data-testid="cust-date" className="w-full border border-slate-200 rounded-xl p-3 text-sm" placeholder="Data ou período desejado (ex.: sábado de manhã)" value={customer.date || ''} onChange={e => setCustomer({ ...customer, date: e.target.value })} />
                        <input data-testid="cust-people" type="number" min={1} className="w-full border border-slate-200 rounded-xl p-3 text-sm" placeholder="Quantas pessoas?" value={customer.people || ''} onChange={e => setCustomer({ ...customer, people: Number(e.target.value) || undefined })} />
                    </>)}
                    <textarea className="w-full border border-slate-200 rounded-xl p-3 text-sm" rows={2} placeholder="Observações gerais (opcional)" value={customer.note || ''} onChange={e => setCustomer({ ...customer, note: e.target.value })} />
                    <p className="text-[11px] text-slate-400">Ao enviar, o WhatsApp abre com a mensagem pronta. Valores e disponibilidade são confirmados pelo estabelecimento.</p>
                </div>
                )}
                {ordersOn && count > 0 && (
                    <div className="absolute bottom-0 inset-x-0 p-4 bg-gradient-to-t from-white via-white to-transparent flex gap-3">
                        {checkout && <button onClick={() => setCheckout(false)} className="px-5 rounded-2xl border border-slate-200 font-black text-xs uppercase">Voltar</button>}
                        <button data-testid={checkout ? 'send-order' : 'open-checkout'} onClick={() => checkout ? sendOrder() : setCheckout(true)} className="flex-1 bg-green-600 text-white py-4 rounded-2xl font-black flex items-center justify-center gap-2">
                            {checkout ? <>ENVIAR PELO WHATSAPP</> : <>{count} {count === 1 ? 'item' : 'itens'} · {total > 0 ? formatBRL(total) : 'ver pedido'}</>}
                        </button>
                    </div>
                )}
            </div>);
        })()}

        {selectedCoupon && <CouponModal coupon={selectedCoupon} onClose={() => setSelectedCoupon(null)} onRedeem={(c) => redeemCoupon(currentUser?.id || '', c)} isRedeemed={false} />}

        {/* LIGHTBOX GALERIA */}
        {lightboxIndex !== null && business.gallery && (
            <div className="fixed inset-0 z-[200] bg-black/95 flex items-center justify-center animate-in fade-in"
                onTouchStart={e => { touchX.current = e.touches[0].clientX; }}
                onTouchEnd={e => {
                    const x0 = touchX.current; touchX.current = null;
                    if (x0 === null) return;
                    const dx = e.changedTouches[0].clientX - x0;
                    const n = business.gallery!.length;
                    if (Math.abs(dx) > 50) setLightboxIndex(prev => prev === null ? null : dx < 0 ? (prev + 1) % n : (prev - 1 + n) % n);
                }}>
                <button 
                    onClick={() => setLightboxIndex(null)} 
                    className="absolute top-6 right-6 text-white/70 hover:text-white bg-black/50 p-3 rounded-full backdrop-blur-md transition-all z-50"
                >
                    <X size={24} />
                </button>
                
                <button 
                    onClick={() => setLightboxIndex(prev => prev !== null && prev > 0 ? prev - 1 : business.gallery!.length - 1)}
                    className="absolute left-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 p-3 rounded-full backdrop-blur-md transition-all z-50"
                >
                    <ChevronLeft size={32} />
                </button>

                <div className="w-full max-w-5xl px-4 md:px-16 flex items-center justify-center h-full">
                    <img 
                        src={business.gallery[lightboxIndex]} 
                        alt={`Galeria ${lightboxIndex + 1}`} 
                        className="max-w-full max-h-[85vh] object-contain rounded-xl shadow-2xl animate-in zoom-in-95 duration-300"
                    />
                </div>

                <button 
                    onClick={() => setLightboxIndex(prev => prev !== null && prev < business.gallery!.length - 1 ? prev + 1 : 0)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-white/70 hover:text-white bg-black/50 p-3 rounded-full backdrop-blur-md transition-all z-50"
                >
                    <ChevronRight size={32} />
                </button>

                <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 font-bold text-sm bg-black/50 px-4 py-2 rounded-full backdrop-blur-md">
                    {lightboxIndex + 1} / {business.gallery.length}
                </div>
            </div>
        )}
    </div>
  );
};
