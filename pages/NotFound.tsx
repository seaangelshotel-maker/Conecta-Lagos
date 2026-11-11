import React from 'react';
import { Compass, Home as HomeIcon, MapPin, CalendarDays } from 'lucide-react';
import { SEO } from '../components/SEO';
import { CITY_LANDINGS } from '../services/seoRoutes';

interface Props { onNavigate: (page: string, params?: any) => void; }

/** Endereço que não existe: mensagem clara + caminhos para voltar (e fora do Google). */
export const NotFound: React.FC<Props> = ({ onNavigate }) => (
  <div className="min-h-screen bg-slate-50 flex items-center justify-center px-5 pb-24" data-testid="not-found">
    <SEO title="Página não encontrada" description="Esta página não existe ou foi retirada." noindex />
    <div className="max-w-md w-full text-center">
      <div className="w-16 h-16 rounded-3xl bg-ocean-100 text-ocean-600 flex items-center justify-center mx-auto"><Compass size={30} aria-hidden /></div>
      <p className="text-[11px] font-black uppercase tracking-[0.2em] text-ocean-600 mt-5">Erro 404</p>
      <h1 className="text-2xl font-black text-ocean-950 mt-1">Não achamos essa página</h1>
      <p className="text-sm text-slate-500 mt-2">O endereço pode ter mudado ou o conteúdo foi retirado. Que tal seguir por um destes caminhos?</p>
      <div className="grid gap-2.5 mt-6">
        <button onClick={() => onNavigate('home')} className="h-12 rounded-2xl bg-ocean-950 text-white font-black text-sm flex items-center justify-center gap-2"><HomeIcon size={16} aria-hidden /> Ir para o início</button>
        <button onClick={() => onNavigate('discover')} className="h-12 rounded-2xl bg-white border border-slate-200 text-ocean-950 font-black text-sm flex items-center justify-center gap-2"><MapPin size={16} aria-hidden /> Ver todos os lugares</button>
        <button onClick={() => onNavigate('events')} className="h-12 rounded-2xl bg-white border border-slate-200 text-ocean-950 font-black text-sm flex items-center justify-center gap-2"><CalendarDays size={16} aria-hidden /> Agenda de eventos</button>
      </div>
      <div className="flex flex-wrap justify-center gap-2 mt-5">
        {CITY_LANDINGS.map(c => (
          <a key={c.slug} href={`/${c.slug}`} onClick={e => { e.preventDefault(); onNavigate('discover', { city: c.cityId, citySlug: c.slug }); }}
            className="px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-bold text-ocean-950">{c.name}</a>
        ))}
      </div>
    </div>
  </div>
);
