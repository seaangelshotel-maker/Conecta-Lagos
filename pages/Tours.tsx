import React, { useMemo, useState } from 'react';
import { Ship, MapPin, Clock, Users, CalendarCheck, ArrowRight, Search, X } from 'lucide-react';
import { Tour, User } from '../types';
import { SEO } from '../components/SEO';
import { EmptyState, SkeletonCards } from '../components/ui/States';
import { LegalFooter } from '../components/LegalFooter';
import { usePublishedTours } from '../services/tourService';
import { priceLabel, nextDeparture, formatDateBR, filterTours, TourSort } from '../services/tourRules';
import { REGION_MUNICIPALITIES } from '../services/regionGeo';

interface Props { currentUser: User | null; onNavigate: (page: string, params?: any) => void; }

const cityName = (id: string) => REGION_MUNICIPALITIES.find(m => m.id === id)?.name || '';

const chip = (on: boolean) => `shrink-0 h-9 px-3.5 rounded-full text-[13px] font-bold border transition-colors ${on ? 'bg-ocean-600 text-white border-ocean-600' : 'bg-white text-ocean-900 border-slate-200 hover:border-ocean-300'}`;

/** Card de passeio. `large` vira o destaque da página: foto grande com o texto sobre ela. */
export const TourCard: React.FC<{ tour: Tour; onOpen: () => void; large?: boolean }> = ({ tour, onOpen, large }) => {
  const next = useMemo(() => nextDeparture(tour, new Date()), [tour]);
  const photos = [tour.coverImage, ...(tour.gallery || [])].filter(Boolean);
  if (large) {
    return (
      <button onClick={onOpen} data-testid="tour-card" data-large="true" className="group relative text-left w-full rounded-[2rem] overflow-hidden shadow-lg min-h-[340px] md:min-h-[400px] flex items-end bg-ocean-950">
        {photos[0] && <img src={photos[0]} alt={tour.title} referrerPolicy="no-referrer" className="absolute inset-0 w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-700" />}
        <div className="absolute inset-0 bg-gradient-to-t from-ocean-950/95 via-ocean-950/65 to-ocean-950/10" />
        <div className="relative p-5 md:p-8 text-white w-full md:flex md:items-end md:justify-between md:gap-6">
          <div className="max-w-2xl">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className="bg-amber-400 text-slate-950 text-[11px] font-black px-3 py-1 rounded-full">{tour.featured ? 'Destaque' : 'Em cartaz'}</span>
              {tour.cityId && <span className="bg-white/20 backdrop-blur text-[11px] font-bold px-3 py-1 rounded-full flex items-center gap-1"><MapPin size={11} /> {cityName(tour.cityId)}</span>}
            </div>
            <h2 className="text-2xl md:text-4xl font-black leading-tight tracking-tight">{tour.title}</h2>
            <p className="text-sm md:text-base text-white/85 mt-2 line-clamp-2">{tour.shortDescription}</p>
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs md:text-sm text-white/80 mt-3">
              {tour.durationText && <span className="flex items-center gap-1"><Clock size={13} /> {tour.durationText}</span>}
              <span className="flex items-center gap-1"><Users size={13} /> até {tour.maxPeoplePerBooking} por reserva</span>
              {photos.length > 1 && <span>{photos.length} fotos</span>}
            </div>
          </div>
          <div className="mt-4 md:mt-0 flex items-center justify-between md:flex-col md:items-end gap-2 shrink-0">
            <div className="md:text-right">
              <p className="text-lg md:text-xl font-black">{priceLabel(tour)}</p>
              {next && <p className="text-[12px] text-emerald-300 font-bold flex items-center gap-1 md:justify-end"><CalendarCheck size={13} /> Próxima saída: {formatDateBR(next)}</p>}
            </div>
            <span className="h-11 px-5 rounded-full bg-white text-ocean-900 font-black text-sm flex items-center gap-2">Ver datas <ArrowRight size={16} /></span>
          </div>
        </div>
      </button>
    );
  }
  return (
    <button onClick={onOpen} data-testid="tour-card" className="group text-left bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl transition-all active:scale-[0.99] flex flex-col">
      <div className="h-48 bg-slate-100 relative overflow-hidden">
        {photos[0]
          ? <img src={photos[0]} alt={tour.title} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-slate-300"><Ship size={40} /></div>}
        <span className="absolute bottom-3 left-3 bg-white/95 text-ocean-900 text-[12px] font-black px-3 py-1 rounded-full shadow">{priceLabel(tour)}</span>
        {tour.featured && <span className="absolute top-3 left-3 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">Destaque</span>}
        {photos.length > 1 && <span className="absolute top-3 right-3 bg-black/50 text-white text-[11px] font-bold px-2.5 py-1 rounded-full">{photos.length} fotos</span>}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-black text-ocean-950 text-lg leading-tight">{tour.title}</h3>
        <p className="text-sm text-slate-500 line-clamp-2">{tour.shortDescription}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
          {tour.cityId && <span className="flex items-center gap-1"><MapPin size={12} /> {cityName(tour.cityId)}</span>}
          {tour.durationText && <span className="flex items-center gap-1"><Clock size={12} /> {tour.durationText}</span>}
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between">
          {next ? <p className="text-[12px] text-emerald-700 font-bold flex items-center gap-1"><CalendarCheck size={13} /> Próxima saída: {formatDateBR(next)}</p> : <span className="text-[12px] text-slate-400">Sem saídas marcadas</span>}
          <span className="w-10 h-10 rounded-full bg-ocean-600 text-white flex items-center justify-center"><ArrowRight size={18} /></span>
        </div>
      </div>
    </button>
  );
};

export const Tours: React.FC<Props> = ({ currentUser, onNavigate }) => {
  const { tours, loading } = usePublishedTours();
  const [q, setQ] = useState('');
  const [cityId, setCityId] = useState('');
  const [operator, setOperator] = useState('');
  const [soon, setSoon] = useState(false);
  const [sort, setSort] = useState<TourSort>('proxima');
  const cities = useMemo(() => REGION_MUNICIPALITIES.filter(m => tours.some(t => t.cityId === m.id)), [tours]);
  const operators = useMemo(() => [...new Set(tours.map(t => t.operatorName).filter(Boolean))], [tours]);
  const list = useMemo(() => filterTours(tours, { q, cityId, operator, withinDays: soon ? 7 : undefined, sort }, cityName), [tours, q, cityId, operator, soon, sort]);
  const filtering = !!(q || cityId || operator || soon);
  const clear = () => { setQ(''); setCityId(''); setOperator(''); setSoon(false); };
  const [hero, ...rest] = list;
  const open = (t: Tour) => onNavigate('tour-detail', { tourId: t.id });

  return (
    <div className="min-h-screen bg-slate-50 pb-28" data-testid="tours-page">
      <SEO title="Passeios na Região dos Lagos" description="Passeios de barco, mergulho e experiências em Arraial do Cabo, Cabo Frio e Búzios. Escolha a data e peça sua reserva." />
      <header className="bg-gradient-to-br from-ocean-600 to-ocean-950 text-white pt-8 pb-14">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200 flex items-center gap-1.5"><Ship size={13} /> Passeios</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1">Escolha o dia e reserve seu passeio</h1>
          <p className="text-sm text-white/80 mt-1 max-w-xl">Veja as datas com vaga, peça a reserva e a operadora confirma com você pelo WhatsApp.</p>
          {currentUser && <button onClick={() => onNavigate('my-bookings')} className="mt-4 text-sm font-black bg-white/15 hover:bg-white/25 px-4 py-2 rounded-full">Minhas reservas</button>}
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 -mt-8">
        <div className="bg-white rounded-3xl shadow-md border border-slate-100 p-3 md:p-4 space-y-3" data-testid="tours-filters">
          <div className="relative">
            <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={e => setQ(e.target.value)} type="search" aria-label="Buscar passeio" placeholder="Buscar passeio, cidade ou operadora"
              className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-200 pl-11 pr-10 text-[15px] focus:outline-none focus:ring-2 focus:ring-ocean-400" />
            {q && <button onClick={() => setQ('')} aria-label="Limpar busca" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400"><X size={18} /></button>}
          </div>
          <div className="flex gap-2 overflow-x-auto -mx-1 px-1 pb-0.5">
            <button onClick={() => setSoon(s => !s)} aria-pressed={soon} className={chip(soon)}>Saída nos próximos 7 dias</button>
            {cities.length > 1 && cities.map(c => <button key={c.id} onClick={() => setCityId(cityId === c.id ? '' : c.id)} aria-pressed={cityId === c.id} className={chip(cityId === c.id)}>{c.name}</button>)}
            {operators.length > 1 && operators.map(o => <button key={o} onClick={() => setOperator(operator === o ? '' : o)} aria-pressed={operator === o} className={chip(operator === o)}>{o}</button>)}
          </div>
          <div className="flex items-center justify-between gap-3 text-sm">
            <p className="text-slate-500" aria-live="polite">{loading ? '' : `${list.length} ${list.length === 1 ? 'passeio' : 'passeios'}`}{filtering && <button onClick={clear} className="ml-3 font-bold text-ocean-700 underline">Limpar filtros</button>}</p>
            <label className="flex items-center gap-2 text-slate-500">Ordenar
              <select value={sort} onChange={e => setSort(e.target.value as TourSort)} className="h-9 rounded-xl border border-slate-200 bg-white px-2 text-[13px] font-bold text-ocean-900">
                <option value="proxima">Próxima saída</option>
                <option value="menor-preco">Menor preço</option>
              </select>
            </label>
          </div>
        </div>
        <div className="py-5">
          {loading ? <SkeletonCards count={4} />
            : tours.length === 0 ? <EmptyState icon={<Ship size={28} />} title="Os passeios chegam em breve" message="Estamos cadastrando as saídas. Volte em alguns dias." />
            : list.length === 0 ? <EmptyState icon={<Search size={28} />} title="Nenhum passeio encontrado" message="Tente outra palavra ou limpe os filtros." />
            : (
              <div className="space-y-4">
                {hero && <TourCard large tour={hero} onOpen={() => open(hero)} />}
                {rest.length > 0 && <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{rest.map(t => <TourCard key={t.id} tour={t} onOpen={() => open(t)} />)}</div>}
              </div>
            )}
        </div>
      </div>
      <LegalFooter onNavigate={onNavigate} />
    </div>
  );
};
