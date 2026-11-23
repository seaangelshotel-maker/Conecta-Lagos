import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, ArrowRight, Calendar, Gift, Images, MessageCircle, Megaphone, ShieldCheck, Star, Store, Ticket, Utensils, X, Check, ShoppingBag } from 'lucide-react';
import { PricingPlan } from '../types';
import { brl, periodLabel, planTotal, CANCEL_WINDOW_TITLE } from '../services/planRules';
import { journeySteps, StepIcon } from '../services/planJourney';
import { FunnelRecord, loadFunnel, trackFunnel } from '../services/planFunnel';

const ICONS: Record<StepIcon, React.ReactNode> = {
  store: <Store size={34} />, ticket: <Ticket size={34} />, calendar: <Calendar size={34} />, star: <Star size={34} />,
  images: <Images size={34} />, menu: <Utensils size={34} />, orders: <ShoppingBag size={34} />, chat: <MessageCircle size={34} />,
  social: <Megaphone size={34} />, gift: <Gift size={34} />,
};

/** Passo a passo do plano: cada recurso explicado com a vantagem; o preço só no último passo. */
export const PlanJourney: React.FC<{
  plan: PricingPlan;
  user: { id: string; name: string; email: string } | null;
  onClose: () => void;
  onPay: (plan: PricingPlan, trial: boolean) => void;
  /** Quem ainda não tem empresa cadastra no fim dos benefícios e volta para ver o valor. */
  hasBusiness?: boolean;
  onRegister?: (plan: PricingPlan) => void;
  /** Volta do cadastro: abre direto no valor. */
  startAtPrice?: boolean;
}> = ({ plan, user, onClose, onPay, hasBusiness = true, onRegister, startAtPrice = false }) => {
  const steps = useMemo(() => journeySteps(plan), [plan]);
  const total = steps.length + 1; // + passo do preço
  const [i, setI] = useState(startAtPrice ? steps.length : 0);
  const prev = useRef<FunnelRecord | null>(null);
  const ready = useRef(false);
  const isPrice = i === steps.length;
  const info = { id: plan.id, name: plan.name, period: plan.period, price: plan.price, total: planTotal(plan) };

  useEffect(() => {
    let alive = true;
    (async () => {
      if (user) prev.current = await loadFunnel(user.id, plan.id);
      if (alive) ready.current = true;
      if (alive && user) prev.current = await trackFunnel(user, info, { step: startAtPrice ? total : 1, totalSteps: total, stage: startAtPrice ? 'price' : 'viewing', prev: prev.current }) || prev.current;
    })();
    return () => { alive = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const go = async (n: number) => {
    setI(n);
    window.scrollTo?.({ top: 0 });
    if (user && ready.current) prev.current = await trackFunnel(user, info, { step: n + 1, totalSteps: total, stage: n === steps.length ? 'price' : 'viewing', prev: prev.current }) || prev.current;
  };

  const register = async () => {
    if (user) await trackFunnel(user, info, { step: 1, totalSteps: 4, stage: 'cadastro', prev: prev.current });
    onRegister?.(plan);
  };

  const pay = async (trial: boolean) => {
    if (user) await trackFunnel(user, info, { step: total, totalSteps: total, stage: 'checkout', prev: prev.current });
    onPay(plan, trial);
  };

  const s = steps[i];
  return (
    <div className="fixed inset-0 z-[80] bg-white flex flex-col" role="dialog" aria-modal="true" data-testid="plan-journey">
      <div className="px-5 pt-4 pb-3 flex items-center gap-3 border-b border-slate-100">
        <button onClick={onClose} aria-label="Fechar" className="p-2 -ml-2 text-slate-400"><X size={22} /></button>
        <div className="flex-1">
          <p className="text-[11px] font-black uppercase tracking-widest text-ocean-700">Plano {plan.name}</p>
          <div className="h-1.5 bg-slate-100 rounded-full mt-1.5 overflow-hidden"><div className="h-full bg-ocean-600 transition-all" style={{ width: `${((i + 1) / total) * 100}%` }} /></div>
        </div>
        <span className="text-xs font-bold text-slate-400" data-testid="journey-count">{i + 1} de {total}</span>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-md mx-auto">
          {!isPrice && s ? (
            <div className="space-y-6 text-center" data-testid={`journey-step-${s.id}`}>
              <div className="w-20 h-20 rounded-3xl bg-ocean-50 text-ocean-600 flex items-center justify-center mx-auto">{ICONS[s.icon]}</div>
              <h2 className="text-2xl font-black text-ocean-950 leading-tight">{s.title}</h2>
              <p className="text-slate-600 text-base leading-relaxed">{s.what}</p>
              <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 text-left">
                <p className="text-[11px] font-black uppercase tracking-widest text-emerald-700 mb-1">O que você ganha</p>
                <p className="text-emerald-900 text-sm font-medium leading-relaxed">{s.gain}</p>
              </div>
            </div>
          ) : (
            <div className="space-y-6" data-testid="journey-price">
              <div className="text-center space-y-1">
                <h2 className="text-2xl font-black text-ocean-950">Tudo isso no plano {plan.name}</h2>
                <p className="text-slate-500 text-sm">{startAtPrice ? 'Sua empresa já está cadastrada. Falta só decidir.' : 'Veja o que você leva e o valor.'}</p>
              </div>
              <ul className="space-y-2">
                {steps.map(x => (
                  <li key={x.id} className="flex items-start gap-3 text-sm font-bold text-slate-700">
                    <span className="w-5 h-5 mt-0.5 rounded-full bg-ocean-50 flex items-center justify-center shrink-0"><Check size={12} className="text-ocean-600" /></span>{x.title}
                  </li>
                ))}
              </ul>
              <div className="bg-slate-50 rounded-3xl p-6 text-center space-y-1">
                <div className="flex items-baseline justify-center gap-1"><span className="text-4xl font-black text-ocean-950">{brl(plan.price)}</span><span className="text-slate-400 font-bold text-sm">/mês</span></div>
                <p className="text-xs font-black uppercase tracking-wider text-ocean-700" data-testid="journey-total">Plano de {periodLabel(plan.period)} · {brl(planTotal(plan))} no total</p>
              </div>
              <p className="flex items-start gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 rounded-xl px-3 py-2">
                <ShieldCheck size={14} className="shrink-0 mt-0.5" /><span>{CANCEL_WINDOW_TITLE}: cancele e receba o valor de volta.</span>
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="px-5 py-4 border-t border-slate-100 bg-white space-y-2 pb-[max(1rem,env(safe-area-inset-bottom))]">
        {isPrice ? (
          <>
            <button onClick={() => pay(false)} data-testid="journey-pay" className="w-full bg-ocean-600 text-white font-black py-4 rounded-2xl">Continuar para o pagamento</button>
            {plan.hasFreeTrial && <button onClick={() => pay(true)} className="w-full text-emerald-600 font-black text-sm py-2">Ou teste por {plan.trialDays || 30} dias</button>}
            <button onClick={() => go(i - 1)} className="w-full text-slate-400 font-bold text-sm py-1 flex items-center justify-center gap-1"><ArrowLeft size={14} /> Voltar</button>
          </>
        ) : (
          <div className="flex gap-3">
            {i > 0 && <button onClick={() => go(i - 1)} aria-label="Voltar" className="px-5 py-4 rounded-2xl bg-slate-100 text-slate-500"><ArrowLeft size={18} /></button>}
            {i === steps.length - 1 && !hasBusiness && onRegister ? (
              <button onClick={register} data-testid="journey-register" className="flex-1 bg-ocean-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2">Cadastrar minha empresa <ArrowRight size={18} /></button>
            ) : (
              <button onClick={() => go(i + 1)} data-testid="journey-next" className="flex-1 bg-ocean-600 text-white font-black py-4 rounded-2xl flex items-center justify-center gap-2">{i === steps.length - 1 ? 'Ver o valor' : 'Continuar'} <ArrowRight size={18} /></button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
