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
