import React, { useState } from 'react';
import { Send, Loader2, Bell } from 'lucide-react';
import { auth } from '../../services/firebase';
import { pushAvailability } from '../../services/pushService';
import { useNotification } from '../NotificationSystem';

const TOPICS = [
  { id: 'todos', label: 'Todos que ativaram' }, { id: 'cupons', label: 'Cupons e ofertas' },
  { id: 'materias', label: 'Matérias e notícias' }, { id: 'eventos', label: 'Eventos' }, { id: 'ajuda', label: 'Ajuda Colaborativa' },
];

/** Admin: enviar notificação para quem ativou os avisos (por tema). */
export const PushAdmin: React.FC = () => {
  const { notify } = useNotification();
  const [f, setF] = useState({ title: '', body: '', link: '/', topic: 'todos' });
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');
  const web = pushAvailability();

  const call = async (dryRun: boolean) => {
    if (!f.title.trim() || !f.body.trim()) { notify('warning', 'Preencha título e texto.'); return; }
    if (!dryRun && !window.confirm('Enviar esta notificação agora? Não dá para desfazer.')) return;
    setBusy(true); setResult('');
    try {
      const token = await auth.currentUser?.getIdToken();
      const r = await fetch('/api/push-send', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...f, dryRun }) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(j.error || 'Falha no envio.');
      setResult(dryRun ? `${j.recipients} aparelho(s) receberiam esta notificação.` : `Enviada para ${j.sent} de ${j.recipients} aparelho(s). ${j.removed ? `${j.removed} aparelho(s) inativo(s) removido(s).` : ''}`);
    } catch (e: any) { setResult(e?.message || 'Falha no envio.'); }
    finally { setBusy(false); }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-4" data-testid="push-admin">
      <div className="flex items-start gap-3">
        <div className="bg-ocean-50 text-ocean-600 p-3 rounded-2xl"><Bell size={22} /></div>
        <div>
          <h3 className="font-black text-ocean-950 text-lg">Notificações push</h3>
          <p className="text-sm text-slate-500">Envie avisos para quem ativou as notificações. O link deve ser uma tela do app (ex.: /guia/praia-do-forno).</p>
          {!web.ok && <p className="text-xs font-bold text-amber-700 mt-1">Neste navegador: {web.reason}</p>}
        </div>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <label className="text-xs font-bold text-slate-500">Título (até 80)
          <input maxLength={80} value={f.title} onChange={e => setF({ ...f, title: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" /></label>
        <label className="text-xs font-bold text-slate-500">Público
          <select value={f.topic} onChange={e => setF({ ...f, topic: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
            {TOPICS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select></label>
        <label className="text-xs font-bold text-slate-500 md:col-span-2">Texto (até 240)
          <textarea maxLength={240} rows={2} value={f.body} onChange={e => setF({ ...f, body: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" /></label>
        <label className="text-xs font-bold text-slate-500 md:col-span-2">Abrir ao tocar
          <input value={f.link} onChange={e => setF({ ...f, link: e.target.value })} placeholder="/blog" className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" /></label>
      </div>
      <div className="flex flex-wrap gap-2">
        <button onClick={() => call(true)} disabled={busy} className="h-11 px-4 rounded-xl bg-slate-100 text-slate-700 text-sm font-black">Contar destinatários</button>
        <button onClick={() => call(false)} disabled={busy} className="h-11 px-5 rounded-xl bg-ocean-600 text-white text-sm font-black flex items-center gap-2 disabled:opacity-60">
          {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Enviar
        </button>
      </div>
      {result && <p role="status" className="text-sm font-bold text-slate-700">{result}</p>}
    </div>
  );
};
