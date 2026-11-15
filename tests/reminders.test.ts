import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildReminders, dateBRT } from '../services/reminderRules.js';

const T = '2026-11-15', M = '2026-11-16';
const ev = (uid: string, id: string, date = T, extra: any = {}) => ({ id: `${uid}_${id}`, uid, eventId: id, title: `Evento ${id}`, date, ...extra });
const rd = (userId: string, expiryDate: string, extra: any = {}) => ({ id: `r${userId}${expiryDate}`, userId, couponTitle: 'Chopp em dobro', companyName: 'Bar do Zé', expiryDate, status: 'PENDING', ...extra });

test('dateBRT usa o dia de Brasília (UTC-3)', () => {
  assert.equal(dateBRT(Date.parse('2026-11-16T02:00:00Z')), '2026-11-15');
  assert.equal(dateBRT(Date.parse('2026-11-15T15:00:00Z'), 1), '2026-11-16');
});
test('evento de hoje vira lembrete com link do evento', () => {
  const r = buildReminders({ today: T, tomorrow: M, events: [ev('a', 'e1')], redemptions: [] });
  assert.equal(r.length, 1);
  assert.equal(r[0].link, '/eventos/e1');
  assert.match(r[0].title, /Hoje: Evento e1/);
});
test('evento de outro dia ou já avisado não gera lembrete', () => {
  assert.equal(buildReminders({ today: T, tomorrow: M, events: [ev('a', 'e1', M), ev('b', 'e2', T, { sentOn: T })], redemptions: [] }).length, 0);
});
test('cupom pendente vencendo hoje/amanhã gera lembrete; usado, já marcado ou longe não', () => {
  const r = buildReminders({ today: T, tomorrow: M, events: [], redemptions: [rd('a', M), rd('b', T + 'T23:00:00Z'), rd('c', M, { status: 'USED' }), rd('d', M, { usedClaimedAt: 'x' }), rd('e', '2026-11-30')] });
  assert.deepEqual(r.map(x => x.uid).sort(), ['a', 'b']);
  assert.match(r.find(x => x.uid === 'a')!.title, /amanhã/);
  assert.match(r.find(x => x.uid === 'b')!.title, /hoje/);
});
test('no máximo 1 lembrete por pessoa; evento tem prioridade sobre cupom', () => {
  const r = buildReminders({ today: T, tomorrow: M, events: [ev('a', 'e1'), ev('a', 'e2')], redemptions: [rd('a', M)] });
  assert.equal(r.length, 1);
  assert.equal(r[0].kind, 'evento');
  assert.match(r[0].title, /2 eventos/);
  assert.equal(r[0].eventDocIds.length, 2);
});
