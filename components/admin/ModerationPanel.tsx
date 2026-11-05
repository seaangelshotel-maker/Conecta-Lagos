import React, { useEffect, useMemo, useState } from 'react';
import { EyeOff, Eye, Flag, CheckCircle2, XCircle, ExternalLink, UserX, UserCheck } from 'lucide-react';
import { ContentReport, Opportunity, OPPORTUNITY_STATUS_LABELS, User } from '../../types';
import { adminListOpportunities, adminListReports, adminResolveReport, adminSetHidden } from '../../services/opportunityService';
import { getAllUsers, setUserBlocked } from '../../services/dataService';
import { useNotification } from '../NotificationSystem';
import { Badge, EmptyState, ErrorState, LoadingState } from '../ui/States';

/**
 * Moderação da Ajuda Colaborativa: denúncias, ocultar/liberar publicações
 * e bloquear/desbloquear o responsável. Tudo fica registrado no histórico.
 */
export const ModerationPanel: React.FC<{ onNavigate: (page: string, params?: any) => void }> = ({ onNavigate }) => {
    const { notify, confirm } = useNotification();
    const [tab, setTab] = useState<'reports' | 'opportunities'>('reports');
    const [reports, setReports] = useState<ContentReport[]>([]);
    const [opps, setOpps] = useState<Opportunity[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showResolved, setShowResolved] = useState(false);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const [r, o, u] = await Promise.all([adminListReports(), adminListOpportunities(), getAllUsers()]);
            setReports(r);
            setOpps(o);
            setUsers(u);
        } catch (e: any) {
            setError(e?.message || 'Erro ao carregar moderação.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, []);

    const oppById = useMemo(() => new Map(opps.map(o => [o.id, o])), [opps]);
    const userById = useMemo(() => new Map(users.map(u => [u.id, u])), [users]);
    const openReports = reports.filter(r => r.status === 'open');
    const visibleReports = showResolved ? reports : openReports;

    const toggleHidden = async (o: Opportunity) => {
        let reason: string | undefined;
        if (!o.isHidden) {
            reason = window.prompt('Motivo para ocultar (será mostrado ao anunciante):', 'Publicação em análise pela moderação') || undefined;
            if (reason === undefined) return;
        }
        try {
            await adminSetHidden(o, !o.isHidden, reason);
            notify('success', o.isHidden ? 'Publicação liberada.' : 'Publicação ocultada.');
            load();
        } catch (e: any) {
            notify('error', e?.message || 'Erro ao moderar.');
        }
    };

    const toggleUserBlock = async (userId: string) => {
        const u = userById.get(userId);
        if (!u) return notify('error', 'Usuário não encontrado.');
        const blocking = !u.isBlocked;
        if (blocking && !(await confirm({ title: 'Bloquear usuário', message: `${u.name} não poderá publicar, se candidatar nem avaliar. Continuar?` }))) return;
        try {
            await setUserBlocked(userId, blocking);
            notify('success', blocking ? 'Usuário bloqueado.' : 'Usuário desbloqueado.');
            load();
        } catch (e: any) {
            notify('error', e?.message || 'Erro ao atualizar usuário.');
        }
    };

    const resolve = async (r: ContentReport, status: 'resolved' | 'dismissed') => {
        try {
            await adminResolveReport(r.id, status);
            setReports(list => list.map(x => x.id === r.id ? { ...x, status } : x));
        } catch (e: any) {
            notify('error', e?.message || 'Erro ao atualizar denúncia.');
        }
    };

    if (loading) return <LoadingState label="Carregando moderação..." />;
    if (error) return <ErrorState message={error} onRetry={load} />;

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center gap-2">
                <button onClick={() => setTab('reports')} className={`px-5 py-3 rounded-2xl text-xs font-black ${tab === 'reports' ? 'bg-ocean-600 text-white' : 'bg-white border border-slate-100 text-ocean-600'}`}>
                    DENÚNCIAS {openReports.length > 0 && `(${openReports.length})`}
                </button>
                <button onClick={() => setTab('opportunities')} className={`px-5 py-3 rounded-2xl text-xs font-black ${tab === 'opportunities' ? 'bg-ocean-600 text-white' : 'bg-white border border-slate-100 text-ocean-600'}`}>
                    OPORTUNIDADES ({opps.length})
                </button>
            </div>

            {tab === 'reports' ? (
                <div className="space-y-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-slate-500">
                        <input type="checkbox" checked={showResolved} onChange={e => setShowResolved(e.target.checked)} /> Mostrar denúncias já tratadas
                    </label>
                    {visibleReports.length === 0 ? (
                        <EmptyState icon={<Flag size={28} />} title="Nenhuma denúncia em aberto" />
                    ) : visibleReports.map(r => {
                        const o = r.targetType === 'opportunity' ? oppById.get(r.targetId) : undefined;
                        return (
                            <div key={r.id} className="bg-white rounded-3xl border border-slate-100 p-5 space-y-3">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-black text-ocean-950">{r.reason}</p>
                                        <p className="text-xs font-bold text-slate-400">{r.targetType === 'opportunity' ? 'Oportunidade' : r.targetType} · {r.targetTitle || r.targetId} · {new Date(r.createdAt).toLocaleString('pt-BR')}</p>
                                    </div>
                                    <Badge tone={r.status === 'open' ? 'red' : 'slate'}>{r.status === 'open' ? 'Aberta' : r.status === 'resolved' ? 'Resolvida' : 'Descartada'}</Badge>
                                </div>
                                {r.details && <p className="text-sm text-slate-600 bg-slate-50 rounded-2xl px-4 py-3 whitespace-pre-line">{r.details}</p>}
                                <div className="flex flex-wrap gap-2">
                                    {o && (
                                        <>
                                            <button onClick={() => onNavigate('opportunity-manage', { opportunityId: o.id })} className="px-3 py-2 rounded-xl text-xs font-black bg-slate-50 text-slate-700 flex items-center gap-1"><ExternalLink size={14} /> Abrir</button>
                                            <button onClick={() => toggleHidden(o)} className="px-3 py-2 rounded-xl text-xs font-black bg-amber-50 text-amber-700 flex items-center gap-1">{o.isHidden ? <><Eye size={14} /> Liberar</> : <><EyeOff size={14} /> Ocultar</>}</button>
                                            <button onClick={() => toggleUserBlock(o.ownerId)} className="px-3 py-2 rounded-xl text-xs font-black bg-red-50 text-red-600 flex items-center gap-1">
                                                {userById.get(o.ownerId)?.isBlocked ? <><UserCheck size={14} /> Desbloquear anunciante</> : <><UserX size={14} /> Bloquear anunciante</>}
                                            </button>
                                        </>
                                    )}
                                    {r.status === 'open' && (
                                        <>
                                            <button onClick={() => resolve(r, 'resolved')} className="px-3 py-2 rounded-xl text-xs font-black bg-emerald-50 text-emerald-700 flex items-center gap-1"><CheckCircle2 size={14} /> Resolvida</button>
                                            <button onClick={() => resolve(r, 'dismissed')} className="px-3 py-2 rounded-xl text-xs font-black bg-slate-50 text-slate-500 flex items-center gap-1"><XCircle size={14} /> Descartar</button>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="space-y-3">
                    {opps.length === 0 ? (
                        <EmptyState title="Nenhuma oportunidade publicada ainda" />
                    ) : opps.map(o => (
                        <div key={o.id} className="bg-white rounded-3xl border border-slate-100 p-5 flex flex-col md:flex-row md:items-center gap-3">
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-ocean-950 truncate">{o.title}</p>
                                <p className="text-xs font-bold text-slate-400">{o.posterName} · {userById.get(o.ownerId)?.email || o.ownerId} · {new Date(o.updatedAt).toLocaleDateString('pt-BR')}</p>
                            </div>
                            <div className="flex flex-wrap gap-2 items-center">
                                <Badge tone={o.status === 'published' || o.status === 'in_progress' ? 'green' : 'slate'}>{OPPORTUNITY_STATUS_LABELS[o.status]}</Badge>
                                {o.isHidden && <Badge tone="red">Oculta</Badge>}
                                <button onClick={() => onNavigate('opportunity-manage', { opportunityId: o.id })} className="px-3 py-2 rounded-xl text-xs font-black bg-slate-50 text-slate-700">Abrir</button>
                                <button onClick={() => toggleHidden(o)} className="px-3 py-2 rounded-xl text-xs font-black bg-amber-50 text-amber-700">{o.isHidden ? 'Liberar' : 'Ocultar'}</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
