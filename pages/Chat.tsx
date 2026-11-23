import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, Send, MessageCircle, ShieldAlert, Ban, Flag, Loader2 } from 'lucide-react';
import { User } from '../types';
import { SEO } from '../components/SEO';
import { EmptyState } from '../components/ui/States';
import { blockChat, markChatRead, reportChat, sendChatMessage, unreadTotal, useMessages, useThread, useThreads, type ChatThread } from '../services/chatService';
import { CHAT_NOTICE_LINES, MAX_MESSAGE_LEN, REPORT_REASONS } from '../services/chatRules';

interface Props { currentUser: User; threadId?: string; onNavigate: (page: string, params?: any) => void }

const when = (iso?: string) => {
  if (!iso) return '';
  const d = new Date(iso); const now = new Date();
  return d.toDateString() === now.toDateString() ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};
const REASON_LABEL: Record<string, string> = { spam: 'Spam', golpe: 'Golpe ou pedido de dinheiro suspeito', ofensa: 'Ofensa ou assédio', outro: 'Outro motivo' };

/** Caixa de conversas. */
export const ChatInbox: React.FC<Props> = ({ currentUser, onNavigate }) => {
  const { threads, loading } = useThreads(currentUser.id);
  const total = unreadTotal(threads, currentUser.id);
  return (
    <div className="min-h-screen bg-slate-50 pb-28" data-testid="chat-inbox">
      <SEO title="Conversas" description="Suas conversas com empresas no Lagos GO." />
      <header className="bg-gradient-to-br from-ocean-600 to-ocean-950 text-white pt-6 pb-8 px-4">
        <div className="max-w-2xl mx-auto"><h1 className="text-xl font-black flex items-center gap-2"><MessageCircle size={20} /> Conversas {total > 0 && <span className="bg-amber-400 text-slate-950 text-xs px-2 py-0.5 rounded-full">{total}</span>}</h1>
          <p className="text-[13px] text-white/80 mt-1">Pedidos e mensagens com empresas. As tratativas são de responsabilidade da empresa.</p></div>
      </header>
      <div className="max-w-2xl mx-auto px-3 -mt-4 space-y-2">
        {loading ? <p className="text-center text-slate-400 py-10"><Loader2 className="animate-spin inline" /></p>
          : threads.length === 0 ? <EmptyState icon={<MessageCircle size={28} />} title="Nenhuma conversa ainda" message="Quando você enviar um pedido pelo chat de uma empresa, a conversa aparece aqui." />
          : threads.map(t => {
            const mine = t.ownerId === currentUser.id;
            const n = t.unread?.[currentUser.id] || 0;
            return (
              <button key={t.id} onClick={() => onNavigate('chat', { threadId: t.id })} className="w-full text-left bg-white rounded-2xl border border-slate-100 p-3.5 shadow-sm flex items-center gap-3" data-testid="chat-thread-row">
                <span className="w-11 h-11 rounded-full bg-ocean-100 text-ocean-700 font-black flex items-center justify-center shrink-0">{(mine ? t.customerName : t.businessName).slice(0, 1).toUpperCase()}</span>
                <span className="flex-1 min-w-0">
                  <span className="flex justify-between gap-2"><span className="font-black text-ocean-950 truncate">{mine ? `${t.customerName} · ${t.businessName}` : t.businessName}</span><span className="text-[11px] text-slate-400 shrink-0">{when(t.lastAt)}</span></span>
                  <span className={`block text-sm truncate ${n ? 'font-bold text-ocean-950' : 'text-slate-500'}`}>{t.blockedBy ? 'Conversa bloqueada' : t.lastText || 'Sem mensagens'}</span>
                </span>
                {n > 0 && <span className="bg-amber-400 text-slate-950 text-xs font-black min-w-[22px] h-[22px] rounded-full flex items-center justify-center px-1.5">{n}</span>}
              </button>
            );
          })}
      </div>
    </div>
  );
};

