import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarDays, Plus, Pencil, Trash2, Ban, Check, X, Star, Loader2, Eye, Download, Gauge } from 'lucide-react';
import { AppEvent, BusinessProfile, PricingPlan, User, UserRole } from '../../types';
import {
  adminDeleteEvent, adminSaveEvent, cancelMyEvent, deleteMyEvent, getAllEventsAdmin, getMyEventQuota, getMyEvents,
  importOfficialCalendar, saveMerchantEvent, setEventFeatured, setEventStatus, setUserEventQuota,
} from '../../services/eventService';
import { getAllUsers, getPricingPlans, getGlobalSettings } from '../../services/dataService';
import {
  EVENT_CATEGORIES, EventErrors, EventInput, activeEventCount, categoryLabel, cityLabel, eventPhase, eventQuota, formatEventDates,
  quotaState, resolvePlan, sortByDate, validateEvent, todayISO,
} from '../../services/eventRules';
import { REGION_MUNICIPALITIES } from '../../services/regionGeo';
import { ImageUpload } from '../ImageUpload';
import { useNotification } from '../NotificationSystem';
import { Badge, EmptyState, Field, inputClass, primaryButton, secondaryButton } from '../ui/States';

type Mode = 'merchant' | 'admin';

const EMPTY: EventInput & { coverImage: string; isFeatured: boolean; detailsTentative: boolean } = {
  title: '', description: '', category: 'musica', startDate: '', endDate: '', startTime: '', endTime: '', cityId: 'arraial-do-cabo',
  locationName: '', address: '', infoUrl: '', ticketUrl: '', priceText: '', isFree: false, coverImage: '', isFeatured: false, detailsTentative: false,
};

const fromEvent = (e: AppEvent): typeof EMPTY => ({
  ...EMPTY, title: e.title, description: e.description || '', category: e.category, startDate: e.startDate, endDate: e.endDate || '',
  startTime: e.startTime || '', endTime: e.endTime || '', cityId: e.cityId, locationName: e.locationName || '', address: e.address || '',
  infoUrl: e.infoUrl || '', ticketUrl: e.ticketUrl || '', priceText: e.priceText || '', isFree: !!e.isFree, coverImage: e.coverImage || '',
  isFeatured: !!e.isFeatured, detailsTentative: !!e.detailsTentative,
});

