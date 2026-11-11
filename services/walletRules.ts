/**
 * Carteira de economia — regras puras (sem Firebase), testáveis.
 *
 * A economia só vira "economizada" quando o estabelecimento confirma o código de 6 dígitos
 * (resgate USED). Antes disso o cupom está "reservado" (PENDING): o cliente já pegou, ainda não usou.
 * Tudo é derivado dos resgates, que são a fonte de verdade: o usuário não consegue escrever o próprio saldo.
 */
import type { Coupon, CouponRedemption, PricingPlan, User } from '../types';
import { resolvePlan } from './eventRules';

export type WalletStatus = 'used' | 'reserved' | 'expired';

/** Campos de um resgate que a carteira usa (o documento guarda mais coisas). */
export type RedemptionView = Pick<CouponRedemption, 'id' | 'couponId' | 'couponTitle' | 'companyId' | 'amountSaved' | 'redeemedAt' | 'status' | 'verificationCode'> & {
  companyName?: string;
  expiryDate?: string;
  validatedAt?: string;
};

const cents = (n: number) => Math.round(n * 100) / 100;
const safeNumber = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) ? n : 0);

/** Quanto o cliente economiza com este cupom (sempre >= 0, em centavos). */
export const couponSaving = (c: Pick<Coupon, 'originalPrice' | 'discountedPrice'>): number =>
  Math.max(0, cents(safeNumber(c.originalPrice) - safeNumber(c.discountedPrice)));

export const percentOff = (c: Pick<Coupon, 'originalPrice' | 'discountedPrice'>): number => {
  const o = safeNumber(c.originalPrice);
  return o > 0 ? Math.round((couponSaving(c) / o) * 100) : 0;
};

