/**
 * Fotos autorizadas pelos donos (aprovadas em 19/11/2026). Endereços das imagens nos sites oficiais, não cópias.
 * O importador (Admin → Ecossistema → Empresas em destaque) grava estas fotos nas empresas ainda sem dono.
 */
export interface ApprovedPhotos { coverImage: string; gallery: string[]; }

export const APPROVED_PHOTOS: Record<string, ApprovedPhotos> = {
  // Pousada Águas do Forte
  'emp_cabo_frio_pousada-aguas-do-forte': { coverImage: "https://www.pousadaaguasdoforte.com.br/wp-content/uploads/2015/10/IMG_3087.jpg",
    gallery: [
      "https://www.pousadaaguasdoforte.com.br/wp-content/uploads/2015/10/Pousada-Aguas-do-Forte-20.jpg",
      "https://www.pousadaaguasdoforte.com.br/wp-content/uploads/2015/10/IMG_5095.jpg",
      "https://www.pousadaaguasdoforte.com.br/wp-content/uploads/2015/10/Pousada-Aguas-do-Forte-3.jpg",
      "https://www.pousadaaguasdoforte.com.br/wp-content/uploads/2015/10/Pousada-Aguas-do-Forte-16.jpg",
      "https://www.pousadaaguasdoforte.com.br/wp-content/uploads/2015/10/Pousada-Aguas-do-Forte-8.jpg",
      "https://www.pousadaaguasdoforte.com.br/wp-content/uploads/2017/01/slide4.jpg",
    ]
  },
  // Pousada Areia do Forte
  'emp_cabo_frio_pousada-areia-do-forte': { coverImage: "https://pousadaareiadoforte.com.br/wp-content/uploads/elementor/thumbs/fachada-qwae950ue0wbk5w56rprvsy59v8x5zzl07ki9h9pic.jpg",
    gallery: [
      "https://pousadaareiadoforte.com.br/wp-content/uploads/2025/01/AREIA-DO-FORTE-20.jpg",
      "https://pousadaareiadoforte.com.br/wp-content/uploads/2023/02/576195805.jpg",
      "https://pousadaareiadoforte.com.br/wp-content/uploads/2024/10/496328588.jpg",
      "https://pousadaareiadoforte.com.br/wp-content/uploads/2024/10/familia.jpg.webp",
      "https://pousadaareiadoforte.com.br/wp-content/uploads/elementor/thumbs/AREIA-DO-FORTE-19-r0e4g9odnwjb6emvpawgzrosrxa9a9kwb4952oua1w.jpg",
      "https://pousadaareiadoforte.com.br/wp-content/uploads/2023/02/373018923.jpg.webp",
    ]
  },
  // Pousada Arraial Inn
  'emp_arraial_do_cabo_pousada-arraial-inn': { coverImage: "https://irp.cdn-website.com/6d1962e6/dms3rep/multi/opt/WhatsApp+Image+2024-07-02+at+16.54.23-2304w.jpeg",
    gallery: [
      "https://irp.cdn-website.com/6d1962e6/dms3rep/multi/opt/C+%2811%29-2304w.jpg",
      "https://irp.cdn-website.com/6d1962e6/dms3rep/multi/opt/60-2304w.jpg",
      "https://irp.cdn-website.com/6d1962e6/dms3rep/multi/opt/100-ee471575-2304w.jpg",
      "https://irp.cdn-website.com/6d1962e6/dms3rep/multi/opt/WhatsApp+Image+2024-08-20+at+18.12.13-2304w.jpeg",
      "https://lirp.cdn-website.com/6d1962e6/dms3rep/multi/opt/1-b327a1e2-1920w.jpg",
      "https://irp.cdn-website.com/6d1962e6/dms3rep/multi/opt/70-2304w.jpg",
    ]
  },
  // Pousada Arraial Tropical
  'emp_arraial_do_cabo_pousada-arraial-tropical': { coverImage: "https://pousadaarraialtropical.com.br/assets/suite-hidro.jpg",
    gallery: [
      "https://pousadaarraialtropical.com.br/assets/suite-premium.jpg",
      "https://pousadaarraialtropical.com.br/assets/suite-deluxe.jpg",
      "https://pousadaarraialtropical.com.br/assets/cafe-buffet-1.jpg",
      "https://pousadaarraialtropical.com.br/assets/hidro-banheira.jpg",
      "https://pousadaarraialtropical.com.br/assets/patio.jpg",
      "https://pousadaarraialtropical.com.br/assets/hero.jpg",
    ]
  },
  // Pousada Brisa do Forte
  'emp_cabo_frio_pousada-brisa-do-forte': { coverImage: "https://irp.cdn-website.com/e573b37b/dms3rep/multi/opt/WhatsApp-Image-2017-10-04-at-11.48.15-800h.jpeg",
    gallery: [
      "https://irp.cdn-website.com/e573b37b/dms3rep/multi/opt/DSC_5045-1199x800-800h.jpg",
      "https://irp.cdn-website.com/e573b37b/dms3rep/multi/opt/DSC_5042-1199x800-800h.jpg",
      "https://irp.cdn-website.com/e573b37b/dms3rep/multi/opt/DSC_5012-1199x800-800h.jpg",
      "https://irp.cdn-website.com/e573b37b/dms3rep/multi/opt/IMG_9783-800h.jpg",
      "https://irp.cdn-website.com/e573b37b/dms3rep/multi/opt/DSC_5016-1199x800-800h.jpg",
      "https://irp.cdn-website.com/e573b37b/dms3rep/multi/opt/DSC_5009-1200x800-800h.jpg",
    ]
  },
  // Pousada Caminho do Sol
  '8mbOtad5nxVNMThEZdu1': { coverImage: "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/59ed3641f55345a7898acfb3fd36bea5.jpg",
    gallery: [
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/398cb58eb5d543f1a4435ffd5b4b4e4b.jpeg",
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/990df270ae6a41f8827d74a168a78012.jpg",
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/bba8c051b8c9473aa21cec45bc6126f8.jpeg",
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/af836564b63e4e0cbe99cfd0f2964d97.jpeg",
    ]
  },
  // Hotel Cave do Sol
  'emp_sao_pedro_da_aldeia_hotel-cave-do-sol': { coverImage: "https://hotelcavedosol.com.br/wp-content/uploads/2025/07/13-scaled.png",
    gallery: [
      "https://hotelcavedosol.com.br/wp-content/uploads/2025/07/426724807.jpg",
      "https://hotelcavedosol.com.br/wp-content/uploads/2025/07/282385679.jpg",
      "https://hotelcavedosol.com.br/wp-content/uploads/2025/07/287666830.jpg",
      "https://hotelcavedosol.com.br/wp-content/uploads/2025/07/20250322_085609-scaled.jpg",
      "https://hotelcavedosol.com.br/wp-content/uploads/2025/07/10-1.png",
      "https://hotelcavedosol.com.br/wp-content/uploads/2025/07/1-2.png",
    ]
  },
  // Chamos Hostel Cultural
  'emp_arraial_do_cabo_chamos-hostel-cultural': { coverImage: "https://i0.wp.com/chamoshostelcultural.com/wp-content/uploads/2023/11/image_50737409-1.jpg",
    gallery: [
      "https://i0.wp.com/chamoshostelcultural.com/wp-content/uploads/2024/03/84D0F2C3-2722-48AA-A1C5-E452230F6E79-1-scaled.jpg",
      "https://i0.wp.com/chamoshostelcultural.com/wp-content/uploads/2026/02/WhatsApp-Image-2025-10-27-at-22.53.28.jpeg",
      "https://i0.wp.com/chamoshostelcultural.com/wp-content/uploads/2026/02/WhatsApp-Image-2026-02-21-at-8.25.05-PM.jpeg",
      "https://i0.wp.com/chamoshostelcultural.com/wp-content/uploads/2022/04/Imagens-13.png",
      "https://i0.wp.com/chamoshostelcultural.com/wp-content/uploads/2022/04/Imagens-14.png",
    ]
  },
  // Hotel Pousada Figueiredo
  'emp_araruama_hotel-pousada-figueiredo': { coverImage: "https://pousadafigueiredo.com/wp-content/uploads/2025/11/img-6672-845x684.jpg",
    gallery: [
      "https://pousadafigueiredo.com/wp-content/uploads/2025/11/executivo-845x684.jpg",
      "https://pousadafigueiredo.com/wp-content/uploads/2025/11/cafe-da-manha.jpg",
      "https://pousadafigueiredo.com/wp-content/uploads/2025/09/img-20220303-wa0004-680x430.webp",
      "https://pousadafigueiredo.com/wp-content/uploads/2025/09/img-20220303-wa0037-680x430.webp",
      "https://pousadafigueiredo.com/wp-content/uploads/2025/09/2025-05-02-680x430.webp",
      "https://pousadafigueiredo.com/wp-content/uploads/2025/11/img-6673-845x684.jpg",
    ]
  },
  // Pousada Luzes de Geribá
  'emp_buzios_pousada-luzes-de-geriba': { coverImage: "https://www.luzesdegeriba.com.br/assets/img/fotos/piscina-fachada.jpg",
    gallery: [
      "https://www.luzesdegeriba.com.br/assets/img/fotos/chale-varanda.jpg",
      "https://www.luzesdegeriba.com.br/assets/img/fotos/jardim-piscina.jpg",
      "https://www.luzesdegeriba.com.br/assets/img/fotos/vista-aerea.jpg",
      "https://www.luzesdegeriba.com.br/assets/img/fotos/jardim-gramado.jpg",
      "https://www.luzesdegeriba.com.br/assets/img/fotos/piscina-deck.jpg",
    ]
  },
  // Hotel Mar de Cabo Frio
  'emp_cabo_frio_hotel-mar-de-cabo-frio': { coverImage: "https://hotelmardecabofrio.com.br/wp-content/uploads/2023/09/IMG_3175-1080x675.jpg",
    gallery: [
      "https://hotelmardecabofrio.com.br/wp-content/uploads/2023/09/20230831_114724-1080x675.jpg",
      "https://hotelmardecabofrio.com.br/wp-content/uploads/2023/09/20230831_132756-1080x675.jpg",
      "https://hotelmardecabofrio.com.br/wp-content/uploads/2023/09/20230831_114313-scaled.jpg",
      "https://hotelmardecabofrio.com.br/wp-content/uploads/2023/09/20230831_125203-scaled.jpg",
      "https://hotelmardecabofrio.com.br/wp-content/uploads/2023/09/20230831_121947-scaled.jpg",
    ]
  },
  // Pousada Mar de Geribá
  'emp_buzios_pousada-mar-de-geriba': { coverImage: "https://mardegeriba.com.br/img/hero.jpg",
    gallery: [
      "https://mardegeriba.com.br/img/948d9df7.jpg",
      "https://mardegeriba.com.br/img/00e6b370.jpg",
      "https://mardegeriba.com.br/img/ce1e10aa.jpg",
      "https://mardegeriba.com.br/img/0fb37311.jpg",
      "https://mardegeriba.com.br/img/27b58f90.jpg",
      "https://mardegeriba.com.br/img/a594f5a8.jpg",
    ]
  },
  // Pousada da Prainha
  'Efp75piLz0FZvNyprlvD': { coverImage: "https://pousadadaprainha.com/wp-content/uploads/2026/02/PISCINA.jpg",
    gallery: [
      "https://pousadadaprainha.com/wp-content/uploads/2026/02/PISCINA-2.jpg",
      "https://pousadadaprainha.com/wp-content/uploads/2023/10/WhatsApp-Image-2023-10-16-at-15.13.56.jpeg",
      "https://pousadadaprainha.com/wp-content/uploads/2026/02/sala-de-estar-Copia.jpg",
      "https://pousadadaprainha.com/wp-content/uploads/2023/07/WhatsApp-Image-2023-07-13-at-10.31.05-2.jpeg",
      "https://pousadadaprainha.com/wp-content/uploads/2026/02/RESTAURANTE.jpg",
      "https://pousadadaprainha.com/wp-content/uploads/2023/07/WhatsApp-Image-2023-07-13-at-10.31.52.jpeg",
    ]
  },
  // Pousada Praia João Fernandes
  'emp_buzios_pousada-praia-joao-fernandes': { coverImage: "https://irp.cdn-website.com/6e5f4ac6/dms3rep/multi/opt/NIK_0279-1beaa3df-2304w.jpg",
    gallery: [
      "https://irp.cdn-website.com/6e5f4ac6/dms3rep/multi/opt/NIK_0257-2304w.jpg",
      "https://irp.cdn-website.com//6e5f4ac6/dms3rep/multi/opt/f7fc12dd5ac08e9e2ff24bb852b96b2a-2304w.jpg",
      "https://irp.cdn-website.com/6e5f4ac6/dms3rep/multi/opt/DSC_6824-Modf-Baixa-2304w.jpg",
      "https://irp.cdn-website.com/6e5f4ac6/dms3rep/multi/opt/DSC_3321-2304w.jpg",
      "https://irp.cdn-website.com/6e5f4ac6/dms3rep/multi/opt/DSC_6733-mod-Baixa-dc95289f-2304w.jpg",
      "https://irp.cdn-website.com//6e5f4ac6/dms3rep/multi/opt/9a87b8a1b566759d0d8997d55daa4c7d+%282%29-1152w.jpg",
    ]
  },
  // Victtorio Pizzaria & Forneria
  'emp_buzios_victtorio-pizzaria-forneria': { coverImage: "https://victtorio.com.br/wp-content/uploads/2022/07/Victtorio_elloestudiocriativo-4.jpg",
    gallery: [
      "https://victtorio.com.br/wp-content/uploads/2022/07/Victtorio_elloestudiocriativo-8.jpg",
      "https://victtorio.com.br/wp-content/uploads/2022/07/Victtorio_elloestudiocriativo-6.jpg",
      "https://victtorio.com.br/wp-content/uploads/2022/07/Victtorio_elloestudiocriativo-7.jpg",
      "https://victtorio.com.br/wp-content/uploads/2022/07/Adega.png",
      "https://victtorio.com.br/wp-content/uploads/2022/07/Victtorio-3.png",
    ]
  },
  // Pousada Villa Raphael
  'emp_buzios_pousada-villa-raphael': { coverImage: "https://villaraphael.com.br/wp-content/uploads/2026/01/UH18-12-1.jpg",
    gallery: [
      "https://villaraphael.com.br/wp-content/uploads/2026/01/UH18-9-1.jpg",
      "https://villaraphael.com.br/wp-content/uploads/2026/01/UH18-3-1.jpg",
      "https://villaraphael.com.br/wp-content/uploads/2026/01/UH18-5-1.jpg",
      "https://villaraphael.com.br/wp-content/uploads/2026/01/Areas-comuns-Villa-4.jpg",
      "https://villaraphael.com.br/wp-content/uploads/2026/01/Ambientes-diaVR-9.jpg",
      "https://villaraphael.com.br/wp-content/uploads/2026/01/Ambientes-Noturnos-7.jpg",
    ]
  },
  // Xerelete Bar e Restaurante
  'emp_buzios_xerelete-bar-e-restaurante': { coverImage: "https://xereletebar.com/wp-content/uploads/2026/03/Xerelete-bar-restaurante-em-buzios-orla-bardot-5-scaled.jpg",
    gallery: [
      "https://xereletebar.com/wp-content/uploads/2026/03/cardapio-xerelete-restaurante-em-buzios-5.jpg",
      "https://xereletebar.com/wp-content/uploads/elementor/thumbs/eventos-em-buzios-xerelete-bar-restaurante-7-e1774572676591-rl3nwk6ztkpszvhmvtk35esxhegj06sf5xfqnltzr4.jpg",
      "https://xereletebar.com/wp-content/uploads/2026/03/cardapio-xerelete-restaurante-em-buzios-7-scaled.jpg",
      "https://xereletebar.com/wp-content/uploads/2026/03/cardapio-xerelete-restaurante-em-buzios-3.jpg",
      "https://xereletebar.com/wp-content/uploads/2026/03/cardapio-xerelete-restaurante-em-buzios-1.jpg",
      "https://xereletebar.com/wp-content/uploads/2026/03/xerelete-restaurante-em-buzios-orla-bardot-2-scaled.jpg",
    ]
  },
  // Passagem Altto Sushi
  'emp_cabo_frio_passagem-altto-sushi': { coverImage: "https://passagemalttosushi.com.br/wp-content/uploads/2026/03/dobra_3.webp",
    gallery: [
      "https://passagemalttosushi.com.br/wp-content/uploads/2026/03/sushi_sashimi.webp",
      "https://passagemalttosushi.com.br/wp-content/uploads/2026/03/rolls_especiais.webp",
      "https://passagemalttosushi.com.br/wp-content/uploads/2026/03/pratos_quentes.webp",
      "https://passagemalttosushi.com.br/wp-content/uploads/2026/03/sobremesas.webp",
    ]
  },
  // Restaurante Anexo Praia Búzios
  'emp_buzios_restaurante-anexo-praia-buzios': { coverImage: "https://anexopraiabuzios.com.br/wp-content/uploads/2024/04/Ambiente.jpg",
    gallery: []
  },
  // Belisquê Restaurante e Choperia
  'emp_araruama_belisque-restaurante-e-choperia': { coverImage: "https://www.belisque.com.br/assets/img/estrutura-belisque/selecionada-8539-1280.webp",
    gallery: [
      "https://www.belisque.com.br/assets/img/estrutura-belisque/selecionada-8128-1280.webp",
      "https://www.belisque.com.br/assets/img/estrutura-belisque/selecionada-8130-1280.webp",
      "https://www.belisque.com.br/assets/img/Picanha-Grill-Belisque.jpg",
      "https://www.belisque.com.br/assets/img/estrutura-belisque/prato-7857-640.webp",
      "https://www.belisque.com.br/assets/img/Happy-hour-praia-do-paraiso-2.jpg",
    ]
  },
  // Pousada Cambucá de Cabo Frio
  'emp_cabo_frio_pousada-cambuca-de-cabo-frio': { coverImage: "https://pousadacambuca.tur.br/wp-content/uploads/2021/09/ca2.png",
    gallery: [
      "https://pousadacambuca.tur.br/wp-content/uploads/2021/09/ca.png",
      "https://pousadacambuca.tur.br/wp-content/uploads/2021/09/pousada-cambuca-de-cabo-9.png",
    ]
  },
  // Casablanca Búzios
  'emp_buzios_casablanca-buzios': { coverImage: "https://casablancabuzios.com.br/wp-content/uploads/2025/02/ambiente-CB-1.jpg",
    gallery: [
      "https://casablancabuzios.com.br/wp-content/uploads/2025/02/2-20240903_154240.png",
      "https://casablancabuzios.com.br/wp-content/uploads/2025/02/IMG_2710.png",
      "https://casablancabuzios.com.br/wp-content/uploads/2025/02/1000220301-scaled.jpg",
    ]
  },
  // Pousada Cavalo Branco
  'emp_cabo_frio_pousada-cavalo-branco': { coverImage: "https://pub-0e522c26bcdf4aebb542b5fbc7453cd9.r2.dev/tenants/00000000-0000-4000-8000-000000000001/gallery/1779242218998-15aedb52-dca2-4ce6-99eb-23a6aea017d0.jpg",
    gallery: [
      "https://pub-0e522c26bcdf4aebb542b5fbc7453cd9.r2.dev/tenants/00000000-0000-4000-8000-000000000001/gallery/1779242222129-7943a5c1-cf34-4a5e-ada5-489dbf00ff1e.jpg",
      "https://pub-0e522c26bcdf4aebb542b5fbc7453cd9.r2.dev/tenants/00000000-0000-4000-8000-000000000001/gallery/1779242229921-duplo.jpg",
      "https://pub-0e522c26bcdf4aebb542b5fbc7453cd9.r2.dev/tenants/00000000-0000-4000-8000-000000000001/gallery/1779242234846-triplo.jpg",
      "https://pub-0e522c26bcdf4aebb542b5fbc7453cd9.r2.dev/tenants/00000000-0000-4000-8000-000000000001/gallery/1779242219537-4df704a8-79ed-44ab-8e15-8f2603b5dffd.jpg",
      "https://pub-0e522c26bcdf4aebb542b5fbc7453cd9.r2.dev/tenants/00000000-0000-4000-8000-000000000001/gallery/1779242218482-0941274c-520f-4282-bbf8-cc1cf0721dbd.jpg",
    ]
  },
  // Pousada Fernandes
  'emp_arraial_do_cabo_pousada-fernandes': { coverImage: "https://pub-3238dc7834d34038881c3fd9258ea818.r2.dev/quarto1.png",
    gallery: [
      "https://pub-3238dc7834d34038881c3fd9258ea818.r2.dev/quarto3.jpg",
      "https://pub-3238dc7834d34038881c3fd9258ea818.r2.dev/cafe1.jpg",
      "https://pub-3238dc7834d34038881c3fd9258ea818.r2.dev/cafe2.jpg",
      "https://pub-3238dc7834d34038881c3fd9258ea818.r2.dev/gastronomia.jpg",
      "https://pub-3238dc7834d34038881c3fd9258ea818.r2.dev/quarto4.jpg",
    ]
  },
  // Restaurante La Gare
  'emp_buzios_restaurante-la-gare': { coverImage: "https://irp.cdn-website.com/36307ba1/dms3rep/multi/opt/19_edited-1920w.jpg",
    gallery: [
      "https://irp.cdn-website.com/36307ba1/dms3rep/multi/opt/patio-1920w.jpg",
      "https://irp.cdn-website.com/36307ba1/dms3rep/multi/opt/hotel-boutique-em-buzios5--1024x716-1920w.jpg",
      "https://irp.cdn-website.com/36307ba1/dms3rep/multi/opt/GAStres-1920w.jpg",
      "https://irp.cdn-website.com/36307ba1/dms3rep/multi/opt/_MG_0634-1920w.jpg",
    ]
  },
  // Hotel Orla de Araruama
  'emp_araruama_hotel-orla-de-araruama': { coverImage: "https://static.wixstatic.com/media/3578f9_80904b584bb1455589a8db039d1e6d14~mv2.jpg",
    gallery: [
      "https://static.wixstatic.com/media/3578f9_fd8f739c64a64ac98b637b99a0a8eeb4~mv2.jpg",
      "https://static.wixstatic.com/media/3578f9_381ca3d7520f4f10ace75c7913d7989f~mv2.jpg",
      "https://static.wixstatic.com/media/3578f9_78b57a49b1c44572980c1f8350244a5e~mv2.jpg",
    ]
  },
  // Pousada Pontal da Ferradura
  'emp_buzios_pousada-pontal-da-ferradura': { coverImage: "https://static.wixstatic.com/media/212466_7b548b221948485bb84b1d0eed412488~mv2.jpg",
    gallery: [
      "https://static.wixstatic.com/media/831e06_116c75c249a840a29cd1044cd12a4bc4f000.jpg",
      "https://static.wixstatic.com/media/831e06_3c865cfc07684eb9a8f2aaa0a3d8aa4c~mv2.jpg",
    ]
  },
  // Primitivo Búzios
  'emp_buzios_primitivo-buzios': { coverImage: "https://primitivobuzios.com.br/wp-content/uploads/2025/07/Primitivo_Fachada_2.jpg",
    gallery: [
      "https://primitivobuzios.com.br/wp-content/uploads/2025/07/Ambientes_.jpg",
      "https://primitivobuzios.com.br/wp-content/uploads/2025/07/IMG_6732_edited.jpg",
      "https://primitivobuzios.com.br/wp-content/uploads/2025/07/Primitivo_Pizzas_54-2-scaled.jpg",
      "https://primitivobuzios.com.br/wp-content/uploads/2025/07/Filetto-al-tre-Funghi.jpg",
      "https://primitivobuzios.com.br/wp-content/uploads/2025/07/Gnocchi_Tratado_1.jpg",
    ]
  },
  // Silk Beach Club Búzios
  'emp_buzios_silk-beach-club-buzios': { coverImage: "https://www.silkbeachclub.com.br/assets/imagens/deckpraia/deck-praia-silk-beach-club-1920.webp",
    gallery: [
      "https://www.silkbeachclub.com.br/assets/imagens/fotos/foto-1-min2.jpg",
      "https://www.silkbeachclub.com.br/assets/imagens/fotos/foto-2-min.jpg",
      "https://www.silkbeachclub.com.br/assets/imagens/fotos/foto-3-min.jpg",
      "https://www.silkbeachclub.com.br/assets/imagens/fotos/foto-4-min.jpg",
    ]
  },
  // Tawa Beach
  'emp_buzios_tawa-beach': { coverImage: "https://static.wixstatic.com/media/481b70_79ecf39523634aa58e6ad45e74b1a927~mv2.jpg",
    gallery: [
      "https://static.wixstatic.com/media/481b70_0b28e1f2674c4f4d87654c880e554c90~mv2.jpeg",
      "https://static.wixstatic.com/media/481b70_0346fb0170aa4af28877bb06ed29df83~mv2.jpg",
    ]
  },
  // Vila d'este Búzios Hotel
  'emp_buzios_vila-d-este-buzios-hotel': { coverImage: "https://viladeste.com.br/wp-content/uploads/2023/02/Vila-deste-6-Reduzida-2x1-39.jpg",
    gallery: [
      "https://viladeste.com.br/wp-content/uploads/2023/02/Vila-deste-6-Reduzida-3x2-83.jpg",
      "https://viladeste.com.br/wp-content/uploads/2023/02/Vila-deste-6-Reduzida-3x2-126-1920x1080.jpg",
      "https://viladeste.com.br/wp-content/uploads/2023/02/Vila-deste-6-ALTA-3x2-14.jpg",
    ]
  },
  // Beach Club Ville La Plage
  'emp_buzios_beach-club-ville-la-plage': { coverImage: "https://beachclub.villelaplage.com.br/cac/wp-content/uploads/2026/05/Beach-Clube-54-1-scaled.jpg",
    gallery: [
      "https://beachclub.villelaplage.com.br/cac/wp-content/uploads/2026/05/Beach-Clube-51-scaled.jpg",
      "https://beachclub.villelaplage.com.br/cac/wp-content/uploads/2026/05/Beach-Clube-50-scaled.jpg",
      "https://beachclub.villelaplage.com.br/cac/wp-content/uploads/2026/05/Beach-Clube-24-scaled.jpg",
      "https://beachclub.villelaplage.com.br/cac/wp-content/uploads/2026/05/Beach-Clube-34-scaled.jpg",
      "https://beachclub.villelaplage.com.br/cac/wp-content/uploads/2026/05/Beach-Clube-17-scaled.jpg",
    ]
  },
};
