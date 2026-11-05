import React, { useEffect, useState } from 'react';
import { Plus, ClipboardList, HandHeart, ChevronRight } from 'lucide-react';
import { Opportunity, OpportunityApplication, User, APPLICATION_STATUS_LABELS } from '../types';
import { listMyApplications, listMyOpportunities } from '../services/opportunityService';
import { OpportunityCard } from '../components/OpportunityCard';
import { PageHeader, SkeletonCards, EmptyState, ErrorState, Badge, primaryButton } from '../components/ui/States';

interface Props {
    currentUser: User;
    initialTab?: 'posts' | 'interests';
    onNavigate: (page: string, params?: any) => void;
}

export const MyOpportunities: React.FC<Props> = ({ currentUser, initialTab = 'posts', onNavigate }) => {
    const [tab, setTab] = useState<'posts' | 'interests'>(initialTab);
    const [posts, setPosts] = useState<Opportunity[]>([]);
    const [applications, setApplications] = useState<OpportunityApplication[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const [p, a] = await Promise.all([listMyOpportunities(), listMyApplications()]);
            setPosts(p);
            setApplications(a);
        } catch (e: any) {
            console.error('[minhas oportunidades]', e);
            setError(e?.code === 'failed-precondition' ? 'Esta área está sendo ativada. Tente novamente em alguns minutos.' : 'Não foi possível carregar suas publicações e interesses.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [currentUser.id]);

    return (
        <div className="min-h-screen bg-slate-50 pb-28">
            <PageHeader
                title="Minha Ajuda Colaborativa"
                onBack={() => onNavigate('opportunities')}
                action={
                    <button onClick={() => onNavigate('opportunity-form')} className="w-10 h-10 rounded-full bg-ocean-600 text-white flex items-center justify-center shadow-lg active:scale-95" aria-label="Publicar oportunidade">
                        <Plus size={20} />
                    </button>
                }
            />
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 space-y-4">
                <div className="bg-white rounded-2xl p-1 border border-slate-100 grid grid-cols-2" role="tablist">
                    <button role="tab" aria-selected={tab === 'posts'} onClick={() => setTab('posts')} className={`py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 ${tab === 'posts' ? 'bg-ocean-600 text-white' : 'text-slate-500'}`}>
                        <ClipboardList size={16} /> Publicações {posts.length > 0 && `(${posts.length})`}
                    </button>
                    <button role="tab" aria-selected={tab === 'interests'} onClick={() => setTab('interests')} className={`py-3 rounded-xl text-sm font-black flex items-center justify-center gap-2 ${tab === 'interests' ? 'bg-ocean-600 text-white' : 'text-slate-500'}`}>
                        <HandHeart size={16} /> Meus interesses {applications.length > 0 && `(${applications.length})`}
                    </button>
                </div>

                {loading ? <SkeletonCards count={3} /> : error ? <ErrorState message={error} onRetry={load} /> : tab === 'posts' ? (
                    posts.length === 0 ? (
                        <EmptyState
                            title="Você ainda não publicou nada"
                            message="Publique uma necessidade (ex.: atendente para um turno) ou ofereça seus serviços."
                            action={<button onClick={() => onNavigate('opportunity-form')} className={primaryButton}><Plus size={18} /> Publicar oportunidade</button>}
                        />
                    ) : (
                        <div className="space-y-3">
                            {posts.map(o => (
                                <div key={o.id} className="space-y-2">
                                    <OpportunityCard
                                        opportunity={o}
                                        showStatus
                                        onOpen={() => onNavigate(o.status === 'draft' ? 'opportunity-form' : 'opportunity-manage', { opportunityId: o.id })}
                                    />
                                    {o.isHidden && (
                                        <p className="text-xs font-bold text-red-600 px-2">Oculta pela moderação{o.hiddenReason ? `: ${o.hiddenReason}` : ''}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    )
                ) : (
                    applications.length === 0 ? (
                        <EmptyState
                            title="Nenhum interesse enviado"
                            message="Quando você demonstrar interesse em uma oportunidade, ela aparece aqui com o andamento."
                            action={<button onClick={() => onNavigate('opportunities')} className={primaryButton}>Ver oportunidades</button>}
                        />
                    ) : (
                        <div className="space-y-3">
                            {applications.map(a => (
                                <button
                                    key={a.opportunityId}
                                    onClick={() => onNavigate('opportunity-detail', { opportunityId: a.opportunityId })}
                                    className="w-full text-left bg-white rounded-3xl border border-slate-100 p-5 flex items-center gap-3 active:scale-[0.99] transition-all"
                                >
                                    <div className="flex-1 min-w-0">
                                        <p className="font-black text-ocean-950 truncate">{a.opportunityTitle}</p>
                                        <p className="text-[11px] font-bold text-slate-400 mt-0.5">Enviado em {new Date(a.createdAt).toLocaleDateString('pt-BR')}</p>
                                    </div>
                                    <Badge tone={a.status === 'selected' ? 'green' : a.status === 'declined' || a.status === 'withdrawn' ? 'slate' : 'ocean'}>
                                        {APPLICATION_STATUS_LABELS[a.status]}
                                    </Badge>
                                    <ChevronRight size={18} className="text-slate-300" />
                                </button>
                            ))}
                        </div>
                    )
                )}
            </div>
        </div>
    );
};
