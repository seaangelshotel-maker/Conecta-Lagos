import React, { useState } from 'react';
import { Compass, Ticket, HandHeart, Store, X } from 'lucide-react';

const KEY = 'lagos_go_onboarding_seen_v1';

/**
 * Apresentação rápida do que dá para fazer na Lagos GO, sem exigir que a
 * pessoa entenda a estrutura interna (perfis, papéis, painéis).
 */
export const WhatYouCanDo: React.FC<{ onNavigate: (page: string) => void; isLoggedIn: boolean }> = ({ onNavigate, isLoggedIn }) => {
    const [hidden, setHidden] = useState(() => {
        try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
    });
    if (hidden) return null;

    const dismiss = () => {
        try { localStorage.setItem(KEY, '1'); } catch { /* sem armazenamento */ }
        setHidden(true);
    };

    const items = [
        { icon: <Compass size={22} />, title: 'Descobrir lugares', text: 'Restaurantes, passeios, hospedagem e serviços', page: 'guide', tone: 'text-ocean-600 bg-ocean-50' },
        { icon: <Ticket size={22} />, title: 'Usar cupons', text: 'Benefícios em empresas da região', page: 'search', tone: 'text-amber-600 bg-amber-50' },
        { icon: <HandHeart size={22} />, title: 'Trabalhos e ajuda', text: 'Diárias, vagas e colaborações perto de você', page: 'opportunities', tone: 'text-emerald-600 bg-emerald-50' },
        { icon: <Store size={22} />, title: 'Divulgar meu negócio', text: 'Coloque sua empresa no guia', page: isLoggedIn ? 'pricing-plans' : 'login', tone: 'text-purple-600 bg-purple-50' },
    ];

    return (
        <section className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-5 md:p-6 relative" aria-labelledby="wycd-title">
            <button onClick={dismiss} className="absolute top-3 right-3 p-2 text-slate-300 hover:text-slate-500" aria-label="Fechar apresentação"><X size={18} /></button>
            <h2 id="wycd-title" className="font-black text-ocean-950 text-lg pr-8">O que você pode fazer na Lagos GO</h2>
            <p className="text-xs text-slate-500 mt-1">Uma conta só serve para tudo: morar, visitar, empreender e colaborar.</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                {items.map(i => (
                    <button key={i.title} onClick={() => { dismiss(); onNavigate(i.page); }} className="flex flex-col items-start justify-start text-left rounded-2xl border border-slate-100 p-4 hover:border-ocean-100 active:scale-95 transition-all">
                        <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${i.tone}`}>{i.icon}</span>
                        <p className="font-black text-ocean-950 text-sm mt-3 leading-tight">{i.title}</p>
                        <p className="text-[11px] text-slate-500 mt-1 leading-snug">{i.text}</p>
                    </button>
                ))}
            </div>
        </section>
    );
};
