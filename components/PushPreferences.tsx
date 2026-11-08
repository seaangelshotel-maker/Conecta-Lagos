import React, { useState } from 'react';
import { Bell, BellOff, Loader2 } from 'lucide-react';
import { PUSH_TOPICS, PushTopic, enablePush, disablePush, savedPush, pushAvailability } from '../services/pushService';

/** Cartão para ligar/desligar avisos e escolher temas. Some quando o aparelho não suporta ou o projeto não está configurado. */
export const PushPreferences: React.FC<{ uid?: string | null; compact?: boolean }> = ({ uid, compact }) => {
  const av = pushAvailability();
  const [state, setState] = useState(savedPush());
  const [topics, setTopics] = useState<PushTopic[]>(state?.topics || ['cupons', 'materias', 'eventos']);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');
  if (!av.ok) return null;

  const on = !!state;
  const toggle = (t: PushTopic) => setTopics(cur => (cur.includes(t) ? cur.filter(x => x !== t) : [...cur, t]));
  const activate = async () => {
    if (!topics.length) { setMsg('Escolha pelo menos um tema.'); return; }
    setBusy(true); setMsg('');
    try { setState(await enablePush(topics, uid)); setMsg('Pronto! Você vai receber os avisos escolhidos.'); }
    catch (e: any) { setMsg(e?.message || 'Não foi possível ativar.'); }
    finally { setBusy(false); }
  };
  const deactivate = async () => { setBusy(true); await disablePush(); setState(null); setBusy(false); setMsg('Avisos desligados neste aparelho.'); };

  return (
    <section className={`bg-white rounded-3xl border border-slate-100 ${compact ? 'p-4' : 'p-5'} space-y-3`} data-testid="push-prefs">
      <div className="flex items-center gap-3">
        <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${on ? 'bg-emerald-50 text-emerald-600' : 'bg-ocean-50 text-ocean-600'}`}>{on ? <Bell size={18} /> : <BellOff size={18} />}</span>
        <div className="flex-1">
          <p className="font-black text-ocean-950 text-sm">Avisos no celular</p>
          <p className="text-xs text-slate-500">{on ? 'Ativos neste aparelho.' : 'Receba cupons, matérias e eventos da região.'}</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {PUSH_TOPICS.map(t => (
          <button key={t.id} onClick={() => toggle(t.id)} aria-pressed={topics.includes(t.id)} data-testid={`push-topic-${t.id}`}
            className={`px-3 h-8 rounded-full text-xs font-bold border ${topics.includes(t.id) ? 'bg-ocean-600 text-white border-ocean-600' : 'bg-white text-slate-600 border-slate-200'}`}>{t.label}</button>
        ))}
      </div>
      <div className="flex gap-2">
        <button onClick={activate} disabled={busy} data-testid="push-enable" className="h-10 px-4 rounded-xl bg-ocean-600 text-white text-xs font-black flex items-center gap-2 disabled:opacity-60">
          {busy && <Loader2 size={14} className="animate-spin" />} {on ? 'Salvar temas' : 'Ativar avisos'}
        </button>
        {on && <button onClick={deactivate} disabled={busy} data-testid="push-disable" className="h-10 px-4 rounded-xl bg-slate-100 text-slate-700 text-xs font-black">Desligar</button>}
      </div>
      {msg && <p role="status" className="text-xs font-bold text-slate-600" data-testid="push-msg">{msg}</p>}
    </section>
  );
};
