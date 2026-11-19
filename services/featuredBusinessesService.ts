/**
 * Importa para o Guia as empresas em destaque (data/featuredBusinesses.ts).
 *
 * - Só o administrador grava (as regras do Firestore barram os demais).
 * - Empresa COMPLETA (endereço + telefone + fonte) vai ao ar com 3 meses grátis contados de agora.
 * - Empresa INCOMPLETA entra como rascunho (status 'draft'): o público não vê, o admin completa depois.
 * - Não duplica: IDs fixos e comparação de nome na mesma cidade; rodar de novo é seguro.
 */
import { doc, setDoc, updateDoc, getDocs, collection } from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentUser, getCategories, getCities, saveCity } from './dataService';
import { ensureCategory } from './seedService';
import { UserRole } from '../types';
import { bumpContentVersion } from './contentVersion';
import {
    FEATURED_BUSINESSES, FEATURED_BATCH, FEATURED_TAXONOMY, FEATURED_NEW_CITIES, FREE_TRIAL_DAYS, FREE_TRIAL_PLAN, FeaturedBusiness,
} from '../data/featuredBusinesses';

const normalize = (s: string) => s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9 ]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim().toLowerCase();

export const featuredDocId = (b: FeaturedBusiness) =>
    `emp_${b.cityId.replace('city_', '')}_${normalize(b.name).replace(/ /g, '-')}`.slice(0, 120);

/** Completa = pode ir ao ar: tem endereço, telefone e ao menos uma fonte. */
export const isComplete = (b: FeaturedBusiness) =>
    !!b.address?.trim() && !!b.phone?.trim() && (b.sources?.length || 0) > 0;

/** Itens que faltam para uma empresa ficar 100% completa. */
export const missingFields = (b: FeaturedBusiness): string[] => {
    const m: string[] = [];
    if (!b.address?.trim()) m.push('endereço');
    if (!b.phone?.trim()) m.push('telefone');
    if (!b.sources?.length) m.push('fonte');
    if (!b.hours || !Object.keys(b.hours).length) m.push('horário');
    return m;
};

export interface FeaturedPreview {
    toCreate: FeaturedBusiness[];
    publishNow: FeaturedBusiness[];
    asDraft: FeaturedBusiness[];
    alreadyExists: number;
    /** Já importadas, ainda sem dono, com informação mais nova no arquivo (checkedAt maior): serão enriquecidas. */
    toUpdate: { doc: any; data: FeaturedBusiness; photosOnly?: boolean }[];
}

/** Só enriquece empresa deste lote que ainda não foi reivindicada e cuja conferência no arquivo é mais nova que a gravada. */
export const needsEnrichment = (doc: any, f: FeaturedBusiness): boolean =>
    !!doc && !doc.isClaimed && !doc.ownerId && String(doc.importBatch || '').startsWith('empresas-destaque') &&
    ((f.checkedAt || '') > String(doc.checkedAt || '') || (!!f.coverImage && !doc.coverImage));

/** Empresa antiga (fora do lote), ainda sem dono, cujo arquivo traz fotos autorizadas diferentes das gravadas: troca só as fotos. */
export const needsPhotosOnly = (doc: any, f: FeaturedBusiness): boolean =>
    !!doc && !doc.isClaimed && !doc.ownerId && !!f.coverImage && doc.coverImage !== f.coverImage;

/** Campos que a atualização grava (nunca mexe em plano, avaliações, dono; foto só se autorizada e informada no arquivo). */
export const enrichmentPatch = (f: FeaturedBusiness, wasDraft: boolean, nowIso: string, endsAt: string) => {
    const complete = isComplete(f);
    return {
        description: f.description,
        address: f.address,
        neighborhoodName: f.neighborhood || '',
        phone: f.phone || '', whatsapp: f.whatsapp || '', email: f.email || '',
        instagram: f.instagram || '', website: f.website || '',
        amenities: f.amenities || [],
        openingHours: f.hours || {},
        sources: f.sources, checkedAt: f.checkedAt,
        missingFields: missingFields(f),
        updatedAt: nowIso,
        // fotos autorizadas pelo dono, quando informadas no arquivo (empresa ainda sem dono)
        ...(f.coverImage ? { coverImage: f.coverImage } : {}),
        ...(f.gallery?.length ? { gallery: f.gallery } : {}),
        // rascunho que ficou completo passa a ir ao ar, com os mesmos 3 meses grátis das demais
        ...(wasDraft && complete ? { status: 'approved', plan: FREE_TRIAL_PLAN, subscriptionEndsAt: endsAt, courtesyTrial: true, courtesyTrialStartedAt: nowIso } : {}),
    };
};

