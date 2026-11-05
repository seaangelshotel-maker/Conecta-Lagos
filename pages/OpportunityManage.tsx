import React, { useEffect, useState } from 'react';
import { Pencil, Eye, Phone, MessageCircle, Mail, History, Users, Trash2 } from 'lucide-react';
import {
    Opportunity, OpportunityApplication, OpportunityHistoryEntry, OpportunityStatus, ApplicationStatus, User, UserRole,
    OPPORTUNITY_STATUS_LABELS, APPLICATION_STATUS_LABELS
} from '../types';
import {
    getOpportunity, listApplications, setApplicationStatus, changeOpportunityStatus, getOpportunityHistory, deleteDraftOpportunity
} from '../services/opportunityService';
import { nextOwnerStatuses, isFinalStatus } from '../services/opportunityRules';
import { useNotification } from '../components/NotificationSystem';
import { PageHeader, LoadingState, EmptyState, ErrorState, Badge, primaryButton, secondaryButton } from '../components/ui/States';

interface Props {
    opportunityId: string;
    currentUser: User;
    onNavigate: (page: string, params?: any) => void;
}

const STATUS_ACTION_LABELS: Partial<Record<OpportunityStatus, string>> = {
    published: 'Reabrir / publicar',
    in_progress: 'Marcar "em andamento"',
    filled: 'Marcar como preenchida',
    closed: 'Encerrar',
    cancelled: 'Cancelar publicação',
};

const contactLinks = (contact?: string) => {
    if (!contact) return null;
    const v = contact.trim();
    if (v.includes('@')) return { kind: 'email' as const, href: `mailto:${v}` };
    const digits = v.replace(/\D/g, '');
    if (digits.length >= 10) {
        const intl = digits.length <= 11 ? `55${digits}` : digits;
        return { kind: 'phone' as const, href: `tel:+${intl}`, wa: `https://wa.me/${intl}` };
    }
    return null;
};

