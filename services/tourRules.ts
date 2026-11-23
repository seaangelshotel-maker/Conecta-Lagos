/**
 * Passeios: regras puras de agenda, disponibilidade e reserva (sem Firestore).
 * Datas são "YYYY-MM-DD" e horários "HH:MM", sempre no horário de Brasília (UTC-3, sem horário de verão).
 */
import type { Tour, TourBooking, TourSchedule, TourSlot } from '../types';

export const BRT_OFFSET = '-03:00';
export const WEEKDAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;
const TIME_RE = /^([01]\d|2[0-3]):[0-5]\d$/;
export const isDate = (s: unknown): s is string => typeof s === 'string' && DATE_RE.test(s) && !isNaN(Date.parse(s + 'T12:00:00Z'));
export const isTime = (s: unknown): s is string => typeof s === 'string' && TIME_RE.test(s);

/** Data de hoje em Brasília para um instante dado. */
export const brtDate = (now: Date = new Date()): string => new Date(now.getTime() - 3 * 3600_000).toISOString().slice(0, 10);

/** Instante (ms) em que a saída acontece. */
export const slotInstant = (date: string, time: string): number => Date.parse(`${date}T${time}:00${BRT_OFFSET}`);

export const weekdayOf = (date: string): number => new Date(date + 'T12:00:00Z').getUTCDay();

export const addDaysISO = (date: string, n: number): string => {
  const d = new Date(date + 'T12:00:00Z');
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
};

export const slotId = (tourId: string, date: string, time: string) => `${tourId}_${date}_${time.replace(':', '')}`;

export const emptySchedule = (): TourSchedule => ({ weekdays: [], times: [], blockedDates: [], extraDates: [] });

const uniqSorted = (a: string[]) => [...new Set(a.filter(isTime))].sort();

/** Horários de saída previstos para uma data (antes de olhar vagas e antecedência). */
export const scheduledTimes = (tour: Pick<Tour, 'schedule'>, date: string): string[] => {
  const s = tour.schedule;
  if (!s || !isDate(date)) return [];
  if ((s.blockedDates || []).includes(date)) return [];
  const extra = (s.extraDates || []).filter(x => x.date === date).flatMap(x => x.times || []);
  const inSeason = (!s.startDate || date >= s.startDate) && (!s.endDate || date <= s.endDate);
  const regular = inSeason && (s.weekdays || []).includes(weekdayOf(date)) ? (s.times || []) : [];
  return uniqSorted([...regular, ...extra]);
};

export type SlotState = 'open' | 'full' | 'closed' | 'past' | 'late';

export interface SlotView {
  time: string;
  capacity: number;
  booked: number;
  left: number;
  state: SlotState;
  bookable: boolean;
}

/** Situação de cada saída de uma data. `slots` = ocupação já gravada, por id. */
export const dayAvailability = (tour: Tour, date: string, slots: Record<string, Pick<TourSlot, 'booked' | 'closed'>>, now = new Date()): SlotView[] =>
  scheduledTimes(tour, date).map(time => {
    const s = slots[slotId(tour.id, date, time)];
    const booked = Math.max(0, s?.booked || 0);
    const left = Math.max(0, tour.capacityPerSlot - booked);
    const at = slotInstant(date, time);
    let state: SlotState = 'open';
    if (at <= now.getTime()) state = 'past';
    else if (at < now.getTime() + (tour.minNoticeHours || 0) * 3600_000) state = 'late';
    else if (s?.closed) state = 'closed';
    else if (left <= 0) state = 'full';
    return { time, capacity: tour.capacityPerSlot, booked, left, state, bookable: state === 'open' && left >= Math.max(1, tour.minPeople || 1) };
  });

export type DayStatus = 'none' | 'open' | 'full';

/** Estado de um dia no calendário: sem saída, com vaga ou lotado. */
export const dayStatus = (tour: Tour, date: string, slots: Record<string, Pick<TourSlot, 'booked' | 'closed'>>, now = new Date()): DayStatus => {
  const v = dayAvailability(tour, date, slots, now).filter(x => x.state !== 'past' && x.state !== 'late' && x.state !== 'closed');
  if (v.length === 0) return 'none';
  return v.some(x => x.bookable) ? 'open' : 'full';
};

