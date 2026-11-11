import React, { useMemo, useState } from 'react';
import { Loader2, Building2 } from 'lucide-react';
import type { BusinessProfile } from '../../types';
import { releasableForClaim } from '../../services/claimRules';
import { releaseClaims } from '../../services/dataService';
import { useNotification } from '../NotificationSystem';

/** Admin: libera "Esta é sua empresa?" nas empresas sem dono, por categoria (lugares públicos ficam de fora). */
export const ClaimReleaseCard: React.FC<{ businesses: BusinessProfile[]; onDone?: () => void }> = ({ businesses, onDone }) => {
  const { notify } = useNotification();
  const [picked, setPicked] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);

  const byCat = useMemo(() => {
    const m = new Map<string, number>();
    releasableForClaim(businesses as any).forEach(b => m.set(b.category || 'Sem categoria', (m.get(b.category || 'Sem categoria') || 0) + 1));
    return [...m.entries()].sort((a, b) => b[1] - a[1]);
  }, [businesses]);
  const total = picked.length ? byCat.filter(([c]) => picked.includes(c)).reduce((s, [, n]) => s + n, 0) : 0;
  const open = businesses.filter(b => b.canBeClaimed !== false && !b.isClaimed && !(b as any).ownerId).length;

  const toggle = (c: string) => setPicked(p => p.includes(c) ? p.filter(x => x !== c) : [...p, c]);
  const run = async () => {
    setBusy(true);
    try {
      const n = await releaseClaims(picked);
      notify('success', `${n} empresa(s) liberada(s) para reivindicação.`);
      setPicked([]); onDone?.();
    } catch (e: any) { notify('error', e?.message || 'Não foi possível liberar.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="bg-amber-50 border border-amber-100 rounded-3xl p-5 space-y-3" data-testid="claim-release">
      <div className="flex items-start gap-3">
        <div className="bg-amber-100 text-amber-700 p-3 rounded-2xl"><Building2 size={20} /></div>
        <div>
          <p className="font-black text-amber-950">Liberar reivindicação</p>
          <p className="text-xs font-semibold text-amber-800" data-testid="claim-open-count">{open} empresa(s) já liberadas e sem dono. Escolha categorias para liberar mais; lugares públicos (praias, mirantes...) nunca entram.</p>
        </div>
      </div>
      {byCat.length === 0 ? <p className="text-xs font-bold text-amber-800">Nenhuma empresa fechada para liberar.</p> : (
        <div className="flex flex-wrap gap-2">
          {byCat.map(([c, n]) => (
            <button key={c} onClick={() => toggle(c)} data-testid={`claim-cat-${c}`} aria-pressed={picked.includes(c)}
              className={`h-9 px-3 rounded-full text-xs font-black border ${picked.includes(c) ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-amber-800 border-amber-200'}`}>{c} ({n})</button>
          ))}
        </div>
      )}
      <button onClick={run} disabled={busy || total === 0} data-testid="claim-release-run" className="h-11 px-4 rounded-xl bg-amber-600 text-white text-xs font-black disabled:opacity-50 flex items-center gap-2">
        {busy && <Loader2 size={14} className="animate-spin" />} Liberar {total || ''} empresa(s)
      </button>
    </div>
  );
};
