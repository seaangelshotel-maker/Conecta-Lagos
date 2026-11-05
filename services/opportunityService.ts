/**
 * Ajuda Colaborativa — acesso a dados (Firestore).
 *
 * Coleções:
 *   opportunities/{id}                       publicação
 *   opportunities/{id}/applications/{uid}    interesse/candidatura (1 por pessoa)
 *   opportunities/{id}/history/{hid}         registro de alterações importantes
 *   rateLimits/{uid}                         antispam (1 publicação por minuto)
 *   reports/{id}                             denúncias para moderação
 *
 * Permissões garantidas em firestore.rules (não dependem desta camada).
 */
import {
    collection, collectionGroup, doc, getDoc, getDocs, query, where, orderBy, limit,
    serverTimestamp, writeBatch, updateDoc, setDoc, deleteDoc
} from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentUser, getCities, getNeighborhoods } from './dataService';
import { recordInteraction } from './interactionService';
import {
    Opportunity, OpportunityApplication, OpportunityStatus, ApplicationStatus,
    OpportunityHistoryEntry, ContentReport, ReportTargetType, UserRole
} from '../types';
import { OpportunityInput, buildOpportunityFields, validateOpportunity, canOwnerTransition, PUBLIC_STATUSES } from './opportunityRules';

const OPP = 'opportunities';

const requireUser = () => {
    const user = getCurrentUser();
    if (!user) throw new Error('Entre na sua conta para continuar.');
    if (user.isBlocked) throw new Error('Sua conta está inativa. Fale com o suporte.');
    return user;
};

const isAdmin = () => getCurrentUser()?.role === UserRole.SUPER_ADMIN;

const friendlyError = (e: any, fallback: string) => {
    const code = e?.code || '';
    if (code === 'permission-denied') {
        return new Error('Não foi possível concluir: permissão negada. Se acabou de publicar, aguarde 1 minuto antes de publicar de novo.');
    }
    if (code === 'unavailable') return new Error('Sem conexão com o servidor. Verifique sua internet e tente novamente.');
    if (code === 'failed-precondition') {
        console.error('[opportunities] índice do Firestore ausente:', e?.message);
        return new Error('Esta área está sendo ativada. Tente novamente em alguns minutos.');
    }
    return new Error(e?.message || fallback);
};

/** Preenche nomes de cidade/bairro (desnormalizados para exibição e busca). */
const withLocationNames = async (fields: Record<string, unknown>) => {
    const [cities, neighborhoods] = await Promise.all([getCities(), getNeighborhoods()]);
    const city = cities.find(c => c.id === fields.cityId);
    const nb = neighborhoods.find(n => n.id === fields.neighborhoodId);
    if (city) fields.cityName = city.name;
    if (nb) fields.neighborhoodName = nb.name;
    return fields;
};

const historyEntry = (actorId: string, action: OpportunityHistoryEntry['action'], extra: Partial<OpportunityHistoryEntry> = {}) => {
    const entry: Record<string, unknown> = { id: doc(collection(db, OPP)).id, actorId, action, at: new Date().toISOString() };
    // Firestore não aceita undefined: só inclui o que tem valor.
    Object.entries(extra).forEach(([k, v]) => { if (v !== undefined && v !== '') entry[k] = v; });
    return entry as unknown as OpportunityHistoryEntry;
};

// ---------------------------------------------------------------------------
// Publicação
// ---------------------------------------------------------------------------

