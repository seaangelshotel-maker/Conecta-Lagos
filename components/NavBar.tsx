
import React, { useEffect, useState } from 'react';
import { Home, Ticket, User, Compass, Sparkles, HandHeart } from 'lucide-react';
import { User as UserType, UserRole, AppConfig } from '../types';
import { getAppConfig, getCoupons } from '../services/dataService';
import { useLanguage } from '../hooks/useLanguage';

interface NavBarProps {
  currentUser: UserType | null;
  onNavigate: (page: string) => void;
  currentPage: string;
  onLogout: () => void;
}

export const NavBar: React.FC<NavBarProps> = ({ currentUser, onNavigate, currentPage, onLogout }) => {
  const { t } = useLanguage();
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

  const isActive = (pages: string[]) => pages.includes(currentPage);
  const tabClass = (pages: string[]) =>
    `flex flex-col items-center justify-center w-full h-full gap-1 transition-colors relative active:scale-95 ${isActive(pages) ? 'text-ocean-600' : 'text-slate-400'}`;

  // Barra de abas fixa no celular (estilo app). O "Perfil" é o ponto central da conta:
  // dele saem o painel da empresa, o painel de administração e o de jornalista.
  const MobileNav = () => (
    <nav
      className="fixed bottom-0 left-0 w-full bg-white/95 backdrop-blur-md border-t border-slate-100 grid grid-cols-6 px-1 z-50 md:hidden shadow-[0_-4px_10px_rgba(0,0,0,0.03)]"
      style={{ height: 'calc(4rem + env(safe-area-inset-bottom))', paddingBottom: 'env(safe-area-inset-bottom)' }}
      aria-label="Navegação principal"
    >
      <button onClick={() => onNavigate('home')} className={tabClass(['home', 'discover'])} aria-current={isActive(['home', 'discover']) ? 'page' : undefined}>
        <Home size={22} fill={currentPage === 'home' ? "currentColor" : "none"} />
        <span className="text-[10px] font-bold">{t('Início')}</span>
      </button>

      <button onClick={() => onNavigate('guide')} className={tabClass(['guide', 'collections', 'map'])} aria-current={isActive(['guide']) ? 'page' : undefined}>
        <Compass size={22} />
        <span className="text-[10px] font-bold">{t('Guia')}</span>
      </button>

      <button onClick={handleNavigateToSearch} className={tabClass(['search'])} aria-current={isActive(['search']) ? 'page' : undefined}>
        <span className="relative">
            <Ticket size={22} />
            {newCouponsCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[9px] font-bold h-4 min-w-4 px-1 flex items-center justify-center rounded-full shadow-sm border border-white">
                    {newCouponsCount > 9 ? '9+' : newCouponsCount}
                </span>
            )}
        </span>
        <span className="text-[10px] font-bold">{t('Cupons')}</span>
      </button>

      <button onClick={() => onNavigate('blog')} className={tabClass(['blog', 'blog-detail', 'journalist-profile', 'guide-article', 'events', 'event-detail'])} aria-current={isActive(['blog']) ? 'page' : undefined}>
        <Sparkles size={22} />
        <span className="text-[10px] font-bold">{t('Feed')}</span>
      </button>

      <button onClick={() => onNavigate('opportunities')} className={tabClass(['opportunities', 'opportunity-detail', 'opportunity-form', 'my-opportunities', 'opportunity-manage'])} aria-current={isActive(['opportunities']) ? 'page' : undefined}>
        <HandHeart size={22} />
        <span className="text-[10px] font-bold">{t('Ajuda')}</span>
      </button>

      <button
        onClick={() => onNavigate(currentUser ? 'user-dashboard' : 'login')}
        className={tabClass(['user-dashboard', 'admin-dashboard', 'journalist-dashboard'])}
        aria-current={isActive(['user-dashboard']) ? 'page' : undefined}
      >
        {currentUser?.avatarUrl ? (
            <img src={currentUser.avatarUrl} className="w-[22px] h-[22px] rounded-full border border-slate-200 object-cover" alt="" />
        ) : (
            <User size={22} />
        )}
        <span className="text-[10px] font-bold">{currentUser ? t('Perfil') : t('Entrar')}</span>
      </button>
    </nav>
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
      
      <div className="flex items-center gap-6 lg:gap-8">
        <button onClick={() => onNavigate('home')} className={`font-medium hover:text-gold-500 ${(currentPage === 'home' || currentPage === 'discover') ? 'text-ocean-950' : 'text-slate-500'}`}>{t('Início')}</button>
        <button onClick={() => onNavigate('guide')} className={`font-medium hover:text-gold-500 ${currentPage === 'guide' ? 'text-ocean-950' : 'text-slate-500'}`}>{t('Guia')}</button>
        <button onClick={handleNavigateToSearch} className={`font-medium hover:text-gold-500 relative ${currentPage === 'search' ? 'text-ocean-950' : 'text-slate-500'}`}>
            {t('Cupons')}
            {newCouponsCount > 0 && (
                <span className="absolute -top-2 -right-3 bg-red-500 text-white text-[9px] font-bold h-4 w-4 flex items-center justify-center rounded-full animate-pulse border border-white">
                    {newCouponsCount}
                </span>
            )}
        </button>
        <button onClick={() => onNavigate('opportunities')} className={`font-medium hover:text-gold-500 ${currentPage.startsWith('opportunit') || currentPage === 'my-opportunities' ? 'text-ocean-950' : 'text-slate-500'}`}>{t('Ajuda Colaborativa')}</button>
        <button onClick={() => onNavigate('blog')} className={`font-medium hover:text-gold-500 ${(currentPage === 'blog' || currentPage === 'blog-detail' || currentPage === 'guide-article') ? 'text-ocean-950' : 'text-slate-500'}`}>{t('Feed & Dicas')}</button>
        
        <button 
          onClick={() => onNavigate('pricing-plans')} 
          className="text-xs font-black uppercase tracking-widest text-ocean-600 hover:text-ocean-800 bg-ocean-50 px-4 py-2 rounded-xl border border-ocean-100 transition-all active:scale-95"
        >
          {t('Anuncie Conosco')}
        </button>
        
        {currentUser ? (
             <button onClick={() => onNavigate('user-dashboard')} className="flex items-center gap-2 text-ocean-600 font-bold border border-ocean-100 bg-ocean-50 px-4 py-1.5 rounded-full hover:bg-ocean-100">
                <User size={18} />
                <span>{t('Perfil')}</span>
             </button>
        ) : (
             <button onClick={() => onNavigate('login')} className="bg-gradient-to-r from-ocean-500 to-ocean-600 text-white font-bold px-6 py-2 rounded-full hover:shadow-lg hover:shadow-ocean-500/20 transition-all">
                {t('Entrar')}
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
