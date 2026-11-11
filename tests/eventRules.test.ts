import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { AppEvent, PricingPlan } from '../types';
import {
  eventPhase, whenLabel, formatEventDates, orderEvents, filterEvents, groupByMonth, periodRange, cityTier,
  eventQuota, activeEventCount, quotaState, resolvePlan, validateEvent, needsReapproval, buildICS, addDays, sortByDate,
} from '../services/eventRules';
import { OFFICIAL_EVENTS_2026 } from '../data/officialEvents2026';

const ev = (o: Partial<AppEvent>): AppEvent => ({
  id: o.id || Math.random().toString(36).slice(2), title: 'Evento', category: 'musica', startDate: '2026-11-20', cityId: 'arraial-do-cabo',
  source: 'merchant', status: 'published', ...o,
});
const TODAY = '2026-11-11'; // quarta-feira

test('fase do evento: passado, em andamento e futuro', () => {
  assert.equal(eventPhase(ev({ startDate: '2026-11-10' }), TODAY), 'past');
  assert.equal(eventPhase(ev({ startDate: '2026-11-11' }), TODAY), 'ongoing');
  assert.equal(eventPhase(ev({ startDate: '2026-11-09', endDate: '2026-11-12' }), TODAY), 'ongoing');
  assert.equal(eventPhase(ev({ startDate: '2026-11-12' }), TODAY), 'upcoming');
  // término antes do início é ignorado (dado ruim não pode sumir com o evento)
  assert.equal(eventPhase(ev({ startDate: '2026-11-20', endDate: '2026-11-01' }), TODAY), 'upcoming');
});

test('rótulo de quando acontece', () => {
  assert.equal(whenLabel(ev({ startDate: '2026-11-11' }), TODAY), 'Hoje');
  assert.equal(whenLabel(ev({ startDate: '2026-11-09', endDate: '2026-11-12' }), TODAY), 'Acontecendo agora');
  assert.equal(whenLabel(ev({ startDate: '2026-11-12' }), TODAY), 'Amanhã');
  assert.equal(whenLabel(ev({ startDate: '2026-11-13' }), TODAY), 'Em 2 dias');
  assert.equal(whenLabel(ev({ startDate: '2026-12-31' }), TODAY), '');
  assert.equal(whenLabel(ev({ startDate: '2026-11-01' }), TODAY), 'Encerrado');
});

test('formatação de datas', () => {
  assert.equal(formatEventDates(ev({ startDate: '2026-11-13', endDate: '2026-11-15' })), '13 a 15 nov');
  assert.equal(formatEventDates(ev({ startDate: '2026-11-28' })), '28 nov');
  assert.equal(formatEventDates(ev({ startDate: '2026-12-30', endDate: '2027-01-02' })), '30 dez a 2 jan');
  assert.equal(addDays('2026-12-31', 1), '2027-01-01');
});

test('ordem: cidade da pessoa sobe, vizinhas depois, resto da região segue — e nada some', () => {
  const list = [
    ev({ id: 'sq', cityId: 'saquarema', startDate: '2026-11-12' }),
    ev({ id: 'cf', cityId: 'cabo-frio', startDate: '2026-11-13' }),
    ev({ id: 'ac', cityId: 'arraial-do-cabo', startDate: '2026-11-30' }),
    ev({ id: 'old', cityId: 'arraial-do-cabo', startDate: '2026-11-01' }),
    ev({ id: 'pend', cityId: 'arraial-do-cabo', startDate: '2026-11-15', status: 'pending' }),
  ];
  assert.deepEqual(orderEvents(list, 'arraial-do-cabo', TODAY).map(e => e.id), ['ac', 'cf', 'sq']);
  // quem está fora da região (ou escolheu "Toda a região") vê só por data
  assert.deepEqual(orderEvents(list, null, TODAY).map(e => e.id), ['sq', 'cf', 'ac']);
  assert.equal(cityTier('cabo-frio', 'arraial-do-cabo'), 1);
  assert.equal(cityTier('saquarema', 'arraial-do-cabo'), 2);
  assert.equal(cityTier('saquarema', null), 2);
});

test('destaque sobe dentro do mesmo grupo de cidade', () => {
  const list = [ev({ id: 'a', startDate: '2026-11-12' }), ev({ id: 'b', startDate: '2026-12-20', isFeatured: true })];
  assert.deepEqual(orderEvents(list, 'arraial-do-cabo', TODAY).map(e => e.id), ['b', 'a']);
});

