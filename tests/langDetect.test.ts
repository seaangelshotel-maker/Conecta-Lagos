import test from 'node:test';
import assert from 'node:assert/strict';
import { detectFlag, shouldTranslate } from '../services/langDetect.ts';

test('detecta idioma do aparelho', () => {
    assert.equal(detectFlag(['pt-BR', 'en']), '🇧🇷');
    assert.equal(detectFlag(['pt-PT']), '🇵🇹');
    assert.equal(detectFlag(['es-AR']), '🇪🇸');
    assert.equal(detectFlag(['fr-CA']), '🇫🇷');
    assert.equal(detectFlag(['en-GB']), '🇺🇸');
    assert.equal(detectFlag(['de-DE']), '🇺🇸');
    assert.equal(detectFlag([]), '🇧🇷');
});
test('filtra o que não precisa de tradução', () => {
    assert.equal(shouldTranslate('R$ 150,00'), false);
    assert.equal(shouldTranslate('https://lagosgo.com.br'), false);
    assert.equal(shouldTranslate('contato@x.com'), false);
    assert.equal(shouldTranslate('Praia do Forno'), true);
});
