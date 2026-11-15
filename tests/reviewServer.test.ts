import { test } from 'node:test';
import assert from 'node:assert/strict';
import { submitReview, recomputeBusinessRating } from '../server/reviews';

// Banco de mentira, só com o que o servidor de avaliações usa.
const makeDb = (seed: Record<string, Record<string, any>>) => {
  const data: Record<string, Record<string, any>> = JSON.parse(JSON.stringify(seed));
  const col = (name: string) => {
    data[name] = data[name] || {};
    const docRef = (id: string) => ({
      id,
      get: async () => ({ exists: id in data[name], id, data: () => data[name][id] }),
      set: async (v: any, opts?: { merge?: boolean }) => { data[name][id] = opts?.merge ? { ...(data[name][id] || {}), ...v } : v; },
    });
    const query = (filters: Array<[string, any]>, lim?: number): any => ({
      where: (f: string, _op: string, v: any) => query([...filters, [f, v]], lim),
      limit: (n: number) => query(filters, n),
      get: async () => {
        let docs = Object.entries(data[name]).filter(([, d]) => filters.every(([f, v]) => d[f] === v))
          .map(([id, d]) => ({ id, data: () => d }));
        if (lim) docs = docs.slice(0, lim);
        return { empty: docs.length === 0, docs };
      },
    });
    return { doc: docRef, where: (f: string, op: string, v: any) => query([[f, v]]), limit: (n: number) => query([], n) };
  };
  return { db: { collection: col } as any, data };
};

const NOW = Date.parse('2026-11-15T15:00:00Z');
const biz = { name: 'Quiosque do Zé', ownerId: 'owner1', lat: -22.984, lng: -42.0224 };
const base = () => makeDb({
  users: { u1: { name: 'Maria', surname: 'Silva' }, owner1: { name: 'Zé' } },
  businesses: { b1: biz },
  redemptions: {},
  reviews: {},
});
const good = { businessId: 'b1', rating: 5, comment: 'Atendimento muito bom e comida excelente.' };
const here = { lat: -22.9842, lng: -42.0224, accuracy: 25 };

test('sem prova de visita não avalia', async () => {
  const { db } = base();
  const r = await submitReview(db, 'u1', good, NOW);
  assert.equal(r.ok, false); assert.equal(r.status, 403);
});

test('check-in perto do local aprova e atualiza a nota', async () => {
  const { db, data } = base();
  const r = await submitReview(db, 'u1', { ...good, position: here }, NOW);
  assert.deepEqual([r.ok, r.reviewStatus, r.proof], [true, 'approved', 'checkin']);
  assert.equal(data.reviews['u1_b1'].status, 'approved');
  assert.equal(data.reviews['u1_b1'].userName, 'Maria Silva');
  assert.deepEqual(data.businesses.b1.ratingStats, { avg: 5, count: 1 });
  assert.equal(data.businesses.b1.reviews.length, 1);
});

test('check-in longe do local é recusado', async () => {
  const { db, data } = base();
  const r = await submitReview(db, 'u1', { ...good, position: { lat: -22.95, lng: -42.0224, accuracy: 10 } }, NOW);
  assert.equal(r.ok, false); assert.equal(r.status, 403);
  assert.equal(data.reviews['u1_b1'], undefined);
});

test('cupom usado confirmado vale sem GPS', async () => {
  const { db } = makeDb({
    users: { u1: { name: 'Maria' } }, businesses: { b1: biz },
    redemptions: { r1: { userId: 'u1', companyId: 'b1', status: 'USED' }, r2: { userId: 'u2', companyId: 'b1', status: 'USED' } },
  });
  const r = await submitReview(db, 'u1', good, NOW);
  assert.deepEqual([r.ok, r.proof], [true, 'coupon']);
});

test('cupom apenas reservado (PENDING) não comprova a visita', async () => {
  const { db } = makeDb({
    users: { u1: { name: 'Maria' } }, businesses: { b1: biz },
    redemptions: { r1: { userId: 'u1', companyId: 'b1', status: 'PENDING' } },
  });
  assert.equal((await submitReview(db, 'u1', good, NOW)).ok, false);
});

