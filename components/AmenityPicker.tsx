import React from 'react';
import { AppAmenity } from '../types';
import { amenityAppliesTo, businessKind, groupAmenities, AmenityGroup } from '../data/amenityCatalog';

interface Props {
  category?: string;
  subcategory?: string;
  /** Lista completa (catálogo + criadas pelo admin). */
  defs: AppAmenity[];
  selected: string[];
  onChange: (next: string[]) => void;
}

/**
 * Seletor de comodidades do cadastro: mostra só o que se aplica ao tipo do negócio, em seções.
 * Comodidade já marcada que não se aplica mais (empresa trocou de categoria) continua visível para poder ser tirada.
 */
export const AmenityPicker: React.FC<Props> = ({ category, subcategory, defs, selected, onChange }) => {
  const kind = businessKind({ category, subcategory });
  const applicable = defs.filter(d => amenityAppliesTo(d, kind));
  const leftovers = defs.filter(d => selected.includes(d.id) && !amenityAppliesTo(d, kind));
  const sections = groupAmenities(applicable.map(d => ({ ...d, group: (d.group || 'geral') as AmenityGroup, kinds: d.kinds })));
  const toggle = (id: string) => onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);

  const chip = (d: AppAmenity) => {
    const on = selected.includes(d.id);
    return (
      <button key={d.id} type="button" onClick={() => toggle(d.id)} aria-pressed={on} data-testid={`pick-${d.id}`}
        className={`flex items-center gap-3 p-3 rounded-2xl border transition-all text-left ${on ? 'bg-ocean-600 border-ocean-600 text-white shadow-md' : 'bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100'}`}>
        <div className={`w-2 h-2 rounded-full shrink-0 ${on ? 'bg-white' : 'bg-slate-300'}`} />
        <span className="text-xs font-bold">{d.label}</span>
      </button>
    );
  };

  return (
    <div className="space-y-5" data-testid="amenity-picker">
      {sections.map(sec => (
        <div key={sec.group}>
          <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">{sec.label}</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">{sec.items.map(i => chip(i as AppAmenity))}</div>
        </div>
      ))}
      {leftovers.length > 0 && (
        <div>
          <p className="text-[11px] font-black uppercase tracking-wider text-amber-600 mb-2">Marcadas, mas não se aplicam a este tipo de negócio</p>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">{leftovers.map(chip)}</div>
        </div>
      )}
    </div>
  );
};
