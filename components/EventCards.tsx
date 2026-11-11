import React, { useMemo } from 'react';
import { CalendarDays, MapPin, Music, Utensils, Trophy, Landmark, ShoppingBasket, PartyPopper, Church, Waves, ArrowRight, Clock, Ticket, Sparkles } from 'lucide-react';
import { AppEvent, EventCategory } from '../types';
import { HScroller } from './DiscoverUI';
import {
  categoryLabel, cityLabel, dayParts, diffDays, eventPhase, formatEventDates, formatEventTime, orderEvents, whenLabel,
} from '../services/eventRules';
import { usePublishedEvents } from '../services/eventService';

/** Cada categoria tem cor e ícone próprios: o cartão funciona sem foto (nunca usamos imagem inventada). */
const CAT: Record<EventCategory, { grad: string; Icon: React.ComponentType<any> }> = {
  musica: { grad: 'from-violet-600 to-fuchsia-500', Icon: Music },
  gastronomia: { grad: 'from-orange-500 to-rose-500', Icon: Utensils },
  esporte: { grad: 'from-emerald-600 to-teal-500', Icon: Trophy },
  cultura: { grad: 'from-indigo-600 to-sky-500', Icon: Landmark },
  feira: { grad: 'from-amber-500 to-orange-500', Icon: ShoppingBasket },
  festa: { grad: 'from-pink-600 to-rose-500', Icon: PartyPopper },
  religioso: { grad: 'from-slate-600 to-slate-500', Icon: Church },
  turismo: { grad: 'from-sky-600 to-cyan-500', Icon: Waves },
  outros: { grad: 'from-ocean-600 to-ocean-500', Icon: Sparkles },
};

export const catStyle = (c: EventCategory) => CAT[c] || CAT.outros;

/** Bloco de data (dia grande + mês). */
export const DateBadge: React.FC<{ event: AppEvent; className?: string }> = ({ event, className = '' }) => {
  const p = dayParts(event.startDate);
  const multi = !!event.endDate && event.endDate > event.startDate;
  return (
    <div className={`flex flex-col items-center justify-center rounded-2xl bg-white text-ocean-950 shadow-md w-14 h-16 shrink-0 ${className}`} aria-hidden>
      <span className="text-2xl font-black leading-none">{p.day}</span>
      <span className="text-[10px] font-black tracking-wider text-ocean-600 mt-0.5">{p.month}</span>
      {multi && <span className="text-[8px] font-bold text-slate-400 leading-none mt-0.5">+{diffDays(event.startDate, event.endDate!)}d</span>}
    </div>
  );
};

