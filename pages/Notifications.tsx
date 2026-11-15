import React, { useEffect } from 'react';
import { Bell, CalendarDays, Ticket, Megaphone } from 'lucide-react';
import { User } from '../types';
import { PageHeader, LoadingState } from '../components/ui/States';
import { goToLink, markSeen, useInbox } from '../services/inboxService';
import { SEO } from '../components/SEO';

const when = (iso: string) => {
  const d = new Date(iso); const diff = Date.now() - d.getTime();
  if (diff < 3_600_000) return `há ${Math.max(1, Math.round(diff / 60_000))} min`;
  if (diff < 86_400_000) return `há ${Math.round(diff / 3_600_000)} h`;
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
};

/** Página inteira de avisos (como nos apps de reserva): lista dos últimos avisos, com os novos em destaque. */
export const NotificationsPage: React.FC<{ currentUser: User | null; onNavigate: (page: string, params?: any) => void }> = ({ currentUser }) => {
  const { items, seenAtOpen } = useInbox(currentUser?.id);
  useEffect(() => { if (items) markSeen(); }, [items]);
  const back = () => { if (window.history.length > 1) window.history.back(); else goToLink('/'); };

  return (
    <div className="min-h-screen bg-slate-50 pb-28" data-testid="notifications-page">
      <SEO title="Avisos" description="Seus avisos do Lagos GO." noindex />
      <PageHeader title="Avisos" subtitle="Eventos, cupons e novidades" onBack={back} />
      <div className="max-w-2xl mx-auto px-4 pt-4">
        {!items && <LoadingState label="Carregando avisos..." />}
        {items && items.length === 0 && (
          <div className="text-center pt-24 pb-10 px-6" data-testid="notifications-empty">
            <Bell size={56} className="mx-auto text-slate-300 mb-5" />
            <h2 className="text-xl font-black text-ocean-950">Você não tem avisos</h2>
            <p className="text-sm text-slate-500 mt-2">Aqui aparecem os avisos de eventos, cupons e novidades de Lagos.</p>
          </div>
        )}
        <div className="space-y-2.5">
          {items?.map(i => {
            const isNew = !seenAtOpen || i.at > seenAtOpen;
            const Icon = i.kind === 'evento' ? CalendarDays : i.kind === 'cupom' ? Ticket : Megaphone;
            return (
              <button key={i.id} onClick={() => goToLink(i.link)} data-testid="notification-item"
                className={`w-full text-left rounded-2xl p-4 border flex gap-3 active:scale-[0.99] ${isNew ? 'bg-white border-ocean-200 shadow-sm' : 'bg-white/70 border-slate-100'}`}>
                <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${isNew ? 'bg-ocean-50 text-ocean-600' : 'bg-slate-100 text-slate-400'}`}><Icon size={18} /></div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-black text-sm text-ocean-950 leading-snug">{i.title}</p>
                    {isNew && <span className="shrink-0 mt-1 w-2 h-2 rounded-full bg-red-500" aria-label="Novo" />}
                  </div>
                  <p className="text-[13px] text-slate-600 mt-0.5">{i.body}</p>
                  <p className="text-[11px] text-slate-400 mt-1.5 font-semibold">{when(i.at)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
