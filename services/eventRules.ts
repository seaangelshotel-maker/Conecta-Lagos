/**
 * Regras da Agenda de Eventos — funções puras (sem Firebase), cobertas por tests/eventRules.test.ts
 * e espelhadas em firestore.rules (validEventData / quem pode criar e editar).
 *
 * Princípios:
 * - A cidade do usuário só prioriza a ordem; nunca esconde eventos de outras cidades.
 * - Comerciante cria; o admin aprova. A cota vem do plano e o admin pode sobrepor por comerciante.
 */
import type { AppEvent, EventCategory, PricingPlan, User } from '../types';
import { REGION_MUNICIPALITIES, NEIGHBOR_IDS } from './regionGeo.js';
import { todayISO } from './opportunityRules.js';

export { todayISO };

export const EVENT_CATEGORIES: { id: EventCategory; label: string }[] = [
  { id: 'musica', label: 'Música e shows' },
  { id: 'gastronomia', label: 'Gastronomia' },
  { id: 'esporte', label: 'Esporte' },
  { id: 'cultura', label: 'Cultura' },
  { id: 'feira', label: 'Feiras' },
  { id: 'festa', label: 'Festas' },
  { id: 'turismo', label: 'Turismo e natureza' },
  { id: 'religioso', label: 'Religioso' },
  { id: 'outros', label: 'Outros' },
];

export const categoryLabel = (id?: string) => EVENT_CATEGORIES.find(c => c.id === id)?.label || 'Evento';

export const cityLabel = (id?: string) => REGION_MUNICIPALITIES.find(m => m.id === id)?.name || '';

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;
const HHMM = /^([01]\d|2[0-3]):[0-5]\d$/;

const MONTHS = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
const MONTHS_SHORT = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez'];
const WEEKDAYS = ['domingo', 'segunda', 'terça', 'quarta', 'quinta', 'sexta', 'sábado'];

