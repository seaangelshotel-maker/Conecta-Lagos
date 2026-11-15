// Avaliações verificadas — regras puras (sem Firebase), usadas no app e no servidor.
//
// Só avalia quem comprovou a visita: cupom usado (confirmado pela empresa) ou check-in no local (GPS).
// Uma avaliação por pessoa por empresa (renova depois de REVIEW_COOLDOWN_DAYS).
// A nota só aparece depois de MIN_REVIEWS_TO_SHOW avaliações, para uma única não definir o negócio.

export const REVIEW_COOLDOWN_DAYS = 60;
export const MIN_REVIEWS_TO_SHOW = 3;
export const COMMENT_MIN = 10;
export const COMMENT_MAX = 1000;
export const REPLY_MAX = 600;

export type ReviewProof = 'coupon' | 'checkin';

export interface RatingStats { avg: number; count: number }

/** Um documento por pessoa e empresa: impede duplicar e deixa o servidor checar de graça. */
export const reviewDocId = (uid: string, businessId: string): string =>
  `${uid}_${businessId}`.replace(/[^A-Za-z0-9_-]/g, '_').slice(0, 200);

const DAY = 86_400_000;

/** Já passou o intervalo para a mesma pessoa avaliar a mesma empresa de novo? */
export const canReviewAgain = (previousIso: string | undefined | null, now: number = Date.now()): boolean => {
  if (!previousIso) return true;
  const t = Date.parse(previousIso);
  return Number.isNaN(t) || now - t >= REVIEW_COOLDOWN_DAYS * DAY;
};

export const daysUntilReviewAgain = (previousIso: string, now: number = Date.now()): number => {
  const t = Date.parse(previousIso);
  if (Number.isNaN(t)) return 0;
  return Math.max(0, Math.ceil((t + REVIEW_COOLDOWN_DAYS * DAY - now) / DAY));
};

/** Média e total das avaliações aprovadas. */
export const computeStats = (reviews: Array<{ rating?: unknown; status?: string }>): RatingStats => {
  const ok = reviews.filter(r => r && typeof r.rating === 'number' && Number.isFinite(r.rating) && (!r.status || r.status === 'approved'));
  if (!ok.length) return { avg: 0, count: 0 };
  const sum = ok.reduce((s, r) => s + (r.rating as number), 0);
  return { avg: Math.round((sum / ok.length) * 10) / 10, count: ok.length };
};

/** Nota mostrada ao público: null enquanto houver menos de MIN_REVIEWS_TO_SHOW avaliações. */
export const publicRating = (stats?: Partial<RatingStats> | null): { rating: number; count: number } | null => {
  const count = Number(stats?.count) || 0;
  const avg = Number(stats?.avg) || 0;
  if (count < MIN_REVIEWS_TO_SHOW || !(avg > 0)) return null;
  return { rating: Math.round(avg * 10) / 10, count };
};

// ---- Moderação automática do texto -----------------------------------------------------------

// Palavrões comuns e termos de ofensa. A lista é de propósito curta: o que passar vai para a fila do admin.
const BAD_WORDS = [
  'porra', 'caralho', 'merda', 'bosta', 'puta', 'fdp', 'filho da puta', 'cuzao', 'cuzão', 'arrombado',
  'viado', 'otario', 'otário', 'idiota', 'imbecil', 'golpista', 'ladrao', 'ladrão', 'vagabundo',
];

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

export interface CommentCheck {
  /** false = texto inválido (curto demais, grande demais); a avaliação nem é enviada. */
  valid: boolean;
  /** true = vale, mas precisa de revisão do admin antes de aparecer. */
  flagged: boolean;
  reasons: string[];
  text: string;
}

export const checkComment = (raw: unknown): CommentCheck => {
  const text = String(raw ?? '').replace(/\s+/g, ' ').trim();
  const reasons: string[] = [];
  if (text.length < COMMENT_MIN) return { valid: false, flagged: false, reasons: ['curto'], text };
  if (text.length > COMMENT_MAX) return { valid: false, flagged: false, reasons: ['longo'], text };
  const n = norm(text);
  if (/(https?:\/\/|www\.|\.com\b|\.com\.br\b|@\w{3,})/i.test(text)) reasons.push('link');
  if (/(\+?55)?\s*\(?\d{2}\)?\s*9?\d{4}[-\s]?\d{4}/.test(text)) reasons.push('telefone');
  if (BAD_WORDS.some(w => new RegExp(`(^|[^a-z])${norm(w)}([^a-z]|$)`).test(n))) reasons.push('ofensa');
  const letters = text.replace(/[^A-Za-zÀ-ÿ]/g, '');
  if (letters.length >= 25 && letters === letters.toUpperCase()) reasons.push('maiusculas');
  if (/(.)\1{7,}/.test(text)) reasons.push('repeticao');
  return { valid: true, flagged: reasons.length > 0, reasons, text };
};

export const cleanReply = (raw: unknown): string => String(raw ?? '').replace(/\s+/g, ' ').trim().slice(0, REPLY_MAX);

/** Nota pública de uma empresa: usa o resumo gravado pelo servidor (ratingStats) ou, se não houver, as avaliações aprovadas copiadas nela. */
export const businessPublicRating = (b?: { ratingStats?: Partial<RatingStats> | null; reviews?: Array<{ rating?: unknown; status?: string }> } | null): { rating: number; count: number } | null => {
  if (!b) return null;
  const stats = b.ratingStats && typeof b.ratingStats.count === 'number' ? b.ratingStats : computeStats(b.reviews || []);
  return publicRating(stats);
};

export const PROOF_LABEL: Record<ReviewProof, string> = {
  coupon: 'Usou um cupom aqui',
  checkin: 'Fez check-in no local',
};

export const NEED_PROOF_MESSAGE =
  'Para avaliar, comprove que esteve aqui: use um cupom desta empresa ou faça o check-in perto do local.';
