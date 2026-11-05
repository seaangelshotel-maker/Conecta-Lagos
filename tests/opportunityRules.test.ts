import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    canOwnerTransition, isAvailable, isExpired, validateOpportunity, formatCompensation,
    buildOpportunityFields, filterOpportunities, parseRequirements, OpportunityInput
} from '../services/opportunityRules';
import type { Opportunity } from '../types';

const TODAY = '2026-11-05';

const baseInput = (over: Partial<OpportunityInput> = {}): OpportunityInput => ({
    title: 'Marinheiro para saída de sábado',
    description: 'Precisamos de marinheiro com experiência para passeio de barco no sábado.',
    category: 'Náutica e passeios',
    type: 'temporario',
    recurrence: 'pontual',
    posterName: 'Barco Azul',
    cityId: 'arraial',
    startDate: '2026-11-08',
    compensationType: 'fixed',
    compensationMin: 200,
    compensationUnit: 'por dia',
    peopleNeeded: 1,
    contactMethod: 'in_app',
    ...over,
});

const opp = (over: Partial<Opportunity> = {}): Opportunity => ({
    id: 'o1', title: 'Atendente de bar', description: 'Atendimento no bar durante o passeio de barco.',
    category: 'Náutica e passeios', type: 'temporario', recurrence: 'pontual', ownerId: 'u1', posterName: 'Barco Azul',
    cityId: 'arraial', startDate: '2026-11-10', compensationType: 'to_agree', peopleNeeded: 1, contactMethod: 'in_app',
    status: 'published', isHidden: false, createdAt: '2026-11-01', updatedAt: '2026-11-01', ...over,
});

test('transições de status permitidas ao anunciante', () => {
    assert.equal(canOwnerTransition('draft', 'published'), true);
    assert.equal(canOwnerTransition('published', 'filled'), true);
    assert.equal(canOwnerTransition('filled', 'published'), true);
    assert.equal(canOwnerTransition('published', 'draft'), false);
    assert.equal(canOwnerTransition('closed', 'published'), false);
    assert.equal(canOwnerTransition('cancelled', 'published'), false);
    assert.equal(canOwnerTransition('closed', 'closed'), true);
});

test('oportunidades encerradas, canceladas, ocultas ou vencidas não aparecem como disponíveis', () => {
    assert.equal(isAvailable(opp(), TODAY), true);
    assert.equal(isAvailable(opp({ status: 'in_progress' }), TODAY), true);
    assert.equal(isAvailable(opp({ status: 'closed' }), TODAY), false);
    assert.equal(isAvailable(opp({ status: 'filled' }), TODAY), false);
    assert.equal(isAvailable(opp({ status: 'cancelled' }), TODAY), false);
    assert.equal(isAvailable(opp({ status: 'draft' }), TODAY), false);
    assert.equal(isAvailable(opp({ isHidden: true }), TODAY), false);
    assert.equal(isAvailable(opp({ startDate: '2026-11-01' }), TODAY), false);
    assert.equal(isExpired(opp({ recurrence: 'recorrente', startDate: '2026-01-01' }), TODAY), false);
    assert.equal(isExpired(opp({ recurrence: 'temporaria', startDate: '2026-10-01', endDate: '2026-12-01' }), TODAY), false);
});

