
import React, { useEffect, useState } from 'react';
import { Home, Ticket, User, Gem, Compass, BookOpen, ShieldCheck, PenTool } from 'lucide-react';
import { User as UserType, UserRole, AppConfig } from '../types';
import { getAppConfig, getCoupons } from '../services/dataService';

interface NavBarProps {
  currentUser: UserType | null;
  onNavigate: (page: string) => void;
  currentPage: string;
  onLogout: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({ currentUser, onNavigate, currentPage, onLogout }) => {
  const [config, setConfig] = useState<AppConfig>(getAppConfig());
  const [newCouponsCount, setNewCouponsCount] = useState(0);

  useEffect(() => {
      // Listen for branding changes
      const handleConfigUpdate = () => setConfig(getAppConfig());
      window.addEventListener('appConfigUpdated', handleConfigUpdate);
      
      // Check for new coupons logic
      const checkNewCoupons = async () => {
          const allCoupons = await getCoupons();
          const activeCount = allCoupons.filter(c => c.active).length;
          const lastSeen = parseInt(localStorage.getItem('last_seen_coupon_count') || '0', 10);
          
          if (activeCount > lastSeen) {
              setNewCouponsCount(activeCount - lastSeen);
          } else {
              setNewCouponsCount(0);
          }
      };

      checkNewCoupons();
      // Re-check whenever data updates
      window.addEventListener('dataUpdated', checkNewCoupons);

      return () => {
          window.removeEventListener('appConfigUpdated', handleConfigUpdate);
          window.removeEventListener('dataUpdated', checkNewCoupons);
      };
  }, []);
  
  const handleNavigateToSearch = async () => {
      onNavigate('search');
      // Reset notification badge
      const all = await getCoupons();
      const activeCount = all.filter(c => c.active).length;
      localStorage.setItem('last_seen_coupon_count', activeCount.toString());
      setNewCouponsCount(0);
  };

  const navItemClass = (page: string) => {
    const isActive = currentPage === page;
    const baseClass = "flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors py-1 relative";
    return `${baseClass} ${isActive ? 'text-ocean-600 font-medium' : 'text-slate-400 hover:text-slate-600'}`;
  };

  const MobileNav = () => (
    <div className="fixed bottom-0 left-0 w-full h-16 bg-white border-t border-slate-100 flex justify-around items-center px-1 z-50 md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
      
      <button onClick={() => onNavigate('home')} className={navItemClass('home')}>
        <Home size={20} fill={currentPage === 'home' ? "currentColor" : "none"} />
        <span className="text-[9px]">Início</span>
      </button>

      <button onClick={() => onNavigate('guide')} className={navItemClass('guide')}>
        <Compass size={20} />
        <span className="text-[9px]">Guia</span>
      </button>

      <button onClick={handleNavigateToSearch} className={navItemClass('search')}>
        <div className="relative">
            <Ticket size={20} />
            {newCouponsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full shadow-sm animate-pulse border border-white">
                    {newCouponsCount > 9 ? '9+' : newCouponsCount}
                </span>
            )}
        </div>
        <span className="text-[9px]">Cupons</span>
      </button>

      <button onClick={() => onNavigate('blog')} className={navItemClass('blog')}>
        <BookOpen size={20} />
        <span className="text-[9px]">Feed</span>
      </button>

      {currentUser?.role === UserRole.SUPER_ADMIN ? (
          <button onClick={() => onNavigate('admin-dashboard')} className={navItemClass('admin-dashboard')}>
            <ShieldCheck size={20} />
            <span className="text-[9px]">Admin</span>
          </button>
      ) : currentUser?.role === UserRole.COMPANY ? (
          <button onClick={() => onNavigate('admin-dashboard')} className={navItemClass('admin-dashboard')}>
            <Gem size={20} />
            <span className="text-[9px]">Empresa</span>
          </button>
      ) : currentUser?.role === UserRole.JOURNALIST ? (
          <button onClick={() => onNavigate('journalist-dashboard')} className={navItemClass('journalist-dashboard')}>
            <PenTool size={20} />
            <span className="text-[9px]">Jornalista</span>
          </button>
      ) : (
          <button onClick={() => onNavigate('user-dashboard')} className={navItemClass('user-dashboard')}>
            {currentUser?.avatarUrl ? (
                <img src={currentUser.avatarUrl} className="w-5 h-5 rounded-full border border-slate-200" alt="Me" />
            ) : (
                <User size={20} />
            )}
            <span className="text-[9px]">{currentUser ? 'Perfil' : 'Entrar'}</span>
          </button>
      )}

    </div>
  );

