import React, { useEffect, useState } from 'react';
import { BadgeCheck, Flag, Loader2, MapPin, MessageSquareReply, Navigation, Star, Ticket } from 'lucide-react';
import { BusinessProfile, Review, User } from '../types';
import { addReview, getMyReview, hasConfirmedCoupon, replyToReview } from '../services/dataService';
import { checkinCheck, CHECKIN_MESSAGES, directionsUrl, isValidLatLng } from '../services/geoRules';
import { getDevicePosition, type DevicePosition } from '../services/geoService';
import {
  canReviewAgain, computeStats, daysUntilReviewAgain, MIN_REVIEWS_TO_SHOW, NEED_PROOF_MESSAGE, PROOF_LABEL,
  publicRating, COMMENT_MIN, COMMENT_MAX, REPLY_MAX,
} from '../services/reviewRules';
import { useNotification } from './NotificationSystem';
import { ReportDialog } from './ReportDialog';

interface Props {
  business: BusinessProfile;
  currentUser: User | null;
  reviews: Review[];
  onReload: () => void;
  onLogin: () => void;
}

const Stars: React.FC<{ value: number; size?: number }> = ({ value, size = 10 }) => (
  <div className="flex">{[0, 1, 2, 3, 4].map(i => (
    <Star key={i} size={size} className={i < Math.round(value) ? 'text-gold-400 fill-current' : 'text-slate-300'} />
  ))}</div>
);

