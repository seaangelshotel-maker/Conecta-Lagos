/**
 * Confirmação de resgates de cupom — regras puras (sem Firebase), testáveis.
 *
 * Fluxo: o cliente reserva o cupom, usa na loja e toca em "Já usei" (usedClaimedAt).
 * A empresa confirma (código no painel ou botão no e-mail) ou diz que não foi usado.
 * Se ela não responder em 72h, o sistema confirma sozinho (confirmedBy = 'auto'),
 * e ainda dá 7 dias para ela contestar. Quem não marcou "Já usei" nunca é confirmado sozinho.
 */
export const AUTO_CONFIRM_HOURS = 72;
export const REMINDER_HOURS = 48;
export const CONTEST_DAYS = 7;

const HOUR = 3_600_000;
const DAY = 24 * HOUR;

export interface RedemptionFlow {
  status?: string;
  usedClaimedAt?: string;
  confirmedBy?: string;
  autoConfirmedAt?: string;
  reminderSentAt?: string;
}

const ts = (iso?: string): number => {
  const t = iso ? Date.parse(iso) : NaN;
  return Number.isNaN(t) ? NaN : t;
};

/** O cliente avisou que usou e ninguém decidiu ainda. */
export const isAwaitingCompany = (r: RedemptionFlow): boolean => r.status === 'PENDING' && !!r.usedClaimedAt;

/** Prazo final para a empresa decidir antes da confirmação automática (ISO), ou null. */
export const autoConfirmDeadline = (r: RedemptionFlow): string | null => {
  const t = ts(r.usedClaimedAt);
  return Number.isNaN(t) ? null : new Date(t + AUTO_CONFIRM_HOURS * HOUR).toISOString();
};

export const isAutoConfirmDue = (r: RedemptionFlow, now: number = Date.now()): boolean => {
  if (!isAwaitingCompany(r)) return false;
  const t = ts(r.usedClaimedAt);
  return !Number.isNaN(t) && now - t >= AUTO_CONFIRM_HOURS * HOUR;
};

/** Lembrete 48h depois do aviso do cliente (uma vez só), antes de chegar às 72h. */
export const isReminderDue = (r: RedemptionFlow, now: number = Date.now()): boolean => {
  if (!isAwaitingCompany(r) || r.reminderSentAt) return false;
  const t = ts(r.usedClaimedAt);
  if (Number.isNaN(t)) return false;
  const age = now - t;
  return age >= REMINDER_HOURS * HOUR && age < AUTO_CONFIRM_HOURS * HOUR;
};

/** A empresa ainda pode contestar uma confirmação automática (7 dias). */
export const canContest = (r: RedemptionFlow, now: number = Date.now()): boolean => {
  if (r.status !== 'USED' || r.confirmedBy !== 'auto') return false;
  const t = ts(r.autoConfirmedAt);
  return !Number.isNaN(t) && now - t <= CONTEST_DAYS * DAY;
};

/** Recusa só vale para resgates aguardando, ou confirmados automaticamente dentro da janela de contestação. */
export const canRefuse = (r: RedemptionFlow, now: number = Date.now()): boolean =>
  r.status === 'PENDING' || canContest(r, now);

export const REFUSE_REASON_MAX = 200;
export const cleanReason = (v: unknown): string => String(v ?? '').replace(/[\r\n]+/g, ' ').trim().slice(0, REFUSE_REASON_MAX);