/** Todas as datas (de hoje até `horizonDays` à frente) em que o passeio sai. */
export const departureDates = (tour: Tour, now = new Date(), horizonDays = 365): string[] => {
  const today = brtDate(now);
  const out: string[] = [];
  for (let i = 0; i <= horizonDays; i++) {
    const d = addDaysISO(today, i);
    if (scheduledTimes(tour, d).length > 0) out.push(d);
  }
  return out;
};

/** Próxima data com saída ainda reservável (descarta horários já passados e dentro da antecedência mínima). Ignora lotação. */
export const nextDeparture = (tour: Tour, now = new Date(), horizonDays = 120): string | undefined =>
  departureDates(tour, now, horizonDays).find(d => dayAvailability(tour, d, {}, now).some(x => x.state === 'open'));

export interface BookingInput {
  date: string; time: string; people: number; customerName: string; customerPhone: string; notes?: string; packageId?: string;
}
export type BookingErrors = Partial<Record<keyof BookingInput | 'slot', string>>;

/** Pacote escolhido na reserva (ou undefined se o passeio não tem pacotes ou o id não existe). */
export const findPackage = (t: Pick<Tour, 'packages'>, id?: string) => (t.packages || []).find(p => p.id === id);

export const cleanPhone = (p: string) => (p || '').replace(/\D/g, '');

/** Valida o pedido contra o passeio e a ocupação atual da saída. */
export const validateBooking = (tour: Tour, b: BookingInput, slot: Pick<TourSlot, 'booked' | 'closed'> | undefined, now = new Date()): BookingErrors => {
  const e: BookingErrors = {};
  if (tour.status !== 'published') e.slot = 'Este passeio não está recebendo reservas.';
  if (!isDate(b.date) || !isTime(b.time)) e.slot = 'Escolha a data e o horário.';
  else if (!scheduledTimes(tour, b.date).includes(b.time)) e.slot = 'Não há saída nesse dia e horário.';
  else {
    const v = dayAvailability(tour, b.date, slot ? { [slotId(tour.id, b.date, b.time)]: slot } : {}, now).find(x => x.time === b.time);
    if (!v || v.state === 'past') e.slot = 'Essa saída já passou.';
    else if (v.state === 'late') e.slot = `Reservas precisam de pelo menos ${tour.minNoticeHours} h de antecedência.`;
    else if (v.state === 'closed') e.slot = 'Essa saída está fechada para reservas.';
    else if (v.state === 'full' || v.left <= 0) e.slot = 'Essa saída está lotada.';
    else if (Number.isInteger(b.people) && b.people > v.left) e.people = `Só restam ${v.left} vaga${v.left === 1 ? '' : 's'} nessa saída.`;
  }
  if (!Number.isInteger(b.people) || b.people < 1) e.people = 'Informe quantas pessoas vão.';
  else if (b.people < (tour.minPeople || 1)) e.people = `Mínimo de ${tour.minPeople} pessoas para esse passeio.`;
  else if (b.people > (tour.maxPeoplePerBooking || tour.capacityPerSlot)) e.people = `Máximo de ${tour.maxPeoplePerBooking || tour.capacityPerSlot} pessoas por reserva.`;
  if ((tour.packages || []).length > 0 && !findPackage(tour, b.packageId)) e.packageId = 'Escolha o pacote.';
  if ((b.customerName || '').trim().length < 3) e.customerName = 'Informe seu nome.';
  const ph = cleanPhone(b.customerPhone);
  if (ph.length < 10 || ph.length > 13) e.customerPhone = 'Informe um WhatsApp com DDD.';
  if ((b.notes || '').length > 500) e.notes = 'Observações: no máximo 500 caracteres.';
  return e;
};