  const DesktopNav = () => (
    <div className="hidden md:flex w-full h-16 bg-white border-b border-slate-100 justify-between items-center px-8 fixed top-0 left-0 z-50 shadow-sm">
      <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
        {config.logoUrl ? (
            <img src={config.logoUrl} className="w-8 h-8 object-contain" alt="Logo" />
        ) : (
            <div className="text-gold-500 w-8 h-8">
                {/* Default Christ Icon */}
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                    <path d="M12 2v2" />
                    <path d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                    <path d="M2 10h20" />
                    <path d="M12 10v12" />
                    <path d="M12 22c-5 0-6-7-6-12" />
                    <path d="M12 22c5 0 6-7 6-12" />
                </svg>
            </div>
        )}
        <span className="text-xl font-bold text-ocean-950 tracking-wide">
          {config.appName.toUpperCase()} <span className="text-gold-500">{config.appNameHighlight.toUpperCase()}</span>
        </span>
      </div>
      
      <div className="flex items-center gap-8">
        <button onClick={() => onNavigate('home')} className={`font-medium hover:text-gold-500 ${currentPage === 'home' ? 'text-ocean-950' : 'text-slate-500'}`}>Início</button>
        <button onClick={() => onNavigate('guide')} className={`font-medium hover:text-gold-500 ${currentPage === 'guide' ? 'text-ocean-950' : 'text-slate-500'}`}>Guia</button>
        <button onClick={handleNavigateToSearch} className={`font-medium hover:text-gold-500 relative ${currentPage === 'search' ? 'text-ocean-950' : 'text-slate-500'}`}>
            Cupons
            {newCouponsCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-pulse border border-white">
                    {newCouponsCount}
                </span>
            )}
        </button>
        <button onClick={() => onNavigate('blog')} className={`font-medium hover:text-gold-500 ${currentPage === 'blog' ? 'text-ocean-950' : 'text-slate-500'}`}>Feed & Dicas</button>
        
        <button 
          onClick={() => onNavigate('pricing-plans')} 
          className="text-xs font-black uppercase tracking-widest text-ocean-600 hover:text-ocean-800 bg-ocean-50 px-4 py-2 rounded-xl border border-ocean-100 transition-all active:scale-95"
        >
          Anuncie Conosco
        </button>
        
        {currentUser ? (
             <button onClick={() => {
                 if (currentUser.role === UserRole.SUPER_ADMIN || currentUser.role === UserRole.COMPANY) {
                     onNavigate('admin-dashboard');
                 } else if (currentUser.role === UserRole.JOURNALIST) {
                     onNavigate('journalist-dashboard');
                 } else {
                     onNavigate('user-dashboard');
                 }
             }} className="flex items-center gap-2 text-ocean-600 font-bold border border-ocean-100 bg-ocean-50 px-4 py-1.5 rounded-full hover:bg-ocean-100">
                <User size={18} />
                <span>Perfil</span>
             </button>
        ) : (
             <button onClick={() => onNavigate('login')} className="bg-gradient-to-r from-ocean-500 to-ocean-600 text-white font-bold px-6 py-2 rounded-full hover:shadow-lg hover:shadow-ocean-500/20 transition-all">
                Entrar
             </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      <DesktopNav />
      <MobileNav />
    </>
  );
};
