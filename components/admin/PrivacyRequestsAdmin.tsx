import React, { useEffect, useState } from 'react';
import { Inbox, Loader2 } from 'lucide-react';
import { listPrivacyRequests, resolvePrivacyRequest, PrivacyRequest, PRIVACY_TYPE_LABEL, privacyDaysLeft } from '../../services/privacyService';
import { useNotification } from '../NotificationSystem';

/** Admin: fila de pedidos de titulares (LGPD). Prazo de resposta: 15 dias. */
export const PrivacyRequestsAdmin: React.FC = () => {
  const { notify } = useNotification();
  const [items, setItems] = useState<PrivacyRequest[] | null>(null);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState('');
  const load = () => listPrivacyRequests().then(setItems).catch(() => setItems([]));
  useEffect(() => { load(); }, []);
  const act = async (r: PrivacyRequest, status: 'done' | 'rejected') => {
    setBusy(r.id);
    try { await resolvePrivacyRequest(r.id, status, notes[r.id] || ''); notify('success', 'Pedido atualizado.'); await load(); }
    catch { notify('error', 'Não foi possível salvar. Confira se as regras do banco foram publicadas.'); }
    finally { setBusy(''); }
  };
  const open = (items || []).filter(r => r.status === 'open').length;
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-4" data-testid="privacy-admin">
      <div className="flex items-start gap-3">
        <span className="w-10 h-10 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center"><Inbox size={20} /></span>
        <div>
          <h3 className="font-black text-ocean-950">Pedidos de privacidade (LGPD)</h3>
          <p className="text-xs text-slate-500">{items === null ? 'Carregando…' : `${open} em aberto. Responda em até 15 dias.`}</p>
        </div>
      </div>
      {items === null && <Loader2 className="animate-spin text-slate-400" size={18} />}
      {items?.length === 0 && <p className="text-sm text-slate-500" data-testid="privacy-admin-empty">Nenhum pedido até agora.</p>}
      <ul className="space-y-3">
        {(items || []).map(r => {
          const left = privacyDaysLeft(r.createdAt);
          return (
            <li key={r.id} className="rounded-2xl border border-slate-100 p-4 space-y-2" data-testid="privacy-item">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <b className="text-ocean-950">{PRIVACY_TYPE_LABEL[r.type]}</b>
                <span className="text-slate-500">{r.userName} · {r.email}</span>
                {r.status === 'open'
                  ? <span className={`px-2 py-0.5 rounded-full font-black ${left <= 3 ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-800'}`}>{left >= 0 ? `${left} dias restantes` : `vencido há ${-left} dias`}</span>
                  : <span className="px-2 py-0.5 rounded-full font-black bg-emerald-50 text-emerald-700">{r.status === 'done' ? 'concluído' : 'recusado'}</span>}
              </div>
              <p className="text-sm text-slate-700 whitespace-pre-wrap">{r.message}</p>
              {r.residual && <p className="text-xs text-slate-500">Sobrou: {Object.entries(r.residual).map(([k, n]) => `${n} ${k}`).join(', ')}</p>}
              {r.status === 'open' ? (
                <div className="flex flex-wrap gap-2">
                  <input value={notes[r.id] || ''} onChange={e => setNotes(n => ({ ...n, [r.id]: e.target.value }))} placeholder="Resposta / observação" aria-label="Observação"
                    className="flex-1 min-w-[180px] h-9 rounded-xl border border-slate-200 px-3 text-sm" />
                  <button disabled={busy === r.id} onClick={() => act(r, 'done')} data-testid="privacy-done" className="px-3 h-9 rounded-full text-xs font-black bg-emerald-600 text-white disabled:opacity-50">Concluir</button>
                  <button disabled={busy === r.id} onClick={() => act(r, 'rejected')} className="px-3 h-9 rounded-full text-xs font-black bg-slate-100 text-slate-700 disabled:opacity-50">Recusar</button>
                </div>
              ) : r.resolutionNote && <p className="text-xs text-slate-500">Resposta: {r.resolutionNote}</p>}
            </li>
          );
        })}
      </ul>
    </div>
  );
};
