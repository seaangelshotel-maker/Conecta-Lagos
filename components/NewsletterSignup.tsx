import React, { useState } from 'react';
import { Mail, Loader2, Check } from 'lucide-react';
import { subscribeNewsletter } from '../services/emailService';

/** Caixa de inscrição na newsletter semanal (confirmação por e-mail). */
export const NewsletterSignup: React.FC<{ source?: string }> = ({ source = 'site' }) => {
  const [email, setEmail] = useState('');
  const [trap, setTrap] = useState('');
  const [state, setState] = useState<'idle' | 'busy' | 'done'>('idle');
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (state === 'busy') return;
    setError(''); setState('busy');
    const r = await subscribeNewsletter(email.trim(), source, trap);
    if (r.ok) setState('done'); else { setState('idle'); setError(r.error || 'Não foi possível se inscrever.'); }
  };

  return (
    <section className="mx-4 my-6 rounded-[2rem] bg-ocean-900 text-white p-6" data-testid="newsletter-signup" aria-label="Newsletter">
      <div className="flex items-center gap-2 text-gold-400 text-[11px] font-black uppercase tracking-widest"><Mail size={14} /> Newsletter semanal</div>
      <h3 className="text-xl font-black mt-2">O fim de semana na Região dos Lagos, no seu e-mail</h3>
      <p className="text-sm text-ocean-100 mt-1">Eventos, cupons e novidades de Arraial do Cabo, Cabo Frio e Búzios. Toda sexta, sem spam.</p>
      {state === 'done' ? (
        <p className="mt-4 flex items-start gap-2 text-sm font-bold text-emerald-300" role="status"><Check size={18} className="shrink-0" /> Quase lá! Enviamos um e-mail para você confirmar a inscrição.</p>
      ) : (
        <form onSubmit={submit} className="mt-4 flex flex-col sm:flex-row gap-2">
          <input type="text" name="website" value={trap} onChange={e => setTrap(e.target.value)} tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
          <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@email.com" autoComplete="email" aria-label="Seu e-mail" className="flex-1 rounded-2xl px-4 py-3 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-gold-400" />
          <button type="submit" disabled={state === 'busy'} className="rounded-2xl bg-gold-500 hover:bg-gold-400 text-ocean-950 font-black text-sm px-5 py-3 flex items-center justify-center gap-2 disabled:opacity-60">
            {state === 'busy' && <Loader2 size={16} className="animate-spin" />} Quero receber
          </button>
        </form>
      )}
      {error && <p className="mt-2 text-xs font-bold text-red-300" role="alert">{error}</p>}
      <p className="mt-3 text-[11px] text-ocean-200">Você pode cancelar quando quiser, em um clique. Veja a <a href="/privacidade" className="underline">política de privacidade</a>.</p>
    </section>
  );
};
