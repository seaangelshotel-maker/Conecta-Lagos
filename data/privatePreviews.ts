/**
 * Prévias PRIVADAS para mostrar a ficha completa ao dono da empresa antes de ele autorizar fotos.
 * Aberta só por link com chave (/previa/<id>?k=<chave>), fora do Google, sem aparecer no guia.
 * As imagens são exibidas direto do site oficial da própria empresa (não são copiadas nem guardadas aqui).
 * Quando o dono autorizar/enviar as fotos, o link é apagado daqui.
 */
export interface PrivatePreview {
  key: string;
  coverImage?: string;
  gallery?: string[];
  source: string;
}

export const PRIVATE_PREVIEWS: Record<string, PrivatePreview> = {
  // Fotos hospedadas nos sites das próprias empresas; só aparecem por link secreto até o dono autorizar.
  // (As empresas piloto já autorizadas estão em data/approvedPhotos.ts.)
  // Passagem Altto Sushi
  'emp_cabo_frio_passagem-altto-sushi': { key: 'd68485e0c0', coverImage: "https://passagemalttosushi.com.br/wp-content/uploads/2026/03/dobra_3.webp",
    gallery: [
      "https://passagemalttosushi.com.br/wp-content/uploads/2026/03/sushi_sashimi.webp",
      "https://passagemalttosushi.com.br/wp-content/uploads/2026/03/rolls_especiais.webp",
      "https://passagemalttosushi.com.br/wp-content/uploads/2026/03/pratos_quentes.webp",
      "https://passagemalttosushi.com.br/wp-content/uploads/2026/03/sobremesas.webp",
    ],
    source: "passagemalttosushi.com.br" },
  // Restaurante Anexo Praia Búzios
  'emp_buzios_restaurante-anexo-praia-buzios': { key: 'ad8dd93846', coverImage: "https://anexopraiabuzios.com.br/wp-content/uploads/2024/04/Ambiente.jpg",
    gallery: [],
    source: "anexopraiabuzios.com.br" },
  // Belisquê Restaurante e Choperia
  'emp_araruama_belisque-restaurante-e-choperia': { key: '9269ceacdb', coverImage: "https://www.belisque.com.br/assets/img/estrutura-belisque/selecionada-8539-1280.webp",
    gallery: [
      "https://www.belisque.com.br/assets/img/estrutura-belisque/selecionada-8128-1280.webp",
      "https://www.belisque.com.br/assets/img/estrutura-belisque/selecionada-8130-1280.webp",
      "https://www.belisque.com.br/assets/img/Picanha-Grill-Belisque.jpg",
      "https://www.belisque.com.br/assets/img/estrutura-belisque/prato-7857-640.webp",
      "https://www.belisque.com.br/assets/img/Happy-hour-praia-do-paraiso-2.jpg",
    ],
    source: "belisque.com.br" },
  // Pousada Cambucá de Cabo Frio
  'emp_cabo_frio_pousada-cambuca-de-cabo-frio': { key: '76453e91f0', coverImage: "https://pousadacambuca.tur.br/wp-content/uploads/2021/09/ca2.png",
    gallery: [
      "https://pousadacambuca.tur.br/wp-content/uploads/2021/09/ca.png",
      "https://pousadacambuca.tur.br/wp-content/uploads/2021/09/pousada-cambuca-de-cabo-9.png",
    ],
    source: "pousadacambuca.tur.br" },
  // Casablanca Búzios
  'emp_buzios_casablanca-buzios': { key: '2c7297fb81', coverImage: "https://casablancabuzios.com.br/wp-content/uploads/2025/02/ambiente-CB-1.jpg",
    gallery: [
      "https://casablancabuzios.com.br/wp-content/uploads/2025/02/2-20240903_154240.png",
      "https://casablancabuzios.com.br/wp-content/uploads/2025/02/IMG_2710.png",
      "https://casablancabuzios.com.br/wp-content/uploads/2025/02/1000220301-scaled.jpg",
    ],
    source: "casablancabuzios.com.br" },
  // Pousada Cavalo Branco
  'emp_cabo_frio_pousada-cavalo-branco': { key: 'd0b4730522', coverImage: "https://pub-0e522c26bcdf4aebb542b5fbc7453cd9.r2.dev/tenants/00000000-0000-4000-8000-000000000001/gallery/1779242218998-15aedb52-dca2-4ce6-99eb-23a6aea017d0.jpg",
    gallery: [
      "https://pub-0e522c26bcdf4aebb542b5fbc7453cd9.r2.dev/tenants/00000000-0000-4000-8000-000000000001/gallery/1779242222129-7943a5c1-cf34-4a5e-ada5-489dbf00ff1e.jpg",
      "https://pub-0e522c26bcdf4aebb542b5fbc7453cd9.r2.dev/tenants/00000000-0000-4000-8000-000000000001/gallery/1779242229921-duplo.jpg",
      "https://pub-0e522c26bcdf4aebb542b5fbc7453cd9.r2.dev/tenants/00000000-0000-4000-8000-000000000001/gallery/1779242234846-triplo.jpg",
      "https://pub-0e522c26bcdf4aebb542b5fbc7453cd9.r2.dev/tenants/00000000-0000-4000-8000-000000000001/gallery/1779242219537-4df704a8-79ed-44ab-8e15-8f2603b5dffd.jpg",
      "https://pub-0e522c26bcdf4aebb542b5fbc7453cd9.r2.dev/tenants/00000000-0000-4000-8000-000000000001/gallery/1779242218482-0941274c-520f-4282-bbf8-cc1cf0721dbd.jpg",
    ],
    source: "pousadacavalobranco.com" },
  // Pousada Fernandes
  'emp_arraial_do_cabo_pousada-fernandes': { key: '3907104507', coverImage: "https://pub-3238dc7834d34038881c3fd9258ea818.r2.dev/quarto1.png",
    gallery: [
      "https://pub-3238dc7834d34038881c3fd9258ea818.r2.dev/quarto3.jpg",
      "https://pub-3238dc7834d34038881c3fd9258ea818.r2.dev/cafe1.jpg",
      "https://pub-3238dc7834d34038881c3fd9258ea818.r2.dev/cafe2.jpg",
      "https://pub-3238dc7834d34038881c3fd9258ea818.r2.dev/gastronomia.jpg",
      "https://pub-3238dc7834d34038881c3fd9258ea818.r2.dev/quarto4.jpg",
    ],
    source: "pousadafernandes.com.br" },
  // Restaurante La Gare
  'emp_buzios_restaurante-la-gare': { key: 'b259550fb6', coverImage: "https://irp.cdn-website.com/36307ba1/dms3rep/multi/opt/19_edited-1920w.jpg",
    gallery: [
      "https://irp.cdn-website.com/36307ba1/dms3rep/multi/opt/patio-1920w.jpg",
      "https://irp.cdn-website.com/36307ba1/dms3rep/multi/opt/hotel-boutique-em-buzios5--1024x716-1920w.jpg",
      "https://irp.cdn-website.com/36307ba1/dms3rep/multi/opt/GAStres-1920w.jpg",
      "https://irp.cdn-website.com/36307ba1/dms3rep/multi/opt/_MG_0634-1920w.jpg",
    ],
    source: "viladasanta.com (hotel onde fica o restaurante)" },
  // Hotel Orla de Araruama
  'emp_araruama_hotel-orla-de-araruama': { key: 'e265948377', coverImage: "https://static.wixstatic.com/media/3578f9_80904b584bb1455589a8db039d1e6d14~mv2.jpg",
    gallery: [
      "https://static.wixstatic.com/media/3578f9_fd8f739c64a64ac98b637b99a0a8eeb4~mv2.jpg",
      "https://static.wixstatic.com/media/3578f9_381ca3d7520f4f10ace75c7913d7989f~mv2.jpg",
      "https://static.wixstatic.com/media/3578f9_78b57a49b1c44572980c1f8350244a5e~mv2.jpg",
    ],
    source: "hotelorladeararuama.com.br" },
  // Pousada Pontal da Ferradura
  'emp_buzios_pousada-pontal-da-ferradura': { key: 'fc7e498182', coverImage: "https://static.wixstatic.com/media/212466_7b548b221948485bb84b1d0eed412488~mv2.jpg",
    gallery: [
      "https://static.wixstatic.com/media/831e06_116c75c249a840a29cd1044cd12a4bc4f000.jpg",
      "https://static.wixstatic.com/media/831e06_3c865cfc07684eb9a8f2aaa0a3d8aa4c~mv2.jpg",
    ],
    source: "pontaldaferradura.com.br" },
  // Primitivo Búzios
  'emp_buzios_primitivo-buzios': { key: 'f2cd79e337', coverImage: "https://primitivobuzios.com.br/wp-content/uploads/2025/07/Primitivo_Fachada_2.jpg",
    gallery: [
      "https://primitivobuzios.com.br/wp-content/uploads/2025/07/Ambientes_.jpg",
      "https://primitivobuzios.com.br/wp-content/uploads/2025/07/IMG_6732_edited.jpg",
      "https://primitivobuzios.com.br/wp-content/uploads/2025/07/Primitivo_Pizzas_54-2-scaled.jpg",
      "https://primitivobuzios.com.br/wp-content/uploads/2025/07/Filetto-al-tre-Funghi.jpg",
      "https://primitivobuzios.com.br/wp-content/uploads/2025/07/Gnocchi_Tratado_1.jpg",
    ],
    source: "primitivobuzios.com.br" },
  // Silk Beach Club Búzios
  'emp_buzios_silk-beach-club-buzios': { key: '4f2e0fe8c7', coverImage: "https://www.silkbeachclub.com.br/assets/imagens/deckpraia/deck-praia-silk-beach-club-1920.webp",
    gallery: [
      "https://www.silkbeachclub.com.br/assets/imagens/fotos/foto-1-min2.jpg",
      "https://www.silkbeachclub.com.br/assets/imagens/fotos/foto-2-min.jpg",
      "https://www.silkbeachclub.com.br/assets/imagens/fotos/foto-3-min.jpg",
      "https://www.silkbeachclub.com.br/assets/imagens/fotos/foto-4-min.jpg",
    ],
    source: "silkbeachclub.com.br" },
  // Tawa Beach
  'emp_buzios_tawa-beach': { key: '5cb4ac4d10', coverImage: "https://static.wixstatic.com/media/481b70_79ecf39523634aa58e6ad45e74b1a927~mv2.jpg",
    gallery: [
      "https://static.wixstatic.com/media/481b70_0b28e1f2674c4f4d87654c880e554c90~mv2.jpeg",
      "https://static.wixstatic.com/media/481b70_0346fb0170aa4af28877bb06ed29df83~mv2.jpg",
    ],
    source: "tawabeach.com" },
  // Vila d'este Búzios Hotel
  'emp_buzios_vila-d-este-buzios-hotel': { key: 'e3684ddd22', coverImage: "https://viladeste.com.br/wp-content/uploads/2023/02/Vila-deste-6-Reduzida-2x1-39.jpg",
    gallery: [
      "https://viladeste.com.br/wp-content/uploads/2023/02/Vila-deste-6-Reduzida-3x2-83.jpg",
      "https://viladeste.com.br/wp-content/uploads/2023/02/Vila-deste-6-Reduzida-3x2-126-1920x1080.jpg",
      "https://viladeste.com.br/wp-content/uploads/2023/02/Vila-deste-6-ALTA-3x2-14.jpg",
    ],
    source: "viladeste.com.br" },
  // Beach Club Ville La Plage
  'emp_buzios_beach-club-ville-la-plage': { key: '2ad6f9def4', coverImage: "https://beachclub.villelaplage.com.br/cac/wp-content/uploads/2026/05/Beach-Clube-54-1-scaled.jpg",
    gallery: [
      "https://beachclub.villelaplage.com.br/cac/wp-content/uploads/2026/05/Beach-Clube-51-scaled.jpg",
      "https://beachclub.villelaplage.com.br/cac/wp-content/uploads/2026/05/Beach-Clube-50-scaled.jpg",
      "https://beachclub.villelaplage.com.br/cac/wp-content/uploads/2026/05/Beach-Clube-24-scaled.jpg",
      "https://beachclub.villelaplage.com.br/cac/wp-content/uploads/2026/05/Beach-Clube-34-scaled.jpg",
      "https://beachclub.villelaplage.com.br/cac/wp-content/uploads/2026/05/Beach-Clube-17-scaled.jpg",
    ],
    source: "beachclub.villelaplage.com.br" },
};

export const getPrivatePreview = (businessId: string, key: string | null): PrivatePreview | null => {
  const p = PRIVATE_PREVIEWS[businessId];
  return p && key && key === p.key ? p : null;
};
