import React, { useEffect, useMemo, useState } from 'react';
import { Loader2, SlidersHorizontal } from 'lucide-react';
import type { AppEvent, AppGlobalSettings, Coupon, PricingPlan, User } from '../../types';
import { UserRole } from '../../types';
import { getGlobalSettings, saveDefaultLimits, setUserCouponQuota } from '../../services/dataService';
import { getAllEventsAdmin, setUserEventQuota } from '../../services/eventService';
import { activeEventCount, eventQuota, resolvePlan } from '../../services/eventRules';
import { couponQuota, countsAgainstCouponQuota } from '../../services/walletRules';
import { useNotification } from '../NotificationSystem';

interface Props { users: User[]; plans: PricingPlan[]; coupons: Coupon[]; onChanged?: () => void; }

const parse = (raw: string | undefined): number | null | 'invalid' => {
  const t = (raw ?? '').trim();
  if (t === '') return null;
  const n = Number(t);
  return Number.isFinite(n) && n >= 0 ? Math.floor(n) : 'invalid';
};

/** Admin: quantos cupons e eventos cada cliente pode ter (padrão de quem não tem plano + ajuste por cliente). */
export const ClientLimitsAdmin: React.FC<Props> = ({ users, plans, coupons, onChanged }) => {
  const { notify } = useNotification();
  const [settings, setSettings] = useState<AppGlobalSettings | null>(null);
  const [events, setEvents] = useState<AppEvent[]>([]);
  const [defC, setDefC] = useState('');
  const [defE, setDefE] = useState('');
  const [draft, setDraft] = useState<Record<string, { c?: string; e?: string }>>({});
  const [busy, setBusy] = useState('');
  const [local, setLocal] = useState<Record<string, { maxCoupons?: number | null; maxEvents?: number | null }>>({});

  useEffect(() => {
    let alive = true;
    Promise.all([getGlobalSettings(true), getAllEventsAdmin().catch(() => [] as AppEvent[])]).then(([s, ev]) => {
      if (!alive) return;
      setSettings(s); setEvents(ev);
      setDefC(typeof s.defaultMaxCoupons === 'number' ? String(s.defaultMaxCoupons) : '');
      setDefE(typeof s.defaultMaxEvents === 'number' ? String(s.defaultMaxEvents) : '');
    });
    return () => { alive = false; };
  }, []);

  const companies = useMemo(() => users.filter(u => u.role === UserRole.COMPANY), [users]);
  const withLocal = (u: User): User => ({ ...u, ...(local[u.id] || {}) } as User);

  const saveDefaults = async () => {
    const c = parse(defC), e = parse(defE);
    if (c === 'invalid' || e === 'invalid') { notify('warning', 'Use números iguais ou maiores que zero.'); return; }
    setBusy('defaults');
    try {
      await saveDefaultLimits(c, e);
      setSettings(s => ({ ...(s as AppGlobalSettings), defaultMaxCoupons: c, defaultMaxEvents: e }));
      notify('success', 'Limites de quem não tem plano salvos.');
    } catch { notify('error', 'Não foi possível salvar. Tente de novo.'); }
    finally { setBusy(''); }
  };

  const saveClient = async (u: User, kind: 'c' | 'e', reset = false) => {
    const n = reset ? null : parse(draft[u.id]?.[kind]);
    if (n === 'invalid') { notify('warning', 'Use um número igual ou maior que zero.'); return; }
    setBusy(`${u.id}:${kind}`);
    try {
      if (kind === 'c') await setUserCouponQuota(u.id, n); else await setUserEventQuota(u.id, n);
      setLocal(l => ({ ...l, [u.id]: { ...l[u.id], [kind === 'c' ? 'maxCoupons' : 'maxEvents']: n } }));
      setDraft(d => ({ ...d, [u.id]: { ...d[u.id], [kind]: undefined } }));
      notify('success', n === null ? 'Agora segue o plano.' : `Limite definido: ${n}.`);
      onChanged?.();
    } catch (err: any) { notify('error', err?.message || 'Não foi possível salvar.'); }
    finally { setBusy(''); }
  };

  const today = new Date().toISOString().slice(0, 10);
  const inp = 'w-20 bg-slate-50 p-3 rounded-xl border border-slate-100 font-bold text-center';
  const btn = 'h-11 px-4 rounded-xl bg-ocean-600 text-white text-xs font-black disabled:opacity-60';
  const btn2 = 'h-11 px-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-black disabled:opacity-60';

  if (!settings) return <div className="p-6 flex justify-center"><Loader2 className="animate-spin text-ocean-600" /></div>;

  return (
    <div className="space-y-6" data-testid="client-limits">
      <div className="flex items-start gap-3">
        <div className="bg-ocean-50 text-ocean-600 p-3 rounded-2xl"><SlidersHorizontal size={22} /></div>
        <div>
          <h3 className="text-xl font-black text-ocean-950">Limites por cliente</h3>
          <p className="text-sm text-slate-500">Cada cliente segue o limite do plano dele. Aqui você define o padrão de quem ainda não tem plano e pode dar mais (ou menos) cupons e eventos a um cliente específico.</p>
        </div>
      </div>

      <div className="bg-slate-50 rounded-3xl border border-slate-100 p-5 flex flex-wrap items-end gap-4" data-testid="limits-defaults">
        <div className="min-w-[14rem] flex-1">
          <p className="font-black text-ocean-950">Quem não tem plano</p>
          <p className="text-xs font-semibold text-slate-400">Cupons em branco = sem limite. Eventos em branco = nenhum.</p>
        </div>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Cupons
          <input value={defC} onChange={e => setDefC(e.target.value)} inputMode="numeric" data-testid="default-coupons" className={`${inp} block mt-1`} placeholder="sem limite" /></label>
        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Eventos
          <input value={defE} onChange={e => setDefE(e.target.value)} inputMode="numeric" data-testid="default-events" className={`${inp} block mt-1`} placeholder="0" /></label>
        <button onClick={saveDefaults} disabled={busy === 'defaults'} data-testid="default-save" className={btn}>Salvar padrão</button>
      </div>

      {companies.length === 0 && <p className="text-sm text-slate-400 italic">Nenhum comerciante cadastrado ainda.</p>}
      <div className="space-y-3">
        {companies.map(raw => {
          const u = withLocal(raw);
          const plan = resolvePlan(plans, u.plan);
          const cEff = couponQuota(u, plans, settings.defaultMaxCoupons);
          const eEff = eventQuota(u, plan, settings.defaultMaxEvents);
          const cUsed = coupons.filter(c => c.companyId === u.id && countsAgainstCouponQuota(c)).length;
          const eUsed = activeEventCount(events.filter(e => e.ownerId === u.id), today);
          return (
            <div key={u.id} className="bg-white rounded-3xl border border-slate-100 p-4 md:p-5 space-y-3" data-testid="limits-row">
              <div className="min-w-0">
                <p className="font-black text-ocean-950 truncate">{u.companyName || u.name}</p>
                <p className="text-xs font-semibold text-slate-400 truncate">{u.email} · plano {plan?.name || u.plan || 'sem plano'}</p>
              </div>
              <div className="grid gap-3 md:grid-cols-2">
                {([['c', 'Cupons', cUsed, cEff, u.maxCoupons], ['e', 'Eventos', eUsed, eEff, u.maxEvents]] as const).map(([k, label, used, eff, own]) => (
                  <div key={k} className="bg-slate-50 rounded-2xl p-3 flex flex-wrap items-center gap-2">
                    <div className="flex-1 min-w-[8rem]">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{label}</p>
                      <p className="text-sm font-bold text-ocean-700" data-testid={`limits-${k}-state`}>
                        Usando {used} de {eff === null ? 'sem limite' : eff}{typeof own === 'number' ? ' (definido por você)' : ''}
                      </p>
                    </div>
                    <input value={draft[u.id]?.[k] ?? (typeof own === 'number' ? String(own) : '')} onChange={e => setDraft(d => ({ ...d, [u.id]: { ...d[u.id], [k]: e.target.value } }))}
                      inputMode="numeric" aria-label={`${label} de ${u.companyName || u.name}`} data-testid={`limits-${k}-input`} className={inp} />
                    <button onClick={() => saveClient(raw, k)} disabled={busy === `${u.id}:${k}`} data-testid={`limits-${k}-save`} className={btn}>Salvar</button>
                    {typeof own === 'number' && <button onClick={() => saveClient(raw, k, true)} disabled={busy === `${u.id}:${k}`} className={btn2}>Seguir plano</button>}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
