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
];
