import React, { useEffect, useState } from 'react';
import { CalendarDays, CalendarPlus, Clock, ExternalLink, Info, MapPin, Share2, Store, Ticket, Link2, AlertTriangle } from 'lucide-react';
import { AppEvent, User } from '../types';
import { getEventById } from '../services/eventService';
import { buildICS, categoryLabel, cityLabel, eventEnd, eventPhase, formatEventDates, formatEventTime, whenLabel } from '../services/eventRules';
import { catStyle, DateBadge } from '../components/EventCards';
import { PageHeader, LoadingState, EmptyState } from '../components/ui/States';
import { useNotification } from '../components/NotificationSystem';
import { openExternal } from '../services/native';
import { SEO } from '../components/SEO';

interface Props { eventId: string; currentUser: User | null; onNavigate: (page: string, params?: any) => void; }

const STATUS_NOTE: Record<string, string> = {
  pending: 'Este evento está aguardando aprovação e ainda não aparece para o público.',
  rejected: 'Este evento foi recusado e não aparece para o público.',
  cancelled: 'Este evento foi cancelado.',
};

const Row: React.FC<{ icon: React.ReactNode; label: string; children: React.ReactNode }> = ({ icon, label, children }) => (
  <div className="flex items-start gap-3">
    <div className="w-9 h-9 rounded-xl bg-ocean-50 text-ocean-600 flex items-center justify-center shrink-0">{icon}</div>
    <div className="min-w-0"><p className="text-[10px] font-black uppercase tracking-wider text-slate-400">{label}</p><div className="text-[15px] font-bold text-ocean-950">{children}</div></div>
  </div>
);