/** AAAA-MM-DD -> Date ao meio-dia local (evita virar o dia por causa do fuso). */
const toDate = (iso: string) => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d, 12, 0, 0);
};
export const addDays = (iso: string, n: number) => {
  const d = toDate(iso);
  d.setDate(d.getDate() + n);
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mm}-${dd}`;
};
export const diffDays = (a: string, b: string) => Math.round((toDate(b).getTime() - toDate(a).getTime()) / 86400000);

export const eventEnd = (e: Pick<AppEvent, 'startDate' | 'endDate'>) => (e.endDate && e.endDate >= e.startDate ? e.endDate : e.startDate);

export type EventPhase = 'ongoing' | 'upcoming' | 'past';
export const eventPhase = (e: Pick<AppEvent, 'startDate' | 'endDate'>, today = todayISO()): EventPhase => {
  if (eventEnd(e) < today) return 'past';
  if (e.startDate <= today) return 'ongoing';
  return 'upcoming';
};

/** Só eventos publicados e não encerrados aparecem para o público na agenda padrão. */
export const isPublic = (e: Pick<AppEvent, 'status'>) => e.status === 'published';

/** "Hoje", "Amanhã", "Em 3 dias", "Acontecendo agora", "Encerrado". */
export const whenLabel = (e: Pick<AppEvent, 'startDate' | 'endDate'>, today = todayISO()): string => {
  const phase = eventPhase(e, today);
  if (phase === 'past') return 'Encerrado';
  if (phase === 'ongoing') return e.startDate === today && eventEnd(e) === today ? 'Hoje' : 'Acontecendo agora';
  const n = diffDays(today, e.startDate);
  if (n === 1) return 'Amanhã';
  if (n <= 14) return `Em ${n} dias`;
  return '';
};

export const dayParts = (iso: string) => {
  const d = toDate(iso);
  return { day: String(d.getDate()), month: MONTHS_SHORT[d.getMonth()].toUpperCase(), weekday: WEEKDAYS[d.getDay()] };
};

/** "13 a 15 nov", "28 nov", "30 dez a 2 jan". */
export const formatEventDates = (e: Pick<AppEvent, 'startDate' | 'endDate'>) => {
  const s = toDate(e.startDate);
  const end = eventEnd(e);
  if (end === e.startDate) return `${s.getDate()} ${MONTHS_SHORT[s.getMonth()]}`;
  const f = toDate(end);
  if (s.getMonth() === f.getMonth() && s.getFullYear() === f.getFullYear()) return `${s.getDate()} a ${f.getDate()} ${MONTHS_SHORT[f.getMonth()]}`;
  return `${s.getDate()} ${MONTHS_SHORT[s.getMonth()]} a ${f.getDate()} ${MONTHS_SHORT[f.getMonth()]}`;
};

export const formatEventTime = (e: Pick<AppEvent, 'startTime' | 'endTime'>) =>
  e.startTime ? (e.endTime ? `${e.startTime} às ${e.endTime}` : `a partir das ${e.startTime}`) : '';

export const monthKey = (iso: string) => iso.slice(0, 7);
export const monthLabel = (key: string) => {
  const [y, m] = key.split('-').map(Number);
  return `${MONTHS[m - 1][0].toUpperCase()}${MONTHS[m - 1].slice(1)} de ${y}`;
};

// ---------------------------------------------------------------------------
// Ordenação e filtros
// ---------------------------------------------------------------------------

/** 0 = mesma cidade, 1 = cidade vizinha, 2 = resto da região. Sem cidade conhecida, tudo é 2 (só a data manda). */
export const cityTier = (eventCityId: string, userCityId: string | null): 0 | 1 | 2 => {
  if (!userCityId) return 2;
  if (eventCityId === userCityId) return 0;
  return (NEIGHBOR_IDS[userCityId] || []).includes(eventCityId) ? 1 : 2;
};

/**
 * Agenda do público: só o que ainda não terminou. A cidade da pessoa sobe, as vizinhas vêm depois e o resto
 * da região segue — nada some. Dentro de cada grupo: destaques, depois por data.
 */
export const orderEvents = (events: AppEvent[], userCityId: string | null, today = todayISO()): AppEvent[] => {
  const key = (e: AppEvent) => [cityTier(e.cityId, userCityId), e.isFeatured ? 0 : 1, e.startDate, e.title.toLowerCase()] as const;
  return events
    .filter(e => isPublic(e) && eventPhase(e, today) !== 'past')
    .sort((a, b) => {
      const ka = key(a), kb = key(b);
      for (let i = 0; i < ka.length; i++) if (ka[i] !== kb[i]) return ka[i] < kb[i] ? -1 : 1;
      return 0;
    });
};

/** Ordem puramente cronológica (usada na agenda completa, agrupada por mês). */
export const sortByDate = (events: AppEvent[]) =>
  [...events].sort((a, b) => (a.startDate === b.startDate ? a.title.localeCompare(b.title, 'pt-BR') : a.startDate < b.startDate ? -1 : 1));

export type EventPeriod = 'all' | 'today' | 'weekend' | 'week' | 'month';
export const PERIODS: { id: EventPeriod; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'today', label: 'Hoje' },
  { id: 'weekend', label: 'Fim de semana' },
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mês' },
];

/** Intervalo [início, fim] do período, em datas AAAA-MM-DD. `null` = sem limite. */
export const periodRange = (period: EventPeriod, today = todayISO()): [string, string] | null => {
  const dow = toDate(today).getDay(); // 0 = domingo
  switch (period) {
    case 'today': return [today, today];
    case 'week': return [today, addDays(today, dow === 0 ? 0 : 7 - dow)];
    case 'weekend': {
      // sexta a domingo; de sexta em diante já começa hoje.
      const start = dow === 0 || dow >= 5 ? today : addDays(today, 5 - dow);
      return [start, addDays(today, dow === 0 ? 0 : 7 - dow)];
    }
    case 'month': {
      const [y, m] = today.split('-').map(Number);
      const last = new Date(y, m, 0).getDate();
      return [today, `${today.slice(0, 7)}-${String(last).padStart(2, '0')}`];
    }
    default: return null;
  }
};

export interface EventFilters { cityId?: string; category?: string; period?: EventPeriod; q?: string; }

const norm = (s: string) => s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

export const filterEvents = (events: AppEvent[], f: EventFilters, today = todayISO()): AppEvent[] => {
  const range = periodRange(f.period || 'all', today);
  const q = norm((f.q || '').trim());
  return events.filter(e => {
    if (f.cityId && e.cityId !== f.cityId) return false;
    if (f.category && e.category !== f.category) return false;
    if (range && !(e.startDate <= range[1] && eventEnd(e) >= range[0])) return false;
    if (q && !norm(`${e.title} ${e.description || ''} ${e.locationName || ''} ${e.businessName || ''} ${categoryLabel(e.category)} ${cityLabel(e.cityId)}`).includes(q)) return false;
    return true;
  });
};

export interface MonthGroup { key: string; label: string; events: AppEvent[]; }
/** Agrupa por mês de início (para um evento em andamento, o mês de hoje). Entrada deve estar ordenada por data. */
export const groupByMonth = (events: AppEvent[], today = todayISO()): MonthGroup[] => {
  const out: MonthGroup[] = [];
  for (const e of events) {
    const key = monthKey(e.startDate < today && eventEnd(e) >= today ? today : e.startDate);
    let g = out.find(x => x.key === key);
    if (!g) { g = { key, label: monthLabel(key), events: [] }; out.push(g); }
    g.events.push(e);
  }
  return out;
};

// ---------------------------------------------------------------------------
// Cota por plano
// ---------------------------------------------------------------------------

/** Plano do comerciante: casa por id ou por nome (os dados antigos misturam os dois). */
export const resolvePlan = (plans: PricingPlan[], ...refs: (string | undefined)[]): PricingPlan | undefined => {
  for (const r of refs) {
    if (!r) continue;
    const hit = plans.find(p => p.id === r) || plans.find(p => (p.name || '').toLowerCase() === r.toLowerCase());
    if (hit) return hit;
  }
  return undefined;
};

const asCount = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined);

/** Quantos eventos ativos o comerciante pode ter: a cota do admin sobre ele, senão a do plano, senão 0. */
export const eventQuota = (user: Pick<User, 'maxEvents'> | null | undefined, plan: Pick<PricingPlan, 'maxEvents'> | undefined | null, fallback?: number | null): number =>
  asCount(user?.maxEvents) ?? asCount(plan?.maxEvents) ?? asCount(fallback) ?? 0;

/** Eventos que ocupam a cota: pendentes ou publicados que ainda não terminaram. Cancelados e encerrados liberam vaga. */
export const countsAgainstQuota = (e: Pick<AppEvent, 'status' | 'startDate' | 'endDate'>, today = todayISO()) =>
  (e.status === 'pending' || e.status === 'published') && eventEnd(e) >= today;

export const activeEventCount = (events: AppEvent[], today = todayISO()) => events.filter(e => countsAgainstQuota(e, today)).length;

export const quotaState = (events: AppEvent[], quota: number, today = todayISO()) => {
  const used = activeEventCount(events, today);
  return { used, quota, left: Math.max(0, quota - used), canCreate: used < quota };
};

// ---------------------------------------------------------------------------
// Validação
// ---------------------------------------------------------------------------

export interface EventInput {
  title: string; description?: string; category: string; startDate: string; endDate?: string;
  startTime?: string; endTime?: string; cityId: string; locationName?: string; address?: string;
  infoUrl?: string; ticketUrl?: string; priceText?: string; isFree?: boolean;
}
export type EventErrors = Partial<Record<keyof EventInput, string>>;

const isUrl = (u: string) => { try { const x = new URL(u); return x.protocol === 'https:' || x.protocol === 'http:'; } catch { return false; } };

/** `allowPast`: o admin pode registrar eventos que já passaram (importação do calendário). */
export const validateEvent = (i: EventInput, today = todayISO(), allowPast = false): EventErrors => {
  const e: EventErrors = {};
  const title = (i.title || '').trim();
  if (title.length < 3) e.title = 'O título precisa ter pelo menos 3 caracteres.';
  else if (title.length > 100) e.title = 'O título pode ter no máximo 100 caracteres.';
  if ((i.description || '').length > 2000) e.description = 'A descrição pode ter no máximo 2000 caracteres.';
  if (!EVENT_CATEGORIES.some(c => c.id === i.category)) e.category = 'Escolha uma categoria.';
  if (!REGION_MUNICIPALITIES.some(m => m.id === i.cityId)) e.cityId = 'Escolha a cidade do evento.';
  if (!ISO_DATE.test(i.startDate || '')) e.startDate = 'Informe a data de início.';
  else if (!allowPast && i.startDate < today) e.startDate = 'A data de início não pode estar no passado.';
  if (i.endDate) {
    if (!ISO_DATE.test(i.endDate)) e.endDate = 'Data de término inválida.';
    else if (ISO_DATE.test(i.startDate || '') && i.endDate < i.startDate) e.endDate = 'O término não pode ser antes do início.';
  }
  if (i.startTime && !HHMM.test(i.startTime)) e.startTime = 'Use o formato HH:MM.';
  if (i.endTime && !HHMM.test(i.endTime)) e.endTime = 'Use o formato HH:MM.';
  if (i.infoUrl && !isUrl(i.infoUrl)) e.infoUrl = 'Link inválido (use https://...).';
  if (i.ticketUrl && !isUrl(i.ticketUrl)) e.ticketUrl = 'Link inválido (use https://...).';
  if ((i.priceText || '').length > 80) e.priceText = 'O texto de preço pode ter no máximo 80 caracteres.';
  if ((i.locationName || '').length > 120) e.locationName = 'O nome do local pode ter no máximo 120 caracteres.';
  return e;
};

/** Campos que o comerciante pode ajustar sem voltar para a aprovação (não mudam o que foi aprovado). Espelha firestore.rules. */
export const MINOR_EVENT_KEYS = ['coverImage', 'infoUrl', 'ticketUrl', 'priceText', 'isFree', 'locationName', 'address', 'startTime', 'endTime', 'updatedAt'] as const;

/** Edição de evento já publicado: mudança de título, descrição, data, cidade ou categoria volta para análise. */
export const needsReapproval = (prev: AppEvent, next: Partial<AppEvent>): boolean => {
  if (prev.status !== 'published') return false;
  const keys = Object.keys(next) as (keyof AppEvent)[];
  return keys.some(k => !(MINOR_EVENT_KEYS as readonly string[]).includes(k) && JSON.stringify((next as any)[k] ?? null) !== JSON.stringify((prev as any)[k] ?? null));
};

// ---------------------------------------------------------------------------
// Calendário (.ics) e compartilhamento
// ---------------------------------------------------------------------------

const icsEscape = (s: string) => s.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
const compact = (iso: string) => iso.replace(/-/g, '');

/** Arquivo .ics para "adicionar à agenda". Sem horário = dia inteiro (término exclusivo, como manda o formato). */
export const buildICS = (e: AppEvent, now = new Date()): string => {
  const stamp = now.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const end = eventEnd(e);
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Lagos GO//Agenda//PT-BR', 'BEGIN:VEVENT', `UID:${e.id}@lagosgo`, `DTSTAMP:${stamp}`];
  if (e.startTime && HHMM.test(e.startTime)) {
    const endTime = e.endTime && HHMM.test(e.endTime) ? e.endTime : e.startTime;
    lines.push(`DTSTART:${compact(e.startDate)}T${e.startTime.replace(':', '')}00`);
    lines.push(`DTEND:${compact(end)}T${endTime.replace(':', '')}00`);
  } else {
    lines.push(`DTSTART;VALUE=DATE:${compact(e.startDate)}`);
    lines.push(`DTEND;VALUE=DATE:${compact(addDays(end, 1))}`);
  }
  lines.push(`SUMMARY:${icsEscape(e.title)}`);
  const where = [e.locationName, e.address, cityLabel(e.cityId)].filter(Boolean).join(' - ');
  if (where) lines.push(`LOCATION:${icsEscape(where)}`);
  if (e.description) lines.push(`DESCRIPTION:${icsEscape(e.description)}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n') + '\r\n';
};

