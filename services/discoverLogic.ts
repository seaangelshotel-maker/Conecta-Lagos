/**
 * Lógica pura da tela Descubra (sem Firebase): categorias, filtros, busca e relacionamentos.
 * Tudo funciona sobre os dados reais do banco. Filtro sem dado correspondente devolve lista vazia
 * (a tela explica por quê) em vez de fingir resultados.
 */
import { BusinessProfile, BlogPost, GuideRelated } from '../types';

export const norm = (s: string = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const has = (hay: string | undefined, words: string[]) => { const h = norm(hay); return words.some(w => h.includes(norm(w))); };
const subIs = (b: BusinessProfile, subs: string[]) => subs.some(s => norm(b.subcategory) === norm(s));
const catIs = (b: BusinessProfile, cats: string[]) => cats.some(c => norm(b.category) === norm(c));

export interface MainCategory { id: string; label: string; icon: string; match: (b: BusinessProfile) => boolean; }

const NIGHT = ['Bares e Quiosques', 'Beach Clubs'];
const NATURE = ['Natureza', 'Trilhas', 'Mirantes'];
const CULTURE = ['Pontos Históricos', 'Cultura'];
const BOAT = ['barco', 'lancha', 'escuna', 'traineira', 'catamara', 'veleiro'];
const NOT_EXPERIENCE = ['Praias', ...NATURE, ...CULTURE];

export const MAIN_CATEGORIES: MainCategory[] = [
  { id: 'praias', label: 'Praias', icon: 'Waves', match: b => subIs(b, ['Praias']) },
  { id: 'restaurantes', label: 'Restaurantes', icon: 'Utensils', match: b => catIs(b, ['Gastronomia']) && !subIs(b, NIGHT) },
  { id: 'barco', label: 'Passeios de barco', icon: 'Ship', match: b => has(b.name, BOAT) || has(b.subcategory, ['barco']) || has(b.description, ['passeio de barco']) },
  { id: 'passeios', label: 'Passeios e experiências', icon: 'Compass', match: b => catIs(b, ['Passeios']) && !subIs(b, NOT_EXPERIENCE) },
  { id: 'hospedagens', label: 'Hospedagens', icon: 'BedDouble', match: b => catIs(b, ['Hospedagem']) },
  { id: 'bares', label: 'Bares e vida noturna', icon: 'Wine', match: b => subIs(b, NIGHT) || has(b.name, ['bar ', ' bar', 'pub', 'noturn']) },
  { id: 'natureza', label: 'Natureza e aventura', icon: 'Mountain', match: b => subIs(b, NATURE) || (b.experienceTags || []).includes('aventura') },
  { id: 'cultura', label: 'Cultura e história', icon: 'Landmark', match: b => subIs(b, CULTURE) },
  { id: 'servicos', label: 'Serviços turísticos', icon: 'Briefcase', match: b => (catIs(b, ['Serviços']) && !subIs(b, ['Supermercados', 'Farmácias'])) || catIs(b, ['Bem-estar e Beleza']) },
  { id: 'comercio', label: 'Comércio local', icon: 'Store', match: b => catIs(b, ['Compras']) || subIs(b, ['Supermercados', 'Farmácias']) },
];

export interface ContextFilter { id: string; label: string; hint: string; }

/** Filtros contextuais. "populares", "melhores" e "perto" usam dados do sistema; os demais usam a curadoria (experienceTags). */
export const CONTEXT_FILTERS: ContextFilter[] = [
  { id: 'populares', label: 'Mais populares', hint: 'Ordenado por visualizações e ações registradas.' },
  { id: 'melhores', label: 'Melhor avaliados', hint: 'Só empresas com avaliações reais aprovadas.' },
  { id: 'perto', label: 'Perto de mim', hint: 'Usa sua localização; só aparecem lugares com coordenadas cadastradas.' },
  { id: 'gratuito', label: 'Gratuitos', hint: 'Lugares marcados como gratuitos pelo administrador.' },
  { id: 'familias', label: 'Para famílias', hint: 'Marcados pelo administrador como bons para famílias.' },
  { id: 'casais', label: 'Para casais', hint: 'Marcados pelo administrador como bons para casais.' },
  { id: 'criancas', label: 'Para crianças', hint: 'Marcados pelo administrador como bons para crianças.' },
  { id: 'aventura', label: 'Para quem busca aventura', hint: 'Trilhas, natureza e lugares marcados como aventura.' },
  { id: 'chuva', label: 'Para dias de chuva', hint: 'Marcados pelo administrador como bons para dias de chuva.' },
  { id: 'imperdivel', label: 'Experiências imperdíveis', hint: 'Seleção do administrador.' },
];

export const EXPERIENCE_TAGS = [
  { id: 'gratuito', label: 'Gratuito' }, { id: 'familias', label: 'Famílias' }, { id: 'casais', label: 'Casais' },
  { id: 'criancas', label: 'Crianças' }, { id: 'aventura', label: 'Aventura' }, { id: 'chuva', label: 'Dia de chuva' },
  { id: 'imperdivel', label: 'Imperdível' },
];

export const realRating = (b: BusinessProfile) => {
  const reviews = (b.reviews || []).filter(r => r && typeof r.rating === 'number' && (!r.status || r.status === 'approved'));
  if (!reviews.length) return 0;
  return reviews.reduce((s, r) => s + r.rating, 0) / reviews.length;
};

const popularity = (b: BusinessProfile) => (b.views || 0) + Object.values(b.actionCounts || {}).reduce((s: number, n: any) => s + (Number(n) || 0), 0);

export const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371, rad = (x: number) => (x * Math.PI) / 180;
  const dLat = rad(b.lat - a.lat), dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
};