const WhenChip: React.FC<{ event: AppEvent }> = ({ event }) => {
  const w = whenLabel(event);
  if (!w) return null;
  const hot = eventPhase(event) === 'ongoing';
  return <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full ${hot ? 'bg-red-500 text-white' : 'bg-white/90 text-ocean-950'}`}>{w}</span>;
};

const Cover: React.FC<{ event: AppEvent; className?: string; children?: React.ReactNode }> = ({ event, className = '', children }) => {
  const { grad, Icon } = catStyle(event.category);
  return (
    <div className={`relative overflow-hidden bg-gradient-to-br ${grad} ${className}`}>
      {event.coverImage
        ? <img src={event.coverImage} alt="" loading="lazy" referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover" />
        : <>
            <Icon size={120} className="absolute -right-4 -bottom-6 text-white/15" aria-hidden />
            <div className="absolute -left-10 -top-10 w-36 h-36 rounded-full bg-white/10" />
          </>}
      {children}
    </div>
  );
};

/** Cartão vertical (carrosséis). */
export const EventCard: React.FC<{ event: AppEvent; onOpen: (e: AppEvent) => void; showCity?: boolean }> = ({ event, onOpen, showCity = true }) => {
  const time = formatEventTime(event);
  return (
    <button onClick={() => onOpen(event)} aria-label={`Evento: ${event.title}`} data-testid="event-card"
      className="text-left bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden active:scale-[0.98] transition-transform shrink-0 w-64 flex flex-col">
      <Cover event={event} className="h-32">
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
        <DateBadge event={event} className="absolute left-3 top-3" />
        <div className="absolute right-3 top-3"><WhenChip event={event} /></div>
      </Cover>
      <div className="p-3.5 flex flex-col gap-1.5 flex-1">
        <span className="text-[10px] font-black uppercase tracking-wider text-ocean-600">{categoryLabel(event.category)}</span>
        <h3 className="font-black text-ocean-950 leading-snug line-clamp-2">{event.title}</h3>
        <div className="mt-auto pt-1 space-y-0.5 text-[12px] text-slate-500 font-semibold">
          <p className="flex items-center gap-1.5"><CalendarDays size={12} className="shrink-0" />{formatEventDates(event)}{time && <span className="text-slate-400"> · {time}</span>}</p>
          {showCity && <p className="flex items-center gap-1.5 truncate"><MapPin size={12} className="shrink-0" />{event.locationName ? `${event.locationName} · ` : ''}{cityLabel(event.cityId)}</p>}
        </div>
      </div>
    </button>
  );
};

/** Linha compacta (agenda completa). */
export const EventRow: React.FC<{ event: AppEvent; onOpen: (e: AppEvent) => void }> = ({ event, onOpen }) => {
  const { grad, Icon } = catStyle(event.category);
  const time = formatEventTime(event);
  const w = whenLabel(event);
  return (
    <button onClick={() => onOpen(event)} aria-label={`Evento: ${event.title}`} data-testid="event-row"
      className="w-full text-left bg-white rounded-2xl border border-slate-100 p-3 flex items-center gap-3 active:scale-[0.99] transition-transform">
      <div className={`w-14 h-16 rounded-2xl bg-gradient-to-br ${grad} text-white flex flex-col items-center justify-center shrink-0`} aria-hidden>
        <span className="text-xl font-black leading-none">{dayParts(event.startDate).day}</span>
        <span className="text-[10px] font-black tracking-wider opacity-90">{dayParts(event.startDate).month}</span>
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-ocean-600">
          <Icon size={11} />{categoryLabel(event.category)}
          {w && <span className={`ml-auto normal-case tracking-normal text-[11px] ${eventPhase(event) === 'ongoing' ? 'text-red-500' : 'text-slate-400'}`}>{w}</span>}
        </div>
        <h3 className="font-black text-ocean-950 leading-snug truncate">{event.title}</h3>
        <p className="text-[12px] text-slate-500 font-semibold truncate">
          {formatEventDates(event)}{time ? ` · ${time}` : ''} · {event.locationName ? `${event.locationName}, ` : ''}{cityLabel(event.cityId)}
        </p>
      </div>
      <ArrowRight size={16} className="text-slate-300 shrink-0" aria-hidden />
    </button>
  );
};

/** Card grande do próximo evento, com contagem. */
export const EventHero: React.FC<{ event: AppEvent; onOpen: (e: AppEvent) => void }> = ({ event, onOpen }) => {
  const time = formatEventTime(event);
  const { Icon } = catStyle(event.category);
  return (
    <button onClick={() => onOpen(event)} aria-label={`Evento em destaque: ${event.title}`} data-testid="event-hero"
      className="relative w-full text-left rounded-3xl overflow-hidden shadow-md active:scale-[0.99] transition-transform block">
      <Cover event={event} className="min-h-[210px] md:min-h-[260px]">
        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-black/5" />
        <div className="relative p-4 md:p-6 flex flex-col justify-between min-h-[210px] md:min-h-[260px]">
          <div className="flex items-start justify-between gap-3">
            <DateBadge event={event} />
            <div className="flex flex-col items-end gap-1.5">
              <WhenChip event={event} />
              {event.isFeatured && <span className="text-[10px] font-black uppercase tracking-wider px-2 py-1 rounded-full bg-amber-400 text-amber-950">Destaque</span>}
            </div>
          </div>
          <div className="text-white">
            <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-white/85"><Icon size={12} />{categoryLabel(event.category)}</span>
            <h3 className="text-2xl md:text-3xl font-black leading-tight mt-1 drop-shadow">{event.title}</h3>
            <p className="text-[13px] font-semibold text-white/90 mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-0.5">
              <span className="flex items-center gap-1"><CalendarDays size={13} />{formatEventDates(event)}</span>
              {time && <span className="flex items-center gap-1"><Clock size={13} />{time}</span>}
              <span className="flex items-center gap-1"><MapPin size={13} />{event.locationName ? `${event.locationName} · ` : ''}{cityLabel(event.cityId)}</span>
              {event.priceText && <span className="flex items-center gap-1"><Ticket size={13} />{event.priceText}</span>}
            </p>
          </div>
        </div>
      </Cover>
    </button>
  );
};

const SectionHead: React.FC<{ title: string; subtitle?: string; onAction: () => void }> = ({ title, subtitle, onAction }) => (
  <div className="px-4 mb-3 flex items-end justify-between gap-3">
    <div>
      <h2 className="text-xl font-black text-ocean-950 tracking-tight flex items-center gap-2"><CalendarDays size={20} className="text-ocean-600" aria-hidden />{title}</h2>
      {subtitle && <p className="text-xs text-slate-500">{subtitle}</p>}
    </div>
    <button onClick={onAction} data-testid="events-see-all" className="text-xs font-black text-ocean-600 flex items-center gap-1 shrink-0">Ver agenda <ArrowRight size={13} /></button>
  </div>
);

/**
 * Prateleira da agenda para a Home e o Feed: o próximo evento em destaque + carrossel.
 * A cidade só ordena (a da pessoa primeiro); todos os eventos da região continuam à vista.
 */
export const EventsShelf: React.FC<{ muniId: string | null; muniName?: string; onNavigate: (page: string, params?: any) => void; max?: number }> = ({ muniId, muniName, onNavigate, max = 8 }) => {
  const { events, loading } = usePublishedEvents();
  const list = useMemo(() => orderEvents(events, muniId).slice(0, max), [events, muniId, max]);
  if (loading && list.length === 0) {
    return <div className="px-4"><div className="h-[210px] rounded-3xl bg-white border border-slate-100 animate-pulse" /></div>;
  }
  if (list.length === 0) return null;
  const open = (e: AppEvent) => onNavigate('event-detail', { eventId: e.id });
  const [hero, ...rest] = list;
  return (
    <section aria-label="Agenda de eventos" data-testid="events-shelf">
      <SectionHead
        title={muniName ? `Acontecendo em ${muniName}` : 'Agenda da Região dos Lagos'}
        subtitle={muniName ? 'Eventos da sua cidade primeiro; os da região logo depois' : 'Shows, festivais, feiras e esportes'}
        onAction={() => onNavigate('events')} />
      <div className="px-4 mb-3"><EventHero event={hero} onOpen={open} /></div>
      {rest.length > 0 && <HScroller label="Próximos eventos" gap="gap-3">{rest.map(e => <EventCard key={e.id} event={e} onOpen={open} />)}</HScroller>}
    </section>
  );
};