export type TourErrors = Partial<Record<'title' | 'shortDescription' | 'description' | 'meetingPoint' | 'operatorName' | 'operatorWhatsapp' | 'capacityPerSlot' | 'minPeople' | 'maxPeoplePerBooking' | 'schedule' | 'price' | 'coverImage' | 'packages', string>>;

/** Valida o cadastro de um passeio (admin). Para publicar exige tudo; rascunho exige só o título. */
export const validateTour = (t: Partial<Tour>, publish: boolean): TourErrors => {
  const e: TourErrors = {};
  if ((t.title || '').trim().length < 3) e.title = 'Informe o nome do passeio.';
  if (!publish) return e;
  if ((t.shortDescription || '').trim().length < 20) e.shortDescription = 'Resumo com pelo menos 20 caracteres.';
  if ((t.description || '').trim().length < 100) e.description = 'Descrição com pelo menos 100 caracteres.';
  if (!(t.coverImage || '').trim()) e.coverImage = 'Coloque uma foto de capa.';
  if (!(t.meetingPoint || '').trim()) e.meetingPoint = 'Informe o ponto de encontro.';
  if (!(t.operatorName || '').trim()) e.operatorName = 'Informe quem opera o passeio.';
  const ph = cleanPhone(t.operatorWhatsapp || '');
  if (ph.length < 10 || ph.length > 13) e.operatorWhatsapp = 'WhatsApp da operadora com DDD.';
  const cap = Number(t.capacityPerSlot);
  if (!Number.isInteger(cap) || cap < 1 || cap > 500) e.capacityPerSlot = 'Vagas por saída entre 1 e 500.';
  const min = Number(t.minPeople);
  if (!Number.isInteger(min) || min < 1 || min > cap) e.minPeople = 'Mínimo entre 1 e o total de vagas.';
  const max = Number(t.maxPeoplePerBooking);
  if (!Number.isInteger(max) || max < min || max > cap) e.maxPeoplePerBooking = 'Máximo por reserva entre o mínimo e o total de vagas.';
  if (t.price != null && !(Number(t.price) >= 0)) e.price = 'Preço inválido.';
  const pk = t.packages || [];
  if (pk.length > 4) e.packages = 'No máximo 4 pacotes.';
  else if (pk.some(x => (x.name || '').trim().length < 2 || !(Number(x.price) > 0))) e.packages = 'Cada pacote precisa de nome e preço maior que zero.';
  else if (new Set(pk.map(x => x.id)).size !== pk.length) e.packages = 'Pacotes repetidos.';
  const s = t.schedule;
  const hasRegular = !!s && (s.weekdays || []).length > 0 && (s.times || []).length > 0;
  const hasExtra = !!s && (s.extraDates || []).some(x => isDate(x.date) && (x.times || []).length > 0);
  if (!hasRegular && !hasExtra) e.schedule = 'Defina dias da semana e horários (ou uma data extra).';
  else if (s?.startDate && s?.endDate && s.endDate < s.startDate) e.schedule = 'A temporada termina antes de começar.';
  return e;
};

const brl = (n: number, min = 2) => `R$ ${n.toLocaleString('pt-BR', { minimumFractionDigits: min, maximumFractionDigits: 2 })}`;

/** Menor preço por pessoa entre os pacotes (ou o preço do passeio). */
export const minPrice = (t: Pick<Tour, 'price' | 'packages'>): number | undefined => {
  const prices = (t.packages || []).map(p => p.price).filter(n => n > 0);
  if (prices.length) return Math.min(...prices);
  return t.price != null && t.price > 0 ? t.price : undefined;
};

/** Texto do preço para exibir. Com pacotes: "A partir de R$ X por pessoa". */
export const priceLabel = (t: Pick<Tour, 'price' | 'priceNote' | 'packages' | 'pricingUnit' | 'unitName' | 'unitSize'>): string => {
  const m = minPrice(t);
  if (m == null) return t.priceNote || 'Consulte o valor';
  const v = brl(m, m % 1 ? 2 : 0);
  if (t.pricingUnit === 'vehicle') return `${v} por ${t.unitName || 'veículo'}${t.unitSize ? ` (até ${t.unitSize} pessoas)` : ''}`;
  return (t.packages || []).length > 1 ? `A partir de ${v} por pessoa` : `${v} por pessoa`;
};

