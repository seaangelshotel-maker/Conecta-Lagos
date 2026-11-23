import React, { useMemo, useState } from 'react';
import { Ship, MapPin, Clock, CalendarCheck, Search, X, Star, SlidersHorizontal } from 'lucide-react';
import { Tour, TourCategory, User } from '../types';
import { SEO } from '../components/SEO';
import { EmptyState, SkeletonCards } from '../components/ui/States';
import { LegalFooter } from '../components/LegalFooter';
import { usePublishedTours, useReviews } from '../services/tourService';
import { priceLabel, nextDeparture, formatDateBR, filterTours, TourSort, TOUR_CATEGORIES, tourCategory, summarizeReviews, ratingText, RatingSummary } from '../services/tourRules';
import { REGION_MUNICIPALITIES } from '../services/regionGeo';

interface Props { currentUser: User | null; onNavigate: (page: string, params?: any) => void; }

const cityName = (id: string) => REGION_MUNICIPALITIES.find(m => m.id === id)?.name || '';

const chip = (on: boolean) => `shrink-0 h-8 px-3 rounded-full text-[13px] font-bold border transition-colors ${on ? 'bg-ocean-600 text-white border-ocean-600' : 'bg-white text-ocean-900 border-slate-200 hover:border-ocean-300'}`;

const shortDate = (d: string) => formatDateBR(d).replace(/\/\d{4}$/, '');

