import React, { useMemo } from 'react';
import { ChevronLeft } from 'lucide-react';
import { useFunnel } from '../services/planFunnel';
import { STAGE_LABEL, isAbandoned } from '../services/planJourney';
import { brl } from '../services/planRules';

const when = (iso: string) => { try { return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

/** Admin: quem começou a ver um plano e até onde chegou (quem parou no meio). */
export const PlanFunnelPanel: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { items, loading } = useFunnel();
  const c = useMemo(() => ({
    started: items.length,
    price: items.filter(f => f.stage === 'price' || f.stage === 'checkout').length,
    checkout: items.filter(f => f.stage === 'checkout').length,
    abandoned: items.filter(f => isAbandoned(f)).length,
  }), [items]);
  const box = (n: number, label: string) => (<div className="bg-slate-50 rounded-2xl p-4 text-center"><p className="text-2xl font-black text-ocean-950">{n}</p><p className="text-[10px] font-black uppercase text-slate-500">{label}</p></div>);
  return (
    <div className="space-y-6 animate-in slide-in-from-bottom-6" data-testid="plan-funnel">
      <button onClick={onBack} className="flex items-center gap-2 text-ocean-600 font-black text-xs uppercase"><ChevronLeft size={16} /> Voltar</button>
      <div><h2 className="text-2xl font-black text-ocean-950">Funil dos planos</h2><p className="text-sm text-slate-500">Mostra só quem estava logado. Quem foi ao pagamento pode ou não ter pago: confira em Pagamentos.</p></div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">{box(c.started, 'Começaram')}{box(c.price, 'Viram o preço')}{box(c.checkout, 'Foram ao pagamento')}{box(c.abandoned, 'Pararam no meio')}</div>
      {loading ? <p className="text-sm text-slate-400">Carregando…</p> : items.length === 0 ? <p className="text-sm text-slate-400">Ninguém passou pela jornada ainda.</p> : (
        <ul className="space-y-2">
          {items.map(f => (
            <li key={f.id} className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-wrap items-center gap-x-4 gap-y-1">
              <div className="flex-1 min-w-[180px]"><p className="font-black text-ocean-950 text-sm">{f.userName || 'Sem nome'}</p><p className="text-[11px] text-slate-500 break-all">{f.userEmail}</p></div>
              <div className="text-xs font-bold text-slate-600">{f.planName} · {brl(f.total)}</div>
              <div className="text-xs font-bold text-slate-500">passo {f.maxStep} de {f.totalSteps}</div>
              <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg ${f.stage === 'checkout' ? 'bg-emerald-100 text-emerald-700' : isAbandoned(f) ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-500'}`}>{STAGE_LABEL[f.stage]}</span>
              <span className="text-[11px] text-slate-400">{when(f.updatedAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
