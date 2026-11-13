import React, { useEffect, useState } from 'react';
import { Mail, Loader2, Send, Eye, RefreshCw } from 'lucide-react';
import { adminEmail } from '../../services/emailService';
import { useNotification } from '../NotificationSystem';

interface Status { configured: boolean; from: string; admins: string[]; autoNewsletter: boolean; subscribers: { pending: number; active: number; unsubscribed: number } }
interface Preview { subject: string; html: string; hasContent: boolean; counts: { events: number; coupons: number; posts: number } }

/** Admin: situação do e-mail, envio de teste e newsletter (prévia, teste e envio). */
export const EmailAdmin: React.FC = () => {
  const { notify } = useNotification();
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState('');
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [intro, setIntro] = useState('');
  const [preview, setPreview] = useState<Preview | null>(null);

  const load = async () => {
    setBusy('status');
    try {
      const r = await adminEmail('status');
      if (!r.ok) throw new Error(r.data?.error);
      setStatus(r.data);
    } catch (e: any) { notify('error', e?.message || 'Não consegui ler a situação do e-mail.'); }
    finally { setBusy(''); }
  };
  useEffect(() => { load(); /* eslint-disable-next-line */ }, []);

  const run = async (key: string, fn: () => Promise<{ ok: boolean; data: any }>, okMsg: (d: any) => string) => {
    setBusy(key);
    try {
      const r = await fn();
      if (!r.ok) throw new Error(r.data?.error || 'Falha.');
      notify('success', okMsg(r.data));
      return r.data;
    } catch (e: any) { notify('error', e?.message || 'Falha.'); }
    finally { setBusy(''); }
  };

  const sendTest = () => run('test', () => adminEmail('test', { to }), () => 'E-mail de teste enviado. Confira a caixa de entrada (e o spam).');
  const doPreview = async () => { const d = await run('preview', () => adminEmail('newsletter-preview', { subject, intro }), () => 'Prévia atualizada.'); if (d) setPreview(d); };
  const sendMine = () => run('mine', () => adminEmail('newsletter-send', { subject, intro, mode: 'test' }), () => 'Newsletter de teste enviada para o seu e-mail.');
  const sendAll = async () => {
    if (!window.confirm(`Enviar a newsletter para ${status?.subscribers.active ?? 0} inscrito(s) agora? Não dá para desfazer.`)) return;
    await run('all', () => adminEmail('newsletter-send', { subject, intro }), d => d.empty ? 'Nada para enviar: sem eventos, cupons ou matérias.' : `Enviada para ${d.sent} de ${d.recipients} inscrito(s).`);
    load();
  };

  const btn = 'rounded-xl px-4 py-2.5 text-xs font-black uppercase tracking-wide flex items-center gap-2 disabled:opacity-50';
  return (
    <div className="bg-white rounded-[2rem] border border-slate-100 p-6 space-y-5" data-testid="email-admin">
      <div className="flex items-start gap-3">
        <div className="bg-ocean-50 text-ocean-600 p-3 rounded-2xl"><Mail size={22} /></div>
        <div className="flex-1">
          <h3 className="font-black text-ocean-950 text-lg">E-mails e newsletter</h3>
          <p className="text-sm text-slate-500">Boas-vindas, senha, planos, avisos da equipe e o resumo semanal (sexta, 9h).</p>
        </div>
        <button onClick={load} aria-label="Atualizar" className="text-slate-400 hover:text-ocean-600"><RefreshCw size={18} className={busy === 'status' ? 'animate-spin' : ''} /></button>
      </div>

      {status && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className={`rounded-2xl p-3 ${status.configured ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}><div className="font-black">{status.configured ? 'Ativo' : 'Desligado'}</div><div className="text-[11px] font-bold">Envio</div></div>
          <div className="rounded-2xl p-3 bg-ocean-50"><div className="font-black text-ocean-900">{status.subscribers.active}</div><div className="text-[11px] font-bold text-slate-500">Inscritos</div></div>
          <div className="rounded-2xl p-3 bg-ocean-50"><div className="font-black text-ocean-900">{status.subscribers.pending}</div><div className="text-[11px] font-bold text-slate-500">Aguardando confirmar</div></div>
          <div className="rounded-2xl p-3 bg-ocean-50"><div className="font-black text-ocean-900">{status.subscribers.unsubscribed}</div><div className="text-[11px] font-bold text-slate-500">Cancelaram</div></div>
        </div>
      )}
      {status && !status.configured && (
        <p className="text-xs font-bold text-amber-700 bg-amber-50 rounded-xl p-3">O envio está desligado: falta a chave RESEND_API_KEY na Vercel (veja docs/EMAIL.md). Até lá, o app usa o e-mail padrão do Firebase para senha.</p>
      )}
      {status && <p className="text-xs text-slate-500">Remetente: <b>{status.from}</b> · Avisos da equipe para: <b>{status.admins.join(', ') || 'ninguém'}</b> · Envio automático de sexta: <b>{status.autoNewsletter ? 'ligado' : 'desligado'}</b></p>}

      <div className="rounded-2xl bg-ocean-50/60 border border-ocean-100 p-4 space-y-3">
        <div className="font-black text-ocean-950 text-sm">Enviar e-mail de teste</div>
        <div className="flex gap-2 flex-wrap">
          <input value={to} onChange={e => setTo(e.target.value)} type="email" placeholder="Em branco = o seu e-mail" className="flex-1 min-w-[200px] rounded-xl border border-slate-200 px-3 py-2 text-sm" />
          <button onClick={sendTest} disabled={!!busy} className={`${btn} bg-ocean-600 text-white`}>{busy === 'test' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Testar</button>
        </div>
      </div>

      <div className="rounded-2xl bg-ocean-50/60 border border-ocean-100 p-4 space-y-3">
        <div className="font-black text-ocean-950 text-sm">Newsletter</div>
        <p className="text-xs text-slate-500">O conteúdo vem do que está publicado agora (eventos do fim de semana, melhores cupons e últimas matérias).</p>
        <input value={subject} onChange={e => setSubject(e.target.value)} maxLength={150} placeholder="Assunto (opcional)" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        <textarea value={intro} onChange={e => setIntro(e.target.value)} maxLength={400} rows={2} placeholder="Frase de abertura (opcional)" className="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm" />
        <div className="flex gap-2 flex-wrap">
          <button onClick={doPreview} disabled={!!busy} className={`${btn} bg-white border border-ocean-200 text-ocean-700`}>{busy === 'preview' ? <Loader2 size={14} className="animate-spin" /> : <Eye size={14} />} Ver prévia</button>
          <button onClick={sendMine} disabled={!!busy} className={`${btn} bg-white border border-ocean-200 text-ocean-700`}>{busy === 'mine' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Enviar para mim</button>
          <button onClick={sendAll} disabled={!!busy || !status?.configured || !status?.subscribers.active} className={`${btn} bg-gold-500 text-ocean-950`}>{busy === 'all' ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />} Enviar para todos</button>
        </div>
        {preview && (
          <div className="space-y-2">
            <p className="text-xs font-bold text-slate-600">Assunto: {preview.subject} · {preview.counts.events} evento(s), {preview.counts.coupons} cupom(ns), {preview.counts.posts} matéria(s){!preview.hasContent && ' · sem conteúdo: não seria enviada'}</p>
            <iframe title="Prévia da newsletter" sandbox="" srcDoc={preview.html} className="w-full h-[520px] rounded-xl border border-slate-200 bg-white" />
          </div>
        )}
      </div>
    </div>
  );
};