export const createOpportunity = async (input: OpportunityInput, publish: boolean): Promise<Opportunity> => {
    const user = requireUser();
    const errors = validateOpportunity(input, publish);
    if (Object.keys(errors).length > 0) throw new Error(Object.values(errors)[0]);

    const ref = doc(collection(db, OPP));
    const now = new Date().toISOString();
    const fields = await withLocationNames(buildOpportunityFields(input));
    const data = {
        ...fields,
        id: ref.id,
        ownerId: user.id,
        status: (publish ? 'published' : 'draft') as OpportunityStatus,
        isHidden: false,
        createdAt: now,
        updatedAt: now,
        ...(publish ? { publishedAt: now } : {}),
    };

    const batch = writeBatch(db);
    batch.set(ref, data);
    // Antispam: as regras exigem que este documento seja gravado no mesmo lote.
    batch.set(doc(db, 'rateLimits', user.id), { lastOpportunityAt: serverTimestamp() });
    const h = historyEntry(user.id, 'created', { toStatus: data.status });
    batch.set(doc(db, OPP, ref.id, 'history', h.id), h);
    try {
        await batch.commit();
    } catch (e) {
        throw friendlyError(e, 'Erro ao publicar a oportunidade.');
    }
    return data as unknown as Opportunity;
};

export const updateOpportunity = async (current: Opportunity, input: OpportunityInput, publish?: boolean): Promise<Opportunity> => {
    const user = requireUser();
    const targetStatus: OpportunityStatus = publish && current.status === 'draft' ? 'published' : current.status;
    const needsPublishRules = targetStatus !== 'draft';
    const errors = validateOpportunity(input, needsPublishRules);
    if (Object.keys(errors).length > 0) throw new Error(Object.values(errors)[0]);

    const fields = await withLocationNames(buildOpportunityFields(input));
    const now = new Date().toISOString();
    // Reescreve o documento inteiro mantendo os campos de controle; assim campos
    // apagados no formulário (ex.: data final) também saem do banco.
    const data: Record<string, unknown> = {
        ...fields,
        id: current.id,
        ownerId: current.ownerId,
        status: targetStatus,
        isHidden: current.isHidden || false,
        createdAt: current.createdAt,
        updatedAt: now,
    };
    // Campo controlado pela moderação: mantém exatamente como está no banco.
    if (current.hiddenReason !== undefined) data.hiddenReason = current.hiddenReason;
    if (current.publishedAt || targetStatus === 'published') data.publishedAt = current.publishedAt || now;

    const batch = writeBatch(db);
    batch.set(doc(db, OPP, current.id), data);
    const h = historyEntry(user.id, targetStatus !== current.status ? 'status_changed' : 'updated', {
        fromStatus: current.status, toStatus: targetStatus
    });
    batch.set(doc(db, OPP, current.id, 'history', h.id), h);
    try {
        await batch.commit();
    } catch (e) {
        throw friendlyError(e, 'Erro ao salvar a oportunidade.');
    }
    return data as unknown as Opportunity;
};

export const changeOpportunityStatus = async (current: Opportunity, to: OpportunityStatus, note?: string) => {
    const user = requireUser();
    if (!isAdmin() && !canOwnerTransition(current.status, to)) {
        throw new Error('Esta mudança de status não é permitida.');
    }
    const now = new Date().toISOString();
    const patch: Record<string, unknown> = { status: to, updatedAt: now };
    if (to === 'published' && !current.publishedAt) patch.publishedAt = now;

    const batch = writeBatch(db);
    batch.update(doc(db, OPP, current.id), patch);
    const h = historyEntry(user.id, 'status_changed', {
        fromStatus: current.status, toStatus: to, ...(note ? { note: note.slice(0, 300) } : {})
    });
    batch.set(doc(db, OPP, current.id, 'history', h.id), h);
    try {
        await batch.commit();
    } catch (e) {
        throw friendlyError(e, 'Erro ao atualizar o status.');
    }
    return { ...current, ...patch } as Opportunity;
};

/** Apenas rascunhos podem ser apagados pelo anunciante (publicadas são encerradas/canceladas). */
export const deleteDraftOpportunity = async (o: Opportunity) => {
    if (o.status !== 'draft' && !isAdmin()) throw new Error('Somente rascunhos podem ser excluídos. Encerre ou cancele a publicação.');
    await deleteDoc(doc(db, OPP, o.id));
};

// ---------------------------------------------------------------------------
// Consulta
// ---------------------------------------------------------------------------

