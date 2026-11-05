import React, { useEffect, useState } from 'react';
import {
    CalendarDays, MapPin, Users, Wallet, Clock, CheckCircle2, Flag, Share2, MessageCircle, Phone, Mail,
    Pencil, ClipboardList, Info, Repeat, Building2
} from 'lucide-react';
import {
    Opportunity, OpportunityApplication, User, OPPORTUNITY_TYPE_LABELS, OPPORTUNITY_STATUS_LABELS,
    OPPORTUNITY_RECURRENCE_LABELS, APPLICATION_STATUS_LABELS, UserRole
} from '../types';
import {
    getOpportunity, getMyApplication, applyToOpportunity, withdrawApplication, recordOpportunityView
} from '../services/opportunityService';
import { formatCompensation, isAvailable } from '../services/opportunityRules';
import { opportunityWhen } from '../components/OpportunityCard';
import { ReportDialog } from '../components/ReportDialog';
import { useNotification } from '../components/NotificationSystem';
import { SEO } from '../components/SEO';
import {
    PageHeader, LoadingState, EmptyState, ErrorState, Badge, Field, inputClass, primaryButton, secondaryButton
} from '../components/ui/States';

interface Props {
    opportunityId: string;
    currentUser: User | null;
    onNavigate: (page: string, params?: any) => void;
}

const contactHref = (o: Opportunity) => {
    const v = o.contactValue || '';
    const digits = v.replace(/\D/g, '');
    const intl = digits.length <= 11 ? `55${digits}` : digits;
    if (o.contactMethod === 'whatsapp') return `https://wa.me/${intl}?text=${encodeURIComponent(`Olá! Vi a oportunidade "${o.title}" na Lagos GO.`)}`;
    if (o.contactMethod === 'phone') return `tel:+${intl}`;
    if (o.contactMethod === 'email') return `mailto:${v}?subject=${encodeURIComponent(`Oportunidade: ${o.title}`)}`;
    return '';
};