test('filtros por cidade, categoria, período e busca (sem acento)', () => {
  const list = [
    ev({ id: '1', title: 'Festival de Frutos do Mar', category: 'gastronomia', startDate: '2026-11-13', endDate: '2026-11-15' }),
    ev({ id: '2', title: 'Feira do Xaréu', category: 'feira', startDate: '2026-11-21' }),
    ev({ id: '3', title: 'Show em Búzios', category: 'musica', startDate: '2026-11-14', cityId: 'buzios' }),
  ];
  assert.deepEqual(filterEvents(list, { cityId: 'buzios' }, TODAY).map(e => e.id), ['3']);
  assert.deepEqual(filterEvents(list, { category: 'feira' }, TODAY).map(e => e.id), ['2']);
  assert.deepEqual(filterEvents(list, { q: 'xareu' }, TODAY).map(e => e.id), ['2']);
  assert.deepEqual(filterEvents(list, { q: 'buzios' }, TODAY).map(e => e.id), ['3']);
  // fim de semana de 13 a 15/11 (sexta a domingo) pega o festival e o show, não a feira do dia 21
  assert.deepEqual(periodRange('weekend', TODAY), ['2026-11-13', '2026-11-15']);
  assert.deepEqual(filterEvents(list, { period: 'weekend' }, TODAY).map(e => e.id).sort(), ['1', '3']);
  assert.deepEqual(filterEvents(list, { period: 'month' }, TODAY).map(e => e.id).sort(), ['1', '2', '3']);
  assert.deepEqual(periodRange('week', TODAY), [TODAY, '2026-11-15']);
  assert.equal(periodRange('all', TODAY), null);
});

test('períodos em dias de borda (sábado, domingo)', () => {
  assert.deepEqual(periodRange('weekend', '2026-11-14'), ['2026-11-14', '2026-11-15']); // sábado
  assert.deepEqual(periodRange('weekend', '2026-11-15'), ['2026-11-15', '2026-11-15']); // domingo
  assert.deepEqual(periodRange('week', '2026-11-15'), ['2026-11-15', '2026-11-15']);
  assert.deepEqual(periodRange('month', '2026-02-10'), ['2026-02-10', '2026-02-28']);
});

test('agrupamento por mês', () => {
  const g = groupByMonth(sortByDate([
    ev({ startDate: '2026-12-05' }), ev({ startDate: '2026-11-13', endDate: '2026-11-15' }), ev({ startDate: '2026-10-30', endDate: '2026-11-12' }),
  ]), TODAY);
  // o que começou em outubro e segue em novembro aparece em novembro (mês de hoje)
  assert.deepEqual(g.map(x => x.key), ['2026-11', '2026-12']);
  assert.equal(g[0].events.length, 2);
});

test('cota: a do admin sobrepõe a do plano; sem nada, é zero', () => {
  const plan = { maxEvents: 3 } as PricingPlan;
  assert.equal(eventQuota({ maxEvents: 10 }, plan), 10);
  assert.equal(eventQuota({}, plan), 3);
  assert.equal(eventQuota({ maxEvents: 0 }, plan), 0); // admin pode zerar um comerciante
  assert.equal(eventQuota({}, { } as PricingPlan), 0);
  assert.equal(eventQuota(null, undefined), 0);
  assert.equal(eventQuota({ maxEvents: -4 as any }, plan), 3); // valor inválido é ignorado
  assert.equal(eventQuota({ maxEvents: 2.9 as any }, plan), 2);
});

test('cota: pendentes e publicados ativos contam; cancelados, rejeitados e encerrados liberam vaga', () => {
  const mine = [
    ev({ status: 'pending' }), ev({ status: 'published' }),
    ev({ status: 'cancelled' }), ev({ status: 'rejected' }),
    ev({ status: 'published', startDate: '2026-10-01' }), // já passou
    ev({ status: 'published', startDate: '2026-11-01', endDate: '2026-11-11' }), // termina hoje: ainda conta
  ];
  assert.equal(activeEventCount(mine, TODAY), 3);
  assert.deepEqual(quotaState(mine, 3, TODAY), { used: 3, quota: 3, left: 0, canCreate: false });
  assert.equal(quotaState(mine, 4, TODAY).canCreate, true);
  assert.equal(quotaState([], 0, TODAY).canCreate, false);
});

test('plano é encontrado por id ou por nome', () => {
  const plans = [{ id: 'p1', name: 'Premium' }, { id: 'p2', name: 'Básico' }] as PricingPlan[];
  assert.equal(resolvePlan(plans, 'p2')?.name, 'Básico');
  assert.equal(resolvePlan(plans, undefined, 'premium')?.id, 'p1');
  assert.equal(resolvePlan(plans, 'free'), undefined);
});

