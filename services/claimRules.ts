/**
 * Reivindicação de empresas — regras puras (sem Firebase), testáveis.
 * Uma empresa sem dono pode ser reivindicada por quem a representa; o admin confere e aprova.
 * Regras de ouro: nunca tirar a empresa de quem já é dono, e um pedido por pessoa por empresa.
 */
import type { BusinessProfile, CompanyRequest } from '../types';
import { PUBLIC_PLACES_BATCH } from '../data/publicPlaces';

type Biz = Pick<BusinessProfile, 'isClaimed' | 'canBeClaimed' | 'ownerId'> & Partial<Pick<BusinessProfile, 'isBlocked' | 'category' | 'plan'>> & { importBatch?: string };

export const CLAIM_ROLES = ['Proprietário(a)', 'Sócio(a)', 'Gerente', 'Responsável pelo marketing'] as const;

/** Empresa já tem dono (reivindicada ou com responsável definido). */
export const hasOwner = (b: Pick<Biz, 'isClaimed' | 'ownerId'>): boolean => !!b.isClaimed || !!(b.ownerId && b.ownerId.trim());

/** A página mostra "Esta é sua empresa?": sem dono e liberada pelo admin. */
export const canClaim = (b: Biz): boolean => !hasOwner(b) && b.canBeClaimed !== false && b.isBlocked !== true;

export interface ClaimForm { ownerName: string; whatsapp: string; role: string; confirmed: boolean; }
export type ClaimErrors = Partial<Record<keyof ClaimForm, string>>;

const digits = (s: string) => (s || '').replace(/\D/g, '');

export const validateClaim = (f: ClaimForm): ClaimErrors => {
  const e: ClaimErrors = {};
  if ((f.ownerName || '').trim().length < 3) e.ownerName = 'Informe seu nome completo.';
  const d = digits(f.whatsapp);
  if (d.length < 10 || d.length > 13) e.whatsapp = 'Informe seu WhatsApp com DDD, para a equipe confirmar com você.';
  if (!f.role) e.role = 'Diga qual é a sua relação com a empresa.';
  if (!f.confirmed) e.confirmed = 'Confirme que você representa esta empresa.';
  return e;
};

/** Já existe pedido em análise desta pessoa para esta empresa? */
export const pendingClaimFor = (reqs: Pick<CompanyRequest, 'userId' | 'companyId' | 'type' | 'status'>[], userId: string, companyId: string) =>
  reqs.find(r => r.type === 'CLAIM' && r.status === 'PENDING' && r.userId === userId && r.companyId === companyId);

export type ApprovalCheck = { ok: true } | { ok: false; reason: 'not_claim' | 'not_pending' | 'no_user' | 'no_business' | 'already_claimed'; message: string };

/** Pode aprovar este pedido agora? Nunca tira a empresa de quem já é dono. */
export const claimApprovalCheck = (req: Pick<CompanyRequest, 'type' | 'status' | 'userId' | 'companyId'>, biz: Biz | null | undefined): ApprovalCheck => {
  if (req.type !== 'CLAIM') return { ok: false, reason: 'not_claim', message: 'Este pedido não é uma reivindicação.' };
  if (req.status !== 'PENDING') return { ok: false, reason: 'not_pending', message: 'Este pedido já foi analisado.' };
  if (!req.userId) return { ok: false, reason: 'no_user', message: 'O pedido não tem usuário vinculado.' };
  if (!biz) return { ok: false, reason: 'no_business', message: 'A empresa não existe mais.' };
  if (hasOwner(biz)) return { ok: false, reason: 'already_claimed', message: 'Esta empresa já tem dono. Rejeite este pedido.' };
  return { ok: true };
};

/** Outros pedidos em análise para a mesma empresa (são recusados quando um é aprovado). */
export const siblingClaims = <T extends Pick<CompanyRequest, 'id' | 'type' | 'status' | 'companyId'>>(reqs: T[], approved: Pick<CompanyRequest, 'id' | 'companyId'>): T[] =>
  reqs.filter(r => r.type === 'CLAIM' && r.status === 'PENDING' && r.companyId === approved.companyId && r.id !== approved.id);

/** Lugares públicos (praias, mirantes...) nunca são reivindicáveis. */
export const isPublicPlace = (b: { importBatch?: string }) => b.importBatch === PUBLIC_PLACES_BATCH;

/** Empresas que podem ser liberadas para reivindicação em massa: sem dono, hoje não liberadas, não bloqueadas e não públicas. */
export const releasableForClaim = <T extends Biz>(list: T[], categories?: string[]): T[] =>
  list.filter(b => !hasOwner(b) && b.canBeClaimed === false && b.isBlocked !== true && !isPublicPlace(b) && (!categories?.length || categories.includes(b.category || '')));

export const waLink = (phone: string, text = ''): string => {
  let d = digits(phone);
  if (d.length === 10 || d.length === 11) d = `55${d}`;
  return d ? `https://wa.me/${d}${text ? `?text=${encodeURIComponent(text)}` : ''}` : '';
};
