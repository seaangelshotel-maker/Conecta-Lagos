/**
 * Registro de conexões (eventos de interação) da Lagos GO.
 *
 * - Cada evento é um documento próprio na coleção `interactions` (não fica
 *   acumulado dentro do documento da empresa), o que permite consultas por
 *   período, origem e tipo.
 * - LGPD: não guardamos nome, e-mail, telefone, IP ou UID. Usamos um
 *   identificador de sessão aleatório (renovado a cada 30 dias) e apenas a
 *   indicação se a pessoa estava logada.
 * - Falhas de registro nunca interrompem a navegação.
 */
import { createThrottle } from './throttle';
import {
    addDoc, collection, query, where, getDocs, serverTimestamp, orderBy, limit as qLimit
} from 'firebase/firestore';
import { auth, db } from './firebase';
import { InteractionEvent, InteractionType } from '../types';

const SESSION_STORAGE_KEY = 'lagos_go_sid_v1';
const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const REF_STORAGE_KEY = 'lagos_go_ref_v1';

const randomId = () => {
    try {
        const bytes = new Uint8Array(16);
        crypto.getRandomValues(bytes);
        return Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
    } catch {
        return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
    }
};

export const getSessionId = (): string => {
    try {
        const raw = localStorage.getItem(SESSION_STORAGE_KEY);
        if (raw) {
            const parsed = JSON.parse(raw) as { id: string; createdAt: number };
            if (parsed.id && Date.now() - parsed.createdAt < SESSION_TTL_MS) return parsed.id;
        }
        const id = randomId();
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({ id, createdAt: Date.now() }));
        return id;
    } catch {
        return randomId();
    }
};

/** Guarda o parâmetro ?ref= (parceiro/campanha) da primeira visita da sessão. */
export const captureReferral = () => {
    try {
        const params = new URLSearchParams(window.location.search);
        const ref = params.get('ref') || params.get('utm_source');
        if (ref) localStorage.setItem(REF_STORAGE_KEY, ref.slice(0, 64));
    } catch { /* sem armazenamento disponível */ }
};

const getReferral = (): string | undefined => {
    try {
        return localStorage.getItem(REF_STORAGE_KEY) || undefined;
    } catch {
        return undefined;
    }
};

const ENTITY_BY_TYPE: Record<InteractionType, InteractionEvent['entityType']> = {
    business_view: 'business',
    whatsapp_click: 'business',
    phone_click: 'business',
    website_click: 'business',
    map_click: 'business',
    social_click: 'business',
    menu_open: 'business',
    delivery_click: 'business',
    booking_click: 'business',
    share: 'business',
    collection_view: 'collection',
    coupon_redeem: 'coupon',
    opportunity_view: 'opportunity',
    opportunity_interest: 'opportunity',
    specialist_referral: 'specialist',
};

// Evita registrar a mesma visualização várias vezes na mesma sessão de navegação.
const _viewedThisSession = new Set<string>();
// Freio: mesmo clique em menos de 3 s conta uma vez; no máximo 120 eventos por 10 min por aparelho.
const _throttle = createThrottle({ sameKeyMs: 3000, maxPerWindow: 120, windowMs: 600_000 });

export interface RecordOptions {
    /** Dono da entidade (empresa/oportunidade). Necessário para o dono ver o evento no painel. */
    ownerId?: string;
    /** Origem: 'home', 'guide', 'search', 'collection', 'map', 'direct', 'opportunities'... */
    source?: string;
    /** Força o tipo de entidade (ex.: share de oportunidade). */
    entityType?: InteractionEvent['entityType'];
}

export const recordInteraction = async (type: InteractionType, entityId: string, opts: RecordOptions = {}) => {
    if (!entityId) return;
    const entityType = opts.entityType || ENTITY_BY_TYPE[type];
    if (type.endsWith('_view')) {
        const key = `${type}:${entityId}`;
        if (_viewedThisSession.has(key)) return;
        _viewedThisSession.add(key);
    }
    if (!_throttle.allow(`${type}:${entityId}`)) return;
    const now = new Date();
    const event: Record<string, unknown> = {
        type,
        entityType,
        entityId: entityId.slice(0, 128),
        sessionId: getSessionId(),
        isAuthenticated: !!auth.currentUser,
        createdAt: now.toISOString(),
        day: now.toISOString().slice(0, 10),
        ts: serverTimestamp(),
    };
    if (opts.ownerId) event.ownerId = opts.ownerId;
    if (opts.source) event.source = opts.source.slice(0, 64);
    const ref = getReferral();
    if (ref) event.ref = ref;
    try {
        await addDoc(collection(db, 'interactions'), event);
    } catch (e) {
        // Analytics nunca quebra a experiência.
        console.warn('[interactions] evento não registrado:', type, (e as Error)?.message);
    }
};

export interface InteractionSummary {
    total: number;
    byType: Partial<Record<InteractionType, number>>;
    bySource: Record<string, number>;
    byDay: { day: string; total: number }[];
    uniqueSessions: number;
    firstEventAt?: string;
}

/**
 * Resumo dos eventos de uma entidade do próprio usuário nos últimos `days` dias.
 * Lê somente eventos com ownerId == usuário (as regras garantem isso).
 */
export const getInteractionSummary = async (ownerId: string, entityId: string, days = 30): Promise<InteractionSummary> => {
    const from = new Date(Date.now() - (days - 1) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
    const snap = await getDocs(query(
        collection(db, 'interactions'),
        where('ownerId', '==', ownerId),
        where('entityId', '==', entityId),
        where('day', '>=', from),
        orderBy('day', 'asc'),
        qLimit(5000)
    ));
    const summary: InteractionSummary = { total: 0, byType: {}, bySource: {}, byDay: [], uniqueSessions: 0 };
    const sessions = new Set<string>();
    const dayMap = new Map<string, number>();
    for (let i = 0; i < days; i++) {
        const d = new Date(Date.now() - (days - 1 - i) * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
        dayMap.set(d, 0);
    }
    snap.docs.forEach(d => {
        const e = d.data() as InteractionEvent;
        summary.total += 1;
        summary.byType[e.type] = (summary.byType[e.type] || 0) + 1;
        const src = e.source || 'direto';
        summary.bySource[src] = (summary.bySource[src] || 0) + 1;
        if (e.sessionId) sessions.add(e.sessionId);
        if (dayMap.has(e.day)) dayMap.set(e.day, (dayMap.get(e.day) || 0) + 1);
        if (!summary.firstEventAt || e.createdAt < summary.firstEventAt) summary.firstEventAt = e.createdAt;
    });
    summary.uniqueSessions = sessions.size;
    summary.byDay = Array.from(dayMap.entries()).map(([day, total]) => ({ day, total }));
    return summary;
};
