import React, { useState } from 'react';
import { Send, Loader2, Bell, Copy, Sparkles } from 'lucide-react';
import { auth } from '../../services/firebase';
import { pushAvailability } from '../../services/pushService';
import { useNotification } from '../NotificationSystem';
import { getPublishedEvents } from '../../services/eventService';
import { getCoupons } from '../../services/dataService';
import { buildWeeklyDigest, Digest } from '../../services/weeklyDigest';

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
  const [digest, setDigest] = useState<Digest | null>(null);
  const [digestText, setDigestText] = useState('');
  const [building, setBuilding] = useState(false);

  /** Monta o aviso da semana com o que existe hoje no app (eventos do fim de semana + melhores cupons). */
  const buildDigest = async () => {
    setBuilding(true);
    try {
      const [events, coupons] = await Promise.all([getPublishedEvents(true), getCoupons(true)]);
      const d = buildWeeklyDigest({ events, coupons });
      setDigest(d); setDigestText(d.text);
      if (d.empty) notify('warning', 'Nada para avisar: sem eventos no fim de semana e sem cupons ativos.');
    } catch { notify('error', 'Não consegui carregar eventos e cupons. Tente de novo.'); }
    finally { setBuilding(false); }
  };

  const copyDigest = async () => {
    try { await navigator.clipboard.writeText(digestText); notify('success', 'Mensagem copiada. É só colar no WhatsApp.'); }
    catch { notify('warning', 'Não deu para copiar sozinho. Selecione o texto e copie.'); }
  };

  const useInPush = () => {
    if (!digest || digest.empty) return;
    setF({ ...f, title: digest.push.title, body: digest.push.body, link: digest.push.link, topic: digest.eventCount ? 'eventos' : 'cupons' });
    notify('success', 'Título e texto do push preenchidos abaixo. Confira e envie.');
  };

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
      <div className="rounded-2xl bg-ocean-50/60 border border-ocean-100 p-4 space-y-3" data-testid="weekly-digest">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <p className="font-black text-ocean-950 text-sm flex items-center gap-1.5"><Sparkles size={15} /> Aviso da semana</p>
            <p className="text-xs text-slate-500">Eventos do fim de semana + cupons que mais economizam. Gere, ajuste se quiser, copie para o WhatsApp ou use no push.</p>
          </div>
          <button onClick={buildDigest} disabled={building} data-testid="digest-build" className="h-10 px-4 rounded-xl bg-ocean-600 text-white text-sm font-black flex items-center gap-2 disabled:opacity-60">
            {building ? <Loader2 size={15} className="animate-spin" /> : <Sparkles size={15} />} Gerar aviso
          </button>
        </div>
        {digest && !digest.empty && (
          <>
            <p className="text-xs font-bold text-slate-500" data-testid="digest-counts">{digest.eventCount} evento(s) no fim de semana · {digest.couponCount} cupom(ns) em destaque</p>
            <textarea value={digestText} onChange={e => setDigestText(e.target.value)} rows={10} data-testid="digest-text" className="w-full border border-slate-200 rounded-xl px-3 py-2 text-sm font-mono bg-white" />
            <div className="flex flex-wrap gap-2">
              <button onClick={copyDigest} data-testid="digest-copy" className="h-10 px-4 rounded-xl bg-emerald-600 text-white text-sm font-black flex items-center gap-2"><Copy size={15} /> Copiar para WhatsApp</button>
              <button onClick={useInPush} data-testid="digest-use-push" className="h-10 px-4 rounded-xl bg-white border border-ocean-200 text-ocean-700 text-sm font-black">Usar no push</button>
            </div>
          </>
        )}
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
