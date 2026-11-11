/**
 * Regras puras da integração com o Asaas (sem Firebase), para poderem ser testadas isoladamente.
 * Documentação: https://docs.asaas.com/reference  ·  Webhook: cabeçalho asaas-access-token.
 */
import { timingSafeEqual } from 'crypto';

export const asaasBaseUrl = (env = process.env.ASAAS_ENV) =>
  env === 'production' ? 'https://api.asaas.com/v3' : 'https://api-sandbox.asaas.com/v3';

export const asaasConfigured = (e = process.env) =>
  e.PAYMENTS_ENABLED === 'true' && !!e.ASAAS_API_KEY && !!e.ASAAS_WEBHOOK_TOKEN;

const SEP = ':';
/** externalReference = userId:businessId:planId (gerado no servidor, nunca pelo navegador). */
export const buildReference = (userId: string, businessId: string, planId: string) => [userId, businessId, planId].join(SEP);
export const parseReference = (reference: string) => {
  const parts = String(reference || '').split(SEP);
  if (parts.length !== 3 || parts.some(p => !p)) return null;
  const [userId, businessId, planId] = parts;
  return { userId, businessId, planId };
};

/** Compara o token do webhook em tempo constante. */
export const isValidWebhookToken = (received: string | string[] | undefined, expected: string | undefined) => {
  const r = Array.isArray(received) ? received[0] : received;
  if (!r || !expected) return false;
  const a = Buffer.from(r, 'utf8'); const b = Buffer.from(expected, 'utf8');
  return a.length === b.length && timingSafeEqual(a, b);
};

export const PAID_STATUSES = ['RECEIVED', 'CONFIRMED', 'RECEIVED_IN_CASH'];
export const PAID_EVENTS = ['PAYMENT_RECEIVED', 'PAYMENT_CONFIRMED'];
export const REVERSAL_EVENTS = ['PAYMENT_REFUNDED', 'PAYMENT_CHARGEBACK_REQUESTED', 'PAYMENT_CHARGEBACK_DISPUTE', 'PAYMENT_REFUND_IN_PROGRESS'];

/** Só dígitos; CPF (11) ou CNPJ (14). */
export const cleanCpfCnpj = (v: unknown) => { const d = String(v || '').replace(/\D/g, ''); return d.length === 11 || d.length === 14 ? d : null; };

export const toCents = (v: unknown) => Math.round(Number(v || 0) * 100);

/** Vencimento da cobrança: hoje + N dias, no formato AAAA-MM-DD (horário de Brasília). */
export const dueDate = (days = 3, now = new Date()) => {
  const br = new Date(now.getTime() - 3 * 3600 * 1000);
  br.setUTCDate(br.getUTCDate() + days);
  return br.toISOString().slice(0, 10);
};

/** Meses do prazo (6 meses, 1 ano; 'monthly' só em planos antigos). */
export const planMonths = (period?: string) => (period === 'yearly' ? 12 : period === 'semiannual' ? 6 : 1);
/** Total cobrado: price é o valor por mês. */
export const planTotalValue = (plan: { price?: unknown; period?: string }) => Math.round(Number(plan.price) * planMonths(plan.period) * 100) / 100;

/** Fim do período do plano a partir do pagamento (mensal ou anual). Se ainda houver prazo, soma a partir dele. */
export const planEndsAt = (period: string | undefined, currentEnd?: string, now = new Date()) => {
  const start = currentEnd && new Date(currentEnd) > now ? new Date(currentEnd) : new Date(now);
  start.setUTCMonth(start.getUTCMonth() + planMonths(period));
  return start.toISOString();
};
