/**
 * Empresas em destaque do Guia (comércio e serviços), por categoria e cidade.
 *
 * Regras (para não haver informação inventada):
 * - Telefone, endereço, WhatsApp, e-mail e Instagram só entram se estiverem escritos
 *   no site oficial da empresa (ou na ficha pública indicada em `sources`) na data da consulta.
 * - Campo não confirmado fica vazio. A empresa só vai ao ar se tiver endereço E telefone
 *   confirmados; senão entra como rascunho (visível só ao administrador).
 * - Sem nota, sem avaliações, sem horário e sem fotos (nada disso foi confirmado em fonte).
 * - A descrição é neutra: só repete categoria e localização informadas pela própria empresa.
 */

export type CityId = 'city_arraial_do_cabo' | 'city_cabo_frio' | 'city_buzios';

export interface FeaturedBusiness {
  name: string;
  cityId: CityId;
  /** Categoria do Guia (ex.: Hospedagem) */
  category: string;
  /** Subcategoria (uma das 20 do lote) */
  subcategory: string;
  address: string;
  neighborhood?: string;
  phone: string;
  whatsapp?: string;
  email?: string;
  instagram?: string;
  website?: string;
  /** Horário publicado pela empresa, por dia (chaves: Domingo, Segunda, Terça, Quarta, Quinta, Sexta, Sábado). Vazio se não publicado. */
  hours?: Record<string, string>;
  description: string;
  /** Páginas onde os dados foram conferidos */
  sources: string[];
  /** Data da conferência (AAAA-MM-DD) */
  checkedAt: string;
}

export const FEATURED_BATCH = 'empresas-destaque-2026-11';
export const FREE_TRIAL_DAYS = 90;
export const FREE_TRIAL_PLAN = 'pro';

/** As 20 subcategorias do lote e a categoria do Guia a que pertencem. */
export const FEATURED_TAXONOMY: Record<string, string> = {
  'Pousadas': 'Hospedagem',
  'Hotéis': 'Hospedagem',
  'Hostels e Campings': 'Hospedagem',
  'Restaurantes': 'Gastronomia',
  'Frutos do Mar': 'Gastronomia',
  'Pizzarias': 'Gastronomia',
  'Hamburguerias': 'Gastronomia',
  'Cafés e Padarias': 'Gastronomia',
  'Sorveterias e Açaí': 'Gastronomia',
  'Bares e Quiosques': 'Gastronomia',
  'Beach Clubs': 'Gastronomia',
  'Spa e Massagem': 'Bem-estar e Beleza',
  'Salões e Barbearias': 'Bem-estar e Beleza',
  'Academias': 'Bem-estar e Beleza',
  'Moda Praia': 'Compras',
  'Artesanato e Souvenirs': 'Compras',
  'Farmácias': 'Serviços',
  'Supermercados': 'Serviços',
  'Aluguel de Carros': 'Serviços',
  'Táxi e Transfer': 'Serviços',
};

const D = '2026-11-05';
/** Mesmo horário em todos os dias. */
export const allDays = (h: string) => ({ Domingo: h, Segunda: h, 'Terça': h, Quarta: h, Quinta: h, Sexta: h, 'Sábado': h });
const AC = 'city_arraial_do_cabo' as const;