/** Total estimado; com pacotes, usa o pacote escolhido. */
export const totalLabel = (t: Pick<Tour, 'price' | 'packages' | 'pricingUnit' | 'unitSize'>, people: number, packageId?: string): string | null => {
  const unit = (t.packages || []).length ? findPackage(t, packageId)?.price : t.price;
  const count = t.pricingUnit === 'vehicle' && (t.unitSize || 0) > 0 ? Math.ceil(people / (t.unitSize as number)) : people;
  return unit != null && unit > 0 && people > 0 ? brl(unit * count) : null;
};

export const formatDateBR = (date: string): string => {
  if (!isDate(date)) return date;
  const [y, m, d] = date.split('-');
  return `${WEEKDAYS[weekdayOf(date)]}, ${d}/${m}/${y}`;
};

/** Mensagem pronta para o WhatsApp da operadora. */
export const bookingWhatsappText = (b: Pick<TourBooking, 'tourTitle' | 'date' | 'time' | 'people' | 'customerName' | 'notes'> & Partial<Pick<TourBooking, 'packageName'>>): string =>
  [`Olá! Fiz um pedido de reserva pelo Lagos GO.`, ``, `Passeio: ${b.tourTitle}`, b.packageName ? `Pacote: ${b.packageName}` : '', `Data: ${formatDateBR(b.date)} às ${b.time}`,
    `Pessoas: ${b.people}`, `Nome: ${b.customerName}`, b.notes ? `Obs.: ${b.notes}` : '', ``, `Pode confirmar?`].filter((l, i, a) => l !== '' || a[i - 1] !== '').join('\n');

export const whatsappLink = (phone: string, text: string): string => {
  const p = cleanPhone(phone);
  const full = p.length <= 11 ? '55' + p : p;
  return `https://wa.me/${full}?text=${encodeURIComponent(text)}`;
};

/** Vagas ocupadas por reservas ativas (pendentes e confirmadas). */
export const activePeople = (bookings: Pick<TourBooking, 'status' | 'people'>[]) =>
  bookings.filter(b => b.status !== 'cancelled').reduce((n, b) => n + b.people, 0);

export type TourSort = 'proxima' | 'menor-preco';
export interface TourFilters { q?: string; cityId?: string; operator?: string; /** Só passeios com saída nos próximos N dias. */ withinDays?: number; sort?: TourSort; }

const fold = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Busca e filtros da lista pública de passeios (texto livre, cidade, operadora, saída em breve, ordem). */
export const filterTours = (tours: Tour[], f: TourFilters, cityName: (id: string) => string = () => '', now = new Date()): Tour[] => {
  const q = fold((f.q || '').trim());
  const next = (t: Tour) => nextDeparture(t, now);
  let out = tours.filter(t => {
    if (f.cityId && t.cityId !== f.cityId) return false;
    if (f.operator && t.operatorName !== f.operator) return false;
    if (q) {
      const hay = fold([t.title, t.shortDescription, t.operatorName, t.meetingPoint, cityName(t.cityId), ...(t.includes || [])].join(' '));
      if (!q.split(/\s+/).every(w => hay.includes(w))) return false;
    }
    if (f.withinDays) {
      const n = next(t);
      if (!n) return false;
      const limit = new Date(now); limit.setDate(limit.getDate() + f.withinDays);
      const pad = (v: number) => String(v).padStart(2, '0');
      if (n > `${limit.getFullYear()}-${pad(limit.getMonth() + 1)}-${pad(limit.getDate())}`) return false;
    }
    return true;
  });
  if (f.sort === 'menor-preco') out = [...out].sort((a, b) => (minPrice(a) ?? Infinity) - (minPrice(b) ?? Infinity));
  else if (f.sort === 'proxima') out = [...out].sort((a, b) => (next(a) || '9999').localeCompare(next(b) || '9999'));
  return out;
};
