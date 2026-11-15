/**
 * Avaliações verificadas (servidor).
 *
 * O cliente envia nota + comentário (+ posição do GPS, se for check-in). O servidor confere TUDO:
 *  - prova de visita: cupom da empresa com resgate confirmado (USED) OU check-in perto do local;
 *  - uma avaliação por pessoa por empresa (renova depois de REVIEW_COOLDOWN_DAYS);
 *  - o dono não avalia a própria empresa;
 *  - texto: curto/longo é recusado; link, telefone, ofensa e gritaria vão para a fila do admin.
 * Avaliação verificada e sem alertas já sai aprovada e atualiza a nota da empresa na hora.
 * Regras puras: services/reviewRules.ts e services/geoRules.ts.
 */
import type { Firestore } from 'firebase-admin/firestore';
import { checkinCheck, CHECKIN_MESSAGES, isValidLatLng } from '../services/geoRules.js';
import {
  canReviewAgain, checkComment, computeStats, daysUntilReviewAgain, NEED_PROOF_MESSAGE, reviewDocId,
  type ReviewProof,
} from '../services/reviewRules.js';

export interface ReviewBody {
  businessId?: unknown;
  rating?: unknown;
  comment?: unknown;
  position?: { lat?: unknown; lng?: unknown; accuracy?: unknown } | null;
}

export interface SubmitResult {
  status: number;
  ok: boolean;
  error?: string;
  reviewStatus?: 'approved' | 'pending';
  proof?: ReviewProof;
}

/** Quantas avaliações aprovadas ficam copiadas dentro da empresa (as mais recentes). O total vai em ratingStats. */
const EMBEDDED_REVIEWS = 10;

/** Recalcula nota, total e as últimas avaliações da empresa a partir da coleção `reviews`. */
export async function recomputeBusinessRating(db: Firestore, businessId: string): Promise<{ avg: number; count: number }> {
  const snap = await db.collection('reviews').where('businessId', '==', businessId).where('status', '==', 'approved').get();
  const list = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
  list.sort((a, b) => Date.parse(b.date || '') - Date.parse(a.date || ''));
  const stats = computeStats(list);
  const embedded = list.slice(0, EMBEDDED_REVIEWS).map(r => {
    const out: Record<string, unknown> = {
      id: r.id, userId: r.userId, userName: r.userName, rating: r.rating, comment: r.comment, date: r.date, status: 'approved',
    };
    if (r.userAvatar) out.userAvatar = r.userAvatar;
    if (r.proof) out.proof = r.proof;
    if (r.reply) { out.reply = r.reply; out.replyAt = r.replyAt; }
    return out;
  });
  await db.collection('businesses').doc(businessId).set(
    { ratingStats: stats, rating: stats.avg, reviewCount: stats.count, reviews: embedded },
    { merge: true },
  );
  return stats;
}

export async function submitReview(db: Firestore, uid: string, body: ReviewBody, now: number = Date.now()): Promise<SubmitResult> {
  const businessId = typeof body.businessId === 'string' ? body.businessId.trim() : '';
  if (!businessId || businessId.length > 200) return { status: 400, ok: false, error: 'Empresa inválida.' };

  const rating = Number(body.rating);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) return { status: 400, ok: false, error: 'Escolha uma nota de 1 a 5.' };

  const cmt = checkComment(body.comment);
  if (!cmt.valid) {
    return { status: 400, ok: false, error: cmt.reasons[0] === 'curto'
      ? 'Conte um pouco mais sobre a sua experiência (mínimo de 10 letras).'
      : 'O comentário está muito longo.' };
  }

  const [userSnap, bizSnap] = await Promise.all([
    db.collection('users').doc(uid).get(),
    db.collection('businesses').doc(businessId).get(),
  ]);
  const user = (userSnap.exists ? userSnap.data() : {}) as any;
  if (user.isBlocked === true) return { status: 403, ok: false, error: 'Sua conta não pode avaliar.' };
  if (!bizSnap.exists) return { status: 404, ok: false, error: 'Empresa não encontrada.' };
  const biz = bizSnap.data() as any;
  if (biz.ownerId === uid || businessId === uid) return { status: 403, ok: false, error: 'Você não pode avaliar a sua própria empresa.' };

  const ref = db.collection('reviews').doc(reviewDocId(uid, businessId));
  const prev = await ref.get();
  const prevDate = prev.exists ? (prev.data() as any).date : undefined;
  if (prev.exists && !canReviewAgain(prevDate, now)) {
    return { status: 409, ok: false, error: `Você já avaliou esta empresa. Dá para avaliar de novo em ${daysUntilReviewAgain(prevDate, now)} dia(s).` };
  }

  // ── Prova de visita
  let proof: ReviewProof | null = null;
  let distanceM: number | undefined;

  const used = await db.collection('redemptions')
    .where('userId', '==', uid).where('companyId', '==', businessId).where('status', '==', 'USED').limit(1).get();
  if (!used.empty) proof = 'coupon';

  if (!proof && body.position) {
    const p = body.position;
    const pos = { lat: Number(p.lat), lng: Number(p.lng), accuracy: p.accuracy == null ? undefined : Number(p.accuracy) };
    const chk = checkinCheck(isValidLatLng(pos) ? pos : null, biz);
    if (chk.ok) { proof = 'checkin'; distanceM = chk.distanceM; }
    else return { status: 403, ok: false, error: CHECKIN_MESSAGES[chk.reason] };
  }
  if (!proof) return { status: 403, ok: false, error: NEED_PROOF_MESSAGE };

  // ── Grava
  const reviewStatus: 'approved' | 'pending' = cmt.flagged ? 'pending' : 'approved';
  const name = [user.name, user.surname].filter(Boolean).join(' ').trim() || 'Visitante';
  const review: Record<string, unknown> = {
    id: ref.id, businessId, businessName: biz.name || '', userId: uid, userName: name,
    rating, comment: cmt.text, date: new Date(now).toISOString(), status: reviewStatus, proof,
  };
  if (user.avatarUrl) review.userAvatar = user.avatarUrl;
  if (distanceM !== undefined) review.checkinDistanceM = distanceM;
  if (cmt.flagged) review.flags = cmt.reasons;
  await ref.set(review); // sobrescreve a anterior (já passou o intervalo) e remove resposta antiga

  if (reviewStatus === 'approved') await recomputeBusinessRating(db, businessId);
  else if (prev.exists && (prev.data() as any).status === 'approved') await recomputeBusinessRating(db, businessId);

  return { status: 200, ok: true, reviewStatus, proof };
}
