import type { BusinessProfile, Coupon, User, BlogPost } from '../types';

/** Texto sem acento e em minúsculas, para busca. */
export const norm = (s: unknown): string =>
  String(s ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const hasText = (q: string, ...fields: unknown[]) => {
  const n = norm(q);
  return !n || fields.some(f => norm(f).includes(n));
};

/** Valores aceitos em "kind": pagantes, gratuitas, serviços públicos, lugares sem dono, com dono. */
export interface BizFilter { q: string; category: string; cityId: string; plan: string; status: string; kind: string }
export const EMPTY_BIZ_FILTER: BizFilter = { q: '', category: '', cityId: '', plan: '', status: '', kind: '' };

export const isPaidPlan = (plan?: string) => plan === 'pro' || plan === 'premium';
export const isPublicService = (b: Pick<BusinessProfile, 'id'>) => String(b.id).startsWith('srv_');

export function filterBusinesses(list: BusinessProfile[], f: BizFilter): BusinessProfile[] {
  return list.filter(b => {
    if (!hasText(f.q, b.name, b.category, b.subcategory, b.phone)) return false;
    if (f.category && b.category !== f.category) return false;
    if (f.cityId && b.cityId !== f.cityId) return false;
    if (f.plan) {
      const p = b.plan || 'free';
      if (f.plan === 'free' ? isPaidPlan(p) : p !== f.plan) return false;
    }
    if (f.status === 'blocked' && !b.isBlocked) return false;
    if (f.status === 'pending' && b.status !== 'PENDING') return false;
    if (f.status === 'active' && (b.isBlocked || b.status === 'PENDING')) return false;
    if (f.kind === 'paid' && !isPaidPlan(b.plan)) return false;
    if (f.kind === 'free' && isPaidPlan(b.plan)) return false;
    if (f.kind === 'public' && !isPublicService(b)) return false;
    if (f.kind === 'unclaimed' && (b.isClaimed || isPublicService(b))) return false;
    if (f.kind === 'claimed' && !b.isClaimed) return false;
    return true;
  });
}

export interface UserFilter { q: string; role: string }
export const EMPTY_USER_FILTER: UserFilter = { q: '', role: '' };
export function filterUsers(list: User[], f: UserFilter): User[] {
  return list.filter(u => hasText(f.q, u.name, u.email) && (!f.role || String(u.role) === f.role));
}

export interface CouponFilter { q: string; category: string; status: string }
export const EMPTY_COUPON_FILTER: CouponFilter = { q: '', category: '', status: '' };
export function filterCoupons(list: Coupon[], f: CouponFilter, now = Date.now()): Coupon[] {
  return list.filter(c => {
    if (!hasText(f.q, c.title, c.companyName, c.category)) return false;
    if (f.category && c.category !== f.category) return false;
    const expired = c.expiryDate ? new Date(c.expiryDate).getTime() < now : false;
    if (f.status === 'pending' && c.status !== 'pending') return false;
    if (f.status === 'rejected' && c.status !== 'rejected') return false;
    if (f.status === 'expired' && !expired) return false;
    if (f.status === 'active' && (expired || (c.status && c.status !== 'approved'))) return false;
    return true;
  });
}

export interface PostFilter { q: string; category: string; status: string }
export const EMPTY_POST_FILTER: PostFilter = { q: '', category: '', status: '' };
export function filterPosts(list: BlogPost[], f: PostFilter): BlogPost[] {
  return list.filter(p => {
    if (!hasText(f.q, p.title, p.category, p.author)) return false;
    if (f.category && p.category !== f.category) return false;
    if (f.status === 'draft' && p.status !== 'draft') return false;
    if (f.status === 'published' && p.status === 'draft') return false;
    return true;
  });
}

/** Valores distintos e ordenados, para montar as opções de um filtro. */
export const distinct = (values: Array<string | undefined | null>): string[] =>
  Array.from(new Set(values.filter((v): v is string => !!v))).sort((a, b) => a.localeCompare(b, 'pt-BR'));
