/**
 * Pedidos por WhatsApp (sem pagamento e sem comissão): lógica pura e testável.
 * O cliente monta o pedido no perfil da empresa e o app abre o WhatsApp da loja com a mensagem pronta.
 */
import type { MenuSection, MenuItem } from '../types';

export type OrderMode = 'menu' | 'services';

export interface CartLine { itemId: string; qty: number; note?: string }
export type Cart = Record<string, CartLine>;

export interface OrderCustomer {
    name: string;
    /** Cardápio: endereço de entrega ou "retirada". Serviços: não usado. */
    address?: string;
    /** Serviços: data/horário desejado. */
    date?: string;
    /** Serviços: quantidade de pessoas. */
    people?: number;
    /** Cardápio: forma de recebimento. */
    delivery?: 'delivery' | 'pickup';
    note?: string;
}

/** Quem pode receber pedidos: o plano libera (showOrders) ou, em planos antigos sem o campo, qualquer plano pago com cardápio. */
export const canOrder = (plan?: { showOrders?: boolean; showMenu?: boolean; price?: number } | null): boolean => {
    if (!plan) return false;
    if (typeof plan.showOrders === 'boolean') return plan.showOrders;
    return plan.showMenu === true && (plan.price || 0) > 0;
};

export const digitsOnly = (s?: string) => (s || '').replace(/\D/g, '');

/** Número para wa.me: aceita (22) 99999-9999, +55..., etc. Retorna '' se inválido. */
export const whatsappNumber = (raw?: string): string => {
    let d = digitsOnly(raw);
    if (d.startsWith('00')) d = d.slice(2);
    if (d.length === 10 || d.length === 11) d = '55' + d;
    return d.length >= 12 && d.length <= 13 ? d : '';
};

export const orderTarget = (biz: { orderWhatsapp?: string; whatsapp?: string; phone?: string }): string =>
    whatsappNumber(biz.orderWhatsapp) || whatsappNumber(biz.whatsapp) || whatsappNumber(biz.phone);

export const formatBRL = (n: number) => 'R$ ' + (Number.isFinite(n) ? n : 0).toFixed(2).replace('.', ',');

export const isAvailable = (item: MenuItem) => item.available !== false;

export const flattenItems = (menu: MenuSection[] = []): MenuItem[] => menu.flatMap(s => s.items || []);

export const cartAdd = (cart: Cart, item: MenuItem, delta = 1): Cart => {
    if (!isAvailable(item)) return cart;
    const cur = cart[item.id];
    const qty = Math.max(0, Math.min(99, (cur?.qty || 0) + delta));
    const next = { ...cart };
    if (qty === 0) delete next[item.id]; else next[item.id] = { itemId: item.id, qty, note: cur?.note };
    return next;
};

export const cartSetNote = (cart: Cart, itemId: string, note: string): Cart =>
    cart[itemId] ? { ...cart, [itemId]: { ...cart[itemId], note: note.slice(0, 140) } } : cart;

export const cartCount = (cart: Cart) => Object.values(cart).reduce((a, l) => a + l.qty, 0);

/** Linhas do carrinho cruzadas com o cardápio atual (itens removidos/esgotados saem). */
export const cartLines = (cart: Cart, menu: MenuSection[] = []) => {
    const byId = new Map(flattenItems(menu).map(i => [i.id, i]));
    return Object.values(cart)
        .map(l => ({ ...l, item: byId.get(l.itemId) }))
        .filter((l): l is CartLine & { item: MenuItem } => !!l.item && isAvailable(l.item) && l.qty > 0);
};

export const cartTotal = (cart: Cart, menu: MenuSection[] = []) =>
    cartLines(cart, menu).reduce((a, l) => a + (l.item.price || 0) * l.qty, 0);

export const validateOrder = (mode: OrderMode, cart: Cart, menu: MenuSection[], c: OrderCustomer): string | null => {
    if (!cartLines(cart, menu).length) return mode === 'services' ? 'Escolha pelo menos um serviço.' : 'Adicione pelo menos um item.';
    if (!c.name.trim()) return 'Informe seu nome.';
    if (mode === 'menu' && c.delivery === 'delivery' && !(c.address || '').trim()) return 'Informe o endereço de entrega.';
    if (mode === 'services' && !(c.date || '').trim()) return 'Informe a data ou período desejado.';
    return null;
};

export const buildOrderMessage = (bizName: string, mode: OrderMode, cart: Cart, menu: MenuSection[], c: OrderCustomer): string => {
    const lines = cartLines(cart, menu);
    const total = cartTotal(cart, menu);
    const out: string[] = [];
    out.push(`Olá, ${bizName}! Vim pela Lagos GO e gostaria de ${mode === 'services' ? 'solicitar' : 'fazer um pedido'}:`, '');
    for (const l of lines) {
        out.push(`• ${l.qty}x ${l.item.name}${l.item.price > 0 ? ` — ${formatBRL(l.item.price * l.qty)}` : ''}`);
        if (l.note?.trim()) out.push(`   Obs.: ${l.note.trim()}`);
    }
    out.push('');
    if (total > 0) out.push(`Total estimado: ${formatBRL(total)}`);
    out.push(`Nome: ${c.name.trim()}`);
    if (mode === 'menu') {
        out.push(c.delivery === 'delivery' ? `Entrega em: ${(c.address || '').trim()}` : 'Retirada no local');
    } else {
        out.push(`Data/período: ${(c.date || '').trim()}`);
        if (c.people && c.people > 0) out.push(`Pessoas: ${c.people}`);
    }
    if (c.note?.trim()) out.push(`Observações: ${c.note.trim()}`);
    out.push('', '(Pedido enviado pelo app Lagos GO — valores e disponibilidade sujeitos a confirmação.)');
    return out.join('\n');
};

export const whatsappUrl = (number: string, message: string) => `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
