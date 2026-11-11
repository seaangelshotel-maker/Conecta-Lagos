/**
 * Agenda de eventos — acesso ao Firestore (coleção `events`).
 *
 * - Público lê só eventos publicados.
 * - Comerciante cria (sempre "pendente"), dentro da cota do plano; o admin aprova.
 * - Admin cria/edita/publica qualquer evento, importa o calendário oficial e define cotas.
 * As regras de segurança (firestore.rules) repetem as travas que não dependem de contagem.
 */
import { useEffect, useState } from 'react';
import { collection, doc, getDoc, getDocs, query, setDoc, updateDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentUser, getPricingPlans } from './dataService';
import { AppEvent, EventStatus, PricingPlan, User, UserRole } from '../types';
import { EventInput, activeEventCount, eventQuota, needsReapproval, resolvePlan, todayISO, validateEvent } from './eventRules';
import { OFFICIAL_EVENTS_2026 } from '../data/officialEvents2026';

const COL = 'events';
const CHANGED = 'eventsUpdated';
const TTL_MS = 60_000;

let _public: AppEvent[] | null = null;
let _publicAt = 0;
let _pending: Promise<AppEvent[]> | null = null;

const clean = <T extends object>(o: T): T => JSON.parse(JSON.stringify(o));
const notifyChanged = () => { _public = null; if (typeof window !== 'undefined') window.dispatchEvent(new Event(CHANGED)); };

const requireUser = (): User => {
  const u = getCurrentUser();
  if (!u) throw new Error('Entre na sua conta para continuar.');
  return u;
};
const requireAdmin = (): User => {
  const u = requireUser();
  if (u.role !== UserRole.SUPER_ADMIN) throw new Error('Apenas o administrador pode fazer isso.');
  return u;
};

/** Eventos publicados (todos, inclusive os que já passaram; a tela decide o que mostrar). */
export const getPublishedEvents = async (force = false): Promise<AppEvent[]> => {
  if (!force && _public && Date.now() - _publicAt < TTL_MS) return _public;
  if (_pending && !force) return _pending;
  _pending = getDocs(query(collection(db, COL), where('status', '==', 'published')))
    .then(s => s.docs.map(d => ({ ...(d.data() as AppEvent), id: d.id })))
    .catch(() => [] as AppEvent[])
    .then(list => { _public = list; _publicAt = Date.now(); _pending = null; return list; });
  return _pending;
};

/** Hook: eventos publicados, atualizados quando o admin ou o comerciante muda algo nesta sessão. */
export const usePublishedEvents = () => {
  const [events, setEvents] = useState<AppEvent[]>(_public || []);
  const [loading, setLoading] = useState(!_public);
  useEffect(() => {
    let alive = true;
    const load = (force = false) => getPublishedEvents(force).then(l => { if (alive) { setEvents(l); setLoading(false); } });
    load();
    const on = () => load(true);
    window.addEventListener(CHANGED, on);
    return () => { alive = false; window.removeEventListener(CHANGED, on); };
  }, []);
  return { events, loading };
};

/** Um evento pelo id. Publicado: qualquer pessoa; pendente/recusado: só o dono e o admin (as regras decidem). */
export const getEventById = async (id: string): Promise<AppEvent | null> => {
  const cached = _public?.find(e => e.id === id);
  if (cached) return cached;
  try {
    const s = await getDoc(doc(db, COL, id));
    return s.exists() ? ({ ...(s.data() as AppEvent), id: s.id }) : null;
  } catch { return null; }
};

export const getMyEvents = async (ownerId: string): Promise<AppEvent[]> => {
  const s = await getDocs(query(collection(db, COL), where('ownerId', '==', ownerId)));
  return s.docs.map(d => ({ ...(d.data() as AppEvent), id: d.id }));
};

/** Admin: todos os eventos, em qualquer status. */
export const getAllEventsAdmin = async (): Promise<AppEvent[]> => {
  requireAdmin();
  const s = await getDocs(collection(db, COL));
  return s.docs.map(d => ({ ...(d.data() as AppEvent), id: d.id }));
};

// ---------------------------------------------------------------------------
// Comerciante
// ---------------------------------------------------------------------------

/** Cota do comerciante logado: cota própria (definida pelo admin) ou a do plano. */
export const getMyEventQuota = async (user: User, businessPlan?: string): Promise<{ quota: number; plan?: PricingPlan }> => {
  const plans = await getPricingPlans().catch(() => [] as PricingPlan[]);
  const plan = resolvePlan(plans, user.plan, businessPlan);
  return { quota: eventQuota(user, plan), plan };
};