/** Uma conversa. */
export const ChatThreadPage: React.FC<Props> = ({ currentUser, threadId, onNavigate }) => {
  const thread = useThread(threadId);
  const messages = useMessages(threadId);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [err, setErr] = useState('');
  const [menu, setMenu] = useState(false);
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState<string>('spam');
  const [note, setNote] = useState('');
  const [done, setDone] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ block: 'end' }); }, [messages.length]);
  const unread = (thread as ChatThread | null | undefined)?.unread?.[currentUser.id] || 0;
  useEffect(() => { if (threadId && unread > 0) markChatRead(threadId); }, [threadId, unread]);

  const mine = useMemo(() => thread?.ownerId === currentUser.id, [thread, currentUser.id]);
  if (thread === undefined) return <p className="text-center text-slate-400 py-20"><Loader2 className="animate-spin inline" /></p>;
  if (!thread) return <div className="min-h-screen bg-slate-50 p-6"><EmptyState icon={<MessageCircle size={28} />} title="Conversa não encontrada" message="Ela pode ter sido removida ou você não tem acesso." /></div>;

  const blockedByMe = thread.blockedBy === currentUser.id;
  const blockedByOther = !!thread.blockedBy && !blockedByMe;
  const send = async () => {
    const t = text.trim(); if (!t || sending) return;
    setSending(true); setErr('');
    try { await sendChatMessage(thread.id, t); setText(''); } catch (e: any) { setErr(e?.message || 'Não foi possível enviar.'); }
    setSending(false);
  };
  const toggleBlock = async () => { setMenu(false); try { await blockChat(thread.id, !blockedByMe); } catch (e: any) { setErr(e?.message || 'Não foi possível concluir.'); } };
  const sendReport = async () => { try { await reportChat(thread.id, reason, note); setReporting(false); setDone('Denúncia enviada. Nossa equipe vai analisar.'); } catch (e: any) { setErr(e?.message || 'Não foi possível enviar a denúncia.'); } };

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50" data-testid="chat-thread">
      <SEO title="Conversa" description="Conversa com a empresa" />
      <header className="bg-ocean-950 text-white px-3 py-3 flex items-center gap-3 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <button onClick={() => onNavigate('chat-inbox')} aria-label="Voltar" className="p-1"><ArrowLeft size={22} /></button>
        <div className="flex-1 min-w-0"><p className="font-black truncate">{mine ? thread.customerName : thread.businessName}</p>
          <button onClick={() => !mine && onNavigate('business-detail', { businessId: thread.businessId })} className="text-[11px] text-cyan-200 truncate block">{mine ? `Pedido para ${thread.businessName}` : 'Ver perfil da empresa'}</button></div>
        <div className="relative">
          <button onClick={() => setMenu(m => !m)} aria-label="Mais opções" className="px-2 py-1 text-xl leading-none">⋮</button>
          {menu && <div className="absolute right-0 top-9 bg-white text-ocean-950 rounded-xl shadow-xl w-52 z-10 overflow-hidden text-sm font-bold">
            {(!blockedByOther) && <button onClick={toggleBlock} className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-slate-50"><Ban size={16} /> {blockedByMe ? 'Desbloquear' : 'Bloquear conversa'}</button>}
            <button onClick={() => { setMenu(false); setReporting(true); }} className="w-full text-left px-4 py-3 flex items-center gap-2 hover:bg-slate-50 text-red-600"><Flag size={16} /> Denunciar</button>
          </div>}
        </div>
      </header>
      <div className="bg-amber-50 border-b border-amber-100 px-4 py-2 text-[11px] text-amber-900 flex gap-2 items-start"><ShieldAlert size={14} className="shrink-0 mt-0.5" /><span>{CHAT_NOTICE_LINES[1]}</span></div>
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-2">
        {messages.map(m => {
          const me = m.senderId === currentUser.id;
          return (
            <div key={m.id} className={`flex ${me ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[82%] rounded-2xl px-3.5 py-2 text-[15px] whitespace-pre-wrap break-words ${me ? 'bg-ocean-600 text-white rounded-br-md' : 'bg-white text-ocean-950 border border-slate-100 rounded-bl-md'} ${m.kind === 'order' ? 'ring-2 ring-amber-300' : ''}`}>
                {m.kind === 'order' && <span className="block text-[10px] font-black uppercase tracking-wider opacity-70 mb-1">Pedido</span>}
                {m.text}
                <span className={`block text-[10px] mt-1 text-right ${me ? 'text-white/60' : 'text-slate-400'}`}>{when(m.at)}</span>
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
      {done && <p className="text-center text-xs font-bold text-emerald-700 py-1" role="status">{done}</p>}
      {err && <p className="text-center text-xs font-bold text-red-600 py-1" role="alert">{err}</p>}
      {blockedByOther ? <p className="p-4 text-center text-sm text-slate-500 bg-white border-t">Esta conversa foi bloqueada pela outra parte.</p>
        : blockedByMe ? <p className="p-4 text-center text-sm text-slate-500 bg-white border-t">Você bloqueou esta conversa. Use ⋮ para desbloquear.</p>
        : (
          <div className="bg-white border-t p-2 flex gap-2 items-end pb-[max(0.5rem,env(safe-area-inset-bottom))]">
            <textarea value={text} onChange={e => setText(e.target.value)} rows={1} maxLength={MAX_MESSAGE_LEN} aria-label="Mensagem" placeholder="Escreva sua mensagem"
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
              className="flex-1 resize-none max-h-28 rounded-2xl border border-slate-200 px-4 py-2.5 text-[15px] focus:outline-none focus:ring-2 focus:ring-ocean-400" />
            <button onClick={send} disabled={!text.trim() || sending} aria-label="Enviar" data-testid="chat-send" className="w-11 h-11 rounded-full bg-ocean-600 text-white flex items-center justify-center disabled:opacity-40">{sending ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}</button>
          </div>
        )}
      {reporting && (
        <div className="fixed inset-0 z-[300] bg-black/60 flex items-end sm:items-center justify-center" role="dialog" aria-modal="true" aria-label="Denunciar conversa">
          <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-3">
            <h2 className="text-lg font-black text-ocean-950">Denunciar conversa</h2>
            <p className="text-xs text-slate-500">Nossa equipe poderá ler as últimas mensagens desta conversa para analisar.</p>
            <div className="space-y-1.5">{REPORT_REASONS.map(r => <label key={r} className="flex items-center gap-2 text-sm font-bold"><input type="radio" name="reason" checked={reason === r} onChange={() => setReason(r)} /> {REASON_LABEL[r]}</label>)}</div>
            <textarea value={note} onChange={e => setNote(e.target.value)} maxLength={500} rows={2} placeholder="Quer contar mais? (opcional)" className="w-full border border-slate-200 rounded-xl p-3 text-sm" />
            <div className="flex gap-2"><button onClick={() => setReporting(false)} className="px-4 py-3 rounded-2xl border border-slate-200 text-xs font-black uppercase">Cancelar</button><button onClick={sendReport} className="flex-1 py-3 rounded-2xl bg-red-600 text-white font-black">Enviar denúncia</button></div>
          </div>
        </div>
      )}
    </div>
  );
};