test('validação de publicação', () => {
    assert.deepEqual(validateOpportunity(baseInput(), true, TODAY), {});
    assert.ok(validateOpportunity(baseInput({ title: 'Oi' }), true, TODAY).title);
    assert.ok(validateOpportunity(baseInput({ description: 'curta' }), true, TODAY).description);
    assert.ok(validateOpportunity(baseInput({ cityId: '' }), true, TODAY).cityId);
    assert.ok(validateOpportunity(baseInput({ startDate: '' }), true, TODAY).startDate);
    assert.ok(validateOpportunity(baseInput({ startDate: '2026-11-01' }), true, TODAY).endDate, 'data passada bloqueia publicação');
    assert.ok(validateOpportunity(baseInput({ endDate: '2026-11-07' }), true, TODAY).endDate, 'fim antes do início');
    assert.ok(validateOpportunity(baseInput({ peopleNeeded: 0 }), true, TODAY).peopleNeeded);
    assert.ok(validateOpportunity(baseInput({ compensationMin: 0 }), true, TODAY).compensationMin);
    assert.ok(validateOpportunity(baseInput({ compensationType: 'range', compensationMin: 300, compensationMax: 100 }), true, TODAY).compensationMax);
    assert.ok(validateOpportunity(baseInput({ contactMethod: 'whatsapp', contactValue: '123' }), true, TODAY).contactValue);
    assert.deepEqual(validateOpportunity(baseInput({ contactMethod: 'whatsapp', contactValue: '(22) 99999-0000' }), true, TODAY), {});
    assert.ok(validateOpportunity(baseInput({ contactMethod: 'email', contactValue: 'nao-e-email' }), true, TODAY).contactValue);
});

test('rascunho não exige data nem cidade, mas mantém formato', () => {
    assert.deepEqual(validateOpportunity(baseInput({ cityId: '', startDate: '' }), false, TODAY), {});
    assert.ok(validateOpportunity(baseInput({ title: '' }), false, TODAY).title);
    assert.ok(validateOpportunity(baseInput({ recurrence: 'recorrente', startDate: '' }), true, TODAY).startDate === undefined);
});

test('remuneração sempre deixa claro quando não está definida', () => {
    assert.match(formatCompensation({ compensationType: 'fixed', compensationMin: 200, compensationUnit: 'por dia' }), /200.*por dia/);
    assert.match(formatCompensation({ compensationType: 'range', compensationMin: 100, compensationMax: 150 }), /100.*a.*150/);
    assert.equal(formatCompensation({ compensationType: 'to_agree' }), 'Remuneração a combinar');
    assert.equal(formatCompensation({ compensationType: 'none' }), 'Sem remuneração (colaboração)');
    assert.equal(formatCompensation({ compensationType: 'fixed' }), 'Valor não informado');
});

test('campos gravados não incluem vazios e respeitam limites', () => {
    const f = buildOpportunityFields(baseInput({ requirementsText: '- Experiência\n\n• Habilitação náutica', locationDetail: '' }));
    assert.deepEqual(f.requirements, ['Experiência', 'Habilitação náutica']);
    assert.equal('locationDetail' in f, false);
    assert.equal('contactValue' in f, false);
    assert.equal(f.compensationMin, 200);
    const g = buildOpportunityFields(baseInput({ compensationType: 'to_agree', peopleNeeded: 999 }));
    assert.equal('compensationMin' in g, false);
    assert.equal(g.peopleNeeded, 500);
    assert.equal(parseRequirements(Array.from({ length: 30 }, (_, i) => `item ${i}`).join('\n')).length, 20);
});

test('filtros da listagem', () => {
    const list = [
        opp({ id: 'a', title: 'Marinheiro', cityId: 'arraial', compensationType: 'fixed', compensationMin: 200 }),
        opp({ id: 'b', title: 'Garçom', category: 'Bares e restaurantes', cityId: 'cabo-frio' }),
        opp({ id: 'c', title: 'Encerrada', status: 'closed' }),
        opp({ id: 'd', title: 'Recorrente', recurrence: 'recorrente', startDate: undefined }),
    ];
    assert.deepEqual(filterOpportunities(list, {}, TODAY).map(o => o.id), ['a', 'b', 'd']);
    assert.deepEqual(filterOpportunities(list, { cityId: 'cabo-frio' }, TODAY).map(o => o.id), ['b']);
    assert.deepEqual(filterOpportunities(list, { onlyPaid: true }, TODAY).map(o => o.id), ['a']);
    assert.deepEqual(filterOpportunities(list, { text: 'garcom' }, TODAY).map(o => o.id), ['b']);
    assert.deepEqual(filterOpportunities(list, { category: 'Bares e restaurantes' }, TODAY).map(o => o.id), ['b']);
    assert.deepEqual(filterOpportunities(list, { fromDate: '2026-11-20' }, TODAY).map(o => o.id), ['d']);
});
