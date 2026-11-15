/**
 * Gerador de avisos (push) por categoria — regras puras, sem Firebase, testáveis.
 * Monta título (até 80), texto (até 240) e link a partir do que existe de verdade no app e ainda vale.
 * Nada é inventado: sem conteúdo, devolve `empty` com o motivo em português.
 */
import type { AppEvent, BlogPost, Coupon, Opportunity } from '../types';
import { cityLabel, eventPhase, filterEvents, formatEventDates, formatEventTime, isPublic, sortByDate, type EventPeriod } from './eventRules.js';
import { couponSaving, formatBRL, percentOff } from './walletRules.js';
import { isCouponLive } from './weeklyDigest.js';
import { isAvailable, todayISO } from './opportunityRules.js';

export type PushTopicId = 'cupons' | 'materias' | 'eventos' | 'ajuda';

export const GENERATORS = [
  { id: 'eventos-fim-de-semana', topic: 'eventos', label: 'Eventos do fim de semana', hint: 'Agenda de sexta a domingo' },
  { id: 'eventos-semana', topic: 'eventos', label: 'Eventos da semana', hint: 'Do dia de hoje até domingo' },
  { id: 'eventos-hoje', topic: 'eventos', label: 'Eventos de hoje', hint: 'O que acontece hoje' },
  { id: 'cupons-economia', topic: 'cupons', label: 'Cupons que mais economizam', hint: 'Os maiores descontos em reais' },
  { id: 'cupons-acabando', topic: 'cupons', label: 'Cupons acabando', hint: 'Vencem nos próximos 3 dias' },
  { id: 'noticia', topic: 'materias', label: 'Última notícia', hint: 'Matéria mais recente do Feed' },
  { id: 'dica', topic: 'materias', label: 'Última dica', hint: 'Dica útil mais recente' },
  { id: 'ajuda', topic: 'ajuda', label: 'Ajuda Colaborativa', hint: 'Oportunidades novas dos últimos 7 dias' },
] as const;
export type GeneratorId = typeof GENERATORS[number]['id'];

export interface PushDraft {
  kind: GeneratorId;
  topic: PushTopicId;
  title: string;
  body: string;
  link: string;
  count: number;
  empty: boolean;
  /** Quando `empty`, o porquê (para o admin entender). */
  reason?: string;
}

export interface GeneratorInput {
  events?: AppEvent[];
  coupons?: Coupon[];
  posts?: BlogPost[];
  opportunities?: Opportunity[];
  today?: string;
  now?: number;
}

export const TITLE_MAX = 80;
export const BODY_MAX = 240;

/** Corta em limite de caracteres sem deixar palavra pela metade (reticências no fim). */
export const clip = (s: string, max: number): string => {
  const t = s.replace(/\s+/g, ' ').trim();
  if (t.length <= max) return t;
  const cut = t.slice(0, max - 1);
  const sp = cut.lastIndexOf(' ');
  return (sp > max * 0.6 ? cut.slice(0, sp) : cut).replace(/[\s,;:.\-–—]+$/, '') + '…';
};

const topicOf = (id: GeneratorId): PushTopicId => GENERATORS.find(g => g.id === id)!.topic;

const empty = (kind: GeneratorId, reason: string): PushDraft =>
  ({ kind, topic: topicOf(kind), title: '', body: '', link: '/', count: 0, empty: true, reason });

const make = (kind: GeneratorId, title: string, body: string, link: string, count: number): PushDraft =>
  ({ kind, topic: topicOf(kind), title: clip(title, TITLE_MAX), body: clip(body, BODY_MAX), link, count, empty: false });

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many);

// ── Eventos ───────────────────────────────────────────────
const eventsFor = (events: AppEvent[], period: EventPeriod, today: string) =>
  sortByDate(filterEvents(events.filter(isPublic), { period }, today).filter(e => eventPhase(e, today) !== 'past'));

const eventBits = (e: AppEvent): string => {
  const place = [e.locationName, cityLabel(e.cityId)].filter(Boolean).join(', ');
  const time = formatEventTime(e);
  const price = e.isFree ? 'grátis' : e.priceText || '';
  return [e.title, [formatEventDates(e), time].filter(Boolean).join(' '), place, price].filter(Boolean).join(' · ');
};

