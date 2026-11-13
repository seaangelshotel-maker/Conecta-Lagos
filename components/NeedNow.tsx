import React from 'react';
import { Pill, ShoppingCart, Fuel, Car, KeyRound, Smile, Stethoscope, PawPrint, ShieldCheck, Zap, Ambulance, Flame, ShieldAlert, PhoneCall, type LucideIcon } from 'lucide-react';
import { NeedCount, EMERGENCY_MAIN } from '../services/needNow';

const SOS_ICONS: Record<string, LucideIcon> = { '192': Ambulance, '193': Flame, '190': ShieldAlert };
const ICONS: Record<string, LucideIcon> = { Pill, ShoppingCart, Fuel, Car, KeyRound, Smile, Stethoscope, PawPrint, ShieldCheck };

/** "Precisa agora?": emergência sempre visível + atalhos de serviços (só os que têm lugar cadastrado). */
export const NeedNow: React.FC<{ items: NeedCount[]; onOpen: (id: string) => void }> = ({ items, onOpen }) => (
  <section className="px-4" aria-label="Precisa agora?" data-testid="need-now">
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4">
      <div className="flex items-center gap-2">
        <span className="w-8 h-8 rounded-full bg-orange-100 text-orange-500 flex items-center justify-center"><Zap size={16} strokeWidth={2.6} /></span>
        <div>
          <h2 className="text-base font-black text-ocean-950 leading-tight">Precisa agora?</h2>
          <p className="text-xs text-slate-500">Resolva rápido, sem sair procurando</p>
        </div>
      </div>
      <div className="flex gap-1 mt-2 -mx-4 px-4 overflow-x-auto snap-x snap-proximity pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" data-testid="emergency">
        {EMERGENCY_MAIN.map(e => {
          const Icon = SOS_ICONS[e.number] || PhoneCall;
          return (
            <a key={e.number} href={`tel:${e.number}`} data-testid={`sos-${e.number}`} aria-label={`Ligar ${e.number}, ${e.label}`}
              className="flex flex-col items-center gap-1 py-1.5 w-[62px] shrink-0 snap-start rounded-2xl active:scale-95 transition-transform">
              <span className="w-10 h-10 rounded-xl bg-ocean-50 text-ocean-600 flex items-center justify-center"><Icon size={18} strokeWidth={2} /></span>
              <span className="text-[10px] font-semibold text-ocean-950 leading-tight text-center">{e.label}</span>
            </a>
          );
        })}
        {items.map(i => {
          const Icon = ICONS[i.icon] || Zap;
          return (
            <button key={i.id} onClick={() => onOpen(i.id)} data-testid={`need-${i.id}`}
              className="flex flex-col items-center gap-1 py-1.5 w-[62px] shrink-0 snap-start rounded-2xl active:scale-95 transition-transform">
              <span className="w-10 h-10 rounded-xl bg-ocean-50 text-ocean-600 flex items-center justify-center"><Icon size={18} strokeWidth={2} /></span>
              <span className="text-[10px] font-semibold text-ocean-950 leading-tight text-center">{i.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  </section>
);
