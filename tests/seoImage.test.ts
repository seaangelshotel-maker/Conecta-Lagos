import { test } from 'node:test';
import assert from 'node:assert/strict';
import { httpImg } from '../server/seo';

test('dados estruturados só aceitam imagem com endereço (http/https)', () => {
    assert.equal(httpImg('https://x.com/a.jpg'), 'https://x.com/a.jpg');
    assert.equal(httpImg('data:image/jpeg;base64,/9j/4AAQ'), undefined);
    assert.equal(httpImg(''), undefined);
    assert.equal(httpImg(undefined), undefined);
});
