import React, { useEffect, useState } from 'react';
import { ArrowLeft, Bell, Send, Loader2, Sparkles, History, Copy } from 'lucide-react';
import { collection, getDocs, limit, orderBy, query } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';
import { useNotification } from '../NotificationSystem';
import { getPublishedEvents } from '../../services/eventService';
import { getCoupons, getBlogPosts } from '../../services/dataService';
import { listPublicOpportunities } from '../../services/opportunityService';
import { GENERATORS, generatePush, TITLE_MAX, BODY_MAX, GeneratorId, PushDraft } from '../../services/pushGenerator';

const AUDIENCE = [
  { id: 'todos', label: 'Todos que ativaram' }, { id: 'cupons', label: 'Cupons e ofertas' },
  { id: 'materias', label: 'Matérias e notícias' }, { id: 'eventos', label: 'Eventos' }, { id: 'ajuda', label: 'Ajuda Colaborativa' },
];

interface Campaign { id: string; title: string; body: string; topic: string; sent: number; failed: number; at: string }

/** Página do admin: gerar avisos por categoria, ver como fica no celular e enviar (máx. 2 por dia). */
export const NotificationsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { notify } = useNotification();
  const [tab, setTab] = useState<'create' | 'history'>('create');
  const [f, setF] = useState({ title: '', body: '', link: '/', topic: 'todos' });
  const [loadingGen, setLoadingGen] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState('');
  const [usage, setUsage] = useState<{ sentToday: number; limit: number } | null>(null);
  const [history, setHistory] = useState<Campaign[] | null>(null);

  const generate = async (id: GeneratorId) => {
    setLoadingGen(id); setNote('');
    try {
      const [events, coupons, posts, opportunities] = await Promise.all([
        id.startsWith('eventos') ? getPublishedEvents(true) : Promise.resolve([]),
        id.startsWith('cupons') ? getCoupons(true) : Promise.resolve([]),
        id === 'noticia' || id === 'dica' ? getBlogPosts() : Promise.resolve([]),
        id === 'ajuda' ? listPublicOpportunities() : Promise.resolve([]),
      ]);
      const d: PushDraft = generatePush(id, { events, coupons, posts: posts as any, opportunities });
      if (d.empty) { setNote(d.reason || 'Nada para avisar agora.'); return; }
      setF({ title: d.title, body: d.body, link: d.link, topic: d.topic });
      setNote(`Pronto: ${d.count} item(ns) usados. Confira e ajuste antes de enviar.`);
    } catch { notify('error', 'Não consegui carregar os dados. Tente de novo.'); }
    finally { setLoadingGen(null); }
  };

  const call = async (dryRun: boolean, force = false) => {
    if (!f.title.trim() || !f.body.trim()) { notify('warning', 'Preencha título e texto.'); return; }
    if (!dryRun && !force && !window.confirm('Enviar esta notificação agora? Não dá para desfazer.')) return;
    setBusy(true); setResult('');
    try {
      const token = await auth.currentUser?.getIdToken();
      const r = await fetch('/api/push-send', { method: 'POST', headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` }, body: JSON.stringify({ ...f, dryRun, force }) });
      const j = await r.json().catch(() => ({}));
      if (r.status === 429 && j.limitReached) {
        setUsage({ sentToday: j.sentToday, limit: j.limit });
        if (window.confirm(`Hoje já foram ${j.sentToday} avisos (limite ${j.limit}). Enviar mais um mesmo assim? Muitos avisos fazem as pessoas desligarem as notificações.`)) { setBusy(false); return call(false, true); }
        setResult('Envio cancelado: limite diário atingido.'); return;
      }
      if (!r.ok) throw new Error(j.error || 'Falha no envio.');
      if (typeof j.sentToday === 'number') setUsage({ sentToday: j.sentToday, limit: j.limit });
      setResult(dryRun ? `${j.recipients} aparelho(s) receberiam este aviso.` : j.recipients === 0 ? 'Nenhum aparelho cadastrado ainda.' : `Enviado para ${j.sent} de ${j.recipients} aparelho(s).`);
      if (!dryRun) setHistory(null);
    } catch (e: any) { setResult(e?.message || 'Falha no envio.'); }
    finally { setBusy(false); }
  };

  useEffect(() => { call(true).catch(() => {}); /* mostra o contador do dia */ // eslint-disable-next-line
  }, []);

  useEffect(() => {
    if (tab !== 'history' || history) return;
    getDocs(query(collection(db, 'push_campaigns'), orderBy('at', 'desc'), limit(30)))
      .then(s => setHistory(s.docs.map(d => ({ id: d.id, ...(d.data() as any) }))))
      .catch(() => { setHistory([]); notify('error', 'Não consegui carregar o histórico.'); });
  }, [tab, history]);

  const copy = async () => {
    try { await navigator.clipboard.writeText(`${f.title}\n\n${f.body}\n\nhttps://lagosgo.com.br${f.link}`); notify('success', 'Copiado. É só colar no WhatsApp.'); }
    catch { notify('warning', 'Não deu para copiar sozinho.'); }
  };

  return (
    <div className="space-y-5" data-testid="notifications-page">
      <button onClick={onBack} className="flex items-center gap-2 text-sm font-bold text-slate-500"><ArrowLeft size={16} /> Voltar</button>
      <div className="flex items-center gap-3">
        <div className="bg-ocean-50 text-ocean-600 p-3 rounded-2xl"><Bell size={22} /></div>
        <div className="flex-1">
          <h2 className="font-black text-ocean-950 text-xl">Notificações</h2>
          <p className="text-sm text-slate-500">Escolha uma categoria, o texto é gerado com o que existe hoje no app.</p>
        </div>
        {usage && <span data-testid="push-usage" className={`text-xs font-black px-3 py-1.5 rounded-full ${usage.sentToday >= usage.limit ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-700'}`}>{usage.sentToday} de {usage.limit} avisos hoje</span>}
      </div>
      <div className="flex gap-2">
        {([['create', 'Criar', Sparkles], ['history', 'Histórico', History]] as const).map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)} className={`h-10 px-4 rounded-xl text-sm font-black flex items-center gap-2 ${tab === id ? 'bg-ocean-600 text-white' : 'bg-slate-100 text-slate-600'}`}><Icon size={15} /> {label}</button>
        ))}
      </div>

      {tab === 'create' && (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {GENERATORS.map(g => (
              <button key={g.id} onClick={() => generate(g.id)} disabled={!!loadingGen} data-testid={`gen-${g.id}`} className="text-left bg-slate-50 hover:bg-ocean-50 border border-slate-100 rounded-2xl p-3 disabled:opacity-60">
                <p className="font-black text-ocean-950 text-sm flex items-center gap-1.5">{loadingGen === g.id && <Loader2 size={13} className="animate-spin" />}{g.label}</p>
                <p className="text-[11px] text-slate-500">{g.hint}</p>
              </button>
            ))}
          </div>
          {note && <p role="status" data-testid="gen-note" className="text-sm font-bold text-slate-600">{note}</p>}

          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-3">
              <label className="block text-xs font-bold text-slate-500">Título ({f.title.length}/{TITLE_MAX})
                <input maxLength={TITLE_MAX} value={f.title} onChange={e => setF({ ...f, title: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" /></label>
              <label className="block text-xs font-bold text-slate-500">Texto ({f.body.length}/{BODY_MAX})
                <textarea maxLength={BODY_MAX} rows={3} value={f.body} onChange={e => setF({ ...f, body: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" /></label>
              <label className="block text-xs font-bold text-slate-500">Abrir ao tocar
                <input value={f.link} onChange={e => setF({ ...f, link: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm" /></label>
              <label className="block text-xs font-bold text-slate-500">Público
                <select value={f.topic} onChange={e => setF({ ...f, topic: e.target.value })} className="mt-1 w-full border border-slate-200 rounded-xl px-3 py-2 text-sm bg-white">
                  {AUDIENCE.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
                </select></label>
              <div className="flex flex-wrap gap-2">
                <button onClick={() => call(true)} disabled={busy} className="h-11 px-4 rounded-xl bg-slate-100 text-slate-700 text-sm font-black">Contar destinatários</button>
                <button onClick={() => call(false)} disabled={busy} data-testid="notif-send" className="h-11 px-5 rounded-xl bg-ocean-600 text-white text-sm font-black flex items-center gap-2 disabled:opacity-60">
                  {busy ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Enviar
                </button>
                <button onClick={copy} className="h-11 px-4 rounded-xl bg-emerald-600 text-white text-sm font-black flex items-center gap-2"><Copy size={15} /> WhatsApp</button>
              </div>
              {result && <p role="status" className="text-sm font-bold text-slate-700">{result}</p>}
            </div>
            <div>
              <p className="text-xs font-bold text-slate-500 mb-1">Como aparece no celular</p>
              <div className="bg-slate-900 rounded-3xl p-4">
                <div className="bg-white/95 rounded-2xl p-3 shadow">
                  <p className="text-[10px] text-slate-500 font-bold">LAGOS GO · agora</p>
                  <p className="font-black text-slate-900 text-sm" data-testid="preview-title">{f.title || 'Título do aviso'}</p>
                  <p className="text-xs text-slate-700">{f.body || 'O texto aparece aqui.'}</p>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {tab === 'history' && (
        <div className="space-y-2" data-testid="push-history">
          {!history && <Loader2 className="animate-spin text-ocean-600" />}
          {history && history.length === 0 && <p className="text-sm text-slate-500">Nenhum aviso enviado ainda.</p>}
          {history?.map(c => (
            <div key={c.id} className="bg-white border border-slate-100 rounded-2xl p-3">
              <p className="font-black text-sm text-ocean-950">{c.title}</p>
              <p className="text-xs text-slate-600">{c.body}</p>
              <p className="text-[11px] text-slate-400 mt-1">{new Date(c.at).toLocaleString('pt-BR')} · {c.topic} · enviado para {c.sent}{c.failed ? ` (${c.failed} falhas)` : ''}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
