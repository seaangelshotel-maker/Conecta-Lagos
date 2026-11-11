import React, { useMemo, useState } from 'react';
import { CalendarDays, Search, X, ChevronDown, Megaphone } from 'lucide-react';
import { AppEvent, User, UserRole } from '../types';
import { SEO } from '../components/SEO';
import { RegionChip } from '../components/RegionChip';
import { EventRow, EventHero } from '../components/EventCards';
import { EmptyState, SkeletonCards } from '../components/ui/States';
import { LegalFooter } from '../components/LegalFooter';
import { useRegionLocation } from '../hooks/useRegionLocation';
import { usePublishedEvents } from '../services/eventService';
import {
  EVENT_CATEGORIES, PERIODS, EventPeriod, cityLabel, eventPhase, filterEvents, groupByMonth, orderEvents, sortByDate, todayISO,
} from '../services/eventRules';
import { REGION_MUNICIPALITIES } from '../services/regionGeo';

interface Props { currentUser: User | null; onNavigate: (page: string, params?: any) => void; }

const Chip: React.FC<{ on: boolean; onClick: () => void; children: React.ReactNode; testId?: string }> = ({ on, onClick, children, testId }) => (
  <button onClick={onClick} aria-pressed={on} data-testid={testId}
    className={`shrink-0 h-9 px-3.5 rounded-full text-[13px] font-bold border transition-colors ${on ? 'bg-ocean-600 text-white border-ocean-600' : 'bg-white text-ocean-900 border-slate-200'}`}>
    {children}
  </button>
);

