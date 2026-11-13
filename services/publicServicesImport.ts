/**
 * Importa para o Guia os serviços públicos de saúde e segurança (data/publicServices.ts).
 * - Só o administrador grava (regras do Firestore).
 * - Não duplica: IDs fixos e comparação de nome na mesma cidade; rodar de novo é seguro.
 * - Não podem ser reivindicados por empresa (canBeClaimed false), não têm plano nem cortesia.
 */
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentUser, getCategories } from './dataService';
import { ensureCategory } from './seedService';
import { UserRole } from '../types';
import { PUBLIC_SERVICES, PUBLIC_SERVICES_BATCH, PublicService } from '../data/publicServices';

const normalize = (s: string) => s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9 ]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim().toLowerCase();

export const serviceDocId = (s: PublicService) => `srv_${s.cityId.replace('city_', '')}_${normalize(s.name).replace(/ /g, '-')}`.slice(0, 120);

export interface ServicesPreview { toCreate: PublicService[]; alreadyExists: number; }

export const previewPublicServicesImport = async (): Promise<ServicesPreview> => {
    const snap = await getDocs(collection(db, 'businesses'));
    const existing = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    const toCreate: PublicService[] = [];
    let alreadyExists = 0;
    for (const s of PUBLIC_SERVICES) {
        const hit = existing.find(b => b.id === serviceDocId(s) || ((b.cityId || '') === s.cityId && normalize(b.name || '') === normalize(s.name)));
        if (hit) alreadyExists += 1; else toCreate.push(s);
    }
    return { toCreate, alreadyExists };
};

export const runPublicServicesImport = async (onProgress?: (done: number, total: number) => void): Promise<number> => {
    const user = getCurrentUser();
    if (!user || user.role !== UserRole.SUPER_ADMIN) throw new Error('Apenas o administrador pode importar serviços públicos.');
    const preview = await previewPublicServicesImport();

    const categories = await getCategories(true);
    const byCat: Record<string, Set<string>> = {};
    for (const s of PUBLIC_SERVICES) (byCat[s.category] = byCat[s.category] || new Set()).add(s.subcategory);
    for (const [cat, subs] of Object.entries(byCat)) await ensureCategory(cat, Array.from(subs), categories);

    const now = new Date().toISOString();
    let done = 0;
    for (const s of preview.toCreate) {
        const id = serviceDocId(s);
        await setDoc(doc(db, 'businesses', id), {
            id, name: s.name, category: s.category, subcategory: s.subcategory, description: s.description,
            address: s.address, neighborhoodName: s.neighborhood || '', cityId: s.cityId,
            coverImage: '', gallery: [], phone: s.phone || '', whatsapp: '', email: '', instagram: '', website: '',
            amenities: [], openingHours: s.hours || {},
            rating: 0, reviewCount: 0, reviews: [],
            canBeClaimed: false, isClaimed: false, isBlocked: false, isFeatured: false,
            status: 'approved', active: true,
            sources: s.sources, checkedAt: s.checkedAt, importBatch: PUBLIC_SERVICES_BATCH,
            createdAt: now, updatedAt: now,
        });
        done += 1;
        onProgress?.(done, preview.toCreate.length);
    }
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('dataUpdated'));
    return done;
};
