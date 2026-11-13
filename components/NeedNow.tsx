import React, { useState } from 'react';
import { Pill, ShoppingCart, Fuel, Car, KeyRound, Smile, Stethoscope, PawPrint, Zap, Phone, Siren, ChevronDown, type LucideIcon } from 'lucide-react';
import { NeedCount, EMERGENCY_MAIN, EMERGENCY_MORE } from '../services/needNow';

const ICONS: Record<string, LucideIcon> = { Pill, ShoppingCart, Fuel, Car, KeyRound, Smile, Stethoscope, PawPrint };

/** Emergência: sempre visível (não depende de cadastro), com ligação direta. */
const Emergency: React.FC = () => {
  const [more, setMore] = useState(false);
  return (
    <div className="rounded-2xl bg-red-50 border border-red-100 p-3" data-testid="emergency">
      <p className="text-[12px] font-black text-red-700 flex items-center gap-1.5"><Siren size={14} strokeWidth={2.6} /> Emergência? Ligue agora (grátis)</p>
      <div className="grid grid-cols-3 gap-2 mt-2.5">
        {EMERGENCY_MAIN.map(e => (
          <a key={e.number} href={`tel:${e.number}`} data-testid={`sos-${e.number}`} aria-label={`Ligar ${e.number}, ${e.label}`}
            className="rounded-xl bg-red-600 text-white py-2.5 px-1 flex flex-col items-center active:scale-95 transition-transform">
            <span className="text-xl font-black leading-none flex items-center gap-1"><Phone size={14} strokeWidth={2.8} />{e.number}</span>
            <span className="text-[11px] font-bold mt-1 leading-tight text-center">{e.label}</span>
          </a>
        ))}
      </div>
      <p className="text-[11px] text-red-800/80 mt-2 leading-snug">{EMERGENCY_MAIN.map(e => `${e.number}: ${e.hint}`).join(' · ')}</p>
      <button onClick={() => setMore(v => !v)} aria-expanded={more} className="mt-2 text-[12px] font-black text-red-700 flex items-center gap-1">
        Outros números úteis <ChevronDown size={14} className={more ? 'rotate-180 transition-transform' : 'transition-transform'} />
      </button>
      {more && (
        <ul className="mt-1.5 grid gap-1">
          {EMERGENCY_MORE.map(e => (
            <li key={e.number}><a href={`tel:${e.number}`} className="flex items-center justify-between rounded-lg bg-white border border-red-100 px-3 py-2 text-[13px] font-bold text-ocean-950">
              <span>{e.label}</span><span className="text-red-600 font-black">{e.number}</span></a></li>
          ))}
        </ul>
      )}
    </div>
  );
};

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
      <div className="mt-3"><Emergency /></div>
      {items.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-4">
          {items.map(i => {
            const Icon = ICONS[i.icon] || Zap;
            return (
              <button key={i.id} onClick={() => onOpen(i.id)} data-testid={`need-${i.id}`}
                className="flex flex-col items-center gap-1.5 py-2 rounded-2xl active:scale-95 transition-transform">
                <span className="w-12 h-12 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center"><Icon size={22} strokeWidth={2.2} /></span>
                <span className="text-[11px] font-bold text-ocean-950 leading-tight text-center">{i.label}</span>
                <span className="text-[10px] font-semibold text-slate-400">{i.count}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  </section>
);
