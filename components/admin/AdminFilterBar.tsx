import React from 'react';
import { Search, X } from 'lucide-react';

export interface FilterSelect {
  key: string;
  label: string;
  value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void;
}

/** Barra de filtros padrão das listas do admin: busca + seletores + contagem + limpar. */
export const AdminFilterBar: React.FC<{
  testId?: string;
  search: string;
  onSearch: (v: string) => void;
  placeholder?: string;
  selects: FilterSelect[];
  shown: number;
  total: number;
  onClear: () => void;
}> = ({ testId, search, onSearch, placeholder = 'Buscar por nome…', selects, shown, total, onClear }) => {
  const active = !!search || selects.some(s => s.value);
  return (
    <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3 md:p-4 space-y-3" data-testid={testId || 'admin-filters'}>
      <div className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input value={search} onChange={e => onSearch(e.target.value)} placeholder={placeholder} aria-label="Buscar"
            className="w-full bg-white border border-slate-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-ocean-500" />
        </div>
        <div className="flex flex-wrap gap-2">
          {selects.map(s => (
            <label key={s.key} className="flex flex-col">
              <span className="sr-only">{s.label}</span>
              <select value={s.value} onChange={e => s.onChange(e.target.value)} aria-label={s.label} data-testid={`filter-${s.key}`}
                className={`bg-white border rounded-xl px-3 py-2.5 text-xs font-bold outline-none focus:ring-2 focus:ring-ocean-500 ${s.value ? 'border-ocean-400 text-ocean-700' : 'border-slate-200 text-slate-600'}`}>
                <option value="">{s.label}: todos</option>
                {s.options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </label>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-[11px] font-bold text-slate-500">
        <span data-testid="filter-count">Mostrando {shown} de {total}</span>
        {active && (
          <button onClick={onClear} className="flex items-center gap-1 text-ocean-600 uppercase font-black" data-testid="filter-clear">
            <X size={12} /> Limpar filtros
          </button>
        )}
      </div>
    </div>
  );
};