export const FEATURED_BUSINESSES: FeaturedBusiness[] = [
  // ───────── Arraial do Cabo · Pousadas
  {
    name: 'Pousada Fernandes', cityId: AC, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Praça da Independência, 25, Arraial do Cabo - RJ',
    phone: '(22) 99839-7677', whatsapp: '(22) 99839-7677',
    website: 'https://www.pousadafernandes.com.br',
    description: 'Pousada em Arraial do Cabo, na Praça da Independência.',
    sources: ['https://www.pousadafernandes.com.br/contato'], checkedAt: D,
  },
  {
    name: 'Pousada Arraial Tropical', cityId: AC, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Júlio de Macedo, 127, Praia Grande, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia Grande',
    phone: '(22) 98167-1535', whatsapp: '(22) 98167-1535', email: 'contato@pousadaarraialtropical.com.br',
    website: 'http://www.pousadaarraialtropical.com.br',
    description: 'Pousada na Praia Grande, em Arraial do Cabo. Telefone fixo: (22) 2340-0932.',
    sources: ['http://www.pousadaarraialtropical.com.br/'], checkedAt: D,
  },
  {
    name: 'Pousada Arraial Inn', cityId: AC, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Av. da Liberdade, 481, Praia dos Anjos, Arraial do Cabo - RJ', neighborhood: 'Praia dos Anjos',
    phone: '(22) 2622-7666', email: 'contato@dsbrasil.com.br',
    instagram: 'https://www.instagram.com/arraialinn/', website: 'https://www.pousadaarraialinn.com.br',
    description: 'Pousada na Praia dos Anjos, em Arraial do Cabo. Reservas: (21) 99626-3945.',
    sources: ['https://www.pousadaarraialinn.com.br/'], checkedAt: D,
  },
  {
    name: 'Pousada Caminho do Sol', cityId: AC, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Miguel Ângelo, 55, Praia Grande, Arraial do Cabo - RJ', neighborhood: 'Praia Grande',
    phone: '(22) 2622-2029', whatsapp: '(22) 98808-5751', email: 'reservas@caminhodosol.com.br',
    instagram: 'https://www.instagram.com/pousadacaminhodosol/', website: 'https://www.caminhodosol.com.br',
    description: 'Pousada na Praia Grande, em Arraial do Cabo.',
    sources: ['https://www.caminhodosol.com.br/', 'https://listatudo.com.br/rio-de-janeiro/norte-do-estado-e-regiao-dos-lagos/arraial-do-cabo/viagens-e-turismo/onde-ficar/pousadas/pousada-caminho-do-sol/'], checkedAt: D,
  },
  {
    name: 'Pousada Hotel Praia dos Anjos', cityId: AC, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Av. Roberto Silveira, 10, Praia dos Anjos, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia dos Anjos',
    phone: '(22) 98843-9933', email: 'contato@hotelpraiadosanjos.com.br',
    website: 'https://www.hotelpraiadosanjos.com.br',
    description: 'Pousada na Praia dos Anjos, em Arraial do Cabo. Telefones fixos: (22) 2622-1378 e (22) 2622-6550.',
    sources: ['https://www.hotelpraiadosanjos.com.br/'], checkedAt: D,
  },
  // ───────── Arraial do Cabo · Hostels e Campings
  {
    name: 'Chamos Hostel Cultural', cityId: AC, category: 'Hospedagem', subcategory: 'Hostels e Campings',
    address: 'Travessa Damaceno Barreto, 4, Arraial do Cabo - RJ',
    phone: '(22) 2340-3118', whatsapp: '(22) 98142-0565', email: 'chamoshostelcultural@gmail.com',
    instagram: 'https://instagram.com/chamoshostelcultural', website: 'https://chamoshostelcultural.com',
    description: 'Hostel em Arraial do Cabo.',
    sources: ['https://chamoshostelcultural.com/'], checkedAt: D,
  },

  // ───────── Arraial do Cabo · Hamburguerias
  {
    name: "Gabi's Hamburgueria", cityId: AC, category: 'Gastronomia', subcategory: 'Hamburguerias',
    address: 'Rua Nilo Peçanha, 50, Praia dos Anjos, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia dos Anjos',
    phone: '(22) 99757-8113', whatsapp: '(22) 99757-8113',
    hours: allDays('18:55 - 23:50'),
    description: 'Hamburgueria na Praia dos Anjos, em Arraial do Cabo. Pedidos pelo cardápio digital e pelo WhatsApp.',
    sources: ['https://cardapio.ai/online/hamburgueria-gabis'], checkedAt: D,
  },
  {
    name: 'Lorenzzo Burguer', cityId: AC, category: 'Gastronomia', subcategory: 'Hamburguerias',
    address: 'Rua Epitácio Pessoa, 47, Praia Grande, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia Grande',
    phone: '(22) 97401-8385', whatsapp: '(22) 97401-8385',
    instagram: 'https://www.instagram.com/hamburguerialorenzzo',
    description: 'Hamburgueria na Praia Grande, em Arraial do Cabo. Pedidos pelo cardápio digital e pelo WhatsApp.',
    sources: ['https://lorenzzo.ola.click/'], checkedAt: D,
  },
  // ───────── Arraial do Cabo · Restaurantes
  {
    name: 'Restobar Dos Anjos', cityId: AC, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Av. Roberto Silveira, 6, Praia dos Anjos, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia dos Anjos',
    phone: '(22) 99767-8838',
    hours: { Domingo: '11:30 - 22:00', Segunda: '11:30 - 19:00', 'Terça': '11:30 - 19:00', Quarta: '11:30 - 19:00', Quinta: '11:30 - 19:00', Sexta: '11:30 - 22:00', 'Sábado': '11:30 - 22:00' },
    description: 'Restobar na Praia dos Anjos, em Arraial do Cabo.',
    sources: ['https://www.tripadvisor.com.br/Restaurant_Review-g1056623-d23693289-Reviews-Restobar_Dos_Anjos-Arraial_do_Cabo_State_of_Rio_de_Janeiro.html'], checkedAt: D,
  },
];