export interface SaveEventExtra { businessId?: string; businessName?: string; coverImage?: string; isFree?: boolean; }

/**
 * Comerciante cria ou edita um evento seu.
 * Criação: confere a cota no momento de salvar e entra como "pendente".
 * Edição: se o evento estava publicado e a mudança é relevante (título, data, cidade...), volta para análise.
 */
export const saveMerchantEvent = async (
  input: EventInput & SaveEventExtra, quota: number, existing?: AppEvent,
): Promise<AppEvent> => {
  const user = requireUser();
  const errors = validateEvent(input, todayISO(), !!existing && existing.startDate < todayISO());
  const first = Object.values(errors)[0];
  if (first) throw new Error(first);
  const now = new Date().toISOString();

  if (existing) {
    if (existing.ownerId !== user.id) throw new Error('Este evento não é seu.');
    const full: Partial<AppEvent> = {
      title: input.title.trim(), description: (input.description || '').trim(), category: input.category as AppEvent['category'],
      startDate: input.startDate, endDate: input.endDate || '', startTime: input.startTime || '', endTime: input.endTime || '',
      cityId: input.cityId, locationName: (input.locationName || '').trim(), address: (input.address || '').trim(),
      infoUrl: input.infoUrl || '', ticketUrl: input.ticketUrl || '', priceText: (input.priceText || '').trim(),
      isFree: !!input.isFree, coverImage: input.coverImage || '',
    };
    // Só vai o que mudou de fato (ausente, vazio e falso contam como "sem valor"): chave nova e vazia
    // seria lida pelas regras como mudança grande e tiraria o evento do ar à toa.
    const blank = (v: unknown) => (v === undefined || v === null || v === '' || v === false ? null : v);
    const patch = Object.fromEntries(Object.entries(full).filter(([k, v]) => blank(v) !== blank((existing as any)[k]))) as Partial<AppEvent>;
    if (Object.keys(patch).length === 0) return existing;
    const toPending = needsReapproval(existing, patch) || existing.status === 'rejected';
    const status: EventStatus = toPending ? 'pending' : existing.status;
    await updateDoc(doc(db, COL, existing.id), clean({
      ...patch, updatedAt: now,
      ...(status !== existing.status ? { status, rejectionReason: '' } : {}),
    }));
    notifyChanged();
    return { ...existing, ...patch, status, updatedAt: now };
  }

  const mine = await getMyEvents(user.id);
  if (activeEventCount(mine) >= quota) {
    throw new Error(quota === 0
      ? 'Seu plano não inclui eventos. Fale com a gente para liberar.'
      : `Você atingiu o limite de ${quota} evento${quota === 1 ? '' : 's'} ativo${quota === 1 ? '' : 's'} do seu plano.`);
  }
  const id = doc(collection(db, COL)).id;
  const ev: AppEvent = clean({
    id, title: input.title.trim(), description: (input.description || '').trim(), category: input.category as AppEvent['category'],
    startDate: input.startDate, ...(input.endDate ? { endDate: input.endDate } : {}),
    ...(input.startTime ? { startTime: input.startTime } : {}), ...(input.endTime ? { endTime: input.endTime } : {}),
    cityId: input.cityId, locationName: (input.locationName || '').trim(), address: (input.address || '').trim(),
    ...(input.infoUrl ? { infoUrl: input.infoUrl } : {}), ...(input.ticketUrl ? { ticketUrl: input.ticketUrl } : {}),
    ...(input.priceText ? { priceText: input.priceText.trim() } : {}), isFree: !!input.isFree,
    ...(input.coverImage ? { coverImage: input.coverImage } : {}),
    source: 'merchant', ownerId: user.id,
    ...(input.businessId ? { businessId: input.businessId } : {}), ...(input.businessName ? { businessName: input.businessName } : {}),
    status: 'pending', isFeatured: false, createdAt: now, updatedAt: now,
  });
  await setDoc(doc(db, COL, id), ev);
  notifyChanged();
  return ev;
};

/** Comerciante cancela um evento seu (some da agenda e libera a vaga na cota). */
export const cancelMyEvent = async (ev: AppEvent) => {
  const user = requireUser();
  if (ev.ownerId !== user.id) throw new Error('Este evento não é seu.');
  await updateDoc(doc(db, COL, ev.id), { status: 'cancelled', updatedAt: new Date().toISOString() });
  notifyChanged();
};