export const previewFeaturedImport = async (): Promise<FeaturedPreview> => {
    const snap = await getDocs(collection(db, 'businesses'));
    const existing = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    const toCreate: FeaturedBusiness[] = [];
    const toUpdate: { doc: any; data: FeaturedBusiness; photosOnly?: boolean }[] = [];
    let alreadyExists = 0;
    for (const f of FEATURED_BUSINESSES) {
        const hit = existing.find(b =>
            b.id === featuredDocId(f) ||
            ((b.cityId || '') === f.cityId && normalize(b.name || '') === normalize(f.name)));
        if (hit) { alreadyExists += 1; if (needsEnrichment(hit, f)) toUpdate.push({ doc: hit, data: f }); else if (needsPhotosOnly(hit, f)) toUpdate.push({ doc: hit, data: f, photosOnly: true }); } else toCreate.push(f);
    }
    return {
        toCreate,
        publishNow: toCreate.filter(isComplete),
        asDraft: toCreate.filter(b => !isComplete(b)),
        alreadyExists,
        toUpdate,
    };
};

export const trialEndsAt = (from = new Date()) => {
    const d = new Date(from);
    d.setDate(d.getDate() + FREE_TRIAL_DAYS);
    return d.toISOString();
};

export const runFeaturedImport = async (onProgress?: (done: number, total: number) => void): Promise<{ published: number; drafts: number; updated: number }> => {
    const user = getCurrentUser();
    if (!user || user.role !== UserRole.SUPER_ADMIN) throw new Error('Apenas o administrador pode importar empresas.');

    const preview = await previewFeaturedImport();

    // Cidades novas (Araruama, São Pedro da Aldeia, Saquarema, Iguaba Grande): cria as que ainda não existem
    const cities = await getCities();
    const usedCityIds = new Set(preview.toCreate.map(b => b.cityId as string));
    for (const c of FEATURED_NEW_CITIES) {
        if (usedCityIds.has(c.id) && !cities.find(x => x.id === c.id)) {
            await saveCity({ id: c.id, name: c.name, active: true });
            cities.push({ id: c.id, name: c.name, active: true });
        }
    }

    // Categorias e subcategorias usadas
    const categories = await getCategories(true);
    const byCat: Record<string, string[]> = {};
    for (const [sub, cat] of Object.entries(FEATURED_TAXONOMY)) (byCat[cat] = byCat[cat] || []).push(sub);
    for (const [cat, subs] of Object.entries(byCat)) await ensureCategory(cat, subs, categories);

    const now = new Date();
    const nowIso = now.toISOString();
    const endsAt = trialEndsAt(now);
    let published = 0, drafts = 0, done = 0, updated = 0;

    for (const b of preview.toCreate) {
        const id = featuredDocId(b);
        const complete = isComplete(b);
        await setDoc(doc(db, 'businesses', id), {
            id,
            name: b.name,
            category: b.category,
            subcategory: b.subcategory,
            description: b.description,
            address: b.address,
            neighborhoodName: b.neighborhood || '',
            cityId: b.cityId,
            coverImage: b.coverImage || '',
            gallery: b.gallery || [],
            phone: b.phone || '',
            whatsapp: b.whatsapp || '',
            email: b.email || '',
            instagram: b.instagram || '',
            website: b.website || '',
            amenities: b.amenities || [],
            openingHours: b.hours || {},
            rating: 0,
            reviewCount: 0,
            reviews: [],
            canBeClaimed: true,
            isClaimed: false,
            isBlocked: false,
            isFeatured: false,
            status: complete ? 'approved' : 'draft',
            active: true,
            // 3 meses grátis a partir da publicação (só para quem foi ao ar)
            ...(complete ? { plan: FREE_TRIAL_PLAN, subscriptionEndsAt: endsAt, courtesyTrial: true, courtesyTrialStartedAt: nowIso } : {}),
            missingFields: missingFields(b),
            sources: b.sources,
            checkedAt: b.checkedAt,
            importBatch: FEATURED_BATCH,
            createdAt: nowIso,
            updatedAt: nowIso,
        });
        if (complete) published += 1; else drafts += 1;
        done += 1;
        onProgress?.(done, preview.toCreate.length + preview.toUpdate.length);
    }
    for (const u of preview.toUpdate) {
        await updateDoc(doc(db, 'businesses', u.doc.id), u.photosOnly
            ? { coverImage: u.data.coverImage || '', ...(u.data.gallery?.length ? { gallery: u.data.gallery } : {}), updatedAt: nowIso }
            : enrichmentPatch(u.data, u.doc.status === 'draft', nowIso, endsAt));
        updated += 1; done += 1;
        onProgress?.(done, preview.toCreate.length + preview.toUpdate.length);
    }
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('dataUpdated'));
    if (published + drafts + updated > 0) await bumpContentVersion();
    return { published, drafts, updated };
};
