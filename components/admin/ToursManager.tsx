import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Ship, Plus, Pencil, Trash2, Check, X, Loader2, MessageCircle, Lock, Unlock, Eye, EyeOff } from 'lucide-react';
import { BusinessProfile, Tour, TourBooking, TourSlot, TourSchedule } from '../../types';
import {
  adminConfirmBooking, adminDeleteTour, adminImportTourDrafts, adminSaveTour, adminSetSlotClosed, adminSetTourStatus, cancelBooking, getAllBookingsAdmin,
  getAllToursAdmin, getUpcomingSlotsAdmin,
} from '../../services/tourService';
import { getBusinesses, getGlobalSettings } from '../../services/dataService';
import {
  TourErrors, WEEKDAYS, bookingWhatsappText, brtDate, dayAvailability, emptySchedule, formatDateBR, isDate, isTime, priceLabel, validateTour, whatsappLink,
} from '../../services/tourRules';
import { REGION_MUNICIPALITIES } from '../../services/regionGeo';
import { ImageUpload } from '../ImageUpload';
import { useNotification } from '../NotificationSystem';
import { Badge, EmptyState, Field, inputClass, primaryButton, secondaryButton } from '../ui/States';

const GUIDA = 'guida-trips';

const EMPTY: Omit<Tour, 'id'> = {
  title: '', shortDescription: '', description: '', coverImage: '', gallery: [], cityId: 'arraial-do-cabo', meetingPoint: '', durationText: '',
  includes: [], notIncluded: [], requirements: '', capacityPerSlot: 10, minPeople: 1, maxPeoplePerBooking: 6, minNoticeHours: 12,
  schedule: emptySchedule(), operatorName: 'Guida Trips', operatorBusinessId: GUIDA, operatorWhatsapp: '', status: 'draft',
};

const lines = (s: string) => s.split('\n').map(x => x.trim()).filter(Boolean);

