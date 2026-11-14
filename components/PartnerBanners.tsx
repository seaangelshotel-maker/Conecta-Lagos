import React, { useEffect, useState } from 'react';
import { ExternalLink } from 'lucide-react';
import { getGlobalSettings } from '../services/dataService';
import { PARTNER_DISCLOSURE, PartnerBanner, visiblePartnerBanners } from '../services/partnerBanners';

/** Parceiros com link de afiliado. Só aparece quando o admin cadastrou algum; sempre com a etiqueta "Parceiro" e o aviso de comissão. */
export const PartnerBanners: React.FC = () => {
  const [list, setList] = useState<PartnerBanner[]>([]);
  useEffect(() => { let on = true; getGlobalSettings().then(s => { if (on) setList(visiblePartnerBanners(s.partnerBanners)); }); return () => { on = false; }; }, []);
  if (list.length === 0) return null;
  return (
    <section className="px-4" aria-label="Parceiros" data-testid="partner-banners">
      <div className="flex items-baseline justify-between mb-2">
        <h2 className="text-base font-black text-ocean-950">Parceiros do Lagos GO</h2>
        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Publicidade</span>
      </div>
      <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 snap-x snap-proximity">
        {list.map(b => (
          <a key={b.id} href={b.url} target="_blank" rel="sponsored noopener noreferrer" data-testid="partner-link"
            className="snap-start shrink-0 w-60 bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden active:scale-95 transition-transform">
            <div className="aspect-[11/6] bg-slate-50 flex items-center justify-center relative">
              {b.imageUrl ? <img src={b.imageUrl} alt={b.name} referrerPolicy="no-referrer" loading="lazy" className="w-full h-full object-cover" /> : <span className="text-lg font-black text-ocean-950 text-center leading-tight">{b.name}</span>}
              <span className="absolute top-1.5 left-1.5 bg-slate-900/80 text-white text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded">Parceiro</span>
            </div>
            <div className="p-3">
              <p className="text-sm font-black text-ocean-950 flex items-center gap-1">{b.name} <ExternalLink size={11} className="text-slate-400" /></p>
              {b.text && <p className="text-[11px] text-slate-500 leading-snug mt-0.5">{b.text}</p>}
            </div>
          </a>
        ))}
      </div>
      <p className="text-[10px] text-slate-400 mt-2 leading-snug">{PARTNER_DISCLOSURE}</p>
    </section>
  );
};