export const OpportunityDetail: React.FC<Props> = ({ opportunityId, currentUser, onNavigate }) => {
    const { notify, confirm } = useNotification();
    const [opp, setOpp] = useState<Opportunity | null>(null);
    const [application, setApplication] = useState<OpportunityApplication | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showApply, setShowApply] = useState(false);
    const [message, setMessage] = useState('');
    const [contact, setContact] = useState(currentUser?.phone || '');
    const [sending, setSending] = useState(false);
    const [showReport, setShowReport] = useState(false);

    const load = async () => {
        setLoading(true);
        setError(null);
        try {
            const o = await getOpportunity(opportunityId);
            setOpp(o);
            if (o) {
                recordOpportunityView(o);
                if (currentUser) setApplication(await getMyApplication(o.id));
            }
        } catch (e: any) {
            setError(e?.message || 'Erro ao carregar.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { load(); }, [opportunityId, currentUser?.id]);

    if (loading) return <div className="min-h-screen bg-slate-50"><PageHeader title="Oportunidade" onBack={() => onNavigate('opportunities')} /><LoadingState /></div>;
    if (error) return <div className="min-h-screen bg-slate-50"><PageHeader title="Oportunidade" onBack={() => onNavigate('opportunities')} /><div className="p-4 max-w-3xl mx-auto"><ErrorState message={error} onRetry={load} /></div></div>;
    if (!opp) {
        return (
            <div className="min-h-screen bg-slate-50">
                <PageHeader title="Oportunidade" onBack={() => onNavigate('opportunities')} />
                <div className="p-4 max-w-3xl mx-auto">
                    <EmptyState title="Oportunidade indisponível" message="Ela pode ter sido encerrada, cancelada ou removida." action={<button onClick={() => onNavigate('opportunities')} className={primaryButton}>Ver oportunidades abertas</button>} />
                </div>
            </div>
        );
    }

    const isOwner = currentUser?.id === opp.ownerId;
    const isAdmin = currentUser?.role === UserRole.SUPER_ADMIN;
    const available = isAvailable(opp);
    const hasActiveApplication = application && application.status !== 'withdrawn';

    const startApply = () => {
        if (!currentUser) return onNavigate('login');
        setShowApply(true);
    };

    const submitApplication = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);
        try {
            const app = await applyToOpportunity(opp, message, contact);
            setApplication({ ...app, status: 'interested' });
            setShowApply(false);
            notify('success', 'Interesse enviado! O anunciante vai ver seu contato.');
        } catch (err: any) {
            notify('error', err?.message || 'Erro ao enviar interesse.');
        } finally {
            setSending(false);
        }
    };

    const withdraw = async () => {
        if (!(await confirm({ title: 'Desistir', message: 'Deseja retirar seu interesse nesta oportunidade?' }))) return;
        try {
            await withdrawApplication(opp.id);
            setApplication(a => a ? { ...a, status: 'withdrawn' } : a);
            notify('success', 'Interesse retirado.');
        } catch (err: any) {
            notify('error', err?.message || 'Erro ao retirar interesse.');
        }
    };

    const share = async () => {
        const url = `${window.location.origin}/ajuda/${opp.id}`;
        try {
            if (navigator.share) await navigator.share({ title: opp.title, url });
            else {
                await navigator.clipboard.writeText(url);
                notify('success', 'Link copiado!');
            }
        } catch { /* usuário cancelou */ }
    };

    const directContact = contactHref(opp);

    return (
        <div className="min-h-screen bg-slate-50 pb-32">
            <SEO title={`${opp.title} | Ajuda Colaborativa`} description={opp.description.slice(0, 150)} />
            <PageHeader
                title="Oportunidade"
                subtitle={opp.category}
                onBack={() => onNavigate('opportunities')}
                action={
                    <button onClick={share} className="w-10 h-10 rounded-full flex items-center justify-center text-ocean-700 hover:bg-slate-100" aria-label="Compartilhar">
                        <Share2 size={20} />
                    </button>
                }
            />

            <div className="max-w-3xl mx-auto px-4 md:px-6 py-5 space-y-4">
                {!available && (
                    <div className="bg-amber-50 border border-amber-100 text-amber-800 rounded-2xl px-4 py-3 text-sm font-bold flex items-start gap-2">
                        <Info size={18} className="shrink-0 mt-0.5" />
                        {opp.isHidden ? `Publicação oculta pela moderação. ${opp.hiddenReason || ''}` : `Esta oportunidade não está recebendo interessados (${OPPORTUNITY_STATUS_LABELS[opp.status].toLowerCase()}${opp.status === 'published' || opp.status === 'in_progress' ? ', data já passou' : ''}).`}
                    </div>
                )}

                <section className="bg-white rounded-3xl border border-slate-100 p-5 md:p-7 space-y-4">
                    <div className="flex flex-wrap gap-2">
                        <Badge tone="ocean">{OPPORTUNITY_TYPE_LABELS[opp.type]}</Badge>
                        <Badge tone={available ? 'green' : 'slate'}>{OPPORTUNITY_STATUS_LABELS[opp.status]}</Badge>
                    </div>
                    <h1 className="text-2xl font-black text-ocean-950 leading-tight">{opp.title}</h1>
                    <p className="text-sm font-bold text-slate-500 flex items-center gap-2">
                        <Building2 size={16} className="text-slate-400" /> {opp.posterName}
                    </p>

                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        <InfoRow icon={<CalendarDays size={18} />} label="Quando" value={opportunityWhen(opp)} />
                        <InfoRow icon={<Repeat size={18} />} label="Frequência" value={OPPORTUNITY_RECURRENCE_LABELS[opp.recurrence]} />
                        {opp.schedule && <InfoRow icon={<Clock size={18} />} label="Horário / duração" value={opp.schedule} />}
                        <InfoRow icon={<MapPin size={18} />} label="Local" value={[opp.locationDetail, opp.neighborhoodName, opp.cityName].filter(Boolean).join(' · ') || 'A combinar'} />
                        <InfoRow icon={<Wallet size={18} />} label="Remuneração" value={formatCompensation(opp)} />
                        <InfoRow icon={<Users size={18} />} label="Pessoas necessárias" value={String(opp.peopleNeeded)} />
                    </dl>
                </section>

                <section className="bg-white rounded-3xl border border-slate-100 p-5 md:p-7 space-y-3">
                    <h2 className="font-black text-ocean-950">Descrição</h2>
                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{opp.description}</p>
                </section>

                {opp.requirements && opp.requirements.length > 0 && (
                    <section className="bg-white rounded-3xl border border-slate-100 p-5 md:p-7 space-y-3">
                        <h2 className="font-black text-ocean-950">Requisitos e qualificações</h2>
                        <ul className="space-y-2">
                            {opp.requirements.map((r, i) => (
                                <li key={i} className="flex items-start gap-2 text-sm text-slate-600"><CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0" />{r}</li>
                            ))}
                        </ul>
                    </section>
                )}

                {opp.additionalInfo && (
                    <section className="bg-white rounded-3xl border border-slate-100 p-5 md:p-7 space-y-3">
                        <h2 className="font-black text-ocean-950">Informações adicionais</h2>
                        <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-line">{opp.additionalInfo}</p>
                    </section>
                )}

                <p className="text-[11px] text-slate-400 leading-relaxed px-1">
                    A Lagos GO apenas conecta as partes. Não há garantia de contratação, de pagamento ou de vínculo empregatício.
                    Combine valores, horários e condições diretamente com o anunciante e desconfie de pedidos de pagamento antecipado.
                </p>

                {currentUser && !isOwner && (
                    <button onClick={() => setShowReport(true)} className="flex items-center gap-2 text-xs font-bold text-red-500 px-1 py-2">
                        <Flag size={14} /> Denunciar esta publicação
                    </button>
                )}
            </div>

            {/* Barra de ação fixa (estilo app) */}
            <div className="fixed above-bottom-nav inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 py-3">
                <div className="max-w-3xl mx-auto flex gap-3">
                    {isOwner || isAdmin ? (
                        <>
                            {isOwner && (
                                <button onClick={() => onNavigate('opportunity-form', { opportunityId: opp.id })} className={`${secondaryButton} flex-1`}>
                                    <Pencil size={18} /> Editar
                                </button>
                            )}
                            <button onClick={() => onNavigate('opportunity-manage', { opportunityId: opp.id })} className={`${primaryButton} flex-1`}>
                                <ClipboardList size={18} /> Gerenciar interessados
                            </button>
                        </>
                    ) : hasActiveApplication ? (
                        <>
                            <div className="flex-1 flex items-center gap-2 text-sm font-bold text-emerald-700 bg-emerald-50 rounded-2xl px-4">
                                <CheckCircle2 size={18} /> {APPLICATION_STATUS_LABELS[application!.status]}
                            </div>
                            {application!.status === 'interested' && (
                                <button onClick={withdraw} className={secondaryButton}>Desistir</button>
                            )}
                        </>
                    ) : available ? (
                        <>
                            {directContact && (
                                <a href={directContact} target="_blank" rel="noopener noreferrer" className={`${secondaryButton} flex-1`} aria-label="Falar com o anunciante">
                                    {opp.contactMethod === 'whatsapp' ? <MessageCircle size={18} /> : opp.contactMethod === 'phone' ? <Phone size={18} /> : <Mail size={18} />}
                                    Contato
                                </a>
                            )}
                            <button onClick={startApply} className={`${primaryButton} flex-1`}>
                                Tenho interesse
                            </button>
                        </>
                    ) : (
                        <button onClick={() => onNavigate('opportunities')} className={`${secondaryButton} flex-1`}>Ver outras oportunidades</button>
                    )}
                </div>
            </div>

            {showApply && (
                <div className="fixed inset-0 z-[100] bg-ocean-950/50 backdrop-blur-sm flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-labelledby="apply-title">
                    <form onSubmit={submitApplication} className="bg-white w-full md:max-w-md rounded-t-[2rem] md:rounded-[2rem] p-6 space-y-4 sheet-safe-bottom">
                        <h2 id="apply-title" className="text-lg font-black text-ocean-950">Demonstrar interesse</h2>
                        <p className="text-sm text-slate-500">O anunciante verá seu nome, sua mensagem e o contato abaixo. Mais ninguém.</p>
                        <Field label="Seu contato" htmlFor="apply-contact" hint="WhatsApp, telefone ou e-mail" required={opp.contactMethod === 'in_app'}>
                            <input id="apply-contact" className={inputClass()} value={contact} onChange={e => setContact(e.target.value)} maxLength={200} inputMode="tel" autoComplete="tel" />
                        </Field>
                        <Field label="Mensagem" htmlFor="apply-msg" hint="Conte sua experiência e disponibilidade (opcional)">
                            <textarea id="apply-msg" className={inputClass()} rows={4} maxLength={1000} value={message} onChange={e => setMessage(e.target.value)} />
                        </Field>
                        <div className="flex gap-3">
                            <button type="button" onClick={() => setShowApply(false)} className={`${secondaryButton} flex-1`}>Cancelar</button>
                            <button type="submit" disabled={sending} className={`${primaryButton} flex-1`}>{sending ? 'Enviando...' : 'Enviar'}</button>
                        </div>
                    </form>
                </div>
            )}

            {showReport && (
                <ReportDialog targetType="opportunity" targetId={opp.id} targetTitle={opp.title} onClose={() => setShowReport(false)} />
            )}
        </div>
    );
};

const InfoRow: React.FC<{ icon: React.ReactNode; label: string; value: string }> = ({ icon, label, value }) => (
    <div className="flex items-start gap-3 bg-slate-50 rounded-2xl px-4 py-3">
        <span className="text-ocean-500 mt-0.5">{icon}</span>
        <div className="min-w-0">
            <dt className="text-[10px] font-black uppercase tracking-wide text-slate-400">{label}</dt>
            <dd className="text-sm font-bold text-ocean-950 break-words">{value}</dd>
        </div>
    </div>
);
