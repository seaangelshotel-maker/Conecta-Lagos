import React, { useEffect, useMemo, useState } from 'react';
import { Save, Send } from 'lucide-react';
import {
    BusinessProfile, City, CompensationType, ContactMethod, Neighborhood, Opportunity, OpportunityRecurrence, OpportunityType, User,
    OPPORTUNITY_TYPE_LABELS, OPPORTUNITY_RECURRENCE_LABELS, COMPENSATION_LABELS
} from '../types';
import { getCities, getNeighborhoods, getMyBusinesses } from '../services/dataService';
import { createOpportunity, getOpportunity, updateOpportunity } from '../services/opportunityService';
import { OPPORTUNITY_CATEGORIES, OpportunityErrors, OpportunityInput, todayISO, validateOpportunity } from '../services/opportunityRules';
import { useNotification } from '../components/NotificationSystem';
import { PageHeader, LoadingState, EmptyState, Field, inputClass, primaryButton, secondaryButton } from '../components/ui/States';

interface Props {
    currentUser: User;
    opportunityId?: string;
    onNavigate: (page: string, params?: any) => void;
}

const emptyInput = (user: User): OpportunityInput => ({
    title: '',
    description: '',
    category: '',
    type: 'temporario',
    recurrence: 'pontual',
    posterName: [user.name, user.surname].filter(Boolean).join(' '),
    cityId: user.cityId || '',
    neighborhoodId: '',
    locationDetail: '',
    startDate: '',
    endDate: '',
    schedule: '',
    compensationType: 'to_agree',
    compensationMin: null,
    compensationMax: null,
    compensationUnit: 'por dia',
    requirementsText: '',
    peopleNeeded: 1,
    additionalInfo: '',
    contactMethod: 'in_app',
    contactValue: '',
});

const fromOpportunity = (o: Opportunity): OpportunityInput => ({
    title: o.title,
    description: o.description,
    category: o.category,
    type: o.type,
    recurrence: o.recurrence,
    posterName: o.posterName,
    businessId: o.businessId || '',
    cityId: o.cityId || '',
    neighborhoodId: o.neighborhoodId || '',
    locationDetail: o.locationDetail || '',
    startDate: o.startDate || '',
    endDate: o.endDate || '',
    schedule: o.schedule || '',
    compensationType: o.compensationType,
    compensationMin: o.compensationMin ?? null,
    compensationMax: o.compensationMax ?? null,
    compensationUnit: o.compensationUnit || '',
    requirementsText: (o.requirements || []).join('\n'),
    peopleNeeded: o.peopleNeeded,
    additionalInfo: o.additionalInfo || '',
    contactMethod: o.contactMethod,
    contactValue: o.contactValue || '',
});

