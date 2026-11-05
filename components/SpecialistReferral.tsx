import React, { useEffect, useState } from 'react';
import { Compass, MessageCircle, ExternalLink } from 'lucide-react';
import { SpecialistReferralSettings } from '../types';
import { getGlobalSettings } from '../services/dataService';
import { recordInteraction } from '../services/interactionService';

/**
 * Encaminhamento para atendimento especializado (ex.: Guida Trips).
 * - Só aparece quando ativado e configurado pelo administrador.
 * - Identificado como operação do ecossistema (sem prioridade oculta no guia).
 * - Cada clique gera um evento `specialist_referral` com a origem.
 */
export const SpecialistReferral: React.FC<{ source: string; compact?: boolean }> = ({ source, compact }) => {
    const [cfg, setCfg] = useState<SpecialistReferralSettings | null>(null);

    useEffect(() => {
        getGlobalSettings().then(s => {
            const sp = s.specialistReferral;
            if (sp?.enabled && (sp.whatsapp || sp.url)) setCfg(sp);
        }).catch(() => undefined);
    }, []);

    if (!cfg) return null;

    const open = () => {
        recordInteraction('specialist_referral', 'specialist', { source });
        if (cfg.whatsapp) {
            const digits = cfg.whatsapp.replace(/\D/g, '');
            const number = digits.length <= 11 ? `55${digits}` : digits;
            const text = encodeURIComponent('Olá! Vim pela Lagos GO e gostaria de ajuda para montar meu roteiro.');
            window.open(`https://wa.me/${number}?text=${text}`, '_blank', 'noopener');
        } else if (cfg.url) {
            const url = new URL(cfg.url);
            url.searchParams.set('utm_source', 'lagosgo');
            url.searchParams.set('utm_medium', source);
            window.open(url.toString(), '_blank', 'noopener');
        }
    };

    return (
        <div className={`bg-gradient-to-br from-emerald-50 to-ocean-50 border border-emerald-100 rounded-3xl ${compact ? 'p-4' : 'p-5 md:p-6'} flex flex-col sm:flex-row sm:items-center gap-4`}>
            <div className="w-12 h-12 rounded-2xl bg-white text-emerald-600 flex items-center justify-center shadow-sm shrink-0">
                <Compass size={24} />
            </div>
            <div className="flex-1 min-w-0">
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700">Atendimento especializado</p>
                <p className="font-black text-ocean-950 leading-snug">Quer ajuda para montar seu roteiro?</p>
                <p className="text-xs text-slate-600 mt-0.5">{cfg.description || `${cfg.partnerName} ajuda você a planejar passeios e experiências.`}</p>
                <p className="text-[10px] text-slate-400 mt-1">{cfg.partnerName} · operação do ecossistema Lagos GO</p>
            </div>
            <button onClick={open} className="inline-flex items-center justify-center gap-2 bg-emerald-600 text-white font-black px-5 py-3 rounded-2xl active:scale-95 transition-all shrink-0">
                {cfg.whatsapp ? <MessageCircle size={18} /> : <ExternalLink size={18} />} Falar com {cfg.partnerName}
            </button>
        </div>
    );
};