/** Card compacto de catálogo: foto, nota, título, preço e próxima saída. */
export const TourCard: React.FC<{ tour: Tour; onOpen: () => void; rating?: RatingSummary }> = ({ tour, onOpen, rating }) => {
  const next = useMemo(() => nextDeparture(tour, new Date()), [tour]);
  const cover = tour.coverImage || (tour.gallery || [])[0];
  return (
    <button onClick={onOpen} data-testid="tour-card" className="group text-left bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all active:scale-[0.98] flex flex-col">
      <div className="aspect-[4/3] bg-slate-100 relative overflow-hidden">
        {cover
          ? <img src={cover} alt={tour.title} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          : <div className="w-full h-full flex items-center justify-center text-slate-300"><Ship size={32} /></div>}
        <span className="absolute top-2 left-2 bg-white/95 text-ocean-900 text-[10px] font-black px-2 py-0.5 rounded-full shadow">{TOUR_CATEGORIES.find(c => c.id === tourCategory(tour))?.label}</span>
        <span className="absolute top-2 right-2 bg-black/55 text-white text-[11px] font-black px-2 py-0.5 rounded-full flex items-center gap-1">
          {rating?.count ? <><Star size={11} className="fill-amber-300 text-amber-300" /> {ratingText(rating)} <span className="font-medium opacity-80">({rating.count})</span></> : 'Novo'}
        </span>
      </div>
      <div className="p-2.5 flex flex-col gap-1 flex-1">
        <h3 className="font-black text-ocean-950 text-[13px] md:text-sm leading-snug line-clamp-2 min-h-[2.4em]">{tour.title}</h3>
        <p className="text-[11px] text-slate-500 flex items-center gap-2 truncate">
          {tour.cityId && <span className="flex items-center gap-0.5 truncate"><MapPin size={10} /> {cityName(tour.cityId)}</span>}
          {tour.durationText && <span className="flex items-center gap-0.5 truncate"><Clock size={10} /> {tour.durationText}</span>}
        </p>
        <p className="text-[13px] font-black text-ocean-700 leading-tight mt-auto pt-1">{priceLabel(tour)}</p>
        {next ? <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1"><CalendarCheck size={11} /> Próxima: {shortDate(next)}</p> : <p className="text-[11px] text-slate-400">Sem saídas marcadas</p>}
      </div>
    </button>
  );
};

export const Tours: React.FC<Props> = ({ currentUser, onNavigate }) => {
  const { tours, loading } = usePublishedTours();
  const reviews = useReviews();
  const ratings = useMemo(() => summarizeReviews(reviews), [reviews]);
  const [q, setQ] = useState('');
  const [category, setCategory] = useState<TourCategory | ''>('');
  const [cityId, setCityId] = useState('');
  const [operator, setOperator] = useState('');
  const [soon, setSoon] = useState(false);
  const [top, setTop] = useState(false);
  const [sort, setSort] = useState<TourSort>('proxima');
  const [panel, setPanel] = useState(false);
  const cities = useMemo(() => REGION_MUNICIPALITIES.filter(m => tours.some(t => t.cityId === m.id)), [tours]);
  const operators = useMemo(() => [...new Set(tours.map(t => t.operatorName).filter(Boolean))], [tours]);
  const cats = useMemo(() => TOUR_CATEGORIES.map(c => ({ ...c, n: tours.filter(t => tourCategory(t) === c.id).length })).filter(c => c.n > 0), [tours]);
  const list = useMemo(() => filterTours(tours, { q, category: category || undefined, cityId, operator, withinDays: soon ? 7 : undefined, minRating: top ? 4 : undefined, sort }, cityName, new Date(), ratings), [tours, q, category, cityId, operator, soon, top, sort, ratings]);
  const extra = [cityId, operator, soon, top].filter(Boolean).length;
  const filtering = !!(q || category || extra);
  const clear = () => { setQ(''); setCategory(''); setCityId(''); setOperator(''); setSoon(false); setTop(false); };
  const open = (t: Tour) => onNavigate('tour-detail', { tourId: t.id });
  const select = 'h-10 w-full rounded-xl border border-slate-200 bg-white px-2 text-[13px] font-bold text-ocean-900';

  return (
    <div className="min-h-screen bg-slate-50 pb-28" data-testid="tours-page">
      <SEO title="Passeios na Região dos Lagos" description="Passeios de barco, mergulho e experiências em Arraial do Cabo, Cabo Frio e Búzios. Escolha a data e peça sua reserva." />
      <header className="bg-gradient-to-br from-ocean-600 to-ocean-950 text-white pt-5 pb-10">
        <div className="max-w-5xl mx-auto px-4 flex items-start justify-between gap-3">
          <div>
            <h1 className="text-xl md:text-3xl font-black tracking-tight flex items-center gap-2"><Ship size={20} /> Passeios</h1>
            <p className="text-[13px] text-white/80 mt-1 max-w-md">Escolha o dia, peça a reserva e a operadora confirma pelo WhatsApp.</p>
          </div>
          {currentUser && <button onClick={() => onNavigate('my-bookings')} className="shrink-0 text-xs font-black bg-white/15 hover:bg-white/25 px-3 py-2 rounded-full">Minhas reservas</button>}
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-3 -mt-6">
        <div className="bg-white rounded-2xl shadow-md border border-slate-100 p-2.5 space-y-2" data-testid="tours-filters">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input value={q} onChange={e => setQ(e.target.value)} type="search" aria-label="Buscar passeio" placeholder="Buscar passeio ou cidade"
                className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 pl-9 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-ocean-400" />
              {q && <button onClick={() => setQ('')} aria-label="Limpar busca" className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400"><X size={16} /></button>}
            </div>
            <button onClick={() => setPanel(p => !p)} aria-expanded={panel} className={`h-10 px-3 rounded-xl border text-[13px] font-black flex items-center gap-1.5 ${panel || extra ? 'bg-ocean-50 border-ocean-300 text-ocean-800' : 'bg-white border-slate-200 text-ocean-900'}`}>
              <SlidersHorizontal size={15} /> Filtros{extra > 0 && <span className="bg-ocean-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center">{extra}</span>}
            </button>
          </div>
          <div className="flex gap-1.5 overflow-x-auto -mx-0.5 px-0.5">
            <button onClick={() => setCategory('')} aria-pressed={!category} className={chip(!category)}>Todos</button>
            {cats.map(c => <button key={c.id} onClick={() => setCategory(category === c.id ? '' : c.id)} aria-pressed={category === c.id} className={chip(category === c.id)}>{c.label} <span className="opacity-60 font-medium">{c.n}</span></button>)}
          </div>
          {panel && (
            <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100" data-testid="tours-filter-panel">
              <label className="text-[11px] font-bold text-slate-500">Ordenar
                <select value={sort} onChange={e => setSort(e.target.value as TourSort)} className={select}>
                  <option value="proxima">Próxima saída</option>
                  <option value="menor-preco">Menor preço</option>
                  <option value="mais-avaliado">Mais avaliado</option>
                </select>
              </label>
              {cities.length > 1
                ? <label className="text-[11px] font-bold text-slate-500">Cidade
                    <select value={cityId} onChange={e => setCityId(e.target.value)} className={select}><option value="">Todas</option>{cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
                  </label> : <div />}
              {operators.length > 1 && (
                <label className="text-[11px] font-bold text-slate-500">Operadora
                  <select value={operator} onChange={e => setOperator(e.target.value)} className={select}><option value="">Todas</option>{operators.map(o => <option key={o} value={o}>{o}</option>)}</select>
                </label>
              )}
              <div className="col-span-2 flex flex-wrap gap-1.5">
                <button onClick={() => setSoon(v => !v)} aria-pressed={soon} className={chip(soon)}>Saída em 7 dias</button>
                <button onClick={() => setTop(v => !v)} aria-pressed={top} className={chip(top)}><Star size={12} className="inline -mt-0.5 mr-1" />4 estrelas ou mais</button>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between text-[13px] text-slate-500 px-0.5">
            <p aria-live="polite">{loading ? '' : `${list.length} ${list.length === 1 ? 'passeio' : 'passeios'}`}</p>
            {filtering && <button onClick={clear} className="font-bold text-ocean-700 underline">Limpar filtros</button>}
          </div>
        </div>
        <div className="py-4">
          {loading ? <SkeletonCards count={4} />
            : tours.length === 0 ? <EmptyState icon={<Ship size={28} />} title="Os passeios chegam em breve" message="Estamos cadastrando as saídas. Volte em alguns dias." />
            : list.length === 0 ? <EmptyState icon={<Search size={28} />} title="Nenhum passeio encontrado" message={top ? 'Ainda não há passeios com 4 estrelas ou mais. Tire esse filtro ou limpe tudo.' : 'Tente outra palavra ou limpe os filtros.'} />
            : <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">{list.map(t => <TourCard key={t.id} tour={t} rating={ratings[t.id]} onOpen={() => open(t)} />)}</div>}
        </div>
      </div>
      <LegalFooter onNavigate={onNavigate} />
    </div>
  );
};
