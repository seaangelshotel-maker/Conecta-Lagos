/**
 * Pontos e nível do usuário (Lagos GO) — regras puras, sem Firebase, testáveis.
 *
 * Os pontos são DERIVADOS de eventos que o sistema já confirmou (hoje: cupom confirmado pelo
 * estabelecimento). O usuário não escreve o próprio saldo. Começa difícil de propósito: valores
 * baixos e teto mensal, para não gerar custo e deixar espaço para ajustar depois.
 */
import type { RedemptionView } from './walletRules';
import { walletStatus } from './walletRules';

export interface EarnRule {
  id: string;
  title: string;
  hint: string;
  /** Texto curto do ganho, ex.: "10 pontos". */
  reward: string;
  /** Limite, quando existe. */
  limit?: string;
  /** false = regra anunciada, ainda sem contagem automática. */
  active: boolean;
}

export const POINTS_PER_COUPON = 10;
export const MONTHLY_CAP = 100;

export const EARN_RULES: EarnRule[] = [
  { id: 'coupon', title: 'Usar um cupom', hint: 'Vale quando o estabelecimento confirma o código.', reward: '10 pontos', limit: 'Até 100 pontos por mês', active: true },
  { id: 'tour', title: 'Comprar um passeio com a Guida Trips', hint: 'Entra depois que o passeio acontece.', reward: '1 ponto a cada R$ 10', active: false },
  { id: 'share', title: 'Convidar um amigo', hint: 'Só conta quando o amigo instala e se cadastra pelo seu link.', reward: '5 pontos', limit: 'Até 3 por semana', active: false },
  { id: 'review', title: 'Avaliar um lugar onde você esteve', hint: 'Com check-in no local.', reward: '5 pontos', limit: '1 por lugar a cada mês', active: false },
  { id: 'profile', title: 'Completar o cadastro', hint: 'Foto, nome e cidade.', reward: '10 pontos', limit: 'Uma vez só', active: false },
];

export interface Level {
  id: 'explorador' | 'viajante' | 'local' | 'embaixador';
  name: string;
  min: number;
  /** Descrição curta do que o nível representa (reputação). */
  tagline: string;
  /** Benefício do nível (só o que o Lagos GO já pode cumprir). */
  perk: string;
}

export const LEVELS: Level[] = [
  { id: 'explorador', name: 'Explorador', min: 0, tagline: 'Acabou de chegar e já está descobrindo a região.', perk: 'Acesso a todos os cupons públicos.' },
  { id: 'viajante', name: 'Viajante', min: 50, tagline: 'Já usa o guia para decidir onde ir.', perk: 'Selo no perfil e destaque nas avaliações.' },
  { id: 'local', name: 'Local', min: 150, tagline: 'Conhece a região e aproveita as vantagens.', perk: 'Cupons exclusivos liberados por parceiros.' },
  { id: 'embaixador', name: 'Embaixador', min: 400, tagline: 'Referência: quem indica, o povo segue.', perk: 'Acesso antecipado a cupons e sorteios dos parceiros.' },
];

const monthOf = (iso?: string) => (iso || '').slice(0, 7);

/** Pontos ganhos por cupons confirmados, respeitando o teto mensal (mês do resgate). */
export const couponPoints = (items: RedemptionView[], now: number = Date.now()): number => {
  const perMonth = new Map<string, number>();
  for (const r of items) {
    if (walletStatus(r, now) !== 'used') continue;
    const m = monthOf(r.validatedAt || r.redeemedAt);
    perMonth.set(m, (perMonth.get(m) || 0) + POINTS_PER_COUPON);
  }
  let total = 0;
  for (const v of perMonth.values()) total += Math.min(v, MONTHLY_CAP);
  return total;
};

export const levelFor = (points: number): Level => {
  const p = Math.max(0, Math.floor(points) || 0);
  let cur = LEVELS[0];
  for (const l of LEVELS) if (p >= l.min) cur = l;
  return cur;
};

export interface LevelProgress {
  level: Level;
  next: Level | null;
  points: number;
  /** 0..100 dentro do nível atual. */
  percent: number;
  missing: number;
}

export const levelProgress = (points: number): LevelProgress => {
  const p = Math.max(0, Math.floor(points) || 0);
  const level = levelFor(p);
  const idx = LEVELS.findIndex(l => l.id === level.id);
  const next = LEVELS[idx + 1] || null;
  if (!next) return { level, next: null, points: p, percent: 100, missing: 0 };
  const span = next.min - level.min;
  return { level, next, points: p, percent: Math.min(100, Math.round(((p - level.min) / span) * 100)), missing: next.min - p };
};

export interface MonthLine {
  month: string; // AAAA-MM
  coupons: number;
  raw: number;
  counted: number;
  capped: boolean;
}

/** Conta mês a mês: cupons confirmados × 10, limitado ao teto. Mostra ao usuário como o total foi calculado. */
export const couponBreakdown = (items: RedemptionView[], now: number = Date.now()): MonthLine[] => {
  const per = new Map<string, number>();
  for (const r of items) {
    if (walletStatus(r, now) !== 'used') continue;
    const m = monthOf(r.validatedAt || r.redeemedAt);
    per.set(m, (per.get(m) || 0) + 1);
  }
  return [...per.entries()]
    .sort((a, b) => b[0].localeCompare(a[0]))
    .map(([month, coupons]) => {
      const raw = coupons * POINTS_PER_COUPON;
      return { month, coupons, raw, counted: Math.min(raw, MONTHLY_CAP), capped: raw > MONTHLY_CAP };
    });
};
