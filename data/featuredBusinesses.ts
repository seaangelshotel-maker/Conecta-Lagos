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
  /** Fotos autorizadas pelo dono (só entram com autorização). Endereços das imagens, não cópias. */
  coverImage?: string;
  gallery?: string[];
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
    amenities: ['wifi', 'ac', 'parking', 'breakfast', 'tv'],
    description: 'Pousada na Praia Grande, na entrada do Pontal do Atalaia, pensada para quem quer descansar entre um passeio e outro. O café da manhã está incluído e tem tapioca doce ou salgada feita na hora. As suítes têm ar-condicionado e Smart TV, e algumas contam com hidromassagem privativa na varanda. Wi-Fi gratuito e vaga de estacionamento fazem parte da estadia. O entorno tem padaria, mercado e farmácia por perto, o que facilita a rotina de quem vem passar uns dias. Reservas e dúvidas sobre acomodações são resolvidas pelo WhatsApp da pousada.',
    sources: ['https://pousadaarraialtropical.com.br/', 'https://www.google.com/maps/search/Pousada+Arraial+Tropical'], checkedAt: '2026-11-19',
  },
  {
    name: 'Pousada Arraial Inn', cityId: AC, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Av. da Liberdade, 481, Praia dos Anjos, Arraial do Cabo - RJ', neighborhood: 'Praia dos Anjos',
    phone: '(22) 2622-7666', email: 'contato@dsbrasil.com.br',
    instagram: 'https://www.instagram.com/arraialinn/', website: 'https://www.pousadaarraialinn.com.br',
    amenities: ['wifi', 'ac', 'pool', 'tv'],
    description: 'Pousada na Av. da Liberdade, 481, na Praia dos Anjos, com ar de casa de descanso: jardim verde com piscina e sauna a vapor, sala de estar com espaço para leitura e sala de projeção de filmes e shows. Os quartos são claros e arejados, com cama box (do queen ao super king), ar-condicionado split, frigobar, TV de tela plana com canais por satélite, secador de cabelo, roupa de cama de algodão 200 fios e amenidades de banho; alguns têm varanda ou pequena sacada. Wi-Fi, recepção 24 horas, chá e café à disposição, ferro de passar e aluguel de bicicleta completam os serviços. A pousada não aceita animais. Vende cerveja artesanal no local.',
    sources: ['https://www.pousadaarraialinn.com.br/', 'https://www.pousadaarraialinn.com.br/acomodacoes', 'https://www.pousadaarraialinn.com.br/lazer', 'https://www.pousadaarraialinn.com.br/atividades-do-hotel'], checkedAt: '2026-11-19',
  },
  {
    name: 'Pousada Caminho do Sol', cityId: AC, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Miguel Ângelo, 55, Praia Grande, Arraial do Cabo - RJ', neighborhood: 'Praia Grande',
    phone: '(22) 2622-2029', whatsapp: '(22) 98808-5751', email: 'reservas@caminhodosol.com.br',
    instagram: 'https://www.instagram.com/pousadacaminhodosol/', website: 'https://www.caminhodosol.com.br',
    amenities: ['wifi', 'ac', 'tv'],
    description: 'Pousada no alto de uma pequena colina, a 80 metros da areia da Praia Grande, cercada de jardins e com vista para a cidade e para o mar. As suítes são amplas e combinam ar-condicionado, cofre, secador de cabelo, frigobar, ventilador de teto, Wi-Fi e TV LCD a cabo; a categoria Standard Plus tem camas box com colchão de molas e, em algumas unidades, varanda e sofá-cama, e a Cobertura Master tem 45 m² com varanda. A casa abriga o restaurante Sol na Cozinha, que trabalha um cardápio flutuante e autoral, apoiado no frescor dos frutos do mar de Arraial do Cabo. Boa escolha para quem quer tranquilidade perto da praia, com site também em outros idiomas.',
    sources: ['https://www.caminhodosol.com.br/', 'https://www.google.com/maps/search/Pousada+Caminho+do+Sol+Arraial+do+Cabo'], checkedAt: '2026-11-19',
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
    amenities: ['wifi', 'ac', 'tv', 'breakfast'],
    description: 'Hostel que também funciona como espaço cultural, a duas quadras das praias, de mercados, restaurantes, bares e dos pontos de saída dos passeios de barco. A casa é decorada com obras de arte locais e murais coloridos que contam a história e a diversidade de Arraial do Cabo, e recebe exposições, música ao vivo, leituras de poesia e outras atividades, com abertura para artistas emergentes. Há suítes privativas e quartos compartilhados, com banheiro, ar-condicionado, TV e internet. Os hóspedes contam com cozinha comunitária equipada, café da manhã, assessoria turística, atividades em grupo e áreas de convivência com salas de estar e biblioteca. Ótima opção para viajantes que querem se hospedar entre gente de vários lugares, em clima de troca.',
    sources: ['https://chamoshostelcultural.com/', 'https://www.google.com/maps/search/Chamos+Hostel+Cultural+Arraial+do+Cabo'], checkedAt: '2026-11-19',
  },

  // ───────── Arraial do Cabo · Hamburguerias
  {
    name: "Gabi's Hamburgueria", cityId: AC, category: 'Gastronomia', subcategory: 'Hamburguerias',
    address: 'Rua Nilo Peçanha, 50, Praia dos Anjos, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia dos Anjos',
    phone: '(22) 99757-8113', whatsapp: '(22) 99757-8113',
    hours: allDays('18:55 - 23:50'),
    description: 'Hamburgueria na Praia dos Anjos que batiza os lanches com lugares de Arraial do Cabo. O carro-chefe é o Deck dos Pescadores, um duplo x-bacon com duas carnes smash de 97 gramas, cheddar em dobro e bacon artesanal. Há também o Figueira (x-salada smash com pão de gergelim, cheddar, alface, tomate e maionese da casa), o Graçainha (dois burgers, cheddar duplo, onion rings, cebola caramelizada e bacon) e o Ilha do Farol (três carnes, três cheddars, três bacons e molho barbecue). Para dividir, a Batata Especial vem com creme de cheddar caseiro e bacon picadinho, e a casa monta combos com batata e refrigerante. Abre todos os dias à noite, a partir das 18h55, e recebe pedidos pelo cardápio digital e pelo WhatsApp.',
    sources: ['https://cardapio.ai/online/hamburgueria-gabis'], checkedAt: '2026-11-19',
  },
  {
    name: 'Lorenzzo Burguer', cityId: AC, category: 'Gastronomia', subcategory: 'Hamburguerias',
    address: 'Rua Epitácio Pessoa, 47, Praia Grande, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia Grande',
    phone: '(22) 97401-8385', whatsapp: '(22) 97401-8385',
    instagram: 'https://www.instagram.com/hamburguerialorenzzo',
    amenities: ['delivery', 'kids'],
    description: 'Hamburgueria artesanal na Praia Grande que também serve milk shakes, sorvetes e açaí. O destaque é o hambúrguer de 180 gramas, que sempre leva a maionese da casa: o Double Burguer traz dois discos com cheddar, bacon e cebola caramelizada; o Classic usa queijo prato; o Summer vem no pão australiano com barbecue; e O Vingador ganha anéis de cebola empanados. Há ainda o Casa Nostra, versões simples como X-bacon e, para os pequenos, o Burguer Kids com 120 gramas, queijo e ketchup. A Batata Lorenzzo é servida com cebola empanada e cheddar. O cardápio digital informa entrega gratuita, com previsão de cerca de 20 minutos, além de retirada e consumo no local.',
    sources: ['https://lorenzzo.ola.click/', 'https://lorenzzo.ola.click/products', 'https://lorenzzo.ola.click/info'], checkedAt: '2026-11-19',
  },
  // ───────── Arraial do Cabo · Restaurantes
  {
    name: 'Restobar Dos Anjos', cityId: AC, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Av. Roberto Silveira, 6, Praia dos Anjos, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia dos Anjos',
    phone: '(22) 99767-8838',
    hours: { Domingo: '11:30 - 22:00', Segunda: '11:30 - 19:00', 'Terça': '11:30 - 19:00', Quarta: '11:30 - 19:00', Quinta: '11:30 - 19:00', Sexta: '11:30 - 22:00', 'Sábado': '11:30 - 22:00' },
    description: 'Restobar aconchegante na Praia dos Anjos, em Arraial do Cabo. A proposta é comida caseira feita com carinho, em uma casa que se enquadra entre a cozinha brasileira e a de bar, com serviço de almoço e jantar. Funciona todos os dias a partir das 11h30: fecha às 19h de segunda a quinta e fica aberto até as 22h de sexta a domingo, o que o torna uma boa parada para o almoço depois do mergulho ou do passeio. Ainda tem poucas avaliações públicas, então vale confirmar o dia pelo telefone.',
    sources: ['https://www.tripadvisor.com.br/Restaurant_Review-g1056623-d23693289-Reviews-Restobar_Dos_Anjos-Arraial_do_Cabo_State_of_Rio_de_Janeiro.html'], checkedAt: '2026-11-19',
  },
  // ───────── Arraial do Cabo · Supermercados e Sorveterias/Açaí
  {
    name: 'Princesa Supermercados - Arraial do Cabo III', cityId: AC, category: 'Serviços', subcategory: 'Supermercados',
    address: 'Praça da Bandeira, Arraial do Cabo - RJ',
    phone: '(22) 2622-9500', whatsapp: '(21) 96516-2867',
    website: 'https://www.princesasupermercados.com.br/arraial_cabo_3',
    amenities: ['delivery'],
    description: 'Unidade da rede Princesa Supermercados na Praça da Bandeira, em Arraial do Cabo, com loja online própria. O catálogo cobre carnes e pescados, hortifrúti, padaria e confeitaria, frios e laticínios, mercearia, bebidas, vinhos importados, congelados, orgânicos, produtos de limpeza e higiene, alimentação infantil e até uma seção Mundo Pet, com promoções e encartes atualizados no site. A unidade faz entrega por bairro, incluindo Caiçara, Morro da Coca, Praia dos Anjos, Canaã, Centro e Figueira, com horário de entrega informado de segunda a sábado, das 10h às 18h. O atendimento também é feito pelo telefone (22) 2622-9500 e por um canal de WhatsApp da rede. Útil para quem aluga casa ou apartamento na temporada e quer receber as compras.',
    sources: ['https://www.princesasupermercados.com.br/arraial_cabo_3', 'https://www.princesasupermercados.com.br/arraial_cabo_3/regioes-e-horarios-atendimento'], checkedAt: '2026-11-19',
  },
  {
    name: 'Açaí Forte do Cabo', cityId: AC, category: 'Gastronomia', subcategory: 'Sorveterias e Açaí',
    address: 'Rua Dom Manuel, 119, Macedônia, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Macedônia',
    phone: '(22) 99725-6064', whatsapp: '(22) 99725-6064',
    instagram: 'https://www.instagram.com/acaiforte.docabo',
    description: 'Açaiteria no bairro da Macedônia, em Arraial do Cabo, que vai além do copo. O açaí sai em tamanhos de 300 ml a 1 litro, com leite em pó, paçoca, granulado, chocoball, amendoim, jujuba, cobertura de chocolate, morango e banana entre os acompanhamentos, e ainda existem versões em barca e a roleta de açaí. A promoção do dia costuma juntar dois açaís de 400 ml ou de 1 litro. O cardápio também tem salgadinhos fritos, vendidos por unidade ou em caixas de 50 e 100 com Guaravita, lanches como o X-tudo com batata turbinada, combos e bebidas. Os pedidos são feitos pelo cardápio digital e pelo WhatsApp.',
    sources: ['https://acai-forte-do-cabo.ola.click/products', 'https://acai-forte-do-cabo.ola.click/info'], checkedAt: '2026-11-19',
  },
  // ───────── Cabo Frio · Pousadas e Hotéis
  {
    name: 'Pousada Águas do Forte', cityId: CF, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Ismar Gomes de Azevedo, 19, Praia do Forte, Cabo Frio - RJ', neighborhood: 'Praia do Forte',
    phone: '(22) 2643-4379', email: 'reservas@pousadaaguasdoforte.com.br', website: 'https://www.pousadaaguasdoforte.com.br',
    amenities: ['wifi', 'ac', 'tv', 'breakfast'],
    description: 'Pousada de porte médio, com 30 suítes (casal, duplo e triplo), a poucos metros da Praia do Forte, a mais frequentada da região, e perto do Centro de Cabo Frio. As suítes têm camas box, ar-condicionado, ventilador de teto, frigobar, TV LCD de 32 polegadas a cabo, Wi-Fi e armário embutido; o banheiro usa ducha com aquecimento solar. O café da manhã é servido em área climatizada. Check-in a partir das 14h e check-out até as 12h. Uma boa base para quem quer ir a pé à praia e ao comércio do centro, sem depender de carro. O site tem página de tarifas e tour virtual.',
    sources: ['https://www.pousadaaguasdoforte.com.br/', 'https://www.google.com/maps/search/Pousada+Águas+do+Forte+Cabo+Frio'], checkedAt: '2026-11-19',
  },
  {
    name: 'Pousada Areia do Forte', cityId: CF, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Antônio Feliciano de Almeida, 193, Passagem, Cabo Frio - RJ, 28906-240', neighborhood: 'Passagem',
    phone: '(22) 99953-7145', instagram: 'https://www.instagram.com/pousadaareiadoforte/', website: 'https://pousadaareiadoforte.com.br',
    amenities: ['parking', 'breakfast'],
    description: 'Pousada familiar a 350 metros da Praia do Forte, uma das praias mais belas e movimentadas de Cabo Frio, com 24 suítes modernas e bem equipadas. O site lista quartos casal, standard, triplo, quádruplo e família, o que atende casais, famílias e grupos de amigos. Entre os pontos destacados estão o ótimo custo-benefício, a localização, o estacionamento e o café da manhã, além do atendimento humanizado de ambiente familiar. O site lembra que a cidade tem praias de areia branca e águas cristalinas, atrações culturais como o Forte São Mateus e infraestrutura completa de lazer, gastronomia e comércio. O site oficial garante o melhor preço na reserva direta e tem versão em inglês.',
    sources: ['https://pousadaareiadoforte.com.br/'], checkedAt: '2026-11-19',
  },
  {
    name: 'Pousada Porto Forte', cityId: CF, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Professor Miguel Couto, 192, Centro, Cabo Frio - RJ', neighborhood: 'Centro',
    phone: '(22) 2643-1970', whatsapp: '(22) 99247-9093',
    instagram: 'https://www.instagram.com/pousadaportoforte/',
    description: 'Pousada no Centro de Cabo Frio, na Rua Professor Miguel Couto, em uma região que permite fazer a pé boa parte do roteiro histórico e de compras da cidade: a Praça Tiradentes, o Museu José de Dome, a Casa-Ateliê Scliar, o Mercado de Artesanato da Praia e o Museu do Surf ficam a poucas centenas de metros, e a Praia do Forte e o Canal do Itajuru estão a cerca de 10 minutos de caminhada. É uma hospedagem de categoria três estrelas nos portais de reserva e atende hóspedes que querem ficar perto do movimento do centro e dos restaurantes da orla. O contato é feito por telefone e WhatsApp; o site antigo da pousada está fora do ar, então confirme disponibilidade e serviços direto com a recepção.',
    sources: ['https://www.instagram.com/pousadaportoforte/', 'https://www.kayak.com.br/Hoteis-Porto-Forte-Pousada-Cabo-Frio.365391.ksp'], checkedAt: '2026-11-19',
  },
  {
    name: 'Pousada Brisa do Forte', cityId: CF, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Roberto Nogueira Machado, 20, Praia do Forte, Cabo Frio - RJ', neighborhood: 'Praia do Forte',
    phone: '(22) 2645-0771', whatsapp: '(22) 99277-7929',
    instagram: 'https://www.instagram.com/ondasdoforte_/', website: 'https://pousadabrisadoforte.com.br',
    amenities: ['ac', 'tv', 'wifi'],
    description: 'Pousada familiar na avenida do Contorno, a principal orla de Cabo Frio, a cerca de 100 a 200 metros da Praia do Forte, considerada o principal ponto turístico da cidade. Faz parte do grupo que também administra o Hotel Nova Onda e a Pousada Ondas do Forte. Os apartamentos são duplos (cama de casal, 20 m² e varanda), triplos (casal mais solteiro) e quádruplos, todos com ar-condicionado e ventilador de teto, TV a cabo, frigobar, Wi-Fi e boiler para a ducha. A recepção funciona 24 horas, o que ajuda quem chega tarde ou sai cedo para passeios, e o site oferece pré check-in online e reserva direta.',
    sources: ['https://www.novaondahotel.com.br/pousada-brisa-do-forte', 'https://pousadabrisadoforte.com.br/'], checkedAt: '2026-11-19',
  },
  {
    name: 'Hotel Mar de Cabo Frio', cityId: CF, category: 'Hospedagem', subcategory: 'Hotéis',
    address: 'Rua Zulmira Mendes, 567, Cabo Frio - RJ, 28908-105',
    phone: '(22) 2643-3080', whatsapp: '(22) 99275-0932', email: 'reservas@mardecabofrio.com.br',
    instagram: 'https://www.instagram.com/pousadamardecabofrio', website: 'https://hotelmardecabofrio.com.br',
    amenities: ['ac', 'tv'],
    description: 'Hotel-pousada de ambiente verde, em um terreno de 2.400 m² cercado por dezenas de coqueiros e amendoeiras, perto da Praia do Forte, em Cabo Frio. O site destaca o atendimento acolhedor, em que todos são recebidos com alegria e hospitalidade. As acomodações são Suíte Standard, Suíte Luxo e Suíte Master; a Standard tem 20 m², cama de casal (com possibilidade de bicama de solteiro), capacidade para até 4 hóspedes, ar-condicionado, frigobar, telefone e TV a cabo. A pousada faz parte do roteiro da Costa do Sol e atende reservas pelo site, por telefone e pelo WhatsApp. Fica na Rua Zulmira Mendes, 567.',
    sources: ['https://hotelmardecabofrio.com.br/', 'https://hotelmardecabofrio.com.br/suite-standard/'], checkedAt: '2026-11-19',
  },
  // ───────── Cabo Frio · Restaurantes
  {
    name: 'Passagem Altto Sushi', cityId: CF, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Rua Constantino Menelau, 240, Passagem, Cabo Frio - RJ', neighborhood: 'Passagem',
    phone: '(22) 3031-1146', whatsapp: '(22) 3031-1146',
    hours: allDays('18:00 - 00:00'),
    instagram: 'https://www.instagram.com/alttosushi/', website: 'https://passagemalttosushi.com.br',
    description: 'Cozinha japonesa autêntica na orla da Passagem, em Cabo Frio, no endereço da Casa Kanaloa. A casa trabalha com rodízio japonês completo e com cardápio à la carte, que mistura peças tradicionais e criações exclusivas, e promete frescor em cada peça. O site mostra o cardápio completo e abre reserva de mesa pelo WhatsApp, o que ajuda em noite de movimento. Funciona à noite, das 18h à meia-noite.',
    sources: ['https://passagemalttosushi.com.br/'], checkedAt: '2026-11-19',
  },
  // ───────── Búzios · Pousadas
  {
    name: 'Pousada Pontal da Ferradura', cityId: BZ, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Av. Roberto Improta Saraiva, 1346, Ferradura, Armação dos Búzios - RJ, 28951-294', neighborhood: 'Ferradura',
    phone: '(22) 2623-1177', whatsapp: '(22) 98109-7822', email: 'reservas@pontaldaferradura.com.br',
    instagram: 'https://www.instagram.com/pontaldaferradura/', website: 'https://www.pontaldaferradura.com.br',
    amenities: ['breakfast', 'pool', 'bar', 'kids'],
    description: 'Pousada de arquitetura marcante às margens de uma lagoa, a 150 metros da Praia da Ferradura e a 1,5 km do Centro de Búzios, onde ficam a Orla Bardot e a Rua das Pedras. A estrutura é de resort: café da manhã, spa, hidromassagem aquecida, piscina semi-olímpica, sauna, academia, mesa de jogos, bar de piscina e um espaço kids exclusivo, por isso a casa se apresenta como ideal para famílias com crianças. Também se destaca pelo compromisso com a sustentabilidade, com gerador próprio, energia solar, compostagem e coleta seletiva. O site garante o melhor valor na reserva direta, com parcelamento em até 3 vezes sem juros, e monta pacotes para feriados prolongados. Boa base para passeios marítimos e terrestres, vida noturna e gastronomia da cidade.',
    sources: ['https://www.pontaldaferradura.com.br/'], checkedAt: '2026-11-19',
  },
  {
    name: 'Pousada Luzes de Geribá', cityId: BZ, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Rodrigues de Souza, 24, Canto Esquerdo de Geribá, Armação dos Búzios - RJ', neighborhood: 'Geribá',
    phone: '(22) 98802-3020', email: 'reservas@luzesdegeriba.com.br', instagram: 'https://www.instagram.com/pousadaluzesdegeribaofc/', website: 'https://www.luzesdegeriba.com.br',
    amenities: ['pool', 'breakfast'],
    description: 'Pousada aconchegante no Canto Esquerdo de Geribá, com a praia ao alcance de uma caminhada, para quem quer viver Búzios sem pressa. A casa tem piscina entre palmeiras, deck, jardim tropical florido e varandas com rede, além de quartos confortáveis. O café da manhã é servido todas as manhãs, com frutas, pães, bolos e quitutes caseiros. A equipe se apresenta como conhecedora de cada cantinho da região e costuma indicar os melhores passeios. A Central de Reservas responde pelo WhatsApp e o site oficial permite reserva direta, em português, espanhol e inglês. Fica na Rua Rodrigues de Souza, 24.',
    sources: ['https://www.luzesdegeriba.com.br/'], checkedAt: '2026-11-19',
  },
  {
    name: 'Pousada Mar de Geribá', cityId: BZ, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Caboclo, 14, Geribá, Armação dos Búzios - RJ', neighborhood: 'Geribá',
    phone: '(22) 99869-2314', whatsapp: '(22) 99869-2314', email: 'reservas@mardegeriba.com.br',
    website: 'https://mardegeriba.com.br',
    amenities: ['pool', 'parking', 'ac', 'tv'],
    description: 'Pousada pequena e acolhedora, a poucos passos a pé da Praia de Geribá, que recebe cada hóspede pelo nome e ajuda a montar o roteiro: passeio de barco, praias vizinhas, Rua das Pedras ou uma tarde na piscina. A fachada é branca com janelas azuis, com mezanino iluminado por claraboias e pátio de pedra com piscina de dois ambientes e cascata, uma parte rasa e outra maior e mais funda. Há estacionamento próprio dentro da pousada e recepção 24 horas. Todos os quartos têm ar-condicionado, roupa de cama e banho, banheiro privativo e vaga: o Standard (cama queen, Smart TV e frigobar, alguns com porta direto para o jardim), o Superior (mais amplo, com portas-balcão) e o Premium (pé-direito alto com forro de madeira e ambiente anexo com cama de solteiro). O site tem reserva direta em português, espanhol e inglês.',
    sources: ['https://mardegeriba.com.br/'], checkedAt: '2026-11-19',
  },
  // ───────── Búzios · Restaurantes
  {
    name: 'Xerelete Bar e Restaurante', cityId: BZ, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Orla Bardot, 514, Centro, Armação dos Búzios - RJ', neighborhood: 'Centro',
    phone: '(22) 99845-4052', whatsapp: '(22) 99845-4052',
    hours: { Domingo: '12:00 - 23:00', Segunda: '12:00 - 00:00', 'Terça': '12:00 - 00:00', Quarta: '12:00 - 00:00', Quinta: '12:00 - 00:00', Sexta: '12:00 - 01:00', 'Sábado': '12:00 - 01:00' },
    instagram: 'https://www.instagram.com/xereletebuzios/', website: 'https://xereletebar.com',
    description: 'Casa histórica de 1930 na Orla Bardot, onde quatro amigos apaixonados por Búzios montaram um restaurante de espírito caiçara, simples, autêntico e afetuoso. A aposta é o peixe fresco, pescado pela própria equipe com a técnica ikejime, que preserva textura e sabor, além de pratos na brasa e ingredientes locais. O nome vem do xerelete, peixe costeiro que vive em cardume, ideia de convivência e encontro. Entre os pratos de destaque está o Ceviche do Xerê, com pesca do dia, leche de tigre de ají amarillo, sorbet de manga espada com pimenta dedo-de-moça, coentro e chips de batata-doce. O ambiente é integrado ao mar, em tons de azul e branco, e resgata a Búzios de antigamente. O site tem botão de reserva e anuncia programação de Ano Novo.',
    sources: ['https://xereletebar.com/', 'https://www.instagram.com/xereletebuzios/'], checkedAt: '2026-11-19',
  },
  // ───────── Lote 3 · Pizzarias, Beach Club e Restaurantes
  {
    name: 'Victtorio Pizzaria & Forneria', cityId: BZ, category: 'Gastronomia', subcategory: 'Pizzarias',
    address: 'Orla Bardot, 500 (Av. José Bento Ribeiro Dantas), Búzios - RJ, 28950-000', neighborhood: 'Centro',
    phone: '(22) 2620-0158', whatsapp: '(22) 98809-7552',
    instagram: 'https://www.instagram.com/victtoriopizzariaeforneria/', website: 'https://victtorio.com.br',
    amenities: ['bar', 'delivery'],
    description: 'Pizzaria e forneria de frente para o mar na Orla Bardot, a região mais charmosa de Búzios. As pizzas levam ingredientes diferenciados e a casa ainda tem cardápio de frutos do mar, massas e risotos. Além do salão de requinte, o Victtorio mantém um Bar & Adega: balcão com bartenders que trabalham coquetéis e mixologia, e uma adega com mais de 200 rótulos de vinhos de várias regiões e países, com carta premiada pensada para harmonizar com as pizzas e os pratos. Também faz delivery. Fica na Orla Bardot, 500, perto dos principais passeios a pé de Búzios.',
    sources: ['https://victtorio.com.br/'], checkedAt: '2026-11-19',
  },
  {
    name: 'Beach Club Ville La Plage', cityId: BZ, category: 'Gastronomia', subcategory: 'Beach Clubs',
    address: 'Rua João Fernandes, s/n, Quadra B, Lotes 39-40, Búzios - RJ, 28950-000',
    phone: '(22) 99622-2315', whatsapp: '(22) 99622-2315',
    hours: allDays('09:00 - 18:00'),
    instagram: 'https://www.instagram.com/beachclublaplage', website: 'https://beachclub.villelaplage.com.br',
    amenities: ['pool'],
    description: 'Beach club na Praia de João Fernandes, que se define como um oásis à beira-mar e vende o Day Use como principal experiência. A estrutura reúne piscina aquecida, jacuzzi, spa, serviço de praia e cozinha própria, para quem quer passar o dia inteiro ou só almoçar de frente para o mar. O Day Use inclui uma toalha por pessoa e acesso à piscina, à jacuzzi e a toda a área de lazer; crianças de até 2 anos não pagam. Funciona todos os dias, das 9h às 18h, e a jacuzzi abre das 10h às 18h (uso só para maiores de 18 anos). Atenção: a casa não faz reservas, e o acesso depende da disponibilidade na hora da chegada. O beach club é ligado ao hotel Ville La Plage, na mesma região.',
    sources: ['https://beachclub.villelaplage.com.br/'], checkedAt: '2026-11-19',
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
    description: 'Restaurante do hotel boutique Abracadabra, no Alto do Humaitá, em Búzios, frequentemente citado entre os mais recomendados da cidade e conhecido pelo pôr do sol. Sob o comando do chef Sávio Freitas, a cozinha mantém o foco no mar. O nome evoca mistério, mas, segundo a imprensa gastronômica, a proposta da casa caminha no sentido contrário, de clareza. Fica na Rua Morro do Humaitá, no centro.',
    sources: ['https://www.timeout.com/pt/rio-de-janeiro/noticias/chef-savio-freitas-em-buzios-faz-um-ano-a-frente-do-mistico-mantendo-o-foco-no-mar-030426', 'https://www.queroviajarmais.com/restaurantes-em-buzios/', 'https://www.google.com/maps/search/Místico+Restaurant+Búzios'], checkedAt: '2026-11-19',
  },
  {
    name: 'Restaurante La Gare', cityId: BZ, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Praça Eugênio Honold, 173, Ossos, Armação dos Búzios - RJ, 28950-000', neighborhood: 'Ossos',
    phone: '(22) 2623-5770', website: 'https://viladasanta.com',
    description: 'Restaurante do Hotel Vila da Santa, de frente para a bucólica Praça dos Ossos, que serve uma cozinha mediterrânea tropicalizada em um cenário de pátios e charme de vila de pescadores. A casa abre ao público para café da manhã (das 8h às 10h30), almoço (a partir das 13h) e jantar (das 19h às 22h30). O cardápio à la carte reúne frutos do mar, carnes, risotos e massas, e entre os pratos elogiados por clientes aparece o polvo à Velha Aldeia, com tentáculos grelhados no azeite, purê aromático de batata-doce e molho de tomate da casa com manjericão fresco e açafrão. Por normativa municipal, não é permitida a entrada de animais no restaurante. O hotel fica entre a praça e a Praia dos Ossos, perto do Centro.',
    sources: ['https://www.viladasanta.com/gastronomia', 'https://www.viladasanta.com/'], checkedAt: '2026-11-19',
  },
  {
    name: 'Primitivo Búzios', cityId: BZ, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'R. das Pedras, 60, Centro, Armação dos Búzios - RJ, 28950-800', neighborhood: 'Centro',
    phone: '(22) 2623-9951', website: 'https://primitivobuzios.com.br',
    instagram: 'https://www.instagram.com/primitivo_buzios/',
    hours: { Domingo: '17:00 - 23:30', Segunda: '18:00 - 23:30', 'Terça': '18:00 - 23:30', Quarta: 'Fechado', Quinta: '18:00 - 23:30', Sexta: '18:00 - 23:30', 'Sábado': '17:00 - 23:30' },
    description: 'Restaurante italiano na Rua das Pedras, nascido do provérbio que diz que quem tem pão e vinho vive melhor que o vizinho. A casa trabalha pratos diferenciados, temperos caseiros, massas frescas e uma carta de vinhos para todos os gostos. O cardápio se divide em sugestão do chef, antipasti, gnocchi, massas, carnes, pizzas, sobremesas, bebidas e vinhos, com pratos como o filetto ai tre funghi. A cozinha leva a marca do chef Mauro Vettori, com trajetória em restaurantes da Inglaterra e da Itália, a quem o site presta homenagem. O site exibe o reconhecimento de melhor restaurante italiano do Restaurant Guru 2021. Abre à noite, e não faz reservas online.',
    sources: ['https://primitivobuzios.com.br/', 'https://primitivobuzios.com.br/menu-pt/'], checkedAt: '2026-11-19',
  },
  {
    name: 'Rocka Restaurant & Beach Lounge', cityId: BZ, category: 'Gastronomia', subcategory: 'Beach Clubs',
    address: 'Av. Geribá, quadra CLT10, Geribá, Armação dos Búzios - RJ, 28950-000', neighborhood: 'Geribá',
    phone: '',
    description: 'Restaurante e beach lounge de frente para a Praia Brava, em Búzios, lembrado em guias de viagem como um dos melhores restaurantes de praia da cidade. A cozinha é de frutos do mar e peixes. Fica na Praia Brava, 13, praia mais afastada do centro de Búzios; vale conferir o funcionamento antes de ir.',
    sources: ['https://www.viajenaviagem.com/?p=157452', 'https://www.google.com/maps/search/Rocka+Beach+Lounge+Restaurante+Búzios'], checkedAt: '2026-11-19',
  },
  {
    name: 'Silk Beach Club Búzios', cityId: BZ, category: 'Gastronomia', subcategory: 'Beach Clubs',
    address: 'R. Dezessete, 14, Praia Brava, Armação dos Búzios - RJ, 28950-000', neighborhood: 'Praia Brava',
    phone: '(22) 99972-8191', website: 'https://silkbeachclub.com.br',
    amenities: ['bar'],
    description: 'Beach club no ponto mais exclusivo da Praia Brava, em um espaço de 2.500 m² com três ambientes. O Deck Praia tem decks de madeira, colchões e almofadas com mesa volante para almoço, ombrelones amplos, música e serviço de praia, com vista privilegiada para a Brava. O restaurante serve a culinária buziana, com pratos que resgatam a tradição local e ingredientes selecionados, além de culinária japonesa preparada por chefs especializados. A área de eventos se transforma em pista de festas programadas, eventos corporativos e casamentos, com capacidade para até 1.200 pessoas, cabine de DJ, som, iluminação, globos de espelhos, bar e lounges. O site tem seção de cardápios, venda de ingressos e atendimento para reservas e casamentos.',
    sources: ['https://www.silkbeachclub.com.br/'], checkedAt: '2026-11-19',
  },
  {
    name: 'Tawa Beach', cityId: BZ, category: 'Gastronomia', subcategory: 'Beach Clubs',
    address: 'Praia da Ferradura, R. Ana Horta, s/n, Armação dos Búzios - RJ, 28951-056', neighborhood: 'Ferradura',
    phone: '(22) 99757-5059', website: 'https://tawabeach.com',
    amenities: ['bar'],
    description: 'Beach club na Praia da Ferradura que se inspira na natureza e nas raízes da cultura brasileira, com ambientação assinada pelo arquiteto e artista plástico Hélio Pellegrino. A proposta é unir elegância simples, boa música e sons da natureza em dias de sol. A cozinha é comandada pelo chef Pedro Paulo Machado, com ingredientes brasileiros, técnicas e tendências gastronômicas, pratos, lanches e petiscos, e opções veganas, vegetarianas e sem glúten. Há ainda uma extensa carta de vinhos, drinks com e sem álcool e a equipe ajuda a harmonizar. A programação tem almoço de domingo com prato especial do chef e a noite Sabores de Búzios, em que um convidado escolhe um prato e o oferece ao público junto com uma noite de música. O site tem seção de informações e reservas.',
    sources: ['https://www.tawabeach.com/'], checkedAt: '2026-11-19',
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
    description: 'Boutique hotel de frente para a Praia da Ferradura, em Búzios, que funciona também como galeria: a decoração mistura arte, design e cultura brasileira, com peças de artistas jovens à mostra e à venda e livros de fotografia e literatura pelos ambientes. A área social tem piscina de água doce, piscina de água salgada, sauna seca, sauna a vapor, jacuzzi e ofurô, além de spa com massagens e tratamentos e bicicletas para os hóspedes. Há restaurante no hotel e acesso à praia. O guia Michelin o lista entre as hospedagens de Búzios. Fica na Rua E1, lote 3, na Ferradura, a poucos quilômetros do centro e da Rua das Pedras.',
    sources: ['https://lostworld.com/destinations/brazil/rio-de-janeiro-and-beaches/insolito-boutique-hotel/', 'https://guide.michelin.com/ie/en/hotels-stays/buzios/insolito-boutique-hotel-5495', 'https://www.google.com/maps/search/Insólito+Boutique+Hotel+Búzios'], checkedAt: '2026-11-19',
  },
  {
    name: 'Hotel Experience João Fernandes', cityId: BZ, category: 'Hospedagem', subcategory: 'Hotéis',
    address: '', neighborhood: 'João Fernandes',
    phone: '',
    amenities: ['pool'],
    description: 'Hotel-pousada a cerca de 100 metros da Praia de João Fernandes, com vista para o mar e a estrutura de hotel aliada a um atendimento mais próximo, como a própria casa define. Tem piscina ao ar livre, jardim e sauna; os apartamentos têm ar-condicionado, varanda, TV, frigobar e cofre, e o café da manhã é em buffet. O hotel fica na Rua Um, lotes 24 a 26, a uma caminhada curta da Praia de João Fernandes e a menos de 2 km da Orla Bardot, no centro.',
    sources: ['https://book.omnibees.com/chain/2871/hotel/2093?lang=en-US', 'https://www.frommers.com/destinations/buzios/hotels/hotel-pousada-experience-joo-fernandes', 'https://www.google.com/maps/search/Hotel+Experience+João+Fernandes+Búzios'], checkedAt: '2026-11-19',
  },
  {
    name: 'Maravista Hotel e Spa', cityId: BZ, category: 'Hospedagem', subcategory: 'Hotéis',
    address: 'Rua Gerbert Périssé, 276, Praia de Geribá, Armação dos Búzios - RJ', neighborhood: 'Geribá',
    phone: '',
    description: 'Hotel na Praia de Geribá, com acesso direto à areia e vista panorâmica do mar. A estrutura tem piscina com hidromassagem, bar e restaurante à la carte, além de serviço de praia com cadeiras, guarda-sóis e comes e bebes. O café da manhã é servido das 8h às 10h30, a recepção funciona 24 horas, o check-in é a partir das 14h e o check-out até as 12h. As acomodações incluem categorias Standard, Deluxe com vista para o mar, opções família para três e quatro pessoas e a suíte Master. Fica a cerca de 5 km da Rua das Pedras, no centro de Búzios.',
    sources: ['https://book.omnibees.com/chain/9163/hotel/16806?lang=en-US', 'https://www.google.com/maps/search/Maravista+Hotel+e+Spa+Búzios'], checkedAt: '2026-11-19',
  },
  {
    name: 'Casas Brancas Boutique Hotel & Spa', cityId: BZ, category: 'Hospedagem', subcategory: 'Hotéis',
    address: '', neighborhood: 'Centro',
    phone: '',
    description: 'Uma das pousadas mais tradicionais de Búzios, no Alto do Humaitá, de arquitetura de inspiração mediterrânea em branco e azul, com cerca de três dezenas de quartos aconchegantes distribuídos entre pátios e terraços, todos com vista para a baía da Armação. O guia Michelin a destaca entre as melhores hospedagens da cidade. Tem spa com massagens e tratamentos, jacuzzi com vista para a baía e dois restaurantes: o 74 Restaurant e a 74 Osteria, de cozinha italiana. Fica a uma caminhada curta da Orla Bardot e da Rua das Pedras; o hotel também é conhecido pelo terraço, onde um drink com vista da baía é o programa preferido.',
    sources: ['https://guide.michelin.com/en/hotels-stays/buzios/casas-brancas-boutique-hotel-spa-280', 'https://www.google.com/maps/search/Casas+Brancas+Boutique+Hotel+Búzios'], checkedAt: '2026-11-19',
  },
  {
    name: 'Búzios Beach Resort', cityId: BZ, category: 'Hospedagem', subcategory: 'Hotéis',
    address: 'Rua das Dunas, Praia de Tucuns, s/n, Bosque, Armação dos Búzios - RJ', neighborhood: 'Tucuns',
    phone: '',
    description: 'Resort na Praia de Tucuns, em Búzios, a cerca de 100 metros da praia, uma das mais tranquilas da região. A estrutura reúne apartamentos e bangalôs, entre eles unidades de frente para o mar com deck exclusivo e acesso direto à piscina, além do restaurante Hibiscus. Fica na região de Armação. Para detalhes de categorias e disponibilidade, o contato é com a recepção.',
    sources: ['https://www.melhoresdestinos.com.br/resort-buzios.html', 'https://www.dicasdeviagem.com/resorts-em-buzios/', 'https://www.google.com/maps/search/Búzios+Beach+Resort'], checkedAt: '2026-11-19',
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
    amenities: ['wifi', 'pool', 'breakfast'],
    description: 'Pousada arborizada no Centro de Cabo Frio, a cerca de 200 metros da praia mais visitada da cidade, com piscina e Wi-Fi gratuito para usar à beira da água. Os quartos têm frigobar e cofre pessoal. Além do café da manhã, a hospedagem inclui chá da tarde sem taxa extra, detalhe pouco comum e que a pousada destaca no atendimento. O ambiente é pensado para deixar o hóspede perto da natureza, mesmo no centro. Fica na Rua Florismundo Batista Machado, 1; a recepção atende por telefone e WhatsApp, e o site oferece página de reservas e de acomodações.',
    sources: ['https://pousadacambuca.tur.br/', 'https://www.google.com/maps/search/Pousada+Cambucá+Cabo+Frio'], checkedAt: '2026-11-19',
  },
  {
    name: 'Pousada Melodia do Mar', cityId: CF, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Zulmira Mendes, 400, Braga, Cabo Frio - RJ, 28908-105', neighborhood: 'Braga',
    phone: '', website: 'https://pousadamelodiadomar.com',
    amenities: ['ac', 'tv', 'breakfast'],
    description: 'Pequena pousada administrada por mãe e filha, no bairro Braga, em Cabo Frio, num canto bucólico e tranquilo a três quadras da praia das Dunas, área de preservação com dunas e restinga de mata atlântica. Todas as acomodações têm ar-condicionado, TV, frigobar e banheiro privativo, e há churrasqueira à disposição dos hóspedes e café da manhã. São quatro opções: Suíte Casal, Suíte Tripla (casal mais solteiro), Suíte Individual e o Flat Família, para quatro pessoas, com cozinha, quarto de casal e sala com sofá-cama. Fica a cerca de 11 km de Arraial do Cabo e 25 km de Búzios, boa base para quem quer circular pela região.',
    sources: ['https://pousadamelodiadomar.com/', 'https://pousadamelodiadomar.com/blog/', 'https://www.google.com/maps/search/Pousada+Melodia+do+Mar+Cabo+Frio'], checkedAt: '2026-11-19',
  },
  {
    name: 'Pousada Cavalo Branco', cityId: CF, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. Mario Quintanilha, 79, Vila Nova, Cabo Frio - RJ, 28907-420', neighborhood: 'Vila Nova',
    phone: '', website: 'https://pousadacavalobranco.com',
    amenities: ['wifi', 'parking', 'pool', 'breakfast'],
    description: 'Pousada aconchegante a cerca de 450 metros da Praia do Forte, em Cabo Frio, a poucos minutos a pé da areia, sem precisar de carro. Oferece café da manhã incluso em buffet, com variedade regional servida todos os dias, piscina ao ar livre, Wi-Fi gratuito e estacionamento gratuito e privativo. As acomodações são a Suíte Casal (2 hóspedes), a Suíte Tripla (3), pensada para famílias pequenas, e a Suíte Quádrupla (4). O site permite solicitar reserva direto com a pousada, sem comissão de plataformas, e o contato é feito também por WhatsApp. Boa escolha para quem quer praia a pé com estacionamento garantido.',
    sources: ['https://pousadacavalobranco.com/', 'https://www.google.com/maps/search/Pousada+Cavalo+Branco+Cabo+Frio'], checkedAt: '2026-11-19',
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
    amenities: ['wifi', 'ac', 'parking', 'pool', 'breakfast', 'pet'],
    description: 'Pousada com perfil sustentável, entre os morros do Mirante e do Forno, a 150 metros das águas azuis da Prainha. A casa usa sistema inteligente de consumo de energia, aquecimento solar, captação de água da chuva e tratamento de esgoto, e diz cuidar da cultura local. Tem piscina ao ar livre (de 1,05 m a 1,30 m de profundidade), mesa de bilhar, café da manhã e Wi-Fi gratuitos, ar-condicionado e estacionamento gratuito. Animais de estimação são aceitos mediante pedido, com custo adicional. Atendimento em português, espanhol e inglês. Check-in das 14h às 23h e check-out das 7h às 12h. Fica a cerca de 1 km da rodoviária de Arraial do Cabo.',
    sources: ['https://pousadadaprainha.com/', 'https://pousadadaprainha.com/a-pousada/', 'https://pousadadaprainha.com/suites-e-tarifas/'], checkedAt: '2026-11-19',
  },
  {
    name: 'Ocean View Hotel', cityId: AC, category: 'Hospedagem', subcategory: 'Hotéis',
    address: 'Av. Alfredo Dante Fassini, 01, Prainha, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Prainha',
    phone: '(22) 2622-5205',
    amenities: ['breakfast'],
    description: 'Hotel de frente para a Prainha, em Arraial do Cabo, que une a estrutura de hotel ao jeito caseiro de uma hospedagem familiar, como a própria casa se apresenta. A Prainha é a praia mais indicada da cidade para banho e para passeios em família, e vários apartamentos têm vista para o mar. A hospedagem inclui café da manhã, servido das 7h30 às 10h. Há cinco categorias de apartamento: Standard, Luxo e Master (até 3 pessoas), Luxo Família (até 4) e Família (até 6), o que atende de casais a grupos grandes. Fica na Rua Alfredo Dante Fassini, 1, a cerca de 800 metros do centro de Arraial do Cabo.',
    coverImage: 'https://media.omnibees.com/Images/4468/Property/1200x800/202022.jpg',
    gallery: [
      'https://media.omnibees.com/Images/4468/Property/1024x768/983199.jpg',
      'https://media.omnibees.com/Images/4468/Property/1024x768/78609.jpg',
      'https://media.omnibees.com/Images/4468/Property/1024x768/983198.jpg',
      'https://media.omnibees.com/Images/4468/Property/1024x768/983195.jpg',
      'https://media.omnibees.com/Images/4468/RoomTypes/1024x768/5766426.jpg',
      'https://media.omnibees.com/Images/4468/RoomTypes/1024x768/202069.jpg',
      'https://media.omnibees.com/Images/4468/RoomTypes/1024x768/578930.jpg',
      'https://media.omnibees.com/Images/4468/RoomTypes/1024x768/983209.jpg',
    ],
    sources: ['https://book.omnibees.com/chain/2610/hotel/4468?lang=en-US', 'https://www.google.com/maps/search/Ocean+View+Hotel+Prainha+Arraial+do+Cabo'], checkedAt: '2026-11-19',
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
    amenities: ['ac', 'tv', 'pool', 'breakfast'],
    description: 'Pousada de 15 acomodações no Pontal do Atalaia, cujo nome homenageia os vigias que, das pedras, avisavam os pescadores sobre os cardumes. A marca da casa é a piscina de borda infinita com vista para o mar. Os quartos têm frigobar, ar-condicionado e TV; as categorias VIP trazem banheira de hidromassagem com vista para o mar (a VIP 3 também com varanda) e as Master têm vista para o mar, algumas com varanda. A diária inclui café da manhã em buffet, servido das 7h30 às 10h. A estrutura também recebe casamentos e celebrações. O site, em português e inglês, tem reserva online. Fica na Rua José de Castro Neto, lote S6.',
    coverImage: 'https://static.wixstatic.com/media/9f7454_635ecb1d93ea4a20afcfeec1193b45f4~mv2.png/v1/fill/w_1200,h_700,al_c,q_80/foto.jpg',
    gallery: [
      'https://static.wixstatic.com/media/9f7454_09c1c90503fb4baeaf84bc3416b30670~mv2.png/v1/fill/w_1000,h_750,al_c,q_80/foto.jpg',
      'https://static.wixstatic.com/media/9f7454_d824e6f9cb354c61ac57b366791b2980~mv2.png/v1/fill/w_1000,h_750,al_c,q_80/foto.jpg',
      'https://static.wixstatic.com/media/9f7454_125e93a435464a468300f96cfa7aa9ebf002.jpg/v1/fill/w_1000,h_750,al_c,q_80/foto.jpg',
    ],
    sources: ['https://www.sentinelasdomar.com.br/', 'https://www.sentinelasdomar.com.br/pousada', 'https://www.google.com/maps/search/Pousada+Sentinelas+do+Mar+Arraial+do+Cabo'], checkedAt: '2026-11-19',
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
    amenities: ['breakfast'],
    description: 'Hotel de ambiente tranquilo e charmoso na Ponta da Areia, em São Pedro da Aldeia, que se apresenta como a casa do hóspede à beira do Lago de Araruama. O site promete uma manhã com vista deslumbrante, café da manhã acolhedor e suítes preparadas para o descanso, em uma região da Região dos Lagos mais calma que os polos de praia. A página oficial tem galeria de fotos, seção Descubra com dicas do entorno, reservas por data com escolha de quartos, adultos e crianças, e versões em português, inglês e espanhol. O atendimento é por telefone, WhatsApp, Instagram e Facebook, na Rua José Costa, 1087.',
    sources: ['https://hotelcavedosol.com.br/'], checkedAt: '2026-11-19',
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
    amenities: ['kids', 'delivery', 'bar'],
    description: 'Restaurante e choperia na Praça Antonio Raposo, em Araruama, com a grelha como assinatura: picanha, filé mignon, contra-filé, carré de cordeiro e o cupim confitado, marinado por 12 horas em tempero da casa com base de vinho e finalizado com molho especial. O cardápio também tem entradas para compartilhar, saladas, burgers (a partir das 16h, com fritas), cafeteria, sobremesas e menu infantil para crianças até 14 anos. O chope é Brahma e Heineken servido em caneca zero grau, ao lado de carta de drinks e vinhos, e há happy hour de terça a domingo, das 17h às 20h. De terça a sexta há pratos executivos no almoço. Aceita reservas e faz delivery pelo site.',
    sources: ['https://www.belisque.com.br/', 'https://www.google.com/maps/search/Belisquê+Restaurante+Araruama'], checkedAt: '2026-11-19',
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
    phone: '(22) 99202-2723',
    description: 'Bar e restaurante de cozinha brasileira no Centro de São Pedro da Aldeia, com entrega.',
    sources: ['https://www.google.com/maps/search/Outros500+Bar+Restaurante+São+Pedro+da+Aldeia'], checkedAt: '2026-11-19',
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
    description: 'Hotel pé na areia na Praia da Ferradura, que mistura arquitetura colonial, jardins entre coqueiros e o privilégio de estar diante do mar. O site fala em tranquilidade, requinte e serviço personalizado, com atmosfera de privacidade e exclusividade, e indica o lugar para quem valoriza beleza e momentos a dois. Além das acomodações, a estrutura oferece spa com massagens e tratamentos, quadra de beach tennis, academia para não perder a rotina de exercícios e restaurante próprio com menu pensado para os hóspedes. O site permite reservar com cupom, em português, inglês e espanhol, e fica na Rua Beatriz Rosa Sanchez Larragoiti Lucas, na Ferradura.',
    sources: ['https://villaraphael.com.br/'], checkedAt: '2026-11-19',
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
    phone: '(22) 99900-2251',
    description: 'Pousada em Iguaba Pequena, em Iguaba Grande.',
    sources: ['https://www.google.com/maps/search/Pousada+das+Andorinhas+Iguaba+Grande'], checkedAt: '2026-11-17',
  },
  {
    name: 'Restaurante Anexo Praia Búzios', cityId: BZ, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Porto da Barra, Av. José Bento Ribeiro Dantas, 2900, Loja 28, Manguinhos, Armação dos Búzios - RJ, 28953-814', neighborhood: 'Manguinhos',
    phone: '(22) 99708-4990', website: 'http://www.anexopraiabuzios.com.br/',
    hours: { Domingo: '12:00 - 21:00', Segunda: '12:00 - 22:30', 'Terça': 'Fechado', Quarta: '12:00 - 22:30', Quinta: '12:00 - 22:30', Sexta: '12:00 - 23:00', 'Sábado': '12:00 - 23:00' },
    description: 'Gastrobar inaugurado em 2009 em Manguinhos, no Porto da Barra, com vista para o pôr do sol mais charmoso de Búzios. A mobília rústica em estilo indonésio, com bancos estofados e mesas baixas, cria um clima sofisticado e despojado, e a trilha sonora é pensada só para o bar, com releituras modernas de deep house, reggae e pop; ao entardecer, uma trilha especial marca o pôr do sol. O cardápio é repleto de frutos do mar, mas também tem carne vermelha e opções vegetarianas, e o destaque são os risotos, em especial o de funghi com tiras de mignon, parmesão e brie. A carta inclui espumantes, champagnes, vinhos e drinks com frutas da estação. É lugar de celebrações, happy hours e encontros. Fecha às terças.',
    sources: ['https://anexopraiabuzios.com.br/'], checkedAt: '2026-11-19',
  },
  {
    name: 'Casablanca Búzios', cityId: BZ, category: 'Gastronomia', subcategory: 'Restaurantes',
    address: 'Porto da Barra, Av. José Bento Ribeiro Dantas, 2900, Loja 29, Manguinhos, Armação dos Búzios - RJ, 28953-814', neighborhood: 'Manguinhos',
    phone: '(22) 99853-5593', website: 'http://www.casablancabuzios.com.br/',
    hours: { Domingo: '12:00 - 19:00', Segunda: '12:00 - 23:00', 'Terça': '12:00 - 23:00', Quarta: 'Fechado', Quinta: '12:00 - 23:00', Sexta: '12:00 - 23:00', 'Sábado': '12:00 - 23:00' },
    description: 'Restaurante de ambiente intimista e estiloso no Porto da Barra, em Manguinhos, com decoração inspirada no clássico filme Casablanca e vista para o que o site chama de melhor pôr do sol de Búzios. A proposta é unir simplicidade e charme ao cenário bucólico da praia de Manguinhos, com culinária contemporânea de ingredientes frescos e drinks clássicos e autorais. É indicado para jantar romântico, celebração ou encontro entre amigos, e entre os pratos citados por clientes aparece o pastel de camarão de entrada. O restaurante integra o Grupo BZ, o mesmo do Anexo Praia, no mesmo conjunto de lojas. Funciona de segunda a sábado, das 12h às 23h, e aos domingos das 12h às 19h, exceto às quartas-feiras. Reservas pelo WhatsApp.',
    sources: ['https://casablancabuzios.com.br/'], checkedAt: '2026-11-19',
  },
  {
    name: 'Pousada Praia João Fernandes', cityId: BZ, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'Rua Oito, R. Praia de João Fernandes, 1000, Armação dos Búzios - RJ, 28950-000', neighborhood: 'João Fernandes',
    phone: '(22) 2623-4000', website: 'http://www.praiajoaofernandes.com.br/',
    amenities: ['pool', 'breakfast', 'ac', 'tv', 'wifi'],
    description: 'Pousada a cerca de um minuto a pé das praias de João Fernandes e João Fernandinho, com dois terraços de vista e clima de relaxamento, indicada pelo site também para lua de mel e casamento. A estrutura tem duas piscinas ao ar livre, restaurante, espaço gourmet, banheira de hidromassagem, lounge compartilhado, recepção 24 horas e Wi-Fi gratuito na área da recepção. Todos os quartos têm TV de tela plana com sinal via satélite, ar-condicionado, secador de cabelo e frigobar, e o café da manhã diário já está incluso na diária. As categorias são Quádruplo Standard, Mata Atlântica, Standard Family, Luxo Family e Master Family. A casa monta ofertas de Réveillon, Carnaval e do Festival Gastronômico de Búzios.',
    sources: ['https://www.praiajoaofernandes.com.br/'], checkedAt: '2026-11-19',
  },
  {
    name: 'Pousada Catavento', cityId: SQ, category: 'Hospedagem', subcategory: 'Pousadas',
    address: 'R. dos Tatuís, 82, Itaúna, Saquarema - RJ, 28990-000', neighborhood: 'Itaúna',
    phone: '(22) 99961-4858', website: 'http://www.pousadacataventosaquarema.com.br/',
    amenities: ['wifi', 'ac', 'tv', 'pool', 'parking', 'breakfast', 'bar', 'kids'],
    description: 'Pousada de Saquarema que aposta num ambiente caseiro e familiar: o lema da casa é que os hóspedes queiram voltar. Todas as suítes têm ar-condicionado, ventilador de teto, TV e frigobar. A estrutura reúne piscina, bar, sala de estar, salão de jogos, parquinho infantil, copa bebê, café da manhã, Wi-Fi gratuito em toda a pousada e estacionamento, o que a torna prática para famílias com crianças pequenas. O site também divulga pacotes de Réveillon e Carnaval, tem página de eventos e um guia dos atrativos da cidade, como a Praia de Itaúna, a Lagoa de Saquarema e o centro de vôlei da CBV.',
    sources: ['https://www.pousadacataventosaquarema.com.br/', 'https://www.google.com/maps/search/Pousada+Catavento+Saquarema'], checkedAt: '2026-11-19',
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
    phone: '(22) 2665-5294', website: 'https://pousadafigueiredo.com/',
    description: 'Pousada no Centro de Araruama, na região das lagoas e das praias, com duas categorias de suíte. A Standard é a opção simples e funcional: ventilador, banheiro privativo e cama confortável, em configurações para uma, duas ou três pessoas. A Executiva traz ar-condicionado, frigobar e banheiro privativo, com variações para até quatro pessoas, e atende melhor casais, famílias e pequenos grupos. A reserva pode ser feita pelo site da própria pousada. Fica na R. Sílvia Vasconcelos, 77, boa base para quem visita Araruama a trabalho ou a passeio e quer hospedagem de bom custo-benefício.',
    sources: ['https://pousadafigueiredo.com/', 'https://www.google.com/maps/search/Hotel+Pousada+Figueiredo+Araruama'], checkedAt: '2026-11-19',
  },
  {
    name: 'Hotel Orla de Araruama', cityId: AR, category: 'Hospedagem', subcategory: 'Hotéis',
    address: 'R. Francisco de Andrade, 130, Centro, Araruama - RJ, 28970-000', neighborhood: 'Centro',
    phone: '(22) 2665-1335', website: 'https://www.hotelorladeararuama.com.br/',
    amenities: ['wifi', 'ac', 'pool', 'breakfast'],
    description: 'Hotel de frente para a laguna de Araruama, no Centro, com varanda de vista para a água. Os quartos são descritos pelo próprio hotel como espaçosos, confortáveis e seguros, todos climatizados, e a hospedagem inclui café da manhã. Wi-Fi gratuito e piscina ao ar livre completam as comodidades. O entorno concentra restaurantes, bares, lojas e quiosques, com shoppings e comércio por perto, e o acesso a transporte para outras cidades da Região dos Lagos é fácil. Fica na R. Francisco de Andrade, 130, e funciona bem para quem quer se hospedar a pé de tudo no centro de Araruama.',
    sources: ['https://www.hotelorladeararuama.com.br/', 'https://www.google.com/maps/search/Hotel+Orla+De+Araruama'], checkedAt: '2026-11-19',
  },
];
