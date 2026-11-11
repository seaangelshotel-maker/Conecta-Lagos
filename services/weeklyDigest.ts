/**
 * Aviso semanal — regras puras (sem Firebase), testáveis.
 * Monta, a partir dos eventos publicados e dos cupons ativos, o texto para colar no WhatsApp
 * e o título/corpo do push. Nada é inventado: só entra o que existe no app e ainda vale.
 */
import type { AppEvent, Coupon } from '../types';
import { cityLabel, filterEvents, formatEventDates, formatEventTime, isPublic, sortByDate, periodRange } from './eventRules';
import { couponSaving, formatBRL, isExpired, percentOff } from './walletRules';
import { todayISO } from './opportunityRules';
import { APP_URL } from './appConfig';


export interface DigestInput {
  events: AppEvent[];
  coupons: Coupon[];
  today?: string;
  now?: number;
  maxEvents?: number;
  maxCoupons?: number;
}

export interface Digest {
  text: string;
  push: { title: string; body: string; link: string };
  eventCount: number;
  couponCount: number;
  empty: boolean;
}

/** Cupom ainda vale para o público: ativo, aprovado (ou legado sem status), dentro da validade e com saldo. */
export const isCouponLive = (c: Coupon, now: number = Date.now()): boolean =>
  c.active !== false &&
  (!c.status || c.status === 'approved') &&
  !isExpired(c.expiryDate, now) &&
  !(typeof c.maxRedemptions === 'number' && c.maxRedemptions > 0 && (c.currentRedemptions || 0) >= c.maxRedemptions) &&
  couponSaving(c) > 0;

/** Eventos que acontecem no próximo fim de semana (sexta a domingo), em ordem de data. */
export const weekendEvents = (events: AppEvent[], today: string = todayISO()): AppEvent[] =>
  sortByDate(filterEvents(events.filter(isPublic), { period: 'weekend' }, today));

/** Cupons com maior economia em reais, no máximo um por estabelecimento (variedade). */
export const topCoupons = (coupons: Coupon[], max = 3, now: number = Date.now()): Coupon[] => {
  const live = coupons.filter(c => isCouponLive(c, now)).sort((a, b) => couponSaving(b) - couponSaving(a) || a.title.localeCompare(b.title, 'pt-BR'));
  const seen = new Set<string>();
  const out: Coupon[] = [];
  for (const c of live) {
    if (seen.has(c.companyId)) continue;
    seen.add(c.companyId);
    out.push(c);
    if (out.length >= max) break;
  }
  return out;
};

const eventLine = (e: AppEvent): string => {
  const place = [e.locationName, cityLabel(e.cityId)].filter(Boolean).join(', ');
  const time = formatEventTime(e);
  const price = e.isFree ? 'grátis' : e.priceText || '';
  const extra = [time, price].filter(Boolean).join(' · ');
  return `• ${formatEventDates(e)} — ${e.title}${place ? ` (${place})` : ''}${extra ? ` · ${extra}` : ''}`;
};

const couponLine = (c: Coupon): string =>
  `• ${c.companyName}: ${c.title} — economize ${formatBRL(couponSaving(c))} (${percentOff(c)}% off)`;

export const buildWeeklyDigest = (i: DigestInput): Digest => {
  const today = i.today || todayISO();
  const now = i.now ?? Date.now();
  const maxEvents = i.maxEvents ?? 5;
  const maxCoupons = i.maxCoupons ?? 3;

  const allEvents = weekendEvents(i.events, today);
  const evs = allEvents.slice(0, maxEvents);
  const cps = topCoupons(i.coupons, maxCoupons, now);
  const range = periodRange('weekend', today);
  const ongoing = range ? range[0] === today : false;

  const parts: string[] = [`🌴 *Lagos GO — ${ongoing ? 'neste fim de semana' : 'o fim de semana na Região dos Lagos'}*`];
  if (evs.length) {
    parts.push('', '🎉 *Agenda*', ...evs.map(eventLine));
    if (allEvents.length > evs.length) parts.push(`+ ${allEvents.length - evs.length} no app`);
  }
  if (cps.length) {
    parts.push('', '💸 *Cupons para economizar*', ...cps.map(couponLine));
  }
  const empty = !evs.length && !cps.length;
  if (!empty) parts.push('', `Veja tudo e pegue seus cupons: ${APP_URL}/eventos`);

  const best = cps.length ? couponSaving(cps[0]) : 0;
  const title = evs.length ? `${evs.length === 1 ? '1 evento' : `${allEvents.length} eventos`} no fim de semana` : 'Cupons da semana';
  const bodyBits: string[] = [];
  if (evs.length) bodyBits.push(evs[0].title + (allEvents.length > 1 ? ` e mais ${allEvents.length - 1}` : ''));
  if (cps.length) bodyBits.push(`cupons com até ${formatBRL(best)} de economia`);

  return {
    text: empty ? '' : parts.join('\n'),
    push: { title: title.slice(0, 80), body: (bodyBits.join(' · ') || '').slice(0, 240), link: evs.length ? '/eventos' : '/' },
    eventCount: allEvents.length,
    couponCount: cps.length,
    empty,
  };
};
