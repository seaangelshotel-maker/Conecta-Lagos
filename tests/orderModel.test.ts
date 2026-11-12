import test from 'node:test';
import assert from 'node:assert/strict';
import { canOrder, whatsappNumber, orderTarget, cartAdd, cartTotal, cartLines, cartCount, cartSetNote, validateOrder, buildOrderMessage, whatsappUrl } from '../services/orderModel.ts';

const menu = [{ title: 'Pratos', items: [
    { id: 'a', name: 'Moqueca', price: 80, description: '' },
    { id: 'b', name: 'Suco', price: 12.5 },
    { id: 'c', name: 'Esgotado', price: 10, available: false },
] }];

test('plano libera pedidos', () => {
    assert.equal(canOrder(null), false);
    assert.equal(canOrder({ showMenu: true, price: 0 }), false);
    assert.equal(canOrder({ showMenu: true, price: 99.9 }), true);
    assert.equal(canOrder({ showOrders: false, showMenu: true, price: 99 }), false);
    assert.equal(canOrder({ showOrders: true }), true);
});
test('números de WhatsApp', () => {
    assert.equal(whatsappNumber('(22) 99999-1234'), '5522999991234');
    assert.equal(whatsappNumber('+55 22 99999-1234'), '5522999991234');
    assert.equal(whatsappNumber('123'), '');
    assert.equal(orderTarget({ orderWhatsapp: '', whatsapp: '22999991234' }), '5522999991234');
    assert.equal(orderTarget({ orderWhatsapp: '21988887777', whatsapp: '22999991234' }), '5521988887777');
    assert.equal(orderTarget({}), '');
});
test('carrinho', () => {
    let c = cartAdd({}, menu[0].items[0]);
    c = cartAdd(c, menu[0].items[0]);
    c = cartAdd(c, menu[0].items[1]);
    c = cartAdd(c, menu[0].items[2]); // esgotado não entra
    assert.equal(cartCount(c), 3);
    assert.equal(cartTotal(c, menu), 172.5);
    c = cartSetNote(c, 'a', 'sem pimenta');
    c = cartAdd(c, menu[0].items[1], -1);
    assert.equal(cartLines(c, menu).length, 1);
    assert.equal(cartLines(c, [{ title: 'x', items: [] }]).length, 0); // item removido do cardápio
});
test('validação e mensagem', () => {
    const c = cartSetNote(cartAdd({}, menu[0].items[0], 2), 'a', 'sem pimenta');
    assert.match(validateOrder('menu', {}, menu, { name: 'Ana' })!, /item/);
    assert.match(validateOrder('menu', c, menu, { name: '' })!, /nome/);
    assert.match(validateOrder('menu', c, menu, { name: 'Ana', delivery: 'delivery' })!, /endereço/);
    assert.equal(validateOrder('menu', c, menu, { name: 'Ana', delivery: 'pickup' }), null);
    assert.match(validateOrder('services', c, menu, { name: 'Ana' })!, /data/);
    const msg = buildOrderMessage('Bistrô', 'menu', c, menu, { name: 'Ana', delivery: 'delivery', address: 'Rua 1, 10' });
    assert.match(msg, /2x Moqueca — R\$ 160,00/);
    assert.match(msg, /Obs\.: sem pimenta/);
    assert.match(msg, /Total estimado: R\$ 160,00/);
    assert.match(msg, /Entrega em: Rua 1, 10/);
    const sv = buildOrderMessage('Barco', 'services', c, menu, { name: 'Ana', date: 'sábado de manhã', people: 4 });
    assert.match(sv, /solicitar/); assert.match(sv, /Pessoas: 4/);
    assert.ok(whatsappUrl('5522999991234', 'a b').startsWith('https://wa.me/5522999991234?text=a%20b'));
});
