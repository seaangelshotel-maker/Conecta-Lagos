import { test } from 'node:test';
import assert from 'node:assert/strict';
import { safeLink } from '../server/pushLink';

test('link da notificação só abre telas do próprio app', () => {
  assert.equal(safeLink('/guia/praia-do-forno'), '/guia/praia-do-forno');
  assert.equal(safeLink('/'), '/');
  assert.equal(safeLink('https://evil.com'), '/');
  assert.equal(safeLink('//evil.com'), '/');
  assert.equal(safeLink('/\\evil.com'), '/');
  assert.equal(safeLink('javascript:alert(1)'), '/');
  assert.equal(safeLink(undefined), '/');
});

import { startOfDayBRT, limitReached, MAX_PUSH_PER_DAY } from '../server/pushLimit';

test('trava de avisos: o dia começa à meia-noite de Brasília e o limite barra o 3º envio', () => {
  // 15/11 16:00 em Brasília = 19:00 UTC → o dia começou 15/11 03:00 UTC
  assert.equal(startOfDayBRT(Date.parse('2026-11-15T19:00:00Z')), '2026-11-15T03:00:00.000Z');
  // 15/11 01:00 em Brasília = 04:00 UTC → ainda é o dia 15
  assert.equal(startOfDayBRT(Date.parse('2026-11-15T04:00:00Z')), '2026-11-15T03:00:00.000Z');
  // 15/11 00:30 UTC = 14/11 21:30 em Brasília → ainda é o dia 14
  assert.equal(startOfDayBRT(Date.parse('2026-11-15T00:30:00Z')), '2026-11-14T03:00:00.000Z');
  assert.equal(limitReached(MAX_PUSH_PER_DAY - 1), false);
  assert.equal(limitReached(MAX_PUSH_PER_DAY), true);
});
