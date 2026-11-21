import React, { useEffect, useState } from 'react';
import { ArrowLeft, Ship, MessageCircle } from 'lucide-react';
import { Tour, TourBooking, User } from '../types';
import { SEO } from '../components/SEO';
import { Badge, EmptyState, LoadingState, secondaryButton } from '../components/ui/States';
import { cancelBooking, getMyBookings, getTourById } from '../services/tourService';
import { bookingWhatsappText, brtDate, formatDateBR, whatsappLink } from '../services/tourRules';
import { useNotification } from '../components/NotificationSystem';

interface Props { currentUser: User; onNavigate: (page: string, params?: any) => void; }

const TONE = { pending: 'amber', confirmed: 'green', cancelled: 'slate' } as const;
const LABEL = { pending: 'Aguardando confirmação', confirmed: 'Confirmada', cancelled: 'Cancelada' } as const;

export const MyBookings: React.FC<Props> = ({ currentUser, onNavigate }) => {
  const { notify, confirm } = useNotification();
  const [list, setList] = useState<TourBooking[] | null>(null);
  const [tours, setTours] = useState<Record<string, Tour | null>>({});
  const load = async () => {
    const l = await getMyBookings(currentUser.id).catch(() => []);
    setList(l);
    const ids = [...new Set(l.map(b => b.tourId))];
    const got = await Promise.all(ids.map(async id => [id, await getTourById(id)] as const));
    setTours(Object.fromEntries(got));
  };
  useEffect(() => { load(); }, []);

  const cancel = async (b: TourBooking) => {
    const ok = await confirm({ title: 'Cancelar esta reserva?', message: 'As vagas voltam para outras pessoas.', confirmText: 'Cancelar reserva' });
    if (!ok) return;
    try { await cancelBooking(b); notify('success', 'Reserva cancelada.'); load(); } catch (e: any) { notify('error', e?.message || 'Não foi possível cancelar.'); }
  };
  const today = brtDate();

  return (
    <div className="min-h-screen bg-slate-50 pb-28" data-testid="my-bookings-page">
      <SEO title="Minhas reservas de passeios" noindex />
      <div className="max-w-2xl mx-auto px-4 pt-6">
        <button onClick={() => onNavigate('tours')} className="flex items-center gap-1 text-sm font-bold text-ocean-700 mb-3"><ArrowLeft size={16} /> Passeios</button>
        <h1 className="text-2xl font-black text-ocean-950 mb-4">Minhas reservas</h1>
        {list === null ? <LoadingState /> : list.length === 0
          ? <EmptyState icon={<Ship size={28} />} title="Nenhuma reserva ainda" message="Quando você pedir um passeio, ele aparece aqui." action={<button className={secondaryButton} onClick={() => onNavigate('tours')}>Ver passeios</button>} />
          : <div className="space-y-3">{list.map(b => {
              const t = tours[b.tourId];
              const upcoming = b.date >= today && b.status !== 'cancelled';
              return (
                <div key={b.id} className="bg-white rounded-3xl border border-slate-100 p-4" data-testid="booking-row">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-black text-ocean-950">{b.tourTitle}</p>
                    <Badge tone={TONE[b.status]}>{LABEL[b.status]}</Badge>
                  </div>
                  <p className="text-sm text-slate-600 mt-1">{formatDateBR(b.date)} às {b.time} · {b.people} pessoa{b.people > 1 ? 's' : ''}</p>
                  {upcoming && (
                    <div className="flex gap-2 mt-3">
                      {t && <a href={whatsappLink(t.operatorWhatsapp, bookingWhatsappText(b))} target="_blank" rel="noopener noreferrer" className="flex-1 inline-flex items-center justify-center gap-1.5 bg-emerald-600 text-white text-sm font-black rounded-2xl py-2.5"><MessageCircle size={16} /> WhatsApp</a>}
                      <button onClick={() => cancel(b)} className="flex-1 border border-slate-200 text-slate-600 text-sm font-black rounded-2xl py-2.5">Cancelar</button>
                    </div>
                  )}
                </div>
              );
            })}</div>}
      </div>
    </div>
  );
};
