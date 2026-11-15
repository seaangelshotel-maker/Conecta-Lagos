import test from 'node:test';
import assert from 'node:assert/strict';
import { generatePush, clip, GENERATORS, TITLE_MAX, BODY_MAX } from '../services/pushGenerator';
import { safeLink } from '../server/pushLink';

const today = '2026-11-18'; // quarta-feira
const NOW = Date.parse('2026-11-18T12:00:00-03:00');
const ev = (o: any) => ({ id: 'e1', title: 'Festival de Frutos do Mar', status: 'published', startDate: '2026-11-21', cityId: 'arraial-do-cabo', category: 'festival', ...o });
const coupon = (o: any) => ({ id: 'c1', companyId: 'b1', companyName: 'Guida Trips', title: 'Mergulho de Batismo', originalPrice: 500, discountedPrice: 300, active: true, status: 'approved', expiryDate: '2026-12-31T23:59:00-03:00', ...o });
const post = (o: any) => ({ id: 'p1', title: 'Obras na Rodovia', excerpt: 'Trânsito alterado no fim de semana', category: 'Notícias', date: '2026-11-17', status: 'published', ...o });
const opp = (o: any) => ({ id: 'o1', title: 'Garçom para sábado', status: 'published', isHidden: false, recurrence: 'once', cityName: 'Cabo Frio', publishedAt: '2026-11-16T10:00:00-03:00', ...o });

test('clip respeita o limite e não corta palavra no meio', () => {
  assert.equal(clip('curto', 80), 'curto');
  const c = clip('uma frase bem comprida que precisa ser cortada em algum ponto razoável', 30);
  assert.ok(c.length <= 30 && c.endsWith('…'));
  assert.ok(!/\s…$/.test(c));
});

test('eventos do fim de semana: 1 evento leva ao próprio evento, vários levam à agenda', () => {
  const one = generatePush('eventos-fim-de-semana', { events: [ev({})] as any, today });
  assert.equal(one.empty, false); assert.equal(one.topic, 'eventos'); assert.equal(one.link, '/eventos/e1');
  assert.match(one.title, /1 evento/);
  const many = generatePush('eventos-fim-de-semana', { events: [ev({}), ev({ id: 'e2', title: 'Show na Praia' })] as any, today });
  assert.equal(many.link, '/eventos'); assert.match(many.title, /2 eventos/); assert.match(many.body, /e mais 1 evento/);
});

test('eventos: rascunho, passado e fora do período não entram', () => {
  const r = generatePush('eventos-hoje', { events: [ev({ status: 'draft' }), ev({ id: 'e3', startDate: '2026-11-01' }), ev({ id: 'e4' })] as any, today });
  assert.equal(r.empty, true); assert.ok(r.reason);
});

test('cupons que mais economizam: escolhe o maior desconto em reais e ignora vencido/inativo', () => {
  const r = generatePush('cupons-economia', { now: NOW, coupons: [
    coupon({ id: 'a', discountedPrice: 450 }), coupon({ id: 'b', companyId: 'b2', companyName: 'Hotel X', title: 'Diária', discountedPrice: 300 }),
    coupon({ id: 'c', discountedPrice: 100, active: false }), coupon({ id: 'd', discountedPrice: 100, expiryDate: '2026-01-01T00:00:00-03:00' }),
  ] as any });
  assert.equal(r.empty, false); assert.equal(r.topic, 'cupons');
  assert.match(r.title, /R\$\s?200,00/); assert.match(r.body, /Guida Trips|Hotel X/); assert.match(r.body, /e mais 1 cupom/);
});

test('cupons acabando: só os que vencem em 3 dias, o mais próximo primeiro', () => {
  const r = generatePush('cupons-acabando', { now: NOW, coupons: [
    coupon({ id: 'a', title: 'Longe', expiryDate: '2026-12-31T23:59:00-03:00' }),
    coupon({ id: 'b', title: 'Perto', expiryDate: '2026-11-20T23:59:00-03:00' }),
  ] as any });
  assert.equal(r.empty, false); assert.match(r.body, /Perto/); assert.equal(r.count, 1);
  assert.equal(generatePush('cupons-acabando', { now: NOW, coupons: [coupon({})] as any }).empty, true);
});

test('notícia e dica: pega a mais recente da categoria, publicada, com link do Feed', () => {
  const posts = [post({}), post({ id: 'p0', date: '2026-11-10', title: 'Antiga' }), post({ id: 'p2', category: 'Dicas Úteis', title: 'Leve protetor solar' }),
    post({ id: 'p3', status: 'draft', date: '2026-11-18' }), post({ id: 'g', kind: 'guia', date: '2026-11-18' })] as any;
  const n = generatePush('noticia', { posts });
  assert.equal(n.title, 'Obras na Rodovia'); assert.equal(n.link, '/blog/p1'); assert.equal(n.topic, 'materias');
  assert.equal(generatePush('dica', { posts }).title, 'Leve protetor solar');
  assert.equal(generatePush('dica', { posts: [] }).empty, true);
});

test('ajuda: só oportunidades disponíveis e publicadas nos últimos 7 dias', () => {
  const r = generatePush('ajuda', { today, now: NOW, opportunities: [opp({}), opp({ id: 'o2', publishedAt: '2026-10-01T10:00:00-03:00' }), opp({ id: 'o3', isHidden: true }), opp({ id: 'o4', status: 'draft' })] as any });
  assert.equal(r.empty, false); assert.equal(r.link, '/ajuda/o1'); assert.equal(r.topic, 'ajuda'); assert.equal(r.count, 1);
  assert.equal(generatePush('ajuda', { today, now: NOW, opportunities: [] }).empty, true);
});

test('todo gerador respeita os limites e só gera links internos válidos', () => {
  const input: any = { today, now: NOW, events: [ev({ title: 'X'.repeat(300) })], coupons: [coupon({ title: 'Y'.repeat(300) })],
    posts: [post({ title: 'Z'.repeat(300), excerpt: 'W'.repeat(500) }), post({ id: 'p2', category: 'Dicas Úteis', title: 'T'.repeat(200) })], opportunities: [opp({ title: 'O'.repeat(400) })] };
  for (const g of GENERATORS) {
    const d = generatePush(g.id, input);
    if (d.empty) continue;
    assert.ok(d.title.length <= TITLE_MAX && d.body.length <= BODY_MAX, g.id);
    assert.equal(safeLink(d.link), d.link, `${g.id}: link ${d.link}`);
  }
});