export const OpportunityManage: React.FC<Props> = ({ opportunityId, currentUser, onNavigate }) => {
    const { notify, confirm } = useNotification();
    const [opp, setOpp] = useState<Opportunity | null>(null);
    const [apps, setApps] = useState<OpportunityApplication[]>([]);
    const [history, setHistory] = useState<OpportunityHistoryEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [busy, setBusy] = useState<string | null>(null);
    const [showHistory, setShowHistory] = useState(false);

    const isAdmin = currentUser.role === UserRole.SUPER_ADMIN;

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const o = await getOpportunity(opportunityId);
            if (!o || (o.ownerId !== currentUser.id && !isAdmin)) {
                setOpp(null);
            } else {
                setOpp(o);
                const [a, h] = await Promise.all([listApplications(o.id), getOpportunityHistory(o.id).catch(() => [])]);
                setApps(a);
                setHistory(h);
            }
        } catch (e: any) {
            setError(e?.message || 'Erro ao carregar.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [opportunityId]);

    if (loading) return <div className="min-h-screen bg-slate-50"><PageHeader title="Gerenciar" onBack={() => onNavigate('my-opportunities')} /><LoadingState /></div>;
    if (error) return <div className="min-h-screen bg-slate-50"><PageHeader title="Gerenciar" onBack={() => onNavigate('my-opportunities')} /><div className="max-w-3xl mx-auto p-4"><ErrorState message={error} onRetry={load} /></div></div>;
    if (!opp) return <div className="min-h-screen bg-slate-50"><PageHeader title="Gerenciar" onBack={() => onNavigate('my-opportunities')} /><div className="max-w-3xl mx-auto p-4"><EmptyState title="Publicação não encontrada" message="Ela não existe ou não pertence à sua conta." /></div></div>;

    const changeStatus = async (to: OpportunityStatus) => {
        const final = isFinalStatus(to);
        if (final && !(await confirm({ title: STATUS_ACTION_LABELS[to] || 'Alterar status', message: 'Depois de encerrada ou cancelada, a publicação não pode ser reaberta. Continuar?' }))) return;
        setBusy(`status:${to}`);
        try {
            const updated = await changeOpportunityStatus(opp, to);
            setOpp(updated);
            notify('success', `Status: ${OPPORTUNITY_STATUS_LABELS[to]}`);
            getOpportunityHistory(opp.id).then(setHistory).catch(() => undefined);
        } catch (e: any) {
            notify('error', e?.message || 'Erro ao alterar status.');
        } finally {
            setBusy(null);
        }
    };

    const changeApp = async (a: OpportunityApplication, status: ApplicationStatus) => {
        setBusy(`app:${a.applicantId}`);
        try {
            await setApplicationStatus(opp.id, a.applicantId, status);
            setApps(list => list.map(x => x.applicantId === a.applicantId ? { ...x, status } : x));
        } catch (e: any) {
            notify('error', e?.message || 'Erro ao atualizar.');
        } finally {
            setBusy(null);
        }
    };

    const removeDraft = async () => {
        if (!(await confirm({ title: 'Excluir rascunho', message: 'O rascunho será apagado definitivamente.' }))) return;
        try {
            await deleteDraftOpportunity(opp);
            notify('success', 'Rascunho excluído.');
            onNavigate('my-opportunities');
        } catch (e: any) {
            notify('error', e?.message || 'Erro ao excluir.');
        }
    };

    const active = apps.filter(a => a.status !== 'withdrawn');
    const statuses = isAdmin ? (['published', 'in_progress', 'filled', 'closed', 'cancelled'] as OpportunityStatus[]).filter(s => s !== opp.status) : nextOwnerStatuses(opp.status);

    return (
        <div className="min-h-screen bg-slate-50 pb-28">
            <PageHeader title="Gerenciar publicação" subtitle={opp.title} onBack={() => onNavigate('my-opportunities')} />
            <div className="max-w-3xl mx-auto px-4 md:px-6 py-4 space-y-4">
                <section className="bg-white rounded-3xl border border-slate-100 p-5 space-y-4">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <h2 className="font-black text-ocean-950 leading-snug">{opp.title}</h2>
                            <p className="text-[11px] font-bold text-slate-400 mt-1">Atualizada em {new Date(opp.updatedAt).toLocaleString('pt-BR')}</p>
                        </div>
                        <Badge tone={opp.status === 'published' || opp.status === 'in_progress' ? 'green' : 'slate'}>{OPPORTUNITY_STATUS_LABELS[opp.status]}</Badge>
                    </div>
                    {opp.isHidden && <p className="text-xs font-bold text-red-600 bg-red-50 rounded-xl px-3 py-2">Oculta pela moderação{opp.hiddenReason ? `: ${opp.hiddenReason}` : ''}. Fale com o suporte para revisar.</p>}
                    <div className="flex flex-wrap gap-2">
                        {opp.status !== 'draft' && (
                            <button onClick={() => onNavigate('opportunity-detail', { opportunityId: opp.id })} className={`${secondaryButton} !px-4 !py-2.5 text-sm`}><Eye size={16} /> Ver publicação</button>
                        )}
                        {opp.ownerId === currentUser.id && !isFinalStatus(opp.status) && (
                            <button onClick={() => onNavigate('opportunity-form', { opportunityId: opp.id })} className={`${secondaryButton} !px-4 !py-2.5 text-sm`}><Pencil size={16} /> Editar</button>
                        )}
                        {opp.status === 'draft' && (
                            <button onClick={removeDraft} className={`${secondaryButton} !px-4 !py-2.5 text-sm !text-red-600`}><Trash2 size={16} /> Excluir rascunho</button>
                        )}
                    </div>
                    {statuses.length > 0 && (
                        <div className="border-t border-slate-100 pt-4">
                            <p className="text-[11px] font-black uppercase tracking-wide text-slate-400 mb-2">Atualizar status</p>
                            <div className="flex flex-wrap gap-2">
                                {statuses.map(s => (
                                    <button
                                        key={s}
                                        disabled={!!busy}
                                        onClick={() => changeStatus(s)}
                                        className={`px-4 py-2.5 rounded-xl text-sm font-bold border active:scale-95 transition-all disabled:opacity-50 ${isFinalStatus(s) ? 'border-red-100 text-red-600 bg-red-50' : 'border-ocean-100 text-ocean-700 bg-ocean-50'}`}
                                    >
                                        {STATUS_ACTION_LABELS[s]}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </section>

                <section className="space-y-3">
                    <h3 className="font-black text-ocean-950 flex items-center gap-2 px-1"><Users size={18} /> Interessados ({active.length})</h3>
                    {apps.length === 0 ? (
                        <EmptyState title="Ainda sem interessados" message={opp.status === 'draft' ? 'Publique a oportunidade para receber interessados.' : 'Compartilhe o link da publicação para alcançar mais pessoas.'} />
                    ) : apps.map(a => {
                        const links = contactLinks(a.applicantContact);
                        const withdrawn = a.status === 'withdrawn';
                        return (
                            <article key={a.applicantId} className={`bg-white rounded-3xl border border-slate-100 p-5 space-y-3 ${withdrawn ? 'opacity-60' : ''}`}>
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="font-black text-ocean-950">{a.applicantName}</p>
                                        <p className="text-[11px] font-bold text-slate-400">{new Date(a.createdAt).toLocaleString('pt-BR')}</p>
                                    </div>
                                    <Badge tone={a.status === 'selected' ? 'green' : a.status === 'contacted' ? 'ocean' : 'slate'}>{APPLICATION_STATUS_LABELS[a.status]}</Badge>
                                </div>
                                {a.message && <p className="text-sm text-slate-600 whitespace-pre-line bg-slate-50 rounded-2xl px-4 py-3">{a.message}</p>}
                                {a.applicantContact && (
                                    <div className="flex flex-wrap items-center gap-2">
                                        <span className="text-sm font-bold text-ocean-950 break-all">{a.applicantContact}</span>
                                        {links?.kind === 'phone' && (
                                            <>
                                                <a href={links.wa} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-black text-emerald-700 bg-emerald-50 px-3 py-2 rounded-xl"><MessageCircle size={14} /> WhatsApp</a>
                                                <a href={links.href} className="inline-flex items-center gap-1 text-xs font-black text-ocean-700 bg-ocean-50 px-3 py-2 rounded-xl"><Phone size={14} /> Ligar</a>
                                            </>
                                        )}
                                        {links?.kind === 'email' && (
                                            <a href={links.href} className="inline-flex items-center gap-1 text-xs font-black text-ocean-700 bg-ocean-50 px-3 py-2 rounded-xl"><Mail size={14} /> E-mail</a>
                                        )}
                                    </div>
                                )}
                                {!withdrawn && (
                                    <div className="flex flex-wrap gap-2 pt-1">
                                        {(['contacted', 'selected', 'declined'] as ApplicationStatus[]).filter(s => s !== a.status).map(s => (
                                            <button
                                                key={s}
                                                disabled={busy === `app:${a.applicantId}`}
                                                onClick={() => changeApp(a, s)}
                                                className="px-3 py-2 rounded-xl text-xs font-black border border-slate-200 text-slate-600 bg-white active:scale-95 disabled:opacity-50"
                                            >
                                                {s === 'contacted' ? 'Marcar contato feito' : s === 'selected' ? 'Selecionar' : 'Não selecionar'}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </section>

                <section className="bg-white rounded-3xl border border-slate-100 p-5">
                    <button onClick={() => setShowHistory(v => !v)} className="w-full flex items-center justify-between font-black text-ocean-950" aria-expanded={showHistory}>
                        <span className="flex items-center gap-2"><History size={18} /> Histórico de alterações</span>
                        <span className="text-xs text-slate-400">{showHistory ? 'Ocultar' : 'Mostrar'}</span>
                    </button>
                    {showHistory && (
                        <ul className="mt-4 space-y-2">
                            {history.length === 0 ? <li className="text-sm text-slate-400">Sem registros.</li> : history.map(h => (
                                <li key={h.id} className="text-xs text-slate-600 flex gap-2">
                                    <span className="font-bold text-slate-400 shrink-0">{new Date(h.at).toLocaleString('pt-BR')}</span>
                                    <span>
                                        {h.action === 'created' && 'Criada'}
                                        {h.action === 'updated' && 'Editada'}
                                        {h.action === 'status_changed' && `Status: ${h.fromStatus ? OPPORTUNITY_STATUS_LABELS[h.fromStatus] : '—'} → ${h.toStatus ? OPPORTUNITY_STATUS_LABELS[h.toStatus] : '—'}`}
                                        {h.action === 'hidden' && 'Ocultada pela moderação'}
                                        {h.action === 'unhidden' && 'Liberada pela moderação'}
                                        {h.note ? ` — ${h.note}` : ''}
                                        {h.actorId !== opp.ownerId ? ' (administração)' : ''}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    )}
                </section>

                {opp.status === 'draft' && (
                    <button onClick={() => onNavigate('opportunity-form', { opportunityId: opp.id })} className={`${primaryButton} w-full`}>Continuar editando e publicar</button>
                )}
            </div>
        </div>
    );
};