export const EventDetail: React.FC<Props> = ({ eventId, currentUser, onNavigate }) => {
  const { notify } = useNotification();
  const [ev, setEv] = useState<AppEvent | null | undefined>(undefined);

  useEffect(() => {
    let alive = true;
    setEv(undefined);
    getEventById(eventId).then(e => { if (alive) setEv(e); });
    return () => { alive = false; };
  }, [eventId]);

  const back = () => onNavigate('events');
  if (ev === undefined) return <div className="min-h-screen bg-slate-50"><PageHeader title="Evento" onBack={back} /><LoadingState /></div>;
  if (ev === null) {
    return (
      <div className="min-h-screen bg-slate-50 pb-28">
        <PageHeader title="Evento" onBack={back} />
        <div className="max-w-2xl mx-auto p-4"><EmptyState title="Evento não encontrado" message="Ele pode ter sido removido ou ainda não ter sido publicado."
          action={<button onClick={back} className="text-sm font-black text-ocean-600">Ver a agenda</button>} /></div>
      </div>
    );
  }

  const { grad, Icon } = catStyle(ev.category);
  const phase = eventPhase(ev);
  const when = whenLabel(ev);
  const time = formatEventTime(ev);
  const where = [ev.locationName, ev.address].filter(Boolean).join(' · ');
  const mapsQuery = [ev.locationName, ev.address, cityLabel(ev.cityId), 'RJ'].filter(Boolean).join(', ');
  const note = ev.status !== 'published' ? STATUS_NOTE[ev.status] : '';

  const share = async () => {
    const url = `${window.location.origin}/eventos/${encodeURIComponent(ev.id)}`;
    const text = `${ev.title}, ${formatEventDates(ev)} em ${cityLabel(ev.cityId)}`;
    try {
      if (navigator.share) { await navigator.share({ title: ev.title, text, url }); return; }
      await navigator.clipboard.writeText(`${text}\n${url}`);
      notify('success', 'Link copiado.');
    } catch { /* pessoa cancelou */ }
  };

  const addToCalendar = () => {
    try {
      const blob = new Blob([buildICS(ev)], { type: 'text/calendar;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `${ev.title.replace(/[^\w-]+/g, '-').toLowerCase()}.ics`;
      document.body.appendChild(a); a.click(); a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch { notify('error', 'Não foi possível gerar o arquivo da agenda.'); }
  };

  const jsonLd = ev.status === 'published' ? {
    '@context': 'https://schema.org', '@type': 'Event', name: ev.title,
    startDate: ev.startTime ? `${ev.startDate}T${ev.startTime}:00-03:00` : ev.startDate,
    endDate: ev.endTime ? `${eventEnd(ev)}T${ev.endTime}:00-03:00` : eventEnd(ev),
    eventStatus: 'https://schema.org/EventScheduled', eventAttendanceMode: 'https://schema.org/OfflineEventAttendanceMode',
    location: { '@type': 'Place', name: ev.locationName || cityLabel(ev.cityId), address: { '@type': 'PostalAddress', streetAddress: ev.address || undefined, addressLocality: cityLabel(ev.cityId), addressRegion: 'RJ', addressCountry: 'BR' } },
    ...(ev.description ? { description: ev.description } : {}), ...(ev.coverImage && !ev.coverImage.startsWith('data:') ? { image: ev.coverImage } : {}),
    ...(ev.isFree ? { isAccessibleForFree: true } : {}),
  } : undefined;

  return (
    <div className="min-h-screen bg-slate-50 pb-28" data-testid="event-detail">
      <SEO title={`${ev.title} em ${cityLabel(ev.cityId)}`} description={ev.description || `${ev.title}, ${formatEventDates(ev)} em ${cityLabel(ev.cityId)}.`}
        image={ev.coverImage && !ev.coverImage.startsWith('data:') ? ev.coverImage : undefined} jsonLd={jsonLd} noindex={ev.status !== 'published'} />
      <PageHeader title="Evento" subtitle={cityLabel(ev.cityId)} onBack={back} action={<button onClick={share} aria-label="Compartilhar" className="w-10 h-10 rounded-full flex items-center justify-center text-ocean-950 hover:bg-slate-100"><Share2 size={20} /></button>} />

      <div className="max-w-2xl mx-auto">
        <div className={`relative overflow-hidden bg-gradient-to-br ${grad} h-56 md:h-72 md:rounded-b-3xl`}>
          {ev.coverImage ? <img src={ev.coverImage} alt="" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover" />
            : <><Icon size={160} className="absolute -right-6 -bottom-8 text-white/15" aria-hidden /><div className="absolute -left-12 -top-12 w-44 h-44 rounded-full bg-white/10" /></>}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
          <DateBadge event={ev} className="absolute left-4 bottom-4" />
          {when && <span className={`absolute right-4 bottom-4 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${phase === 'ongoing' ? 'bg-red-500 text-white' : 'bg-white/90 text-ocean-950'}`}>{when}</span>}
        </div>

        <div className="px-4 pt-5 space-y-5">
          {note && (
            <div role="status" className="rounded-2xl bg-amber-50 border border-amber-200 text-amber-800 text-sm font-bold p-3.5 flex gap-2.5"><AlertTriangle size={18} className="shrink-0 mt-0.5" />
              <span>{note}{ev.status === 'rejected' && ev.rejectionReason ? ` Motivo: ${ev.rejectionReason}` : ''}</span></div>
          )}
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-ocean-600">{categoryLabel(ev.category)}</span>
            <h1 className="text-2xl md:text-3xl font-black text-ocean-950 leading-tight mt-1" data-testid="event-title">{ev.title}</h1>
          </div>

          <div className="bg-white rounded-3xl border border-slate-100 p-4 space-y-4">
            <Row icon={<CalendarDays size={18} />} label="Quando">{formatEventDates(ev)}{ev.scheduleNote ? <span className="font-semibold text-slate-500"> · {ev.scheduleNote}</span> : null}</Row>
            {time && <Row icon={<Clock size={18} />} label="Horário">{time}</Row>}
            <Row icon={<MapPin size={18} />} label="Onde">
              {where || cityLabel(ev.cityId)}{where ? <span className="font-semibold text-slate-500"> · {cityLabel(ev.cityId)}</span> : null}
              <button onClick={() => openExternal(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`)} className="block text-xs font-black text-ocean-600 mt-0.5">Abrir no mapa</button>
            </Row>
            {(ev.priceText || ev.isFree) && <Row icon={<Ticket size={18} />} label="Entrada">{ev.isFree ? `Gratuito${ev.priceText ? ` · ${ev.priceText}` : ''}` : ev.priceText}</Row>}
            {ev.businessName && (
              <Row icon={<Store size={18} />} label="Organização">
                {ev.businessId ? <button onClick={() => onNavigate('business-detail', { businessId: ev.businessId })} className="text-left text-ocean-600 underline decoration-ocean-200">{ev.businessName}</button> : ev.businessName}
              </Row>
            )}
          </div>

          {ev.detailsTentative && (
            <div className="rounded-2xl bg-sky-50 border border-sky-100 text-sky-800 text-[13px] font-semibold p-3.5 flex gap-2.5"><Info size={17} className="shrink-0 mt-0.5" />
              <span>Local e horário ainda não foram divulgados pela organização, e as datas podem mudar. Confira em canais oficiais antes de ir.</span></div>
          )}

          {ev.description && <p className="text-[15px] leading-relaxed text-slate-700 whitespace-pre-line" data-testid="event-description">{ev.description}</p>}

          <div className="grid gap-2.5">
            {phase !== 'past' && ev.status === 'published' && (
              <button onClick={addToCalendar} data-testid="add-to-calendar" className="h-12 rounded-2xl bg-ocean-600 text-white font-black flex items-center justify-center gap-2 active:scale-[0.98]"><CalendarPlus size={18} /> Adicionar à minha agenda</button>
            )}
            {ev.ticketUrl && <button onClick={() => openExternal(ev.ticketUrl!)} className="h-12 rounded-2xl bg-amber-400 text-amber-950 font-black flex items-center justify-center gap-2 active:scale-[0.98]"><Ticket size={18} /> Ingressos</button>}
            {ev.infoUrl && <button onClick={() => openExternal(ev.infoUrl!)} className="h-12 rounded-2xl bg-white border border-slate-200 text-ocean-950 font-black flex items-center justify-center gap-2 active:scale-[0.98]"><ExternalLink size={18} /> Mais informações</button>}
            <button onClick={share} className="h-12 rounded-2xl bg-white border border-slate-200 text-ocean-950 font-black flex items-center justify-center gap-2 active:scale-[0.98]"><Share2 size={18} /> Compartilhar</button>
          </div>

          {ev.sourceLabel && (
            <p className="text-[12px] text-slate-400 font-semibold flex items-start gap-1.5"><Link2 size={13} className="shrink-0 mt-0.5" />
              <span>Fonte: {ev.sourceUrl ? <button onClick={() => openExternal(ev.sourceUrl!)} className="underline">{ev.sourceLabel}</button> : ev.sourceLabel}. O calendário está sujeito a alterações.</span></p>
          )}
        </div>
      </div>
    </div>
  );
};
