/**
 * Importa para o Guia a lista de lugares públicos pesquisados (data/publicPlaces.ts).
 *
 * - Só o administrador consegue gravar (as regras do Firestore barram os demais).
 * - Não duplica: pula lugares cujo nome já existe na mesma cidade (comparação sem acentos,
 *   maiúsculas e sem o complemento entre parênteses) e usa IDs fixos, então rodar de novo é seguro.
 * - Não grava nota, avaliações, horário nem telefone: só o que veio das fontes.
 */
import { doc, setDoc, getDocs, collection } from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentUser, getCategories, saveCity, getCities } from './dataService';
import { ensureCategory } from './seedService';
import { UserRole } from '../types';
import { PUBLIC_PLACES, PUBLIC_PLACES_BATCH, NEW_CITIES, PublicPlace } from '../data/publicPlaces';

const normalize = (s: string) => s
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/\(.*?\)/g, '')
    .replace(/[^a-z0-9 ]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim().toLowerCase();

const slug = (s: string) => normalize(s).replace(/ /g, '-');

export const placeDocId = (p: PublicPlace) => `pub_${p.cityId.replace('city_', '')}_${slug(p.name)}`.slice(0, 120);

export interface ImportPreview {
    toCreate: PublicPlace[];
    alreadyExists: { place: PublicPlace; existingName: string }[];
    newCities: string[];
}

/** Lê o banco e diz o que seria criado e o que será pulado (não grava nada). */
export const previewPublicPlacesImport = async (): Promise<ImportPreview> => {
    const snap = await getDocs(collection(db, 'businesses'));
    const existing = snap.docs.map(d => ({ id: d.id, ...(d.data() as any) }));
    const cities = await getCities();

    const toCreate: PublicPlace[] = [];
    const alreadyExists: ImportPreview['alreadyExists'] = [];
    for (const p of PUBLIC_PLACES) {
        const match = existing.find(b =>
            b.id === placeDocId(p) ||
            ((b.cityId || '') === p.cityId && normalize(b.name || '') === normalize(p.name))
        );
        if (match) alreadyExists.push({ place: p, existingName: match.name });
        else toCreate.push(p);
    }
    const newCities = NEW_CITIES.filter(c => !cities.find(x => x.id === c.id)).map(c => c.name);
    return { toCreate, alreadyExists, newCities };
};

/** Grava os lugares que ainda não existem. Retorna quantos foram criados. */
export const runPublicPlacesImport = async (onProgress?: (done: number, total: number) => void): Promise<number> => {
    const user = getCurrentUser();
    if (!user || user.role !== UserRole.SUPER_ADMIN) throw new Error('Apenas o administrador pode importar lugares.');

    const preview = await previewPublicPlacesImport();

    // 1. Cidades novas (ex.: Búzios)
    const cities = await getCities();
    for (const c of NEW_CITIES) {
        if (!cities.find(x => x.id === c.id)) {
            await saveCity({ id: c.id, name: c.name, active: true });
            cities.push({ id: c.id, name: c.name, active: true });
        }
    }

    // 2. Subcategorias usadas na categoria Passeios
    const categories = await getCategories(true);
    const subs = Array.from(new Set(PUBLIC_PLACES.map(p => p.subcategory)));
    await ensureCategory('Passeios', subs, categories);

    // 3. Lugares
    const now = new Date().toISOString();
    let done = 0;
    for (const p of preview.toCreate) {
        const id = placeDocId(p);
        await setDoc(doc(db, 'businesses', id), {
            id,
            name: p.name,
            category: 'Passeios',
            subcategory: p.subcategory,
            description: p.description,
            address: p.address,
            cityId: p.cityId,
            coverImage: '',
            gallery: [],
            phone: '',
            amenities: [],
            openingHours: {},
            rating: 0,
            reviewCount: 0,
            reviews: [],
            canBeClaimed: false,
            isClaimed: false,
            isBlocked: false,
            isFeatured: false,
            status: 'approved',
            active: true,
            sources: p.sources,
            importBatch: PUBLIC_PLACES_BATCH,
            createdAt: now,
            updatedAt: now,
        });
        done += 1;
        onProgress?.(done, preview.toCreate.length);
    }
    if (typeof window !== 'undefined') window.dispatchEvent(new Event('dataUpdated'));
    return done;
};
