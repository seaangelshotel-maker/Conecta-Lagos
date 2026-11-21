/**
 * Passeios — acesso ao Firestore (coleções `tours`, `tourSlots` e `tourBookings`).
 *
 * - Público lê só passeios publicados e a ocupação das saídas.
 * - Quem está logado cria pedidos de reserva (sempre "pendente") e cancela os seus.
 * - O admin cadastra passeios, fecha saídas e confirma/cancela reservas.
 * A reserva e o contador de vagas da saída são gravados na mesma transação; as regras do Firestore
 * (firestore.rules) conferem que o contador subiu o número certo e não passou da capacidade.
 */
import { useEffect, useState } from 'react';
import { collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, runTransaction } from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentUser } from './dataService';
import { Tour, TourBooking, TourSlot, User, UserRole } from '../types';
import { BookingInput, brtDate, cleanPhone, slotId, validateBooking } from './tourRules';

const TOURS = 'tours';
const SLOTS = 'tourSlots';
const BOOKINGS = 'tourBookings';
const CHANGED = 'toursUpdated';
const TTL_MS = 60_000;

let _public: Tour[] | null = null;
let _publicAt = 0;
let _pending: Promise<Tour[]> | null = null;

const clean = <T extends object>(o: T): T => JSON.parse(JSON.stringify(o));
const notifyChanged = () => { _public = null; if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGED)); };

const requireUser = (): User => {
  const u = getCurrentUser();
  if (!u) throw new Error('Entre na sua conta para continuar.');
  return u;
};
const requireAdmin = (): User => {
  const u = requireUser();
  if (u.role !== UserRole.SUPER_ADMIN) throw new Error('Apenas o administrador pode fazer isso.');
  return u;
};

const byOrder = (a: Tour, b: Tour) => (b.featured ? 1 : 0) - (a.featured ? 1 : 0) || (a.order ?? 999) - (b.order ?? 999) || a.title.localeCompare(b.title);

export const getPublishedTours = async (force = false): Promise<Tour[]> => {
  if (!force && _public && Date.now() - _publicAt < TTL_MS) return _public;
  if (_pending && !force) return _pending;
  _pending = getDocs(query(collection(db, TOURS), where('status', '==', 'published')))
    .then(s => s.docs.map(d => ({ ...(d.data() as Tour), id: d.id })).sort(byOrder))
    .catch(() => [] as Tour[])
    .then(list => { _public = list; _publicAt = Date.now(); _pending = null; return list; });
  return _pending;
};

export const usePublishedTours = () => {
  const [tours, setTours] = useState<Tour[]>(_public || []);
  const [loading, setLoading] = useState(!_public);
  useEffect(() => {
    let alive = true;
    const load = (force = false) => getPublishedTours(force).then(l => { if (alive) { setTours(l); setLoading(false); } });
    load();
    const on = () => load(true);
    window.addEventListener(CHANGED, on);
    return () => { alive = false; window.removeEventListener(CHANGED, on); };
  }, []);
  return { tours, loading };
};

export const getTourById = async (id: string): Promise<Tour | null> => {
  const cached = _public?.find(t => t.id === id);
  if (cached) return cached;
  try {
    const s = await getDoc(doc(db, TOURS, id));
    return s.exists() ? { ...(s.data() as Tour), id: s.id } : null;
  } catch { return null; }
};

/** Ocupação das saídas de um passeio, por id da saída. */
export const getTourSlots = async (tourId: string): Promise<Record<string, TourSlot>> => {
  try {
    const s = await getDocs(query(collection(db, SLOTS), where('tourId', '==', tourId)));
    const out: Record<string, TourSlot> = {};
    s.docs.forEach(d => { out[d.id] = { ...(d.data() as TourSlot), id: d.id }; });
    return out;
  } catch { return {}; }
};

// ---------- Reservas (cliente) ----------

export const createBooking = async (tour: Tour, input: BookingInput): Promise<TourBooking> => {
  const user = requireUser();
  const sid = slotId(tour.id, input.date, input.time);
  const slotRef = doc(db, SLOTS, sid);
  const bookingRef = doc(collection(db, BOOKINGS));
  const booking: TourBooking = {
    id: bookingRef.id, tourId: tour.id, tourTitle: tour.title, operatorName: tour.operatorName,
    date: input.date, time: input.time, people: input.people, customerName: input.customerName.trim(),
    customerPhone: cleanPhone(input.customerPhone), userId: user.id, status: 'pending', createdAt: new Date().toISOString(),
    ...((input.notes || '').trim() ? { notes: input.notes!.trim() } : {}),
  };
  await runTransaction(db, async tx => {
    const snap = await tx.get(slotRef);
    const cur = snap.exists() ? (snap.data() as TourSlot) : undefined;
    // revalida com a ocupação mais recente: outra pessoa pode ter reservado agora há pouco
    const errs = validateBooking(tour, input, cur);
    const first = Object.values(errs)[0];
    if (first) throw new Error(first);
    tx.set(slotRef, clean({
      tourId: tour.id, date: input.date, time: input.time, booked: (cur?.booked || 0) + input.people, closed: false, lastBookingId: booking.id,
    }));
    tx.set(bookingRef, booking);
  });
  return booking;
};

