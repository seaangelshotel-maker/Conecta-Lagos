import React, { useEffect, useMemo, useState } from 'react';
import { Plus, Search, SlidersHorizontal, X, HandHeart, ClipboardList } from 'lucide-react';
import { City, Neighborhood, Opportunity, OPPORTUNITY_TYPE_LABELS, OpportunityType, User } from '../types';
import { getCities, getNeighborhoods } from '../services/dataService';
import { listPublicOpportunities } from '../services/opportunityService';
import { filterOpportunities, OPPORTUNITY_CATEGORIES, OpportunityFilters, todayISO } from '../services/opportunityRules';
import { OpportunityCard } from '../components/OpportunityCard';
import { EmptyState, ErrorState, SkeletonCards, inputClass, primaryButton } from '../components/ui/States';

interface Props {
    currentUser: User | null;
    onNavigate: (page: string, params?: any) => void;
}

const FILTERS_KEY = 'lagos_go_opp_filters_v1';

const loadFilters = (): OpportunityFilters => {
    try {
        return JSON.parse(sessionStorage.getItem(FILTERS_KEY) || '{}');
    } catch {
        return {};
    }
};

export const OpportunitiesPage: React.FC<Props> = ({ currentUser, onNavigate }) => {
    const [all, setAll] = useState<Opportunity[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState<OpportunityFilters>(loadFilters);
    const [showFilters, setShowFilters] = useState(false);
    const [cities, setCities] = useState<City[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const [opps, cts, nbs] = await Promise.all([listPublicOpportunities(), getCities(), getNeighborhoods()]);
            setAll(opps);
            setCities(cts.filter(c => c.active !== false));
            setNeighborhoods(nbs.filter(n => n.active !== false));
        } catch (e: any) {
            setError(e?.message || 'Não foi possível carregar as oportunidades.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    useEffect(() => {
        try { sessionStorage.setItem(FILTERS_KEY, JSON.stringify(filters)); } catch { /* sem armazenamento */ }
    }, [filters]);

    const visible = useMemo(() => filterOpportunities(all, filters), [all, filters]);
    const activeFilterCount = ['category', 'type', 'cityId', 'neighborhoodId', 'fromDate', 'onlyPaid']
        .filter(k => !!(filters as any)[k]).length;

    const set = (patch: Partial<OpportunityFilters>) => setFilters(prev => ({ ...prev, ...patch }));

    const goPublish = () => {
        if (!currentUser) return onNavigate('login');
        onNavigate('opportunity-form');
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-28">
            {/* Topo */}
            <div className="bg-gradient-to-br from-ocean-700 to-ocean-900 text-white px-4 md:px-6 pt-8 pb-16 rounded-b-[2.5rem]">
                <div className="max-w-5xl mx-auto">
                    <p className="text-[10px] font-black uppercase tracking-widest text-ocean-200 flex items-center gap-2">
                        <HandHeart size={14} /> Ajuda Colaborativa
                    </p>
                    <h1 className="text-2xl md:text-4xl font-black mt-2 leading-tight">Trabalhos, diárias e colaborações na região</h1>
                    <p className="text-ocean-100 text-sm mt-2 max-w-xl">
                        Empresas e pessoas publicam o que precisam; quem pode ajudar demonstra interesse. A combinação é feita diretamente entre as partes.
                    </p>
                    <div className="flex flex-wrap gap-2 mt-5">
                        <button onClick={goPublish} className="inline-flex items-center gap-2 bg-gold-500 text-ocean-950 font-black px-5 py-3 rounded-2xl active:scale-95 transition-all shadow-lg">
                            <Plus size={18} /> Publicar oportunidade
                        </button>
                        {currentUser && (
                            <button onClick={() => onNavigate('my-opportunities')} className="inline-flex items-center gap-2 bg-white/10 border border-white/20 text-white font-bold px-5 py-3 rounded-2xl active:scale-95 transition-all">
                                <ClipboardList size={18} /> Minhas publicações e interesses
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto px-4 md:px-6 -mt-8 space-y-4">
                {/* Busca */}
                <div className="bg-white rounded-3xl shadow-lg border border-slate-100 p-3 flex items-center gap-2">
                    <Search size={20} className="text-slate-400 ml-2 shrink-0" />
                    <input
                        type="search"
                        value={filters.text || ''}
                        onChange={e => set({ text: e.target.value })}
                        placeholder="Buscar: marinheiro, garçom, diária..."
                        className="flex-1 min-w-0 py-2 text-base md:text-sm font-medium outline-none bg-transparent"
                        aria-label="Buscar oportunidades"
                    />
                    <button
                        onClick={() => setShowFilters(v => !v)}
                        className={`relative shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-2xl font-bold text-sm ${showFilters || activeFilterCount ? 'bg-ocean-600 text-white' : 'bg-slate-100 text-slate-600'}`}
                        aria-expanded={showFilters}
                    >
                        <SlidersHorizontal size={16} /> Filtros
                        {activeFilterCount > 0 && <span className="bg-gold-500 text-ocean-950 text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center">{activeFilterCount}</span>}
                    </button>
                </div>

                {showFilters && (
                    <div className="bg-white rounded-3xl border border-slate-100 p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 animate-in fade-in">
                        <select className={inputClass()} value={filters.category || ''} onChange={e => set({ category: e.target.value })} aria-label="Categoria">
                            <option value="">Todas as categorias</option>
                            {OPPORTUNITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                        <select className={inputClass()} value={filters.type || ''} onChange={e => set({ type: e.target.value as OpportunityType | '' })} aria-label="Tipo">
                            <option value="">Todos os tipos</option>
                            {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                        <select className={inputClass()} value={filters.cityId || ''} onChange={e => set({ cityId: e.target.value, neighborhoodId: '' })} aria-label="Cidade">
                            <option value="">Todas as cidades</option>
                            {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select className={inputClass()} value={filters.neighborhoodId || ''} onChange={e => set({ neighborhoodId: e.target.value })} disabled={!filters.cityId} aria-label="Bairro">
                            <option value="">{filters.cityId ? 'Todos os bairros' : 'Escolha a cidade primeiro'}</option>
                            {neighborhoods.filter(n => n.cityId === filters.cityId).map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                        </select>
                        <label className="flex flex-col gap-1">
                            <span className="text-[11px] font-black text-slate-500 uppercase">A partir de</span>
                            <input type="date" min={todayISO()} className={inputClass()} value={filters.fromDate || ''} onChange={e => set({ fromDate: e.target.value })} />
                        </label>
                        <label className="flex items-center gap-3 bg-slate-50 rounded-2xl px-4 py-3 self-end cursor-pointer">
                            <input type="checkbox" checked={!!filters.onlyPaid} onChange={e => set({ onlyPaid: e.target.checked })} className="w-5 h-5 rounded text-ocean-600" />
                            <span className="text-sm font-bold text-slate-700">Somente com valor informado</span>
                        </label>
                        {activeFilterCount > 0 && (
                            <button onClick={() => setFilters({ text: filters.text })} className="sm:col-span-2 flex items-center justify-center gap-2 text-sm font-bold text-red-500 py-2">
                                <X size={16} /> Limpar filtros
                            </button>
                        )}
                    </div>
                )}

                {loading ? (
                    <SkeletonCards count={5} />
                ) : error ? (
                    <ErrorState message={error} onRetry={load} />
                ) : visible.length === 0 ? (
                    <EmptyState
                        icon={<HandHeart size={28} />}
                        title={all.length === 0 ? 'Ainda não há oportunidades abertas' : 'Nenhuma oportunidade com esses filtros'}
                        message={all.length === 0 ? 'Seja o primeiro a publicar uma necessidade ou oferecer seus serviços.' : 'Tente remover algum filtro ou buscar por outro termo.'}
                        action={<button onClick={goPublish} className={primaryButton}><Plus size={18} /> Publicar oportunidade</button>}
                    />
                ) : (
                    <>
                        <p className="text-xs font-bold text-slate-400 px-1">{visible.length} {visible.length === 1 ? 'oportunidade disponível' : 'oportunidades disponíveis'}</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {visible.map(o => (
                                <OpportunityCard key={o.id} opportunity={o} onOpen={() => onNavigate('opportunity-detail', { opportunityId: o.id })} />
                            ))}
                        </div>
                    </>
                )}

                <p className="text-[11px] text-slate-400 text-center px-6 pt-4 leading-relaxed">
                    A Lagos GO conecta quem precisa com quem pode ajudar. Não intermedia contratações nem garante vínculo empregatício,
                    pagamento ou condições de trabalho — confira tudo diretamente com o anunciante.
                </p>
            </div>
        </div>
    );
};
