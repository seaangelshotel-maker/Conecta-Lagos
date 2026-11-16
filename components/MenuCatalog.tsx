import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Minus, Plus, Search, Utensils } from 'lucide-react';
import type { MenuItem, MenuSection } from '../types';
import { cartAdd, formatBRL, isAvailable, type Cart } from '../services/orderModel';

interface Props {
    menu: MenuSection[];
    ordersOn: boolean;
    cart: Cart;
    setCart: React.Dispatch<React.SetStateAction<Cart>>;
}

const norm = (s: string) => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const slug = (s: string, i: number) => 'sec-' + i + '-' + norm(s).replace(/[^a-z0-9]+/g, '-');

/** Cardápio por categorias: abas fixas, busca, foto do prato e botão de adicionar. */
export const MenuCatalog: React.FC<Props> = ({ menu, ordersOn, cart, setCart }) => {
    const [q, setQ] = useState('');
    const [active, setActive] = useState(0);
    const chipsRef = useRef<HTMLDivElement>(null);
    const total = useMemo(() => menu.reduce((n, s) => n + (s.items?.length || 0), 0), [menu]);
    const query = norm(q.trim());

    const sections = useMemo(() => menu
        .map((s, i) => ({ ...s, key: slug(s.title, i), items: (s.items || []).filter(it => !query || norm(it.name + ' ' + (it.description || '')).includes(query)) }))
        .filter(s => s.items.length > 0), [menu, query]);

    useEffect(() => {
        if (!sections.length || typeof IntersectionObserver === 'undefined') return;
        const obs = new IntersectionObserver(entries => {
            const vis = entries.filter(e => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0];
            if (vis) { const i = sections.findIndex(s => s.key === vis.target.id); if (i >= 0) setActive(i); }
        }, { rootMargin: '-20% 0px -65% 0px' });
        sections.forEach(s => { const el = document.getElementById(s.key); if (el) obs.observe(el); });
        return () => obs.disconnect();
    }, [sections]);

    useEffect(() => {
        const chip = chipsRef.current?.children[active] as HTMLElement | undefined;
        chip?.scrollIntoView?.({ inline: 'center', block: 'nearest', behavior: 'smooth' });
    }, [active]);

    const go = (i: number) => {
        setActive(i);
        document.getElementById(sections[i].key)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    };

    const card = (item: MenuItem) => {
        const qty = cart[item.id]?.qty || 0;
        const off = !isAvailable(item);
        return (
            <div data-testid="menu-item" className={`flex gap-4 bg-white rounded-3xl border border-slate-100 p-4 shadow-sm ${off ? 'opacity-55' : ''}`}>
                <div className="flex-1 min-w-0 flex flex-col">
                    <h4 className="font-black text-[15px] text-ocean-950 leading-snug">{item.name}</h4>
                    {item.description && <p className="text-xs text-slate-500 mt-1 leading-relaxed line-clamp-3">{item.description}</p>}
                    <div className="mt-auto pt-3 flex items-center gap-2">
                        <span className="font-black text-emerald-700 text-base">{item.price > 0 ? formatBRL(item.price) : 'Sob consulta'}</span>
                        {off && <span className="text-[10px] font-black uppercase tracking-wide text-red-500 bg-red-50 px-2 py-0.5 rounded-full">Esgotado</span>}
                    </div>
                </div>
                <div className="relative shrink-0 w-28 h-28">
                    {item.imageUrl
                        ? <img src={item.imageUrl} alt={item.name} loading="lazy" className="w-full h-full object-cover rounded-2xl" />
                        : <div className="w-full h-full rounded-2xl bg-gradient-to-br from-ocean-50 to-slate-100 flex items-center justify-center text-ocean-200"><Utensils size={30} /></div>}
                    {ordersOn && !off && (
                        <div className="absolute -bottom-2 -right-2 flex items-center bg-white rounded-full shadow-lg border border-slate-100">
                            {qty > 0 && <>
                                <button onClick={() => setCart(c => cartAdd(c, item, -1))} className="w-9 h-9 flex items-center justify-center text-ocean-700" aria-label="Diminuir"><Minus size={16} /></button>
                                <span className="font-black w-5 text-center text-sm" data-testid="item-qty">{qty}</span>
                            </>}
                            <button onClick={() => setCart(c => cartAdd(c, item, 1))} data-testid="item-add" className="w-9 h-9 rounded-full bg-amber-400 text-ocean-950 flex items-center justify-center shadow" aria-label="Adicionar"><Plus size={18} strokeWidth={3} /></button>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    return (
        <div data-testid="menu-catalog">
            <div className="sticky top-0 z-10 -mx-6 px-6 pt-3 pb-3 bg-white/95 backdrop-blur border-b border-slate-100 space-y-3">
                {total > 8 && (
                    <div className="relative">
                        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Buscar no cardápio" aria-label="Buscar no cardápio"
                            className="w-full bg-slate-50 border border-slate-100 rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-ocean-950 outline-none focus:ring-2 focus:ring-ocean-200" />
                    </div>
                )}
                {sections.length > 1 && (
                    <div ref={chipsRef} className="flex gap-2 overflow-x-auto hide-scrollbar" role="tablist" aria-label="Categorias do cardápio">
                        {sections.map((s, i) => (
                            <button key={s.key} role="tab" aria-selected={active === i} onClick={() => go(i)}
                                className={`shrink-0 px-4 py-2 rounded-full text-xs font-black uppercase tracking-wide transition-colors ${active === i ? 'bg-ocean-600 text-white' : 'bg-slate-100 text-slate-500'}`}>
                                {s.title}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            <div className="space-y-10 pt-6">
                {sections.map(s => (
                    <section key={s.key} id={s.key} className="scroll-mt-32 space-y-4">
                        <div className="flex items-baseline gap-3">
                            <h3 className="text-xl font-black text-ocean-950">{s.title}</h3>
                            <span className="text-xs font-bold text-slate-400">{s.items.length} {s.items.length === 1 ? 'item' : 'itens'}</span>
                            <div className="flex-1 h-px bg-slate-100" />
                        </div>
                        <div className="space-y-4">{s.items.map(it => <React.Fragment key={it.id}>{card(it)}</React.Fragment>)}</div>
                    </section>
                ))}
                {sections.length === 0 && <p className="text-center py-16 text-slate-400 text-sm">Nada encontrado para “{q}”.</p>}
            </div>
        </div>
    );
};