/** Comerciante apaga um evento que ainda não foi ao ar (pendente, recusado ou cancelado). */
export const deleteMyEvent = async (ev: AppEvent) => {
  const user = requireUser();
  if (ev.ownerId !== user.id) throw new Error('Este evento não é seu.');
  if (ev.status === 'published') throw new Error('Cancele o evento antes de apagar.');
  await deleteDoc(doc(db, COL, ev.id));
  notifyChanged();
};

// ---------------------------------------------------------------------------
// Administrador
// ---------------------------------------------------------------------------

/** Admin cria (sem id) ou edita (com id) um evento próprio da plataforma, já publicado. */
export const adminSaveEvent = async (input: EventInput & SaveEventExtra & { id?: string; isFeatured?: boolean; detailsTentative?: boolean }): Promise<AppEvent> => {
  const admin = requireAdmin();
  const errors = validateEvent(input, todayISO(), true);
  const first = Object.values(errors)[0];
  if (first) throw new Error(first);
  const now = new Date().toISOString();
  const id = input.id || doc(collection(db, COL)).id;
  const prev = input.id ? await getDoc(doc(db, COL, id)) : null;
  const base = prev?.exists() ? (prev.data() as AppEvent) : null;
  const ev: AppEvent = clean({
    ...(base || {}),
    id, title: input.title.trim(), description: (input.description || '').trim(), category: input.category as AppEvent['category'],
    startDate: input.startDate, endDate: input.endDate || '', startTime: input.startTime || '', endTime: input.endTime || '',
    cityId: input.cityId, locationName: (input.locationName || '').trim(), address: (input.address || '').trim(),
    infoUrl: input.infoUrl || '', ticketUrl: input.ticketUrl || '', priceText: (input.priceText || '').trim(),
    isFree: !!input.isFree, coverImage: input.coverImage || '', isFeatured: !!input.isFeatured,
    detailsTentative: !!input.detailsTentative,
    source: base?.source || 'admin', status: base?.status || 'published',
    createdAt: base?.createdAt || now, updatedAt: now,
    ...(base?.status ? {} : { approvedAt: now, approvedBy: admin.id }),
  });
  await setDoc(doc(db, COL, id), ev);
  notifyChanged();
  return ev;
};

export const setEventStatus = async (ev: AppEvent, status: EventStatus, reason?: string) => {
  const admin = requireAdmin();
  const now = new Date().toISOString();
  await updateDoc(doc(db, COL, ev.id), clean({
    status, updatedAt: now,
    ...(status === 'published' ? { approvedAt: now, approvedBy: admin.id, rejectionReason: '' } : {}),
    ...(status === 'rejected' ? { rejectionReason: (reason || '').trim() } : {}),
  }));
  notifyChanged();
};

export const setEventFeatured = async (ev: AppEvent, isFeatured: boolean) => {
  requireAdmin();
  await updateDoc(doc(db, COL, ev.id), { isFeatured, updatedAt: new Date().toISOString() });
  notifyChanged();
};

export const adminDeleteEvent = async (ev: AppEvent) => {
  requireAdmin();
  await deleteDoc(doc(db, COL, ev.id));
  notifyChanged();
};

/**
 * Importa o calendário oficial 2026 de Arraial do Cabo. Idempotente: eventos que já existem
 * (mesmo id) são pulados, então reimportar não desfaz edições do admin. Devolve quantos entraram.
 */
export const importOfficialCalendar = async (): Promise<{ created: number; skipped: number }> => {
  const admin = requireAdmin();
  const now = new Date().toISOString();
  let created = 0, skipped = 0;
  for (const e of OFFICIAL_EVENTS_2026) {
    const ref = doc(db, COL, e.id);
    if ((await getDoc(ref)).exists()) { skipped++; continue; }
    await setDoc(ref, clean({ ...e, createdAt: now, updatedAt: now, approvedAt: now, approvedBy: admin.id }));
    created++;
  }
  notifyChanged();
  return { created, skipped };
};

/** Admin: define a cota de eventos de um comerciante (vazio/null = volta a seguir o plano). */
export const setUserEventQuota = async (userId: string, maxEvents: number | null) => {
  requireAdmin();
  if (maxEvents !== null && (!Number.isFinite(maxEvents) || maxEvents < 0)) throw new Error('Informe um número igual ou maior que zero.');
  const { deleteField } = await import('firebase/firestore');
  await updateDoc(doc(db, 'users', userId), { maxEvents: maxEvents === null ? deleteField() : Math.floor(maxEvents) });
};