test('empresa sem local marcado não aceita check-in', async () => {
  const { db } = makeDb({ users: { u1: { name: 'M' } }, businesses: { b1: { name: 'X', ownerId: 'o' } } });
  const r = await submitReview(db, 'u1', { ...good, position: here }, NOW);
  assert.equal(r.ok, false); assert.match(r.error!, /não marcou o local/);
});

test('dono não avalia a própria empresa', async () => {
  const { db } = base();
  const r = await submitReview(db, 'owner1', { ...good, position: here }, NOW);
  assert.equal(r.status, 403);
});

test('uma avaliação por pessoa até passar o intervalo', async () => {
  const { db } = base();
  assert.equal((await submitReview(db, 'u1', { ...good, position: here }, NOW)).ok, true);
  const again = await submitReview(db, 'u1', { ...good, rating: 1, position: here }, NOW + 5 * 86_400_000);
  assert.equal(again.status, 409);
  const later = await submitReview(db, 'u1', { ...good, rating: 3, position: here }, NOW + 61 * 86_400_000);
  assert.equal(later.ok, true);
});

test('texto com link vai para a fila do admin e não muda a nota', async () => {
  const { db, data } = base();
  const r = await submitReview(db, 'u1', { ...good, comment: 'Ótimo, mas veja www.concorrente.com.br também', position: here }, NOW);
  assert.deepEqual([r.ok, r.reviewStatus], [true, 'pending']);
  assert.deepEqual(data.reviews['u1_b1'].flags, ['link']);
  assert.equal(data.businesses.b1.ratingStats, undefined);
});

test('nota e comentário inválidos são recusados', async () => {
  const { db } = base();
  assert.equal((await submitReview(db, 'u1', { ...good, rating: 6, position: here }, NOW)).status, 400);
  assert.equal((await submitReview(db, 'u1', { ...good, rating: 2.5, position: here }, NOW)).status, 400);
  assert.equal((await submitReview(db, 'u1', { ...good, comment: 'ok', position: here }, NOW)).status, 400);
  assert.equal((await submitReview(db, 'u1', { ...good, businessId: '' , position: here }, NOW)).status, 400);
});

test('usuário bloqueado e empresa inexistente', async () => {
  const blocked = makeDb({ users: { u1: { isBlocked: true } }, businesses: { b1: biz } });
  assert.equal((await submitReview(blocked.db, 'u1', { ...good, position: here }, NOW)).status, 403);
  const { db } = base();
  assert.equal((await submitReview(db, 'u1', { ...good, businessId: 'nope', position: here }, NOW)).status, 404);
});

test('recalcular a nota usa só avaliações aprovadas e guarda as mais recentes', async () => {
  const { db, data } = makeDb({
    businesses: { b1: biz },
    reviews: {
      a: { businessId: 'b1', status: 'approved', rating: 5, date: '2026-11-01T00:00:00Z', userId: 'x', userName: 'A', comment: 'c' },
      b: { businessId: 'b1', status: 'approved', rating: 3, date: '2026-11-02T00:00:00Z', userId: 'y', userName: 'B', comment: 'c', reply: 'Obrigado', replyAt: '2026-11-03T00:00:00Z' },
      c: { businessId: 'b1', status: 'pending', rating: 1, date: '2026-11-03T00:00:00Z', userId: 'z', userName: 'C', comment: 'c' },
      d: { businessId: 'b2', status: 'approved', rating: 1, date: '2026-11-03T00:00:00Z', userId: 'w', userName: 'D', comment: 'c' },
    },
  });
  const stats = await recomputeBusinessRating(db, 'b1');
  assert.deepEqual(stats, { avg: 4, count: 2 });
  assert.equal(data.businesses.b1.rating, 4);
  assert.equal(data.businesses.b1.reviews[0].id, 'b'); // mais recente primeiro
  assert.equal(data.businesses.b1.reviews[0].reply, 'Obrigado');
});
