import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { Tour } from '../types';
import {
  scheduledTimes, dayAvailability, dayStatus, validateBooking, validateTour, slotId, brtDate, slotInstant, departureDates, bookingWhatsappText, whatsappLink, priceLabel, totalLabel,
} from '../services/tourRules';

const tour = (o: Partial<Tour> = {}): Tour => ({
  id: 't1', title: 'Passeio de barco', shortDescription: 'x', description: 'y', coverImage: 'c', gallery: [], cityId: 'arraial-do-cabo',
  meetingPoint: 'Cais', durationText: '3h', includes: [], notIncluded: [], capacityPerSlot: 10, minPeople: 1, maxPeoplePerBooking: 6,
  minNoticeHours: 12, schedule: { weekdays: [6, 0], times: ['09:00', '14:00'], blockedDates: [], extraDates: [] },
  operatorName: 'Guida Trips', operatorWhatsapp: '22999998888', status: 'published', ...o,
});
// Sexta 2026-11-20 12:00 em Brasília = 15:00Z. Sábado 21/11 e domingo 22/11 são saídas.
const NOW = new Date('2026-11-20T15:00:00Z');

test('datas e horários em Brasília', () => {
  assert.equal(brtDate(new Date('2026-11-21T02:30:00Z')), '2026-11-20');
  assert.equal(slotInstant('2026-11-21', '09:00'), Date.parse('2026-11-21T12:00:00Z'));
});

test('saídas por dia da semana, temporada, bloqueios e datas extras', () => {
  assert.deepEqual(scheduledTimes(tour(), '2026-11-21'), ['09:00', '14:00']); // sábado
  assert.deepEqual(scheduledTimes(tour(), '2026-11-23'), []); // segunda
  const t = tour({ schedule: { weekdays: [6], times: ['09:00'], startDate: '2026-12-01', endDate: '2026-12-31', blockedDates: ['2026-12-12'], extraDates: [{ date: '2026-11-24', times: ['10:00'] }] } });
  assert.deepEqual(scheduledTimes(t, '2026-11-21'), []); // fora da temporada
  assert.deepEqual(scheduledTimes(t, '2026-12-05'), ['09:00']);
  assert.deepEqual(scheduledTimes(t, '2026-12-12'), []); // bloqueado
  assert.deepEqual(scheduledTimes(t, '2026-11-24'), ['10:00']); // extra fora da temporada
});

test('disponibilidade: vagas, lotação, antecedência e saída fechada', () => {
  const slots = { [slotId('t1', '2026-11-21', '09:00')]: { booked: 10 }, [slotId('t1', '2026-11-21', '14:00')]: { booked: 7 } };
  const v = dayAvailability(tour(), '2026-11-21', slots, NOW);
  assert.equal(v[0].state, 'full'); assert.equal(v[0].bookable, false);
  assert.equal(v[1].left, 3); assert.equal(v[1].bookable, true);
  // antecedência: às 20h de sexta, a saída de sábado 09:00 (13h depois) ainda vale; com 24h não
  const late = dayAvailability(tour({ minNoticeHours: 24 }), '2026-11-21', {}, NOW);
  assert.equal(late[0].state, 'late'); assert.equal(late[1].state, 'open');
  const closed = dayAvailability(tour(), '2026-11-21', { [slotId('t1', '2026-11-21', '14:00')]: { booked: 0, closed: true } }, NOW);
  assert.equal(closed[1].state, 'closed');
  assert.equal(dayAvailability(tour(), '2026-11-14', {}, NOW)[0].state, 'past');
});

test('estado do dia no calendário', () => {
  assert.equal(dayStatus(tour(), '2026-11-23', {}, NOW), 'none');
  assert.equal(dayStatus(tour(), '2026-11-21', {}, NOW), 'open');
  const full = { [slotId('t1', '2026-11-21', '09:00')]: { booked: 10 }, [slotId('t1', '2026-11-21', '14:00')]: { booked: 10 } };
  assert.equal(dayStatus(tour(), '2026-11-21', full, NOW), 'full');
  assert.equal(departureDates(tour(), NOW, 7).join(','), '2026-11-21,2026-11-22,2026-11-28'.split(',').slice(0, 2).join(','));
});

test('valida o pedido de reserva', () => {
  const ok = { date: '2026-11-21', time: '14:00', people: 3, customerName: 'Maria Souza', customerPhone: '(22) 99999-8888' };
  assert.deepEqual(validateBooking(tour(), ok, { booked: 2 }, NOW), {});
  assert.ok(validateBooking(tour(), { ...ok, people: 9 }, { booked: 2 }, NOW).people); // acima do máximo por reserva
  assert.ok(validateBooking(tour(), { ...ok, people: 6 }, { booked: 7 }, NOW).people); // só restam 3
  assert.ok(validateBooking(tour(), ok, { booked: 10 }, NOW).slot); // lotado
  assert.ok(validateBooking(tour(), { ...ok, time: '10:00' }, undefined, NOW).slot); // horário que não existe
  assert.ok(validateBooking(tour(), { ...ok, date: '2026-11-23' }, undefined, NOW).slot); // segunda: não sai
  assert.ok(validateBooking(tour({ status: 'draft' }), ok, undefined, NOW).slot);
  assert.ok(validateBooking(tour(), { ...ok, customerPhone: '123' }, undefined, NOW).customerPhone);
  assert.ok(validateBooking(tour(), { ...ok, customerName: 'A' }, undefined, NOW).customerName);
  assert.ok(validateBooking(tour({ minPeople: 2 }), { ...ok, people: 1 }, undefined, NOW).people);
});

test('valida o cadastro do passeio', () => {
  assert.ok(validateTour({ title: '' }, false).title);
  assert.deepEqual(validateTour({ title: 'Barco' }, false), {});
  const e = validateTour({ title: 'Barco' }, true);
  assert.ok(e.description && e.coverImage && e.operatorWhatsapp && e.schedule && e.capacityPerSlot);
  const good = tour({ shortDescription: 'Passeio de barco pelas praias de Arraial', description: 'd'.repeat(120) });
  assert.deepEqual(validateTour(good, true), {});
  assert.ok(validateTour({ ...good, minPeople: 11 }, true).minPeople);
  assert.ok(validateTour({ ...good, maxPeoplePerBooking: 20 }, true).maxPeoplePerBooking);
  assert.ok(validateTour({ ...good, schedule: { weekdays: [], times: [], blockedDates: [], extraDates: [] } }, true).schedule);
});

test('textos: preço, total e WhatsApp', () => {
  assert.equal(priceLabel({ price: 150 }), 'R$ 150 por pessoa');
  assert.equal(priceLabel({}), 'Consulte o valor');
  assert.equal(totalLabel({ price: 150 }, 3), 'R$ 450,00');
  assert.equal(totalLabel({}, 3), null);
  const url = whatsappLink('(22) 99999-8888', bookingWhatsappText({ tourTitle: 'Barco', date: '2026-11-21', time: '09:00', people: 2, customerName: 'Ana' }));
  assert.ok(url.startsWith('https://wa.me/5522999998888?text='));
  assert.ok(decodeURIComponent(url).includes('Sáb, 21/11/2026 às 09:00'));
});
