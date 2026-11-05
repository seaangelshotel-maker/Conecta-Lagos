import React from 'react';
import { CalendarDays, MapPin, Users, Wallet, Clock } from 'lucide-react';
import { Opportunity, OPPORTUNITY_TYPE_LABELS, OPPORTUNITY_STATUS_LABELS } from '../types';
import { formatCompensation, isAvailable } from '../services/opportunityRules';
import { Badge } from './ui/States';

export const formatDateBR = (iso?: string) => {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return y && m && d ? `${d}/${m}/${y}` : iso;
};

export const opportunityWhen = (o: Opportunity) => {
    if (o.recurrence === 'recorrente') return o.schedule ? `Recorrente · ${o.schedule}` : 'Recorrente';
    if (o.startDate && o.endDate && o.endDate !== o.startDate) return `${formatDateBR(o.startDate)} a ${formatDateBR(o.endDate)}`;
    if (o.startDate) return formatDateBR(o.startDate);
    return 'Data a combinar';
};

export const OpportunityCard: React.FC<{ opportunity: Opportunity; onOpen: () => void; showStatus?: boolean }> = ({ opportunity: o, onOpen, showStatus }) => {
    const available = isAvailable(o);
    return (
        <button
            onClick={onOpen}
            className="w-full flex flex-col items-stretch justify-start text-left bg-white rounded-3xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-ocean-100 active:scale-[0.99] transition-all"
        >
            <div className="flex flex-wrap items-center gap-2 mb-2">
                <Badge tone="ocean">{OPPORTUNITY_TYPE_LABELS[o.type]}</Badge>
                <span className="text-[11px] font-bold text-slate-400">{o.category}</span>
                {showStatus && (
                    <Badge tone={available ? 'green' : 'slate'}>{OPPORTUNITY_STATUS_LABELS[o.status]}</Badge>
                )}
                {o.status === 'in_progress' && !showStatus && <Badge tone="amber">Em seleção</Badge>}
            </div>
            <h3 className="font-black text-ocean-950 text-base leading-snug line-clamp-2">{o.title}</h3>
            <p className="text-xs font-bold text-slate-500 mt-1 truncate">{o.posterName}</p>

            <div className="grid grid-cols-2 gap-x-3 gap-y-2 mt-4 text-[12px] font-bold text-slate-600">
                <span className="flex items-center gap-1.5 min-w-0">
                    <CalendarDays size={14} className="text-ocean-500 shrink-0" />
                    <span className="truncate">{opportunityWhen(o)}</span>
                </span>
                <span className="flex items-center gap-1.5 min-w-0">
                    <MapPin size={14} className="text-ocean-500 shrink-0" />
                    <span className="truncate">{[o.neighborhoodName, o.cityName].filter(Boolean).join(', ') || 'Local a combinar'}</span>
                </span>
                <span className="flex items-center gap-1.5 min-w-0">
                    <Wallet size={14} className="text-emerald-500 shrink-0" />
                    <span className="truncate">{formatCompensation(o)}</span>
                </span>
                <span className="flex items-center gap-1.5 min-w-0">
                    {o.schedule && o.recurrence !== 'recorrente' ? (
                        <><Clock size={14} className="text-ocean-500 shrink-0" /><span className="truncate">{o.schedule}</span></>
                    ) : (
                        <><Users size={14} className="text-ocean-500 shrink-0" /><span className="truncate">{o.peopleNeeded} {o.peopleNeeded === 1 ? 'pessoa' : 'pessoas'}</span></>
                    )}
                </span>
            </div>
        </button>
    );
};