/** Formulário de evento (comerciante e admin). */
const EventForm: React.FC<{
  mode: Mode; initial?: AppEvent; defaultCityId?: string; saving: boolean;
  onSave: (v: typeof EMPTY) => void; onClose: () => void;
}> = ({ mode, initial, defaultCityId, saving, onSave, onClose }) => {
  const [v, setV] = useState(() => (initial ? fromEvent(initial) : { ...EMPTY, cityId: defaultCityId || EMPTY.cityId }));
  const [errors, setErrors] = useState<EventErrors>({});
  const set = (patch: Partial<typeof EMPTY>) => setV(prev => ({ ...prev, ...patch }));
  const pastOk = mode === 'admin' || (!!initial && initial.startDate < todayISO());

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateEvent(v, todayISO(), pastOk);
    setErrors(errs);
    if (Object.keys(errs).length === 0) onSave(v);
  };

  return (
    <div className="fixed inset-0 z-[90] bg-black/50 backdrop-blur-sm flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label={initial ? 'Editar evento' : 'Novo evento'}>
      <form onSubmit={submit} className="bg-slate-50 w-full max-w-2xl max-h-[92vh] overflow-y-auto rounded-t-[2rem] md:rounded-[2rem] p-5 md:p-8 space-y-4" data-testid="event-form">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-ocean-950">{initial ? 'Editar evento' : 'Novo evento'}</h2>
          <button type="button" onClick={onClose} aria-label="Fechar" className="w-10 h-10 rounded-full flex items-center justify-center hover:bg-slate-100"><X size={20} /></button>
        </div>
        {mode === 'merchant' && (
          <p className="text-xs font-bold text-ocean-800 bg-ocean-50 border border-ocean-100 rounded-2xl p-3">
            {initial?.status === 'published'
              ? 'Ajustes de capa, links, preço, horário e local entram na hora. Mudar título, descrição, data, cidade ou categoria envia o evento para nova aprovação.'
              : 'Seu evento passa por uma aprovação rápida da equipe antes de aparecer na agenda.'}
          </p>
        )}

        <Field label="Nome do evento" htmlFor="ev-title" required error={errors.title}>
          <input id="ev-title" className={inputClass(!!errors.title)} value={v.title} maxLength={100} onChange={e => set({ title: e.target.value })} placeholder="Ex.: Noite de forró na orla" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Categoria" htmlFor="ev-cat" required error={errors.category}>
            <select id="ev-cat" className={inputClass(!!errors.category)} value={v.category} onChange={e => set({ category: e.target.value })}>
              {EVENT_CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </Field>
          <Field label="Cidade" htmlFor="ev-city" required error={errors.cityId}>
            <select id="ev-city" className={inputClass(!!errors.cityId)} value={v.cityId} onChange={e => set({ cityId: e.target.value })}>
              {REGION_MUNICIPALITIES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Data de início" htmlFor="ev-start" required error={errors.startDate}>
            <input id="ev-start" type="date" className={inputClass(!!errors.startDate)} value={v.startDate} onChange={e => set({ startDate: e.target.value })} />
          </Field>
          <Field label="Data de término" htmlFor="ev-end" error={errors.endDate} hint="Deixe vazio se for em um dia só.">
            <input id="ev-end" type="date" className={inputClass(!!errors.endDate)} value={v.endDate || ''} min={v.startDate || undefined} onChange={e => set({ endDate: e.target.value })} />
          </Field>
          <Field label="Horário de início" htmlFor="ev-st" error={errors.startTime}>
            <input id="ev-st" type="time" className={inputClass(!!errors.startTime)} value={v.startTime || ''} onChange={e => set({ startTime: e.target.value })} />
          </Field>
          <Field label="Horário de término" htmlFor="ev-et" error={errors.endTime}>
            <input id="ev-et" type="time" className={inputClass(!!errors.endTime)} value={v.endTime || ''} onChange={e => set({ endTime: e.target.value })} />
          </Field>
        </div>
        <Field label="Nome do local" htmlFor="ev-loc" error={errors.locationName}>
          <input id="ev-loc" className={inputClass(!!errors.locationName)} value={v.locationName || ''} maxLength={120} onChange={e => set({ locationName: e.target.value })} placeholder="Ex.: Orla da Praia Grande" />
        </Field>
        <Field label="Endereço" htmlFor="ev-addr">
          <input id="ev-addr" className={inputClass()} value={v.address || ''} maxLength={200} onChange={e => set({ address: e.target.value })} />
        </Field>
        <Field label="Descrição" htmlFor="ev-desc" error={errors.description} hint="Atrações, programação, o que levar. Até 2000 caracteres.">
          <textarea id="ev-desc" rows={5} className={inputClass(!!errors.description)} value={v.description || ''} maxLength={2000} onChange={e => set({ description: e.target.value })} />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Entrada" htmlFor="ev-price" error={errors.priceText}>
            <input id="ev-price" className={inputClass(!!errors.priceText)} value={v.priceText || ''} maxLength={80} onChange={e => set({ priceText: e.target.value })} placeholder="Ex.: R$ 30 ou Lista VIP" />
          </Field>
          <label className="flex items-center gap-2.5 mt-6 text-sm font-bold text-ocean-950">
            <input type="checkbox" className="w-5 h-5 rounded text-ocean-600" checked={!!v.isFree} onChange={e => set({ isFree: e.target.checked })} /> Entrada gratuita
          </label>
        </div>
        <Field label="Link para ingressos" htmlFor="ev-tk" error={errors.ticketUrl}>
          <input id="ev-tk" type="url" inputMode="url" className={inputClass(!!errors.ticketUrl)} value={v.ticketUrl || ''} onChange={e => set({ ticketUrl: e.target.value })} placeholder="https://" />
        </Field>
        <Field label="Link de informações" htmlFor="ev-info" error={errors.infoUrl} hint="Site, Instagram ou WhatsApp (https://wa.me/...).">
          <input id="ev-info" type="url" inputMode="url" className={inputClass(!!errors.infoUrl)} value={v.infoUrl || ''} onChange={e => set({ infoUrl: e.target.value })} placeholder="https://" />
        </Field>
        <div>
          <p className="block text-xs font-black text-slate-600 uppercase tracking-wide mb-1.5">Imagem de capa</p>
          <ImageUpload currentImage={v.coverImage} onImageSelect={img => set({ coverImage: img })} label="Enviar capa" maxWidth={1000} />
          {v.coverImage && <button type="button" onClick={() => set({ coverImage: '' })} className="text-xs font-bold text-red-500 mt-2">Remover capa</button>}
        </div>
        {mode === 'admin' && (
          <div className="space-y-2 bg-white rounded-2xl border border-slate-100 p-4">
            <label className="flex items-center gap-2.5 text-sm font-bold text-ocean-950"><input type="checkbox" className="w-5 h-5 rounded text-ocean-600" checked={v.isFeatured} onChange={e => set({ isFeatured: e.target.checked })} /> Evento em destaque (sobe na agenda)</label>
            <label className="flex items-center gap-2.5 text-sm font-bold text-ocean-950"><input type="checkbox" className="w-5 h-5 rounded text-ocean-600" checked={v.detailsTentative} onChange={e => set({ detailsTentative: e.target.checked })} /> Local e horário ainda a confirmar</label>
          </div>
        )}
        {Object.keys(errors).length > 0 && <p className="text-sm font-bold text-red-600" role="alert">Confira os campos destacados.</p>}
        <div className="flex gap-3 pt-1">
          <button type="button" onClick={onClose} className={`${secondaryButton} flex-1`}>Cancelar</button>
          <button type="submit" disabled={saving} className={`${primaryButton} flex-1`} data-testid="event-save">{saving ? <Loader2 className="animate-spin" size={18} /> : <Check size={18} />} {initial ? 'Salvar' : mode === 'admin' ? 'Publicar' : 'Enviar para aprovação'}</button>
        </div>
      </form>
    </div>
  );
};

const statusBadge = (e: AppEvent) => {
  if (e.status === 'published') return eventPhase(e) === 'past' ? <Badge tone="slate">Encerrado</Badge> : <Badge tone="green">No ar</Badge>;
  if (e.status === 'pending') return <Badge tone="amber">Aguardando aprovação</Badge>;
  if (e.status === 'rejected') return <Badge tone="red">Recusado</Badge>;
  return <Badge tone="slate">Cancelado</Badge>;
};

// ---------------------------------------------------------------------------
// Comerciante
// ---------------------------------------------------------------------------

const MerchantEvents: React.FC<{ user: User; business?: BusinessProfile | null; onNavigate: (page: string, params?: any) => void }> = ({ user, business, onNavigate }) => {
  const { notify, confirm } = useNotification();
  const [events, setEvents] = useState<AppEvent[] | null>(null);
  const [quota, setQuota] = useState(0);
  const [planName, setPlanName] = useState('');
  const [form, setForm] = useState<{ open: boolean; event?: AppEvent }>({ open: false });
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      const [list, q] = await Promise.all([getMyEvents(user.id), getMyEventQuota(user, business?.plan)]);
      setEvents(sortByDate(list)); setQuota(q.quota); setPlanName(q.plan?.name || '');
    } catch (e: any) { setEvents([]); notify('error', e?.message || 'Não foi possível carregar seus eventos.'); }
  }, [user, business?.plan]);
  useEffect(() => { load(); }, [load]);

  const state = quotaState(events || [], quota);

  const save = async (v: typeof EMPTY) => {
    setSaving(true);
    try {
      const saved = await saveMerchantEvent({ ...v, businessId: business?.id, businessName: business?.name }, quota, form.event);
      notify('success', form.event ? (saved.status === 'pending' && form.event.status === 'published' ? 'Salvo. Como mudou algo importante, o evento volta para aprovação.' : 'Evento atualizado.') : 'Evento enviado! Assim que for aprovado, aparece na agenda.');
      setForm({ open: false });
      await load();
    } catch (e: any) { notify('error', e?.message || 'Não foi possível salvar o evento.'); }
    finally { setSaving(false); }
  };

  const cancel = async (e: AppEvent) => {
    if (!(await confirm({ title: 'Cancelar evento?', message: `"${e.title}" sai da agenda e libera uma vaga no seu plano.`, type: 'danger', confirmText: 'Cancelar evento', cancelText: 'Voltar' }))) return;
    try { await cancelMyEvent(e); await load(); notify('success', 'Evento cancelado.'); } catch (err: any) { notify('error', err?.message || 'Não foi possível cancelar.'); }
  };
  const remove = async (e: AppEvent) => {
    if (!(await confirm({ title: 'Apagar evento?', message: `"${e.title}" será apagado de vez.`, type: 'danger', confirmText: 'Apagar', cancelText: 'Voltar' }))) return;
    try { await deleteMyEvent(e); await load(); } catch (err: any) { notify('error', err?.message || 'Não foi possível apagar.'); }
  };

  if (!events) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-ocean-600" /></div>;
  const pct = quota > 0 ? Math.min(100, Math.round((state.used / quota) * 100)) : 0;

  return (
    <div className="space-y-5" data-testid="merchant-events">
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 md:p-7">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-ocean-950 flex items-center gap-2"><CalendarDays className="text-ocean-600" size={22} /> Meus eventos</h2>
            <p className="text-sm text-slate-500 mt-1 max-w-lg">Divulgue shows, festas, promoções e programações. Eles aparecem na Agenda, no Feed e na Home, para quem está na sua cidade primeiro.</p>
          </div>
          <button onClick={() => setForm({ open: true })} disabled={!state.canCreate} data-testid="new-event" className={`${primaryButton} shrink-0`}><Plus size={18} /> Novo evento</button>
        </div>
        <div className="mt-5" data-testid="event-quota">
          <div className="flex items-center justify-between text-xs font-black uppercase tracking-wide text-slate-400 mb-1.5">
            <span className="flex items-center gap-1.5"><Gauge size={13} /> Eventos ativos{planName ? ` · plano ${planName}` : ''}</span>
            <span className="text-ocean-950">{state.used} de {quota}</span>
          </div>
          <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden"><div className={`h-full rounded-full ${state.canCreate ? 'bg-ocean-600' : 'bg-amber-500'}`} style={{ width: `${pct}%` }} /></div>
          {quota === 0 ? (
            <p className="text-sm font-bold text-amber-700 mt-3">Seu plano ainda não inclui eventos. <button onClick={() => onNavigate('pricing-plans')} className="underline">Ver planos</button> ou fale com a gente para liberar.</p>
          ) : !state.canCreate ? (
            <p className="text-sm font-bold text-amber-700 mt-3">Você usou todas as vagas. Quando um evento terminar ou for cancelado, a vaga volta. Quer mais? <button onClick={() => onNavigate('pricing-plans')} className="underline">Ver planos</button>.</p>
          ) : (
            <p className="text-xs text-slate-400 mt-2">Eventos que terminam ou são cancelados liberam a vaga automaticamente.</p>
          )}
        </div>
      </div>

      {events.length === 0 ? (
        <EmptyState title="Você ainda não criou eventos" message={quota > 0 ? 'Crie o primeiro e apareça na agenda da região.' : 'Assim que o seu plano incluir eventos, eles aparecem aqui.'} icon={<CalendarDays size={28} />} />
      ) : (
        <div className="space-y-3">
          {events.map(e => (
            <div key={e.id} className="bg-white rounded-3xl border border-slate-100 p-4 md:p-5" data-testid="my-event">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">{statusBadge(e)}<span className="text-[11px] font-bold text-slate-400">{categoryLabel(e.category)} · {cityLabel(e.cityId)}</span></div>
              <p className="font-black text-ocean-950 text-lg leading-snug">{e.title}</p>
              <p className="text-sm font-semibold text-slate-500">{formatEventDates(e)}{e.startTime ? ` · ${e.startTime}` : ''}</p>
              {e.status === 'rejected' && e.rejectionReason && <p className="text-sm font-bold text-red-600 mt-1.5">Motivo: {e.rejectionReason}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                {e.status === 'published' && <button onClick={() => onNavigate('event-detail', { eventId: e.id })} className={`${secondaryButton} !py-2 !px-4 text-sm`}><Eye size={15} /> Ver na agenda</button>}
                {e.status !== 'cancelled' && <button onClick={() => setForm({ open: true, event: e })} className={`${secondaryButton} !py-2 !px-4 text-sm`}><Pencil size={15} /> Editar</button>}
                {(e.status === 'pending' || e.status === 'published') && <button onClick={() => cancel(e)} className={`${secondaryButton} !py-2 !px-4 text-sm !text-amber-700`}><Ban size={15} /> Cancelar</button>}
                {e.status !== 'published' && <button onClick={() => remove(e)} className={`${secondaryButton} !py-2 !px-4 text-sm !text-red-600`}><Trash2 size={15} /> Apagar</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      {form.open && <EventForm mode="merchant" initial={form.event} defaultCityId={business?.cityId && REGION_MUNICIPALITIES.some(m => m.id === business.cityId) ? business.cityId : undefined} saving={saving} onSave={save} onClose={() => setForm({ open: false })} />}
    </div>
  );
};

// ---------------------------------------------------------------------------
// Administrador
// ---------------------------------------------------------------------------

type AdminTab = 'pending' | 'live' | 'official' | 'closed' | 'quotas';

const AdminEvents: React.FC<{ user: User }> = ({ user }) => {
  const { notify, confirm } = useNotification();
  const [events, setEvents] = useState<AppEvent[] | null>(null);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [defaultEvents, setDefaultEvents] = useState<number | null>(null);
  const [companies, setCompanies] = useState<User[]>([]);
  const [tab, setTab] = useState<AdminTab>('pending');
  const [form, setForm] = useState<{ open: boolean; event?: AppEvent }>({ open: false });
  const [saving, setSaving] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<{ id: string; reason: string } | null>(null);
  const [quotaDraft, setQuotaDraft] = useState<Record<string, string>>({});
  const today = todayISO();

  const load = useCallback(async () => {
    try {
      const [list, p, users, gs] = await Promise.all([getAllEventsAdmin(), getPricingPlans().catch(() => []), getAllUsers().catch(() => []), getGlobalSettings().catch(() => null)]);
      setEvents(list); setPlans(p); setDefaultEvents(gs?.defaultMaxEvents ?? null); setCompanies(users.filter(u => u.role === UserRole.COMPANY));
      if (!list.some(e => e.status === 'pending')) setTab(t => (t === 'pending' ? 'live' : t));
    } catch (e: any) { setEvents([]); notify('error', e?.message || 'Não foi possível carregar os eventos.'); }
  }, []);
  useEffect(() => { load(); }, [load]);

  const groups = useMemo(() => {
    const all = events || [];
    return {
      pending: sortByDate(all.filter(e => e.status === 'pending')),
      live: sortByDate(all.filter(e => e.status === 'published' && eventPhase(e, today) !== 'past')),
      official: sortByDate(all.filter(e => e.source === 'official')),
      closed: sortByDate(all.filter(e => e.status === 'rejected' || e.status === 'cancelled' || (e.status === 'published' && eventPhase(e, today) === 'past'))).reverse(),
    };
  }, [events, today]);

  const run = async (id: string, fn: () => Promise<unknown>, ok?: string) => {
    setBusy(id);
    try { await fn(); if (ok) notify('success', ok); await load(); } catch (e: any) { notify('error', e?.message || 'Não foi possível concluir.'); } finally { setBusy(null); }
  };

  const save = async (v: typeof EMPTY) => {
    setSaving(true);
    try { await adminSaveEvent({ ...v, id: form.event?.id }); notify('success', form.event ? 'Evento atualizado.' : 'Evento publicado.'); setForm({ open: false }); await load(); }
    catch (e: any) { notify('error', e?.message || 'Não foi possível salvar.'); } finally { setSaving(false); }
  };

  const importOfficial = async () => {
    if (!(await confirm({ title: 'Importar calendário oficial 2026?', message: 'Traz os eventos do calendário da Prefeitura de Arraial do Cabo. Os que já existem são mantidos (nada é sobrescrito).', confirmText: 'Importar', cancelText: 'Voltar' }))) return;
    setBusy('import');
    try { const r = await importOfficialCalendar(); notify('success', `${r.created} evento(s) importado(s)${r.skipped ? `, ${r.skipped} já existiam` : ''}.`); await load(); }
    catch (e: any) { notify('error', e?.message || 'Falha na importação.'); } finally { setBusy(null); }
  };

  const saveQuota = async (u: User, reset = false) => {
    const raw = reset ? '' : (quotaDraft[u.id] ?? '').trim();
    const n = raw === '' ? null : Number(raw);
    await run(u.id, () => setUserEventQuota(u.id, n), n === null ? 'Agora segue a cota do plano.' : `Cota definida: ${n}.`);
    setQuotaDraft(d => { const { [u.id]: _, ...rest } = d; return rest; });
  };

  if (!events) return <div className="p-10 flex justify-center"><Loader2 className="animate-spin text-ocean-600" /></div>;

  const tabs: { id: AdminTab; label: string; n?: number }[] = [
    { id: 'pending', label: 'Pendentes', n: groups.pending.length },
    { id: 'live', label: 'No ar', n: groups.live.length },
    { id: 'official', label: 'Calendário oficial', n: groups.official.length },
    { id: 'closed', label: 'Encerrados e recusados', n: groups.closed.length },
    { id: 'quotas', label: 'Cotas dos comerciantes' },
  ];
  const list = tab === 'quotas' ? [] : groups[tab];

  return (
    <div className="space-y-5" data-testid="admin-events">
      <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 md:p-7 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-xl md:text-2xl font-black text-ocean-950 flex items-center gap-2"><CalendarDays className="text-ocean-600" size={22} /> Agenda de eventos</h2>
          <p className="text-sm text-slate-500 mt-1">Aprove eventos dos comerciantes, publique os seus e defina quantos cada um pode ter.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button onClick={importOfficial} disabled={busy === 'import'} data-testid="import-official" className={secondaryButton}>{busy === 'import' ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />} Importar calendário 2026</button>
          <button onClick={() => setForm({ open: true })} data-testid="admin-new-event" className={primaryButton}><Plus size={18} /> Novo evento</button>
        </div>
      </div>

      <div role="tablist" className="flex gap-2 overflow-x-auto no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
        {tabs.map(t => (
          <button key={t.id} role="tab" aria-selected={tab === t.id} onClick={() => setTab(t.id)} data-testid={`ev-tab-${t.id}`}
            className={`shrink-0 h-10 px-4 rounded-xl text-xs font-black uppercase tracking-wide border ${tab === t.id ? 'bg-ocean-600 text-white border-ocean-600' : 'bg-white text-ocean-700 border-slate-100'}`}>
            {t.label}{t.n !== undefined ? ` (${t.n})` : ''}
          </button>
        ))}
      </div>

      {tab === 'quotas' ? (
        <div className="space-y-3" data-testid="quota-list">
          <p className="text-sm text-slate-500">Cada comerciante segue a cota do plano. Defina um número aqui para dar mais (ou menos) eventos a ele; apague para voltar ao plano. A cota do plano se edita em Planos de Assinatura.</p>
          {companies.length === 0 && <EmptyState title="Nenhum comerciante cadastrado ainda" />}
          {companies.map(u => {
            const plan = resolvePlan(plans, u.plan);
            const planQuota = eventQuota(null, plan, defaultEvents);
            const effective = eventQuota(u, plan, defaultEvents);
            const used = activeEventCount(events.filter(e => e.ownerId === u.id), today);
            return (
              <div key={u.id} className="bg-white rounded-3xl border border-slate-100 p-4 md:p-5 flex flex-wrap items-center gap-4" data-testid="quota-row">
                <div className="min-w-0 flex-1">
                  <p className="font-black text-ocean-950 truncate">{u.companyName || u.name}</p>
                  <p className="text-xs font-semibold text-slate-400 truncate">{u.email} · plano {plan?.name || u.plan || 'sem plano'} ({planQuota} no plano)</p>
                  <p className="text-sm font-bold text-ocean-700 mt-1">Usando {used} de {effective}{typeof u.maxEvents === 'number' ? ' (cota definida por você)' : ''}</p>
                </div>
                <div className="flex items-center gap-2">
                  <input type="number" min={0} inputMode="numeric" aria-label={`Cota de eventos de ${u.companyName || u.name}`} placeholder={String(planQuota)}
                    value={quotaDraft[u.id] ?? (typeof u.maxEvents === 'number' ? String(u.maxEvents) : '')} onChange={e => setQuotaDraft(d => ({ ...d, [u.id]: e.target.value }))}
                    className="w-20 bg-slate-50 p-3 rounded-xl border border-slate-100 font-bold text-center" />
                  <button onClick={() => saveQuota(u)} disabled={busy === u.id} className={`${primaryButton} !py-3 !px-4 text-sm`}>Salvar</button>
                  {typeof u.maxEvents === 'number' && <button onClick={() => saveQuota(u, true)} disabled={busy === u.id} className={`${secondaryButton} !py-3 !px-4 text-sm`}>Seguir plano</button>}
                </div>
              </div>
            );
          })}
        </div>
      ) : list.length === 0 ? (
        <EmptyState title="Nada por aqui" message={tab === 'pending' ? 'Nenhum evento aguardando aprovação.' : tab === 'official' ? 'Use "Importar calendário 2026" para trazer os eventos da Prefeitura.' : undefined} icon={<CalendarDays size={28} />} />
      ) : (
        <div className="space-y-3">
          {list.map(e => (
            <div key={e.id} className="bg-white rounded-3xl border border-slate-100 p-4 md:p-5" data-testid="admin-event">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {statusBadge(e)}
                {e.source === 'official' && <Badge tone="ocean">Oficial</Badge>}
                {e.source === 'merchant' && <Badge tone="gold">{e.businessName || 'Comerciante'}</Badge>}
                {e.isFeatured && <Badge tone="amber">Destaque</Badge>}
                <span className="text-[11px] font-bold text-slate-400">{categoryLabel(e.category)} · {cityLabel(e.cityId)}</span>
              </div>
              <p className="font-black text-ocean-950 text-lg leading-snug">{e.title}</p>
              <p className="text-sm font-semibold text-slate-500">{formatEventDates(e)}{e.startTime ? ` · ${e.startTime}` : ''}{e.locationName ? ` · ${e.locationName}` : ''}</p>
              {e.description && <p className="text-sm text-slate-500 mt-1 line-clamp-2">{e.description}</p>}
              <div className="flex flex-wrap gap-2 mt-3">
                {e.status === 'pending' && <button onClick={() => run(e.id, () => setEventStatus(e, 'published'), 'Evento aprovado e no ar.')} disabled={busy === e.id} data-testid="approve" className={`${primaryButton} !py-2 !px-4 text-sm`}><Check size={15} /> Aprovar</button>}
                {e.status === 'pending' && <button onClick={() => setRejecting({ id: e.id, reason: '' })} className={`${secondaryButton} !py-2 !px-4 text-sm !text-red-600`}><X size={15} /> Recusar</button>}
                {e.status === 'published' && <button onClick={() => run(e.id, () => setEventFeatured(e, !e.isFeatured))} disabled={busy === e.id} className={`${secondaryButton} !py-2 !px-4 text-sm`}><Star size={15} className={e.isFeatured ? 'fill-amber-400 text-amber-500' : ''} /> {e.isFeatured ? 'Tirar destaque' : 'Destacar'}</button>}
                {e.status === 'published' && <button onClick={() => run(e.id, () => setEventStatus(e, 'cancelled'), 'Evento tirado do ar.')} disabled={busy === e.id} className={`${secondaryButton} !py-2 !px-4 text-sm !text-amber-700`}><Ban size={15} /> Tirar do ar</button>}
                {(e.status === 'rejected' || e.status === 'cancelled') && <button onClick={() => run(e.id, () => setEventStatus(e, 'published'), 'Evento publicado.')} disabled={busy === e.id} className={`${secondaryButton} !py-2 !px-4 text-sm`}><Check size={15} /> Publicar</button>}
                <button onClick={() => setForm({ open: true, event: e })} className={`${secondaryButton} !py-2 !px-4 text-sm`}><Pencil size={15} /> Editar</button>
                <button onClick={async () => { if (await confirm({ title: 'Apagar evento?', message: `"${e.title}" será apagado de vez.`, type: 'danger', confirmText: 'Apagar', cancelText: 'Voltar' })) run(e.id, () => adminDeleteEvent(e), 'Evento apagado.'); }} className={`${secondaryButton} !py-2 !px-4 text-sm !text-red-600`}><Trash2 size={15} /> Apagar</button>
              </div>
              {rejecting?.id === e.id && (
                <div className="mt-3 flex flex-wrap gap-2 items-center">
                  <input autoFocus value={rejecting.reason} onChange={ev => setRejecting({ id: e.id, reason: ev.target.value })} placeholder="Motivo (o comerciante vê)" aria-label="Motivo da recusa" className="flex-1 min-w-[12rem] bg-slate-50 p-3 rounded-xl border border-slate-100 text-sm font-medium" />
                  <button onClick={() => { const r = rejecting.reason; setRejecting(null); run(e.id, () => setEventStatus(e, 'rejected', r), 'Evento recusado.'); }} className={`${primaryButton} !py-3 !px-4 text-sm !bg-red-600`}>Confirmar recusa</button>
                  <button onClick={() => setRejecting(null)} className={`${secondaryButton} !py-3 !px-4 text-sm`}>Voltar</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {form.open && <EventForm mode="admin" initial={form.event} saving={saving} onSave={save} onClose={() => setForm({ open: false })} />}
    </div>
  );
};

/** Aba "Eventos" do painel: o admin modera e define cotas; o comerciante cria dentro do plano. */
export const EventsManager: React.FC<{ currentUser: User; myBusiness?: BusinessProfile | null; onNavigate: (page: string, params?: any) => void }> = ({ currentUser, myBusiness, onNavigate }) =>
  currentUser.role === UserRole.SUPER_ADMIN
    ? <AdminEvents user={currentUser} />
    : <MerchantEvents user={currentUser} business={myBusiness} onNavigate={onNavigate} />;
