import React from 'react';
import { Pill, ShoppingCart, Fuel, Car, KeyRound, Smile, Stethoscope, PawPrint, Zap, type LucideIcon } from 'lucide-react';
import { NeedCount } from '../services/needNow';

const ICONS: Record<string, LucideIcon> = { Pill, ShoppingCart, Fuel, Car, KeyRound, Smile, Stethoscope, PawPrint };

/** Atalhos de urgência da Home. Não renderiza nada se não houver lugar cadastrado para nenhum atalho. */
export const NeedNow: React.FC<{ items: NeedCount[]; onOpen: (query: string) => void }> = ({ items, onOpen }) => {
  if (items.length === 0) return null;
  return (
    <section className="px-4" aria-label="Precisa agora?" data-testid="need-now">
      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center"><Zap size={16} strokeWidth={2.6} /></span>
          <div>
            <h2 className="text-base font-black text-ocean-950 leading-tight">Precisa agora?</h2>
            <p className="text-xs text-slate-500">Resolva rápido, sem sair procurando</p>
          </div>
        </div>
        <div className="grid grid-cols-4 gap-2 mt-4">
          {items.map(i => {
            const Icon = ICONS[i.icon] || Zap;
            return (
              <button key={i.id} onClick={() => onOpen(i.query)} data-testid={`need-${i.id}`}
                className="flex flex-col items-center gap-1.5 py-2 rounded-2xl active:scale-95 transition-transform">
                <span className="w-12 h-12 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center"><Icon size={22} strokeWidth={2.2} /></span>
                <span className="text-[11px] font-bold text-ocean-950 leading-tight text-center">{i.label}</span>
                <span className="text-[10px] font-semibold text-slate-400">{i.count}</span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
