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
  // Sentinelas do Mar e Ocean View autorizaram as fotos e já estão públicos (19/11/2026)
  // Pousada Algodão da Praia
  'emp_araruama_pousada-algodao-da-praia': { key: '2c23a360f5', coverImage: "https://pousadaalgodaodapraia.com.br/wp-content/uploads/2023/01/DJI_0253-1.jpg",
    gallery: [
      "https://pousadaalgodaodapraia.com.br/wp-content/uploads/2022/10/RB102288.jpg",
      "https://pousadaalgodaodapraia.com.br/wp-content/uploads/2022/10/RB108868.jpg",
      "https://pousadaalgodaodapraia.com.br/wp-content/uploads/2021/09/home_suite_dupla.png",
      "https://pousadaalgodaodapraia.com.br/wp-content/uploads/2022/03/WhatsApp-Image-2022-03-15-at-16.22.24.jpeg",
      "https://pousadaalgodaodapraia.com.br/wp-content/uploads/2021/10/play03.png",
    ],
    source: "https://pousadaalgodaodapraia.com.br" },
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
    source: "https://arcosdocanal.com.br" },
  // Pousada Arraial Caribe
  'emp_arraial_do_cabo_pousada-arraial-caribe': { key: 'f77e71154c', coverImage: "https://www.pousadaarraialcaribe.com.br/wp-content/uploads/2022/12/frente-AC.jpg",
    gallery: [
      "https://www.pousadaarraialcaribe.com.br/wp-content/uploads/2022/12/image4.jpg",
      "https://www.pousadaarraialcaribe.com.br/wp-content/uploads/2022/12/fundo.jpg",
      "https://www.pousadaarraialcaribe.com.br/wp-content/uploads/2022/12/cafe.jpg",
      "https://www.pousadaarraialcaribe.com.br/wp-content/uploads/2022/12/area-externa-AC.jpg",
    ],
    source: "https://www.pousadaarraialcaribe.com.br" },
  // Búzios Beach Resort
  'emp_buzios_buzios-beach-resort': { key: 'fcd77cde72', coverImage: "https://wamhoteis.com.br/wp-content/uploads/2025/08/EmdpHLRQ.webp",
    gallery: [
      "https://wamhoteis.com.br/wp-content/uploads/2025/07/916573.webp",
      "https://wamhoteis.com.br/wp-content/uploads/2025/07/DSC03664-scaled.jpg",
      "https://wamhoteis.com.br/wp-content/uploads/2025/08/Centro-de-Convencoes-Auditorio-scaled.webp",
      "https://wamhoteis.com.br/wp-content/uploads/2025/07/DSC03730-scaled.jpg",
    ],
    source: "https://wamhoteis.com.br/buzios-beach-resort/" },
  // Pousada Caminho do Sol
  '8mbOtad5nxVNMThEZdu1': { key: 'f8d8bef581', coverImage: "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/59ed3641f55345a7898acfb3fd36bea5.jpg",
    gallery: [
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/bba8c051b8c9473aa21cec45bc6126f8.jpeg",
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/398cb58eb5d543f1a4435ffd5b4b4e4b.jpeg",
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/990df270ae6a41f8827d74a168a78012.jpg",
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/af836564b63e4e0cbe99cfd0f2964d97.jpeg",
    ],
    source: "https://www.caminhodosol.com.br" },
  // Casas Brancas Boutique Hotel & Spa
  'emp_buzios_casas-brancas-boutique-hotel-spa': { key: 'd62b599d39', coverImage: "https://images3.motor-reserva.com.br/curl/storage/5518/202409241727196045ohotel1.jpg",
    gallery: [
      "https://images3.motor-reserva.com.br/curl/storage/5518/202409131726232791topo3.jpg",
      "https://images3.motor-reserva.com.br/curl/storage/5518/202409131726232791topo1.1.jpg",
      "https://images3.motor-reserva.com.br/curl/storage/5518/202409131726232951mobile2.jpg",
      "https://images3.motor-reserva.com.br/curl/storage/5518/202602191771508143Prancheta6c%C3%B3pia2100.jpg",
      "https://images3.motor-reserva.com.br/curl/storage/5518/202602191771508143Prancheta3100.jpg",
    ],
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
    source: "https://www.cliffsideluxuryinn.com.br" },
  // Pousada Enseada das Garças
  'emp_sao_pedro_da_aldeia_pousada-enseada-das-garcas': { key: '4b35d45fb5', coverImage: "https://www.enseadadasgarcas.com.br/arquivos/imagens/WEB6-8d34485-3e62ae303a0c3777f3f75837571.jpg",
    gallery: [
      "https://www.enseadadasgarcas.com.br/arquivos/imagens/1web-532c9d9-244cf4e9991c63a0a3cb5a12812.jpg",
      "https://www.enseadadasgarcas.com.br/arquivos/imagens/Enseada-das--cedaa59f64452ce1df370e5ff90.jpg",
      "https://www.enseadadasgarcas.com.br/arquivos/imagens/fundo-7e1952-d24c3f9a04aa1459ace09627be2.jpg",
    ],
    source: "https://www.enseadadasgarcas.com.br" },
  // Hotel Experience João Fernandes
  'emp_buzios_hotel-experience-joao-fernandes': { key: '3d94c9d42b', coverImage: "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/vista-aerea-10-1024x576-1-1.jpg",
    gallery: [
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/Piscina-33-768x512-1.jpg",
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/standard-1-768x512-1.jpg",
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/standard-2-quartos-48-768x512-1.jpg",
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/suite-master-139-1024x683.jpg",
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/HEJF-OSSOS-1024x576-1.jpg",
    ],
    source: "https://experiencejoaofernandes.com.br" },
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
    source: "https://insolitohotel.com" },
  // Malibu Palace Hotel
  'emp_cabo_frio_malibu-palace-hotel': { key: 'b855991881', coverImage: "https://www.malibupalace.com.br/pluginAppObj/pluginAppObj_45/hot1.jpg",
    gallery: [
      "https://www.malibupalace.com.br/pluginAppObj/pluginAppObj_46/aco1.jpg",
      "https://www.malibupalace.com.br/pluginAppObj/pluginAppObj_47/ser1.jpg",
      "https://www.malibupalace.com.br/images/slider1.jpg",
      "https://www.malibupalace.com.br/images/slider2.jpg",
    ],
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
    source: "https://maravista.com.br" },
  // Morada do Sol Suítes
  'emp_arraial_do_cabo_morada-do-sol-suites': { key: '43e3a3cd9e', coverImage: "https://www.moradadosolsuites.com.br/image/d235/6aaa07fe0e0ef34e95f55dcc/morada-do-sol-suites-suite-08",
    gallery: [
      "https://www.moradadosolsuites.com.br/image/d235/6aaa06ca0e0ef34e95f391ff/morada-do-sol-suites-suite-07",
    ],
    source: "https://www.moradadosolsuites.com.br" },
  // Pousada da Prainha
  'Efp75piLz0FZvNyprlvD': { key: '84d03c5862', coverImage: "https://pousadadaprainha.com/wp-content/uploads/2026/02/PISCINA.jpg",
    gallery: [
      "https://pousadadaprainha.com/wp-content/uploads/2026/02/PISCINA-2.jpg",
      "https://pousadadaprainha.com/wp-content/uploads/2023/10/WhatsApp-Image-2023-10-16-at-15.13.56.jpeg",
      "https://pousadadaprainha.com/wp-content/uploads/2026/02/sala-de-estar-Copia.jpg",
      "https://pousadadaprainha.com/wp-content/uploads/2023/07/WhatsApp-Image-2023-07-13-at-10.31.51.jpeg",
      "https://pousadadaprainha.com/wp-content/uploads/2023/07/WhatsApp-Image-2023-07-13-at-10.31.05-2.jpeg",
    ],
    source: "https://pousadadaprainha.com" },
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
    source: "https://www.solardoarco.com.br" },
  // Pousada Villa Mares
  'emp_sao_pedro_da_aldeia_pousada-villa-mares': { key: '01ca4db0e5', coverImage: "https://villamares.com.br/wp-content/uploads/2021/09/Villa-Mares-05.jpg",
    gallery: [
      "https://villamares.com.br/wp-content/uploads/2021/06/6-768x728.jpg",
      "https://villamares.com.br/wp-content/uploads/2021/06/IMG_3372web-1.jpg",
      "https://villamares.com.br/wp-content/uploads/2021/06/IMG_3370web.jpg",
    ],
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
