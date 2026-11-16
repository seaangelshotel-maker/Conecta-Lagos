import { test } from 'node:test';
import assert from 'node:assert/strict';
import { menuProgress, MENU_GOAL } from '../services/orderModel';

const item = (i: number, over: object = {}) => ({ id: 'i' + i, name: 'Prato ' + i, price: 20, description: 'Frango grelhado com arroz e salada', imageUrl: 'data:x', ...over });

test('meta de 15 itens completos (nome, preço, foto e descrição)', () => {
    const menu = [{ title: 'Pratos', items: Array.from({ length: 15 }, (_, i) => item(i)) }];
    const p = menuProgress(menu as any);
    assert.equal(MENU_GOAL, 15);
    assert.equal(p.done, true);
    assert.equal(p.pct, 100);
    assert.equal(p.missingItems, 0);
});

test('item sem foto, sem descrição ou sem preço não conta; "Novo Item" ignorado', () => {
    const menu = [{ title: 'Pratos', items: [item(1), item(2, { imageUrl: undefined }), item(3, { description: 'curto' }), item(4, { price: 0 }), item(5, { name: 'Novo Item' })] }];
    const p = menuProgress(menu as any);
    assert.equal(p.total, 4);
    assert.equal(p.complete, 1);
    assert.equal(p.withPhoto, 3);
    assert.equal(p.done, false);
    assert.equal(p.missingItems, 14);
});

test('cardápio vazio', () => {
    assert.equal(menuProgress(undefined).pct, 0);
});
