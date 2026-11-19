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

export type CityId =
  | 'city_arraial_do_cabo' | 'city_cabo_frio' | 'city_buzios'
  | 'city_araruama' | 'city_sao_pedro_da_aldeia' | 'city_saquarema' | 'city_iguaba_grande';

/** Cidades que podem não existir no banco ainda; a importação cria as que faltarem. */
export const FEATURED_NEW_CITIES: { id: CityId; name: string }[] = [
  { id: 'city_araruama', name: 'Araruama' },
  { id: 'city_sao_pedro_da_aldeia', name: 'São Pedro da Aldeia' },
  { id: 'city_saquarema', name: 'Saquarema' },
  { id: 'city_iguaba_grande', name: 'Iguaba Grande' },
];

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
  /** Ids de comodidades confirmadas (ver AMENITIES em types.ts). Vazio se não confirmado. */
  amenities?: string[];
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
  'Baladas e Casas Noturnas': 'Gastronomia',
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
const CF = 'city_cabo_frio' as const;
const BZ = 'city_buzios' as const;
const AR = 'city_araruama' as const;
const SP = 'city_sao_pedro_da_aldeia' as const;
const SQ = 'city_saquarema' as const;
const IG = 'city_iguaba_grande' as const;

export const FEATURED_BUSINESSES: FeaturedBusiness[] = [
  // ───────── Arraial do Cabo · Pousadas
  {
    name: 'Pousada Fernandes', cityId: AC, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Praça da Independência, 25, Arraial do Cabo - RJ',
    phone: '(22) 99839-7677', whatsapp: '(22) 99839-7677',
    website: 'https://www.pousadafernandes.com.br',
    amenities: ['wifi', 'ac', 'tv', 'breakfast'],
    description: 'Casa de acolhimento familiar na Praça da Independência, a poucos passos da Prainha, da Praia Grande e do Pontal, as águas mais claras de Arraial do Cabo. A pousada se apresenta como um refúgio íntimo, de luz natural e manhãs silenciosas, e dá destaque ao café da manhã, que os hóspedes citam como ponto alto da estadia. A Suíte Standard vem em três configurações: dupla (cama de casal), tripla (casal mais solteiro) e quádrupla (casal e dois solteiros), todas com ar-condicionado, Wi-Fi, Smart TV, frigobar, banheiro privativo e roupa de cama premium. O site oferece reserva direta. Fica no centro, perto do porto de onde saem os passeios de barco.',
    sources: ['https://www.pousadafernandes.com.br/', 'https://www.pousadafernandes.com.br/contato'], checkedAt: '2026-11-18',
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
  // ───────── Arraial do Cabo · Supermercados e Sorveterias/Açaí
  {
    name: 'Princesa Supermercados - Arraial do Cabo III', cityId: AC, category: 'Serviços', subcategory: 'Supermercados',
    address: 'Praça da Bandeira, Arraial do Cabo - RJ',
    phone: '(22) 2622-9500', whatsapp: '(21) 96516-2867',
    website: 'https://www.princesasupermercados.com.br/arraial_cabo_3',
    description: 'Unidade Arraial do Cabo III da rede Princesa Supermercados.',
    sources: ['https://www.princesasupermercados.com.br/arraial_cabo_3/regioes-e-horarios-atendimento'], checkedAt: D,
  },
  {
    name: 'Açaí Forte do Cabo', cityId: AC, category: 'Gastronomia', subcategory: 'Sorveterias e Açaí',
    address: 'Rua Dom Manuel, 119, Macedônia, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Macedônia',
    phone: '(22) 99725-6064', whatsapp: '(22) 99725-6064',
    instagram: 'https://www.instagram.com/acaiforte.docabo',
    description: 'Açaiteria em Arraial do Cabo. Pedidos pelo cardápio digital e pelo WhatsApp.',
    sources: ['https://acai-forte-do-cabo.ola.click/info'], checkedAt: D,
  },
  // ───────── Cabo Frio · Pousadas e Hotéis
  {
    name: 'Pousada Águas do Forte', cityId: CF, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Ismar Gomes de Azevedo, 19, Praia do Forte, Cabo Frio - RJ', neighborhood: 'Praia do Forte',
    phone: '(22) 2643-4379', email: 'reservas@pousadaaguasdoforte.com.br', website: 'https://www.pousadaaguasdoforte.com.br',
    description: 'Pousada na Praia do Forte, em Cabo Frio. Outro telefone: (22) 2645-6498.',
    sources: ['https://www.pousadaaguasdoforte.com.br/'], checkedAt: D,
  },
  {
    name: 'Pousada Areia do Forte', cityId: CF, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Antônio Feliciano de Almeida, 193, Passagem, Cabo Frio - RJ, 28906-240', neighborhood: 'Passagem',
    phone: '(22) 99953-7145', instagram: 'https://www.instagram.com/pousadaareiadoforte/', website: 'https://pousadaareiadoforte.com.br',
    description: 'Pousada no bairro da Passagem, em Cabo Frio.',
    sources: ['https://pousadaareiadoforte.com.br/localizacao/'], checkedAt: D,
  },
  {
    name: 'Pousada Porto Forte', cityId: CF, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Professor Miguel Couto, 192, Centro, Cabo Frio - RJ', neighborhood: 'Centro',
    phone: '(22) 2643-1970', whatsapp: '(22) 99247-9093', email: 'contato@pousadaportoforte.com.br',
    instagram: 'https://www.instagram.com/pousadaportoforte/', website: 'https://www.pousadaportoforte.com.br',
    description: 'Pousada no Centro de Cabo Frio.',
    sources: ['https://www.pousadaportoforte.com.br/contato'], checkedAt: D,
  },
  {
    name: 'Pousada Brisa do Forte', cityId: CF, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Roberto Nogueira Machado, 20, Praia do Forte, Cabo Frio - RJ', neighborhood: 'Praia do Forte',
    phone: '(22) 2645-0771', whatsapp: '(22) 99277-7929',
    instagram: 'https://www.instagram.com/ondasdoforte_/', website: 'https://pousadabrisadoforte.com.br',
    description: 'Pousada na Praia do Forte, em Cabo Frio.',
    sources: ['https://pousadabrisadoforte.com.br/pousada-em-cabo-frio-praia-perto-da-praia-do-forte/'], checkedAt: D,
  },
  {
    name: 'Hotel Mar de Cabo Frio', cityId: CF, category: 'Hospedagem', subcategory: 'Hotéis',
    address: 'Rua Zulmira Mendes, 567, Cabo Frio - RJ, 28908-105',
    phone: '(22) 2643-3080', whatsapp: '(22) 99275-0932', email: 'reservas@mardecabofrio.com.br',
    instagram: 'https://www.instagram.com/pousadamardecabofrio', website: 'https://hotelmardecabofrio.com.br',
    description: 'Hotel em Cabo Frio. Outro telefone: (22) 2040-8002.',
    sources: ['https://hotelmardecabofrio.com.br/contato/'], checkedAt: D,
  },
  // ───────── Cabo Frio · Restaurantes
  {
    name: 'Passagem Altto Sushi', cityId: CF, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Rua Constantino Menelau, 240, Passagem, Cabo Frio - RJ', neighborhood: 'Passagem',
    phone: '(22) 3031-1146', whatsapp: '(22) 3031-1146',
    hours: allDays('18:00 - 00:00'),
    instagram: 'https://www.instagram.com/alttosushi/', website: 'https://passagemalttosushi.com.br',
    description: 'Restaurante de culinária japonesa no bairro da Passagem, em Cabo Frio.',
    sources: ['https://passagemalttosushi.com.br/'], checkedAt: D,
  },
  // ───────── Búzios · Pousadas
  {
    name: 'Pousada Pontal da Ferradura', cityId: BZ, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Av. Roberto Improta Saraiva, 1346, Ferradura, Armação dos Búzios - RJ, 28951-294', neighborhood: 'Ferradura',
    phone: '(22) 2623-1177', whatsapp: '(22) 98109-7822', email: 'reservas@pontaldaferradura.com.br',
    instagram: 'https://www.instagram.com/pontaldaferradura/', website: 'https://www.pontaldaferradura.com.br',
    description: 'Pousada na Ferradura, em Búzios. Central de reservas: (21) 2042-3554 e WhatsApp (22) 98878-1211.',
    sources: ['https://www.pontaldaferradura.com.br/'], checkedAt: D,
  },
  {
    name: 'Pousada Luzes de Geribá', cityId: BZ, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Rodrigues de Souza, 24, Canto Esquerdo de Geribá, Armação dos Búzios - RJ', neighborhood: 'Geribá',
    phone: '(22) 98802-3020', email: 'reservas@luzesdegeriba.com.br', website: 'https://www.luzesdegeriba.com.br',
    description: 'Pousada no canto esquerdo da Praia de Geribá, em Búzios.',
    sources: ['https://www.luzesdegeriba.com.br/'], checkedAt: D,
  },
  {
    name: 'Pousada Mar de Geribá', cityId: BZ, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Caboclo, 14, Geribá, Armação dos Búzios - RJ', neighborhood: 'Geribá',
    phone: '(22) 99869-2314', whatsapp: '(22) 99869-2314', email: 'reservas@mardegeriba.com.br',
    website: 'https://mardegeriba.com.br',
    description: 'Pousada em Geribá, em Búzios.',
    sources: ['https://mardegeriba.com.br/'], checkedAt: D,
  },
  // ───────── Búzios · Restaurantes
  {
    name: 'Xerelete Bar e Restaurante', cityId: BZ, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Orla Bardot, 514, Centro, Armação dos Búzios - RJ', neighborhood: 'Centro',
    phone: '(22) 99845-4052', whatsapp: '(22) 99845-4052',
    hours: { Domingo: '12:00 - 23:00', Segunda: '12:00 - 00:00', 'Terça': '12:00 - 00:00', Quarta: '12:00 - 00:00', Quinta: '12:00 - 00:00', Sexta: '12:00 - 01:00', 'Sábado': '12:00 - 01:00' },
    instagram: 'https://www.instagram.com/xereletebuzios/', website: 'https://xereletebar.com',
    description: 'Bar e restaurante na Orla Bardot, em Búzios.',
    sources: ['https://xereletebar.com/'], checkedAt: D,
  },
  // ───────── Lote 3 · Pizzarias, Beach Club e Restaurantes
  {
    name: 'Victtorio Pizzaria & Forneria', cityId: BZ, category: 'Gastronomia', subcategory: 'Pizzarias',
    address: 'Orla Bardot, 500 (Av. José Bento Ribeiro Dantas), Búzios - RJ, 28950-000', neighborhood: 'Centro',
    phone: '(22) 2620-0158', whatsapp: '(22) 98809-7552',
    instagram: 'https://www.instagram.com/victtoriopizzariaeforneria/', website: 'https://victtorio.com.br',
    description: 'Pizzaria e forneria na Orla Bardot, em Búzios.',
    sources: ['https://victtorio.com.br/'], checkedAt: D,
  },
  {
    name: 'Beach Club Ville La Plage', cityId: BZ, category: 'Gastronomia', subcategory: 'Beach Clubs',
    address: 'Rua João Fernandes, s/n, Quadra B, Lotes 39-40, Búzios - RJ, 28950-000',
    phone: '(22) 99622-2315', whatsapp: '(22) 99622-2315',
    hours: allDays('09:00 - 18:00'),
    instagram: 'https://www.instagram.com/beachclublaplage', website: 'https://beachclub.villelaplage.com.br',
    description: 'Beach club em Búzios, com Day Use todos os dias das 9h às 18h. A jacuzzi do Beach Club funciona das 10h às 18h.',
    sources: ['https://beachclub.villelaplage.com.br/'], checkedAt: D,
  },
  {
    name: 'Apreciatta Pizzaria', cityId: CF, category: 'Gastronomia', subcategory: 'Pizzarias',
    address: 'Rua Sete, 3, Jardim Caiçara, Cabo Frio - RJ', neighborhood: 'Jardim Caiçara',
    phone: '(22) 2648-1178',
    hours: { Domingo: '18:00 - 00:00', Segunda: 'Fechado', 'Terça': '18:00 - 00:00', Quarta: '18:00 - 00:00', Quinta: '18:00 - 00:00', Sexta: '18:00 - 00:00', 'Sábado': '18:00 - 00:00' },
    instagram: 'https://www.instagram.com/apreciattabr',
    description: 'Pizzaria no Jardim Caiçara, em Cabo Frio. Funciona de terça a domingo.',
    sources: ['https://saboresdecabofrio.com.br/apreciatta-pizzaria/'], checkedAt: D,
  },
  {
    name: 'Restaurante Mar.', cityId: CF, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Rua Marechal Floriano, 113, São Bento, Cabo Frio - RJ', neighborhood: 'São Bento',
    phone: '(22) 3031-5468', whatsapp: '',
    hours: { Domingo: '12:00 - 22:00', Quarta: '17:00 - 23:00', Quinta: '17:00 - 23:00', Sexta: '17:00 - 00:00', 'Sábado': '12:00 - 00:00' },
    description: 'Restaurante no bairro São Bento, em Cabo Frio. Outro telefone: (22) 99773-5096. Horário publicado de quarta a domingo.',
    sources: ['https://saboresdecabofrio.com.br/mar/'], checkedAt: D,
  },
  // ───────── Arraial do Cabo · Restaurantes (curadoria conforme docs/CADASTRO_PADRAO.md)
  {
    name: 'Restaurante Saint Tropez', cityId: AC, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Praça Daniel Barreto, 2, Praia dos Anjos, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia dos Anjos',
    phone: '(22) 2622-1222', whatsapp: '(22) 99856-1708',
    instagram: 'https://www.instagram.com/restaurantesainttropez/',
    hours: { Domingo: '12:00 - 23:30', Segunda: '12:00 - 23:30', 'Terça': '12:00 - 23:30', Quarta: '12:00 - 23:30', Quinta: '12:00 - 23:30', Sexta: '12:00 - 23:30', 'Sábado': '12:00 - 23:30' },
    amenities: ['parking', 'access', 'kids', 'pet', 'card', 'bar'],
    description: 'Desde 1981, o Saint Tropez ocupa uma esquina da Praça do Cova e reúne duas cozinhas: a francesa do chef Guy, que vive em Arraial desde 1980, e a mesa farta do litoral brasileiro. O cardápio é longo, com frutos do mar, carnes, massas, sopas e pizzas, e traz pratos de personalidade, como o surf and turf de polvo com bacon e o frango à cubana com bananas e abacaxis empanados. As porções são pensadas para dividir, então combine o pedido com a mesa. É parada natural para o almoço depois do passeio de barco, no coração da Praia dos Anjos.',
    sources: ['https://www.instagram.com/restaurantesainttropez/', 'https://linktr.ee/restaurantesainttropezz', 'https://www.google.com/maps/place/Restaurante+Saint+Tropez/@-22.9701477,-42.0202437,17z', 'https://www.viajenaviagem.com/destino/arraial-do-cabo/onde-comer/', 'https://guia.melhoresdestinos.com.br/saint-tropez-190-5138-l.html'], checkedAt: '2026-11-12',
  },
  {
    name: 'Casa da Piedra', cityId: AC, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'R. Santa Cruz, 4, Praia dos Anjos, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia dos Anjos',
    phone: '(22) 2340-1687', whatsapp: '(22) 98110-1724',
    instagram: 'https://www.instagram.com/casadapiedra_/',
    hours: { Domingo: '12:00 - 00:00', Segunda: '12:00 - 00:00', 'Terça': '12:00 - 00:00', Quarta: '12:00 - 00:00', Quinta: '12:00 - 00:00', Sexta: '12:00 - 00:00', 'Sábado': '12:00 - 00:00' },
    amenities: ['wifi', 'parking', 'access', 'kids', 'card', 'bar', 'delivery'],
    description: 'Num casarão histórico à beira da praia, a Casa da Piedra é ao mesmo tempo restaurante, bar e centro cultural. O visitante vê exposições de arte local e, nos fins de semana, encontra música ao vivo. A cozinha tem frutos do mar, drinques e uma seção vegetariana e vegana no cardápio, e o terraço convida a ficar além do jantar. É endereço certo para unir boa mesa e um pouco de história da cidade, em dupla, em família ou em grupo.',
    sources: ['https://www.instagram.com/casadapiedra_/', 'https://www.google.com/maps/place/Restaurante+Casa+da+Piedra/@-22.9691536,-42.0191739,17z', 'https://wanderlog.com/place/details/1409109', 'https://www.happycow.net/reviews/casa-da-piedra-arraial-do-cabo-359986'], checkedAt: '2026-11-12',
  },
  {
    name: 'Pimenta Rosa Gastronomia', cityId: AC, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Travessa Damaceno Barreto, 9, Praia dos Anjos, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia dos Anjos',
    phone: '(22) 2622-3073',
    website: 'https://www.facebook.com/gastronomiapimentarosa',
    hours: { Domingo: '12:00 - 23:00', Segunda: 'Fechado', 'Terça': 'Fechado', Quarta: '16:00 - 23:00', Quinta: '16:00 - 23:00', Sexta: '16:00 - 23:00', 'Sábado': '12:00 - 23:00' },
    amenities: ['access', 'kids', 'card'],
    description: 'Numa casa de ambiente sossegado na Travessa Damaceno Barreto, perto de onde os barcos de passeio atracam, o Pimenta Rosa é um respiro longe do vaivém dos restaurantes de beira-mar. A cozinha tem jeito caseiro e não se prende a uma só especialidade: há massas, carnes e pratos de peixe, entre eles massas com camarão e a pimenta-rosa que dá nome ao lugar. Funciona bem para jantar com calma na Praia dos Anjos depois do passeio e para quem prefere um clima mais íntimo e familiar.',
    sources: ['https://www.facebook.com/gastronomiapimentarosa', 'https://www.google.com/maps/search/Pimenta+Rosa+Gastronomia+Arraial+do+Cabo', 'https://wanderlog.com/place/details/1180783', 'https://tasteatlas.com/PimentaRosaGastronomia', 'https://guia.melhoresdestinos.com.br/pimenta-rosa-190-5140-l.html'], checkedAt: '2026-11-13',
  },
  {
    name: 'Astral Beach Food', cityId: AC, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'R. Carlos Gomes, 19, Centro, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia dos Anjos',
    phone: '(22) 99982-6331',
    instagram: 'https://www.instagram.com/astralbeach.food/',
    hours: { Domingo: '17:30 - 22:30', Segunda: '17:30 - 22:30', 'Terça': 'Fechado', Quarta: '17:30 - 22:30', Quinta: '17:30 - 22:30', Sexta: '17:30 - 22:30', 'Sábado': '17:30 - 22:30' },
    amenities: ['access', 'parking', 'pet', 'kids', 'card', 'bar', 'delivery'],
    description: 'Com clima de surf e decoração caprichada num espaço pequeno do Centro, o Astral Beach Food junta várias cozinhas numa mesma mesa: pokes, sushi, burritos, hambúrgueres e petiscos de frutos do mar fritos, como o camarão crocante. Há opções veganas e vegetarianas e pratos pensados para crianças, o que ajuda grupos e famílias a se entenderem no pedido. É uma boa pedida para jantar sem pressa depois da praia, e a casa também atende por delivery e retirada.',
    sources: ['https://www.instagram.com/astralbeach.food/', 'https://astralbeach.com.br', 'https://www.google.com/maps/search/Astral+Beach+Food+Arraial+do+Cabo', 'https://wanderlog.com/place/details/1298815'], checkedAt: '2026-11-13',
  },
  {
    name: 'Smash do Cabo Hamburgueria', cityId: AC, category: 'Gastronomia', subcategory: 'Hamburguerias',
    address: 'R. Damião Teixeira, 33, Praia dos Anjos, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia dos Anjos',
    phone: '(22) 99703-1063',
    hours: { Domingo: '18:00 - 23:00', Segunda: '18:00 - 23:00', 'Terça': '18:00 - 23:00', Quarta: '18:00 - 23:00', Quinta: '18:00 - 23:00', Sexta: '18:00 - 23:00', 'Sábado': '18:00 - 23:00' },
    amenities: ['wifi', 'parking', 'access', 'pet', 'kids', 'card', 'delivery'],
    description: 'Especializada em hambúrguer smash, a Smash do Cabo prepara o clássico de 80 g e aposta em detalhes da casa, como a maionese verde e a coxinha sem massa servida de entrada. O cardápio também tem batata frita, pulled pork e drinques, como a caipirinha. O ambiente é aconchegante, de luz amarelada e clima familiar, na Rua Damião Teixeira, na Praia dos Anjos. As mesas ficam também ao ar livre, cães são aceitos, e a casa atende por delivery e retirada. Funciona à noite, o que combina com o fim de tarde na Praia dos Anjos.',
    sources: ['https://www.google.com/maps/search/Smash+do+Cabo+Hamburgueria+Arraial+do+Cabo', 'https://wanderlog.com/place/details/2624042'], checkedAt: '2026-11-13',
  },
  {
    name: 'Santo Gole Bar e Grill', cityId: AC, category: 'Gastronomia', subcategory: 'Bares e Quiosques',
    address: 'Praça Daniel Barreto, 5, Praia dos Anjos, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia dos Anjos',
    phone: '(22) 99616-4456',
    instagram: 'https://www.instagram.com/santogolebaregrill/',
    hours: { Domingo: '17:30 - 00:00', Segunda: '17:30 - 00:00', 'Terça': '17:30 - 00:00', Quarta: 'Fechado', Quinta: '17:30 - 00:00', Sexta: '17:30 - 00:00', 'Sábado': '17:30 - 01:00' },
    amenities: ['parking', 'access', 'pet', 'kids', 'card', 'bar', 'delivery'],
    description: 'Bar e grill na Praça do Cova, o Santo Gole combina cozinha de bar com uma ótima seleção de cervejas, coquetéis e música ao vivo. As mesas ficam ao ar livre, o clima é aconchegante, e há cardápio infantil para quem vai em família. Vale reservar para o jantar, e cães são bem-vindos na área externa. Os pratos saem tanto para o almoço quanto para o jantar, o que deixa a casa prática para quem passa o dia na região. É um endereço para esticar a noite na Praia dos Anjos sem sair da praça.',
    sources: ['https://www.instagram.com/santogolebaregrill/', 'https://www.google.com/maps/search/Santo+Gole+Arraial+do+Cabo'], checkedAt: '2026-11-13',
  },
  {
    name: 'Restaurante Tio Dorp', cityId: AC, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Praça Daniel Barreto, 10, Praia dos Anjos, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia dos Anjos',
    phone: '(22) 2340-0246',
    instagram: 'https://www.instagram.com/restaurantetiodorp',
    hours: { Domingo: '12:00 - 22:00', Segunda: '12:00 - 22:00', 'Terça': '12:00 - 22:00', Quarta: '12:00 - 22:00', Quinta: '12:00 - 22:00', Sexta: '12:00 - 22:00', 'Sábado': '12:00 - 22:00' },
    amenities: ['wifi', 'parking', 'access', 'pet', 'kids', 'card', 'bar', 'delivery'],
    description: 'Na Praça do Cova, com vista para a Praia dos Anjos a partir do deck ao ar livre, o Tio Dorp serve almoço e jantar em buffet a quilo, com frutos do mar, carnes e saladas, além de bebidas e sobremesas. O espaço é familiar, com cardápio infantil e fraldário, e quem prefere comer em outro lugar pode levar marmita. As mesas externas e a cobertura fazem o programa render além do almoço, com música ao vivo, café e carta de vinhos entre os destaques da casa. Fica perto da igreja Nossa Senhora dos Remédios e do Porto do Forno.',
    sources: ['https://www.instagram.com/restaurantetiodorp', 'https://www.google.com/maps/search/Restaurante+Tio+Dorp+Arraial+do+Cabo', 'https://wanderlog.com/place/details/2829166'], checkedAt: '2026-11-13',
  },

  // ───────── Búzios · pré-cadastro (Google Maps, 2026-11-17). Telefone de 1 fonte; Instagram e horário por dia ficam para completar.
  {
    name: 'Canto Restô', cityId: BZ, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'R. das Pedras, Centro, Armação dos Búzios - RJ, 28950-000', neighborhood: 'Centro',
    phone: '(22) 2633-3803',
    description: 'Restaurante de cozinha mediterrânea na Rua das Pedras, no Centro de Búzios.',
    sources: ['https://www.google.com/maps/search/Canto+Restô+Búzios'], checkedAt: '2026-11-17',
  },
  {
    name: 'Místico Restaurant', cityId: BZ, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'R. Morro do Humaitá, 13, Loteamento Triângulo de Búzios, Armação dos Búzios - RJ, 28950-000', neighborhood: 'Triângulo',
    phone: '(22) 99765-5256',
    description: 'Restaurante de cozinha autoral, dentro do Abracadabra Boutique Hotel, no Morro do Humaitá, em Búzios.',
    sources: ['https://www.google.com/maps/search/Místico+Restaurant+Búzios'], checkedAt: '2026-11-17',
  },
  {
    name: 'Restaurante La Gare', cityId: BZ, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Praça Eugênio Honold, 173, Ossos, Armação dos Búzios - RJ, 28950-000', neighborhood: 'Ossos',
    phone: '(22) 2623-5770', website: 'https://viladasanta.com',
    description: 'Restaurante à la carte com frutos do mar, carnes, risotos e massas, no hotel Vila da Santa, em Ossos, Búzios.',
    sources: ['https://www.google.com/maps/search/La+Gare+Restaurante+Búzios', 'https://viladasanta.com'], checkedAt: '2026-11-17',
  },
  {
    name: 'Primitivo Búzios', cityId: BZ, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'R. das Pedras, 60, Centro, Armação dos Búzios - RJ, 28950-800', neighborhood: 'Centro',
    phone: '(22) 2623-9951', website: 'https://primitivobuzios.com.br',
    description: 'Restaurante italiano com pizza, massas e vinhos na Rua das Pedras, no Centro de Búzios.',
    sources: ['https://www.google.com/maps/search/Primitivo+Búzios', 'https://primitivobuzios.com.br'], checkedAt: '2026-11-17',
  },
  {
    name: 'Rocka Restaurant & Beach Lounge', cityId: BZ, category: 'Gastronomia', subcategory: 'Beach Clubs',
    address: 'Av. Geribá, quadra CLT10, Geribá, Armação dos Búzios - RJ, 28950-000', neighborhood: 'Geribá',
    phone: '',
    description: 'Restaurante mediterrâneo e beach lounge no deck, junto à Praia de Geribá, em Búzios.',
    sources: ['https://www.google.com/maps/search/Rocka+Beach+Lounge+Búzios'], checkedAt: '2026-11-17',
  },
  {
    name: 'Silk Beach Club Búzios', cityId: BZ, category: 'Gastronomia', subcategory: 'Beach Clubs',
    address: 'R. Dezessete, 14, Praia Brava, Armação dos Búzios - RJ, 28950-000', neighborhood: 'Praia Brava',
    phone: '(22) 99972-8191', website: 'https://silkbeachclub.com.br',
    description: 'Beach club na Praia Brava, em Búzios, com espreguiçadeiras, guarda-sóis, refeições e bebidas.',
    sources: ['https://www.google.com/maps/search/Silk+Beach+Club+Búzios', 'https://silkbeachclub.com.br'], checkedAt: '2026-11-17',
  },
  {
    name: 'Tawa Beach', cityId: BZ, category: 'Gastronomia', subcategory: 'Beach Clubs',
    address: 'Praia da Ferradura, R. Ana Horta, s/n, Armação dos Búzios - RJ, 28951-056', neighborhood: 'Ferradura',
    phone: '(22) 99757-5059', website: 'https://tawabeach.com',
    description: 'Beach club na Praia da Ferradura, em Búzios.',
    sources: ['https://www.google.com/maps/search/Tawa+Beach+Búzios', 'https://tawabeach.com'], checkedAt: '2026-11-17',
  },
  {
    name: 'Privilège Búzios', cityId: BZ, category: 'Gastronomia', subcategory: 'Baladas e Casas Noturnas',
    address: 'Av. José Bento Ribeiro Dantas, 550, Centro, Armação dos Búzios - RJ, 28950-230', neighborhood: 'Centro',
    phone: '(22) 98819-0465',
    description: 'Casa noturna na Orla Bardot, no Centro de Búzios, com pistas de dança, lounge e bares.',
    sources: ['https://www.google.com/maps/search/Privilège+Búzios'], checkedAt: '2026-11-17',
  },
  {
    name: "Vila d'este Búzios Hotel", cityId: BZ, category: 'Hospedagem', subcategory: 'Hotéis',
    address: 'R. Alto do Humaitá, 210, Humaitá, Armação dos Búzios - RJ, 28950-209', neighborhood: 'Humaitá',
    phone: '', website: 'https://viladeste.com.br',
    description: 'Hotel 5 estrelas numa colina com vista para o oceano, a cerca de 1 km da Rua das Pedras, em Búzios.',
    sources: ['https://www.google.com/maps/search/Vila+d%27Este+Hotel+Búzios', 'https://viladeste.com.br'], checkedAt: '2026-11-17',
  },
  {
    name: 'Insólito Boutique Hotel & Spa', cityId: BZ, category: 'Hospedagem', subcategory: 'Hotéis',
    address: 'Rua Lydia Gonçalves de Almeida, Praia da Ferradura, Armação dos Búzios - RJ', neighborhood: 'Ferradura',
    phone: '',
    description: 'Hotel boutique com spa na Praia da Ferradura, em Búzios.',
    sources: ['https://www.google.com/maps/search/Insólito+Boutique+Hotel+Búzios'], checkedAt: '2026-11-17',
  },
  {
    name: 'Hotel Experience João Fernandes', cityId: BZ, category: 'Hospedagem', subcategory: 'Hotéis',
    address: '', neighborhood: 'João Fernandes',
    phone: '',
    description: 'Hotel na região da Praia de João Fernandes, em Búzios.',
    sources: ['https://www.google.com/maps/search/Experience+João+Fernandes+Búzios'], checkedAt: '2026-11-17',
  },
  {
    name: 'Maravista Hotel e Spa', cityId: BZ, category: 'Hospedagem', subcategory: 'Hotéis',
    address: 'Rua Gerbert Périssé, 276, Praia de Geribá, Armação dos Búzios - RJ', neighborhood: 'Geribá',
    phone: '',
    description: 'Hotel com spa na Praia de Geribá, em Búzios. Antes chamado Pousada Maravista.',
    sources: ['https://www.google.com/maps/search/Maravista+Hotel+Búzios'], checkedAt: '2026-11-17',
  },
  {
    name: 'Casas Brancas Boutique Hotel & Spa', cityId: BZ, category: 'Hospedagem', subcategory: 'Hotéis',
    address: '', neighborhood: 'Centro',
    phone: '',
    description: 'Hotel boutique com spa em Búzios.',
    sources: ['https://www.google.com/maps/search/Casas+Brancas+Boutique+Hotel+Búzios'], checkedAt: '2026-11-17',
  },
  {
    name: 'Búzios Beach Resort', cityId: BZ, category: 'Hospedagem', subcategory: 'Hotéis',
    address: 'Rua das Dunas, Praia de Tucuns, s/n, Bosque, Armação dos Búzios - RJ', neighborhood: 'Tucuns',
    phone: '',
    description: 'Resort 4 estrelas na Praia de Tucuns, em Búzios.',
    sources: ['https://www.google.com/maps/search/Búzios+Beach+Resort+Tucuns'], checkedAt: '2026-11-17',
  },

  // ───────── Cabo Frio · pré-cadastro (Google Maps, 2026-11-17). Telefone de 1 fonte; Instagram e horário por dia ficam para completar.
  {
    name: 'Restaurante Picolino', cityId: CF, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'R. Mal. Floriano, 319, São Bento, Cabo Frio - RJ, 28906-330', neighborhood: 'São Bento',
    phone: '(22) 2647-6222',
    description: 'Restaurante de frutos do mar e carnes num casarão histórico, no bairro São Bento, em Cabo Frio.',
    sources: ['https://www.google.com/maps/search/Restaurante+Picolino+Cabo+Frio'], checkedAt: '2026-11-17',
  },
  {
    name: 'Arcos do Canal', cityId: CF, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'R. Constantino Menelau, 76, Passagem, Cabo Frio - RJ, 28906-060', neighborhood: 'Passagem',
    phone: '(22) 98806-4201',
    description: 'Restaurante de culinária italiana com toque brasileiro e frutos do mar, com vista para a lagoa, na Passagem, em Cabo Frio.',
    sources: ['https://www.google.com/maps/search/Arcos+do+Canal+Cabo+Frio'], checkedAt: '2026-11-17',
  },
  {
    name: 'Galápagos', cityId: CF, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Praça Largo de São Benedito, 11, Passagem, Cabo Frio - RJ, 28906-340', neighborhood: 'Passagem',
    phone: '(22) 2643-4097',
    description: 'Restaurante no Largo de São Benedito, na Passagem, em Cabo Frio.',
    sources: ['https://www.google.com/maps/search/Galápagos+Restaurante+Cabo+Frio'], checkedAt: '2026-11-17',
  },
  {
    name: 'Ancho e Faca Churrascaria', cityId: CF, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'R. Pôrto Alegre, 90, Jardim Excelsior, Cabo Frio - RJ, 28915-010', neighborhood: 'Jardim Excelsior',
    phone: '(22) 99852-9195',
    description: 'Churrascaria no Jardim Excelsior, em Cabo Frio, com atendimento no local, para viagem e por entrega.',
    sources: ['https://www.google.com/maps/search/Ancho+e+Faca+Cabo+Frio'], checkedAt: '2026-11-17',
  },
  {
    name: 'Bar e Restaurante Mané Paixão', cityId: CF, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'R. Prof. Domingos Ribeiro, 18, Centro, Cabo Frio - RJ, 28900-000', neighborhood: 'Centro',
    phone: '(22) 99863-3198',
    description: 'Bar e restaurante no Centro de Cabo Frio, com entrega sem contato.',
    sources: ['https://www.google.com/maps/search/Mané+Paixão+Cabo+Frio'], checkedAt: '2026-11-17',
  },
  {
    name: 'Kentô Cozinha Oriental', cityId: CF, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Av. Nossa Sra. da Assunção, 294, Centro, Cabo Frio - RJ, 28906-200', neighborhood: 'Centro',
    phone: '(22) 2645-4305', website: 'https://restaurantekento.com.br',
    description: 'Restaurante de culinária japonesa no Centro de Cabo Frio.',
    sources: ['https://www.google.com/maps/search/Kentô+Cozinha+Oriental+Cabo+Frio', 'https://restaurantekento.com.br'], checkedAt: '2026-11-17',
  },
  {
    name: 'Hotel Solar do Arco', cityId: CF, category: 'Hospedagem', subcategory: 'Hotéis',
    address: 'R. Constantino Menelau, 48, Passagem, Cabo Frio - RJ, 28906-060', neighborhood: 'Passagem',
    phone: '(22) 2645-4527',
    description: 'Hotel 4 estrelas na Passagem, em Cabo Frio, a poucos passos do Canal.',
    sources: ['https://www.google.com/maps/search/Hotel+Solar+do+Arco+Cabo+Frio'], checkedAt: '2026-11-17',
  },
  {
    name: 'Malibu Palace Hotel', cityId: CF, category: 'Hospedagem', subcategory: 'Hotéis',
    address: 'Av. Macário Pinto Lopes, 900, Centro, Cabo Frio - RJ, 28907-250', neighborhood: 'Centro',
    phone: '(22) 2647-8000',
    description: 'Hotel 4 estrelas no Centro de Cabo Frio.',
    sources: ['https://www.google.com/maps/search/Malibu+Palace+Hotel+Cabo+Frio'], checkedAt: '2026-11-17',
  },
  {
    name: 'Pousada Cambucá de Cabo Frio', cityId: CF, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. Florismundo Baptista Machado, 1, Centro, Cabo Frio - RJ, 28907-050', neighborhood: 'Centro',
    phone: '(22) 2645-3984', website: 'https://pousadacambuca.tur.br',
    description: 'Pousada no Centro de Cabo Frio.',
    sources: ['https://www.google.com/maps/search/Pousada+Cambucá+Cabo+Frio', 'https://pousadacambuca.tur.br'], checkedAt: '2026-11-17',
  },
  {
    name: 'Pousada Melodia do Mar', cityId: CF, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Zulmira Mendes, 400, Braga, Cabo Frio - RJ, 28908-105', neighborhood: 'Braga',
    phone: '', website: 'https://pousadamelodiadomar.com',
    description: 'Pousada com café da manhã incluído no bairro Braga, em Cabo Frio.',
    sources: ['https://www.google.com/maps/search/Pousada+Melodia+do+Mar+Cabo+Frio', 'https://pousadamelodiadomar.com'], checkedAt: '2026-11-17',
  },
  {
    name: 'Pousada Cavalo Branco', cityId: CF, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. Mario Quintanilha, 79, Vila Nova, Cabo Frio - RJ, 28907-420', neighborhood: 'Vila Nova',
    phone: '', website: 'https://pousadacavalobranco.com',
    description: 'Pousada na Vila Nova, em Cabo Frio.',
    sources: ['https://www.google.com/maps/search/Pousada+Cavalo+Branco+Cabo+Frio', 'https://pousadacavalobranco.com'], checkedAt: '2026-11-17',
  },

  // ───────── Arraial do Cabo · pré-cadastro (Google Maps, 2026-11-17). Telefone de 1 fonte; Instagram e horário por dia ficam para completar.
  {
    name: 'Pousada Canto da Baleia', cityId: AC, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. Kioto, 30, Vila Canaã, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Vila Canaã',
    phone: '(22) 2622-2843',
    description: 'Pousada com Wi-Fi gratuito na Vila Canaã, em Arraial do Cabo.',
    sources: ['https://www.google.com/maps/search/Pousada+Canto+da+Baleia+Arraial+do+Cabo'], checkedAt: '2026-11-17',
  },
  {
    name: 'Pousada Arraial Caribe', cityId: AC, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. Kioto, 292, Vila Canaã, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Vila Canaã',
    phone: '(22) 99847-9956',
    description: 'Pousada com Wi-Fi gratuito na Vila Canaã, em Arraial do Cabo.',
    sources: ['https://www.google.com/maps/search/Pousada+Arraial+Caribe+Arraial+do+Cabo'], checkedAt: '2026-11-17',
  },
  {
    name: 'Morada do Sol Suítes', cityId: AC, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. Delfim Moreira, 15, Centro, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Centro',
    phone: '(22) 99840-8292',
    description: 'Hospedagem em suítes no Centro de Arraial do Cabo.',
    sources: ['https://www.google.com/maps/search/Morada+do+Sol+Suítes+Arraial+do+Cabo'], checkedAt: '2026-11-17',
  },
  {
    name: 'Brisa dos Anjos Suítes', cityId: AC, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. Benjamin Constant, 98, Centro, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Centro',
    phone: '(22) 99803-9049',
    description: 'Pousada em suítes, com Wi-Fi gratuito, no Centro de Arraial do Cabo.',
    sources: ['https://www.google.com/maps/search/Brisa+dos+Anjos+Suítes+Arraial+do+Cabo'], checkedAt: '2026-11-17',
  },
  {
    name: 'Pousada da Prainha', cityId: AC, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. Pastor Admardo Machado, 90, Prainha, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Prainha',
    phone: '(22) 2622-2512', website: 'https://pousadadaprainha.com',
    description: 'Pousada com café da manhã incluído, na Prainha, em Arraial do Cabo.',
    sources: ['https://www.google.com/maps/search/Pousada+da+Prainha+Arraial+do+Cabo', 'https://pousadadaprainha.com'], checkedAt: '2026-11-17',
  },
  {
    name: 'Ocean View Hotel', cityId: AC, category: 'Hospedagem', subcategory: 'Hotéis',
    address: 'Av. Alfredo Dante Fassini, 01, Prainha, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Prainha',
    phone: '(22) 2622-5205',
    description: 'Hotel 3 estrelas na Prainha, em Arraial do Cabo.',
    sources: ['https://www.google.com/maps/search/Ocean+View+Hotel+Prainha+Arraial+do+Cabo'], checkedAt: '2026-11-17',
  },
  {
    name: 'Pousada Vista Turquesa', cityId: AC, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. de Castro Neto, 19, Praia Grande, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia Grande',
    phone: '(22) 99797-4220', website: 'https://pousadavistaturquesa.com.br',
    description: 'Pousada na Praia Grande, em Arraial do Cabo, com café da manhã incluído.',
    sources: ['https://www.google.com/maps/search/Pousada+Vista+Turquesa+Arraial+do+Cabo', 'https://pousadavistaturquesa.com.br'], checkedAt: '2026-11-17',
  },
  {
    name: 'Pousada Atalaia Boutique', cityId: AC, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Albatroz, 48, Pontal do Atalaia, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Pontal do Atalaia',
    phone: '(22) 99815-9670',
    description: 'Pousada boutique com restaurante no Pontal do Atalaia, em Arraial do Cabo.',
    sources: ['https://www.google.com/maps/search/Pousada+Atalaia+Boutique+Arraial+do+Cabo'], checkedAt: '2026-11-17',
  },
  {
    name: 'Pousada Sentinelas do Mar', cityId: AC, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua de Castro Neto, Pontal do Atalaia, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Pontal do Atalaia',
    phone: '(22) 99993-9162', website: 'https://sentinelasdomar.com.br',
    description: 'Hospedagem com café da manhã incluído no Pontal do Atalaia, em Arraial do Cabo.',
    sources: ['https://www.google.com/maps/search/Pousada+Sentinelas+do+Mar+Arraial+do+Cabo', 'https://sentinelasdomar.com.br'], checkedAt: '2026-11-17',
  },
  {
    name: 'Pousada Caravela', cityId: AC, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. Wenceslau Braz, 98, Praia Grande, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia Grande',
    phone: '(22) 99851-7606',
    description: 'Pousada na Praia Grande, em Arraial do Cabo.',
    sources: ['https://www.google.com/maps/search/Pousada+Caravela+Arraial+do+Cabo'], checkedAt: '2026-11-17',
  },
  {
    name: 'Calamares', cityId: AC, category: 'Gastronomia', subcategory: 'Frutos do Mar',
    address: 'Av. Dr. Hermes Barcelos, Praia Grande, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia Grande',
    phone: '(22) 2622-1286',
    description: 'Restaurante de frutos do mar na Av. Dr. Hermes Barcelos, na Praia Grande, em Arraial do Cabo.',
    sources: ['https://www.google.com/maps/search/Calamares+Restaurante+Arraial+do+Cabo'], checkedAt: '2026-11-17',
  },
  {
    name: 'Anchova na Brasa', cityId: AC, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Rua Beira Mar, 131, Prainha, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Prainha',
    phone: '',
    description: 'Restaurante à beira-mar na Prainha, em Arraial do Cabo.',
    sources: ['https://www.google.com/maps/search/Anchova+na+Brasa+Arraial+do+Cabo'], checkedAt: '2026-11-17',
  },

  // ───────── Araruama, São Pedro da Aldeia e Saquarema · pré-cadastro (Google Maps, 2026-11-17). Telefone de 1 fonte; Instagram e horário por dia ficam para completar.
  {
    name: 'Restaurante Mediterrâneo', cityId: AR, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'R. Gen. Eurico Gaspar Dutra, 1067, Pontinha, Araruama - RJ, 28970-000', neighborhood: 'Pontinha',
    phone: '(22) 2665-1086',
    description: 'Restaurante de cozinha mediterrânea na Pontinha, em Araruama, com entrega.',
    sources: ['https://www.google.com/maps/search/Ristorante+Mediterrâneo+Araruama'], checkedAt: '2026-11-17',
  },
  {
    name: 'La Bodeguita Restaurante e Pizzaria', cityId: AR, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Estr. de Praia Seca, 12555, Praia Seca, Araruama - RJ, 28970-000', neighborhood: 'Praia Seca',
    phone: '(22) 99909-3672',
    description: 'Restaurante e pizzaria em Praia Seca, em Araruama.',
    sources: ['https://www.google.com/maps/search/La+Bodeguita+Praia+Seca+Araruama'], checkedAt: '2026-11-17',
  },
  {
    name: 'Pousada Algodão da Praia', cityId: AR, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. Otávio Carneiro, 55, Praia dos Amores, Araruama - RJ, 28970-000', neighborhood: 'Praia dos Amores',
    phone: '(22) 99788-2024',
    description: 'Pousada na Praia dos Amores, em Araruama.',
    sources: ['https://www.google.com/maps/search/Pousada+Algodão+da+Praia+Araruama'], checkedAt: '2026-11-17',
  },
  {
    name: 'Recanto Suítes', cityId: AR, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. Bonfim, 96, Areal, Araruama - RJ, 28976-114', neighborhood: 'Areal',
    phone: '(22) 98825-1822', website: 'https://recantosuites.com.br',
    description: 'Hospedagem em suítes no bairro Areal, em Araruama.',
    sources: ['https://www.google.com/maps/search/Recanto+Suites+Araruama', 'https://recantosuites.com.br'], checkedAt: '2026-11-17',
  },
  {
    name: 'Toshi Conceito', cityId: SP, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'R. Epaminondas Pereira Nunes, 9, Nova São Pedro, São Pedro da Aldeia - RJ, 28940-000', neighborhood: 'Nova São Pedro',
    phone: '(22) 2621-3560',
    description: 'Restaurante de culinária japonesa em Nova São Pedro, em São Pedro da Aldeia, com entrega.',
    sources: ['https://www.google.com/maps/search/Toshi+Conceito+São+Pedro+da+Aldeia'], checkedAt: '2026-11-17',
  },
  {
    name: 'Pousada Enseada das Garças', cityId: SP, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. José Costa, 1088, Boqueirão, São Pedro da Aldeia - RJ, 28940-210', neighborhood: 'Boqueirão',
    phone: '(22) 2627-0007',
    description: 'Pousada com café da manhã incluído no Boqueirão, em São Pedro da Aldeia.',
    sources: ['https://www.google.com/maps/search/Pousada+Enseada+das+Garças+São+Pedro+da+Aldeia'], checkedAt: '2026-11-17',
  },
  {
    name: 'Pousada Villa Mares', cityId: SP, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. Luiz de Camões, 1, Centro, São Pedro da Aldeia - RJ, 28941-048', neighborhood: 'Centro',
    phone: '(22) 2321-0904',
    description: 'Pousada com café da manhã incluído no Centro de São Pedro da Aldeia.',
    sources: ['https://www.google.com/maps/search/Pousada+Villa+Mares+São+Pedro+da+Aldeia'], checkedAt: '2026-11-17',
  },
  {
    name: 'Hotel Cave do Sol', cityId: SP, category: 'Hospedagem', subcategory: 'Hotéis',
    address: 'Rua José Costa, 1087, Ponta da Areia, São Pedro da Aldeia - RJ, 28940-000', neighborhood: 'Ponta da Areia',
    phone: '(21) 3900-6964', website: 'https://hotelcavedosol.com.br',
    description: 'Hotel com café da manhã incluído na Ponta da Areia, em São Pedro da Aldeia.',
    sources: ['https://www.google.com/maps/search/Hotel+Cave+do+Sol+São+Pedro+da+Aldeia', 'https://hotelcavedosol.com.br'], checkedAt: '2026-11-17',
  },
  {
    name: 'Village Itaúna Inn', cityId: SQ, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. dos Vermelhos, 459, Itaúna, Saquarema - RJ, 28990-882', neighborhood: 'Itaúna',
    phone: '(21) 98297-4015',
    description: 'Hospedagem em Itaúna, em Saquarema.',
    sources: ['https://www.google.com/maps/search/Village+Itaúna+Inn+Saquarema'], checkedAt: '2026-11-17',
  },
  {
    name: 'Pousada Fruto de Itaúna', cityId: SQ, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. dos Mariscos, 511, Segundo Piso, Itaúna, Saquarema - RJ, 28990-844', neighborhood: 'Itaúna',
    phone: '(22) 99755-5401',
    description: 'Pousada em Itaúna, em Saquarema.',
    sources: ['https://www.google.com/maps/search/Pousada+Fruto+do+Mar+Itaúna+Saquarema'], checkedAt: '2026-11-17',
  },
  {
    name: 'Bar do Cajueiro by Bodega Boa', cityId: SQ, category: 'Gastronomia', subcategory: 'Bares e Quiosques',
    address: 'R. Etelvina Henrique Leme, 54, Porto da Roça, Saquarema - RJ, 28990-000', neighborhood: 'Porto da Roça',
    phone: '',
    description: 'Bar no Porto da Roça, em Saquarema, com entrega sem contato.',
    sources: ['https://www.google.com/maps/search/Bar+do+Cajueiro+Saquarema'], checkedAt: '2026-11-17',
  },

  // ───────── 2º lote de pré-cadastro (Google Maps, 2026-11-17): maiores por número de avaliações. Instagram e horário por dia ficam para completar.
  {
    name: 'Restaurante Wellington', cityId: AR, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'R. Bernardo Vasconcelos, 660, Centro, Araruama - RJ, 28979-192', neighborhood: 'Centro',
    phone: '(22) 2664-7924',
    description: 'Restaurante de cozinha brasileira no Centro de Araruama, com entrega.',
    sources: ['https://www.google.com/maps/search/Restaurante+Wellington+Araruama'], checkedAt: '2026-11-17',
  },
  {
    name: 'Belisquê Restaurante e Choperia', cityId: AR, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Praça Antonio Raposo - Av. Brasil, s/n, Centro, Araruama - RJ, 28970-000', neighborhood: 'Centro',
    phone: '(22) 98179-4494', website: 'https://belisque.com.br',
    description: 'Restaurante e choperia na Praça Antonio Raposo, no Centro de Araruama.',
    sources: ['https://www.google.com/maps/search/Belisquê+Restaurante+e+Choperia+Araruama', 'https://belisque.com.br'], checkedAt: '2026-11-17',
  },
  {
    name: 'Restaurante Picanha do Gugu', cityId: AR, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Coqueiral, Araruama - RJ, 28982-335', neighborhood: 'Coqueiral',
    phone: '(22) 2665-4114',
    description: 'Restaurante no Coqueiral, em Araruama, com entrega.',
    sources: ['https://www.google.com/maps/search/Restaurante+Picanha+Do+Gugu+Araruama'], checkedAt: '2026-11-17',
  },
  {
    name: 'Outros500 Bar & Restaurante', cityId: SP, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Av. São Pedro, 10, Centro, São Pedro da Aldeia - RJ, 28941-176', neighborhood: 'Centro',
    phone: '(22) 99202-2723', website: 'https://outros500loungebar.com.br',
    description: 'Bar e restaurante de cozinha brasileira no Centro de São Pedro da Aldeia, com entrega.',
    sources: ['https://www.google.com/maps/search/Outros500+Bar+Restaurante+São+Pedro+da+Aldeia', 'https://outros500loungebar.com.br'], checkedAt: '2026-11-17',
  },
  {
    name: 'Estrela do Mar Saquarema', cityId: SQ, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'R. Barão de Saquarema, 122, Centro, Saquarema - RJ, 28990-772', neighborhood: 'Centro',
    phone: '(22) 99767-6229',
    description: 'Restaurante no Centro de Saquarema.',
    sources: ['https://www.google.com/maps/search/Estrela+do+Mar+Saquarema'], checkedAt: '2026-11-17',
  },
  {
    name: 'Restaurante Saquasuco', cityId: SQ, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Av. Min. Salgado Filho, 178, Centro, Saquarema - RJ, 28990-000', neighborhood: 'Centro',
    phone: '(22) 99286-3851',
    description: 'Restaurante de cozinha brasileira no Centro de Saquarema, com entrega sem contato.',
    sources: ['https://www.google.com/maps/search/Restaurante+Saquasuco+Saquarema'], checkedAt: '2026-11-17',
  },
  {
    name: 'Casa da Praia Itaúna', cityId: SQ, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Av. Oceânica, 1564, Itaúna, Saquarema - RJ, 28990-000', neighborhood: 'Itaúna',
    phone: '(22) 99927-6607',
    description: 'Restaurante com drinques e comidinhas em Itaúna, em Saquarema, com vista para o surfe.',
    sources: ['https://www.google.com/maps/search/Casa+da+Praia+Itaúna+Saquarema'], checkedAt: '2026-11-17',
  },
  {
    name: 'Água na Boca', cityId: IG, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'R. José Fernando Bastos, Parque Tamariz, Iguaba Grande - RJ, 28960-000', neighborhood: 'Parque Tamariz',
    phone: '(22) 2624-1388',
    description: 'Restaurante self-service com churrasco em Iguaba Grande, com entrega sem contato.',
    sources: ['https://www.google.com/maps/search/Água+na+Boca+Self-service+Iguaba+Grande'], checkedAt: '2026-11-17',
  },
  {
    name: 'Casa da Picanha', cityId: IG, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Av. Paulino P. Pinheiro, 5, Centro, Iguaba Grande - RJ, 28960-000', neighborhood: 'Centro',
    phone: '(22) 2624-2037',
    description: 'Restaurante familiar no Centro de Iguaba Grande, com entrega.',
    sources: ['https://www.google.com/maps/search/Casa+da+picanha+Iguaba+Grande'], checkedAt: '2026-11-17',
  },
  {
    name: 'Cliffside Luxury Inn', cityId: BZ, category: 'Hospedagem', subcategory: 'Hotéis',
    address: 'Rua Lydia Gonçalves de Almeida, 28, Praia da Ferradura, Armação dos Búzios - RJ, 28951-049', neighborhood: 'Ferradura',
    phone: '(21) 96663-6701',
    description: 'Hotel 5 estrelas na Praia da Ferradura, em Búzios.',
    sources: ['https://www.google.com/maps/search/Cliffside+Luxury+Inn+Búzios'], checkedAt: '2026-11-17',
  },
  {
    name: 'Pousada Villa Raphael', cityId: BZ, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Beatriz Rosa Sanchez Larragoiti Lucas, 4, 5 e 6, Praia da Ferradura, Armação dos Búzios - RJ, 28951-147', neighborhood: 'Ferradura',
    phone: '(21) 2042-3554', website: 'https://villaraphael.com.br',
    description: 'Pousada na Praia da Ferradura, em Búzios.',
    sources: ['https://www.google.com/maps/search/Villa+Raphael+Hotel+Búzios', 'https://villaraphael.com.br'], checkedAt: '2026-11-17',
  },
  {
    name: 'Pousada Manaaki', cityId: BZ, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Av. Greta Blanck do Rio, 82, Praia Rasa, Armação dos Búzios - RJ, 28955-626', neighborhood: 'Praia Rasa',
    phone: '(22) 99808-7439',
    description: 'Pousada na Praia Rasa, em Búzios.',
    sources: ['https://www.google.com/maps/search/Pousada+Manaaki+Búzios'], checkedAt: '2026-11-17',
  },

  // ───────── Bares de Cabo Frio (Google Maps, 2026-11-17)
  {
    name: 'Tróia Bar Lounge Roof Top', cityId: CF, category: 'Gastronomia', subcategory: 'Bares e Quiosques',
    address: 'Av. Nossa Sra. da Assunção, 721, São Bento, Cabo Frio - RJ, 28906-200', neighborhood: 'São Bento',
    phone: '',
    description: 'Bar lounge rooftop na Av. Nossa Senhora da Assunção, em Cabo Frio.',
    sources: ['https://www.google.com/maps/search/Tróia+Bar+Lounge+Roof+Top+Cabo+Frio'], checkedAt: '2026-11-17',
  },
  {
    name: 'The Duck Rock Pub', cityId: CF, category: 'Gastronomia', subcategory: 'Bares e Quiosques',
    address: 'The Duck Pub, Passagem, Cabo Frio - RJ, 28906-370', neighborhood: 'Passagem', phone: '', website: 'https://instagram.com/theduckrockpub',
    description: 'Pub de temática rock na Passagem, em Cabo Frio.',
    sources: ['https://www.google.com/maps/search/The+Duck+Rock+Pub+Cabo+Frio', 'https://instagram.com/theduckrockpub'], checkedAt: '2026-11-17',
  },
  {
    name: 'Bamba', cityId: CF, category: 'Gastronomia', subcategory: 'Bares e Quiosques',
    address: 'R. Maestro Clodomiro Guimarães Oliveira, 05, Passagem, Cabo Frio - RJ, 28905-165', neighborhood: 'Passagem',
    phone: '(22) 99966-6100', website: 'https://instagram.com/bamba.br',
    description: 'Bar na Passagem, em Cabo Frio.',
    sources: ['https://www.google.com/maps/search/Bamba+bar+Cabo+Frio+Maestro+Clodomiro', 'https://instagram.com/bamba.br'], checkedAt: '2026-11-17',
  },

  // ───────── Bares de Arraial do Cabo (Google Maps, 2026-11-17)
  {
    name: 'Esquina da Onda', cityId: AC, category: 'Gastronomia', subcategory: 'Bares e Quiosques',
    address: 'R. Nilo Peçanha, 39, Praia dos Anjos, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia dos Anjos',
    phone: '(21) 98907-4479',
    description: 'Bar com música ao vivo na Praia dos Anjos, em Arraial do Cabo.',
    sources: ['https://www.google.com/maps/search/Esquina+da+Onda+Arraial+do+Cabo'], checkedAt: '2026-11-17',
  },
  {
    name: 'Lounge da Praia', cityId: AC, category: 'Gastronomia', subcategory: 'Bares e Quiosques',
    address: 'Av. Dr. Hermes Barcelos, 20, Loja 09, Praia Grande, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia Grande',
    phone: '', website: 'https://instagram.com/loungedapraia2',
    description: 'Gastrobar na orla da Praia Grande, em Arraial do Cabo.',
    sources: ['https://www.google.com/maps/search/LOUNGE+DA+PRAIA+Arraial+do+Cabo+Hermes+Barcelos', 'https://instagram.com/loungedapraia2'], checkedAt: '2026-11-17',
  },

  // ───────── 4º lote (Google Maps, 2026-11-17)
  {
    name: 'Iguaba Palace Hotel', cityId: IG, category: 'Hospedagem', subcategory: 'Hotéis',
    address: 'R. Mário Belizário de Souza, Centro, Iguaba Grande - RJ, 28960-000', neighborhood: 'Centro',
    phone: '(22) 2624-2335',
    description: 'Hotel no Centro de Iguaba Grande.',
    sources: ['https://www.google.com/maps/search/iguaba+palace+hotel+Iguaba+Grande'], checkedAt: '2026-11-17',
  },
  {
    name: 'Pousada das Andorinhas', cityId: IG, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. Dr. Wilson, 167, Iguaba Pequena, Iguaba Grande - RJ, 28960-000', neighborhood: 'Iguaba Pequena',
    phone: '(22) 99900-2251', website: 'https://pousadadasandorinhas.com.br/',
    description: 'Pousada em Iguaba Pequena, em Iguaba Grande.',
    sources: ['https://www.google.com/maps/search/Pousada+das+Andorinhas+Iguaba+Grande', 'https://pousadadasandorinhas.com.br/'], checkedAt: '2026-11-17',
  },
  {
    name: 'Restaurante Anexo Praia Búzios', cityId: BZ, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Porto da Barra, Av. José Bento Ribeiro Dantas, 2900, Loja 28, Manguinhos, Armação dos Búzios - RJ, 28953-814', neighborhood: 'Manguinhos',
    phone: '(22) 99708-4990', website: 'http://www.anexopraiabuzios.com.br/',
    description: 'Restaurante no Porto da Barra, em Manguinhos, Búzios.',
    sources: ['https://www.google.com/maps/search/Restaurante+Anexo+Praia+Búzios', 'http://www.anexopraiabuzios.com.br/'], checkedAt: '2026-11-17',
  },
  {
    name: 'Casablanca Búzios', cityId: BZ, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Porto da Barra, Av. José Bento Ribeiro Dantas, 2900, Loja 29, Manguinhos, Armação dos Búzios - RJ, 28953-814', neighborhood: 'Manguinhos',
    phone: '(22) 99853-5593', website: 'http://www.casablancabuzios.com.br/',
    description: 'Restaurante de carnes e vinhos no Porto da Barra, em Manguinhos, Búzios.',
    sources: ['https://www.google.com/maps/search/Casablanca+Búzios+restaurante+Porto+da+Barra', 'http://www.casablancabuzios.com.br/'], checkedAt: '2026-11-17',
  },
  {
    name: 'Pousada Praia João Fernandes', cityId: BZ, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Oito, R. Praia de João Fernandes, 1000, Armação dos Búzios - RJ, 28950-000', neighborhood: 'João Fernandes',
    phone: '(22) 2623-4000', website: 'http://www.praiajoaofernandes.com.br/',
    description: 'Pousada na Praia de João Fernandes, em Búzios.',
    sources: ['https://www.google.com/maps/search/Pousada+Praia+João+Fernandes+Búzios', 'http://www.praiajoaofernandes.com.br/'], checkedAt: '2026-11-17',
  },
  {
    name: 'Pousada Catavento', cityId: SQ, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. dos Tatuís, 82, Itaúna, Saquarema - RJ, 28990-000', neighborhood: 'Itaúna',
    phone: '(22) 99961-4858', website: 'http://www.pousadacataventosaquarema.com.br/',
    description: 'Pousada em Itaúna, em Saquarema.',
    sources: ['https://www.google.com/maps/search/Pousada+Catavento+Saquarema', 'http://www.pousadacataventosaquarema.com.br/'], checkedAt: '2026-11-17',
  },
  {
    name: 'Hotel Aconchego da Vila', cityId: SQ, category: 'Hospedagem', subcategory: 'Hotéis',
    address: 'Av. Min. Salgado Filho, 340, Centro, Saquarema - RJ, 28990-000', neighborhood: 'Centro',
    phone: '(22) 2651-4058',
    description: 'Hotel no Centro de Saquarema.',
    sources: ['https://www.google.com/maps/search/Hotel+Aconchego+Da+Vila+Saquarema'], checkedAt: '2026-11-17',
  },
  {
    name: 'Cantinho do Peixe', cityId: SP, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'R. Teixeira Brandão, 242, Estação, São Pedro da Aldeia - RJ, 28940-000', neighborhood: 'Estação',
    phone: '(22) 2627-4809', website: 'https://m.facebook.com/cantinhodopeixerest/',
    description: 'Restaurante de peixes em São Pedro da Aldeia.',
    sources: ['https://www.google.com/maps/search/Cantinho+do+Peixe+São+Pedro+da+Aldeia', 'https://m.facebook.com/cantinhodopeixerest/'], checkedAt: '2026-11-17',
  },
  {
    name: 'The Bull Restaurant', cityId: SP, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'R. Dr. Antônio Alves, 394, São Pedro da Aldeia - RJ', neighborhood: 'Centro',
    phone: '',
    description: 'Restaurante por quilo em São Pedro da Aldeia.',
    sources: ['https://www.google.com/maps/search/The+Bull+Restaurant+São+Pedro+da+Aldeia'], checkedAt: '2026-11-17',
  },
  {
    name: 'Hotel Pousada Figueiredo', cityId: AR, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. Sílvia Vasconcelos, 77, Centro, Araruama - RJ, 28979-219', neighborhood: 'Centro',
    phone: '(22) 2665-5294', website: 'http://pousadafigueiredo.com.br/',
    description: 'Hotel pousada no Centro de Araruama.',
    sources: ['https://www.google.com/maps/search/Hotel+Pousada+Figueiredo+Araruama', 'http://pousadafigueiredo.com.br/'], checkedAt: '2026-11-17',
  },
  {
    name: 'Hotel Orla de Araruama', cityId: AR, category: 'Hospedagem', subcategory: 'Hotéis',
    address: 'R. Francisco de Andrade, 130, Centro, Araruama - RJ, 28970-000', neighborhood: 'Centro',
    phone: '(22) 2665-1335', website: 'https://www.hotelorladeararuama.com.br/',
    description: 'Hotel no Centro de Araruama.',
    sources: ['https://www.google.com/maps/search/Hotel+Orla+De+Araruama', 'https://www.hotelorladeararuama.com.br/'], checkedAt: '2026-11-17',
  },
];
