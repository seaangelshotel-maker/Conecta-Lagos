import React from 'react';
import { Compass, Backpack, MapPinned, Crown, Check, Clock } from 'lucide-react';
import { EARN_RULES, LEVELS, MONTHLY_CAP, POINTS_PER_COUPON, levelProgress, type Level, type MonthLine } from '../services/pointsRules';

interface Props {
  points: number;
  loading?: boolean;
  breakdown?: MonthLine[];
}

const ICON: Record<Level['id'], React.ReactNode> = {
  explorador: <Compass size={26} />,
  viajante: <Backpack size={26} />,
  local: <MapPinned size={26} />,
  embaixador: <Crown size={26} />,
};

const TONE: Record<Level['id'], string> = {
  explorador: 'from-sky-500 to-cyan-400',
  viajante: 'from-emerald-500 to-teal-400',
  local: 'from-orange-500 to-amber-400',
  embaixador: 'from-slate-900 to-slate-700',
};

/** Selo, nível (reputação) e pontos do usuário, com o quanto dá para ganhar. */
export const PointsCard: React.FC<Props> = ({ points, loading, breakdown = [] }) => {
  const prog = levelProgress(points);
  const { level, next } = prog;

  return (
    <section className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 shadow-sm" data-testid="points-card" aria-label="Seus pontos e nível">
      <div className="flex items-center gap-4">
        <div className={`w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-gradient-to-br ${TONE[level.id]} text-white flex items-center justify-center shadow-lg shrink-0`} data-testid="points-badge">
          {ICON[level.id]}
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Seu nível</p>
          <h3 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight" data-testid="points-level">{level.name}</h3>
          <p className="text-xs md:text-sm text-slate-500 font-medium">{level.tagline}</p>
        </div>
        <div className="ml-auto text-right shrink-0">
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Pontos</p>
          <p className="text-3xl md:text-4xl font-black text-orange-500" data-testid="points-total">{loading ? '…' : points}</p>
        </div>
      </div>

      <div className="mt-6">
        <div className="h-3 rounded-full bg-slate-100 overflow-hidden" role="progressbar" aria-valuenow={prog.percent} aria-valuemin={0} aria-valuemax={100}>
          <div className={`h-full rounded-full bg-gradient-to-r ${TONE[level.id]} transition-all`} style={{ width: `${prog.percent}%` }} />
        </div>
        <p className="mt-2 text-xs md:text-sm text-slate-600 font-medium" data-testid="points-next">
          {next ? <>Faltam <b>{prog.missing}</b> pontos para <b>{next.name}</b>.</> : 'Você está no nível mais alto.'}
        </p>
        <p className="mt-1 text-xs text-slate-500">Benefício do seu nível: {level.perk}</p>
      </div>

      <div className="mt-6 grid grid-cols-4 gap-2" aria-label="Níveis">
        {LEVELS.map(l => (
          <div key={l.id} className={`rounded-xl p-2 text-center border ${l.id === level.id ? 'border-orange-400 bg-orange-50' : 'border-slate-100 bg-slate-50'}`}>
            <p className="text-[11px] md:text-xs font-extrabold text-slate-800">{l.name}</p>
            <p className="text-[10px] text-slate-500">{l.min}+ pts</p>
          </div>
        ))}
      </div>

      {next && (
        <div className="mt-6 rounded-2xl bg-orange-50 border border-orange-100 p-4" data-testid="points-todo">
          <p className="text-[10px] font-black uppercase tracking-widest text-orange-500">O que fazer agora</p>
          <p className="text-sm font-bold text-slate-800 mt-1">
            Use {Math.ceil(prog.missing / POINTS_PER_COUPON)} {Math.ceil(prog.missing / POINTS_PER_COUPON) === 1 ? 'cupom' : 'cupons'} e peça a confirmação no estabelecimento para chegar a {next.name}.
          </p>
        </div>
      )}

      <h4 className="mt-8 mb-3 text-sm font-black text-slate-900">Como seus pontos foram calculados</h4>
      <div className="rounded-2xl border border-slate-100 divide-y divide-slate-100" data-testid="points-calc">
        {breakdown.length === 0 ? (
          <p className="p-3 text-xs text-slate-500">Ainda sem cupons confirmados. Cada cupom confirmado vale {POINTS_PER_COUPON} pontos.</p>
        ) : breakdown.map(l => (
          <div key={l.month} className="flex items-center justify-between gap-3 p-3 text-xs md:text-sm">
            <span className="text-slate-600 font-medium">{l.month.slice(5)}/{l.month.slice(0, 4)}: {l.coupons} {l.coupons === 1 ? 'cupom' : 'cupons'} × {POINTS_PER_COUPON}{l.capped ? ` (teto de ${MONTHLY_CAP})` : ''}</span>
            <span className="font-black text-orange-500">+{l.counted}</span>
          </div>
        ))}
        <div className="flex items-center justify-between p-3 text-sm font-black text-slate-900"><span>Total</span><span>{points} pontos</span></div>
      </div>

      <h4 className="mt-8 mb-3 text-sm font-black text-slate-900">Como ganhar pontos</h4>
      <ul className="space-y-2" data-testid="points-rules">
        {EARN_RULES.map(r => (
          <li key={r.id} className="flex items-start gap-3 rounded-2xl border border-slate-100 p-3">
            <span className={`mt-0.5 w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${r.active ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
              {r.active ? <Check size={14} /> : <Clock size={14} />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-slate-800">{r.title}</p>
              <p className="text-xs text-slate-500">{r.hint}{r.limit ? ` ${r.limit}.` : ''}</p>
            </div>
            <div className="text-right shrink-0">
              <p className="text-sm font-black text-orange-500">{r.reward}</p>
              {!r.active && <p className="text-[10px] font-bold uppercase text-slate-400">Em breve</p>}
            </div>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[11px] text-slate-400">No máximo {MONTHLY_CAP} pontos por mês. Os pontos só contam depois que o Lagos GO confirma a ação.</p>
    </section>
  );
};