test('validação do formulário', () => {
  const ok = { title: 'Noite de forró', category: 'musica', startDate: '2026-11-20', cityId: 'arraial-do-cabo' };
  assert.deepEqual(validateEvent(ok, TODAY), {});
  assert.ok(validateEvent({ ...ok, title: 'ab' }, TODAY).title);
  assert.ok(validateEvent({ ...ok, startDate: '2026-11-01' }, TODAY).startDate);
  assert.deepEqual(validateEvent({ ...ok, startDate: '2026-11-01' }, TODAY, true), {});
  assert.ok(validateEvent({ ...ok, endDate: '2026-11-19' }, TODAY).endDate);
  assert.ok(validateEvent({ ...ok, cityId: 'niteroi' }, TODAY).cityId);
  assert.ok(validateEvent({ ...ok, category: 'x' }, TODAY).category);
  assert.ok(validateEvent({ ...ok, startTime: '25:00' }, TODAY).startTime);
  assert.ok(validateEvent({ ...ok, infoUrl: 'javascript:alert(1)' }, TODAY).infoUrl);
  assert.deepEqual(validateEvent({ ...ok, infoUrl: 'https://exemplo.com.br/x', startTime: '19:30' }, TODAY), {});
});

test('edição de evento publicado: só mudanças pequenas mantêm no ar', () => {
  const prev = ev({ status: 'published', title: 'Forró', description: 'a' });
  assert.equal(needsReapproval(prev, { priceText: 'R$ 20', startTime: '20:00' }), false);
  assert.equal(needsReapproval(prev, { title: 'Forró 2' }), true);
  assert.equal(needsReapproval(prev, { startDate: '2026-12-01' }), true);
  assert.equal(needsReapproval(prev, { cityId: 'cabo-frio' }), true);
  assert.equal(needsReapproval(prev, { title: 'Forró' }), false); // sem mudança real
  assert.equal(needsReapproval(ev({ status: 'pending' }), { title: 'Outro' }), false);
});

test('arquivo .ics: dia inteiro termina no dia seguinte; com horário usa hora local', () => {
  const day = buildICS(ev({ id: 'x', title: 'Festa, com; vírgula', startDate: '2026-11-13', endDate: '2026-11-15' }), new Date('2026-11-11T12:00:00Z'));
  assert.match(day, /DTSTART;VALUE=DATE:20261113/);
  assert.match(day, /DTEND;VALUE=DATE:20261116/);
  assert.ok(day.includes('SUMMARY:Festa\\, com\\; vírgula'));
  assert.match(day, /LOCATION:Arraial do Cabo/);
  const timed = buildICS(ev({ startDate: '2026-11-20', startTime: '19:30' }));
  assert.match(timed, /DTSTART:20261120T193000/);
  assert.ok(timed.includes('\r\n'));
});

test('calendário oficial 2026: ids únicos, datas válidas, cidade e categoria válidas, nada de feriado solto', () => {
  const ids = new Set<string>();
  for (const e of OFFICIAL_EVENTS_2026) {
    assert.ok(!ids.has(e.id), `id repetido: ${e.id}`);
    ids.add(e.id);
    assert.deepEqual(validateEvent({ ...e, startDate: e.startDate } as any, TODAY, true), {}, e.title);
    assert.ok(e.startDate.startsWith('2026-'), e.title);
    assert.equal(e.status, 'published');
    assert.equal(e.source, 'official');
  }
  assert.ok(OFFICIAL_EVENTS_2026.length >= 60);
  for (const feriado of ['Finados', 'Proclamação', 'Consciência Negra', 'Independência', 'Corpus Christi']) {
    assert.ok(!OFFICIAL_EVENTS_2026.some(e => e.title.includes(feriado)), feriado);
  }
});

test('calendário oficial: datas-chave conferem com a fonte', () => {
  const get = (t: string) => OFFICIAL_EVENTS_2026.filter(e => e.title.startsWith(t));
  const fm = get('Festival de Frutos do Mar')[0];
  assert.equal(fm.startDate, '2026-11-13'); assert.equal(fm.endDate, '2026-11-15');
  assert.equal(fm.locationName, 'Orla da Praia Grande');
  assert.equal(get('Carnaval')[0].startDate, '2026-02-13');
  assert.equal(get('Réveillon')[0].endDate, '2026-12-31');
  assert.equal(get('Festival da Lagoa')[0].startDate, '2026-12-04');
  assert.equal(get('Arraial Expo XP')[0].startDate, '2026-10-27');
  assert.deepEqual(get('Feira do Xaréu').map(e => e.startDate), [
    '2026-01-31', '2026-03-28', '2026-04-18', '2026-05-02', '2026-07-18', '2026-08-29', '2026-10-03', '2026-10-10', '2026-11-21', '2026-12-05',
  ]);
  // a partir de 11/11/2026 restam estes eventos oficiais
  const restantes = orderEvents(OFFICIAL_EVENTS_2026, 'arraial-do-cabo', TODAY).map(e => e.title);
  assert.equal(restantes.length, 10);
  assert.ok(restantes.includes('Réveillon 2027'));
});
