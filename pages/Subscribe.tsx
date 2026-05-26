import React from 'react';
import { Check, Star, Shield } from 'lucide-react';
import { getAppConfig } from '../services/dataService';

export const SubscribePage: React.FC = () => {
  const config = getAppConfig();

  return (
    <div className="min-h-screen bg-slate-50 pb-24">
      {/* Hero Header */}
      <div className="bg-ocean-900 text-white pt-12 pb-24 px-6 rounded-b-[3rem] text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
          <div className="mx-auto mb-4 w-16 h-16 bg-white/10 rounded-full p-2 flex items-center justify-center text-gold-500 overflow-hidden backdrop-blur-sm">
             {config.loginLogoUrl || config.logoUrl ? (
                 <img src={config.loginLogoUrl || config.logoUrl} className="w-full h-full object-contain" />
             ) : (
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-full h-full">
                    <path d="M12 2v2" />
                    <path d="M12 5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                    <path d="M2 10h20" />
                    <path d="M12 10v12" />
                    <path d="M12 22c-5 0-6-7-6-12" />
                    <path d="M12 22c5 0 6-7 6-12" />
                </svg>
             )}
          </div>
          <h1 className="text-3xl font-bold mb-2">Clube {config.appName} <span className="text-gold-500">{config.appNameHighlight}</span></h1>
          <p className="text-ocean-200 text-sm max-w-xs mx-auto">Desbloqueie descontos exclusivos e economize mais de R$ 5.000,00 na sua viagem.</p>
      </div>

      {/* Pricing Cards */}
      <div className="-mt-16 px-4 space-y-6 max-w-md mx-auto relative z-10">
          
          {/* Plan 1: Turista */}
          <div className="bg-white rounded-2xl p-6 shadow-xl border border-slate-100">
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold text-ocean-900">Passe Turista</h3>
                  <span className="bg-ocean-100 text-ocean-700 text-xs font-bold px-2 py-1 rounded">7 Dias</span>
              </div>
              <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-bold text-ocean-900">R$ 29</span>
                  <span className="text-slate-400 text-sm mb-1">,90</span>
              </div>
              <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500"/> Acesso a todos os cupons</li>
                  <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500"/> Uso ilimitado por 7 dias</li>
                  <li className="flex items-center gap-2 text-sm text-slate-600"><Check size={16} className="text-green-500"/> Suporte via WhatsApp</li>
              </ul>
              <button className="w-full bg-ocean-100 text-ocean-700 font-bold py-3 rounded-xl hover:bg-ocean-200 transition-colors">
                  Assinar Agora
              </button>
          </div>

          {/* Plan 2: VIP (Featured) */}
          <div className="bg-gradient-to-br from-ocean-600 to-ocean-800 text-white rounded-2xl p-6 shadow-2xl relative overflow-hidden border border-ocean-500 transform scale-105">
              <div className="absolute top-0 right-0 bg-gold-500 text-ocean-950 text-[10px] font-bold px-3 py-1 rounded-bl-xl uppercase">Mais Vendido</div>
              
              <div className="flex justify-between items-center mb-4">
                  <h3 className="text-xl font-bold">VIP Anual</h3>
                  <span className="bg-white/20 text-white text-xs font-bold px-2 py-1 rounded">12 Meses</span>
              </div>
              <div className="flex items-end gap-1 mb-6">
                  <span className="text-4xl font-bold text-white">R$ 97</span>
                  <span className="text-ocean-200 text-sm mb-1">,00</span>
              </div>
              <ul className="space-y-3 mb-6">
                  <li className="flex items-center gap-2 text-sm"><Star size={16} className="text-gold-500"/> Acesso VITALÍCIO no ano</li>
                  <li className="flex items-center gap-2 text-sm"><Star size={16} className="text-gold-500"/> Ofertas Secretas VIP</li>
                  <li className="flex items-center gap-2 text-sm"><Star size={16} className="text-gold-500"/> Sorteios Mensais</li>
                  <li className="flex items-center gap-2 text-sm"><Star size={16} className="text-gold-500"/> Concierge de Reservas</li>
              </ul>
              <button className="w-full bg-gold-500 text-ocean-950 font-bold py-3 rounded-xl hover:bg-gold-400 transition-colors shadow-lg">
                  Quero ser VIP
              </button>
          </div>

          <div className="text-center py-4">
              <div className="flex items-center justify-center gap-2 text-slate-400 text-xs mb-2">
                  <Shield size={14} /> Pagamento 100% Seguro
              </div>
              <img src="https://upload.wikimedia.org/wikipedia/commons/a/a2/Logos_of_card_schemes.png" className="h-6 mx-auto opacity-50 grayscale" alt="Payment Methods" />
          </div>
      </div>
    </div>
  );
};