export const formatBRL = (n: number): string =>
  `R$ ${cents(safeNumber(n)).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

/** Data (AAAA-MM-DD ou ISO) -> fim daquele dia, em UTC, como instante. Cupom vale o dia inteiro da validade. */
const endOfDay = (d: string): number => {
  const day = (d || '').slice(0, 10);
  const t = Date.parse(`${day}T23:59:59.999Z`);
  return Number.isNaN(t) ? Infinity : t;
};

export const isExpired = (expiryDate: string | undefined, now: number = Date.now()): boolean =>
  !!expiryDate && endOfDay(expiryDate) < now;

export const walletStatus = (r: Pick<RedemptionView, 'status' | 'expiryDate'>, now: number = Date.now()): WalletStatus => {
  if (r.status === 'USED') return 'used';
  if (r.status === 'EXPIRED' || isExpired(r.expiryDate, now)) return 'expired';
  return 'reserved';
};

export const WALLET_STATUS_LABEL: Record<WalletStatus, string> = {
  used: 'Usado',
  reserved: 'Aguardando uso',
  expired: 'Expirou',
};

export interface WalletSummary {
  /** Confirmado pelo estabelecimento. É o número que o app mostra como "você economizou". */
  saved: number;
  /** Cupons pegos e ainda dentro da validade. */
  reserved: number;
  usedCount: number;
  reservedCount: number;
  expiredCount: number;
}

export const walletSummary = (items: RedemptionView[], now: number = Date.now()): WalletSummary => {
  const s: WalletSummary = { saved: 0, reserved: 0, usedCount: 0, reservedCount: 0, expiredCount: 0 };
  for (const r of items) {
    const amount = Math.max(0, safeNumber(r.amountSaved));
    const st = walletStatus(r, now);
    if (st === 'used') { s.saved += amount; s.usedCount++; }
    else if (st === 'reserved') { s.reserved += amount; s.reservedCount++; }
    else s.expiredCount++;
  }
  s.saved = cents(s.saved);
  s.reserved = cents(s.reserved);
  return s;
};

/** Mais recentes primeiro; empata pelo id para a ordem ser estável. */
export const sortRedemptions = <T extends Pick<RedemptionView, 'id' | 'redeemedAt'>>(items: T[]): T[] =>
  [...items].sort((a, b) => (b.redeemedAt || '').localeCompare(a.redeemedAt || '') || a.id.localeCompare(b.id));

// ---------- conferência do código no balcão ----------

export const normalizeCode = (v: string | undefined | null): string => (v || '').replace(/\D/g, '');

export type CodeCheck = { ok: true } | { ok: false; reason: 'format' | 'mismatch' | 'used' | 'expired' };

/** O comerciante digitou o código que o cliente mostrou? Só então o resgate pode virar USED. */
export const checkRedemptionCode = (
  typed: string,
  r: Pick<RedemptionView, 'status' | 'verificationCode' | 'expiryDate'>,
  now: number = Date.now(),
): CodeCheck => {
  if (r.status === 'USED') return { ok: false, reason: 'used' };
  const code = normalizeCode(typed);
  if (code.length !== 6) return { ok: false, reason: 'format' };
  if (isExpired(r.expiryDate, now)) return { ok: false, reason: 'expired' };
  if (!r.verificationCode || code !== normalizeCode(r.verificationCode)) return { ok: false, reason: 'mismatch' };
  return { ok: true };
};

export const CODE_ERROR_MESSAGE: Record<'format' | 'mismatch' | 'used' | 'expired', string> = {
  format: 'Digite os 6 dígitos que o cliente mostrou.',
  mismatch: 'Código incorreto. Confira com o cliente e tente de novo.',
  used: 'Este cupom já foi utilizado.',
  expired: 'Este cupom já expirou.',
};

// ---------- painel do comerciante ----------

export interface MerchantImpact {
  /** Descontos que o estabelecimento já entregou (resgates confirmados). */
  given: number;
  usedCount: number;
  /** Clientes diferentes que usaram. */
  customers: number;
  pendingCount: number;
  pendingValue: number;
}

export const merchantImpact = (items: (RedemptionView & { userId?: string })[], now: number = Date.now()): MerchantImpact => {
  let given = 0, pendingValue = 0, usedCount = 0, pendingCount = 0;
  const who = new Set<string>();
  for (const r of items) {
    const amount = Math.max(0, safeNumber(r.amountSaved));
    const st = walletStatus(r, now);
    if (st === 'used') { given += amount; usedCount++; if (r.userId) who.add(r.userId); }
    else if (st === 'reserved') { pendingValue += amount; pendingCount++; }
  }
  return { given: cents(given), usedCount, customers: who.size, pendingCount, pendingValue: cents(pendingValue) };
};

// ---------- cota de cupons por plano ----------

const asCount = (n: unknown) => (typeof n === 'number' && Number.isFinite(n) && n >= 0 ? Math.floor(n) : undefined);

/**
 * Quantos cupons ativos o comerciante pode ter: a cota que o admin deu a ele, senão a do plano.
 * Sem nenhuma das duas, devolve null (sem limite) para não travar quem já usa o app sem plano definido.
 */
export const couponQuota = (
  user: Pick<User, 'maxCoupons' | 'plan'> | null | undefined,
  plans: PricingPlan[],
): number | null => asCount(user?.maxCoupons) ?? asCount(resolvePlan(plans, user?.plan)?.maxCoupons) ?? null;

/** Ocupa vaga: cupom ativo, não recusado e ainda dentro da validade. */
export const countsAgainstCouponQuota = (c: Pick<Coupon, 'active' | 'status' | 'expiryDate'>, now: number = Date.now()): boolean =>
  c.active !== false && c.status !== 'rejected' && !isExpired(c.expiryDate, now);

export const couponQuotaState = (coupons: Pick<Coupon, 'active' | 'status' | 'expiryDate'>[], quota: number | null, now: number = Date.now()) => {
  const used = coupons.filter(c => countsAgainstCouponQuota(c, now)).length;
  return { used, quota, canCreate: quota === null || used < quota };
};
