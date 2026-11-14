import React, { useEffect, useState } from 'react';
import { Bell, Loader2 } from 'lucide-react';
import { PUSH_TOPICS, enablePush, pushAvailability, savedPush } from '../services/pushService';
import { isNative } from '../services/native';

const ASKED = 'lagosgo_push_asked_v1';

/**
 * Convite para ligar os avisos, só dentro do aplicativo (Android/iOS). Aparece uma vez, alguns segundos
 * depois de abrir. Só no "Quero" o sistema mostra o pedido oficial de permissão; no navegador comum nada muda.
 */
export const PushOptIn: React.FC<{ uid?: string | null }> = ({ uid }) => {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    if (!isNative()) return;
    let asked = false;
    try { asked = !!localStorage.getItem(ASKED); } catch { /* ok */ }
    if (asked || savedPush() || !pushAvailability().ok) return;
    const t = setTimeout(() => setOpen(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const mark = () => { try { localStorage.setItem(ASKED, '1'); } catch { /* ok */ } };
  const close = () => { mark(); setOpen(false); };
  const accept = async () => {
    setBusy(true); setMsg('');
    try {
      await enablePush(PUSH_TOPICS.map(t => t.id), uid);
      mark(); setOpen(false);
    } catch {
      mark(); setMsg('Sem permissão por enquanto. Você pode ativar depois em Perfil › Avisos no celular.');
      setTimeout(() => setOpen(false), 3500);
    } finally { setBusy(false); }
  };

  if (!open) return null;
  return (
    <div className="fixed inset-x-0 bottom-0 z-[90] p-4" role="dialog" aria-label="Ativar avisos" data-testid="push-optin">
      <div className="max-w-md mx-auto bg-white rounded-3xl shadow-2xl border border-slate-100 p-5 space-y-4">
        <div className="flex items-start gap-3">
          <span className="w-11 h-11 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center shrink-0"><Bell size={20} /></span>
          <div>
            <p className="font-black text-ocean-950">Quer receber os avisos da região?</p>
            <p className="text-sm text-slate-500 mt-1">Cupons, ofertas, matérias e eventos dos Lagos direto no celular. Você escolhe os temas depois.</p>
          </div>
        </div>
        {msg && <p role="status" className="text-xs font-bold text-slate-600">{msg}</p>}
        <div className="flex gap-2">
          <button onClick={close} disabled={busy} className="flex-1 h-11 rounded-xl bg-slate-100 text-slate-700 text-sm font-black">Agora não</button>
          <button onClick={accept} disabled={busy} data-testid="push-optin-yes" className="flex-1 h-11 rounded-xl bg-ocean-600 text-white text-sm font-black flex items-center justify-center gap-2 disabled:opacity-60">
            {busy && <Loader2 size={14} className="animate-spin" />} Quero
          </button>
        </div>
      </div>
    </div>
  );
};
