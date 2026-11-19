/**
 * Prévias PRIVADAS para mostrar a ficha completa ao dono da empresa antes de ele autorizar fotos.
 * Aberta só por link com chave (/previa/<id>?k=<chave>), fora do Google, sem aparecer no guia.
 * As imagens são exibidas direto do site oficial da própria empresa (não são copiadas nem guardadas aqui).
 * Quando o dono autorizar/enviar as fotos, o link é apagado daqui.
 */
import type { BusinessProfile } from '../types';

export interface PrivatePreview {
  key: string;
  coverImage?: string;
  gallery?: string[];
  source: string;
  /**
   * Correções/complementos de INFORMAÇÃO mostrados só na prévia (a ficha oficial não muda até o dono aprovar).
   * Cada campo só entra com fonte conferida (site oficial, Instagram, Booking...). Ver docs/CADASTRO_PADRAO.md.
   */
  info?: Partial<Pick<BusinessProfile, 'description' | 'address' | 'phone' | 'whatsapp' | 'instagram' | 'website' | 'openingHours' | 'amenities' | 'bookingUrl' | 'deliveryUrl'>>;
}

export const PRIVATE_PREVIEWS: Record<string, PrivatePreview> = {
  // Sentinelas do Mar e Ocean View autorizaram as fotos e já estão públicos (19/11/2026)
  // Água na Boca
  'emp_iguaba_grande_agua-na-boca': { key: 'c92dfdf5c0', source: "sem foto (aguardando envio do dono)" },
  // Açaí Forte do Cabo
  'emp_arraial_do_cabo_acai-forte-do-cabo': { key: 'f0f83ab67c', source: "sem foto (aguardando envio do dono)" },
  // Pousada Algodão da Praia
  'emp_araruama_pousada-algodao-da-praia': { key: '2c23a360f5', coverImage: "https://pousadaalgodaodapraia.com.br/wp-content/uploads/2023/01/DJI_0253-1.jpg",
    gallery: [
      "https://pousadaalgodaodapraia.com.br/wp-content/uploads/2022/10/RB102288.jpg",
      "https://pousadaalgodaodapraia.com.br/wp-content/uploads/2022/10/RB108868.jpg",
      "https://pousadaalgodaodapraia.com.br/wp-content/uploads/2021/09/home_suite_dupla.png",
      "https://pousadaalgodaodapraia.com.br/wp-content/uploads/2022/03/WhatsApp-Image-2022-03-15-at-16.22.24.jpeg",
      "https://pousadaalgodaodapraia.com.br/wp-content/uploads/2021/10/play03.png",
    ],
    info: {"description": "Pousada de vista panorâmica para a Lagoa de Araruama, na Praia dos Amores, com atendimento personalizado e clima acolhedor. Os ambientes têm decoração rústica-elegante integrada à natureza e são cercados por jardins. Além dos quartos, há o restaurante Flor da Lagoa, piscina com churrasqueira, estacionamento privativo, café da manhã e sala para reuniões e eventos.", "amenities": ["pool", "parking", "breakfast"]},
    source: "https://pousadaalgodaodapraia.com.br" },
  // Ancho e Faca Churrascaria
  'emp_cabo_frio_ancho-e-faca-churrascaria': { key: '0bc95c77ed', source: "sem foto (aguardando envio do dono)" },
  // Anchova na Brasa
  'emp_arraial_do_cabo_anchova-na-brasa': { key: 'a90e18a7d9', source: "sem foto (aguardando envio do dono)" },
  // Apreciatta Pizzaria
  'emp_cabo_frio_apreciatta-pizzaria': { key: 'b40d628eda', info: {"description": "Pizzaria com unidades em Cabo Frio e São Pedro da Aldeia, que construiu um público fiel nas redes e trabalha com salão, mesas externas e entrega à noite. A unidade de Cabo Frio fica na Avenida Júlia Kubitschek, no Centro, e não aceita reservas. O cardápio completo está disponível no link da bio do Instagram oficial, @apreciattabr.", "amenities": ["delivery"], "address": "Av. Júlia Kubitschek, 26 - Centro, Cabo Frio - RJ, 28905-000", "phone": "(22) 2648-1178", "instagram": "https://www.instagram.com/apreciattabr"},
    source: "sem foto (aguardando envio do dono)" },
  // Arcos do Canal
  'emp_cabo_frio_arcos-do-canal': { key: 'bf5974b9a5', coverImage: "https://arcosdocanal.com.br/wp-content/uploads/2026/03/arcos_do_canal-1.webp",
    gallery: [
      "https://arcosdocanal.com.br/wp-content/uploads/2026/03/Polvo.webp",
      "https://arcosdocanal.com.br/wp-content/uploads/2026/03/camarao.webp",
      "https://arcosdocanal.com.br/wp-content/uploads/2026/03/peixa_da_ilha_fil_de_namorado.webp",
      "https://arcosdocanal.com.br/wp-content/uploads/2026/03/frame_82.webp",
      "https://arcosdocanal.com.br/wp-content/uploads/2026/03/drrinks.webp",
      "https://arcosdocanal.com.br/wp-content/uploads/2026/03/petit_gateau_artesanal.webp",
    ],
    info: {"description": "Restaurante de gastronomia contemporânea no ponto alto da Passagem, o bairro histórico de Cabo Frio, com vista do canal e pôr do sol como cenário. A cozinha parte do frescor do mar e de ingredientes locais, com pratos como polvo, camarão e peixe do dia (filé de namorado), além de drinks e sobremesas como o petit gâteau artesanal. Abre todos os dias, do almoço até a meia-noite, na Rua Constantino Menelau, a poucos passos do Canal do Itajuru.", "amenities": [], "address": "Rua Constantino Menelau, 240 - Passagem, Cabo Frio - RJ", "whatsapp": "(22) 99792-4417", "openingHours": {"Domingo": "12:00 - 00:00", "Segunda": "12:00 - 00:00", "Terça": "12:00 - 00:00", "Quarta": "12:00 - 00:00", "Quinta": "12:00 - 00:00", "Sexta": "12:00 - 00:00", "Sábado": "12:00 - 00:00"}},
    source: "https://arcosdocanal.com.br" },
  // Pousada Arraial Caribe
  'emp_arraial_do_cabo_pousada-arraial-caribe': { key: 'f77e71154c', coverImage: "https://www.pousadaarraialcaribe.com.br/wp-content/uploads/2022/12/frente-AC.jpg",
    gallery: [
      "https://www.pousadaarraialcaribe.com.br/wp-content/uploads/2022/12/image4.jpg",
      "https://www.pousadaarraialcaribe.com.br/wp-content/uploads/2022/12/fundo.jpg",
      "https://www.pousadaarraialcaribe.com.br/wp-content/uploads/2022/12/cafe.jpg",
      "https://www.pousadaarraialcaribe.com.br/wp-content/uploads/2022/12/area-externa-AC.jpg",
    ],
    info: {"description": "Pousada no canto da Baleia, na ponta direita da Praia dos Anjos, em frente à Marinha do Brasil, numa área segura e tranquila a poucos minutos do Centro Histórico e do ponto de saída dos passeios de barco. Tem ambiente familiar e Wi-Fi gratuito em toda a propriedade. O café da manhã é buffet diário, com frutas da estação, pães, frios, cereais, sucos, tapioca, ovos e misto quente. A rodoviária fica a cerca de 15 minutos a pé.", "amenities": ["wifi", "breakfast"], "address": "Praia dos Anjos (Canto da Baleia), Arraial do Cabo - RJ"},
    source: "https://www.pousadaarraialcaribe.com.br" },
  // Astral Beach Food
  'emp_arraial_do_cabo_astral-beach-food': { key: '5eb7fb159f', info: {"description": "Cozinha de praia com cara de alimento para a alma salgada: poke, sushi grande, burritos e hambúrgueres, com opções veganas no cardápio. Em Arraial do Cabo, funciona em loja e também por delivery e retirada, com pedidos pelo site e pelo WhatsApp.", "amenities": ["delivery"], "instagram": "https://www.instagram.com/astralbeach.food", "website": "https://astralbeach.com.br"},
    source: "sem foto (aguardando envio do dono)" },
  // Bamba
  'emp_cabo_frio_bamba': { key: 'aab15f2916', source: "sem foto (aguardando envio do dono)" },
  // Bar do Cajueiro by Bodega Boa
  'emp_saquarema_bar-do-cajueiro-by-bodega-boa': { key: '06248a3581', source: "sem foto (aguardando envio do dono)" },
  // Bar e Restaurante Mané Paixão
  'emp_cabo_frio_bar-e-restaurante-mane-paixao': { key: '8e1e1ee10c', info: {"description": "Boteco clássico do Largo de São Benedito, na Passagem, em Cabo Frio, lembrado nos guias de viagem pela comida de botequim bem-feita e pelos escondidinhos servidos na telha. Ponto tradicional da região, bom para um almoço sem cerimônia ou um petisco no fim da tarde, perto das ruas de paralelepípedo do bairro.", "amenities": [], "address": "Largo de São Benedito - Passagem, Cabo Frio - RJ"},
    source: "sem foto (aguardando envio do dono)" },
  // Brisa dos Anjos Suítes
  'emp_arraial_do_cabo_brisa-dos-anjos-suites': { key: 'd0ca6ec5f0', info: {"description": "Suítes na Rua Benjamin Constant, no centro de Arraial do Cabo, a poucos minutos a pé da Praia dos Anjos, do estádio e do comércio local. Os quartos têm ar-condicionado e banheiro privativo, e a casa é conhecida entre os hóspedes pelo atendimento próximo do proprietário e pelo café da manhã simples e caprichado. Boa opção para quem quer conforto sem pagar por estrutura de resort.", "amenities": [], "address": "Rua Benjamin Constant, 98 - Centro, Arraial do Cabo - RJ, 28930-000", "whatsapp": "(22) 99803-9049"},
    source: "sem foto (aguardando envio do dono)" },
  // Búzios Beach Resort
  'emp_buzios_buzios-beach-resort': { key: 'fcd77cde72', coverImage: "https://wamhoteis.com.br/wp-content/uploads/2025/08/EmdpHLRQ.webp",
    gallery: [
      "https://wamhoteis.com.br/wp-content/uploads/2025/07/916573.webp",
      "https://wamhoteis.com.br/wp-content/uploads/2025/07/DSC03664-scaled.jpg",
      "https://wamhoteis.com.br/wp-content/uploads/2025/08/Centro-de-Convencoes-Auditorio-scaled.webp",
      "https://wamhoteis.com.br/wp-content/uploads/2025/07/DSC03730-scaled.jpg",
    ],
    info: {"description": "Resort de frente para a Praia de Tucuns, de ondas calmas, inaugurado em 2010 com 379 apartamentos distribuídos em vilas. A estrutura inclui duas piscinas, quatro bares, restaurante principal, o italiano Mamma Mia, sala de jogos, academia, quadras de areia e poliesportiva, mini golfe e boliche. É um resort pensado para ficar o dia inteiro no hotel, com alimentação e lazer no mesmo lugar, a cerca de 15 minutos de carro da Rua das Pedras.", "amenities": ["pool", "bar"], "address": "Av. dos Tucuns (Rua das Dunas), s/n - Praia de Tucuns, Búzios - RJ, 28950-000"},
    source: "https://wamhoteis.com.br/buzios-beach-resort/" },
  // Calamares
  'emp_arraial_do_cabo_calamares': { key: '31d1d1eae2', info: {"description": "Beach club e restaurante de frente para a Praia Grande, em Arraial do Cabo, conhecido pelo pôr do sol e pelo ambiente animado, com música ao vivo, petiscos, drinks e cardápio de frutos do mar. Funciona com mesas e espreguiçadeiras na areia, ideal para ficar o fim de tarde inteiro. Fica na Avenida Litorânea.", "amenities": [], "address": "Avenida Litorânea - Praia Grande, Arraial do Cabo - RJ"},
    source: "sem foto (aguardando envio do dono)" },
  // Pousada Caminho do Sol
  '8mbOtad5nxVNMThEZdu1': { key: 'f8d8bef581', coverImage: "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/59ed3641f55345a7898acfb3fd36bea5.jpg",
    gallery: [
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/bba8c051b8c9473aa21cec45bc6126f8.jpeg",
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/398cb58eb5d543f1a4435ffd5b4b4e4b.jpeg",
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/990df270ae6a41f8827d74a168a78012.jpg",
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/af836564b63e4e0cbe99cfd0f2964d97.jpeg",
    ],
    info: {"description": "Pousada no alto de uma pequena colina, a 80 metros da Praia Grande, em Arraial do Cabo, com jardins, vista da cidade e do mar e suítes que combinam conforto e bom gosto. As acomodações vão da Suíte Standard Plus às coberturas Master de 45 m², com varanda, ar-condicionado, frigobar, cofre, Wi-Fi e TV a cabo. A casa tem restaurante próprio, o Sol na Cozinha, com cardápio que muda e aposta nos frutos do mar da região. Fica a cerca de duas horas da capital fluminense, perto das praias e dunas que fazem de Arraial um dos cenários mais bonitos da Região dos Lagos.", "amenities": ["ac", "wifi", "tv"]},
    source: "https://www.caminhodosol.com.br" },
  // Cantinho do Peixe
  'emp_sao_pedro_da_aldeia_cantinho-do-peixe': { key: 'b14b84e7b7', source: "sem foto (aguardando envio do dono)" },
  // Casa da Picanha
  'emp_iguaba_grande_casa-da-picanha': { key: 'dfc4f88272', source: "sem foto (aguardando envio do dono)" },
  // Casa da Piedra
  'emp_arraial_do_cabo_casa-da-piedra': { key: '533bad5110', info: {"address": "R. Santa Cruz, 4 - Praia dos Anjos, Arraial do Cabo - RJ, 28930-000", "deliveryUrl": "https://casadapiedra.ola.click", "instagram": "https://www.instagram.com/casadapiedra"},
    source: "sem foto (aguardando envio do dono)" },
  // Casa da Praia Itaúna
  'emp_saquarema_casa-da-praia-itauna': { key: '61b25f1df6', source: "sem foto (aguardando envio do dono)" },
  // Casas Brancas Boutique Hotel & Spa
  'emp_buzios_casas-brancas-boutique-hotel-spa': { key: 'd62b599d39', coverImage: "https://images3.motor-reserva.com.br/curl/storage/5518/202409241727196045ohotel1.jpg",
    gallery: [
      "https://images3.motor-reserva.com.br/curl/storage/5518/202409131726232791topo3.jpg",
      "https://images3.motor-reserva.com.br/curl/storage/5518/202409131726232791topo1.1.jpg",
      "https://images3.motor-reserva.com.br/curl/storage/5518/202409131726232951mobile2.jpg",
      "https://images3.motor-reserva.com.br/curl/storage/5518/202602191771508143Prancheta6c%C3%B3pia2100.jpg",
      "https://images3.motor-reserva.com.br/curl/storage/5518/202602191771508143Prancheta3100.jpg",
    ],
    info: {"description": "Hotel em encosta de frente para a Baía da Armação, em Búzios, que começou em 1974 como uma pousada de 4 quartos e hoje tem 33 acomodações em 9 categorias, de arquitetura de inspiração mediterrânea. Entre elas está The Loft, cobertura de 160 m² com varanda panorâmica, e The Suíte, com piscina compacta no interior. O hotel tem restaurantes, spa, academia, recepção 24 horas e equipe multilíngue. Fica no Alto do Humaitá, a uma caminhada curta da Orla Bardot.", "amenities": ["ac"], "address": "Alto do Humaitá, 10 - Centro, Búzios - RJ, 28950-000"},
    source: "https://casasbrancas.com.br" },
  // Cliffside Luxury Inn
  'emp_buzios_cliffside-luxury-inn': { key: '0fce62f8cf', coverImage: "https://static.wixstatic.com/media/c05cf9_bc036982c25347d8b77ce52157cfe72d~mv2.jpg",
    gallery: [
      "https://static.wixstatic.com/media/c05cf9_fd208d70565e40158c5f5c6ee34b524f~mv2.jpg",
      "https://static.wixstatic.com/media/c05cf9_853f17aef56e4e44b97450a548626636~mv2.jpg",
      "https://static.wixstatic.com/media/c05cf9_02dec56fad914894b0658723a29b1737~mv2.jpg",
      "https://static.wixstatic.com/media/c05cf9_adbdcd2bd03d44ca83e85cbee5d15641~mv2.jpg",
      "https://static.wixstatic.com/media/c05cf9_486f5031df43493fb8a26ecbfea552c4~mv2.jpg",
      "https://static.wixstatic.com/media/c05cf9_1bffcc2a8e9f468f8d07e930f45a4cf4~mv2.jpg",
    ],
    info: {"description": "Vila de vidro sobre um penhasco, projetada pelo arquiteto Otávio Raja Gabaglia, onde de qualquer ambiente se vê o mar e se ouve as ondas quebrando. A decoração em estilo brasileiro, com muita cor, é assinada por Emery de Lima Fata. A piscina de borda infinita fica à beira da falésia, e é ali que o café da manhã é servido todos os dias. Uma hospedagem de poucos quartos, pensada para quem quer privacidade, luxo e vista aberta para o oceano em Búzios.", "amenities": ["pool", "breakfast"]},
    source: "https://www.cliffsideluxuryinn.com.br" },
  // Pousada Enseada das Garças
  'emp_sao_pedro_da_aldeia_pousada-enseada-das-garcas': { key: '4b35d45fb5', coverImage: "https://www.enseadadasgarcas.com.br/arquivos/imagens/WEB6-8d34485-3e62ae303a0c3777f3f75837571.jpg",
    gallery: [
      "https://www.enseadadasgarcas.com.br/arquivos/imagens/1web-532c9d9-244cf4e9991c63a0a3cb5a12812.jpg",
      "https://www.enseadadasgarcas.com.br/arquivos/imagens/Enseada-das--cedaa59f64452ce1df370e5ff90.jpg",
      "https://www.enseadadasgarcas.com.br/arquivos/imagens/fundo-7e1952-d24c3f9a04aa1459ace09627be2.jpg",
    ],
    info: {"description": "Pousada em cores mediterrâneas, numa colina de São Pedro da Aldeia, de onde a vista da varanda dos bangalôs e da borda da piscina alcança ilhas, salinas, praias desertas e as cidades vizinhas. A proposta é o descanso, com decoração de bom gosto, boa gastronomia e passeio de traineira. Fica na Rua José Costa, 1088, Ponta da Areia, a cerca de 13 km de Cabo Frio, 22 km de Arraial do Cabo e 26 km de Búzios.", "amenities": ["pool"], "address": "Rua José Costa, 1088 - Ponta da Areia, São Pedro da Aldeia - RJ", "phone": "(22) 2627-0007"},
    source: "https://www.enseadadasgarcas.com.br" },
  // Estrela do Mar Saquarema
  'emp_saquarema_estrela-do-mar-saquarema': { key: '68af866ffb', source: "sem foto (aguardando envio do dono)" },
  // Hotel Experience João Fernandes
  'emp_buzios_hotel-experience-joao-fernandes': { key: '3d94c9d42b', coverImage: "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/vista-aerea-10-1024x576-1-1.jpg",
    gallery: [
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/Piscina-33-768x512-1.jpg",
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/standard-1-768x512-1.jpg",
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/standard-2-quartos-48-768x512-1.jpg",
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/suite-master-139-1024x683.jpg",
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/HEJF-OSSOS-1024x576-1.jpg",
    ],
    info: {"description": "Hotel a 100 metros da Praia de João Fernandes, por um caminho plano e fácil, pensado para viajar em família. Tem piscinas aquecidas abertas das 9h às 22h, área kids monitorada, sala de games, academia e restaurante à la carte. Fica a 900 m da Praia dos Ossos, 1,2 km da Rua das Pedras e 2,3 km da rodoviária de Búzios, uma boa base para quem quer praia sem depender de carro o tempo todo.", "amenities": ["pool", "kids"], "address": "Rua Um, s/n, lotes 24, 25 e 26 - Praia de João Fernandes, Búzios - RJ, 28950-000"},
    source: "https://experiencejoaofernandes.com.br" },
  // Galápagos
  'emp_cabo_frio_galapagos': { key: '7c2414e6f7', info: {"description": "Restaurante instalado num casarão colonial no Largo de São Benedito, o coração histórico da Passagem, bem em frente à igreja branca do século XVII. A cozinha é internacional e criativa, com pratos como peixe grelhado com alecrim e maracujá, risoto de camarão com aspargos e polvo reinterpretado. As mesas ao ar livre são charmosas e a casa é presença certa nos roteiros gastronômicos de Cabo Frio; reservar é recomendável.", "amenities": [], "address": "Largo de São Benedito, 11 - Passagem, Cabo Frio - RJ, 28906-340", "phone": "(22) 2643-4097"},
    source: "sem foto (aguardando envio do dono)" },
  // Hotel Aconchego da Vila
  'emp_saquarema_hotel-aconchego-da-vila': { key: '7ecc78a76a', info: {"description": "Hotel recém-reformado na orla da Praia da Vila, em Saquarema, a poucos passos da Vila e do Canhão. Tem piscina com vista para o mar, terraço, bar e estacionamento privativo, e os quartos têm ar-condicionado. Os hóspedes elogiam o café da manhã, a localização e os quartos com vista para o mar. Fica na Avenida Ministro Salgado Filho, 340.", "amenities": [], "address": "Avenida Ministro Salgado Filho, 340 - Praia da Vila, Saquarema - RJ, 28990-000"},
    source: "sem foto (aguardando envio do dono)" },
  // Insólito Boutique Hotel & Spa
  'emp_buzios_insolito-boutique-hotel-spa': { key: 'fc940ae877', coverImage: "https://insolitohotel.com/wp-content/uploads/2025/04/DJI_20250221182508_0533_D-1-1.jpg",
    gallery: [
      "https://insolitohotel.com/wp-content/uploads/2025/12/suites-e-acomodacoes.webp",
      "https://insolitohotel.com/wp-content/uploads/2025/12/insolito-com-piscina-1.webp",
      "https://insolitohotel.com/wp-content/uploads/2025/12/insolito-1.webp",
      "https://insolitohotel.com/wp-content/uploads/2025/12/master-1.webp",
      "https://insolitohotel.com/wp-content/uploads/2025/02/superior-1.webp",
      "https://insolitohotel.com/wp-content/uploads/2025/02/classic.webp",
    ],
    info: {"description": "Hotel boutique de frente para a Praia da Ferradura, em Búzios, com praia e piscina privativas e suítes de vistas panorâmicas. Cada ala tem um tema ligado à cultura brasileira: há suítes Classic na Ala Terra Brasil e na Casa de Fotografia e Literatura, Master na Casa da Música e Deluxe de cerca de 40 m². Algumas suítes têm piscina própria. A propriedade é cheia de obras de arte e mobiliário exclusivo, e o hotel tem restaurante e centro de bem-estar (Wellness). Ideal para quem quer sossego, privacidade e atendimento personalizado.", "amenities": ["pool"]},
    source: "https://insolitohotel.com" },
  // Kentô Cozinha Oriental
  'emp_cabo_frio_kento-cozinha-oriental': { key: '794ab33469', source: "sem foto (aguardando envio do dono)" },
  // La Bodeguita Restaurante e Pizzaria
  'emp_araruama_la-bodeguita-restaurante-e-pizzaria': { key: '7148c904af', source: "sem foto (aguardando envio do dono)" },
  // Lorenzzo Burguer
  'emp_arraial_do_cabo_lorenzzo-burguer': { key: 'fdf2d5fc59', source: "sem foto (aguardando envio do dono)" },
  // Lounge da Praia
  'emp_arraial_do_cabo_lounge-da-praia': { key: '5d026e3c75', source: "sem foto (aguardando envio do dono)" },
  // Místico Restaurant
  'emp_buzios_mistico-restaurant': { key: '213b3a356d', info: {"description": "Restaurante do Abracadabra Boutique Hotel, no alto do Morro do Humaitá, com vista panorâmica sobre o centro de Búzios e a praia. A cozinha autoral e contemporânea é assinada pelo chef Sávio Freitas, que trabalha ingredientes brasileiros e sazonais, e a casa costuma promover menus especiais e almoços temáticos. Reserva recomendada.", "amenities": [], "address": "Rua Alto do Humaitá, 13 - Morro do Humaitá, Armação dos Búzios - RJ", "phone": "(22) 2623-1217", "website": "https://www.abracadabrahotel.com.br"},
    source: "sem foto (aguardando envio do dono)" },
  // Malibu Palace Hotel
  'emp_cabo_frio_malibu-palace-hotel': { key: 'b855991881', coverImage: "https://www.malibupalace.com.br/pluginAppObj/pluginAppObj_45/hot1.jpg",
    gallery: [
      "https://www.malibupalace.com.br/pluginAppObj/pluginAppObj_46/aco1.jpg",
      "https://www.malibupalace.com.br/pluginAppObj/pluginAppObj_47/ser1.jpg",
      "https://www.malibupalace.com.br/images/slider1.jpg",
      "https://www.malibupalace.com.br/images/slider2.jpg",
    ],
    info: {"description": "Hotel de frente para a Praia do Forte, a mais conhecida de Cabo Frio, com acomodações, restaurante, área de lazer e salões para convenções e eventos. A proposta é servir tanto a quem vem passar o fim de semana, feriado ou férias quanto a quem organiza encontros corporativos e festas, com espaços próprios para isso. O hotel fica na Avenida Macário Pinto Lopes, antiga Avenida do Contorno, a poucos passos da areia. Não aceita animais de estimação, nem de pequeno porte.", "amenities": [], "address": "Avenida Macário Pinto Lopes, 900 - Praia do Forte, Cabo Frio - RJ", "phone": "(22) 2647-8000"},
    source: "https://www.malibupalace.com.br" },
  // Maravista Hotel e Spa
  'emp_buzios_maravista-hotel-e-spa': { key: 'f5e5c85f20', coverImage: "https://maravista.com.br/wp-content/uploads/2025/10/Maravista-Hotel-e-Spa-02.jpg",
    gallery: [
      "https://maravista.com.br/wp-content/uploads/2025/10/Maravista-Hotel-e-Spa-01.jpg",
      "https://maravista.com.br/wp-content/uploads/2025/10/Maravista-Hotel-e-Spa-04.jpg",
      "https://maravista.com.br/wp-content/uploads/2025/10/Maravista-Hotel-e-Spa-05.jpg",
      "https://maravista.com.br/wp-content/uploads/2025/10/Maravista-Hotel-e-Spa-45.jpg",
      "https://maravista.com.br/wp-content/uploads/2026/01/Wedding-70.jpg",
      "https://maravista.com.br/wp-content/uploads/2025/12/maravista-buzios.jpg",
    ],
    info: {"description": "Hotel e spa com acesso direto à Praia de Geribá, a mais famosa de Búzios, com dois quilômetros de areia branca e mar claro, ótimo para surfe, bodyboard, stand up paddle e windsurf. Funciona desde 1999 e tem suítes arejadas e bem decoradas, piscina e spa, além de estrutura para eventos e casamentos de frente para o mar. Fica na Rua Gerbert Perissé, a poucos passos da areia.", "amenities": ["pool"], "address": "Rua Gerbert Perissé, 1058 - Geribá, Búzios - RJ, 28950-000"},
    source: "https://maravista.com.br" },
  // Morada do Sol Suítes
  'emp_arraial_do_cabo_morada-do-sol-suites': { key: '43e3a3cd9e', coverImage: "https://www.moradadosolsuites.com.br/image/d235/6aaa07fe0e0ef34e95f55dcc/morada-do-sol-suites-suite-08",
    gallery: [
      "https://www.moradadosolsuites.com.br/image/d235/6aaa06ca0e0ef34e95f391ff/morada-do-sol-suites-suite-07",
    ],
    source: "https://www.moradadosolsuites.com.br" },
  // Outros500 Bar & Restaurante
  'emp_sao_pedro_da_aldeia_outros500-bar-restaurante': { key: '654c3718a1', source: "sem foto (aguardando envio do dono)" },
  // Pimenta Rosa Gastronomia
  'emp_arraial_do_cabo_pimenta-rosa-gastronomia': { key: '065db3d5bb', source: "sem foto (aguardando envio do dono)" },
  // Pousada Atalaia Boutique
  'emp_arraial_do_cabo_pousada-atalaia-boutique': { key: '207a85adaf', source: "sem foto (aguardando envio do dono)" },
  // Pousada Caravela
  'emp_arraial_do_cabo_pousada-caravela': { key: '2aa86733e8', info: {"description": "Pousada na Praia Grande, a cerca de 500 metros da areia e a uma caminhada curta da Praça da Independência e do centro de Arraial do Cabo. Os quartos são para casais e famílias, a recepção funciona 24 horas e a estrutura inclui piscina ao ar livre. Fica na Rua Wenceslau Braz e atende bem a quem quer chegar a pé aos restaurantes e ao ponto de saída dos passeios.", "amenities": [], "address": "Rua Wenceslau Braz, 98 - Praia Grande, Arraial do Cabo - RJ, 28930-000"},
    source: "sem foto (aguardando envio do dono)" },
  // Pousada Catavento
  'emp_saquarema_pousada-catavento': { key: '733adbe92d', source: "sem foto (aguardando envio do dono)" },
  // Pousada das Andorinhas
  'emp_iguaba_grande_pousada-das-andorinhas': { key: 'c40c536eb0', source: "sem foto (aguardando envio do dono)" },
  // Pousada Fruto de Itaúna
  'emp_saquarema_pousada-fruto-de-itauna': { key: '111ee2dcbf', source: "sem foto (aguardando envio do dono)" },
  // Pousada Hotel Praia dos Anjos
  'emp_arraial_do_cabo_pousada-hotel-praia-dos-anjos': { key: 'fea61b0893', source: "sem foto (aguardando envio do dono)" },
  // Pousada Manaaki
  'emp_buzios_pousada-manaaki': { key: 'c1548148e6', info: {"description": "Pousada de ambiente aconchegante entre a Praia Rasa e a Baía Formosa, em Búzios, com piscina externa, jardim, redes para descanso, bar e área de convivência. Oferece massagens sob reserva e café da manhã, num clima tranquilo, longe da agitação do centro. Fica na Avenida Greta Blanc do Rio, perto do campo de golfe.", "amenities": [], "address": "Avenida Greta Blanc do Rio, 82 - Praia Rasa, Armação dos Búzios - RJ, 28950-000"},
    source: "sem foto (aguardando envio do dono)" },
  // Pousada Melodia do Mar
  'emp_cabo_frio_pousada-melodia-do-mar': { key: '1bc6386ff0', source: "sem foto (aguardando envio do dono)" },
  // Pousada Porto Forte
  'emp_cabo_frio_pousada-porto-forte': { key: 'd2aa14ffdb', info: {"description": "Pousada no centro comercial de Cabo Frio, perto de bancos, lojas, farmácias, mercados, bares e da vida noturna da cidade, a poucos minutos a pé da Praia do Forte e do Canal Itajuru. Boa base para quem quer deixar o carro e resolver tudo a pé. Fica na Rua Professor Miguel Couto, no Centro.", "amenities": [], "address": "Rua Professor Miguel Couto, 192 - Centro, Cabo Frio - RJ, 28907-140", "phone": "(22) 2643-1970", "whatsapp": "(22) 99247-9093", "website": "https://www.pousadaportoforte.com.br", "instagram": "https://www.instagram.com/pousadaportoforte"},
    source: "sem foto (aguardando envio do dono)" },
  // Pousada Vista Turquesa
  'emp_arraial_do_cabo_pousada-vista-turquesa': { key: 'a43ccba29d', source: "sem foto (aguardando envio do dono)" },
  // Pousada da Prainha
  'Efp75piLz0FZvNyprlvD': { key: '84d03c5862', coverImage: "https://pousadadaprainha.com/wp-content/uploads/2026/02/PISCINA.jpg",
    gallery: [
      "https://pousadadaprainha.com/wp-content/uploads/2026/02/PISCINA-2.jpg",
      "https://pousadadaprainha.com/wp-content/uploads/2023/10/WhatsApp-Image-2023-10-16-at-15.13.56.jpeg",
      "https://pousadadaprainha.com/wp-content/uploads/2026/02/sala-de-estar-Copia.jpg",
      "https://pousadadaprainha.com/wp-content/uploads/2023/07/WhatsApp-Image-2023-07-13-at-10.31.51.jpeg",
      "https://pousadadaprainha.com/wp-content/uploads/2023/07/WhatsApp-Image-2023-07-13-at-10.31.05-2.jpeg",
    ],
    info: {"description": "Pousada de pátio interno com piscina ao ar livre (de 1,05 m a 1,30 m de profundidade), na Prainha, em Arraial do Cabo, perto de uma das praias mais procuradas da cidade. As suítes têm ar-condicionado e Wi-Fi gratuito, e a casa oferece mesa de bilhar e atendimento em português, espanhol e inglês. Animais de estimação são aceitos mediante pedido, com possível custo adicional. Fica na Rua Pastor Admardo Machado, 90 (antiga Rua D), no bairro da Prainha.", "amenities": ["ac", "wifi", "pool", "pet"], "address": "Rua Pastor Admardo Machado, 90 (antiga Rua D) - Prainha, Arraial do Cabo - RJ, 28930-000", "phone": "(22) 2622-2512"},
    source: "https://pousadadaprainha.com" },
  // Privilège Búzios
  'emp_buzios_privilege-buzios': { key: '5ab45f5655', source: "sem foto (aguardando envio do dono)" },
  // Recanto Suítes
  'emp_araruama_recanto-suites': { key: '684fbb35ff', source: "sem foto (aguardando envio do dono)" },
  // Restaurante Mar.
  'emp_cabo_frio_restaurante-mar': { key: 'e73779ac6c', source: "sem foto (aguardando envio do dono)" },
  // Restaurante Picanha do Gugu
  'emp_araruama_restaurante-picanha-do-gugu': { key: 'c9335b6224', source: "sem foto (aguardando envio do dono)" },
  // Restaurante Saquasuco
  'emp_saquarema_restaurante-saquasuco': { key: '2a58ad07b1', source: "sem foto (aguardando envio do dono)" },
  // Restaurante Tio Dorp
  'emp_arraial_do_cabo_restaurante-tio-dorp': { key: '05d6c87d09', info: {"description": "Restaurante de frutos do mar com deck voltado para o mar e vista da Praia dos Anjos durante a refeição. O cardápio mistura cozinha brasileira com toques mediterrâneos e ainda traz opções vegetarianas, como moqueca vegana e bobó de couve-flor. Fica na Praça Daniel Barreto, no centro de Arraial do Cabo, a poucos passos da orla.", "amenities": [], "address": "Praça Daniel Barreto, 10 - Praia dos Anjos, Arraial do Cabo - RJ", "phone": "(22) 2340-0246", "instagram": "https://www.instagram.com/restaurantetiodorp"},
    source: "sem foto (aguardando envio do dono)" },
  // Rocka Restaurant & Beach Lounge
  'emp_buzios_rocka-restaurant-beach-lounge': { key: '8888d51ddd', source: "sem foto (aguardando envio do dono)" },
  // Santo Gole Bar e Grill
  'emp_arraial_do_cabo_santo-gole-bar-e-grill': { key: 'b363a0e52d', info: {"description": "Bar e grill na Praça Daniel Barreto, no coração da Praia dos Anjos, com música ao vivo todos os dias, mesas ao ar livre e uma carta de petiscos, frutos do mar, pratos, chope, drinks e cervejas. A casa abre no fim da tarde e costuma encher à noite, por isso vale chegar cedo nos fins de semana e feriados.", "amenities": [], "address": "Praça Daniel Barreto, 05 - Praia dos Anjos, Arraial do Cabo - RJ", "instagram": "https://www.instagram.com/santogolebaregrill"},
    source: "sem foto (aguardando envio do dono)" },
  // Smash do Cabo Hamburgueria
  'emp_arraial_do_cabo_smash-do-cabo-hamburgueria': { key: '9f3b712231', source: "sem foto (aguardando envio do dono)" },
  // Hotel Solar do Arco
  'emp_cabo_frio_hotel-solar-do-arco': { key: 'f8aa1550fa', coverImage: "https://static.wixstatic.com/media/bc4ad8_7d60bc1b79f3458d9eb84404d5ec64a5~mv2.jpeg",
    gallery: [
      "https://static.wixstatic.com/media/bc4ad8_a73f216e5d944a0aa17fceb5104d28e9~mv2.jpeg",
      "https://static.wixstatic.com/media/bc4ad8_e16c9a07730b49d18edd16fdbb5798a4~mv2.jpeg",
      "https://static.wixstatic.com/media/bc4ad8_ec2d917590e746ff9170fb1a27439313~mv2.jpeg",
      "https://static.wixstatic.com/media/bc4ad8_39c005f90bb94b13b26b35a89dc6f580~mv2.jpeg",
      "https://static.wixstatic.com/media/bc4ad8_fe472323514d48c0bd063bf2ce265008~mv2.jpeg",
      "https://static.wixstatic.com/media/bc4ad8_18602706cf584f9f967563adefa6700b~mv2.jpeg",
    ],
    info: {"description": "Hotel boutique em casarão histórico à beira do Canal do Itajuru, no bairro da Passagem, em Cabo Frio, frequentado pela família real nos tempos do Império e restaurado com cuidado. Os jardins misturam memória e paisagismo contemporâneo com flora tropical, e a piscina de ares mouriscos é um dos refúgios da casa. O clima é de serenidade, com a brisa do canal e o movimento dos barcos, a poucos passos do patrimônio cultural da cidade e das praias da região.", "amenities": ["pool"]},
    source: "https://www.solardoarco.com.br" },
  // The Bull Restaurant
  'emp_sao_pedro_da_aldeia_the-bull-restaurant': { key: 'd5a13b61a6', source: "sem foto (aguardando envio do dono)" },
  // The Duck Rock Pub
  'emp_cabo_frio_the-duck-rock-pub': { key: '6cf47f5825', source: "sem foto (aguardando envio do dono)" },
  // Toshi Conceito
  'emp_sao_pedro_da_aldeia_toshi-conceito': { key: '161e005906', source: "sem foto (aguardando envio do dono)" },
  // Pousada Villa Mares
  'emp_sao_pedro_da_aldeia_pousada-villa-mares': { key: '01ca4db0e5', coverImage: "https://villamares.com.br/wp-content/uploads/2021/09/Villa-Mares-05.jpg",
    gallery: [
      "https://villamares.com.br/wp-content/uploads/2021/06/6-768x728.jpg",
      "https://villamares.com.br/wp-content/uploads/2021/06/IMG_3372web-1.jpg",
      "https://villamares.com.br/wp-content/uploads/2021/06/IMG_3370web.jpg",
    ],
    info: {"description": "Pousada a cerca de 200 metros do centro de São Pedro da Aldeia, perto de restaurantes, lanchonetes, supermercados e farmácias, pensada tanto para quem viaja a trabalho quanto para quem quer curtir a Região dos Lagos. Os quartos têm banheiro privativo com ducha, camas box, ar-condicionado, frigobar, Wi-Fi e telefone, e o café da manhã é servido todos os dias. Cabo Frio, Arraial do Cabo e Búzios ficam a poucos minutos de carro.", "amenities": ["wifi", "ac", "breakfast"], "phone": "(22) 2321-0904"},
    source: "https://villamares.com.br" },
  // Village Itaúna Inn
  'emp_saquarema_village-itauna-inn': { key: '4672cf9301', coverImage: "https://cache.ayrton.net.br/imports/a854a157-f139-4468-bbf5-345b08442c19.jpeg",
    gallery: [
      "https://cache.ayrton.net.br/imports/d0ca642e-04a0-4c4e-a051-23e0b7f4b78f.jpeg",
      "https://cache.ayrton.net.br/imports/e156eb5c-b38a-4283-b9f3-7875e28ec748.jpeg",
      "https://cache.ayrton.net.br/imports/00804d0b-25a0-4e7f-bcd1-ccf838d99a49.jpeg",
      "https://cache.ayrton.net.br/imports/02cba4b5-f2cf-46d2-90fd-12ea3df498a6.jpeg",
      "https://cache.ayrton.net.br/imports/4edf5f69-f44f-4dcb-97a7-06eff2719ab6.jpeg",
    ],
    source: "https://villageitaunainn.com.br" },
};

export const getPrivatePreview = (businessId: string, key: string | null): PrivatePreview | null => {
  const p = PRIVATE_PREVIEWS[businessId];
  return p && key && key === p.key ? p : null;
};
