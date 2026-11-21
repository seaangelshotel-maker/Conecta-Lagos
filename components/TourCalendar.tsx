import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Tour, TourSlot } from '../types';
import { WEEKDAYS, addDaysISO, brtDate, dayStatus } from '../services/tourRules';

const MONTHS = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

interface Props {
  tour: Tour;
  slots: Record<string, TourSlot>;
  selected: string;
  onSelect: (date: string) => void;
  now?: Date;
}

/** Calendário do mês: dias com vaga em destaque, lotados riscados, sem saída apagados. */
export const TourCalendar: React.FC<Props> = ({ tour, slots, selected, onSelect, now = new Date() }) => {
  const today = brtDate(now);
  const [ym, setYm] = useState(() => (selected || today).slice(0, 7));
  const [year, month] = ym.split('-').map(Number);
  const first = `${ym}-01`;
  const lead = new Date(first + 'T12:00:00Z').getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();
  const cells = useMemo(() => {
    const out: (string | null)[] = Array(lead).fill(null);
    for (let d = 1; d <= daysInMonth; d++) out.push(`${ym}-${String(d).padStart(2, '0')}`);
    return out;
  }, [ym, lead, daysInMonth]);
  const move = (n: number) => { const d = new Date(Date.UTC(year, month - 1 + n, 1)); setYm(d.toISOString().slice(0, 7)); };
  const canPrev = ym > today.slice(0, 7);
  const maxYm = addDaysISO(today, 365).slice(0, 7);

  return (
    <div className="bg-white rounded-3xl border border-slate-100 p-4" data-testid="tour-calendar">
      <div className="flex items-center justify-between mb-3">
        <button onClick={() => move(-1)} disabled={!canPrev} aria-label="Mês anterior" className="w-10 h-10 rounded-full flex items-center justify-center text-ocean-700 hover:bg-slate-50 disabled:opacity-30"><ChevronLeft size={20} /></button>
        <p className="font-black text-ocean-950">{MONTHS[month - 1]} {year}</p>
        <button onClick={() => move(1)} disabled={ym >= maxYm} aria-label="Próximo mês" className="w-10 h-10 rounded-full flex items-center justify-center text-ocean-700 hover:bg-slate-50 disabled:opacity-30"><ChevronRight size={20} /></button>
      </div>
      <div className="grid grid-cols-7 text-center text-[10px] font-black uppercase text-slate-400 mb-1">
        {WEEKDAYS.map(w => <span key={w}>{w}</span>)}
      </div>
      <div className="grid grid-cols-7 gap-1">
        {cells.map((date, i) => {
          if (!date) return <span key={'e' + i} />;
          const st = date < today ? 'none' : dayStatus(tour, date, slots, now);
          const isSel = date === selected;
          const clickable = st === 'open';
          const cls = isSel ? 'bg-ocean-600 text-white shadow-md'
            : st === 'open' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 hover:bg-emerald-100'
            : st === 'full' ? 'bg-slate-100 text-slate-400 line-through'
            : 'text-slate-300';
          return (
            <button key={date} disabled={!clickable} onClick={() => onSelect(date)} aria-label={`${date}${st === 'open' ? ', com vagas' : st === 'full' ? ', lotado' : ', sem saída'}`}
              aria-pressed={isSel} data-status={st}
              className={`aspect-square rounded-xl text-sm font-bold flex items-center justify-center transition-colors ${cls}`}>
              {Number(date.slice(8))}
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-3 text-[11px] text-slate-500">
        <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded bg-emerald-100 border border-emerald-300" /> Com vagas</span>
        <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded bg-slate-200" /> Lotado</span>
        <span className="flex items-center gap-1.5"><i className="w-3 h-3 rounded border border-slate-200" /> Sem saída</span>
      </div>
    </div>
  );
};