const eventsDraft = (kind: GeneratorId, period: EventPeriod, when: string, i: GeneratorInput): PushDraft => {
  const today = i.today || todayISO();
  const list = eventsFor(i.events || [], period, today);
  if (!list.length) return empty(kind, `Não há eventos publicados para ${when}.`);
  const first = list[0];
  const more = list.length - 1;
  const title = list.length === 1 ? `1 evento ${when}` : `${list.length} eventos ${when}`;
  const body = list.length === 1 ? eventBits(first) : `${eventBits(first)} e mais ${more} ${plural(more, 'evento', 'eventos')}`;
  return make(kind, title, body, list.length === 1 ? `/eventos/${first.id}` : '/eventos', list.length);
};

// ── Cupons ────────────────────────────────────────────────
const couponDraft = (kind: GeneratorId, i: GeneratorInput): PushDraft => {
  const now = i.now ?? Date.now();
  const live = (i.coupons || []).filter(c => isCouponLive(c, now));
  if (kind === 'cupons-acabando') {
    const horizon = now + 3 * 86400000;
    const soon = live
      .filter(c => c.expiryDate && Date.parse(c.expiryDate) <= horizon)
      .sort((a, b) => Date.parse(a.expiryDate!) - Date.parse(b.expiryDate!));
    if (!soon.length) return empty(kind, 'Nenhum cupom ativo vence nos próximos 3 dias.');
    const c = soon[0];
    const more = soon.length - 1;
    return make(kind, 'Cupom acabando!',
      `${c.companyName}: ${c.title} — economize ${formatBRL(couponSaving(c))}${more > 0 ? ` e mais ${more} ${plural(more, 'cupom', 'cupons')} acabando` : ''}`,
      '/search', soon.length);
  }
  const best = [...live].sort((a, b) => couponSaving(b) - couponSaving(a) || a.title.localeCompare(b.title, 'pt-BR'));
  if (!best.length) return empty(kind, 'Não há cupons ativos com desconto no momento.');
  const c = best[0];
  const more = best.length - 1;
  return make(kind, `Economize até ${formatBRL(couponSaving(c))} hoje`,
    `${c.companyName}: ${c.title} (${percentOff(c)}% off)${more > 0 ? ` e mais ${more} ${plural(more, 'cupom', 'cupons')}` : ''}`,
    '/search', best.length);
};

// ── Matérias e dicas ──────────────────────────────────────
const NEWS = 'Notícias';
const TIPS = 'Dicas Úteis';
const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

const postDraft = (kind: GeneratorId, category: string, label: string, i: GeneratorInput): PushDraft => {
  const list = (i.posts || [])
    .filter(p => p.kind !== 'guia' && p.status !== 'draft' && norm(p.category || '') === norm(category))
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  if (!list.length) return empty(kind, `Não há ${label} publicada no Feed.`);
  const p = list[0];
  return make(kind, p.title, p.excerpt || p.subtitle || p.title, `/blog/${encodeURIComponent(p.id)}`, list.length);
};

// ── Ajuda Colaborativa ───────────────────────────────────
const helpDraft = (i: GeneratorInput): PushDraft => {
  const today = i.today || todayISO();
  const now = i.now ?? Date.now();
  const since = now - 7 * 86400000;
  const list = (i.opportunities || [])
    .filter(o => isAvailable(o, today) && o.publishedAt && Date.parse(o.publishedAt) >= since)
    .sort((a, b) => (b.publishedAt || '').localeCompare(a.publishedAt || ''));
  if (!list.length) return empty('ajuda', 'Nenhuma oportunidade nova nos últimos 7 dias.');
  const o = list[0];
  const more = list.length - 1;
  const place = o.cityName || '';
  const first = [o.title, place].filter(Boolean).join(' · ');
  return make('ajuda', list.length === 1 ? 'Nova oportunidade na Ajuda Colaborativa' : `${list.length} oportunidades novas na Ajuda Colaborativa`,
    `${first}${more > 0 ? ` e mais ${more}` : ''}`,
    list.length === 1 ? `/ajuda/${o.id}` : '/ajuda', list.length);
};

export const generatePush = (kind: GeneratorId, i: GeneratorInput): PushDraft => {
  switch (kind) {
    case 'eventos-fim-de-semana': return eventsDraft(kind, 'weekend', 'neste fim de semana', i);
    case 'eventos-semana': return eventsDraft(kind, 'week', 'nesta semana', i);
    case 'eventos-hoje': return eventsDraft(kind, 'today', 'hoje', i);
    case 'cupons-economia':
    case 'cupons-acabando': return couponDraft(kind, i);
    case 'noticia': return postDraft(kind, NEWS, 'notícia', i);
    case 'dica': return postDraft(kind, TIPS, 'dica', i);
    case 'ajuda': return helpDraft(i);
  }
};