export interface DiscoverState { categoryId?: string; filterId?: string; cityId?: string; query?: string; where?: { lat: number; lng: number } | null; }

export const filterBusinesses = (all: BusinessProfile[], st: DiscoverState): BusinessProfile[] => {
  let list = all.filter(b => !b.isBlocked && (!b.status || b.status === 'approved'));
  if (st.cityId) list = list.filter(b => b.cityId === st.cityId);
  if (st.categoryId) {
    const cat = MAIN_CATEGORIES.find(c => c.id === st.categoryId);
    if (cat) list = list.filter(cat.match);
  }
  const q = norm(st.query);
  if (q) {
    const terms = q.split(/\s+/).filter(Boolean);
    list = list.filter(b => {
      const text = norm([b.name, b.category, b.subcategory, b.description, b.address, (b.amenities || []).join(' ')].join(' '));
      return terms.every(t => text.includes(t));
    });
  }
  switch (st.filterId) {
    case 'populares': return [...list].sort((a, b) => popularity(b) - popularity(a) || a.name.localeCompare(b.name));
    case 'melhores': return list.filter(b => realRating(b) > 0).sort((a, b) => realRating(b) - realRating(a));
    case 'perto': {
      const w = st.where; if (!w) return [];
      return list.filter(b => typeof b.lat === 'number' && typeof b.lng === 'number')
        .sort((a, b) => haversineKm(w, { lat: a.lat!, lng: a.lng! }) - haversineKm(w, { lat: b.lat!, lng: b.lng! }));
    }
    case 'aventura': return list.filter(b => (b.experienceTags || []).includes('aventura') || subIs(b, ['Trilhas', 'Natureza']));
    case undefined: case '': return list;
    default: return list.filter(b => (b.experienceTags || []).includes(st.filterId!));
  }
};

export const countByCategory = (all: BusinessProfile[]) =>
  Object.fromEntries(MAIN_CATEGORIES.map(c => [c.id, all.filter(b => !b.isBlocked && (!b.status || b.status === 'approved') && c.match(b)).length]));

export const searchArticles = (articles: BlogPost[], query: string) => {
  const terms = norm(query).split(/\s+/).filter(Boolean);
  if (!terms.length) return articles;
  return articles.filter(a => {
    const text = norm([a.title, a.subtitle, a.excerpt, (a.tags || []).join(' '), a.category].join(' '));
    return terms.every(t => text.includes(t));
  });
};

/** Estabelecimentos reais ligados a uma matéria (nada é inventado: vem das regras `related`). */
export const resolveRelated = (rel: GuideRelated | undefined, all: BusinessProfile[]): BusinessProfile[] => {
  if (!rel) return [];
  const approved = all.filter(b => !b.isBlocked && (!b.status || b.status === 'approved'));
  const out = new Map<string, BusinessProfile>();
  (rel.businessIds || []).forEach(id => { const b = approved.find(x => x.id === id); if (b) out.set(b.id, b); });
  const byRule = approved.filter(b => {
    if (rel.cityId && b.cityId !== rel.cityId) return false;
    const catOk = rel.categories?.length ? rel.categories.some(c => norm(b.subcategory) === norm(c) || norm(b.category) === norm(c)) : false;
    const nameOk = rel.nameKeywords?.length ? has(b.name, rel.nameKeywords) : false;
    return catOk || nameOk;
  });
  byRule.forEach(b => out.set(b.id, b));
  // Quando há palavras-chave de nome, elas mandam (evita trazer toda uma categoria por engano)
  if (rel.nameKeywords?.length && !rel.categories?.length) return Array.from(out.values());
  return Array.from(out.values());
};

/** Categoria do Descubra que melhor representa um conjunto de lugares (para o botão "Ver mais" das matérias). */
export const discoverCategoryFor = (list: BusinessProfile[]): MainCategory | null => {
  let best: MainCategory | null = null; let n = 0;
  for (const c of MAIN_CATEGORIES) {
    const k = list.filter(c.match).length;
    if (k > n) { best = c; n = k; }
  }
  return best;
};

/** Cupons ativos que pertencem a lugares ligados à matéria (nada inventado: vem do campo companyId). */
export const couponsForBusinesses = <T extends { companyId: string }>(coupons: T[], list: BusinessProfile[]): T[] => {
  const ids = new Set(list.flatMap(b => [b.id, b.ownerId].filter(Boolean) as string[]));
  return coupons.filter(c => ids.has(c.companyId));
};