export const getOpportunity = async (id: string): Promise<Opportunity | null> => {
    try {
        const snap = await getDoc(doc(db, OPP, id));
        return snap.exists() ? ({ id: snap.id, ...snap.data() } as Opportunity) : null;
    } catch (e: any) {
        if (e?.code === 'permission-denied') return null; // encerrada/oculta e sem vínculo com o usuário
        throw e;
    }
};

/** Oportunidades visíveis ao público (publicadas ou em andamento, não ocultas), mais recentes primeiro. */
export const listPublicOpportunities = async (max = 200): Promise<Opportunity[]> => {
    try {
        return await listPublicOpportunitiesRaw(max);
    } catch (e) {
        throw friendlyError(e, 'Não foi possível carregar as oportunidades.');
    }
};

const listPublicOpportunitiesRaw = async (max: number): Promise<Opportunity[]> => {
    const snap = await getDocs(query(
        collection(db, OPP),
        where('status', 'in', PUBLIC_STATUSES),
        where('isHidden', '==', false),
        orderBy('publishedAt', 'desc'),
        limit(max)
    ));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Opportunity));
};

export const listMyOpportunities = async (): Promise<Opportunity[]> => {
    const user = requireUser();
    const snap = await getDocs(query(
        collection(db, OPP),
        where('ownerId', '==', user.id),
        orderBy('updatedAt', 'desc'),
        limit(200)
    ));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Opportunity));
};

export const getOpportunityHistory = async (oppId: string): Promise<OpportunityHistoryEntry[]> => {
    const snap = await getDocs(query(collection(db, OPP, oppId, 'history'), orderBy('at', 'desc'), limit(100)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as OpportunityHistoryEntry));
};

export const recordOpportunityView = (o: Opportunity) =>
    recordInteraction('opportunity_view', o.id, { ownerId: o.ownerId, source: 'opportunities' });

// ---------------------------------------------------------------------------
// Candidaturas / manifestações de interesse
// ---------------------------------------------------------------------------

export const getMyApplication = async (oppId: string): Promise<OpportunityApplication | null> => {
    const user = getCurrentUser();
    if (!user) return null;
    try {
        const snap = await getDoc(doc(db, OPP, oppId, 'applications', user.id));
        return snap.exists() ? ({ id: snap.id, ...snap.data() } as OpportunityApplication) : null;
    } catch {
        return null;
    }
};

export const applyToOpportunity = async (o: Opportunity, message: string, contact: string): Promise<OpportunityApplication> => {
    const user = requireUser();
    if (o.ownerId === user.id) throw new Error('Você é o anunciante desta oportunidade.');
    const msg = (message || '').trim();
    const ct = (contact || '').trim();
    if (msg.length > 1000) throw new Error('A mensagem pode ter no máximo 1000 caracteres.');
    if (ct.length > 200) throw new Error('Contato muito longo.');
    if (o.contactMethod === 'in_app' && !ct) {
        throw new Error('Informe um telefone, WhatsApp ou e-mail para o anunciante falar com você.');
    }
    const now = new Date().toISOString();
    const application: OpportunityApplication = {
        id: user.id,
        opportunityId: o.id,
        opportunityTitle: o.title.slice(0, 120),
        opportunityOwnerId: o.ownerId,
        applicantId: user.id,
        applicantName: ([user.name, user.surname].filter(Boolean).join(' ') || 'Participante').slice(0, 120),
        status: 'interested',
        createdAt: now,
        updatedAt: now,
    };
    if (msg) application.message = msg;
    if (ct) application.applicantContact = ct;
    try {
        const existing = await getMyApplication(o.id);
        if (existing && existing.status !== 'withdrawn') throw new Error('Você já demonstrou interesse nesta oportunidade.');
        if (existing) {
            // Retomar interesse depois de ter desistido.
            await updateDoc(doc(db, OPP, o.id, 'applications', user.id), {
                status: 'interested', updatedAt: now, message: msg, applicantContact: ct,
            });
        } else {
            await setDoc(doc(db, OPP, o.id, 'applications', user.id), application);
        }
    } catch (e) {
        throw friendlyError(e, 'Erro ao enviar seu interesse.');
    }
    recordInteraction('opportunity_interest', o.id, { ownerId: o.ownerId, source: 'opportunities' });
    return application;
};