/** Formulário do passeio: dados, vagas, agenda e operadora. */
const TourForm: React.FC<{
  initial?: Tour; businesses: BusinessProfile[]; guidaWhatsapp: string; saving: boolean;
  onSave: (t: Omit<Tour, 'id'> & { id?: string }, publish: boolean) => void; onClose: () => void;
}> = ({ initial, businesses, guidaWhatsapp, saving, onSave, onClose }) => {
  const [v, setV] = useState<Omit<Tour, 'id'> & { id?: string }>(() => initial ? { ...EMPTY, ...initial, schedule: { ...emptySchedule(), ...initial.schedule } } : { ...EMPTY, operatorWhatsapp: guidaWhatsapp });
  const [inc, setInc] = useState((initial?.includes || []).join('\n'));
  const [exc, setExc] = useState((initial?.notIncluded || []).join('\n'));
  const [times, setTimes] = useState((initial?.schedule?.times || []).join(', '));
  const [blocked, setBlocked] = useState((initial?.schedule?.blockedDates || []).join(', '));
  const [extra, setExtra] = useState((initial?.schedule?.extraDates || []).map(x => `${x.date} ${x.times.join(' ')}`).join('\n'));
  const [pkgs, setPkgs] = useState<{ id: string; name: string; price: string; includes: string }[]>(() => (initial?.packages || []).map(x => ({ id: x.id, name: x.name, price: String(x.price), includes: x.includes.join('\n') })));
  const [errors, setErrors] = useState<TourErrors>({});
  const set = (p: Partial<typeof v>) => setV(prev => ({ ...prev, ...p }));
  const setSched = (p: Partial<TourSchedule>) => setV(prev => ({ ...prev, schedule: { ...prev.schedule, ...p } }));

  const passeios = useMemo(() => businesses.filter(b => /passeio/i.test(`${b.category} ${b.subcategory || ''}`)), [businesses]);
  const operatorValue = v.operatorBusinessId || 'custom';
  const pickOperator = (id: string) => {
    if (id === GUIDA) set({ operatorBusinessId: GUIDA, operatorName: 'Guida Trips', operatorWhatsapp: guidaWhatsapp || v.operatorWhatsapp });
    else if (id === 'custom') set({ operatorBusinessId: undefined });
    else { const b = businesses.find(x => x.id === id); if (b) set({ operatorBusinessId: b.id, operatorName: b.name, operatorWhatsapp: b.whatsapp || b.phone || '' }); }
  };

  const build = () => {
    const parsedTimes = times.split(/[,\s]+/).filter(isTime);
    const blockedDates = blocked.split(/[,\s]+/).filter(isDate);
    const extraDates = lines(extra).map(l => { const [d, ...t] = l.split(/\s+/); return { date: d, times: t.filter(isTime) }; }).filter(x => isDate(x.date) && x.times.length);
    const packages = pkgs.filter(x => x.name.trim() || x.price).map(x => ({ id: x.id, name: x.name.trim(), price: Number(String(x.price).replace(',', '.')) || 0, includes: lines(x.includes) }));
    return { ...v, packages: packages.length ? packages : undefined, includes: lines(inc), notIncluded: lines(exc), schedule: { ...v.schedule, times: parsedTimes, blockedDates, extraDates } };
  };
  const submit = (publish: boolean) => {
    const t = build();
    const errs = validateTour(t, publish);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    onSave({ ...t, status: publish ? 'published' : (t.status === 'published' ? 'published' : 'draft') }, publish);
  };
  const num = (k: 'capacityPerSlot' | 'minPeople' | 'maxPeoplePerBooking' | 'minNoticeHours') => (
    <input type="number" min={k === 'minNoticeHours' ? 0 : 1} className={inputClass(!!(errors as any)[k])} value={v[k]} onChange={e => set({ [k]: Math.floor(Number(e.target.value)) } as any)} />
  );

  return (
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-end md:items-center justify-center" role="dialog" aria-modal="true" data-testid="tour-form">
      <div className="bg-slate-50 w-full md:max-w-3xl max-h-[94vh] overflow-y-auto rounded-t-[2rem] md:rounded-[2rem] p-5 md:p-7 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black text-ocean-950">{initial ? 'Editar passeio' : 'Novo passeio'}</h2>
          <button onClick={onClose} aria-label="Fechar" className="w-10 h-10 rounded-full bg-white flex items-center justify-center"><X size={18} /></button>
        </div>

        <Field label="Nome do passeio" htmlFor="t-title" error={errors.title} required><input id="t-title" className={inputClass(!!errors.title)} value={v.title} maxLength={100} onChange={e => set({ title: e.target.value })} /></Field>
        <Field label="Resumo (aparece no cartão)" htmlFor="t-short" error={errors.shortDescription}><input id="t-short" className={inputClass(!!errors.shortDescription)} value={v.shortDescription} maxLength={160} onChange={e => set({ shortDescription: e.target.value })} /></Field>
        <Field label="Descrição" htmlFor="t-desc" error={errors.description} hint="Só o que é confirmado. Sem exagero."><textarea id="t-desc" rows={5} className={inputClass(!!errors.description)} value={v.description} onChange={e => set({ description: e.target.value })} /></Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Cidade" htmlFor="t-city"><select id="t-city" className={inputClass()} value={v.cityId} onChange={e => set({ cityId: e.target.value })}>{REGION_MUNICIPALITIES.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}</select></Field>
          <Field label="Duração" htmlFor="t-dur"><input id="t-dur" className={inputClass()} placeholder="Ex.: 3 horas" value={v.durationText} onChange={e => set({ durationText: e.target.value })} /></Field>
        </div>
        <Field label="Ponto de encontro" htmlFor="t-meet" error={errors.meetingPoint}><input id="t-meet" className={inputClass(!!errors.meetingPoint)} value={v.meetingPoint} onChange={e => set({ meetingPoint: e.target.value })} /></Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Inclui (um por linha)" htmlFor="t-inc"><textarea id="t-inc" rows={4} className={inputClass()} value={inc} onChange={e => setInc(e.target.value)} /></Field>
          <Field label="Não inclui (um por linha)" htmlFor="t-exc"><textarea id="t-exc" rows={4} className={inputClass()} value={exc} onChange={e => setExc(e.target.value)} /></Field>
        </div>
        <Field label="Requisitos / avisos" htmlFor="t-req"><input id="t-req" className={inputClass()} placeholder="Ex.: levar protetor solar e toalha" value={v.requirements || ''} onChange={e => set({ requirements: e.target.value })} /></Field>

        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Foto de capa" htmlFor="t-cover" error={errors.coverImage}><ImageUpload currentImage={v.coverImage} onImageSelect={img => set({ coverImage: img })} label="Capa" maxWidth={1000} /></Field>
          <Field label="Galeria (até 4 fotos)" htmlFor="t-gal"><ImageUpload allowMultiple currentImage="" onBatchSelect={imgs => set({ gallery: [...(v.gallery || []), ...imgs].slice(0, 4) })} label="Adicionar fotos" maxWidth={900} />
            {v.gallery.length > 0 && <div className="flex gap-2 mt-2">{v.gallery.map((g, i) => <div key={i} className="relative"><img src={g} alt="" className="w-14 h-14 object-cover rounded-xl" /><button onClick={() => set({ gallery: v.gallery.filter((_, j) => j !== i) })} aria-label="Remover foto" className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-red-500 text-white flex items-center justify-center"><X size={11} /></button></div>)}</div>}
          </Field>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-4 space-y-4">
          <p className="font-black text-ocean-950">Vagas e regras</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Field label="Vagas por saída" htmlFor="t-cap" error={errors.capacityPerSlot}>{num('capacityPerSlot')}</Field>
            <Field label="Mínimo" htmlFor="t-min" error={errors.minPeople}>{num('minPeople')}</Field>
            <Field label="Máx. por reserva" htmlFor="t-max" error={errors.maxPeoplePerBooking}>{num('maxPeoplePerBooking')}</Field>
            <Field label="Antecedência (h)" htmlFor="t-not">{num('minNoticeHours')}</Field>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Preço por pessoa (R$)" htmlFor="t-price" error={errors.price} hint="Vazio = 'Consulte o valor'"><input id="t-price" type="number" min={0} step="0.01" className={inputClass(!!errors.price)} value={v.price ?? ''} onChange={e => set({ price: e.target.value === '' ? undefined : Number(e.target.value) })} /></Field>
            <Field label="Nota do preço" htmlFor="t-pn"><input id="t-pn" className={inputClass()} placeholder="Ex.: crianças até 5 anos não pagam" value={v.priceNote || ''} onChange={e => set({ priceNote: e.target.value })} /></Field>
          </div>
          <div className="space-y-3" data-testid="tour-packages-editor">
            <p className="text-xs font-black text-slate-600 uppercase tracking-wide">Pacotes (opcional)</p>
            <p className="text-xs text-slate-500">Mesmo barco e mesmas vagas, com preços diferentes. Com pacotes, o cliente escolhe um na reserva e o preço acima deixa de valer.</p>
            {pkgs.map((pk, i) => (
              <div key={pk.id} className="rounded-2xl border border-slate-200 p-3 space-y-2">
                <div className="grid grid-cols-[1fr_8rem_auto] gap-2 items-end">
                  <Field label="Nome do pacote" htmlFor={`pk-n-${i}`}><input id={`pk-n-${i}`} className={inputClass()} value={pk.name} onChange={e => setPkgs(l => l.map((x, j) => j === i ? { ...x, name: e.target.value } : x))} placeholder="Ex.: Básico" /></Field>
                  <Field label="Preço (R$)" htmlFor={`pk-p-${i}`}><input id={`pk-p-${i}`} inputMode="decimal" className={inputClass()} value={pk.price} onChange={e => setPkgs(l => l.map((x, j) => j === i ? { ...x, price: e.target.value } : x))} placeholder="49,99" /></Field>
                  <button type="button" onClick={() => setPkgs(l => l.filter((_, j) => j !== i))} aria-label={`Remover pacote ${pk.name || i + 1}`} className="h-12 w-12 rounded-2xl border border-slate-200 text-red-500 flex items-center justify-center"><Trash2 size={16} /></button>
                </div>
                <Field label="O que inclui (um por linha)" htmlFor={`pk-i-${i}`}><textarea id={`pk-i-${i}`} rows={3} className={inputClass()} value={pk.includes} onChange={e => setPkgs(l => l.map((x, j) => j === i ? { ...x, includes: e.target.value } : x))} /></Field>
              </div>
            ))}
            {pkgs.length < 4 && <button type="button" onClick={() => setPkgs(l => [...l, { id: `p${Date.now().toString(36)}`, name: '', price: '', includes: '' }])} className={secondaryButton} data-testid="tour-add-package"><Plus size={16} /> Adicionar pacote</button>}
            {errors.packages && <p className="text-xs font-bold text-red-600" role="alert">{errors.packages}</p>}
          </div>
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-4 space-y-4" data-testid="tour-schedule-editor">
          <p className="font-black text-ocean-950">Agenda de saídas</p>
          <div>
            <p className="text-xs font-black text-slate-600 uppercase tracking-wide mb-2">Dias da semana</p>
            <div className="flex flex-wrap gap-2">{WEEKDAYS.map((w, i) => { const on = v.schedule.weekdays.includes(i); return (
              <button key={w} type="button" aria-pressed={on} onClick={() => setSched({ weekdays: on ? v.schedule.weekdays.filter(x => x !== i) : [...v.schedule.weekdays, i].sort() })} className={`h-10 px-4 rounded-full text-sm font-black border ${on ? 'bg-ocean-600 text-white border-ocean-600' : 'bg-white border-slate-200 text-ocean-900'}`}>{w}</button>); })}</div>
          </div>
          <Field label="Horários de saída" htmlFor="t-times" hint="Separe por vírgula. Ex.: 09:00, 14:00"><input id="t-times" className={inputClass(!!errors.schedule)} value={times} onChange={e => setTimes(e.target.value)} /></Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Temporada: início" htmlFor="t-s1"><input id="t-s1" type="date" className={inputClass()} value={v.schedule.startDate || ''} onChange={e => setSched({ startDate: e.target.value || undefined })} /></Field>
            <Field label="Temporada: fim" htmlFor="t-s2"><input id="t-s2" type="date" className={inputClass()} value={v.schedule.endDate || ''} onChange={e => setSched({ endDate: e.target.value || undefined })} /></Field>
          </div>
          <Field label="Datas sem saída" htmlFor="t-bl" hint="AAAA-MM-DD separadas por vírgula. Ex.: 2026-12-25, 2027-01-01"><input id="t-bl" className={inputClass()} value={blocked} onChange={e => setBlocked(e.target.value)} /></Field>
          <Field label="Saídas extras (uma data por linha)" htmlFor="t-ex" hint="Ex.: 2026-12-31 08:00 15:00"><textarea id="t-ex" rows={2} className={inputClass()} value={extra} onChange={e => setExtra(e.target.value)} /></Field>
          {errors.schedule && <p className="text-xs font-bold text-red-600" role="alert">{errors.schedule}</p>}
        </div>

        <div className="bg-white rounded-3xl border border-slate-100 p-4 space-y-4">
          <p className="font-black text-ocean-950">Quem opera</p>
          <Field label="Empresa" htmlFor="t-op">
            <select id="t-op" className={inputClass()} value={operatorValue} onChange={e => pickOperator(e.target.value)}>
              <option value={GUIDA}>Guida Trips (ecossistema)</option>
              {passeios.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
              <option value="custom">Outra (digitar)</option>
            </select>
          </Field>
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Nome exibido" htmlFor="t-opn" error={errors.operatorName}><input id="t-opn" className={inputClass(!!errors.operatorName)} value={v.operatorName} onChange={e => set({ operatorName: e.target.value })} /></Field>
            <Field label="WhatsApp que recebe as reservas" htmlFor="t-opw" error={errors.operatorWhatsapp}><input id="t-opw" className={inputClass(!!errors.operatorWhatsapp)} inputMode="tel" value={v.operatorWhatsapp} onChange={e => set({ operatorWhatsapp: e.target.value })} /></Field>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 sticky bottom-0 bg-slate-50 py-3">
          <button disabled={saving} onClick={() => submit(false)} className={`${secondaryButton} flex-1`}>Salvar rascunho</button>
          <button disabled={saving} onClick={() => submit(true)} className={`${primaryButton} flex-1`} data-testid="tour-publish">{saving ? <Loader2 className="animate-spin" size={18} /> : null} Publicar</button>
        </div>
      </div>
    </div>
  );
};

/** Saídas de um passeio: ocupação e fechamento manual. */
const SlotsPanel: React.FC<{ tour: Tour; onClose: () => void }> = ({ tour, onClose }) => {
  const { notify } = useNotification();
  const [slots, setSlots] = useState<TourSlot[] | null>(null);
  const load = useCallback(() => getUpcomingSlotsAdmin(tour.id).then(setSlots).catch(() => setSlots([])), [tour.id]);
  useEffect(() => { load(); }, [load]);
  const [date, setDate] = useState('');
  const views = date ? dayAvailability(tour, date, Object.fromEntries((slots || []).map(s => [s.id, s]))) : [];
  const toggle = async (d: string, time: string, closed: boolean) => {
    try { await adminSetSlotClosed(tour, d, time, closed); notify('success', closed ? 'Saída fechada.' : 'Saída reaberta.'); load(); } catch (e: any) { notify('error', e?.message || 'Erro ao salvar.'); }
  };
  return (
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-end md:items-center justify-center" role="dialog" aria-modal="true">
      <div className="bg-slate-50 w-full md:max-w-xl max-h-[90vh] overflow-y-auto rounded-t-[2rem] md:rounded-[2rem] p-5 space-y-4">
        <div className="flex items-center justify-between"><h2 className="font-black text-ocean-950">Saídas — {tour.title}</h2><button onClick={onClose} aria-label="Fechar" className="w-10 h-10 rounded-full bg-white flex items-center justify-center"><X size={18} /></button></div>
        <Field label="Escolha uma data para ver/fechar saídas" htmlFor="sl-date"><input id="sl-date" type="date" min={brtDate()} className={inputClass()} value={date} onChange={e => setDate(e.target.value)} /></Field>
        {date && (views.length === 0 ? <p className="text-sm text-slate-500">Não há saída nessa data.</p> : views.map(v => (
          <div key={v.time} className="bg-white rounded-2xl border border-slate-100 p-3 flex items-center justify-between">
            <div><p className="font-black">{v.time}</p><p className="text-xs text-slate-500">{v.booked}/{v.capacity} ocupadas {v.state === 'closed' && '· fechada'}</p></div>
            <button onClick={() => toggle(date, v.time, v.state !== 'closed')} className="text-sm font-black text-ocean-700 flex items-center gap-1">{v.state === 'closed' ? <><Unlock size={15} /> Reabrir</> : <><Lock size={15} /> Fechar</>}</button>
          </div>)))}
        <p className="font-black text-sm text-ocean-950 pt-2">Próximas saídas com reservas</p>
        {slots === null ? <Loader2 className="animate-spin" /> : slots.filter(s => s.booked > 0 || s.closed).length === 0 ? <p className="text-sm text-slate-500">Nenhuma ainda.</p>
          : slots.filter(s => s.booked > 0 || s.closed).map(s => <p key={s.id} className="text-sm text-slate-700">{formatDateBR(s.date)} às {s.time}: <b>{s.booked}</b>/{tour.capacityPerSlot}{s.closed ? ' (fechada)' : ''}</p>)}
      </div>
    </div>
  );
};

const BTONE = { pending: 'amber', confirmed: 'green', cancelled: 'slate' } as const;
const BLABEL = { pending: 'Pendente', confirmed: 'Confirmada', cancelled: 'Cancelada' } as const;

export const ToursManager: React.FC = () => {
  const { notify, confirm } = useNotification();
  const [tab, setTab] = useState<'tours' | 'bookings'>('tours');
  const [tours, setTours] = useState<Tour[] | null>(null);
  const [bookings, setBookings] = useState<TourBooking[] | null>(null);
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [guidaWhatsapp, setGuidaWhatsapp] = useState('');
  const [form, setForm] = useState<{ tour?: Tour } | null>(null);
  const [slotsFor, setSlotsFor] = useState<Tour | null>(null);
  const [saving, setSaving] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'confirmed' | 'cancelled' | 'all'>('pending');

  const loadTours = useCallback(() => getAllToursAdmin().then(setTours).catch(e => { setTours([]); notify('error', e?.message || 'Não foi possível carregar os passeios.'); }), []);
  const loadBookings = useCallback(() => getAllBookingsAdmin().then(setBookings).catch(e => { setBookings([]); notify('error', e?.message || 'Não foi possível carregar as reservas.'); }), []);
  useEffect(() => {
    loadTours(); loadBookings();
    getBusinesses().then(setBusinesses).catch(() => {});
    getGlobalSettings().then(s => setGuidaWhatsapp(s.specialistReferral?.whatsapp || '')).catch(() => {});
  }, []);

  const save = async (t: Omit<Tour, 'id'> & { id?: string }, publish: boolean) => {
    setSaving(true);
    try { await adminSaveTour(t); notify('success', publish ? 'Passeio publicado.' : 'Rascunho salvo.'); setForm(null); loadTours(); }
    catch (e: any) { notify('error', e?.message || 'Não foi possível salvar.'); }
    finally { setSaving(false); }
  };
  const toggleStatus = async (t: Tour) => { try { await adminSetTourStatus(t.id, t.status === 'published' ? 'draft' : 'published'); loadTours(); } catch (e: any) { notify('error', e?.message || 'Erro.'); } };
  const remove = async (t: Tour) => {
    if (!(await confirm({ title: 'Excluir passeio?', message: `"${t.title}" será apagado. As reservas já feitas continuam registradas.`, confirmText: 'Excluir', type: 'danger' }))) return;
    try { await adminDeleteTour(t.id); loadTours(); } catch (e: any) { notify('error', e?.message || 'Erro.'); }
  };
  const confirmB = async (b: TourBooking) => { try { await adminConfirmBooking(b.id); notify('success', 'Reserva confirmada.'); loadBookings(); } catch (e: any) { notify('error', e?.message || 'Erro.'); } };
  const cancelB = async (b: TourBooking) => {
    if (!(await confirm({ title: 'Cancelar reserva?', message: `${b.customerName} — ${formatDateBR(b.date)} às ${b.time}. As vagas voltam para a saída.`, confirmText: 'Cancelar reserva', type: 'danger' }))) return;
    try { await cancelBooking(b); notify('success', 'Reserva cancelada.'); loadBookings(); } catch (e: any) { notify('error', e?.message || 'Erro.'); }
  };

  const shown = (bookings || []).filter(b => filter === 'all' || b.status === filter);
  const pendingCount = (bookings || []).filter(b => b.status === 'pending').length;
  const tourOf = (id: string) => (tours || []).find(t => t.id === id);

  return (
    <div className="space-y-5" data-testid="tours-manager">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-2xl font-black text-ocean-950 flex items-center gap-2"><Ship size={24} /> Passeios</h2>
        <div className="flex gap-2">
          <button onClick={() => setTab('tours')} className={`px-4 h-10 rounded-full font-black text-sm ${tab === 'tours' ? 'bg-ocean-600 text-white' : 'bg-white border border-slate-200 text-ocean-700'}`}>Passeios</button>
          <button onClick={() => setTab('bookings')} className={`px-4 h-10 rounded-full font-black text-sm ${tab === 'bookings' ? 'bg-ocean-600 text-white' : 'bg-white border border-slate-200 text-ocean-700'}`}>Reservas{pendingCount > 0 ? ` (${pendingCount})` : ''}</button>
        </div>
      </div>

      {tab === 'tours' && (
        <>
          <button onClick={async () => { try { const r = await adminImportTourDrafts(); notify('success', `${r.created} rascunho(s) importado(s)${r.skipped ? `, ${r.skipped} já existiam` : ''}.`); loadTours(); } catch (e: any) { notify('error', e?.message || 'Não foi possível importar.'); } }} className={secondaryButton} data-testid="tour-import-drafts">Importar rascunhos</button>
          <button onClick={() => setForm({})} className={primaryButton} data-testid="tour-new"><Plus size={18} /> Novo passeio</button>
          {tours === null ? <Loader2 className="animate-spin" /> : tours.length === 0
            ? <EmptyState icon={<Ship size={28} />} title="Nenhum passeio cadastrado" message="Crie o primeiro: nome, fotos, agenda de saídas e vagas." />
            : <div className="grid gap-3">{tours.map(t => (
              <div key={t.id} className="bg-white rounded-3xl border border-slate-100 p-4 flex gap-3" data-testid="tour-row">
                <div className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0">{t.coverImage && <img src={t.coverImage} alt="" className="w-full h-full object-cover" />}</div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 flex-wrap"><p className="font-black text-ocean-950 truncate">{t.title}</p><Badge tone={t.status === 'published' ? 'green' : 'slate'}>{t.status === 'published' ? 'Publicado' : 'Rascunho'}</Badge></div>
                  <p className="text-xs text-slate-500">{t.operatorName} · {priceLabel(t)} · {t.capacityPerSlot} vagas/saída</p>
                  <div className="flex flex-wrap gap-3 mt-2 text-sm font-black text-ocean-700">
                    <button onClick={() => setForm({ tour: t })} className="flex items-center gap-1"><Pencil size={14} /> Editar</button>
                    <button onClick={() => setSlotsFor(t)} className="flex items-center gap-1"><Lock size={14} /> Saídas</button>
                    <button onClick={() => toggleStatus(t)} className="flex items-center gap-1">{t.status === 'published' ? <><EyeOff size={14} /> Despublicar</> : <><Eye size={14} /> Publicar</>}</button>
                    <button onClick={() => remove(t)} className="flex items-center gap-1 text-red-600"><Trash2 size={14} /> Excluir</button>
                  </div>
                </div>
              </div>))}</div>}
        </>
      )}

      {tab === 'bookings' && (
        <>
          <div className="flex gap-2 overflow-x-auto">
            {(['pending', 'confirmed', 'cancelled', 'all'] as const).map(f => <button key={f} onClick={() => setFilter(f)} aria-pressed={filter === f} className={`shrink-0 h-9 px-3.5 rounded-full text-[13px] font-bold border ${filter === f ? 'bg-ocean-600 text-white border-ocean-600' : 'bg-white text-ocean-900 border-slate-200'}`}>{f === 'all' ? 'Todas' : BLABEL[f] + 's'}</button>)}
          </div>
          {bookings === null ? <Loader2 className="animate-spin" /> : shown.length === 0 ? <EmptyState icon={<Ship size={28} />} title="Nenhuma reserva aqui" />
            : <div className="grid gap-3">{shown.map(b => {
              const t = tourOf(b.tourId);
              return (
                <div key={b.id} className="bg-white rounded-3xl border border-slate-100 p-4" data-testid="admin-booking-row">
                  <div className="flex items-start justify-between gap-2"><p className="font-black text-ocean-950">{b.tourTitle}</p><Badge tone={BTONE[b.status]}>{BLABEL[b.status]}</Badge></div>
                  <p className="text-sm text-slate-600 mt-1">{formatDateBR(b.date)} às {b.time} · {b.people} pessoa{b.people > 1 ? 's' : ''}</p>
                  <p className="text-sm text-slate-600">{b.customerName} · {b.customerPhone}</p>
                  {b.notes && <p className="text-xs text-slate-500 mt-1">Obs.: {b.notes}</p>}
                  <div className="flex flex-wrap gap-2 mt-3">
                    <a href={whatsappLink(b.customerPhone, `Olá, ${b.customerName.split(' ')[0]}! Sobre sua reserva do passeio "${b.tourTitle}" em ${formatDateBR(b.date)} às ${b.time}.`)} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 bg-emerald-600 text-white text-sm font-black rounded-2xl px-4 py-2"><MessageCircle size={15} /> Cliente</a>
                    {b.status === 'pending' && <button onClick={() => confirmB(b)} className="inline-flex items-center gap-1.5 bg-ocean-600 text-white text-sm font-black rounded-2xl px-4 py-2"><Check size={15} /> Confirmar</button>}
                    {b.status !== 'cancelled' && <button onClick={() => cancelB(b)} className="inline-flex items-center gap-1.5 border border-slate-200 text-red-600 text-sm font-black rounded-2xl px-4 py-2"><X size={15} /> Cancelar</button>}
                  </div>
                </div>);
            })}</div>}
        </>
      )}

      {form && <TourForm initial={form.tour} businesses={businesses} guidaWhatsapp={guidaWhatsapp} saving={saving} onSave={save} onClose={() => setForm(null)} />}
      {slotsFor && <SlotsPanel tour={slotsFor} onClose={() => setSlotsFor(null)} />}
    </div>
  );
};