export const ReviewsSection: React.FC<Props> = ({ business, currentUser, reviews, onReload, onLogin }) => {
  const { notify } = useNotification();
  const [hasCoupon, setHasCoupon] = useState(false);
  const [myReview, setMyReview] = useState<Review | null>(null);
  const [position, setPosition] = useState<(DevicePosition & { distanceM: number }) | null>(null);
  const [locating, setLocating] = useState(false);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [sending, setSending] = useState(false);
  const [reportTarget, setReportTarget] = useState<Review | null>(null);
  const [replyId, setReplyId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [replying, setReplying] = useState(false);

  const isOwner = !!currentUser && (business.ownerId === currentUser.id || business.id === currentUser.id);
  const uid = currentUser?.id;

  useEffect(() => {
    let alive = true;
    setHasCoupon(false); setMyReview(null); setPosition(null);
    if (!uid || isOwner) return;
    void Promise.all([hasConfirmedCoupon(business.id), getMyReview(business.id)]).then(([c, r]) => {
      if (!alive) return;
      setHasCoupon(c); setMyReview(r);
    });
    return () => { alive = false; };
  }, [business.id, uid, isOwner]);

  const stats = business.ratingStats && typeof business.ratingStats.count === 'number' ? business.ratingStats : computeStats(reviews);
  const pub = publicRating(stats);
  const hasBizLocation = isValidLatLng({ lat: business.lat, lng: business.lng });

  const cooldownBlocked = !!myReview && myReview.status !== 'archived' && !canReviewAgain(myReview.date);
  const proof: 'coupon' | 'checkin' | null = hasCoupon ? 'coupon' : position ? 'checkin' : null;

  const doCheckin = async () => {
    setLocating(true);
    try {
      const pos = await getDevicePosition();
      const r = checkinCheck(pos, business);
      if (r.ok) {
        setPosition({ ...pos, distanceM: r.distanceM });
        notify('success', 'Check-in confirmado! Agora é só avaliar.');
      } else {
        const extra = r.reason === 'too_far' && r.distanceM ? ` (você está a cerca de ${r.distanceM >= 1000 ? `${(r.distanceM / 1000).toFixed(1)} km` : `${r.distanceM} m`})` : '';
        notify('error', CHECKIN_MESSAGES[r.reason] + extra);
      }
    } catch (e: any) {
      notify('error', e?.message || 'Não conseguimos ler a sua localização.');
    } finally {
      setLocating(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proof) return notify('error', NEED_PROOF_MESSAGE);
    if (comment.trim().length < COMMENT_MIN) return notify('error', 'Conte um pouco mais sobre a sua experiência (mínimo de 10 letras).');
    setSending(true);
    try {
      const out = await addReview(business.id, { rating, comment }, proof === 'checkin' ? position : null);
      setComment(''); setRating(5); setPosition(null);
      notify('success', out.reviewStatus === 'approved'
        ? 'Avaliação publicada. Obrigado por ajudar quem vem depois!'
        : 'Recebemos a sua avaliação. Ela passa por uma conferência rápida antes de aparecer.');
      setMyReview(await getMyReview(business.id));
      onReload();
    } catch (err: any) {
      notify('error', err?.message || 'Não foi possível enviar a avaliação.');
    } finally {
      setSending(false);
    }
  };

  const sendReply = async (review: Review) => {
    setReplying(true);
    try {
      await replyToReview(review.id, replyText);
      setReplyId(null); setReplyText('');
      notify('success', 'Resposta publicada.');
      onReload();
    } catch (err: any) {
      notify('error', err?.message || 'Não foi possível responder agora.');
    } finally {
      setReplying(false);
    }
  };

  return (
    <div className="space-y-6 pt-6 border-t border-slate-100" data-testid="reviews-section">
      <div className="flex items-center justify-between gap-3">
        <h3 className="text-xl font-black text-ocean-950">Avaliações</h3>
        {pub ? (
          <div className="flex items-center gap-2" data-testid="reviews-score">
            <Star className="text-gold-400 fill-current" size={20} />
            <span className="font-bold text-lg">{pub.rating.toFixed(1)}</span>
            <span className="text-slate-400 text-sm">({pub.count})</span>
          </div>
        ) : reviews.length > 0 ? (
          <span className="text-[11px] font-bold text-slate-400 text-right">
            {reviews.length} {reviews.length === 1 ? 'avaliação' : 'avaliações'} · a nota aparece com {MIN_REVIEWS_TO_SHOW}
          </span>
        ) : null}
      </div>

      <p className="text-xs text-slate-500 flex items-start gap-2">
        <BadgeCheck size={14} className="text-emerald-500 shrink-0 mt-0.5" />
        <span>Só avalia quem esteve aqui: usou um cupom da empresa ou fez check-in perto do local.</span>
      </p>

      {/* ── Formulário / porta de entrada */}
      {isOwner ? (
        <div className="bg-slate-50 p-4 rounded-2xl text-sm text-slate-500">
          Você é o responsável por esta empresa: pode responder às avaliações abaixo, mas não avaliar a própria empresa.
        </div>
      ) : !currentUser ? (
        <div className="bg-slate-50 p-6 rounded-2xl text-center">
          <p className="text-slate-500 text-sm mb-4">Faça login para avaliar. Você ainda precisa comprovar a visita.</p>
          <button onClick={onLogin} className="px-6 py-2 bg-ocean-600 text-white rounded-full font-bold text-sm">Fazer Login</button>
        </div>
      ) : cooldownBlocked ? (
        <div className="bg-slate-50 p-4 rounded-2xl text-sm text-slate-600" data-testid="review-already">
          {myReview?.status === 'pending'
            ? 'Sua avaliação está em conferência e logo aparece aqui. Obrigado!'
            : `Você já avaliou esta empresa. Dá para avaliar de novo em ${daysUntilReviewAgain(myReview!.date)} dia(s).`}
        </div>
      ) : (
        <form onSubmit={submit} className="bg-slate-50 p-4 rounded-2xl space-y-4" data-testid="review-form">
          {!proof ? (
            <div className="space-y-3">
              <h4 className="font-bold text-ocean-950 text-sm">Você esteve aqui?</h4>
              <p className="text-sm text-slate-500">Confirme a visita para liberar a avaliação:</p>
              <button
                type="button" onClick={doCheckin} disabled={locating || !hasBizLocation}
                className="w-full py-3 bg-ocean-600 text-white rounded-xl font-bold text-sm disabled:opacity-50 flex items-center justify-center gap-2"
                data-testid="review-checkin"
              >
                {locating ? <Loader2 size={16} className="animate-spin" /> : <MapPin size={16} />}
                {locating ? 'Lendo o GPS...' : 'Estou aqui — fazer check-in'}
              </button>
              {!hasBizLocation && (
                <p className="text-xs text-slate-400">Esta empresa ainda não marcou o local no mapa, então o check-in não está disponível. Quem usou um cupom daqui já pode avaliar.</p>
              )}
              <p className="text-xs text-slate-400 flex items-center gap-1.5"><Ticket size={12} /> Usou um cupom desta empresa e ela confirmou? A avaliação libera sozinha.</p>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600" data-testid="review-proof">
                <BadgeCheck size={16} />
                {proof === 'coupon' ? 'Cupom usado confirmado' : `Check-in confirmado (${position!.distanceM} m do local)`}
              </div>
              <h4 className="font-bold text-ocean-950 text-sm">Deixe sua avaliação</h4>
              <div className="flex gap-2" role="radiogroup" aria-label="Nota">
                {[1, 2, 3, 4, 5].map(star => (
                  <button key={star} type="button" role="radio" aria-checked={star === rating} aria-label={`${star} estrela(s)`}
                    onClick={() => setRating(star)} className="focus:outline-none">
                    <Star size={28} className={star <= rating ? 'text-gold-400 fill-current' : 'text-slate-300'} />
                  </button>
                ))}
              </div>
              <textarea
                value={comment} onChange={e => setComment(e.target.value)} maxLength={COMMENT_MAX}
                placeholder="Conte como foi sua experiência..."
                className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-ocean-500 outline-none resize-none text-sm" rows={3}
              />
              <button type="submit" disabled={sending || comment.trim().length < COMMENT_MIN}
                className="w-full py-3 bg-ocean-600 text-white rounded-xl font-bold text-sm disabled:opacity-50">
                {sending ? 'Enviando...' : 'Enviar Avaliação'}
              </button>
            </>
          )}
        </form>
      )}

      {/* ── Lista */}
      <div className="space-y-4">
        {reviews.map(review => (
          <div key={review.id} className="border-b border-slate-100 pb-4 last:border-0" data-testid="review-item">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-ocean-100 flex items-center justify-center overflow-hidden shrink-0">
                {review.userAvatar
                  ? <img src={review.userAvatar} alt={review.userName} className="w-full h-full object-cover" />
                  : <span className="text-ocean-600 font-bold text-sm">{(review.userName || '?').charAt(0).toUpperCase()}</span>}
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-bold text-sm text-ocean-950 truncate">{review.userName}</p>
                <div className="flex items-center gap-2">
                  <Stars value={review.rating} />
                  <span className="text-[10px] text-slate-400">{new Date(review.date).toLocaleDateString('pt-BR')}</span>
                </div>
              </div>
              {currentUser && !isOwner && review.userId !== currentUser.id && (
                <button onClick={() => setReportTarget(review)} aria-label="Denunciar avaliação" className="p-2 text-slate-300 hover:text-red-500"><Flag size={14} /></button>
              )}
            </div>
            {review.proof && (
              <p className="text-[11px] font-bold text-emerald-600 flex items-center gap-1 mb-1" data-testid="review-verified">
                <BadgeCheck size={12} /> Avaliação verificada · {PROOF_LABEL[review.proof]}
              </p>
            )}
            <p className="text-sm text-slate-600">{review.comment}</p>

            {review.reply && replyId !== review.id && (
              <div className="mt-3 ml-4 pl-3 border-l-2 border-ocean-200 bg-ocean-50/50 rounded-r-xl py-2 pr-3">
                <p className="text-[11px] font-black text-ocean-700 mb-0.5">Resposta de {business.name}</p>
                <p className="text-sm text-slate-600">{review.reply}</p>
              </div>
            )}

            {isOwner && replyId !== review.id && (
              <button onClick={() => { setReplyId(review.id); setReplyText(review.reply || ''); }}
                className="mt-2 text-xs font-bold text-ocean-600 flex items-center gap-1" data-testid="review-reply-btn">
                <MessageSquareReply size={14} /> {review.reply ? 'Editar resposta' : 'Responder'}
              </button>
            )}
            {isOwner && replyId === review.id && (
              <div className="mt-3 space-y-2">
                <textarea value={replyText} onChange={e => setReplyText(e.target.value)} maxLength={REPLY_MAX} rows={3}
                  placeholder="Agradeça e responda com educação..."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-ocean-500 outline-none resize-none text-sm" />
                <div className="flex gap-2">
                  <button onClick={() => sendReply(review)} disabled={replying || replyText.trim().length < 2}
                    className="px-4 py-2 bg-ocean-600 text-white rounded-xl font-bold text-xs disabled:opacity-50">{replying ? 'Enviando...' : 'Publicar resposta'}</button>
                  <button onClick={() => setReplyId(null)} className="px-4 py-2 bg-slate-100 text-slate-500 rounded-xl font-bold text-xs">Cancelar</button>
                </div>
              </div>
            )}
          </div>
        ))}
        {reviews.length === 0 && (
          <p className="text-center text-slate-400 text-sm py-4">Nenhuma avaliação ainda. Seja o primeiro a avaliar depois de visitar!</p>
        )}
      </div>

      {hasBizLocation && (
        <a href={directionsUrl({ lat: business.lat!, lng: business.lng! })} target="_blank" rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-xs font-bold text-ocean-600"><Navigation size={14} /> Como chegar</a>
      )}

      {reportTarget && (
        <ReportDialog targetType="review" targetId={reportTarget.id} targetTitle={`Avaliação de ${reportTarget.userName}`} onClose={() => setReportTarget(null)} />
      )}
    </div>
  );
};