export const Events: React.FC<Props> = ({ currentUser, onNavigate }) => {
  const { events, loading } = usePublishedEvents();
  const loc = useRegionLocation();
  const muniId = loc.municipality?.id ?? null;
  const [q, setQ] = useState('');
  const [period, setPeriod] = useState<EventPeriod>('all');
  const [category, setCategory] = useState('');
  const [cityId, setCityId] = useState('');
  const [showPast, setShowPast] = useState(false);
  const today = todayISO();

  const open = (e: AppEvent) => onNavigate('event-detail', { eventId: e.id });
  const upcoming = useMemo(() => events.filter(e => eventPhase(e, today) !== 'past'), [events, today]);
  const past = useMemo(() => events.filter(e => eventPhase(e, today) === 'past'), [events, today]);

  const filters = { q, period, category, cityId };
  const filtered = useMemo(() => sortByDate(filterEvents(upcoming, filters, today)), [upcoming, q, period, category, cityId, today]);
  const filteredPast = useMemo(() => sortByDate(filterEvents(past, { q, category, cityId }, today)).reverse(), [past, q, category, cityId, today]);

  const hero = useMemo(() => (cityId || category || q || period !== 'all' ? null : orderEvents(upcoming, muniId, today)[0]), [upcoming, muniId, cityId, category, q, period, today]);

  // Cidades que têm evento, com contagem (as outras nem aparecem como opção).
  const cities = useMemo(() => REGION_MUNICIPALITIES
    .map(m => ({ id: m.id, name: m.name, n: upcoming.filter(e => e.cityId === m.id).length }))
    .filter(c => c.n > 0), [upcoming]);

  // Com cidade conhecida e sem filtro de cidade: a dela primeiro, "outras cidades" logo abaixo — nada some.
  const inMyCity = !cityId && muniId ? filtered.filter(e => e.cityId === muniId) : [];
  const blocks: { title?: string; list: AppEvent[] }[] = !cityId && muniId && inMyCity.length > 0
    ? [{ title: `Em ${cityLabel(muniId)}`, list: inMyCity }, { title: 'Outras cidades da região', list: filtered.filter(e => e.cityId !== muniId) }]
    : [{ list: filtered }];

  const isPartner = currentUser && (currentUser.role === UserRole.COMPANY || currentUser.role === UserRole.SUPER_ADMIN);
  const goPartner = () => (isPartner ? onNavigate('admin-dashboard', { view: 'events' }) : currentUser ? onNavigate('pricing-plans') : onNavigate('login'));
  const hasFilter = !!(q || category || cityId || period !== 'all');

  return (
    <div className="min-h-screen bg-slate-50 pb-28" data-testid="events-page">
      <SEO title="Agenda de eventos da Região dos Lagos" description="Shows, festivais, feiras, esportes e eventos em Arraial do Cabo, Cabo Frio, Búzios e toda a Região dos Lagos." />

      <header className="bg-gradient-to-br from-ocean-600 to-ocean-950 text-white pt-8 pb-6">
        <div className="max-w-5xl mx-auto px-4">
          <RegionChip loc={loc} compact />
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200 flex items-center gap-1.5 mt-4"><CalendarDays size={13} /> Agenda</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1">O que está rolando na região</h1>
          <p className="text-sm text-white/80 mt-1 max-w-xl">Festivais, shows, feiras e esportes. Sua cidade aparece primeiro, mas você vê tudo.</p>
          <form role="search" onSubmit={e => e.preventDefault()} className="mt-5 flex items-center bg-white rounded-2xl shadow-lg pl-4 pr-1.5 h-14 gap-2">
            <Search size={18} className="text-slate-400 shrink-0" aria-hidden />
            <input value={q} onChange={e => setQ(e.target.value)} aria-label="Buscar eventos" placeholder="Buscar eventos" data-testid="events-search"
              className="flex-1 min-w-0 bg-transparent border-0 shadow-none outline-none ring-0 focus:ring-0 p-0 text-slate-800 text-[15px] placeholder:text-slate-400" />
            {q && <button type="button" onClick={() => setQ('')} aria-label="Limpar busca" className="w-8 h-8 flex items-center justify-center text-slate-400"><X size={16} /></button>}
          </form>
        </div>
      </header>

      <div className="max-w-5xl mx-auto">
        <div className="pt-4 space-y-2.5">
          <div role="group" aria-label="Período" className="flex gap-2 overflow-x-auto no-scrollbar px-4">
            {PERIODS.map(p => <Chip key={p.id} on={period === p.id} onClick={() => setPeriod(p.id)} testId={`period-${p.id}`}>{p.label}</Chip>)}
          </div>
          <div role="group" aria-label="Categoria" className="flex gap-2 overflow-x-auto no-scrollbar px-4">
            <Chip on={!category} onClick={() => setCategory('')}>Todas as categorias</Chip>
            {EVENT_CATEGORIES.filter(c => upcoming.some(e => e.category === c.id)).map(c =>
              <Chip key={c.id} on={category === c.id} onClick={() => setCategory(category === c.id ? '' : c.id)} testId={`cat-${c.id}`}>{c.label}</Chip>)}
          </div>
          {cities.length > 1 && (
            <div role="group" aria-label="Cidade" className="flex gap-2 overflow-x-auto no-scrollbar px-4">
              <Chip on={!cityId} onClick={() => setCityId('')} testId="city-all">Toda a região</Chip>
              {cities.map(c => <Chip key={c.id} on={cityId === c.id} onClick={() => setCityId(cityId === c.id ? '' : c.id)} testId={`city-${c.id}`}>{c.name} ({c.n})</Chip>)}
            </div>
          )}
        </div>

        <div className="px-4 mt-5 space-y-6">
          {loading && events.length === 0 && <SkeletonCards count={4} />}

          {hero && <EventHero event={hero} onOpen={open} />}

          {!loading && filtered.length === 0 && (
            <EmptyState title={hasFilter ? 'Nenhum evento com esses filtros' : 'Ainda não há eventos futuros'}
              message={hasFilter ? 'Tente outro período, categoria ou cidade.' : 'Volte em breve: a agenda é atualizada com frequência.'}
              icon={<CalendarDays size={28} />}
              action={hasFilter ? <button onClick={() => { setQ(''); setPeriod('all'); setCategory(''); setCityId(''); }} className="text-sm font-black text-ocean-600">Limpar filtros</button> : undefined} />
          )}

          {blocks.map((b, bi) => b.list.length > 0 && (
            <section key={bi} aria-label={b.title || 'Eventos'} className="space-y-5">
              {b.title && <h2 className="text-lg font-black text-ocean-950">{b.title} <span className="text-sm font-bold text-slate-400">({b.list.length})</span></h2>}
              {groupByMonth(b.list, today).map(g => (
                <div key={g.key} className="space-y-2.5">
                  <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-400">{g.label}</h3>
                  {g.events.map(e => <EventRow key={e.id} event={e} onOpen={open} />)}
                </div>
              ))}
            </section>
          ))}

          {past.length > 0 && (
            <div>
              <button onClick={() => setShowPast(v => !v)} aria-expanded={showPast} data-testid="toggle-past"
                className="w-full h-11 rounded-2xl bg-white border border-slate-200 text-sm font-bold text-slate-500 flex items-center justify-center gap-2">
                {showPast ? 'Esconder' : 'Ver'} eventos que já passaram ({past.length}) <ChevronDown size={15} className={showPast ? 'rotate-180' : ''} />
              </button>
              {showPast && <div className="mt-3 space-y-2.5 opacity-75">{filteredPast.map(e => <EventRow key={e.id} event={e} onOpen={open} />)}</div>}
            </div>
          )}

          <div className="bg-white rounded-3xl border border-slate-100 p-5 flex items-start gap-4">
            <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0"><Megaphone size={20} /></div>
            <div className="min-w-0">
              <p className="font-black text-ocean-950">Tem um evento na região?</p>
              <p className="text-sm text-slate-500 mt-0.5">Estabelecimentos parceiros divulgam seus eventos aqui, dentro do limite do plano.</p>
              <button onClick={goPartner} data-testid="events-cta-partner" className="mt-3 text-sm font-black text-ocean-600">
                {isPartner ? 'Gerenciar meus eventos' : currentUser ? 'Ver planos para parceiros' : 'Entrar para divulgar'}
              </button>
            </div>
          </div>
        </div>
      </div>
      <LegalFooter onNavigate={onNavigate} />
    </div>
  );
};
