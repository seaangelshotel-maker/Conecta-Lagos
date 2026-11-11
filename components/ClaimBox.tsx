import React, { useEffect, useState } from 'react';
import { Building2, CheckCircle2, Loader2 } from 'lucide-react';
import type { BusinessProfile, User } from '../types';
import { getMyClaims, submitClaim } from '../services/dataService';
import { CLAIM_ROLES, canClaim, pendingClaimFor, validateClaim, ClaimForm, ClaimErrors } from '../services/claimRules';
import { useNotification } from './NotificationSystem';

/** "Esta é sua empresa?": pedido de reivindicação com dados para a equipe confirmar com a pessoa. */
export const ClaimBox: React.FC<{ business: BusinessProfile; currentUser: User | null; onLogin?: () => void }> = ({ business, currentUser, onLogin }) => {
  const { notify } = useNotification();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [busy, setBusy] = useState(false);
  const [errors, setErrors] = useState<ClaimErrors>({});
  const [form, setForm] = useState<ClaimForm>({ ownerName: currentUser?.name || '', whatsapp: (currentUser as any)?.phone || '', role: CLAIM_ROLES[0], confirmed: false });

  useEffect(() => {
    let alive = true;
    if (currentUser) getMyClaims(currentUser.id).then(r => alive && setPending(!!pendingClaimFor(r, currentUser.id, business.id))).catch(() => {});
    return () => { alive = false; };
  }, [currentUser?.id, business.id]);

  if (!canClaim(business as any)) return null;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateClaim(form);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setBusy(true);
    try {
      await submitClaim(business, form);
      setPending(true); setOpen(false);
      notify('success', 'Pedido enviado! Nossa equipe vai confirmar com você pelo WhatsApp.');
    } catch (err: any) { notify('error', err?.message || 'Não foi possível enviar o pedido. Tente de novo.'); }
    finally { setBusy(false); }
  };

  const field = 'w-full bg-white p-3 rounded-xl border border-amber-200 text-sm font-bold outline-none';
  return (
    <div className="bg-amber-50 p-8 rounded-[2rem] border border-amber-100 space-y-4" data-testid="claim-box">
      <div className="flex items-center gap-3 text-amber-600">
        <Building2 size={24} />
        <h3 className="text-lg font-black uppercase tracking-tight">Esta é sua empresa?</h3>
      </div>
      <p className="text-sm text-amber-900/70 font-medium leading-relaxed">
        Reivindique esta página para gerenciar informações, responder avaliações e criar cupons de desconto exclusivos para seus clientes.
      </p>
      {pending ? (
        <p className="flex items-center gap-2 text-sm font-black text-emerald-700" data-testid="claim-pending"><CheckCircle2 size={18} /> Pedido em análise. Vamos confirmar com você pelo WhatsApp.</p>
      ) : !open ? (
        <button data-testid="claim-open" onClick={() => { if (!currentUser) { notify('warning', 'Faça login para reivindicar esta empresa.'); onLogin?.(); return; } setOpen(true); }}
          className="bg-amber-500 text-white font-black px-6 py-3 rounded-xl shadow-lg shadow-amber-500/20 hover:bg-amber-600 transition-all text-xs uppercase tracking-widest">
          Reivindicar agora
        </button>
      ) : (
        <form onSubmit={submit} className="space-y-3" data-testid="claim-form">
          <label className="block text-[10px] font-black text-amber-700 uppercase tracking-widest">Seu nome completo
            <input data-testid="claim-name" className={`${field} mt-1`} value={form.ownerName} onChange={e => setForm({ ...form, ownerName: e.target.value })} /></label>
          {errors.ownerName && <p className="text-xs font-bold text-red-600">{errors.ownerName}</p>}
          <label className="block text-[10px] font-black text-amber-700 uppercase tracking-widest">Seu WhatsApp (com DDD)
            <input data-testid="claim-whatsapp" inputMode="tel" className={`${field} mt-1`} placeholder="(22) 99999-0000" value={form.whatsapp} onChange={e => setForm({ ...form, whatsapp: e.target.value })} /></label>
          {errors.whatsapp && <p className="text-xs font-bold text-red-600">{errors.whatsapp}</p>}
          <label className="block text-[10px] font-black text-amber-700 uppercase tracking-widest">Sua relação com a empresa
            <select data-testid="claim-role" className={`${field} mt-1`} value={form.role} onChange={e => setForm({ ...form, role: e.target.value })}>
              {CLAIM_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
            </select></label>
          <label className="flex items-start gap-2 text-xs font-bold text-amber-900">
            <input data-testid="claim-confirm" type="checkbox" className="mt-0.5 w-4 h-4" checked={form.confirmed} onChange={e => setForm({ ...form, confirmed: e.target.checked })} />
            Declaro que represento esta empresa e posso gerenciar a página dela.
          </label>
          {errors.confirmed && <p className="text-xs font-bold text-red-600">{errors.confirmed}</p>}
          <div className="flex gap-2">
            <button type="submit" disabled={busy} data-testid="claim-send" className="bg-amber-500 text-white font-black px-6 py-3 rounded-xl text-xs uppercase tracking-widest disabled:opacity-60 flex items-center gap-2">
              {busy && <Loader2 size={14} className="animate-spin" />} Enviar pedido
            </button>
            <button type="button" onClick={() => setOpen(false)} className="px-4 py-3 rounded-xl text-xs font-black text-amber-700 uppercase">Cancelar</button>
          </div>
        </form>
      )}
    </div>
  );
};
