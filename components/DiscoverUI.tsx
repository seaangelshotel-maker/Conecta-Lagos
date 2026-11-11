import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

/** Busca única do produto: campo + botão no mesmo conjunto (usada na Home e no Descubra). */
export const SearchBar: React.FC<{
  value: string; onChange: (v: string) => void; onSubmit?: (v: string) => void; placeholder?: string; className?: string;
  /** Quando informado, mostra o botão de filtros ao lado de "Buscar". `filterCount` vira a bolinha de aviso. */
  onFilters?: () => void; filterCount?: number;
}> = ({ value, onChange, onSubmit, placeholder = 'Buscar lugares', className = '', onFilters, filterCount = 0 }) => (
  <form role="search" onSubmit={e => { e.preventDefault(); onSubmit?.(value.trim()); }}
    className={`flex items-center bg-white rounded-2xl shadow-lg pl-4 pr-1.5 h-14 gap-2 ${className}`}>
    <Search size={18} className="text-slate-400 shrink-0" aria-hidden />
    <input value={value} onChange={e => onChange(e.target.value)} aria-label="Buscar lugares" placeholder={placeholder}
      enterKeyHint="search" className="flex-1 min-w-0 bg-transparent border-0 shadow-none outline-none ring-0 focus:ring-0 focus:outline-none p-0 text-slate-800 text-[15px] placeholder:text-slate-400" />
    {value && <button type="button" onClick={() => { onChange(''); onSubmit?.(''); }} aria-label="Limpar busca" className="w-8 h-8 flex items-center justify-center text-slate-400 shrink-0"><X size={16} /></button>}
    {onFilters && (
      <button type="button" onClick={onFilters} aria-label={filterCount ? `Filtros (${filterCount} ativos)` : 'Filtros'} data-testid="open-filters"
        className="relative w-11 h-11 rounded-xl bg-ocean-50 text-ocean-700 border border-ocean-100 flex items-center justify-center shrink-0 active:scale-95 transition-transform">
        <SlidersHorizontal size={19} strokeWidth={2.4} />
        {filterCount > 0 && <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">{filterCount}</span>}
      </button>
    )}
    <button type="submit" aria-label="Buscar" className="h-11 px-5 rounded-xl bg-ocean-600 text-white text-sm font-black shrink-0 active:scale-95 transition-transform">Buscar</button>
  </form>
);

/** Carrossel horizontal padrão: mesma margem, mesmo respiro e encaixe suave em todo o app. */
export const HScroller: React.FC<{ children: React.ReactNode; label?: string; gap?: string }> = ({ children, label, gap = 'gap-3' }) => (
  <div role="group" aria-label={label} className={`flex ${gap} overflow-x-auto no-scrollbar px-4 pb-2 snap-x snap-proximity scroll-px-4 [&>*]:snap-start`}>{children}</div>
);
