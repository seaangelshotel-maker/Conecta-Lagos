import React from 'react';
import { ChevronDown, MapPin } from 'lucide-react';
import { REGION_MUNICIPALITIES } from '../services/regionGeo';
import { GENERAL, type RegionLocation } from '../hooks/useRegionLocation';

/**
 * Mostra o que está sendo priorizado e deixa trocar a qualquer momento: onde estou, toda a região
 * ou qualquer cidade. A localização só organiza; ninguém fica preso à cidade onde está.
 *
 * `compact`: pílula pequena para o cabeçalho (fundo escuro). Toda a pílula é o seletor.
 */
export const RegionChip: React.FC<{ loc: RegionLocation; className?: string; compact?: boolean; tone?: 'dark' | 'light' }> = ({ loc, className = '', compact = false, tone = 'dark' }) => {
  const hasGps = !!loc.gps;
  const value = loc.choice ?? (hasGps ? 'auto' : '');
  const onPick = (v: string) => { if (v === 'gps') loc.request(); else if (v) loc.choose(v); };

  const options = (
    <>
      <option value="" disabled>Escolher cidade</option>
      {hasGps && !loc.outside && <option value="auto">Onde estou agora</option>}
      {!hasGps && <option value="gps">Usar minha localização</option>}
      <option value={GENERAL}>Toda a Região dos Lagos</option>
      {REGION_MUNICIPALITIES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
    </>
  );

  if (compact) {
    const short = loc.choice === GENERAL ? 'Toda a região'
      : loc.municipality ? loc.municipality.name
      : loc.outside ? 'Fora da região' : 'Toda a região';
    return (
      <div className={className} data-testid="region-chip">
        <div className={`relative inline-flex items-center gap-1.5 h-9 pl-2.5 pr-2 rounded-full border text-xs font-bold max-w-full ${tone === 'light' ? 'bg-white border-slate-200 text-ocean-800 shadow-sm' : 'bg-white/15 border-white/30 text-white'}`}>
          <MapPin size={14} className="shrink-0" />
          <span className="truncate max-w-[10.5rem]">{loc.status === 'asking' ? 'Buscando…' : short}</span>
          <ChevronDown size={14} className="shrink-0 opacity-80" />
          <select aria-label="Escolher cidade ou usar minha localização" value={value} onChange={e => onPick(e.target.value)}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-ocean-950">
            {options}
          </select>
        </div>
        {loc.error && <p className={`text-[11px] font-bold mt-1 max-w-[16rem] ${tone === 'light' ? 'text-amber-700' : 'text-amber-200'}`} role="status">{loc.error}</p>}
      </div>
    );
  }

  let label = 'Toda a Região dos Lagos';
  if (loc.choice && loc.choice !== GENERAL && loc.municipality) label = `Vendo ${loc.municipality.name}`;
  else if (loc.choice === GENERAL) label = 'Toda a Região dos Lagos';
  else if (loc.outside) label = 'Você está fora da região · destaques gerais';
  else if (loc.municipality) label = `Priorizando ${loc.municipality.name}`;

  return (
    <div className={`flex flex-wrap items-center gap-2 text-xs ${className}`} data-testid="region-chip">
      <span className="inline-flex items-center gap-1 font-bold text-ocean-700"><MapPin size={14} />{label}</span>
      <select aria-label="Escolher o que ver" value={value} onChange={e => onPick(e.target.value)}
        className="min-h-[2.25rem] rounded-full border border-slate-200 bg-white px-3 py-1 text-[13px] leading-5 font-semibold text-ocean-950">
        {options}
      </select>
      {loc.error && <span className="text-amber-700 font-bold" role="status">{loc.error}</span>}
    </div>
  );
};
