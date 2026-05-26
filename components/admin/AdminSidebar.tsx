
import React from 'react';
import { 
  Plus, Ticket, Store, Star, 
  Settings, BarChart3, Users,
  Utensils, MapPin, Layers, Zap,
  PenTool, ShoppingBag, CreditCard, QrCode, HardDrive
} from 'lucide-react';
import { User, UserRole } from '../../types';

interface AdminSidebarProps {
  view: string;
  setView: (view: any) => void;
  currentUser: User;
  onNavigate: (page: string, params?: any) => void;
  onLogout: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ 
  view, setView, currentUser, onNavigate, onLogout 
}) => {
  const isSuperAdmin = currentUser.role === UserRole.SUPER_ADMIN;

  return (
    <div className="flex flex-nowrap md:flex-wrap gap-2 md:gap-3 overflow-x-auto md:overflow-x-visible pb-2 md:pb-0 scrollbar-hide -mx-4 px-4 md:mx-0 md:px-0">
      <button 
        onClick={() => setView('HOME')} 
        className={`px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all flex items-center gap-2 whitespace-nowrap ${view === 'HOME' ? 'bg-ocean-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-ocean-600 shadow-sm'}`}
      >
        <BarChart3 size={16} className="md:w-[18px] md:h-[18px]" /> DASHBOARD
      </button>

      <button 
        onClick={() => setView('COUPONS')} 
        className={`px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all flex items-center gap-2 whitespace-nowrap ${view === 'COUPONS' ? 'bg-ocean-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-ocean-600 shadow-sm'}`}
      >
        <Ticket size={16} className="md:w-[18px] md:h-[18px]" /> MEUS CUPONS
      </button>

      <button 
        onClick={() => setView('REDEMPTIONS')} 
        className={`px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all flex items-center gap-2 whitespace-nowrap ${view === 'REDEMPTIONS' ? 'bg-ocean-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-ocean-600 shadow-sm'}`}
      >
        <QrCode size={16} className="md:w-[18px] md:h-[18px]" /> RESGATES
      </button>

      {isSuperAdmin ? (
        <>
          <button 
            onClick={() => setView('BUSINESSES')} 
            className={`px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all flex items-center gap-2 whitespace-nowrap ${view === 'BUSINESSES' ? 'bg-ocean-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-ocean-600 shadow-sm'}`}
          >
            <Store size={16} className="md:w-[18px] md:h-[18px]" /> EMPRESAS
          </button>
          <button 
            onClick={() => setView('REQUESTS')} 
            className={`px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all flex items-center gap-2 whitespace-nowrap ${view === 'REQUESTS' ? 'bg-ocean-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-ocean-600 shadow-sm'}`}
          >
            <Layers size={16} className="md:w-[18px] md:h-[18px]" /> SOLICITAÇÕES
          </button>
          <button 
            onClick={() => setView('USERS')} 
            className={`px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all flex items-center gap-2 whitespace-nowrap ${view === 'USERS' ? 'bg-ocean-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-ocean-600 shadow-sm'}`}
          >
            <Users size={16} className="md:w-[18px] md:h-[18px]" /> USUÁRIOS
          </button>
          <button 
            onClick={() => setView('LOCATIONS')} 
            className={`px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all flex items-center gap-2 whitespace-nowrap ${view === 'LOCATIONS' ? 'bg-emerald-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-emerald-600 shadow-sm'}`}
          >
            <MapPin size={16} className="md:w-[18px] md:h-[18px]" /> LOCAIS
          </button>
          <button 
            onClick={() => setView('COLLECTIONS')} 
            className={`px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all flex items-center gap-2 whitespace-nowrap ${view === 'COLLECTIONS' ? 'bg-ocean-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-ocean-600 shadow-sm'}`}
          >
            <Layers size={16} className="md:w-[18px] md:h-[18px]" /> COLEÇÕES
          </button>
          <button 
            onClick={() => setView('REVIEWS')} 
            className={`px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all flex items-center gap-2 whitespace-nowrap ${view === 'REVIEWS' ? 'bg-ocean-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-ocean-600 shadow-sm'}`}
          >
            <Star size={16} className="md:w-[18px] md:h-[18px]" /> AVALIAÇÕES
          </button>
          <button 
            onClick={() => setView('PAYMENT_SETTINGS')} 
            className={`px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all flex items-center gap-2 whitespace-nowrap ${view === 'PAYMENT_SETTINGS' ? 'bg-purple-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-purple-600 shadow-sm'}`}
          >
            <CreditCard size={16} className="md:w-[18px] md:h-[18px]" /> PAGAMENTOS
          </button>
        </>
      ) : (
        <>
          <button 
            onClick={() => setView('MENU')} 
            className={`px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all flex items-center gap-2 whitespace-nowrap ${view === 'MENU' ? 'bg-ocean-600 text-white shadow-lg' : 'bg-white border border-slate-100 text-ocean-600 shadow-sm'}`}
          >
            <Utensils size={16} className="md:w-[18px] md:h-[18px]" /> CARDÁPIO
          </button>
          <button 
            onClick={() => setView('MY_PLAN')} 
            className={`px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs shadow-lg transition-all flex items-center gap-2 group whitespace-nowrap ${view === 'MY_PLAN' ? 'bg-gold-600 text-white' : 'bg-gradient-to-tr from-gold-500 to-gold-400 text-white shadow-gold-500/20'}`}
          >
            <Star size={16} className="md:w-[18px] md:h-[18px] group-hover:rotate-12 transition-transform" /> 
            <div className="text-left">
              <p className="leading-none">MEU PLANO</p>
              {currentUser.plan && <p className="text-[7px] md:text-[8px] opacity-80 mt-0.5 uppercase tracking-widest">{currentUser.plan}</p>}
            </div>
          </button>
          <button 
            onClick={() => setView(view === 'PROFILE' ? (isSuperAdmin ? 'BUSINESSES' : 'HOME') : 'PROFILE')} 
            className={`px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all flex items-center gap-2 whitespace-nowrap ${view === 'PROFILE' ? 'bg-slate-200 text-slate-700' : 'bg-white border border-slate-100 text-ocean-600 shadow-sm'}`}
          >
            <Settings size={16} className="md:w-[18px] md:h-[18px]" /> {view === 'PROFILE' ? 'VOLTAR' : 'CONFIGURAR EMPRESA'}
          </button>
          <button onClick={() => setView('CREATE_COUPON')} className="bg-ocean-600 text-white px-4 md:px-6 py-3 md:py-4 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs shadow-lg shadow-ocean-600/20 active:scale-95 transition-all whitespace-nowrap">
            + NOVO CUPOM
          </button>
        </>
      )}
      <button onClick={onLogout} className="px-4 md:px-6 py-3 md:py-4 bg-red-50 text-red-500 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs whitespace-nowrap">SAIR</button>
    </div>
  );
};
