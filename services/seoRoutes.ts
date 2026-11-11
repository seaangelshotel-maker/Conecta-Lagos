/**
 * Rotas públicas para SEO — funções puras, usadas pelo app (services/…) e pelo servidor (server/seo.ts).
 * Uma só fonte para: páginas por cidade, endereços que existem e o domínio oficial.
 */

/** Domínio oficial. Canônico, sitemap e compartilhamento sempre usam este endereço. */
export const OFFICIAL_SITE_URL = 'https://lagosgo.com.br';

export interface CityLanding {
  slug: string;
  cityId: string;
  /** Outros ids com que a cidade pode ter sido cadastrada. */
  aliases: string[];
  name: string;
  title: string;
  description: string;
  intro: string;
}

/** Páginas por cidade: /arraial-do-cabo, /cabo-frio, /buzios (as buscas locais caem aqui). */
export const CITY_LANDINGS: CityLanding[] = [
  {
    slug: 'arraial-do-cabo', cityId: 'city_arraial_do_cabo', aliases: ['arraial', 'arraial-do-cabo'], name: 'Arraial do Cabo',
    title: 'Arraial do Cabo: praias, passeios, restaurantes e hospedagens',
    description: 'Guia de Arraial do Cabo (RJ): praias, passeios de barco, mergulho, restaurantes, hospedagens, cupons e dicas de quem conhece a cidade.',
    intro: 'Tudo para planejar Arraial do Cabo: praias de água cristalina, passeios, onde comer e onde ficar.',
  },
  {
    slug: 'cabo-frio', cityId: 'city_cabo_frio', aliases: ['cabo-frio'], name: 'Cabo Frio',
    title: 'Cabo Frio: praias, passeios, restaurantes e hospedagens',
    description: 'Guia de Cabo Frio (RJ): praias, passeios, restaurantes, hospedagens, cupons e dicas para moradores e visitantes.',
    intro: 'O melhor de Cabo Frio: praias, passeios de barco, gastronomia e hospedagem, com cupons e dicas locais.',
  },
  {
    slug: 'buzios', cityId: 'city_buzios', aliases: ['buzios'], name: 'Armação dos Búzios',
    title: 'Búzios: praias, passeios, restaurantes e hospedagens',
    description: 'Guia de Armação dos Búzios (RJ): praias, passeios, restaurantes, hospedagens, cupons e dicas para aproveitar a cidade.',
    intro: 'Búzios do seu jeito: praias, passeios, restaurantes e onde se hospedar, com dicas de quem vive aqui.',
  },
];

export const cityLandingBySlug = (slug: string) => CITY_LANDINGS.find(c => c.slug === slug);
export const cityLandingByCityId = (cityId: string) => CITY_LANDINGS.find(c => c.cityId === cityId || c.aliases.includes(cityId));

/** Páginas fixas que existem no app e podem ser indexadas. */
export const PUBLIC_STATIC_PATHS = [
  '/', '/descubra', '/blog', '/guide', '/collections', '/ajuda', '/eventos', '/map', '/pricing-plans',
  '/privacidade', '/termos', '/excluir-conta',
  ...CITY_LANDINGS.map(c => `/${c.slug}`),
];

/** Áreas privadas ou de ação: existem, mas não entram no Google. */
export const PRIVATE_PATH_RE = /^\/(admin-dashboard|super-admin-dashboard|user-dashboard|journalist-dashboard|login|create-business|subscribe|search|ajuda\/(editar|gerenciar|minhas|interesses|publicar))(\/|$)/;

/** Padrões de página de conteúdo (um por tipo). */
export const CONTENT_PATH_RE = /^\/(business|blog|guia|journalist|collection|eventos|ajuda)\/[^/]+$/;

/** O endereço existe no app? (Qualquer outro vira página 404.) */
export const isKnownPath = (rawPath: string): boolean => {
  const path = (rawPath.split('?')[0] || '/').replace(/\/+$/, '') || '/';
  return PUBLIC_STATIC_PATHS.includes(path) || PRIVATE_PATH_RE.test(path) || CONTENT_PATH_RE.test(path);
};