export const OpportunityForm: React.FC<Props> = ({ currentUser, opportunityId, onNavigate }) => {
    const { notify } = useNotification();
    const [input, setInput] = useState<OpportunityInput>(() => emptyInput(currentUser));
    const [existing, setExisting] = useState<Opportunity | null>(null);
    const [errors, setErrors] = useState<OpportunityErrors>({});
    const [loading, setLoading] = useState(!!opportunityId);
    const [notFound, setNotFound] = useState(false);
    const [saving, setSaving] = useState<'draft' | 'publish' | null>(null);
    const [cities, setCities] = useState<City[]>([]);
    const [neighborhoods, setNeighborhoods] = useState<Neighborhood[]>([]);
    const [myBusinesses, setMyBusinesses] = useState<BusinessProfile[]>([]);

    useEffect(() => {
        (async () => {
            const [cts, nbs, bizs] = await Promise.all([
                getCities(), getNeighborhoods(), getMyBusinesses(currentUser.id).catch(() => [])
            ]);
            setCities(cts.filter(c => c.active !== false));
            setNeighborhoods(nbs.filter(n => n.active !== false));
            setMyBusinesses(bizs.filter(b => !b.isBlocked));
            if (opportunityId) {
                const o = await getOpportunity(opportunityId);
                if (!o || o.ownerId !== currentUser.id) {
                    setNotFound(true);
                } else {
                    setExisting(o);
                    setInput(fromOpportunity(o));
                }
                setLoading(false);
            }
        })();
    }, [opportunityId, currentUser.id]);

    const set = <K extends keyof OpportunityInput>(key: K, value: OpportunityInput[K]) => {
        setInput(prev => ({ ...prev, [key]: value }));
        if (errors[key]) setErrors(prev => ({ ...prev, [key]: undefined }));
    };

    const cityNeighborhoods = useMemo(() => neighborhoods.filter(n => n.cityId === input.cityId), [neighborhoods, input.cityId]);

    const submit = async (publish: boolean) => {
        const willPublish = publish || (existing ? existing.status !== 'draft' : false);
        const found = validateOpportunity(input, willPublish);
        setErrors(found);
        if (Object.keys(found).length > 0) {
            notify('warning', 'Revise os campos destacados.');
            const first = Object.keys(found)[0];
            document.getElementById(`opp-${first}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            return;
        }
        setSaving(publish ? 'publish' : 'draft');
        try {
            const saved = existing
                ? await updateOpportunity(existing, input, publish)
                : await createOpportunity(input, publish);
            notify('success', publish ? 'Oportunidade publicada!' : existing ? 'Alterações salvas.' : 'Rascunho salvo.');
            onNavigate(publish || saved.status !== 'draft' ? 'opportunity-detail' : 'my-opportunities', { opportunityId: saved.id });
        } catch (e: any) {
            notify('error', e?.message || 'Erro ao salvar.');
        } finally {
            setSaving(null);
        }
    };

    const back = () => onNavigate(existing ? 'opportunity-detail' : 'opportunities', existing ? { opportunityId: existing.id } : undefined);

    if (loading) return <div className="min-h-screen bg-slate-50"><PageHeader title="Editar oportunidade" onBack={back} /><LoadingState /></div>;
    if (notFound) {
        return (
            <div className="min-h-screen bg-slate-50">
                <PageHeader title="Editar oportunidade" onBack={() => onNavigate('my-opportunities')} />
                <div className="max-w-3xl mx-auto p-4"><EmptyState title="Publicação não encontrada" message="Ela não existe ou não pertence à sua conta." /></div>
            </div>
        );
    }

    const isDraftFlow = !existing || existing.status === 'draft';
    const paid = input.compensationType === 'fixed' || input.compensationType === 'range';

    return (
        <div className="min-h-screen bg-slate-50 pb-40">
            <PageHeader title={existing ? 'Editar oportunidade' : 'Publicar oportunidade'} subtitle="Ajuda Colaborativa" onBack={back} />
            <form
                className="max-w-3xl mx-auto px-4 md:px-6 py-5 space-y-4"
                onSubmit={e => { e.preventDefault(); submit(isDraftFlow); }}
                noValidate
            >
                <Section title="O que você precisa (ou oferece)?">
                    <Field label="Título" htmlFor="opp-title" error={errors.title} required hint="Ex.: Marinheiro para saída de sábado">
                        <input id="opp-title" className={inputClass(!!errors.title)} value={input.title} onChange={e => set('title', e.target.value)} maxLength={120} />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Tipo" htmlFor="opp-type" error={errors.type} required>
                            <select id="opp-type" className={inputClass(!!errors.type)} value={input.type} onChange={e => set('type', e.target.value as OpportunityType)}>
                                {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                            </select>
                        </Field>
                        <Field label="Categoria" htmlFor="opp-category" error={errors.category} required>
                            <select id="opp-category" className={inputClass(!!errors.category)} value={input.category} onChange={e => set('category', e.target.value)}>
                                <option value="">Escolha...</option>
                                {OPPORTUNITY_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </Field>
                    </div>
                    <Field label="Descrição" htmlFor="opp-description" error={errors.description} required hint="Explique as tarefas, o contexto e o que a pessoa vai fazer.">
                        <textarea id="opp-description" rows={5} className={inputClass(!!errors.description)} value={input.description} onChange={e => set('description', e.target.value)} maxLength={4000} />
                    </Field>
                </Section>

                <Section title="Quem está anunciando">
                    {myBusinesses.length > 0 && (
                        <Field label="Publicar em nome de" htmlFor="opp-businessId">
                            <select
                                id="opp-businessId"
                                className={inputClass()}
                                value={input.businessId || ''}
                                onChange={e => {
                                    const biz = myBusinesses.find(b => b.id === e.target.value);
                                    setInput(prev => ({ ...prev, businessId: e.target.value, posterName: biz ? biz.name : [currentUser.name, currentUser.surname].filter(Boolean).join(' ') }));
                                }}
                            >
                                <option value="">Eu mesmo(a), como pessoa</option>
                                {myBusinesses.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
                            </select>
                        </Field>
                    )}
                    <Field label="Nome exibido" htmlFor="opp-posterName" error={errors.posterName} required>
                        <input id="opp-posterName" className={inputClass(!!errors.posterName)} value={input.posterName} onChange={e => set('posterName', e.target.value)} maxLength={120} />
                    </Field>
                </Section>

                <Section title="Quando e onde">
                    <Field label="Frequência" htmlFor="opp-recurrence" error={errors.recurrence} required>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2" id="opp-recurrence" role="radiogroup">
                            {(Object.keys(OPPORTUNITY_RECURRENCE_LABELS) as OpportunityRecurrence[]).map(r => (
                                <label key={r} className={`flex items-center gap-2 px-4 py-3 rounded-2xl border cursor-pointer text-sm font-bold ${input.recurrence === r ? 'border-ocean-500 bg-ocean-50 text-ocean-800' : 'border-slate-200 text-slate-600'}`}>
                                    <input type="radio" name="recurrence" checked={input.recurrence === r} onChange={() => set('recurrence', r)} className="text-ocean-600" />
                                    {OPPORTUNITY_RECURRENCE_LABELS[r]}
                                </label>
                            ))}
                        </div>
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label={input.recurrence === 'pontual' ? 'Data' : 'Data de início'} htmlFor="opp-startDate" error={errors.startDate} required={input.recurrence !== 'recorrente'}>
                            <input id="opp-startDate" type="date" min={isDraftFlow ? todayISO() : undefined} className={inputClass(!!errors.startDate)} value={input.startDate || ''} onChange={e => set('startDate', e.target.value)} />
                        </Field>
                        {input.recurrence !== 'pontual' && (
                            <Field label="Data final" htmlFor="opp-endDate" error={errors.endDate} hint="Opcional">
                                <input id="opp-endDate" type="date" min={input.startDate || todayISO()} className={inputClass(!!errors.endDate)} value={input.endDate || ''} onChange={e => set('endDate', e.target.value)} />
                            </Field>
                        )}
                        {input.recurrence === 'pontual' && errors.endDate && <p className="text-xs font-bold text-red-600 self-end">{errors.endDate}</p>}
                    </div>
                    <Field label="Horário ou duração" htmlFor="opp-schedule" error={errors.schedule} hint="Ex.: 9h às 17h · turno da noite · 4 horas">
                        <input id="opp-schedule" className={inputClass(!!errors.schedule)} value={input.schedule || ''} onChange={e => set('schedule', e.target.value)} maxLength={120} />
                    </Field>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <Field label="Cidade" htmlFor="opp-cityId" error={errors.cityId} required>
                            <select id="opp-cityId" className={inputClass(!!errors.cityId)} value={input.cityId || ''} onChange={e => setInput(prev => ({ ...prev, cityId: e.target.value, neighborhoodId: '' }))}>
                                <option value="">Escolha...</option>
                                {cities.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                            </select>
                        </Field>
                        <Field label="Bairro" htmlFor="opp-neighborhoodId" hint="Opcional">
                            <select id="opp-neighborhoodId" className={inputClass()} value={input.neighborhoodId || ''} onChange={e => set('neighborhoodId', e.target.value)} disabled={!input.cityId}>
                                <option value="">{input.cityId ? 'Não informar' : 'Escolha a cidade primeiro'}</option>
                                {cityNeighborhoods.map(n => <option key={n.id} value={n.id}>{n.name}</option>)}
                            </select>
                        </Field>
                    </div>
                    <Field label="Ponto de encontro / referência" htmlFor="opp-locationDetail" error={errors.locationDetail} hint="Ex.: Marina dos Pescadores, Praia dos Anjos">
                        <input id="opp-locationDetail" className={inputClass(!!errors.locationDetail)} value={input.locationDetail || ''} onChange={e => set('locationDetail', e.target.value)} maxLength={200} />
                    </Field>
                </Section>

                <Section title="Remuneração e vagas">
                    <Field label="Remuneração" htmlFor="opp-compensationType" error={errors.compensationType} required hint="Não é obrigatório informar valor; deixaremos claro quando não estiver definido.">
                        <select id="opp-compensationType" className={inputClass()} value={input.compensationType} onChange={e => set('compensationType', e.target.value as CompensationType)}>
                            {Object.entries(COMPENSATION_LABELS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                        </select>
                    </Field>
                    {paid && (
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            <Field label={input.compensationType === 'range' ? 'Mínimo (R$)' : 'Valor (R$)'} htmlFor="opp-compensationMin" error={errors.compensationMin} required>
                                <input id="opp-compensationMin" type="number" inputMode="decimal" min={0} step="0.01" className={inputClass(!!errors.compensationMin)} value={input.compensationMin ?? ''} onChange={e => set('compensationMin', e.target.value === '' ? null : Number(e.target.value))} />
                            </Field>
                            {input.compensationType === 'range' && (
                                <Field label="Máximo (R$)" htmlFor="opp-compensationMax" error={errors.compensationMax} required>
                                    <input id="opp-compensationMax" type="number" inputMode="decimal" min={0} step="0.01" className={inputClass(!!errors.compensationMax)} value={input.compensationMax ?? ''} onChange={e => set('compensationMax', e.target.value === '' ? null : Number(e.target.value))} />
                                </Field>
                            )}
                            <Field label="Unidade" htmlFor="opp-compensationUnit">
                                <select id="opp-compensationUnit" className={inputClass()} value={input.compensationUnit || ''} onChange={e => set('compensationUnit', e.target.value)}>
                                    <option value="por dia">por dia</option>
                                    <option value="por hora">por hora</option>
                                    <option value="por turno">por turno</option>
                                    <option value="por saída">por saída</option>
                                    <option value="por mês">por mês</option>
                                    <option value="total">total</option>
                                </select>
                            </Field>
                        </div>
                    )}
                    <Field label="Quantas pessoas?" htmlFor="opp-peopleNeeded" error={errors.peopleNeeded} required>
                        <input id="opp-peopleNeeded" type="number" inputMode="numeric" min={1} max={500} className={inputClass(!!errors.peopleNeeded)} value={input.peopleNeeded} onChange={e => set('peopleNeeded', Number(e.target.value))} />
                    </Field>
                    <Field label="Requisitos e qualificações" htmlFor="opp-requirementsText" hint="Um por linha. Ex.: Habilitação de marinheiro (Arrais)">
                        <textarea id="opp-requirementsText" rows={3} className={inputClass()} value={input.requirementsText || ''} onChange={e => set('requirementsText', e.target.value)} />
                    </Field>
                    <Field label="Informações adicionais" htmlFor="opp-additionalInfo" error={errors.additionalInfo} hint="Uniforme, alimentação, transporte, etc. (opcional)">
                        <textarea id="opp-additionalInfo" rows={3} className={inputClass(!!errors.additionalInfo)} value={input.additionalInfo || ''} onChange={e => set('additionalInfo', e.target.value)} maxLength={2000} />
                    </Field>
                </Section>

                <Section title="Como receber interessados">
                    <Field label="Forma de contato" htmlFor="opp-contactMethod" error={errors.contactMethod} required>
                        <div className="grid grid-cols-2 gap-2" id="opp-contactMethod" role="radiogroup">
                            {([
                                ['in_app', 'Pela Lagos GO'],
                                ['whatsapp', 'WhatsApp'],
                                ['phone', 'Telefone'],
                                ['email', 'E-mail'],
                            ] as [ContactMethod, string][]).map(([k, label]) => (
                                <label key={k} className={`flex items-center gap-2 px-4 py-3 rounded-2xl border cursor-pointer text-sm font-bold ${input.contactMethod === k ? 'border-ocean-500 bg-ocean-50 text-ocean-800' : 'border-slate-200 text-slate-600'}`}>
                                    <input type="radio" name="contactMethod" checked={input.contactMethod === k} onChange={() => set('contactMethod', k)} className="text-ocean-600" />
                                    {label}
                                </label>
                            ))}
                        </div>
                    </Field>
                    {input.contactMethod === 'in_app' ? (
                        <p className="text-xs text-slate-500 bg-slate-50 rounded-2xl px-4 py-3">
                            Os interessados enviam nome, mensagem e contato. Só você vê esses dados, no painel da publicação.
                        </p>
                    ) : (
                        <Field label={input.contactMethod === 'email' ? 'E-mail' : 'Número com DDD'} htmlFor="opp-contactValue" error={errors.contactValue} required hint="Este contato ficará visível na publicação.">
                            <input
                                id="opp-contactValue"
                                className={inputClass(!!errors.contactValue)}
                                value={input.contactValue || ''}
                                onChange={e => set('contactValue', e.target.value)}
                                inputMode={input.contactMethod === 'email' ? 'email' : 'tel'}
                                type={input.contactMethod === 'email' ? 'email' : 'tel'}
                                maxLength={120}
                            />
                        </Field>
                    )}
                </Section>

                <p className="text-[11px] text-slate-400 leading-relaxed px-1">
                    Ao publicar, você declara que a oportunidade é real e lícita. A Lagos GO não intermedia contratações e pode ocultar
                    publicações denunciadas. Não é permitido pedir pagamento aos interessados.
                </p>

                {/* Barra de ação fixa */}
                <div className="fixed above-bottom-nav inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-100 px-4 py-3">
                    <div className="max-w-3xl mx-auto flex gap-3">
                        {isDraftFlow && (
                            <button type="button" onClick={() => submit(false)} disabled={!!saving} className={`${secondaryButton} flex-1`}>
                                <Save size={18} /> {saving === 'draft' ? 'Salvando...' : 'Salvar rascunho'}
                            </button>
                        )}
                        <button type="submit" disabled={!!saving} className={`${primaryButton} flex-1`}>
                            {isDraftFlow ? <Send size={18} /> : <Save size={18} />}
                            {saving === 'publish' ? 'Publicando...' : isDraftFlow ? 'Publicar' : 'Salvar alterações'}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    );
};

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <section className="bg-white rounded-3xl border border-slate-100 p-5 md:p-7 space-y-4">
        <h2 className="font-black text-ocean-950">{title}</h2>
        {children}
    </section>
);
