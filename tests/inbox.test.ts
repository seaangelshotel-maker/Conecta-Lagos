import { test } from 'node:test';
import assert from 'node:assert/strict';
import { addToInbox, mergeInbox, unreadCount, INBOX_MAX, InboxItem } from '../services/inboxRules.js';

const it = (n: number, extra: Partial<InboxItem> = {}): InboxItem => ({ id: `i${n}`, title: `T${n}`, body: 'b', link: '/', at: `2026-11-${String(n).padStart(2, '0')}T10:00:00.000Z`, ...extra });

test('addToInbox: mais novo no topo, sem repetir e limitado a 20', () => {
  let l: InboxItem[] = [];
  for (let n = 1; n <= 25; n++) l = addToInbox(l, it(n));
  assert.equal(l.length, INBOX_MAX);
  assert.equal(l[0].id, 'i25');
  assert.equal(addToInbox(l, it(25)).filter(x => x.id === 'i25').length, 1);
});
test('mergeInbox junta gerais e pessoais por data, sem repetidos', () => {
  const m = mergeInbox([it(1), it(3)], [it(2), it(3)]);
  assert.deepEqual(m.map(x => x.id), ['i3', 'i2', 'i1']);
  assert.deepEqual(mergeInbox(undefined, undefined), []);
});
test('unreadCount: tudo é novo sem "visto"; depois só o que chegou depois', () => {
  const l = [it(1), it(2), it(3)];
  assert.equal(unreadCount(l, null), 3);
  assert.equal(unreadCount(l, '2026-11-02T10:00:00.000Z'), 1);
  assert.equal(unreadCount(l, '2026-12-01T00:00:00.000Z'), 0);
});
