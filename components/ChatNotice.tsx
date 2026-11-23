import React, { useState } from 'react';
import { ShieldAlert, X } from 'lucide-react';
import { CHAT_NOTICE_CHECK, CHAT_NOTICE_LINES, CHAT_NOTICE_TITLE } from '../services/chatRules';

/** Aviso de responsabilidade: aparece antes da primeira conversa; o aceite é gravado pelo servidor com data e hora. */
export const ChatNotice: React.FC<{ onAccept: () => void; onCancel: () => void; busy?: boolean; whatsappAvailable?: boolean }> = ({ onAccept, onCancel, busy, whatsappAvailable }) => {
  const [ok, setOk] = useState(false);
  return (
    <div className="fixed inset-0 z-[300] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4" role="dialog" aria-modal="true" aria-label={CHAT_NOTICE_TITLE} data-testid="chat-notice">
      <div className="bg-white w-full sm:max-w-md rounded-t-3xl sm:rounded-3xl p-6 space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between gap-3">
          <h2 className="text-lg font-black text-ocean-950 flex items-center gap-2"><ShieldAlert className="text-amber-500" size={22} /> {CHAT_NOTICE_TITLE}</h2>
          <button onClick={onCancel} aria-label="Fechar" className="text-slate-400"><X size={22} /></button>
        </div>
        <ul className="space-y-2 text-sm text-slate-700">
          {CHAT_NOTICE_LINES.map(l => <li key={l} className="bg-amber-50 border border-amber-100 rounded-xl p-3">{l}</li>)}
        </ul>
        <label className="flex items-start gap-3 cursor-pointer text-sm font-bold text-ocean-950">
          <input type="checkbox" data-testid="chat-accept" className="mt-0.5 w-5 h-5 rounded text-ocean-600" checked={ok} onChange={e => setOk(e.target.checked)} />
          <span>{CHAT_NOTICE_CHECK}</span>
        </label>
        <div className="flex gap-2">
          <button onClick={onCancel} className="px-4 py-3 rounded-2xl border border-slate-200 text-xs font-black uppercase">{whatsappAvailable ? 'Usar WhatsApp' : 'Cancelar'}</button>
          <button onClick={onAccept} disabled={!ok || busy} data-testid="chat-accept-go" className="flex-1 py-3 rounded-2xl bg-ocean-600 text-white font-black disabled:opacity-40">{busy ? 'Enviando…' : 'Concordo e continuar'}</button>
        </div>
      </div>
    </div>
  );
};
