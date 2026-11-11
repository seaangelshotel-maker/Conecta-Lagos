import React from 'react';
import { MapPin } from 'lucide-react';
import { REGION_MUNICIPALITIES } from '../services/regionGeo';
import type { RegionLocation } from '../hooks/useRegionLocation';

/** Mostra o município considerado e permite usar o GPS ou escolher a cidade. Discreto, para caber em qualquer tela. */
export const RegionChip: React.FC<{ loc: RegionLocation; className?: string }> = ({ loc, className = '' }) => {
  const name = loc.municipality?.name;
  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs ${className}`} data-testid="region-chip">
      <span className="inline-flex items-center gap-1 font-bold text-ocean-700"><MapPin size={14} />{name ? `Priorizando ${name}` : 'Toda a Região dos Lagos'}</span>
      <select aria-label="Escolher cidade" value={loc.municipality?.id || ''} onChange={e => e.target.value && loc.chooseManual(e.target.value)}
        className="h-8 rounded-full border border-slate-200 bg-white px-2 font-semibold text-ocean-950">
        <option value="" disabled>Escolher cidade</option>
        {REGION_MUNICIPALITIES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
      {loc.status !== 'ok' && <button onClick={loc.request} disabled={loc.status === 'asking'} className="font-bold text-ocean-600 underline disabled:opacity-60">{loc.status === 'asking' ? 'Buscando…' : 'Usar minha localização'}</button>}
      {loc.error && <span className="text-amber-700 font-bold" role="status">{loc.error}</span>}
    </div>
  );
};