export const withdrawApplication = async (oppId: string) => {
    const user = requireUser();
    await updateDoc(doc(db, OPP, oppId, 'applications', user.id), {
        status: 'withdrawn' as ApplicationStatus,
        updatedAt: new Date().toISOString(),
    });
};

export const listApplications = async (oppId: string): Promise<OpportunityApplication[]> => {
    const snap = await getDocs(collection(db, OPP, oppId, 'applications'));
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() } as OpportunityApplication))
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
};

export const setApplicationStatus = async (oppId: string, applicantId: string, status: ApplicationStatus) => {
    requireUser();
    await updateDoc(doc(db, OPP, oppId, 'applications', applicantId), {
        status,
        updatedAt: new Date().toISOString(),
    });
};

export const listMyApplications = async (): Promise<OpportunityApplication[]> => {
    const user = requireUser();
    const snap = await getDocs(query(
        collectionGroup(db, 'applications'),
        where('applicantId', '==', user.id),
        orderBy('createdAt', 'desc'),
        limit(200)
    ));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as OpportunityApplication));
};

// ---------------------------------------------------------------------------
// Denúncias e moderação
// ---------------------------------------------------------------------------

export const REPORT_REASONS = [
    'Golpe ou fraude',
    'Conteúdo ofensivo ou discriminatório',
    'Informação falsa ou enganosa',
    'Proposta ilegal ou trabalho irregular',
    'Spam ou publicação repetida',
    'Outro motivo',
];

export const reportContent = async (targetType: ReportTargetType, targetId: string, targetTitle: string, reason: string, details?: string) => {
    const user = requireUser();
    if (!reason) throw new Error('Escolha o motivo da denúncia.');
    const ref = doc(collection(db, 'reports'));
    const report: Record<string, unknown> = {
        id: ref.id,
        targetType,
        targetId,
        targetTitle: (targetTitle || '').slice(0, 120),
        reporterId: user.id,
        reason: reason.slice(0, 120),
        status: 'open',
        createdAt: new Date().toISOString(),
    };
    if (details?.trim()) report.details = details.trim().slice(0, 1000);
    try {
        await setDoc(ref, report);
    } catch (e) {
        throw friendlyError(e, 'Erro ao enviar a denúncia.');
    }
};

/** Admin: todas as oportunidades (inclusive ocultas e encerradas). */
export const adminListOpportunities = async (): Promise<Opportunity[]> => {
    const snap = await getDocs(query(collection(db, OPP), orderBy('updatedAt', 'desc'), limit(500)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as Opportunity));
};

export const adminSetHidden = async (o: Opportunity, hidden: boolean, reason?: string) => {
    const user = requireUser();
    if (!isAdmin()) throw new Error('Apenas administradores.');
    const batch = writeBatch(db);
    const patch: Record<string, unknown> = { isHidden: hidden, updatedAt: new Date().toISOString() };
    patch.hiddenReason = hidden ? (reason || 'Ocultada pela moderação').slice(0, 300) : '';
    batch.update(doc(db, OPP, o.id), patch);
    const h = historyEntry(user.id, hidden ? 'hidden' : 'unhidden', reason ? { note: reason.slice(0, 300) } : {});
    batch.set(doc(db, OPP, o.id, 'history', h.id), h);
    await batch.commit();
};

export const adminListReports = async (): Promise<ContentReport[]> => {
    const snap = await getDocs(query(collection(db, 'reports'), orderBy('createdAt', 'desc'), limit(300)));
    return snap.docs.map(d => ({ id: d.id, ...d.data() } as ContentReport));
};

export const adminResolveReport = async (reportId: string, status: 'resolved' | 'dismissed') => {
    const user = requireUser();
    await updateDoc(doc(db, 'reports', reportId), {
        status,
        resolvedAt: new Date().toISOString(),
        resolvedBy: user.id,
    });
};
