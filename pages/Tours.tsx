import React, { useMemo, useState } from 'react';
import { Ship, MapPin, Clock, Users, CalendarCheck, ArrowRight } from 'lucide-react';
import { Tour, User } from '../types';
import { SEO } from '../components/SEO';
import { EmptyState, SkeletonCards } from '../components/ui/States';
import { LegalFooter } from '../components/LegalFooter';
import { usePublishedTours } from '../services/tourService';
import { priceLabel, departureDates, formatDateBR } from '../services/tourRules';
import { REGION_MUNICIPALITIES } from '../services/regionGeo';

interface Props { currentUser: User | null; onNavigate: (page: string, params?: any) => void; }

const cityName = (id: string) => REGION_MUNICIPALITIES.find(m => m.id === id)?.name || '';

export const TourCard: React.FC<{ tour: Tour; onOpen: () => void }> = ({ tour, onOpen }) => {
  const next = useMemo(() => departureDates(tour, new Date(), 120)[0], [tour]);
  return (
    <button onClick={onOpen} data-testid="tour-card" className="text-left bg-white rounded-3xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-lg transition-all active:scale-[0.99] flex flex-col">
      <div className="h-44 bg-slate-100 relative overflow-hidden">
        {tour.coverImage
          ? <img src={tour.coverImage} alt={tour.title} loading="lazy" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
          : <div className="w-full h-full flex items-center justify-center text-slate-300"><Ship size={40} /></div>}
        {tour.featured && <span className="absolute top-3 left-3 bg-amber-400 text-slate-950 text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">Destaque</span>}
      </div>
      <div className="p-4 flex flex-col gap-2 flex-1">
        <h3 className="font-black text-ocean-950 text-lg leading-tight">{tour.title}</h3>
        <p className="text-sm text-slate-500 line-clamp-2">{tour.shortDescription}</p>
        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-slate-500 mt-1">
          {tour.cityId && <span className="flex items-center gap-1"><MapPin size={12} /> {cityName(tour.cityId)}</span>}
          {tour.durationText && <span className="flex items-center gap-1"><Clock size={12} /> {tour.durationText}</span>}
          <span className="flex items-center gap-1"><Users size={12} /> até {tour.maxPeoplePerBooking} por reserva</span>
        </div>
        <div className="mt-auto pt-3 flex items-center justify-between">
          <div>
            <p className="font-black text-ocean-700">{priceLabel(tour)}</p>
            {next && <p className="text-[11px] text-emerald-700 font-bold flex items-center gap-1"><CalendarCheck size={12} /> Próxima saída: {formatDateBR(next)}</p>}
          </div>
          <span className="w-10 h-10 rounded-full bg-ocean-600 text-white flex items-center justify-center"><ArrowRight size={18} /></span>
        </div>
      </div>
    </button>
  );
};

export const Tours: React.FC<Props> = ({ currentUser, onNavigate }) => {
  const { tours, loading } = usePublishedTours();
  const [cityId, setCityId] = useState('');
  const cities = useMemo(() => REGION_MUNICIPALITIES.filter(m => tours.some(t => t.cityId === m.id)), [tours]);
  const list = cityId ? tours.filter(t => t.cityId === cityId) : tours;

  return (
    <div className="min-h-screen bg-slate-50 pb-28" data-testid="tours-page">
      <SEO title="Passeios na Região dos Lagos" description="Passeios de barco, mergulho e experiências em Arraial do Cabo, Cabo Frio e Búzios. Escolha a data e peça sua reserva." />
      <header className="bg-gradient-to-br from-ocean-600 to-ocean-950 text-white pt-8 pb-6">
        <div className="max-w-5xl mx-auto px-4">
          <p className="text-[11px] font-black uppercase tracking-[0.2em] text-cyan-200 flex items-center gap-1.5"><Ship size={13} /> Passeios</p>
          <h1 className="text-3xl md:text-4xl font-black tracking-tight mt-1">Escolha o dia e reserve seu passeio</h1>
          <p className="text-sm text-white/80 mt-1 max-w-xl">Veja as datas com vaga, peça a reserva e a operadora confirma com você pelo WhatsApp.</p>
          {currentUser && <button onClick={() => onNavigate('my-bookings')} className="mt-4 text-sm font-black bg-white/15 hover:bg-white/25 px-4 py-2 rounded-full">Minhas reservas</button>}
        </div>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-5">
        {cities.length > 1 && (
          <div className="flex gap-2 overflow-x-auto pb-3 -mx-4 px-4">
            <button onClick={() => setCityId('')} aria-pressed={!cityId} className={`shrink-0 h-9 px-3.5 rounded-full text-[13px] font-bold border ${!cityId ? 'bg-ocean-600 text-white border-ocean-600' : 'bg-white text-ocean-900 border-slate-200'}`}>Todas</button>
            {cities.map(c => <button key={c.id} onClick={() => setCityId(c.id)} aria-pressed={cityId === c.id} className={`shrink-0 h-9 px-3.5 rounded-full text-[13px] font-bold border ${cityId === c.id ? 'bg-ocean-600 text-white border-ocean-600' : 'bg-white text-ocean-900 border-slate-200'}`}>{c.name}</button>)}
          </div>
        )}
        {loading ? <SkeletonCards count={4} />
          : list.length === 0 ? <EmptyState icon={<Ship size={28} />} title="Os passeios chegam em breve" message="Estamos cadastrando as saídas. Volte em alguns dias." />
          : <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{list.map(t => <TourCard key={t.id} tour={t} onOpen={() => onNavigate('tour-detail', { tourId: t.id })} />)}</div>}
      </div>
      <LegalFooter onNavigate={onNavigate} />
    </div>
  );
};
