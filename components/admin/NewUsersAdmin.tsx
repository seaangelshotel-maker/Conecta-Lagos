import React, { useEffect, useState } from 'react';
import { UserPlus, Loader2, RefreshCw, MapPin, Smartphone, Globe, ShieldCheck } from 'lucide-react';
import { adminNewUsers, NewUserRow } from '../../services/emailService';

const PROVIDER: Record<string, string> = { 'google.com': 'Google', password: 'E-mail e senha', 'facebook.com': 'Facebook', 'apple.com': 'Apple' };
const fmt = (iso?: string) => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d.getTime()) ? '—' : d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const place = (a: NewUserRow['access']) => a ? [a.city, a.region, a.country].filter(Boolean).join(', ') : '';

/** Admin: usuários mais recentes com foto, IP aproximado, local e aparelho (dados de acesso só existem a partir do registro de login). */
export const NewUsersAdmin: React.FC = () => {
  const [rows, setRows] = useState<NewUserRow[]>([]);
  const [total, setTotal] = useState(0);
  const [limit, setLimit] = useState(20);
  const [busy, setBusy] = useState(true);
  const [err, setErr] = useState('');

  const load = async (n = limit) => {
    setBusy(true); setErr('');
    try { const r = await adminNewUsers(n); setRows(r.users); setTotal(r.total); }
    catch (e: any) { setErr(e?.message || 'Falha ao carregar.'); }
    finally { setBusy(false); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  return (
    <div className="space-y-4" data-testid="new-users-admin">
      <div className="bg-white p-5 md:p-6 rounded-[2rem] border border-slate-100 shadow-sm">
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="flex items-center gap-2">
            <UserPlus size={20} className="text-ocean-600" />
            <h3 className="text-lg font-black text-ocean-950">Novos usuários</h3>
            {total > 0 && <span className="text-xs font-bold text-slate-400">{total} contas no total</span>}
          </div>
          <div className="flex items-center gap-2">
            <select value={limit} onChange={e => { const n = Number(e.target.value); setLimit(n); load(n); }} className="h-9 rounded-full border border-slate-200 px-3 text-xs font-bold">
              {[10, 20, 50, 100].map(n => <option key={n} value={n}>Últimos {n}</option>)}
            </select>
            <button onClick={() => load()} disabled={busy} className="h-9 px-3 rounded-full bg-ocean-600 text-white text-xs font-black flex items-center gap-1 disabled:opacity-60">
              {busy ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />} Atualizar
            </button>
          </div>
        </div>
        <p className="mt-3 text-xs text-slate-500 flex gap-1.5"><ShieldCheck size={14} className="shrink-0 mt-0.5" />IP, local e aparelho são registrados a cada login (no máximo 1 vez a cada 30 min), só você vê, e são apagados após 180 dias. O local pelo IP é aproximado. Contas que não entraram desde a ativação do registro aparecem sem IP.</p>
      </div>

      {err && <div className="p-4 rounded-2xl bg-red-50 text-red-700 text-sm font-bold">{err}</div>}
      {busy && !rows.length && <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-ocean-600" /></div>}

      <div className="grid gap-3">
        {rows.map(u => {
          const a = u.access;
          return (
            <div key={u.uid} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex gap-3" data-testid="new-user-row">
              {u.photoURL
                ? <img src={u.photoURL} alt="" referrerPolicy="no-referrer" className="w-14 h-14 rounded-full object-cover bg-slate-100 shrink-0" />
                : <div className="w-14 h-14 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center font-black text-lg shrink-0">{(u.name || u.email || '?').slice(0, 1).toUpperCase()}</div>}
              <div className="min-w-0 flex-1 text-sm">
                <div className="flex flex-wrap items-center gap-x-2">
                  <b className="text-ocean-950 truncate">{u.name || 'Sem nome'}</b>
                  {u.role && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">{u.role}</span>}
                  {u.disabled && <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-100 text-red-700">desativado</span>}
                </div>
                <div className="text-slate-500 truncate">{u.email}{!u.emailVerified && u.providers.includes('password') ? ' (e-mail não confirmado)' : ''}</div>
                <div className="mt-1 text-xs text-slate-500">Criada em {fmt(u.createdAt)} · {u.providers.map(p => PROVIDER[p] || p).join(', ') || '—'} · último login {fmt(u.lastSignInAt)}</div>
                {a ? (
                  <div className="mt-2 grid gap-1 text-xs text-slate-600">
                    <div className="flex items-center gap-1.5"><Globe size={13} /> IP <b className="font-mono">{a.ip || '—'}</b>{a.recentIps.length > 1 && <span className="text-slate-400">({a.recentIps.length} IPs recentes)</span>}</div>
                    <div className="flex items-center gap-1.5"><MapPin size={13} /> {place(a) || 'Local não identificado'}</div>
                    <div className="flex items-center gap-1.5"><Smartphone size={13} /> {a.device || '—'} · {a.count} acesso{a.count === 1 ? '' : 's'} · último {fmt(a.lastAt)}</div>
                  </div>
                ) : <div className="mt-2 text-xs text-slate-400">Sem IP registrado (ainda não fez login depois da ativação).</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
