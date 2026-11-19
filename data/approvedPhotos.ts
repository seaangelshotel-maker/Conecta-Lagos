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
};
