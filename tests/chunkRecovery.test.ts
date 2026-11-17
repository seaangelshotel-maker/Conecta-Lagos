import test from 'node:test';
import assert from 'node:assert/strict';
import { isChunkLoadError } from '../components/AppErrorBoundary';

test('reconhece erro de arquivo que sumiu depois de atualizar o site', () => {
  assert.equal(isChunkLoadError(new Error('Failed to fetch dynamically imported module: https://x/assets/a.js')), true);
  assert.equal(isChunkLoadError(new Error('error loading dynamically imported module')), true);
  assert.equal(isChunkLoadError({ message: 'Importing a module script failed.' }), true);
});
test('não confunde erro comum de tela com atualização', () => {
  assert.equal(isChunkLoadError(new Error("Cannot read properties of undefined (reading 'name')")), false);
  assert.equal(isChunkLoadError(undefined), false);
});
