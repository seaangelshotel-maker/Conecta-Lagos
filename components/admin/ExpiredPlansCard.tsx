import React, { useEffect, useState } from 'react';
import { Loader2, CalendarDays } from 'lucide-react';
import type { BusinessProfile } from '../../types';
import { downgradeExpiredPlans, getExpiredPlanBusinesses } from '../../services/dataService';
import { useNotification } from '../NotificationSystem';

/** Admin: empresas com plano vencido (ainda com destaque ou plano pago) e botão para rebaixar. */
export const ExpiredPlansCard: React.FC<{ onDone?: () => void }> = ({ onDone }) => {
  const { notify } = useNotification();
  const [list, setList] = useState<BusinessProfile[] | null>(null);
  const [busy, setBusy] = useState(false);

  const load = () => getExpiredPlanBusinesses().then(setList).catch(() => setList([]));
  useEffect(() => { load(); }, []);

  const run = async () => {
    setBusy(true);
    try {
      const n = await downgradeExpiredPlans();
      notify('success', n ? `${n} empresa(s) rebaixada(s): sem destaque e sem benefícios do plano.` : 'Nada a rebaixar.');
      await load(); onDone?.();
    } catch (e: any) { notify('error', e?.message || 'Não foi possível rebaixar agora.'); }
    finally { setBusy(false); }
  };

  if (list === null) return null;
  return (
    <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5 space-y-3" data-testid="expired-plans">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex items-start gap-3">
          <div className="bg-amber-100 text-amber-700 p-3 rounded-2xl"><CalendarDays size={20} /></div>
          <div>
            <p className="font-black text-amber-950" data-testid="expired-count">{list.length} empresa(s) com plano vencido</p>
            <p className="text-xs font-semibold text-amber-800">Plano vencido perde destaque e benefícios e a empresa volta para "sem plano". Isso também roda sozinho todo dia, quando a rotina do servidor está configurada.</p>
          </div>
        </div>
        <button onClick={run} disabled={busy || list.length === 0} data-testid="expired-run" className="h-11 px-4 rounded-xl bg-amber-600 text-white text-xs font-black disabled:opacity-50 flex items-center gap-2">
          {busy && <Loader2 size={14} className="animate-spin" />} Rebaixar agora
        </button>
      </div>
      {list.length > 0 && (
        <ul className="text-xs font-bold text-amber-900 space-y-1">
          {list.slice(0, 8).map(b => <li key={b.id}>• {b.name} — plano {b.plan || '—'}, venceu em {(b.subscriptionEndsAt || '').slice(0, 10)}</li>)}
          {list.length > 8 && <li>+ {list.length - 8} outras</li>}
        </ul>
      )}
    </div>
  );
};
