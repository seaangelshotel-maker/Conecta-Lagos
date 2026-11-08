/**
 * Matérias do Guia (blog_posts com kind: 'guia'): leitura, administração e importação.
 * Reaproveita a coleção blog_posts e as regras já existentes (só admin cria/edita).
 */
import { doc, setDoc, updateDoc, getDocs, collection, query, where } from 'firebase/firestore';
import { db } from './firebase';
import { getCurrentUser } from './dataService';
import { BlogPost, BusinessProfile, UserRole } from '../types';
import { GUIDE_ARTICLES, GUIDE_BATCH } from '../data/guideArticles';

let _articles: BlogPost[] | null = null;

const clean = <T extends object>(o: T): T => JSON.parse(JSON.stringify(o));

const sortArticles = (list: BlogPost[]) =>
  [...list].sort((a, b) => (a.order ?? 999) - (b.order ?? 999) || (b.date || '').localeCompare(a.date || ''));

/** Todas as matérias do Guia no banco. `includeDrafts` só para o painel do admin. */
export const getGuideArticles = async (includeDrafts = false, force = false): Promise<BlogPost[]> => {
  if (!_articles || force) {
    const snap = await getDocs(query(collection(db, 'blog_posts'), where('kind', '==', 'guia')));
    _articles = sortArticles(snap.docs.map(d => ({ id: d.id, ...d.data() } as BlogPost)));
  }
  return includeDrafts ? _articles : _articles.filter(a => a.status !== 'draft');
};

export const getGuideArticleBySlug = async (slug: string) =>
  (await getGuideArticles(false)).find(a => a.slug === slug || a.id === slug) || null;

const requireAdmin = () => {
  const u = getCurrentUser();
  if (!u || u.role !== UserRole.SUPER_ADMIN) throw new Error('Apenas o administrador pode alterar matérias do Guia.');
};

/** Salva (cria ou atualiza) uma matéria do Guia. */
export const saveGuideArticle = async (a: BlogPost) => {
  requireAdmin();
  const next = { ...a, kind: 'guia' as const, authorId: a.authorId || getCurrentUser()!.id };
  await setDoc(doc(db, 'blog_posts', a.id), clean(next), { merge: true });
  if (_articles) {
    const i = _articles.findIndex(x => x.id === a.id);
    if (i >= 0) _articles[i] = { ..._articles[i], ...next }; else _articles.push(next);
    _articles = sortArticles(_articles);
  }
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('dataUpdated'));
};

export const setGuideArticleFlags = async (id: string, flags: Partial<Pick<BlogPost, 'status' | 'featured' | 'popular' | 'collections' | 'tags' | 'excerpt' | 'title' | 'subtitle' | 'category' | 'related' | 'relatedSlugs' | 'order'>>) => {
  requireAdmin();
  await updateDoc(doc(db, 'blog_posts', id), clean(flags));
  if (_articles) _articles = sortArticles(_articles.map(a => (a.id === id ? { ...a, ...flags } : a)));
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('dataUpdated'));
};

export interface GuideImportPreview { toCreate: BlogPost[]; alreadyExists: number; }

export const previewGuideImport = async (): Promise<GuideImportPreview> => {
  const existing = await getGuideArticles(true, true);
  const ids = new Set(existing.map(a => a.id));
  const toCreate = GUIDE_ARTICLES.filter(a => !ids.has(a.id));
  return { toCreate, alreadyExists: GUIDE_ARTICLES.length - toCreate.length };
};

/** Cadastra as matérias que ainda não existem. Não sobrescreve edições do administrador. */
export const runGuideImport = async (onProgress?: (done: number, total: number) => void): Promise<number> => {
  requireAdmin();
  const { toCreate } = await previewGuideImport();
  const me = getCurrentUser()!;
  let done = 0;
  for (const a of toCreate) {
    await setDoc(doc(db, 'blog_posts', a.id), clean({ ...a, authorId: me.id, importBatch: GUIDE_BATCH }));
    done += 1;
    onProgress?.(done, toCreate.length);
  }
  await getGuideArticles(true, true);
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('dataUpdated'));
  return done;
};

/** Curadoria: tags de experiência de uma empresa (só administrador; protegido nas regras). */
export const saveBusinessExperienceTags = async (b: BusinessProfile, tags: string[]) => {
  requireAdmin();
  await updateDoc(doc(db, 'businesses', b.id), { experienceTags: tags });
  b.experienceTags = tags;
  if (typeof window !== 'undefined') window.dispatchEvent(new Event('dataUpdated'));
};
