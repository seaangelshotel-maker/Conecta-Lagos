import React, { useEffect, useState } from 'react';
import { X, Check } from 'lucide-react';
import { CategoryIcon } from './categoryIcons';
import { CONTEXT_FILTERS, type MainCategory } from '../services/discoverLogic';
import { getCities } from '../services/dataService';
import type { City } from '../types';

export interface HomeFilters { cat: string; f: string; city: string; }
export const EMPTY_FILTERS: HomeFilters = { cat: '', f: '', city: '' };
export const countFilters = (v: HomeFilters) => [v.cat, v.f, v.city].filter(Boolean).length;

const chip = (on: boolean) =>
  `inline-flex items-center gap-1.5 h-10 px-3.5 rounded-full border text-[13px] font-bold transition-colors active:scale-95 ${on ? 'bg-ocean-600 text-white border-ocean-600' : 'bg-white text-ocean-950 border-slate-200'}`;

/** Folha de filtros da Home: escolhe categoria, cidade e perfil e leva para os resultados já filtrados. */
export const FilterSheet: React.FC<{
  open: boolean; onClose: () => void; categories: MainCategory[];
  value: HomeFilters; onChange: (v: HomeFilters) => void; onApply: () => void;
}> = ({ open, onClose, categories, value, onChange, onApply }) => {
  const [cities, setCities] = useState<City[]>([]);

  useEffect(() => {
    if (!open) return;
    let alive = true;
    getCities().then(c => { if (alive) setCities((c || []).filter((x: City) => x.active !== false)); }).catch(() => { /* segue sem cidades */ });
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => { alive = false; document.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!open) return null;
  const toggle = <K extends keyof HomeFilters>(k: K, v: string) => onChange({ ...value, [k]: value[k] === v ? '' : v });
  const n = countFilters(value);

  return (
    <div className="fixed inset-0 z-[70] flex items-end md:items-center md:justify-center" data-testid="filter-sheet">
      <button aria-label="Fechar filtros" onClick={onClose} className="absolute inset-0 bg-black/50" />
      <div role="dialog" aria-modal="true" aria-label="Filtros"
        className="relative w-full md:max-w-lg bg-white rounded-t-3xl md:rounded-3xl shadow-2xl max-h-[88vh] flex flex-col">
        <div className="flex items-center justify-between px-5 pt-5 pb-3">
          <h2 className="text-lg font-black text-ocean-950">Filtrar lugares</h2>
          <button onClick={onClose} aria-label="Fechar" className="w-9 h-9 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center"><X size={16} /></button>
        </div>

        <div className="overflow-y-auto px-5 pb-4 space-y-5">
          <section aria-label="Categoria">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">O que você procura</p>
            <div className="flex flex-wrap gap-2">
              {categories.map(c => (
                <button key={c.id} onClick={() => toggle('cat', c.id)} aria-pressed={value.cat === c.id} data-testid={`fs-cat-${c.id}`} className={chip(value.cat === c.id)}>
                  <CategoryIcon name={c.icon} size={14} />{c.label}
                </button>
              ))}
            </div>
          </section>

          {cities.length > 0 && (
            <section aria-label="Cidade">
              <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Onde</p>
              <div className="flex flex-wrap gap-2">
                {cities.map(c => (
                  <button key={c.id} onClick={() => toggle('city', c.id)} aria-pressed={value.city === c.id} data-testid={`fs-city-${c.id}`} className={chip(value.city === c.id)}>{c.name}</button>
                ))}
              </div>
            </section>
          )}

          <section aria-label="Perfil">
            <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-2">Para quem e como</p>
            <div className="flex flex-wrap gap-2">
              {CONTEXT_FILTERS.map(f => (
                <button key={f.id} onClick={() => toggle('f', f.id)} aria-pressed={value.f === f.id} data-testid={`fs-f-${f.id}`} className={chip(value.f === f.id)}>
                  {value.f === f.id && <Check size={14} />}{f.label}
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="flex items-center gap-3 px-5 py-4 border-t border-slate-100">
          <button onClick={() => onChange(EMPTY_FILTERS)} disabled={!n} className="h-12 px-4 rounded-2xl text-sm font-black text-slate-500 disabled:opacity-40">Limpar</button>
          <button onClick={onApply} data-testid="fs-apply" className="flex-1 h-12 rounded-2xl bg-ocean-600 text-white text-sm font-black active:scale-[0.98] transition-transform">
            {n ? `Ver resultados (${n} ${n === 1 ? 'filtro' : 'filtros'})` : 'Ver todos os lugares'}
          </button>
        </div>
      </div>
    </div>
  );
};
