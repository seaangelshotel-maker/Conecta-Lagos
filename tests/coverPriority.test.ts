import test from 'node:test';
import assert from 'node:assert/strict';
import { prioritizeWithCover } from '../services/discoverLogic';

test('quem tem capa vem primeiro, ordem estável', () => {
  const l: any[] = [{ id: 'a', coverImage: '' }, { id: 'b', coverImage: 'x' }, { id: 'c', coverImage: '' }, { id: 'd', coverImage: 'y' }];
  assert.deepEqual(prioritizeWithCover(l).map(b => b.id), ['b', 'd', 'a', 'c']);
});
