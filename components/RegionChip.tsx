import React from 'react';
import { MapPin } from 'lucide-react';
import { REGION_MUNICIPALITIES } from '../services/regionGeo';
import { GENERAL, type RegionLocation } from '../hooks/useRegionLocation';

/**
 * Mostra o que está sendo priorizado e deixa trocar a qualquer momento: onde estou, toda a região
 * ou qualquer cidade. A localização só organiza; ninguém fica preso à cidade onde está.
 */
export const RegionChip: React.FC<{ loc: RegionLocation; className?: string }> = ({ loc, className = '' }) => {
  const hasGps = !!loc.gps;
  const value = loc.choice ?? (hasGps ? 'auto' : '');
  let label = 'Toda a Região dos Lagos';
  if (loc.choice && loc.choice !== GENERAL && loc.municipality) label = `Vendo ${loc.municipality.name}`;
  else if (loc.choice === GENERAL) label = 'Toda a Região dos Lagos';
  else if (loc.outside) label = 'Você está fora da região · destaques gerais';
  else if (loc.municipality) label = `Priorizando ${loc.municipality.name}`;

  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs ${className}`} data-testid="region-chip">
      <span className="inline-flex items-center gap-1 font-bold text-ocean-700"><MapPin size={14} />{label}</span>
      <select aria-label="Escolher o que ver" value={value} onChange={e => e.target.value && loc.choose(e.target.value)}
        className="h-8 rounded-full border border-slate-200 bg-white px-2 font-semibold text-ocean-950">
        <option value="" disabled>Escolher cidade</option>
        {hasGps && !loc.outside && <option value="auto">Onde estou agora</option>}
        <option value={GENERAL}>Toda a Região dos Lagos</option>
        {REGION_MUNICIPALITIES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
      </select>
      {!hasGps && <button onClick={loc.request} disabled={loc.status === 'asking'} className="font-bold text-ocean-600 underline disabled:opacity-60">{loc.status === 'asking' ? 'Buscando…' : 'Usar minha localização'}</button>}
      {loc.error && <span className="text-amber-700 font-bold" role="status">{loc.error}</span>}
    </div>
  );
};
