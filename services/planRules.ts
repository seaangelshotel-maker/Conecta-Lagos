/**
 * Vencimento de plano — regras puras (sem Firebase), usadas no painel do admin e na rotina diária do servidor.
 * Plano vencido perde destaque e benefícios: a empresa volta para "sem plano" (os limites passam a ser os padrões do admin).
 */
export const FREE_PLAN_ID = 'free';

export interface PlanBiz {
  id?: string;
  plan?: string;
  isFeatured?: boolean;
  subscriptionEndsAt?: string;
  paymentSubscriptionStatus?: string;
}

/** Vencido: tem data de vencimento e ela já passou (vale o dia inteiro do vencimento, em UTC). */
export const isPlanExpired = (b: Pick<PlanBiz, 'subscriptionEndsAt'>, now: number = Date.now()): boolean => {
  if (!b.subscriptionEndsAt) return false;
  const t = Date.parse(b.subscriptionEndsAt);
  return Number.isFinite(t) && t < now;
};

/** Precisa rebaixar: venceu e ainda mantém plano pago ou destaque. */
export const needsDowngrade = (b: PlanBiz, now: number = Date.now()): boolean =>
  isPlanExpired(b, now) && ((!!b.plan && b.plan !== FREE_PLAN_ID) || !!b.isFeatured);

/** Campos gravados na empresa ao rebaixar. Guarda o plano anterior para o admin poder renovar depois. */
export const downgradeFields = (b: PlanBiz, nowIso: string) => ({
  plan: FREE_PLAN_ID,
  isFeatured: false,
  paymentSubscriptionStatus: 'expired',
  previousPlan: b.plan || null,
  planExpiredAt: nowIso,
});

/** Meses de cada prazo. Planos antigos 'monthly' continuam valendo 1 mês. */
export const periodMonths = (period?: string): number => (period === 'yearly' ? 12 : period === 'semiannual' ? 6 : 1);
export const periodLabel = (period?: string): string => (period === 'yearly' ? '1 ano' : period === 'semiannual' ? '6 meses' : '1 mês');
/** Total cobrado de uma vez (price é por mês). */
export const planTotal = (p: { price: number; period?: string }): number => Math.round(p.price * periodMonths(p.period) * 100) / 100;
/** Data de vencimento a partir de `from`, somando o prazo do plano. */
export const addPlanPeriod = (period: string | undefined, from: Date = new Date()): Date => {
  const d = new Date(from);
  d.setMonth(d.getMonth() + periodMonths(period));
  return d;
};
export const brl = (n: number): string => n.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
