
import React, { useState, useEffect } from 'react';
import { MapPin, Navigation, X, Loader2 } from 'lucide-react';
import { Coupon } from '../types';
import { getCoupons, calculateDistance } from '../services/dataService';

// Bounds of Rio de Janeiro (Greater Rio) for mapping logic
// Expanded to cover Sepetiba (West) to Niterói (East) and North Zone
// Top-Left (North-West): Near Seropédica/Itaguaí
const BOUNDS_NW = { lat: -22.75, lng: -43.75 };
// Bottom-Right (South-East): Near Itaipu/Ocean
const BOUNDS_SE = { lat: -23.10, lng: -42.90 };

export const MapPage: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
        // Check for cached GPS
        const storedGps = sessionStorage.getItem('user_gps');
        if (storedGps) {
            setUserLocation(JSON.parse(storedGps));
        } else {
            // Try getting it fresh if not stored
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                    setUserLocation(loc);
                    sessionStorage.setItem('user_gps', JSON.stringify(loc));
                },
                () => console.log('GPS denied')
            );
        }

        const data = await getCoupons();
        setCoupons(data.filter(c => c.active));
        setLoading(false);
    };

    fetchData();
  }, []);

  // Simple projection function: Maps Lat/Lng to % of the container
  const getPosition = (lat?: number, lng?: number) => {
      if (!lat || !lng) return { top: '50%', left: '50%', display: 'none' };
      
      const latRange = BOUNDS_SE.lat - BOUNDS_NW.lat; // Negative value
      const lngRange = BOUNDS_SE.lng - BOUNDS_NW.lng; // Positive value

      const latPercent = ((lat - BOUNDS_NW.lat) / latRange) * 100;
      const lngPercent = ((lng - BOUNDS_NW.lng) / lngRange) * 100;

      // Clamp to screen to avoid overflow
      const top = Math.max(5, Math.min(95, latPercent));
      const left = Math.max(5, Math.min(95, lngPercent));

      return { top: `${top}%`, left: `${left}%` };
  };

  return (
    <div className="relative w-full h-screen bg-[#eef6f8] overflow-hidden">
        
        {/* Background - Simplified Rio Geometry Abstract */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
            {/* Mainland */}
            <div className="absolute top-0 left-0 w-full h-full bg-[#cbd5e1] opacity-20"></div>
            {/* Ocean Mask (rough shape for Rio Coast) */}
            <div className="absolute bottom-0 right-0 w-[100%] h-[40%] bg-[#eef6f8] rounded-tl-[300px]"></div>
            <div className="absolute top-[50%] right-[20%] w-[10%] h-[10%] bg-[#0ea5e9] opacity-20 rounded-full blur-xl"></div>
        </div>

        {/* Grid */}
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#94a3b8 1px, transparent 1px)', backgroundSize: '30px 30px', opacity: 0.3 }}></div>

        {/* Header Overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 z-10 bg-gradient-to-b from-white via-white/90 to-transparent pt-6 pb-12">
            <h1 className="text-2xl font-bold text-ocean-950">Mapa Interativo (RJ)</h1>
            <p className="text-xs text-slate-500 flex items-center gap-1">
               {userLocation ? <span className="text-green-600 font-bold flex items-center gap-1"><Navigation size={10}/> GPS Ativo</span> : 'Mostrando todas as ofertas'}
            </p>
        </div>

        {/* User Location Pin */}
        {userLocation && (
            <div 
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none transition-all duration-1000"
                style={getPosition(userLocation.lat, userLocation.lng)}
            >
                <div className="relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                    <div className="w-4 h-4 bg-blue-600 rounded-full border-2 border-white shadow-lg relative z-10"></div>
                    <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[8px] font-bold px-1.5 py-0.5 rounded shadow">VOCÊ</div>
                </div>
            </div>
        )}

        {/* Business Pins */}
        <div className="absolute inset-0 mt-0 mb-0">
            {loading && <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-50"><Loader2 className="animate-spin text-ocean-500"/></div>}
            
            {!loading && coupons.map(coupon => {
                const pos = getPosition(coupon.lat, coupon.lng);
                const isSelected = selectedCoupon?.id === coupon.id;

                return (
                    <button
                        key={coupon.id}
                        onClick={() => setSelectedCoupon(coupon)}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 transition-all duration-300 group ${isSelected ? 'z-40 scale-125' : 'z-30 scale-100 hover:scale-110'}`}
                        style={pos}
                    >
                        <div className={`relative flex items-center justify-center w-10 h-10 rounded-full shadow-lg border-2 transition-colors ${isSelected ? 'bg-ocean-600 border-white' : 'bg-white border-ocean-500 group-hover:border-ocean-400'}`}>
                           {coupon.companyLogo ? (
                               <img src={coupon.companyLogo} className="w-full h-full rounded-full object-cover p-0.5" />
                           ) : (
                               <MapPin size={20} className={isSelected ? 'text-white' : 'text-ocean-500'} />
                           )}
                           
                           {/* Pin Point */}
                           <div className={`absolute -bottom-1 left-1/2 -translate-x-1/2 w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] ${isSelected ? 'border-t-ocean-600' : 'border-t-white'}`}></div>
                        </div>
                    </button>
                );
            })}
        </div>

        {/* Selected Coupon Preview */}
        {selectedCoupon && (
            <div className="absolute bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-10">
                <div className="bg-white rounded-2xl p-4 shadow-[0_10px_40px_-10px_rgba(0,0,0,0.2)] border border-slate-100 relative">
                    <button 
                        onClick={() => setSelectedCoupon(null)}
                        className="absolute -top-3 -right-3 bg-white text-slate-400 p-1.5 rounded-full shadow-md hover:text-red-500 border border-slate-100"
                    >
                        <X size={16} />
                    </button>
                    
                    <div className="flex gap-4">
                        <img src={selectedCoupon.imageUrl} className="w-20 h-20 rounded-xl object-cover bg-slate-100" />
                        <div className="flex-1 overflow-hidden">
                            <h3 className="font-bold text-ocean-900 text-sm truncate">{selectedCoupon.companyName}</h3>
                            <p className="text-xs text-slate-500 line-clamp-1 mb-1">{selectedCoupon.title}</p>
                            
                            {userLocation && selectedCoupon.lat && selectedCoupon.lng && (
                                <p className="text-xs text-ocean-600 font-bold flex items-center gap-1 mb-2">
                                    <Navigation size={10} /> 
                                    {calculateDistance(userLocation.lat, userLocation.lng, selectedCoupon.lat, selectedCoupon.lng).toFixed(1)} km de distância
                                </p>
                            )}
                            
                            <div className="flex justify-between items-center mt-2 border-t border-slate-50 pt-2">
                                <div className="flex flex-col leading-none">
                                    <span className="text-[10px] text-slate-400 line-through">R$ {selectedCoupon.originalPrice}</span>
                                    <span className="text-green-600 font-bold text-lg">R$ {selectedCoupon.discountedPrice}</span>
                                </div>
                                <button className="bg-ocean-600 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-lg shadow-ocean-500/30">
                                    Ver Detalhes
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </div>
  );
};
