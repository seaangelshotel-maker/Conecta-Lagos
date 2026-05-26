
import React, { useState } from 'react';
import { Star, Heart, Flame } from 'lucide-react';
import { Coupon, User } from '../types';
import { getCurrentUser, toggleFavorite } from '../services/dataService';
import { useNotification } from './NotificationSystem';

interface CouponCardProps {
  coupon: Coupon;
  onGetCoupon: (coupon: Coupon) => void;
  isRedeemed?: boolean;
}

export const CouponCard: React.FC<CouponCardProps> = ({ coupon, onGetCoupon, isRedeemed = false }) => {
  const { notify } = useNotification();
  // Use local state for immediate feedback, synced with localStorage via service
  const user = getCurrentUser();
  const [isFav, setIsFav] = useState(user?.favorites?.coupons.includes(coupon.id) || false);

  const handleToggleFavorite = (e: React.MouseEvent) => {
      e.stopPropagation(); // Don't open modal
      if (!user) {
          notify('warning', "Você precisa estar logado.");
          return;
      }
      toggleFavorite('coupon', coupon.id);
      setIsFav(!isFav);
  };

  // Scarcity Logic
  const max = coupon.maxRedemptions || 0;
  const current = coupon.currentRedemptions || 0;
  const isLimited = max > 0;
  const percentClaimed = isLimited ? Math.min(100, (current / max) * 100) : 0;
  const isSoldOut = isLimited && current >= max;
  const isLowStock = isLimited && !isSoldOut && percentClaimed >= 80;

  return (
    <div 
        onClick={() => !isSoldOut && onGetCoupon(coupon)}
        className={`group relative bg-white rounded-2xl overflow-hidden shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col h-full transition-all duration-300 ${isSoldOut ? 'opacity-70 grayscale cursor-not-allowed' : 'cursor-pointer hover:shadow-xl hover:-translate-y-1 active:scale-[0.98]'}`}
    >
      {/* Image Section */}
      <div className="relative aspect-[4/3] md:aspect-video shrink-0 overflow-hidden bg-slate-100">
        <img 
          src={coupon.imageUrl} 
          alt={coupon.title} 
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-80" />
        
        {/* Badges */}
        {isSoldOut ? (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center z-30">
                <span className="text-white font-bold border-2 border-white px-4 py-1 rounded-lg uppercase tracking-widest text-sm -rotate-12">Esgotado</span>
            </div>
        ) : isLowStock ? (
            <div className="absolute top-2 left-2 z-20 bg-red-500 text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 shadow-md animate-pulse">
                <Flame size={12} fill="currentColor" /> ACABANDO
            </div>
        ) : null}

        {/* Favorite Button */}
        <button 
            onClick={handleToggleFavorite}
            className="absolute top-2 right-2 p-2 rounded-full bg-white/20 hover:bg-white/40 backdrop-blur-sm transition-colors z-20 group/heart"
        >
            <Heart size={18} className={`transition-colors ${isFav ? 'fill-red-500 text-red-500' : 'text-white group-hover/heart:text-red-200'}`} />
        </button>

        {/* Logo Overlay */}
        <div className="absolute bottom-3 left-3 flex items-center gap-2">
             <div className="w-9 h-9 rounded-xl bg-white p-0.5 shadow-lg overflow-hidden flex items-center justify-center">
                 {coupon.companyLogo ? (
                     <img src={coupon.companyLogo} className="w-full h-full object-cover rounded-lg" alt="logo" />
                 ) : (
                     <div className="w-full h-full bg-slate-800 text-white flex items-center justify-center rounded-lg text-xs font-bold uppercase">
                         {coupon.companyName.substring(0, 2)}
                     </div>
                 )}
             </div>
             <div className="flex flex-col items-start">
                 <span className="text-[10px] text-white/90 font-medium leading-none mb-1">{coupon.category}</span>
                 <div className="flex items-center gap-1 bg-black/30 px-1.5 py-0.5 rounded-md backdrop-blur-md">
                     <Star size={10} className="text-gold-400 fill-gold-400" />
                     <span className="text-[10px] text-white font-bold">{coupon.rating?.toFixed(1) || '5.0'}</span>
                 </div>
             </div>
        </div>
      </div>
      
      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1 justify-between bg-white relative z-10">
          <div>
            <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 rounded-full bg-ocean-500" />
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider truncate max-w-[120px]">{coupon.companyName}</span>
                </div>
                {coupon.active && !isSoldOut && <span className="flex items-center gap-1 text-[9px] font-bold text-green-600 bg-green-50 px-1.5 py-0.5 rounded-full">ATIVO</span>}
            </div>
            <h4 className="font-black text-ocean-950 text-lg leading-[1.2] mb-2 line-clamp-2 group-hover:text-ocean-600 transition-colors tracking-tight">{coupon.title}</h4>
            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-medium">{coupon.description}</p>
          </div>
          
          <div className="mt-5 pt-4 border-t border-slate-50">
              <div className="flex items-end justify-between mb-3">
                  <div className="flex flex-col">
                      <span className="text-[10px] text-slate-400 line-through font-bold mb-0.5">DE R$ {coupon.originalPrice.toFixed(2)}</span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-sm font-black text-ocean-900">POR R$</span>
                        <span className="text-2xl font-black text-green-600 tracking-tighter">{coupon.discountedPrice.toFixed(2)}</span>
                      </div>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                      <span className="text-[10px] font-black text-green-700 bg-green-100 px-2 py-1 rounded-lg border border-green-200 shadow-sm">
                          -{coupon.discountPercentage}% OFF
                      </span>
                  </div>
              </div>

              {/* Scarcity Bar */}
              {isLimited && !isSoldOut && (
                  <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden mt-1">
                      <div 
                        className={`h-full rounded-full ${percentClaimed > 80 ? 'bg-red-500' : 'bg-ocean-400'}`} 
                        style={{ width: `${percentClaimed}%` }}
                      ></div>
                  </div>
              )}
              {isLimited && !isSoldOut && (
                  <p className="text-[9px] text-slate-400 text-right mt-1">
                      {current}/{max} resgatados
                  </p>
              )}
          </div>
      </div>
    </div>
  );
};
