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

/** Páginas por cidade: /arraial-do-cabo, /cabo-frio, /buzios, /araruama… (as buscas locais caem aqui). */
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
  {
    slug: 'araruama', cityId: 'city_araruama', aliases: ['araruama'], name: 'Araruama',
    title: 'Araruama: restaurantes, hospedagens e o que fazer',
    description: 'Guia de Araruama (RJ): restaurantes, hotéis e pousadas, com endereço, telefone e comodidades, e dicas para moradores e visitantes.',
    intro: 'Araruama, na Lagoa de Araruama: onde comer, onde ficar e o que aproveitar na cidade.',
  },
  {
    slug: 'sao-pedro-da-aldeia', cityId: 'city_sao_pedro_da_aldeia', aliases: ['sao-pedro-da-aldeia'], name: 'São Pedro da Aldeia',
    title: 'São Pedro da Aldeia: restaurantes, hospedagens e o que fazer',
    description: 'Guia de São Pedro da Aldeia (RJ): restaurantes, pousadas e hotéis, com endereço, telefone e comodidades, e dicas locais.',
    intro: 'São Pedro da Aldeia sem complicação: restaurantes, pousadas e dicas para curtir a cidade.',
  },
  {
    slug: 'saquarema', cityId: 'city_saquarema', aliases: ['saquarema'], name: 'Saquarema',
    title: 'Saquarema: restaurantes, hospedagens e o que fazer',
    description: 'Guia de Saquarema (RJ): restaurantes, bares, pousadas e hotéis, incluindo Itaúna, com endereço, telefone e comodidades.',
    intro: 'Saquarema e Itaúna: onde comer, onde ficar e como aproveitar a cidade do surfe.',
  },
  {
    slug: 'iguaba-grande', cityId: 'city_iguaba_grande', aliases: ['iguaba-grande'], name: 'Iguaba Grande',
    title: 'Iguaba Grande: restaurantes, hospedagens e o que fazer',
    description: 'Guia de Iguaba Grande (RJ): restaurantes, hotéis e pousadas, com endereço, telefone e comodidades, e dicas locais.',
    intro: 'Iguaba Grande à beira da lagoa: onde comer, onde se hospedar e o que fazer.',
  },
];

export const cityLandingBySlug = (slug: string) => CITY_LANDINGS.find(c => c.slug === slug);
export const cityLandingByCityId = (cityId: string) => CITY_LANDINGS.find(c => c.cityId === cityId || c.aliases.includes(cityId));

/** Páginas fixas que existem no app e podem ser indexadas. */
export const PUBLIC_STATIC_PATHS = [
  '/', '/descubra', '/blog', '/guide', '/collections', '/ajuda', '/eventos', '/passeios', '/map', '/pricing-plans',
  '/privacidade', '/termos', '/excluir-conta',
  ...CITY_LANDINGS.map(c => `/${c.slug}`),
];

/** Áreas privadas ou de ação: existem, mas não entram no Google. */
export const PRIVATE_PATH_RE = /^\/(admin-dashboard|super-admin-dashboard|user-dashboard|journalist-dashboard|login|create-business|subscribe|search|instalar|ajuda\/(editar|gerenciar|minhas|interesses|publicar))(\/|$)/;

/** Padrões de página de conteúdo (um por tipo). */
export const CONTENT_PATH_RE = /^\/(business|blog|guia|journalist|collection|eventos|ajuda)\/[^/]+$/;

/** O endereço existe no app? (Qualquer outro vira página 404.) */
export const isKnownPath = (rawPath: string): boolean => {
  const path = (rawPath.split('?')[0] || '/').replace(/\/+$/, '') || '/';
  return PUBLIC_STATIC_PATHS.includes(path) || PRIVATE_PATH_RE.test(path) || CONTENT_PATH_RE.test(path);
};