// ---------------------------------------------------------------------------
// "Adicionar à agenda" direto no celular (sem baixar arquivo)
// ---------------------------------------------------------------------------

const eventWhere = (e: AppEvent) => [e.locationName, e.address, cityLabel(e.cityId)].filter(Boolean).join(' - ');

/** Início/fim do evento em milissegundos (horário de Brasília, UTC-3). Sem horário = dia inteiro (fim exclusivo, em UTC). */
export const eventTimes = (e: AppEvent): { start: number; end: number; allDay: boolean } => {
  const end = eventEnd(e);
  if (e.startTime && HHMM.test(e.startTime)) {
    const endTime = e.endTime && HHMM.test(e.endTime) ? e.endTime : e.startTime;
    return { start: Date.parse(`${e.startDate}T${e.startTime}:00-03:00`), end: Date.parse(`${end}T${endTime}:00-03:00`), allDay: false };
  }
  return { start: Date.parse(`${e.startDate}T00:00:00Z`), end: Date.parse(`${addDays(end, 1)}T00:00:00Z`), allDay: true };
};

/** Android (Chrome): abre o app de agenda do aparelho, seja qual for (Google, Samsung...), com o evento preenchido. */
export const androidCalendarIntent = (e: AppEvent): string => {
  const t = eventTimes(e);
  const parts = [
    'action=android.intent.action.INSERT', 'type=vnd.android.cursor.dir/event',
    `S.title=${encodeURIComponent(e.title)}`, `l.beginTime=${t.start}`, `l.endTime=${t.end}`,
  ];
  if (t.allDay) parts.push('B.allDay=true');
  const where = eventWhere(e); if (where) parts.push(`S.eventLocation=${encodeURIComponent(where)}`);
  if (e.description) parts.push(`S.description=${encodeURIComponent(e.description.slice(0, 800))}`);
  return `intent:#Intent;${parts.join(';')};end`;
};

/** Link do Google Agenda (abre o app se estiver instalado, senão o site). Serve para outros navegadores no Android. */
export const googleCalendarUrl = (e: AppEvent): string => {
  const t = eventTimes(e);
  const fmt = (ms: number, allDay: boolean) => {
    const iso = new Date(ms).toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
    return allDay ? iso.slice(0, 8) : iso;
  };
  const q = new URLSearchParams({ action: 'TEMPLATE', text: e.title, dates: `${fmt(t.start, t.allDay)}/${fmt(t.end, t.allDay)}` });
  const where = eventWhere(e); if (where) q.set('location', where);
  if (e.description) q.set('details', e.description.slice(0, 1500));
  return `https://calendar.google.com/calendar/render?${q.toString()}`;
};