export const getMyBookings = async (userId: string): Promise<TourBooking[]> => {
  const s = await getDocs(query(collection(db, BOOKINGS), where('userId', '==', userId)));
  return s.docs.map(d => ({ ...(d.data() as TourBooking), id: d.id })).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

/** Cancela uma reserva (a pessoa, a sua; o admin, qualquer uma) e devolve as vagas à saída. */
export const cancelBooking = async (b: TourBooking): Promise<void> => {
  const user = requireUser();
  const admin = user.role === UserRole.SUPER_ADMIN;
  if (!admin && b.userId !== user.id) throw new Error('Você só pode cancelar as suas reservas.');
  const slotRef = doc(db, SLOTS, slotId(b.tourId, b.date, b.time));
  const bookingRef = doc(db, BOOKINGS, b.id);
  await runTransaction(db, async tx => {
    const [bs, ss] = await Promise.all([tx.get(bookingRef), tx.get(slotRef)]);
    if (!bs.exists()) throw new Error('Reserva não encontrada.');
    const cur = bs.data() as TourBooking;
    if (cur.status === 'cancelled') return;
    tx.update(bookingRef, { status: 'cancelled', cancelledBy: admin ? 'admin' : 'customer', updatedAt: new Date().toISOString() });
    if (ss.exists()) {
      const booked = Math.max(0, ((ss.data() as TourSlot).booked || 0) - cur.people);
      tx.update(slotRef, { booked, lastBookingId: b.id });
    }
  });
};

// ---------- Admin ----------

export const getAllToursAdmin = async (): Promise<Tour[]> => {
  requireAdmin();
  const s = await getDocs(collection(db, TOURS));
  return s.docs.map(d => ({ ...(d.data() as Tour), id: d.id })).sort(byOrder);
};

const slugify = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'passeio';

export const adminSaveTour = async (t: Omit<Tour, 'id'> & { id?: string }): Promise<string> => {
  requireAdmin();
  const now = new Date().toISOString();
  const id = t.id || `${slugify(t.title)}-${Math.random().toString(36).slice(2, 6)}`;
  await setDoc(doc(db, TOURS, id), clean({ ...t, id, updatedAt: now, createdAt: t.createdAt || now }));
  notifyChanged();
  return id;
};

export const adminSetTourStatus = async (id: string, status: Tour['status']) => {
  requireAdmin();
  await updateDoc(doc(db, TOURS, id), { status, updatedAt: new Date().toISOString() });
  notifyChanged();
};

export const adminDeleteTour = async (id: string) => {
  requireAdmin();
  await deleteDoc(doc(db, TOURS, id));
  notifyChanged();
};

/** Reservas, da mais nova para a mais antiga. */
export const getAllBookingsAdmin = async (): Promise<TourBooking[]> => {
  requireAdmin();
  const s = await getDocs(query(collection(db, BOOKINGS), orderBy('createdAt', 'desc'), limit(500)));
  return s.docs.map(d => ({ ...(d.data() as TourBooking), id: d.id }));
};

export const adminConfirmBooking = async (id: string) => {
  requireAdmin();
  await updateDoc(doc(db, BOOKINGS, id), { status: 'confirmed', updatedAt: new Date().toISOString() });
};

/** Fecha ou reabre uma saída específica (ex.: mar ruim, barco em manutenção). */
export const adminSetSlotClosed = async (tour: Tour, date: string, time: string, closed: boolean) => {
  requireAdmin();
  const ref = doc(db, SLOTS, slotId(tour.id, date, time));
  const s = await getDoc(ref);
  if (s.exists()) await updateDoc(ref, { closed });
  else await setDoc(ref, { tourId: tour.id, date, time, booked: 0, closed });
};

/** Saídas futuras com ocupação, para o painel (data de hoje em diante). */
export const getUpcomingSlotsAdmin = async (tourId: string): Promise<TourSlot[]> => {
  const all = Object.values(await getTourSlots(tourId));
  const today = brtDate();
  return all.filter(s => s.date >= today).sort((a, b) => (a.date + a.time).localeCompare(b.date + b.time));
};
