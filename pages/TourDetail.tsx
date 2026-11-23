import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, MapPin, Clock, Users, Check, X, MessageCircle, Loader2, Info, CalendarCheck } from 'lucide-react';
import { Tour, TourBooking, User } from '../types';
import { SEO } from '../components/SEO';
import { TourCalendar } from '../components/TourCalendar';
import { LoadingState, ErrorState, Field, inputClass, primaryButton, secondaryButton } from '../components/ui/States';
import { createBooking, getTourById, getTourSlots } from '../services/tourService';
import {
  BookingErrors, bookingWhatsappText, cleanPhone, dayAvailability, departureDates, formatDateBR, findPackage, priceLabel, totalLabel, validateBooking, whatsappLink,
} from '../services/tourRules';
import { REGION_MUNICIPALITIES } from '../services/regionGeo';

interface Props { tourId: string; currentUser: User | null; onNavigate: (page: string, params?: any) => void; }

export const TourDetail: React.FC<Props> = ({ tourId, currentUser, onNavigate }) => {
  const [tour, setTour] = useState<Tour | null | undefined>(undefined);
  const [slots, setSlots] = useState<Record<string, any>>({});
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [people, setPeople] = useState(2);
  const [packageId, setPackageId] = useState('');
  const [name, setName] = useState(currentUser?.name || '');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<BookingErrors>({});
  const [sending, setSending] = useState(false);
  const [fail, setFail] = useState('');
  const [done, setDone] = useState<TourBooking | null>(null);
  const [photo, setPhoto] = useState(0);
  const now = useMemo(() => new Date(), [tourId, done]);

  const load = async () => {
    const t = await getTourById(tourId);
    setTour(t);
    if (t) setSlots(await getTourSlots(t.id));
  };
  useEffect(() => { load(); }, [tourId]);

  // seleciona a primeira data com saída quando a tela abre
  useEffect(() => {
    if (!tour || date) return;
    const first = departureDates(tour, now, 120).find(d => dayAvailability(tour, d, slots, now).some(s => s.bookable));
    if (first) setDate(first);
  }, [tour, slots]);

  if (tour === undefined) return <LoadingState className="min-h-[60vh]" />;
  if (!tour || tour.status !== 'published') return (
    <div className="min-h-screen bg-slate-50 p-6"><ErrorState message="Passeio não encontrado." onRetry={() => onNavigate('tours')} /></div>
  );

  const views = date ? dayAvailability(tour, date, slots, now) : [];
  const chosen = views.find(v => v.time === time);
  const maxPeople = Math.max(tour.minPeople || 1, Math.min(tour.maxPeoplePerBooking, chosen ? chosen.left : tour.maxPeoplePerBooking));
  const photos = [tour.coverImage, ...(tour.gallery || [])].filter(Boolean);
  const city = REGION_MUNICIPALITIES.find(m => m.id === tour.cityId)?.name;

  const submit = async () => {
    setFail('');
    if (!currentUser) { onNavigate('login'); return; }
    const input = { date, time, people, customerName: name, customerPhone: phone, notes, packageId };
    const errs = validateBooking(tour, input, slots[`${tour.id}_${date}_${time.replace(':', '')}`], now);
    setErrors(errs);
    if (Object.keys(errs).length) return;
    setSending(true);
    try {
      const b = await createBooking(tour, input);
      setDone(b);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e: any) {
      setFail(e?.message?.includes('permission') ? 'Não foi possível reservar agora. Atualize a página e tente de novo.' : (e?.message || 'Não foi possível reservar.'));
      setSlots(await getTourSlots(tour.id));
    } finally { setSending(false); }
  };

  if (done) {
    const wa = whatsappLink(tour.operatorWhatsapp, bookingWhatsappText(done));
    return (
      <div className="min-h-screen bg-slate-50 pb-28" data-testid="tour-booking-done">
        <SEO title={`Reserva pedida — ${tour.title}`} noindex />
        <div className="max-w-lg mx-auto px-4 pt-10 text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4"><Check size={32} /></div>
          <h1 className="text-2xl font-black text-ocean-950">Pedido de reserva enviado</h1>
          <p className="text-slate-500 mt-2">As vagas ficam guardadas para você. A reserva só vale depois que a {tour.operatorName} confirmar pelo WhatsApp.</p>
          <div className="bg-white rounded-3xl border border-slate-100 p-5 mt-6 text-left space-y-1.5 text-sm">
            <p className="font-black text-ocean-950">{tour.title}</p>
            <p>{formatDateBR(done.date)} às {done.time}</p>
            <p>{done.people} pessoa{done.people > 1 ? 's' : ''} · {done.customerName}</p>
            {done.packageName && <p>Pacote: {done.packageName}</p>}
            {totalLabel(tour, done.people, done.packageId) && <p className="text-slate-500">Valor aproximado: {totalLabel(tour, done.people, done.packageId)}. A operadora confirma o valor e o pagamento pelo WhatsApp.</p>}
          </div>
          <a href={wa} target="_blank" rel="noopener noreferrer" className={`${primaryButton} w-full mt-5 !bg-emerald-600 hover:!bg-emerald-700`}><MessageCircle size={18} /> Falar com {tour.operatorName} no WhatsApp</a>
          <button onClick={() => onNavigate('my-bookings')} className={`${secondaryButton} w-full mt-3`}>Ver minhas reservas</button>
          <button onClick={() => onNavigate('tours')} className="mt-4 text-sm font-bold text-ocean-700">Ver outros passeios</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pb-32" data-testid="tour-detail-page">
      <SEO title={tour.title} description={tour.shortDescription} image={tour.coverImage} />
      <div className="relative h-64 md:h-80 bg-slate-200">
        {photos[photo] && <img src={photos[photo]} alt={tour.title} referrerPolicy="no-referrer" className="w-full h-full object-cover" />}
        <button onClick={() => onNavigate('tours')} aria-label="Voltar" className="absolute top-4 left-4 w-11 h-11 rounded-full bg-white/90 shadow flex items-center justify-center text-ocean-900" style={{ top: 'calc(1rem + env(safe-area-inset-top))' }}><ArrowLeft size={20} /></button>
        {photos.length > 1 && (
          <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
            {photos.map((_, i) => <button key={i} onClick={() => setPhoto(i)} aria-label={`Foto ${i + 1}`} className={`h-2 rounded-full transition-all ${i === photo ? 'w-6 bg-white' : 'w-2 bg-white/60'}`} />)}
          </div>
        )}
      </div>
      <div className="max-w-3xl mx-auto px-4 -mt-6 relative">
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-5">
          <h1 className="text-2xl font-black text-ocean-950 leading-tight">{tour.title}</h1>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500 mt-2">
            {city && <span className="flex items-center gap-1"><MapPin size={14} /> {city}</span>}
            {tour.durationText && <span className="flex items-center gap-1"><Clock size={14} /> {tour.durationText}</span>}
            <span className="flex items-center gap-1"><Users size={14} /> {tour.capacityPerSlot} vagas por saída</span>
          </div>
          <p className="text-xl font-black text-ocean-700 mt-3">{priceLabel(tour)}</p>
          <p className="text-[11px] text-slate-400">Operado por {tour.operatorBusinessId && tour.operatorBusinessId !== 'custom' ? <button type="button" onClick={() => onNavigate('business-detail', { businessId: tour.operatorBusinessId })} className="font-bold text-ocean-700 underline" data-testid="tour-operator-link">{tour.operatorName}</button> : tour.operatorName}. Pagamento combinado direto com a operadora.</p>
        </div>

        <section className="mt-5">
          <h2 className="font-black text-ocean-950 mb-2">Sobre o passeio</h2>
          <p className="text-slate-600 text-[15px] leading-relaxed whitespace-pre-line">{tour.description}</p>
          {tour.meetingPoint && <p className="mt-3 text-sm text-slate-600"><b className="text-ocean-950">Ponto de encontro:</b> {tour.meetingPoint}</p>}
          {tour.requirements && <p className="mt-2 text-sm text-slate-600 flex gap-2"><Info size={16} className="shrink-0 mt-0.5 text-ocean-600" /> {tour.requirements}</p>}
          {(tour.includes.length > 0 || tour.notIncluded.length > 0) && (
            <div className="grid sm:grid-cols-2 gap-4 mt-4">
              {tour.includes.length > 0 && <ul className="space-y-1.5 text-sm">{tour.includes.map(i => <li key={i} className="flex gap-2 text-slate-700"><Check size={16} className="text-emerald-600 shrink-0 mt-0.5" />{i}</li>)}</ul>}
              {tour.notIncluded.length > 0 && <ul className="space-y-1.5 text-sm">{tour.notIncluded.map(i => <li key={i} className="flex gap-2 text-slate-500"><X size={16} className="text-slate-400 shrink-0 mt-0.5" />{i}</li>)}</ul>}
            </div>
          )}
        </section>

        <section className="mt-7" id="reservar">
          <h2 className="font-black text-ocean-950 mb-1 flex items-center gap-2"><CalendarCheck size={18} /> Escolha a data</h2>
          <p className="text-xs text-slate-400 mb-3">Reservas com pelo menos {tour.minNoticeHours} h de antecedência.</p>
          <TourCalendar tour={tour} slots={slots} selected={date} onSelect={d => { setDate(d); setTime(''); setErrors({}); }} now={now} />

          {date && (
            <div className="mt-4">
              <p className="text-sm font-black text-ocean-950 mb-2">{formatDateBR(date)} — horário</p>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {views.map(v => (
                  <button key={v.time} disabled={!v.bookable} onClick={() => { setTime(v.time); setPeople(p => Math.min(Math.max(p, tour.minPeople || 1), Math.min(tour.maxPeoplePerBooking, v.left))); }} aria-pressed={time === v.time}
                    className={`rounded-2xl border px-3 py-3 text-left transition-colors ${time === v.time ? 'bg-ocean-600 text-white border-ocean-600' : v.bookable ? 'bg-white border-slate-200 hover:border-ocean-300' : 'bg-slate-100 border-slate-100 text-slate-400'}`}>
                    <span className="block font-black text-lg">{v.time}</span>
                    <span className="block text-[11px] font-bold">
                      {v.state === 'full' ? 'Lotado' : v.state === 'closed' ? 'Fechado' : v.state === 'late' ? 'Fora do prazo' : v.state === 'past' ? 'Já saiu' : `${v.left} vaga${v.left === 1 ? '' : 's'}`}
                    </span>
                  </button>
                ))}
              </div>
              {errors.slot && <p className="text-xs font-bold text-red-600 mt-2" role="alert">{errors.slot}</p>}
            </div>
          )}

          {time && (
            <div className="mt-5 bg-white rounded-3xl border border-slate-100 p-5 space-y-4" data-testid="tour-booking-form">
              {(tour.packages || []).length > 0 && (
                <Field label="Escolha o pacote" htmlFor="tb-package" error={errors.packageId} required>
                  <div id="tb-package" role="radiogroup" aria-label="Pacote" className="space-y-2" data-testid="tour-packages">
                    {tour.packages!.map(pk => (
                      <button key={pk.id} type="button" role="radio" aria-checked={packageId === pk.id} onClick={() => setPackageId(pk.id)}
                        className={`w-full text-left rounded-2xl border px-4 py-3 transition-colors ${packageId === pk.id ? 'border-ocean-600 bg-ocean-50 ring-2 ring-ocean-200' : 'border-slate-200 bg-white hover:border-ocean-300'}`}>
                        <span className="flex items-baseline justify-between gap-2"><span className="font-black text-ocean-950">{pk.name}</span><span className="font-black text-ocean-700">R$ {pk.price.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} <span className="text-[11px] font-bold text-slate-400">por pessoa</span></span></span>
                        {pk.includes.length > 0 && <span className="block text-xs text-slate-500 mt-1">{pk.includes.join(' · ')}</span>}
                      </button>
                    ))}
                  </div>
                </Field>
              )}
              <Field label="Quantas pessoas" htmlFor="tb-people" error={errors.people}>
                <div className="flex items-center gap-3">
                  <button type="button" onClick={() => setPeople(p => Math.max(tour.minPeople || 1, p - 1))} aria-label="Menos uma pessoa" className="w-12 h-12 rounded-2xl border border-slate-200 text-xl font-black">−</button>
                  <span id="tb-people" className="text-2xl font-black w-10 text-center">{people}</span>
                  <button type="button" onClick={() => setPeople(p => Math.min(maxPeople, p + 1))} aria-label="Mais uma pessoa" className="w-12 h-12 rounded-2xl border border-slate-200 text-xl font-black">+</button>
                  {totalLabel(tour, people, packageId) && <span className="ml-auto text-right text-sm font-black text-ocean-700" title="Valor aproximado; a operadora confirma pelo WhatsApp">≈ {totalLabel(tour, people, packageId)}<span className="block text-[10px] font-medium text-slate-400">valor aproximado</span></span>}
                </div>
              </Field>
              <Field label="Seu nome" htmlFor="tb-name" error={errors.customerName} required>
                <input id="tb-name" className={inputClass(!!errors.customerName)} value={name} onChange={e => setName(e.target.value)} autoComplete="name" />
              </Field>
              <Field label="WhatsApp com DDD" htmlFor="tb-phone" error={errors.customerPhone} required>
                <input id="tb-phone" className={inputClass(!!errors.customerPhone)} value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="(22) 99999-9999" />
              </Field>
              <Field label="Observações" htmlFor="tb-notes" hint="Crianças, restrição de mobilidade, hotel de onde saem…" error={errors.notes}>
                <textarea id="tb-notes" className={inputClass(!!errors.notes)} rows={2} maxLength={500} value={notes} onChange={e => setNotes(e.target.value)} />
              </Field>
              {fail && <p className="text-sm font-bold text-red-600" role="alert">{fail}</p>}
              <button onClick={submit} disabled={sending} className={`${primaryButton} w-full`} data-testid="tour-submit">
                {sending ? <Loader2 className="animate-spin" size={18} /> : null}
                {currentUser ? 'Pedir reserva' : 'Entrar para reservar'}
              </button>
              <p className="text-[11px] text-slate-400 text-center">Você não paga agora. A operadora confirma a reserva e combina o pagamento com você pelo WhatsApp.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
};
