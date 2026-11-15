import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  reviewDocId, canReviewAgain, daysUntilReviewAgain, computeStats, publicRating, checkComment, cleanReply,
  REVIEW_COOLDOWN_DAYS, MIN_REVIEWS_TO_SHOW, COMMENT_MAX, REPLY_MAX,
} from '../services/reviewRules';

const DAY = 86_400_000;

test('um documento por pessoa e empresa, com id seguro', () => {
  assert.equal(reviewDocId('u1', 'b1'), 'u1_b1');
  assert.equal(reviewDocId('u/1', 'b 1'), 'u_1_b_1');
});

test('intervalo para avaliar de novo', () => {
  const now = Date.parse('2026-11-15T12:00:00Z');
  assert.equal(canReviewAgain(undefined, now), true);
  assert.equal(canReviewAgain(new Date(now - 10 * DAY).toISOString(), now), false);
  assert.equal(canReviewAgain(new Date(now - REVIEW_COOLDOWN_DAYS * DAY).toISOString(), now), true);
  assert.equal(daysUntilReviewAgain(new Date(now - 50 * DAY).toISOString(), now), 10);
  assert.equal(canReviewAgain('lixo', now), true);
});

test('média só conta avaliações aprovadas', () => {
  const s = computeStats([
    { rating: 5, status: 'approved' }, { rating: 4 }, { rating: 1, status: 'pending' }, { rating: 2, status: 'rejected' },
  ]);
  assert.deepEqual(s, { avg: 4.5, count: 2 });
  assert.deepEqual(computeStats([]), { avg: 0, count: 0 });
});

test('nota pública só aparece com avaliações suficientes', () => {
  assert.equal(publicRating(null), null);
  assert.equal(publicRating({ avg: 5, count: MIN_REVIEWS_TO_SHOW - 1 }), null);
  assert.deepEqual(publicRating({ avg: 4.66, count: MIN_REVIEWS_TO_SHOW }), { rating: 4.7, count: MIN_REVIEWS_TO_SHOW });
  assert.equal(publicRating({ avg: 0, count: 10 }), null);
});

test('comentário muito curto ou muito longo é inválido', () => {
  assert.equal(checkComment('ok').valid, false);
  assert.equal(checkComment('a'.repeat(COMMENT_MAX + 1)).valid, false);
  const ok = checkComment('  Atendimento ótimo,   comida   boa e preço justo. ');
  assert.equal(ok.valid, true);
  assert.equal(ok.flagged, false);
  assert.equal(ok.text, 'Atendimento ótimo, comida boa e preço justo.');
});

test('link, telefone, ofensa e gritaria vão para revisão', () => {
  assert.deepEqual(checkComment('Melhor que o concorrente, veja www.outrolugar.com.br').reasons, ['link']);
  assert.ok(checkComment('Chama no (22) 99876-5432 que é mais barato').reasons.includes('telefone'));
  assert.ok(checkComment('Esse lugar é uma merda total, evitem').reasons.includes('ofensa'));
  assert.ok(checkComment('PESSIMO ATENDIMENTO NUNCA MAIS VOLTO AQUI JAMAIS').reasons.includes('maiusculas'));
  assert.ok(checkComment('Muito bommmmmmmmmmm demais gostei').reasons.includes('repeticao'));
});

test('palavra parecida com ofensa dentro de outra palavra não dispara', () => {
  assert.equal(checkComment('A computação do pedido foi rápida e o atendimento excelente').flagged, false);
  assert.equal(checkComment('Deliciosa a disputa de sabores no cardápio inteiro').flagged, false);
});

test('resposta da empresa é limpa e limitada', () => {
  assert.equal(cleanReply('  Obrigado   pela visita!  '), 'Obrigado pela visita!');
  assert.equal(cleanReply('x'.repeat(REPLY_MAX + 50)).length, REPLY_MAX);
});
