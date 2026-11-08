import React, { useEffect, useState } from 'react';
import { getConsent, setConsent } from '../services/consent';

/** Aviso de cookies/Analytics (LGPD). Aparece até a pessoa escolher; não bloqueia o uso do app. */
export const ConsentBanner: React.FC<{ onNavigate: (page: string) => void }> = ({ onNavigate }) => {
  const [open, setOpen] = useState(false);
  useEffect(() => { setOpen(getConsent() === null); }, []);
  if (!open) return null;
  const choose = (v: 'granted' | 'denied') => { setConsent(v); setOpen(false); };
  return (
    <div role="dialog" aria-label="Privacidade" data-testid="consent-banner"
      className="fixed left-3 right-3 md:left-auto md:right-6 md:max-w-sm z-[55] above-bottom-nav mb-3 bg-white border border-slate-200 shadow-xl rounded-2xl p-4">
      <p className="text-sm text-slate-700 leading-snug">
        Usamos armazenamento no aparelho para o app funcionar e, se você aceitar, estatísticas de uso para melhorar o Lagos GO.{' '}
        <button onClick={() => onNavigate('privacy')} className="text-ocean-600 font-bold">Saiba mais</button>
      </p>
      <div className="mt-3 flex gap-2">
        <button onClick={() => choose('denied')} data-testid="consent-deny" className="flex-1 h-10 rounded-xl bg-slate-100 text-slate-700 text-sm font-black">Recusar</button>
        <button onClick={() => choose('granted')} data-testid="consent-accept" className="flex-1 h-10 rounded-xl bg-ocean-600 text-white text-sm font-black">Aceitar</button>
      </div>
    </div>
  );
};
