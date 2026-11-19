/**
 * Fotos e correções de informação APROVADAS pelos donos (empresas) e fotos de licença aberta com crédito (lugares).
 * Endereços das imagens ficam nos sites de origem, não são cópias. O importador (Admin → Ecossistema →
 * Empresas em destaque) grava estes dados nas empresas ainda sem dono: só troca o que mudou.
 * Para tirar uma foto do ar, apague a linha daqui e edite a empresa no Admin.
 */
import type { BusinessProfile, ImageCredit } from '../types';

export interface ApprovedPhotos {
  coverImage?: string;
  gallery?: string[];
  /** Crédito da capa (fotos de licença aberta). */
  imageCredit?: ImageCredit;
  /** Correções/complementos de informação, cada campo com fonte conferida. */
  info?: Partial<Pick<BusinessProfile, 'description' | 'address' | 'phone' | 'whatsapp' | 'instagram' | 'website' | 'openingHours' | 'amenities' | 'bookingUrl' | 'deliveryUrl'>>;
}

export const APPROVED_PHOTOS: Record<string, ApprovedPhotos> = {
  "emp_cabo_frio_pousada-aguas-do-forte": {
    "coverImage": "https://www.pousadaaguasdoforte.com.br/wp-content/uploads/2015/10/IMG_3087.jpg",
    "gallery": [
      "https://www.pousadaaguasdoforte.com.br/wp-content/uploads/2015/10/Pousada-Aguas-do-Forte-20.jpg",
      "https://www.pousadaaguasdoforte.com.br/wp-content/uploads/2015/10/IMG_5095.jpg",
      "https://www.pousadaaguasdoforte.com.br/wp-content/uploads/2015/10/Pousada-Aguas-do-Forte-3.jpg",
      "https://www.pousadaaguasdoforte.com.br/wp-content/uploads/2015/10/Pousada-Aguas-do-Forte-16.jpg",
      "https://www.pousadaaguasdoforte.com.br/wp-content/uploads/2015/10/Pousada-Aguas-do-Forte-8.jpg",
      "https://www.pousadaaguasdoforte.com.br/wp-content/uploads/2017/01/slide4.jpg"
    ]
  },
  "emp_cabo_frio_pousada-areia-do-forte": {
    "coverImage": "https://pousadaareiadoforte.com.br/wp-content/uploads/elementor/thumbs/fachada-qwae950ue0wbk5w56rprvsy59v8x5zzl07ki9h9pic.jpg",
    "gallery": [
      "https://pousadaareiadoforte.com.br/wp-content/uploads/2025/01/AREIA-DO-FORTE-20.jpg",
      "https://pousadaareiadoforte.com.br/wp-content/uploads/2023/02/576195805.jpg",
      "https://pousadaareiadoforte.com.br/wp-content/uploads/2024/10/496328588.jpg",
      "https://pousadaareiadoforte.com.br/wp-content/uploads/2024/10/familia.jpg.webp",
      "https://pousadaareiadoforte.com.br/wp-content/uploads/elementor/thumbs/AREIA-DO-FORTE-19-r0e4g9odnwjb6emvpawgzrosrxa9a9kwb4952oua1w.jpg",
      "https://pousadaareiadoforte.com.br/wp-content/uploads/2023/02/373018923.jpg.webp"
    ]
  },
  "emp_arraial_do_cabo_pousada-arraial-inn": {
    "coverImage": "https://irp.cdn-website.com/6d1962e6/dms3rep/multi/opt/WhatsApp+Image+2024-07-02+at+16.54.23-2304w.jpeg",
    "gallery": [
      "https://irp.cdn-website.com/6d1962e6/dms3rep/multi/opt/C+%2811%29-2304w.jpg",
      "https://irp.cdn-website.com/6d1962e6/dms3rep/multi/opt/60-2304w.jpg",
      "https://irp.cdn-website.com/6d1962e6/dms3rep/multi/opt/100-ee471575-2304w.jpg",
      "https://irp.cdn-website.com/6d1962e6/dms3rep/multi/opt/WhatsApp+Image+2024-08-20+at+18.12.13-2304w.jpeg",
      "https://lirp.cdn-website.com/6d1962e6/dms3rep/multi/opt/1-b327a1e2-1920w.jpg",
      "https://irp.cdn-website.com/6d1962e6/dms3rep/multi/opt/70-2304w.jpg"
    ]
  },
  "emp_arraial_do_cabo_pousada-arraial-tropical": {
    "coverImage": "https://pousadaarraialtropical.com.br/assets/suite-hidro.jpg",
    "gallery": [
      "https://pousadaarraialtropical.com.br/assets/suite-premium.jpg",
      "https://pousadaarraialtropical.com.br/assets/suite-deluxe.jpg",
      "https://pousadaarraialtropical.com.br/assets/cafe-buffet-1.jpg",
      "https://pousadaarraialtropical.com.br/assets/hidro-banheira.jpg",
      "https://pousadaarraialtropical.com.br/assets/patio.jpg",
      "https://pousadaarraialtropical.com.br/assets/hero.jpg"
    ]
  },
  "emp_cabo_frio_pousada-brisa-do-forte": {
    "coverImage": "https://irp.cdn-website.com/e573b37b/dms3rep/multi/opt/WhatsApp-Image-2017-10-04-at-11.48.15-800h.jpeg",
    "gallery": [
      "https://irp.cdn-website.com/e573b37b/dms3rep/multi/opt/DSC_5045-1199x800-800h.jpg",
      "https://irp.cdn-website.com/e573b37b/dms3rep/multi/opt/DSC_5042-1199x800-800h.jpg",
      "https://irp.cdn-website.com/e573b37b/dms3rep/multi/opt/DSC_5012-1199x800-800h.jpg",
      "https://irp.cdn-website.com/e573b37b/dms3rep/multi/opt/IMG_9783-800h.jpg",
      "https://irp.cdn-website.com/e573b37b/dms3rep/multi/opt/DSC_5016-1199x800-800h.jpg",
      "https://irp.cdn-website.com/e573b37b/dms3rep/multi/opt/DSC_5009-1200x800-800h.jpg"
    ]
  },
  "8mbOtad5nxVNMThEZdu1": {
    "coverImage": "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/59ed3641f55345a7898acfb3fd36bea5.jpg",
    "gallery": [
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/bba8c051b8c9473aa21cec45bc6126f8.jpeg",
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/398cb58eb5d543f1a4435ffd5b4b4e4b.jpeg",
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/990df270ae6a41f8827d74a168a78012.jpg",
      "https://hweb-images.br-se1.magaluobjects.com/611283d03c667a50d0165792/af836564b63e4e0cbe99cfd0f2964d97.jpeg"
    ],
    "info": {
      "description": "Pousada no alto de uma pequena colina, a 80 metros da Praia Grande, em Arraial do Cabo, com jardins, vista da cidade e do mar e suítes que combinam conforto e bom gosto. As acomodações vão da Suíte Standard Plus às coberturas Master de 45 m², com varanda, ar-condicionado, frigobar, cofre, Wi-Fi e TV a cabo. A casa tem restaurante próprio, o Sol na Cozinha, com cardápio que muda e aposta nos frutos do mar da região. Fica a cerca de duas horas da capital fluminense, perto das praias e dunas que fazem de Arraial um dos cenários mais bonitos da Região dos Lagos.",
      "amenities": [
        "ac",
        "wifi",
        "tv"
      ]
    }
  },
  "emp_sao_pedro_da_aldeia_hotel-cave-do-sol": {
    "coverImage": "https://hotelcavedosol.com.br/wp-content/uploads/2025/07/13-scaled.png",
    "gallery": [
      "https://hotelcavedosol.com.br/wp-content/uploads/2025/07/426724807.jpg",
      "https://hotelcavedosol.com.br/wp-content/uploads/2025/07/282385679.jpg",
      "https://hotelcavedosol.com.br/wp-content/uploads/2025/07/287666830.jpg",
      "https://hotelcavedosol.com.br/wp-content/uploads/2025/07/20250322_085609-scaled.jpg",
      "https://hotelcavedosol.com.br/wp-content/uploads/2025/07/10-1.png",
      "https://hotelcavedosol.com.br/wp-content/uploads/2025/07/1-2.png"
    ]
  },
  "emp_arraial_do_cabo_chamos-hostel-cultural": {
    "coverImage": "https://i0.wp.com/chamoshostelcultural.com/wp-content/uploads/2023/11/image_50737409-1.jpg",
    "gallery": [
      "https://i0.wp.com/chamoshostelcultural.com/wp-content/uploads/2024/03/84D0F2C3-2722-48AA-A1C5-E452230F6E79-1-scaled.jpg",
      "https://i0.wp.com/chamoshostelcultural.com/wp-content/uploads/2026/02/WhatsApp-Image-2025-10-27-at-22.53.28.jpeg",
      "https://i0.wp.com/chamoshostelcultural.com/wp-content/uploads/2026/02/WhatsApp-Image-2026-02-21-at-8.25.05-PM.jpeg",
      "https://i0.wp.com/chamoshostelcultural.com/wp-content/uploads/2022/04/Imagens-13.png",
      "https://i0.wp.com/chamoshostelcultural.com/wp-content/uploads/2022/04/Imagens-14.png"
    ]
  },
  "emp_araruama_hotel-pousada-figueiredo": {
    "coverImage": "https://pousadafigueiredo.com/wp-content/uploads/2025/11/img-6672-845x684.jpg",
    "gallery": [
      "https://pousadafigueiredo.com/wp-content/uploads/2025/11/executivo-845x684.jpg",
      "https://pousadafigueiredo.com/wp-content/uploads/2025/11/cafe-da-manha.jpg",
      "https://pousadafigueiredo.com/wp-content/uploads/2025/09/img-20220303-wa0004-680x430.webp",
      "https://pousadafigueiredo.com/wp-content/uploads/2025/09/img-20220303-wa0037-680x430.webp",
      "https://pousadafigueiredo.com/wp-content/uploads/2025/09/2025-05-02-680x430.webp",
      "https://pousadafigueiredo.com/wp-content/uploads/2025/11/img-6673-845x684.jpg"
    ]
  },
  "emp_buzios_pousada-luzes-de-geriba": {
    "coverImage": "https://www.luzesdegeriba.com.br/assets/img/fotos/piscina-fachada.jpg",
    "gallery": [
      "https://www.luzesdegeriba.com.br/assets/img/fotos/chale-varanda.jpg",
      "https://www.luzesdegeriba.com.br/assets/img/fotos/jardim-piscina.jpg",
      "https://www.luzesdegeriba.com.br/assets/img/fotos/vista-aerea.jpg",
      "https://www.luzesdegeriba.com.br/assets/img/fotos/jardim-gramado.jpg",
      "https://www.luzesdegeriba.com.br/assets/img/fotos/piscina-deck.jpg"
    ]
  },
  "emp_cabo_frio_hotel-mar-de-cabo-frio": {
    "coverImage": "https://hotelmardecabofrio.com.br/wp-content/uploads/2023/09/IMG_3175-1080x675.jpg",
    "gallery": [
      "https://hotelmardecabofrio.com.br/wp-content/uploads/2023/09/20230831_114724-1080x675.jpg",
      "https://hotelmardecabofrio.com.br/wp-content/uploads/2023/09/20230831_132756-1080x675.jpg",
      "https://hotelmardecabofrio.com.br/wp-content/uploads/2023/09/20230831_114313-scaled.jpg",
      "https://hotelmardecabofrio.com.br/wp-content/uploads/2023/09/20230831_125203-scaled.jpg",
      "https://hotelmardecabofrio.com.br/wp-content/uploads/2023/09/20230831_121947-scaled.jpg"
    ]
  },
  "emp_buzios_pousada-mar-de-geriba": {
    "coverImage": "https://mardegeriba.com.br/img/hero.jpg",
    "gallery": [
      "https://mardegeriba.com.br/img/948d9df7.jpg",
      "https://mardegeriba.com.br/img/00e6b370.jpg",
      "https://mardegeriba.com.br/img/ce1e10aa.jpg",
      "https://mardegeriba.com.br/img/0fb37311.jpg",
      "https://mardegeriba.com.br/img/27b58f90.jpg",
      "https://mardegeriba.com.br/img/a594f5a8.jpg"
    ]
  },
  "Efp75piLz0FZvNyprlvD": {
    "coverImage": "https://pousadadaprainha.com/wp-content/uploads/2026/02/PISCINA.jpg",
    "gallery": [
      "https://pousadadaprainha.com/wp-content/uploads/2026/02/PISCINA-2.jpg",
      "https://pousadadaprainha.com/wp-content/uploads/2023/10/WhatsApp-Image-2023-10-16-at-15.13.56.jpeg",
      "https://pousadadaprainha.com/wp-content/uploads/2026/02/sala-de-estar-Copia.jpg",
      "https://pousadadaprainha.com/wp-content/uploads/2023/07/WhatsApp-Image-2023-07-13-at-10.31.51.jpeg",
      "https://pousadadaprainha.com/wp-content/uploads/2023/07/WhatsApp-Image-2023-07-13-at-10.31.05-2.jpeg"
    ],
    "info": {
      "description": "Pousada de pátio interno com piscina ao ar livre (de 1,05 m a 1,30 m de profundidade), na Prainha, em Arraial do Cabo, perto de uma das praias mais procuradas da cidade. As suítes têm ar-condicionado e Wi-Fi gratuito, e a casa oferece mesa de bilhar e atendimento em português, espanhol e inglês. Animais de estimação são aceitos mediante pedido, com possível custo adicional. Fica na Rua Pastor Admardo Machado, 90 (antiga Rua D), no bairro da Prainha.",
      "amenities": [
        "ac",
        "wifi",
        "pool",
        "pet"
      ],
      "address": "Rua Pastor Admardo Machado, 90 (antiga Rua D) - Prainha, Arraial do Cabo - RJ, 28930-000",
      "phone": "(22) 2622-2512"
    }
  },
  "emp_buzios_pousada-praia-joao-fernandes": {
    "coverImage": "https://irp.cdn-website.com/6e5f4ac6/dms3rep/multi/opt/NIK_0279-1beaa3df-2304w.jpg",
    "gallery": [
      "https://irp.cdn-website.com/6e5f4ac6/dms3rep/multi/opt/NIK_0257-2304w.jpg",
      "https://irp.cdn-website.com//6e5f4ac6/dms3rep/multi/opt/f7fc12dd5ac08e9e2ff24bb852b96b2a-2304w.jpg",
      "https://irp.cdn-website.com/6e5f4ac6/dms3rep/multi/opt/DSC_6824-Modf-Baixa-2304w.jpg",
      "https://irp.cdn-website.com/6e5f4ac6/dms3rep/multi/opt/DSC_3321-2304w.jpg",
      "https://irp.cdn-website.com/6e5f4ac6/dms3rep/multi/opt/DSC_6733-mod-Baixa-dc95289f-2304w.jpg",
      "https://irp.cdn-website.com//6e5f4ac6/dms3rep/multi/opt/9a87b8a1b566759d0d8997d55daa4c7d+%282%29-1152w.jpg"
    ]
  },
  "emp_buzios_victtorio-pizzaria-forneria": {
    "coverImage": "https://victtorio.com.br/wp-content/uploads/2022/07/Victtorio_elloestudiocriativo-4.jpg",
    "gallery": [
      "https://victtorio.com.br/wp-content/uploads/2022/07/Victtorio_elloestudiocriativo-8.jpg",
      "https://victtorio.com.br/wp-content/uploads/2022/07/Victtorio_elloestudiocriativo-6.jpg",
      "https://victtorio.com.br/wp-content/uploads/2022/07/Victtorio_elloestudiocriativo-7.jpg",
      "https://victtorio.com.br/wp-content/uploads/2022/07/Adega.png",
      "https://victtorio.com.br/wp-content/uploads/2022/07/Victtorio-3.png"
    ]
  },
  "emp_buzios_pousada-villa-raphael": {
    "coverImage": "https://villaraphael.com.br/wp-content/uploads/2026/01/UH18-12-1.jpg",
    "gallery": [
      "https://villaraphael.com.br/wp-content/uploads/2026/01/UH18-9-1.jpg",
      "https://villaraphael.com.br/wp-content/uploads/2026/01/UH18-3-1.jpg",
      "https://villaraphael.com.br/wp-content/uploads/2026/01/UH18-5-1.jpg",
      "https://villaraphael.com.br/wp-content/uploads/2026/01/Areas-comuns-Villa-4.jpg",
      "https://villaraphael.com.br/wp-content/uploads/2026/01/Ambientes-diaVR-9.jpg",
      "https://villaraphael.com.br/wp-content/uploads/2026/01/Ambientes-Noturnos-7.jpg"
    ]
  },
  "emp_buzios_xerelete-bar-e-restaurante": {
    "coverImage": "https://xereletebar.com/wp-content/uploads/2026/03/Xerelete-bar-restaurante-em-buzios-orla-bardot-5-scaled.jpg",
    "gallery": [
      "https://xereletebar.com/wp-content/uploads/2026/03/cardapio-xerelete-restaurante-em-buzios-5.jpg",
      "https://xereletebar.com/wp-content/uploads/elementor/thumbs/eventos-em-buzios-xerelete-bar-restaurante-7-e1774572676591-rl3nwk6ztkpszvhmvtk35esxhegj06sf5xfqnltzr4.jpg",
      "https://xereletebar.com/wp-content/uploads/2026/03/cardapio-xerelete-restaurante-em-buzios-7-scaled.jpg",
      "https://xereletebar.com/wp-content/uploads/2026/03/cardapio-xerelete-restaurante-em-buzios-3.jpg",
      "https://xereletebar.com/wp-content/uploads/2026/03/cardapio-xerelete-restaurante-em-buzios-1.jpg",
      "https://xereletebar.com/wp-content/uploads/2026/03/xerelete-restaurante-em-buzios-orla-bardot-2-scaled.jpg"
    ]
  },
  "emp_cabo_frio_passagem-altto-sushi": {
    "coverImage": "https://passagemalttosushi.com.br/wp-content/uploads/2026/03/dobra_3.webp",
    "gallery": [
      "https://passagemalttosushi.com.br/wp-content/uploads/2026/03/sushi_sashimi.webp",
      "https://passagemalttosushi.com.br/wp-content/uploads/2026/03/rolls_especiais.webp",
      "https://passagemalttosushi.com.br/wp-content/uploads/2026/03/pratos_quentes.webp",
      "https://passagemalttosushi.com.br/wp-content/uploads/2026/03/sobremesas.webp"
    ]
  },
  "emp_buzios_restaurante-anexo-praia-buzios": {
    "coverImage": "https://anexopraiabuzios.com.br/wp-content/uploads/2024/04/Ambiente.jpg",
    "gallery": []
  },
  "emp_araruama_belisque-restaurante-e-choperia": {
    "coverImage": "https://www.belisque.com.br/assets/img/estrutura-belisque/selecionada-8539-1280.webp",
    "gallery": [
      "https://www.belisque.com.br/assets/img/estrutura-belisque/selecionada-8128-1280.webp",
      "https://www.belisque.com.br/assets/img/estrutura-belisque/selecionada-8130-1280.webp",
      "https://www.belisque.com.br/assets/img/Picanha-Grill-Belisque.jpg",
      "https://www.belisque.com.br/assets/img/estrutura-belisque/prato-7857-640.webp",
      "https://www.belisque.com.br/assets/img/Happy-hour-praia-do-paraiso-2.jpg"
    ]
  },
  "emp_cabo_frio_pousada-cambuca-de-cabo-frio": {
    "coverImage": "https://pousadacambuca.tur.br/wp-content/uploads/2021/09/ca2.png",
    "gallery": [
      "https://pousadacambuca.tur.br/wp-content/uploads/2021/09/ca.png",
      "https://pousadacambuca.tur.br/wp-content/uploads/2021/09/pousada-cambuca-de-cabo-9.png"
    ]
  },
  "emp_buzios_casablanca-buzios": {
    "coverImage": "https://casablancabuzios.com.br/wp-content/uploads/2025/02/ambiente-CB-1.jpg",
    "gallery": [
      "https://casablancabuzios.com.br/wp-content/uploads/2025/02/2-20240903_154240.png",
      "https://casablancabuzios.com.br/wp-content/uploads/2025/02/IMG_2710.png",
      "https://casablancabuzios.com.br/wp-content/uploads/2025/02/1000220301-scaled.jpg"
    ]
  },
  "emp_cabo_frio_pousada-cavalo-branco": {
    "coverImage": "https://pub-0e522c26bcdf4aebb542b5fbc7453cd9.r2.dev/tenants/00000000-0000-4000-8000-000000000001/gallery/1779242218998-15aedb52-dca2-4ce6-99eb-23a6aea017d0.jpg",
    "gallery": [
      "https://pub-0e522c26bcdf4aebb542b5fbc7453cd9.r2.dev/tenants/00000000-0000-4000-8000-000000000001/gallery/1779242222129-7943a5c1-cf34-4a5e-ada5-489dbf00ff1e.jpg",
      "https://pub-0e522c26bcdf4aebb542b5fbc7453cd9.r2.dev/tenants/00000000-0000-4000-8000-000000000001/gallery/1779242229921-duplo.jpg",
      "https://pub-0e522c26bcdf4aebb542b5fbc7453cd9.r2.dev/tenants/00000000-0000-4000-8000-000000000001/gallery/1779242234846-triplo.jpg",
      "https://pub-0e522c26bcdf4aebb542b5fbc7453cd9.r2.dev/tenants/00000000-0000-4000-8000-000000000001/gallery/1779242219537-4df704a8-79ed-44ab-8e15-8f2603b5dffd.jpg",
      "https://pub-0e522c26bcdf4aebb542b5fbc7453cd9.r2.dev/tenants/00000000-0000-4000-8000-000000000001/gallery/1779242218482-0941274c-520f-4282-bbf8-cc1cf0721dbd.jpg"
    ]
  },
  "emp_arraial_do_cabo_pousada-fernandes": {
    "coverImage": "https://pub-3238dc7834d34038881c3fd9258ea818.r2.dev/quarto1.png",
    "gallery": [
      "https://pub-3238dc7834d34038881c3fd9258ea818.r2.dev/quarto3.jpg",
      "https://pub-3238dc7834d34038881c3fd9258ea818.r2.dev/cafe1.jpg",
      "https://pub-3238dc7834d34038881c3fd9258ea818.r2.dev/cafe2.jpg",
      "https://pub-3238dc7834d34038881c3fd9258ea818.r2.dev/gastronomia.jpg",
      "https://pub-3238dc7834d34038881c3fd9258ea818.r2.dev/quarto4.jpg"
    ]
  },
  "emp_buzios_restaurante-la-gare": {
    "coverImage": "https://irp.cdn-website.com/36307ba1/dms3rep/multi/opt/19_edited-1920w.jpg",
    "gallery": [
      "https://irp.cdn-website.com/36307ba1/dms3rep/multi/opt/patio-1920w.jpg",
      "https://irp.cdn-website.com/36307ba1/dms3rep/multi/opt/hotel-boutique-em-buzios5--1024x716-1920w.jpg",
      "https://irp.cdn-website.com/36307ba1/dms3rep/multi/opt/GAStres-1920w.jpg",
      "https://irp.cdn-website.com/36307ba1/dms3rep/multi/opt/_MG_0634-1920w.jpg"
    ]
  },
  "emp_araruama_hotel-orla-de-araruama": {
    "coverImage": "https://static.wixstatic.com/media/3578f9_80904b584bb1455589a8db039d1e6d14~mv2.jpg",
    "gallery": [
      "https://static.wixstatic.com/media/3578f9_fd8f739c64a64ac98b637b99a0a8eeb4~mv2.jpg",
      "https://static.wixstatic.com/media/3578f9_381ca3d7520f4f10ace75c7913d7989f~mv2.jpg",
      "https://static.wixstatic.com/media/3578f9_78b57a49b1c44572980c1f8350244a5e~mv2.jpg"
    ]
  },
  "emp_buzios_pousada-pontal-da-ferradura": {
    "coverImage": "https://static.wixstatic.com/media/212466_7b548b221948485bb84b1d0eed412488~mv2.jpg",
    "gallery": [
      "https://static.wixstatic.com/media/831e06_116c75c249a840a29cd1044cd12a4bc4f000.jpg",
      "https://static.wixstatic.com/media/831e06_3c865cfc07684eb9a8f2aaa0a3d8aa4c~mv2.jpg"
    ]
  },
  "emp_buzios_primitivo-buzios": {
    "coverImage": "https://primitivobuzios.com.br/wp-content/uploads/2025/07/Primitivo_Fachada_2.jpg",
    "gallery": [
      "https://primitivobuzios.com.br/wp-content/uploads/2025/07/Ambientes_.jpg",
      "https://primitivobuzios.com.br/wp-content/uploads/2025/07/IMG_6732_edited.jpg",
      "https://primitivobuzios.com.br/wp-content/uploads/2025/07/Primitivo_Pizzas_54-2-scaled.jpg",
      "https://primitivobuzios.com.br/wp-content/uploads/2025/07/Filetto-al-tre-Funghi.jpg",
      "https://primitivobuzios.com.br/wp-content/uploads/2025/07/Gnocchi_Tratado_1.jpg"
    ]
  },
  "emp_buzios_silk-beach-club-buzios": {
    "coverImage": "https://www.silkbeachclub.com.br/assets/imagens/deckpraia/deck-praia-silk-beach-club-1920.webp",
    "gallery": [
      "https://www.silkbeachclub.com.br/assets/imagens/fotos/foto-1-min2.jpg",
      "https://www.silkbeachclub.com.br/assets/imagens/fotos/foto-2-min.jpg",
      "https://www.silkbeachclub.com.br/assets/imagens/fotos/foto-3-min.jpg",
      "https://www.silkbeachclub.com.br/assets/imagens/fotos/foto-4-min.jpg"
    ]
  },
  "emp_buzios_tawa-beach": {
    "coverImage": "https://static.wixstatic.com/media/481b70_79ecf39523634aa58e6ad45e74b1a927~mv2.jpg",
    "gallery": [
      "https://static.wixstatic.com/media/481b70_0b28e1f2674c4f4d87654c880e554c90~mv2.jpeg",
      "https://static.wixstatic.com/media/481b70_0346fb0170aa4af28877bb06ed29df83~mv2.jpg"
    ]
  },
  "emp_buzios_vila-d-este-buzios-hotel": {
    "coverImage": "https://viladeste.com.br/wp-content/uploads/2023/02/Vila-deste-6-Reduzida-2x1-39.jpg",
    "gallery": [
      "https://viladeste.com.br/wp-content/uploads/2023/02/Vila-deste-6-Reduzida-3x2-83.jpg",
      "https://viladeste.com.br/wp-content/uploads/2023/02/Vila-deste-6-Reduzida-3x2-126-1920x1080.jpg"
    ]
  },
  "emp_buzios_beach-club-ville-la-plage": {
    "coverImage": "https://beachclub.villelaplage.com.br/cac/wp-content/uploads/2026/05/Beach-Clube-54-1-scaled.jpg",
    "gallery": [
      "https://beachclub.villelaplage.com.br/cac/wp-content/uploads/2026/05/Beach-Clube-51-scaled.jpg",
      "https://beachclub.villelaplage.com.br/cac/wp-content/uploads/2026/05/Beach-Clube-50-scaled.jpg",
      "https://beachclub.villelaplage.com.br/cac/wp-content/uploads/2026/05/Beach-Clube-24-scaled.jpg",
      "https://beachclub.villelaplage.com.br/cac/wp-content/uploads/2026/05/Beach-Clube-34-scaled.jpg",
      "https://beachclub.villelaplage.com.br/cac/wp-content/uploads/2026/05/Beach-Clube-17-scaled.jpg"
    ]
  },
  "emp_araruama_pousada-algodao-da-praia": {
    "coverImage": "https://pousadaalgodaodapraia.com.br/wp-content/uploads/2023/01/DJI_0253-1.jpg",
    "gallery": [
      "https://pousadaalgodaodapraia.com.br/wp-content/uploads/2022/10/RB102288.jpg",
      "https://pousadaalgodaodapraia.com.br/wp-content/uploads/2022/10/RB108868.jpg",
      "https://pousadaalgodaodapraia.com.br/wp-content/uploads/2021/09/home_suite_dupla.png",
      "https://pousadaalgodaodapraia.com.br/wp-content/uploads/2022/03/WhatsApp-Image-2022-03-15-at-16.22.24.jpeg",
      "https://pousadaalgodaodapraia.com.br/wp-content/uploads/2021/10/play03.png"
    ],
    "info": {
      "description": "Pousada de vista panorâmica para a Lagoa de Araruama, na Praia dos Amores, com atendimento personalizado e clima acolhedor. Os ambientes têm decoração rústica-elegante integrada à natureza e são cercados por jardins. Além dos quartos, há o restaurante Flor da Lagoa, piscina com churrasqueira, estacionamento privativo, café da manhã e sala para reuniões e eventos.",
      "amenities": [
        "pool",
        "parking",
        "breakfast"
      ]
    }
  },
  "emp_cabo_frio_apreciatta-pizzaria": {
    "info": {
      "description": "Pizzaria com unidades em Cabo Frio e São Pedro da Aldeia, que construiu um público fiel nas redes e trabalha com salão, mesas externas e entrega à noite. A unidade de Cabo Frio fica na Avenida Júlia Kubitschek, no Centro, e não aceita reservas. O cardápio completo está disponível no link da bio do Instagram oficial, @apreciattabr.",
      "amenities": [
        "delivery"
      ],
      "address": "Av. Júlia Kubitschek, 26 - Centro, Cabo Frio - RJ, 28905-000",
      "phone": "(22) 2648-1178",
      "instagram": "https://www.instagram.com/apreciattabr"
    }
  },
  "emp_cabo_frio_arcos-do-canal": {
    "coverImage": "https://arcosdocanal.com.br/wp-content/uploads/2026/03/arcos_do_canal-1.webp",
    "gallery": [
      "https://arcosdocanal.com.br/wp-content/uploads/2026/03/Polvo.webp",
      "https://arcosdocanal.com.br/wp-content/uploads/2026/03/camarao.webp",
      "https://arcosdocanal.com.br/wp-content/uploads/2026/03/peixa_da_ilha_fil_de_namorado.webp",
      "https://arcosdocanal.com.br/wp-content/uploads/2026/03/frame_82.webp",
      "https://arcosdocanal.com.br/wp-content/uploads/2026/03/drrinks.webp",
      "https://arcosdocanal.com.br/wp-content/uploads/2026/03/petit_gateau_artesanal.webp"
    ],
    "info": {
      "description": "Restaurante de gastronomia contemporânea no ponto alto da Passagem, o bairro histórico de Cabo Frio, com vista do canal e pôr do sol como cenário. A cozinha parte do frescor do mar e de ingredientes locais, com pratos como polvo, camarão e peixe do dia (filé de namorado), além de drinks e sobremesas como o petit gâteau artesanal. Abre todos os dias, do almoço até a meia-noite, na Rua Constantino Menelau, a poucos passos do Canal do Itajuru.",
      "amenities": [],
      "address": "Rua Constantino Menelau, 240 - Passagem, Cabo Frio - RJ",
      "whatsapp": "(22) 99792-4417",
      "openingHours": {
        "Domingo": "12:00 - 00:00",
        "Segunda": "12:00 - 00:00",
        "Terça": "12:00 - 00:00",
        "Quarta": "12:00 - 00:00",
        "Quinta": "12:00 - 00:00",
        "Sexta": "12:00 - 00:00",
        "Sábado": "12:00 - 00:00"
      }
    }
  },
  "emp_arraial_do_cabo_pousada-arraial-caribe": {
    "coverImage": "https://www.pousadaarraialcaribe.com.br/wp-content/uploads/2022/12/frente-AC.jpg",
    "gallery": [
      "https://www.pousadaarraialcaribe.com.br/wp-content/uploads/2022/12/image4.jpg",
      "https://www.pousadaarraialcaribe.com.br/wp-content/uploads/2022/12/fundo.jpg",
      "https://www.pousadaarraialcaribe.com.br/wp-content/uploads/2022/12/cafe.jpg",
      "https://www.pousadaarraialcaribe.com.br/wp-content/uploads/2022/12/area-externa-AC.jpg"
    ],
    "info": {
      "description": "Pousada no canto da Baleia, na ponta direita da Praia dos Anjos, em frente à Marinha do Brasil, numa área segura e tranquila a poucos minutos do Centro Histórico e do ponto de saída dos passeios de barco. Tem ambiente familiar e Wi-Fi gratuito em toda a propriedade. O café da manhã é buffet diário, com frutas da estação, pães, frios, cereais, sucos, tapioca, ovos e misto quente. A rodoviária fica a cerca de 15 minutos a pé.",
      "amenities": [
        "wifi",
        "breakfast"
      ],
      "address": "Praia dos Anjos (Canto da Baleia), Arraial do Cabo - RJ"
    }
  },
  "emp_arraial_do_cabo_astral-beach-food": {
    "info": {
      "description": "Cozinha de praia com cara de alimento para a alma salgada: poke, sushi grande, burritos e hambúrgueres, com opções veganas no cardápio. Em Arraial do Cabo, funciona em loja e também por delivery e retirada, com pedidos pelo site e pelo WhatsApp.",
      "amenities": [
        "delivery"
      ],
      "instagram": "https://www.instagram.com/astralbeach.food",
      "website": "https://astralbeach.com.br"
    }
  },
  "emp_cabo_frio_bar-e-restaurante-mane-paixao": {
    "info": {
      "description": "Boteco clássico do Largo de São Benedito, na Passagem, em Cabo Frio, lembrado nos guias de viagem pela comida de botequim bem-feita e pelos escondidinhos servidos na telha. Ponto tradicional da região, bom para um almoço sem cerimônia ou um petisco no fim da tarde, perto das ruas de paralelepípedo do bairro.",
      "amenities": [],
      "address": "Largo de São Benedito - Passagem, Cabo Frio - RJ"
    }
  },
  "emp_arraial_do_cabo_brisa-dos-anjos-suites": {
    "info": {
      "description": "Suítes na Rua Benjamin Constant, no centro de Arraial do Cabo, a poucos minutos a pé da Praia dos Anjos, do estádio e do comércio local. Os quartos têm ar-condicionado e banheiro privativo, e a casa é conhecida entre os hóspedes pelo atendimento próximo do proprietário e pelo café da manhã simples e caprichado. Boa opção para quem quer conforto sem pagar por estrutura de resort.",
      "amenities": [],
      "address": "Rua Benjamin Constant, 98 - Centro, Arraial do Cabo - RJ, 28930-000",
      "whatsapp": "(22) 99803-9049"
    }
  },
  "emp_buzios_buzios-beach-resort": {
    "coverImage": "https://wamhoteis.com.br/wp-content/uploads/2025/08/EmdpHLRQ.webp",
    "gallery": [
      "https://wamhoteis.com.br/wp-content/uploads/2025/07/916573.webp",
      "https://wamhoteis.com.br/wp-content/uploads/2025/07/DSC03664-scaled.jpg",
      "https://wamhoteis.com.br/wp-content/uploads/2025/08/Centro-de-Convencoes-Auditorio-scaled.webp",
      "https://wamhoteis.com.br/wp-content/uploads/2025/07/DSC03730-scaled.jpg"
    ],
    "info": {
      "description": "Resort de frente para a Praia de Tucuns, de ondas calmas, inaugurado em 2010 com 379 apartamentos distribuídos em vilas. A estrutura inclui duas piscinas, quatro bares, restaurante principal, o italiano Mamma Mia, sala de jogos, academia, quadras de areia e poliesportiva, mini golfe e boliche. É um resort pensado para ficar o dia inteiro no hotel, com alimentação e lazer no mesmo lugar, a cerca de 15 minutos de carro da Rua das Pedras.",
      "amenities": [
        "pool",
        "bar"
      ],
      "address": "Av. dos Tucuns (Rua das Dunas), s/n - Praia de Tucuns, Búzios - RJ, 28950-000"
    }
  },
  "emp_arraial_do_cabo_calamares": {
    "info": {
      "description": "Beach club e restaurante de frente para a Praia Grande, em Arraial do Cabo, conhecido pelo pôr do sol e pelo ambiente animado, com música ao vivo, petiscos, drinks e cardápio de frutos do mar. Funciona com mesas e espreguiçadeiras na areia, ideal para ficar o fim de tarde inteiro. Fica na Avenida Litorânea.",
      "amenities": [],
      "address": "Avenida Litorânea - Praia Grande, Arraial do Cabo - RJ"
    }
  },
  "emp_arraial_do_cabo_casa-da-piedra": {
    "info": {
      "address": "R. Santa Cruz, 4 - Praia dos Anjos, Arraial do Cabo - RJ, 28930-000",
      "deliveryUrl": "https://casadapiedra.ola.click",
      "instagram": "https://www.instagram.com/casadapiedra"
    }
  },
  "emp_buzios_casas-brancas-boutique-hotel-spa": {
    "coverImage": "https://images3.motor-reserva.com.br/curl/storage/5518/202409241727196045ohotel1.jpg",
    "gallery": [
      "https://images3.motor-reserva.com.br/curl/storage/5518/202409131726232791topo3.jpg",
      "https://images3.motor-reserva.com.br/curl/storage/5518/202409131726232791topo1.1.jpg",
      "https://images3.motor-reserva.com.br/curl/storage/5518/202409131726232951mobile2.jpg",
      "https://images3.motor-reserva.com.br/curl/storage/5518/202602191771508143Prancheta6c%C3%B3pia2100.jpg",
      "https://images3.motor-reserva.com.br/curl/storage/5518/202602191771508143Prancheta3100.jpg"
    ],
    "info": {
      "description": "Hotel em encosta de frente para a Baía da Armação, em Búzios, que começou em 1974 como uma pousada de 4 quartos e hoje tem 33 acomodações em 9 categorias, de arquitetura de inspiração mediterrânea. Entre elas está The Loft, cobertura de 160 m² com varanda panorâmica, e The Suíte, com piscina compacta no interior. O hotel tem restaurantes, spa, academia, recepção 24 horas e equipe multilíngue. Fica no Alto do Humaitá, a uma caminhada curta da Orla Bardot.",
      "amenities": [
        "ac"
      ],
      "address": "Alto do Humaitá, 10 - Centro, Búzios - RJ, 28950-000"
    }
  },
  "emp_buzios_cliffside-luxury-inn": {
    "coverImage": "https://static.wixstatic.com/media/c05cf9_bc036982c25347d8b77ce52157cfe72d~mv2.jpg",
    "gallery": [
      "https://static.wixstatic.com/media/c05cf9_fd208d70565e40158c5f5c6ee34b524f~mv2.jpg",
      "https://static.wixstatic.com/media/c05cf9_853f17aef56e4e44b97450a548626636~mv2.jpg",
      "https://static.wixstatic.com/media/c05cf9_02dec56fad914894b0658723a29b1737~mv2.jpg",
      "https://static.wixstatic.com/media/c05cf9_adbdcd2bd03d44ca83e85cbee5d15641~mv2.jpg",
      "https://static.wixstatic.com/media/c05cf9_486f5031df43493fb8a26ecbfea552c4~mv2.jpg",
      "https://static.wixstatic.com/media/c05cf9_1bffcc2a8e9f468f8d07e930f45a4cf4~mv2.jpg"
    ],
    "info": {
      "description": "Vila de vidro sobre um penhasco, projetada pelo arquiteto Otávio Raja Gabaglia, onde de qualquer ambiente se vê o mar e se ouve as ondas quebrando. A decoração em estilo brasileiro, com muita cor, é assinada por Emery de Lima Fata. A piscina de borda infinita fica à beira da falésia, e é ali que o café da manhã é servido todos os dias. Uma hospedagem de poucos quartos, pensada para quem quer privacidade, luxo e vista aberta para o oceano em Búzios.",
      "amenities": [
        "pool",
        "breakfast"
      ]
    }
  },
  "emp_sao_pedro_da_aldeia_pousada-enseada-das-garcas": {
    "coverImage": "https://www.enseadadasgarcas.com.br/arquivos/imagens/WEB6-8d34485-3e62ae303a0c3777f3f75837571.jpg",
    "gallery": [
      "https://www.enseadadasgarcas.com.br/arquivos/imagens/1web-532c9d9-244cf4e9991c63a0a3cb5a12812.jpg",
      "https://www.enseadadasgarcas.com.br/arquivos/imagens/Enseada-das--cedaa59f64452ce1df370e5ff90.jpg",
      "https://www.enseadadasgarcas.com.br/arquivos/imagens/fundo-7e1952-d24c3f9a04aa1459ace09627be2.jpg"
    ],
    "info": {
      "description": "Pousada em cores mediterrâneas, numa colina de São Pedro da Aldeia, de onde a vista da varanda dos bangalôs e da borda da piscina alcança ilhas, salinas, praias desertas e as cidades vizinhas. A proposta é o descanso, com decoração de bom gosto, boa gastronomia e passeio de traineira. Fica na Rua José Costa, 1088, Ponta da Areia, a cerca de 13 km de Cabo Frio, 22 km de Arraial do Cabo e 26 km de Búzios.",
      "amenities": [
        "pool"
      ],
      "address": "Rua José Costa, 1088 - Ponta da Areia, São Pedro da Aldeia - RJ",
      "phone": "(22) 2627-0007"
    }
  },
  "emp_buzios_hotel-experience-joao-fernandes": {
    "coverImage": "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/vista-aerea-10-1024x576-1-1.jpg",
    "gallery": [
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/Piscina-33-768x512-1.jpg",
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/standard-1-768x512-1.jpg",
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/standard-2-quartos-48-768x512-1.jpg",
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/suite-master-139-1024x683.jpg",
      "https://experiencejoaofernandes.com.br/wp-content/uploads/2026/07/HEJF-OSSOS-1024x576-1.jpg"
    ],
    "info": {
      "description": "Hotel a 100 metros da Praia de João Fernandes, por um caminho plano e fácil, pensado para viajar em família. Tem piscinas aquecidas abertas das 9h às 22h, área kids monitorada, sala de games, academia e restaurante à la carte. Fica a 900 m da Praia dos Ossos, 1,2 km da Rua das Pedras e 2,3 km da rodoviária de Búzios, uma boa base para quem quer praia sem depender de carro o tempo todo.",
      "amenities": [
        "pool",
        "kids"
      ],
      "address": "Rua Um, s/n, lotes 24, 25 e 26 - Praia de João Fernandes, Búzios - RJ, 28950-000"
    }
  },
  "emp_cabo_frio_galapagos": {
    "info": {
      "description": "Restaurante instalado num casarão colonial no Largo de São Benedito, o coração histórico da Passagem, bem em frente à igreja branca do século XVII. A cozinha é internacional e criativa, com pratos como peixe grelhado com alecrim e maracujá, risoto de camarão com aspargos e polvo reinterpretado. As mesas ao ar livre são charmosas e a casa é presença certa nos roteiros gastronômicos de Cabo Frio; reservar é recomendável.",
      "amenities": [],
      "address": "Largo de São Benedito, 11 - Passagem, Cabo Frio - RJ, 28906-340",
      "phone": "(22) 2643-4097"
    }
  },
  "emp_saquarema_hotel-aconchego-da-vila": {
    "info": {
      "description": "Hotel recém-reformado na orla da Praia da Vila, em Saquarema, a poucos passos da Vila e do Canhão. Tem piscina com vista para o mar, terraço, bar e estacionamento privativo, e os quartos têm ar-condicionado. Os hóspedes elogiam o café da manhã, a localização e os quartos com vista para o mar. Fica na Avenida Ministro Salgado Filho, 340.",
      "amenities": [],
      "address": "Avenida Ministro Salgado Filho, 340 - Praia da Vila, Saquarema - RJ, 28990-000"
    }
  },
  "emp_buzios_insolito-boutique-hotel-spa": {
    "coverImage": "https://insolitohotel.com/wp-content/uploads/2025/04/DJI_20250221182508_0533_D-1-1.jpg",
    "gallery": [
      "https://insolitohotel.com/wp-content/uploads/2025/12/suites-e-acomodacoes.webp",
      "https://insolitohotel.com/wp-content/uploads/2025/12/insolito-com-piscina-1.webp",
      "https://insolitohotel.com/wp-content/uploads/2025/12/insolito-1.webp",
      "https://insolitohotel.com/wp-content/uploads/2025/12/master-1.webp",
      "https://insolitohotel.com/wp-content/uploads/2025/02/superior-1.webp",
      "https://insolitohotel.com/wp-content/uploads/2025/02/classic.webp"
    ],
    "info": {
      "description": "Hotel boutique de frente para a Praia da Ferradura, em Búzios, com praia e piscina privativas e suítes de vistas panorâmicas. Cada ala tem um tema ligado à cultura brasileira: há suítes Classic na Ala Terra Brasil e na Casa de Fotografia e Literatura, Master na Casa da Música e Deluxe de cerca de 40 m². Algumas suítes têm piscina própria. A propriedade é cheia de obras de arte e mobiliário exclusivo, e o hotel tem restaurante e centro de bem-estar (Wellness). Ideal para quem quer sossego, privacidade e atendimento personalizado.",
      "amenities": [
        "pool"
      ]
    }
  },
  "emp_buzios_mistico-restaurant": {
    "info": {
      "description": "Restaurante do Abracadabra Boutique Hotel, no alto do Morro do Humaitá, com vista panorâmica sobre o centro de Búzios e a praia. A cozinha autoral e contemporânea é assinada pelo chef Sávio Freitas, que trabalha ingredientes brasileiros e sazonais, e a casa costuma promover menus especiais e almoços temáticos. Reserva recomendada.",
      "amenities": [],
      "address": "Rua Alto do Humaitá, 13 - Morro do Humaitá, Armação dos Búzios - RJ",
      "phone": "(22) 2623-1217",
      "website": "https://www.abracadabrahotel.com.br"
    }
  },
  "emp_cabo_frio_malibu-palace-hotel": {
    "coverImage": "https://www.malibupalace.com.br/pluginAppObj/pluginAppObj_45/hot1.jpg",
    "gallery": [
      "https://www.malibupalace.com.br/pluginAppObj/pluginAppObj_46/aco1.jpg",
      "https://www.malibupalace.com.br/pluginAppObj/pluginAppObj_47/ser1.jpg",
      "https://www.malibupalace.com.br/images/slider1.jpg",
      "https://www.malibupalace.com.br/images/slider2.jpg"
    ],
    "info": {
      "description": "Hotel de frente para a Praia do Forte, a mais conhecida de Cabo Frio, com acomodações, restaurante, área de lazer e salões para convenções e eventos. A proposta é servir tanto a quem vem passar o fim de semana, feriado ou férias quanto a quem organiza encontros corporativos e festas, com espaços próprios para isso. O hotel fica na Avenida Macário Pinto Lopes, antiga Avenida do Contorno, a poucos passos da areia. Não aceita animais de estimação, nem de pequeno porte.",
      "amenities": [],
      "address": "Avenida Macário Pinto Lopes, 900 - Praia do Forte, Cabo Frio - RJ",
      "phone": "(22) 2647-8000"
    }
  },
  "emp_buzios_maravista-hotel-e-spa": {
    "coverImage": "https://maravista.com.br/wp-content/uploads/2025/10/Maravista-Hotel-e-Spa-02.jpg",
    "gallery": [
      "https://maravista.com.br/wp-content/uploads/2025/10/Maravista-Hotel-e-Spa-01.jpg",
      "https://maravista.com.br/wp-content/uploads/2025/10/Maravista-Hotel-e-Spa-04.jpg",
      "https://maravista.com.br/wp-content/uploads/2025/10/Maravista-Hotel-e-Spa-05.jpg",
      "https://maravista.com.br/wp-content/uploads/2025/10/Maravista-Hotel-e-Spa-45.jpg",
      "https://maravista.com.br/wp-content/uploads/2026/01/Wedding-70.jpg",
      "https://maravista.com.br/wp-content/uploads/2025/12/maravista-buzios.jpg"
    ],
    "info": {
      "description": "Hotel e spa com acesso direto à Praia de Geribá, a mais famosa de Búzios, com dois quilômetros de areia branca e mar claro, ótimo para surfe, bodyboard, stand up paddle e windsurf. Funciona desde 1999 e tem suítes arejadas e bem decoradas, piscina e spa, além de estrutura para eventos e casamentos de frente para o mar. Fica na Rua Gerbert Perissé, a poucos passos da areia.",
      "amenities": [
        "pool"
      ],
      "address": "Rua Gerbert Perissé, 1058 - Geribá, Búzios - RJ, 28950-000"
    }
  },
  "emp_arraial_do_cabo_morada-do-sol-suites": {
    "coverImage": "https://www.moradadosolsuites.com.br/image/d235/6aaa07fe0e0ef34e95f55dcc/morada-do-sol-suites-suite-08",
    "gallery": [
      "https://www.moradadosolsuites.com.br/image/d235/6aaa06ca0e0ef34e95f391ff/morada-do-sol-suites-suite-07"
    ]
  },
  "emp_arraial_do_cabo_pousada-caravela": {
    "info": {
      "description": "Pousada na Praia Grande, a cerca de 500 metros da areia e a uma caminhada curta da Praça da Independência e do centro de Arraial do Cabo. Os quartos são para casais e famílias, a recepção funciona 24 horas e a estrutura inclui piscina ao ar livre. Fica na Rua Wenceslau Braz e atende bem a quem quer chegar a pé aos restaurantes e ao ponto de saída dos passeios.",
      "amenities": [],
      "address": "Rua Wenceslau Braz, 98 - Praia Grande, Arraial do Cabo - RJ, 28930-000"
    }
  },
  "emp_buzios_pousada-manaaki": {
    "info": {
      "description": "Pousada de ambiente aconchegante entre a Praia Rasa e a Baía Formosa, em Búzios, com piscina externa, jardim, redes para descanso, bar e área de convivência. Oferece massagens sob reserva e café da manhã, num clima tranquilo, longe da agitação do centro. Fica na Avenida Greta Blanc do Rio, perto do campo de golfe.",
      "amenities": [],
      "address": "Avenida Greta Blanc do Rio, 82 - Praia Rasa, Armação dos Búzios - RJ, 28950-000"
    }
  },
  "emp_cabo_frio_pousada-porto-forte": {
    "info": {
      "description": "Pousada no centro comercial de Cabo Frio, perto de bancos, lojas, farmácias, mercados, bares e da vida noturna da cidade, a poucos minutos a pé da Praia do Forte e do Canal Itajuru. Boa base para quem quer deixar o carro e resolver tudo a pé. Fica na Rua Professor Miguel Couto, no Centro.",
      "amenities": [],
      "address": "Rua Professor Miguel Couto, 192 - Centro, Cabo Frio - RJ, 28907-140",
      "phone": "(22) 2643-1970",
      "whatsapp": "(22) 99247-9093",
      "website": "https://www.pousadaportoforte.com.br",
      "instagram": "https://www.instagram.com/pousadaportoforte"
    }
  },
  "emp_arraial_do_cabo_pousada-vista-turquesa": {
    "info": {
      "address": "Rua José de Castro Neto, Lote 19, Condomínio Pontal do Atalaia, Arraial do Cabo - RJ, 28930-000"
    }
  },
  "emp_buzios_privilege-buzios": {
    "info": {
      "address": "Avenida José Bento Ribeiro Dantas, 550, Centro, Armação dos Búzios - RJ, 28950-019",
      "instagram": "https://instagram.com/privilegebuzios"
    }
  },
  "emp_arraial_do_cabo_restaurante-tio-dorp": {
    "info": {
      "description": "Restaurante de frutos do mar com deck voltado para o mar e vista da Praia dos Anjos durante a refeição. O cardápio mistura cozinha brasileira com toques mediterrâneos e ainda traz opções vegetarianas, como moqueca vegana e bobó de couve-flor. Fica na Praça Daniel Barreto, no centro de Arraial do Cabo, a poucos passos da orla.",
      "amenities": [],
      "address": "Praça Daniel Barreto, 10 - Praia dos Anjos, Arraial do Cabo - RJ",
      "phone": "(22) 2340-0246",
      "instagram": "https://www.instagram.com/restaurantetiodorp"
    }
  },
  "emp_arraial_do_cabo_santo-gole-bar-e-grill": {
    "info": {
      "description": "Bar e grill na Praça Daniel Barreto, no coração da Praia dos Anjos, com música ao vivo todos os dias, mesas ao ar livre e uma carta de petiscos, frutos do mar, pratos, chope, drinks e cervejas. A casa abre no fim da tarde e costuma encher à noite, por isso vale chegar cedo nos fins de semana e feriados.",
      "amenities": [],
      "address": "Praça Daniel Barreto, 05 - Praia dos Anjos, Arraial do Cabo - RJ",
      "instagram": "https://www.instagram.com/santogolebaregrill"
    }
  },
  "emp_cabo_frio_hotel-solar-do-arco": {
    "coverImage": "https://static.wixstatic.com/media/bc4ad8_7d60bc1b79f3458d9eb84404d5ec64a5~mv2.jpeg",
    "gallery": [
      "https://static.wixstatic.com/media/bc4ad8_a73f216e5d944a0aa17fceb5104d28e9~mv2.jpeg",
      "https://static.wixstatic.com/media/bc4ad8_e16c9a07730b49d18edd16fdbb5798a4~mv2.jpeg",
      "https://static.wixstatic.com/media/bc4ad8_ec2d917590e746ff9170fb1a27439313~mv2.jpeg",
      "https://static.wixstatic.com/media/bc4ad8_39c005f90bb94b13b26b35a89dc6f580~mv2.jpeg",
      "https://static.wixstatic.com/media/bc4ad8_fe472323514d48c0bd063bf2ce265008~mv2.jpeg",
      "https://static.wixstatic.com/media/bc4ad8_18602706cf584f9f967563adefa6700b~mv2.jpeg"
    ],
    "info": {
      "description": "Hotel boutique em casarão histórico à beira do Canal do Itajuru, no bairro da Passagem, em Cabo Frio, frequentado pela família real nos tempos do Império e restaurado com cuidado. Os jardins misturam memória e paisagismo contemporâneo com flora tropical, e a piscina de ares mouriscos é um dos refúgios da casa. O clima é de serenidade, com a brisa do canal e o movimento dos barcos, a poucos passos do patrimônio cultural da cidade e das praias da região.",
      "amenities": [
        "pool"
      ]
    }
  },
  "emp_sao_pedro_da_aldeia_pousada-villa-mares": {
    "coverImage": "https://villamares.com.br/wp-content/uploads/2021/09/Villa-Mares-05.jpg",
    "gallery": [
      "https://villamares.com.br/wp-content/uploads/2021/06/6-768x728.jpg",
      "https://villamares.com.br/wp-content/uploads/2021/06/IMG_3372web-1.jpg",
      "https://villamares.com.br/wp-content/uploads/2021/06/IMG_3370web.jpg"
    ],
    "info": {
      "description": "Pousada a cerca de 200 metros do centro de São Pedro da Aldeia, perto de restaurantes, lanchonetes, supermercados e farmácias, pensada tanto para quem viaja a trabalho quanto para quem quer curtir a Região dos Lagos. Os quartos têm banheiro privativo com ducha, camas box, ar-condicionado, frigobar, Wi-Fi e telefone, e o café da manhã é servido todos os dias. Cabo Frio, Arraial do Cabo e Búzios ficam a poucos minutos de carro.",
      "amenities": [
        "wifi",
        "ac",
        "breakfast"
      ],
      "phone": "(22) 2321-0904"
    }
  },
  "emp_saquarema_village-itauna-inn": {
    "coverImage": "https://cache.ayrton.net.br/imports/a854a157-f139-4468-bbf5-345b08442c19.jpeg",
    "gallery": [
      "https://cache.ayrton.net.br/imports/d0ca642e-04a0-4c4e-a051-23e0b7f4b78f.jpeg",
      "https://cache.ayrton.net.br/imports/e156eb5c-b38a-4283-b9f3-7875e28ec748.jpeg",
      "https://cache.ayrton.net.br/imports/00804d0b-25a0-4e7f-bcd1-ccf838d99a49.jpeg",
      "https://cache.ayrton.net.br/imports/02cba4b5-f2cf-46d2-90fd-12ea3df498a6.jpeg",
      "https://cache.ayrton.net.br/imports/4edf5f69-f44f-4dcb-97a7-06eff2719ab6.jpeg"
    ],
    "info": {
      "description": "Condomínio de casas para locação por temporada na Praia de Itaúna, em Saquarema, pensado para quem quer relaxar, aproveitar a praia e se sentir em casa, com a privacidade de uma casa inteira em vez de um quarto de pousada. Fica na Rua dos Vermelhos, em Itaúna, bairro conhecido pelas ondas e pelo clima surfista. As reservas e consultas de disponibilidade são feitas direto pelo site oficial.",
      "amenities": [],
      "address": "R. dos Vermelhos, 459 - Itaúna, Saquarema - RJ, 28990-882",
      "whatsapp": "(21) 98297-4015",
      "phone": "(21) 98297-4015"
    }
  },
  "pub_buzios_praia-rasa": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Buzios-PraiaRasa3.jpg?width=1280",
    "imageCredit": {
      "author": "Fulviusbsas",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Buzios-PraiaRasa3.jpg"
    }
  },
  "pub_buzios_praia-da-ferradura": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/PRAIA_DA_FERRADURA.B%C3%9AZIOS.JPG?width=1280",
    "imageCredit": {
      "author": "Msadp77",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:PRAIA_DA_FERRADURA.B%C3%9AZIOS.JPG"
    }
  },
  "pub_buzios_praia-de-joao-fernandes": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Buzios-JoaoFernandes.jpg?width=1280",
    "imageCredit": {
      "author": "Fulviusbsas",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Buzios-JoaoFernandes.jpg"
    }
  },
  "pub_buzios_praia-da-armacao": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_da_Arma%C3%A7%C3%A3o%2C_B%C3%BAzios_2.JPG?width=1280",
    "imageCredit": {
      "author": "Leandrobarr",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Praia_da_Arma%C3%A7%C3%A3o%2C_B%C3%BAzios_2.JPG"
    }
  },
  "pub_buzios_praia-dos-ossos": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_dos_Ossos%2C_2_-_Village_de_B%C3%BAzios%2C_B%C3%BAzios_-_RJ%2C_28950-000%2C_Brazil_-_panoramio.jpg?width=1280",
    "imageCredit": {
      "author": "TMbux",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Praia_dos_Ossos%2C_2_-_Village_de_B%C3%BAzios%2C_B%C3%BAzios_-_RJ%2C_28950-000%2C_Brazil_-_panoramio.jpg"
    }
  },
  "pub_buzios_praia-da-tartaruga": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Traineira_Praia_da_Tartaruga.jpg?width=1280",
    "imageCredit": {
      "author": "Patrick Montenegro",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Traineira_Praia_da_Tartaruga.jpg"
    }
  },
  "pub_buzios_praia-de-manguinhos": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Porto_de_Manguinhos_-_B%C3%BAzios_Brasil.JPG?width=1280",
    "imageCredit": {
      "author": "Kcris Ramos",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Porto_de_Manguinhos_-_B%C3%BAzios_Brasil.JPG"
    }
  },
  "pub_cabo_frio_praia-do-forte": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/PlayaForteSaoMateo-CaboFrio-Brasil-feb2016.jpg?width=1280",
    "imageCredit": {
      "author": "Ezarate",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:PlayaForteSaoMateo-CaboFrio-Brasil-feb2016.jpg"
    }
  },
  "pub_buzios_orla-bardot": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Orla_Bardot%2C_B%C3%BAzios.jpg?width=1280",
    "imageCredit": {
      "author": "Viniciusmpv",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Orla_Bardot%2C_B%C3%BAzios.jpg"
    }
  },
  "pub_buzios_rua-das-pedras": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Rua_das_Pedras_(2).jpg?width=1280",
    "imageCredit": {
      "author": "Eduardo P",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Rua_das_Pedras_(2).jpg"
    }
  },
  "pub_buzios_escultura-os-tres-pescadores": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/ThiagoFreitas_Monumento_dos_Tres_Pescadores_Armacao_dos_Buzios_RJ_(27180960928).jpg?width=1280",
    "imageCredit": {
      "author": "MTur Destinos",
      "license": "Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:ThiagoFreitas_Monumento_dos_Tres_Pescadores_Armacao_dos_Buzios_RJ_(27180960928).jpg"
    }
  },
  "pub_arraial_do_cabo_ilha-do-cabo-frio": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/VistaPraiadoFarol-Arraial_do_Cabo-feb2016.jpg?width=1280",
    "imageCredit": {
      "author": "Ezarate",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:VistaPraiadoFarol-Arraial_do_Cabo-feb2016.jpg"
    }
  },
  "pub_buzios_praia-do-canto": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/B%C3%BAzios_RJ_Brasil_-_Ruela_na_Praia_do_Canto_-_panoramio.jpg?width=1280",
    "imageCredit": {
      "author": "Josue Marinho",
      "license": "CC BY 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:B%C3%BAzios_RJ_Brasil_-_Ruela_na_Praia_do_Canto_-_panoramio.jpg"
    }
  },
  "pub_buzios_praia-da-foca": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_da_Foca_2010_BBKW.JPG?width=1280",
    "imageCredit": {
      "author": "Beatriz Bukowitz",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Praia_da_Foca_2010_BBKW.JPG"
    }
  },
  "pub_buzios_praia-da-azeda": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_da_Azeda_05.jpg?width=1280",
    "imageCredit": {
      "author": "Halley Pacheco de Oliveira",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Praia_da_Azeda_05.jpg"
    }
  },
  "pub_buzios_praia-da-ferradurinha": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Buzios-Ferradurinha4.jpg?width=1280",
    "imageCredit": {
      "author": "Fulviusbsas",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Buzios-Ferradurinha4.jpg"
    }
  },
  "pub_buzios_praia-do-forno": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Buzios-Forno1.jpg?width=1280",
    "imageCredit": {
      "author": "Fulviusbsas",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Buzios-Forno1.jpg"
    }
  },
  "pub_buzios_igreja-de-sant-ana": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Igreja_de_Sant'Ana.jpg?width=1280",
    "imageCredit": {
      "author": "Hour.poing",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Igreja_de_Sant'Ana.jpg"
    }
  },
  "pub_buzios_serra-das-emerencias": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Serra_das_emerencias_-_B%C3%B9zios%2C_RJ_-_panoramio.jpg?width=1280",
    "imageCredit": {
      "author": "Newton paz peres",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Serra_das_emerencias_-_B%C3%B9zios%2C_RJ_-_panoramio.jpg"
    }
  },
  "pub_buzios_praia-de-joao-fernandinho": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Buzios-JoaoFernandinho1.jpg?width=1280",
    "imageCredit": {
      "author": "Fulviusbsas",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Buzios-JoaoFernandinho1.jpg"
    }
  },
  "pub_buzios_praia-da-azedinha": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_da_Azedinha_03.jpg?width=1280",
    "imageCredit": {
      "author": "Halley Pacheco de Oliveira",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Praia_da_Azedinha_03.jpg"
    }
  },
  "OL6TZTOZMuefdsHDUGIq": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Praia.dos.Anjos.Arraial.do.Cabo.jpg?width=1280",
    "imageCredit": {
      "author": "Msadp06",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Praia.dos.Anjos.Arraial.do.Cabo.jpg"
    },
    "info": {
      "description": "Ponto de partida do turismo de Arraial do Cabo: é do cais da Praia dos Anjos que saem as escunas e os barcos-táxi para o Forno, o Farol e as Prainhas, e é ali que fica o porto onde chegam os barcos de pesca coloridos. A praia é urbana e de acesso simples, sem trilha e com vaga nas ruas próximas; guias de viagem a tratam como menos paradisíaca que o Forno ou o Farol. Na praça ficam o Museu Oceanográfico e bares com shows no verão. A trilha curta até a Praia do Forno começa à esquerda do porto."
    }
  },
  "9K9O3hoHo0M2Zt1kysPC": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Museu_Oceanogr%C3%A1fico,_em_Arraial_do_Cabo_RJ_(52247823379).jpg?width=1280",
    "imageCredit": {
      "author": "Marinha do Brasil",
      "license": "CC BY-SA 2.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Museu_Oceanogr%C3%A1fico,_em_Arraial_do_Cabo_RJ_(52247823379).jpg"
    },
    "info": {
      "description": "Museu da Marinha do Brasil ligado ao Instituto de Estudos do Mar Almirante Paulo Moreira (IEAPM), na Praça Daniel Barreto, na Praia dos Anjos. O prédio foi a primeira sede do Projeto Cabo Frio e abrigou os laboratórios dos anos 1970. O acervo reúne coleções de oceanografia biológica, como esqueletos de golfinhos e baleias, e peças de arqueologia de naufrágios. Reaberto em 2022 depois de reforma e climatização, divulga ciência e educação ambiental. Pela página do instituto, abre de terça a domingo, inclusive feriados, à tarde; confirme o horário antes de ir.",
      "address": "Praça Daniel Barreto, s/nº, Praia dos Anjos, Arraial do Cabo - RJ, 28930-000",
      "openingHours": {
        "Domingo": "14:00 - 17:00",
        "Segunda": "Fechado",
        "Terça": "14:00 - 17:00",
        "Quarta": "14:00 - 17:00",
        "Quinta": "14:00 - 17:00",
        "Sexta": "14:00 - 17:00",
        "Sábado": "14:00 - 17:00"
      }
    }
  },
  "pub_buzios_estatua-de-juscelino-kubitschek": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Búzios_RJ_Brasil_-_Estátua_de_JK,_Orla_Bardot_-_panoramio.jpg?width=1280",
    "imageCredit": {
      "author": "Josue Marinho",
      "license": "CC BY 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Búzios_RJ_Brasil_-_Estátua_de_JK,_Orla_Bardot_-_panoramio.jpg"
    }
  },
  "pub_cabo_frio_capela-de-nossa-senhora-da-guia": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/CaboFrio_Chapel_of_Nossa_Senhora_da_Guia.JPG?width=1280",
    "imageCredit": {
      "author": "Frenz 69",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:CaboFrio_Chapel_of_Nossa_Senhora_da_Guia.JPG"
    },
    "info": {
      "description": "Capela de 1740, no alto do Morro da Guia, erguida para abrigar a imagem de Nossa Senhora da Guia, que antes ficava no Convento de Nossa Senhora dos Anjos. Tombada pelo Iphan em 1957, abre para visitação em datas determinadas, enquanto o morro tem acesso livre e permanente. A subida por escadaria ou ladeira leva poucos minutos e a vista é uma das mais bonitas da cidade, com a Praia do Forte e o Canal do Itajuru."
    }
  },
  "pub_cabo_frio_igreja-de-sao-benedito": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/CaboFrio_Igreja_de_São_Benedito.JPG?width=1280",
    "imageCredit": {
      "author": "Frenz 69",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:CaboFrio_Igreja_de_São_Benedito.JPG"
    },
    "info": {
      "description": "Capela do Bairro da Passagem, no extremo sul do Largo de São Benedito, erguida no século XVIII (as fontes divergem entre 1701 e 1761) para a celebração de missas aos escravizados. É um dos marcos do centro histórico de Cabo Frio e passou por nova pintura recente. Fica a poucos passos do Canal do Itajuru e do Arco da Passagem, entre bares e pousadas do bairro. A visita ao interior depende do horário de funcionamento da igreja, então confirme antes de ir; do lado de fora já rende boas fotos."
    }
  },
  "pub_cabo_frio_mirantes-da-praia-das-conchas": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Mirante_da_Praia_das_Conchas_-_Cabo_Frio._(6894111536).jpg?width=1280",
    "imageCredit": {
      "author": "Marinelson Almeida",
      "license": "CC BY 2.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Mirante_da_Praia_das_Conchas_-_Cabo_Frio._(6894111536).jpg"
    },
    "info": {
      "description": "Pontos de vista no Morro do Vigia, entre as praias do Peró e das Conchas, de onde se vê a enseada em forma de meia-lua, a ponta do Arpoador, Arraial do Cabo e as ilhas de Cabo Frio. O Mirante das Conchas faz parte da trilha circular de cerca de 860 metros e dificuldade média, gratuita, que também passa pela Gruta do Vigia e pela prainha do Pesqueirinho. Leve água, calçado fechado e proteção solar, e prefira o fim da tarde para a luz do pôr do sol."
    }
  },
  "pub_cabo_frio_passarela-e-mirantes-do-forte": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Forte_de_São_Mateus_do_Cabo_Frio_01.jpg?width=1280",
    "imageCredit": {
      "author": "Halley Pacheco de Oliveira",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Forte_de_São_Mateus_do_Cabo_Frio_01.jpg"
    },
    "info": {
      "description": "Calçadão de madeira que acompanha a orla da Praia do Forte, bom para caminhar e pedalar com vista para o mar, e que leva até o Forte de São Mateus, na ponta esquerda da praia. Construído entre 1616 e 1620, o forte é patrimônio histórico nacional, tem visitação gratuita e, dos mirantes, abrange toda a orla, parte do Canal do Itajuru e a Ilha do Japonês. À noite o forte é iluminado. A subida é curta, e o melhor horário é o fim da tarde."
    }
  },
  "TIgND0KE0BqGRJq5XN5c": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_do_Pontal_(Arraial_do_Cabo).JPG?width=1280",
    "imageCredit": {
      "author": "Eduardo P",
      "license": "Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Praia_do_Pontal_(Arraial_do_Cabo).JPG"
    }
  },
  "HKfoI9JHyyQVuXqsgpxb": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Prainha_Arraial_do_Cabo.jpg?width=1280",
    "imageCredit": {
      "author": "Noel Portugal",
      "license": "CC BY 2.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Prainha_Arraial_do_Cabo.jpg"
    },
    "info": {
      "description": "Primeira praia que o visitante enxerga ao chegar a Arraial do Cabo por terra, a Prainha é urbanizada, cercada de prédios baixos e perto da rodoviária, o que a deixa entre as mais fáceis de acessar. Tem mar de tom caribenho, areia clara, quiosques e barracas com cadeiras e guarda-sol para alugar, e costuma ser movimentada. Não deve ser confundida com as Prainhas do Pontal do Atalaia. É também ponto de partida de trilhas: pela ponta direita, a do Mirante da Cabocla até o Forno; pela esquerda, a do Morro do Miranda até o Pontal."
    }
  },
  "HFDqT61LCgznhV0FLqEy": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_das_Conchas_em_Cabo_Frio.JPG?width=1280",
    "imageCredit": {
      "author": "Esalq",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Praia_das_Conchas_em_Cabo_Frio.JPG"
    },
    "info": {
      "description": "Pequena enseada de cerca de 600 metros, em formato de concha, entre o Morro do Vigia e a Ponta do Arpoador, colada à ponta direita da Praia do Peró. O mar é calmo, cristalino e gelado, bom para mergulho e para famílias com crianças, e os quiosques têm estrutura simples e comida elogiada. Chega-se caminhando pela areia do Peró, que tem melhor estrutura e estacionamento, ou por estrada de terra. Trilhas curtas levam ao Morro do Vigia e à Ponta do Arpoador, com mirantes."
    }
  },
  "KFcex4ruU64009ddTyNx": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_do_Per%C3%B3,_no_Parque_Estadual_da_costa_do_Sol_em_Cabo_Frio-RJ.JPG?width=1280",
    "imageCredit": {
      "author": "Eduardo Cerqueira dos Santos",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Praia_do_Per%C3%B3,_no_Parque_Estadual_da_costa_do_Sol_em_Cabo_Frio-RJ.JPG"
    },
    "info": {
      "description": "Com cerca de 7 km de extensão, é uma das principais praias de Cabo Frio: mar azul com um pouco de onda, areia ampla, dunas douradas e boa para caminhar. A ponta esquerda é bem deserta; na direita ficam quiosques com cadeira, guarda-sol e petiscos. Os ventos fazem dela ponto de kitesurf e windsurf. Fica mais longe do centro que a Praia do Forte e é vizinha da Praia das Conchas, a pé pela ponta direita. Há hospedagens pé na areia no bairro."
    }
  },
  "QznImY9rWZZxk3mGpUpZ": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Fenda_de_Nossa_Senhora_da_Concei%C3%A7%C3%A3o.jpg?width=1280",
    "imageCredit": {
      "author": "Lorraineoli",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Fenda_de_Nossa_Senhora_da_Concei%C3%A7%C3%A3o.jpg"
    },
    "info": {
      "description": "Fenda entre duas rochas à beira-mar onde fica uma imagem de santa, ponto que mistura beleza natural, fé e lenda local. A visita é feita pelo mar: a Fenda de Nossa Senhora aparece no roteiro dos passeios de barco que saem da Praia dos Anjos, junto com a Gruta Azul, a Pedra do Macaco e as Prainhas do Atalaia, em geral como parada de fotos."
    }
  },
  "YyqC6RzefQKmxEnx8V03": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Convento_e_Igreja_de_Nossa_Senhora_dos_Anjos_01.jpg?width=1280",
    "imageCredit": {
      "author": "Halley Pacheco de Oliveira",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Convento_e_Igreja_de_Nossa_Senhora_dos_Anjos_01.jpg"
    },
    "info": {
      "description": "Prédio do fim do século XVII, construído pelos franciscanos e datado de 1686, que abriga o Museu de Arte Religiosa e Tradicional de Cabo Frio (MART), vinculado ao Ibram. O acervo reúne peças sacras, documentos históricos e objetos ligados à formação da cidade. É um dos edifícios religiosos mais antigos do país ainda em atividade, perto da Capela de Nossa Senhora da Guia e do Morro da Guia. Visitas internas dependem de dias e horários definidos, então vale confirmar antes de ir."
    }
  },
  "i1lnZjubrZnJZLQdciA7": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_do_Siqueira_-_Parque_Estadual_da_Costa_do_Sol_-_Cabo_Frio,RJ.JPG?width=1280",
    "imageCredit": {
      "author": "Eduardo Cerqueira dos Santos",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Praia_do_Siqueira_-_Parque_Estadual_da_Costa_do_Sol_-_Cabo_Frio,RJ.JPG"
    },
    "info": {
      "description": "Praia da Lagoa de Araruama, a cerca de 5 km do centro de Cabo Frio. Fica na península de areia entre o oceano e a lagoa, o que permite ver o nascer do sol no mar e o pôr do sol na lagoa. O principal programa é o entardecer, por isso os guias recomendam ir no fim da tarde. É um lugar tranquilo para quem quer fugir das praias de mar aberto."
    }
  },
  "oCQHKACV6VRkdFJIq6rj": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/S%C3%A3o_Bento,_Cabo_Frio_-_RJ,_Brazil_-_panoramio.jpg?width=1280",
    "imageCredit": {
      "author": "Newton paz peres",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:S%C3%A3o_Bento,_Cabo_Frio_-_RJ,_Brazil_-_panoramio.jpg"
    },
    "info": {
      "description": "Praia pequena de cerca de 300 metros, a menos de um quilômetro do centro de Cabo Frio, voltada para o lado calmo da Lagoa de Araruama. A água é tranquila, com áreas de coral usadas por mergulhadores, e o ambiente é descontraído, frequentado por moradores e pescadores. Tem acesso fácil pela via ao lado e pouca estrutura turística, por isso serve bem como parada rápida para um banho calmo ou para ver o movimento local, sem a lotação das praias de mar aberto."
    }
  },
  "xujTPc43IbEuuSVo1aq4": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/GrutaAzulArraialdoCaboBrasil-feb2016.jpg?width=1280",
    "imageCredit": {
      "author": "Ezarate",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:GrutaAzulArraialdoCaboBrasil-feb2016.jpg"
    },
    "info": {
      "description": "Caverna marinha com cerca de 15 metros de altura sobre o mar, vista de barco no passeio que segue para a Praia do Farol. O nome vem do azul que a luz do sol cria nas paredes e na água, mas o efeito só aparece em períodos específicos do ano, quando o sol baixo da manhã entra na gruta; no resto do tempo a visita vale pela formação rochosa e pelas ondas que batem nas pedras. No trajeto é comum ver golfinhos. Não há acesso por terra: a visita é feita no passeio de barco, com parada rápida."
    }
  },
  "8BRL8yQLLUKis13rZbtA": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Canal_do_Itajuru_05.jpg?width=1280",
    "imageCredit": {
      "author": "Halley Pacheco de Oliveira",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Canal_do_Itajuru_05.jpg"
    },
    "info": {
      "description": "Canal que atravessa Cabo Frio e liga a Lagoa de Araruama ao oceano, ao lado do Bairro da Passagem e do canto esquerdo da Praia do Forte. Ao longo das margens ficam bares e restaurantes, como na região do Boulevard Canal, e é dali que partem passeios de barco; a prefeitura orienta usar apenas embarcações cadastradas e com alvará. A Ilha do Japonês fica dentro do canal. A orla é boa para fotos e considerada tranquila para caminhar à noite."
    }
  },
  "90dvvjysg7xSLL37OaIw": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Rua_dos_Biqu%C3%ADnis_em_Cabo_Frio.JPG?width=1280",
    "imageCredit": {
      "author": "Esalq",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Rua_dos_Biqu%C3%ADnis_em_Cabo_Frio.JPG"
    },
    "info": {
      "description": "Na Gamboa, em Cabo Frio, reúne mais de cem lojas de moda praia, fitness e acessórios e é tratada como o maior centro de moda praia a céu aberto do país. A rua é de pedestres e vende biquínis, maiôs, saídas de praia e souvenirs; uma vantagem citada por quem vai é poder comprar as peças do biquíni separadas. Passou por revitalização, com iluminação e limpeza, em 2023."
    }
  },
  "LBkhfzRRUt29ChItkSeW": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Ilha_do_Japon%C3%AAs_em_Cabo_Frio,_Regi%C3%A3o_dos_lagos-RJ.JPG?width=1280",
    "imageCredit": {
      "author": "Eduardo Cerqueira dos Santos",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ilha_do_Japon%C3%AAs_em_Cabo_Frio,_Regi%C3%A3o_dos_lagos-RJ.JPG"
    },
    "info": {
      "description": "Pequena croa de areia no Canal do Itajuru, tão pequena que dá para contorná-la a pé em cerca de dez minutos. A água é rasa, calma e muda de cor conforme a maré e o sol. Não tem infraestrutura, então o recomendado é levar lanche, água e cadeira; há quiosque só do lado oposto. Vai-se de barco-táxi pela faixa de areia da Passagem, numa travessia curta, ou a pé pela Boca da Barra, andando pela água na maré baixa. Lota em feriados e fins de semana."
    }
  },
  "NatqpP54P8F3lBcSYLs3": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Igreja_de_Nossa_Senhora_dos_Remédios_Arraial_do_Cabo.JPG?width=1280",
    "imageCredit": {
      "author": "Wusel007",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Igreja_de_Nossa_Senhora_dos_Remédios_Arraial_do_Cabo.JPG"
    },
    "info": {
      "description": "Igreja colonial em tons de azul e branco, na Praia dos Anjos, atribuída aos portugueses no início do século XVI (as fontes citam 1503 ou 1506) e conhecida por ter abrigado a primeira missa em ambiente fechado no Brasil. Em outubro acontece a festa da padroeira, com procissões. Nem sempre está aberta fora dos horários de missa, e do lado de fora já rende boas fotos. Fica perto da Praça da Cova e da Marina dos Pescadores."
    }
  },
  "NuE2KeaEywa81l9uBGyI": {
    "info": {
      "description": "Fenda submersa entre as rochas, formada ao longo de séculos pela ação do mar, que aparece no roteiro dos passeios de barco de Arraial do Cabo como parada rápida para fotos. Também é ponto de mergulho: operadoras o descrevem como destino para mergulhadores experientes, por ser um mergulho desafiador, no ambiente de águas ricas que fez da cidade a capital do mergulho. Não há acesso por terra e a visita depende do passeio de barco ou da operadora de mergulho."
    }
  },
  "SLFXp91DyNAvPzRUSLwP": {
    "info": {
      "description": "Duas pequenas praias, com cerca de 300 metros ao todo, que se unem na maré baixa e são um dos maiores cartões-postais de Arraial do Cabo: mar azul-turquesa, areia clara e fina e a famosa escadaria, com mais de 250 degraus, que desce até a areia. Há quiosques e barraquinhas, e quem quer sossego segue até a ponta da faixa de areia. No canto direito, a Gruta do Amor rende fotos. Fica numa Reserva Extrativista Marinha, com regras de conservação do ICMBio, a cerca de 4 km do centro; também se chega de barco."
    }
  },
  "64v2NFtuTJ8PyPwWUL6E": {
    "info": {
      "description": "Um dos cartões-postais de Arraial do Cabo: enseada de cerca de 500 metros com água de tons de verde e azul, areia branca e morro de vegetação rasteira ao fundo. O mar tem poucas ondas e é bom para banho e snorkel, com chance de ver tartarugas e uma fazenda de ostras. A água é menos gelada que em outras praias da cidade. Chega-se por uma trilha curta que começa à esquerda do porto, na Praia dos Anjos, ou de barco-táxi. As barracas são simples; há quem prefira levar o lanche."
    }
  },
  "laR0ViYbPoIBJKu9DIXS": {
    "info": {
      "description": "Trilha que começa no canto esquerdo da faixa de areia da Prainha, atravessa o Morro do Miranda e termina na Praia do Pontal, no chamado Circuito Morro do Miranda. É um dos roteiros a pé de Arraial do Cabo que saem da Prainha, ao lado do que leva ao Forno pelo Mirante da Cabocla."
    }
  },
  "51ZoRnGoJMHAkblF7ygK": {
    "info": {
      "description": "Núcleo mais antigo de Cabo Frio, na margem do Canal do Itajuru, onde a povoação nasceu entre 1616 e 1660. O nome vem do ponto do canal por onde se fazia a travessia nos tempos coloniais. Ruas e casarões preservados, a Praça da Passagem e a Igreja de São Benedito dão ao bairro um clima tranquilo, hoje com polo gastronômico, bares com música ao vivo e pousadas charmosas. A Praia do Forte fica a cerca de 15 minutos a pé, e da faixa de areia da Passagem saem os barcos para a Ilha do Japonês."
    }
  },
  "cjXY1ywZ3rlTo2M1GJmW": {
    "info": {
      "description": "Núcleo mais antigo de Cabo Frio, na margem do Canal do Itajuru, onde a povoação nasceu entre 1616 e 1660. O nome vem do ponto do canal por onde se fazia a travessia nos tempos coloniais. Ruas e casarões preservados, a Praça da Passagem e a Igreja de São Benedito dão ao bairro um clima tranquilo, hoje com polo gastronômico, bares com música ao vivo e pousadas charmosas. A Praia do Forte fica a cerca de 15 minutos a pé, e da faixa de areia da Passagem saem os barcos para a Ilha do Japonês."
    }
  },
  "pub_cabo_frio_morro-do-vigia": {
    "info": {
      "description": "Trilha circular de cerca de 860 metros e dificuldade média, entre as praias do Peró e das Conchas, sem cobrança de ingresso. O início é marcado por uma espécie de portal na rocha, atrás de um restaurante na ponta direita do Peró. O caminho passa pelo Mirante das Conchas, com vista da praia, de Arraial do Cabo e das ilhas de Cabo Frio, pela Gruta do Vigia e por prainhas escondidas, como a do Pesqueirinho, onde dá para banho. Leva em torno de uma hora em ritmo tranquilo."
    }
  },
  "pub_cabo_frio_gruta-do-vigia": {
    "info": {
      "description": "Fenda na rocha ao longo da trilha do Morro do Vigia, bem perto da Praia do Pesqueirinho. A luz que entra pela abertura rende fotos bonitas e faz da gruta uma das paradas mais procuradas do percurso. O acesso é só a pé, pela trilha que parte da ponta direita da Praia do Peró ou do lado esquerdo da Praia das Conchas."
    }
  },
  "pub_buzios_praia-de-geriba": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Geribá,_Búzios_-_Fim_de_tarde.jpg?width=1280",
    "imageCredit": {
      "author": "Professorcarlosgoes",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Geribá,_Búzios_-_Fim_de_tarde.jpg"
    },
    "info": {
      "description": "Faixa de areia clara de cerca de 2 km, no lado sul da península, aberta para o mar com ondas que quebram em toda a extensão, o que faz dela o ponto de surfe e bodyboard de Búzios. O nome vem da palmeira jerivá, nativa da Mata Atlântica. Tem quiosques, restaurantes e espaço para vôlei, futebol de areia e caminhada, e é uma das praias mais movimentadas da cidade. Do canto esquerdo sai a trilha curta para a Praia da Ferradurinha. Táxi e aplicativo deixam em qualquer ponto da orla."
    }
  },
  "pub_buzios_trilha-da-ferradurinha": {
    "info": {
      "description": "Percurso de cerca de 3,5 km pela costa do Parque Estadual da Costa do Sol, que passa por dois conjuntos de piscinas naturais, uma pequena queda d'água salgada com vista para o mar e a Pedra do Guardião, mirante sobre o oceano. A dificuldade é média, com algumas subidas e um trecho sobre rochas, sem equipamento especial. Não há sinalização e existem bifurcações, por isso o acompanhamento de guia local é recomendado, também para saber onde o banho é seguro. Começa perto da Praia da Ferradurinha."
    }
  },
  "pub_buzios_praia-olho-de-boi": {
    "info": {
      "description": "Prainha pequena e escondida entre rochas, cercada de mata, reconhecida como a praia naturista de Búzios, onde o nudismo é a regra. O mar costuma ser calmo e o movimento, baixo. O único acesso por terra é uma trilha de dificuldade média, com subida íngreme, de uns 20 minutos a partir do canto direito da Praia Brava; também se chega de barco. Não tem estrutura, então leve água e o que for consumir. Quem não pretende ficar sem roupa pode dar uma olhada do alto da trilha antes de decidir."
    }
  },
  "pub_buzios_praia-brava": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_Brava_-_Búzios.jpg?width=1280",
    "imageCredit": {
      "author": "Juh oliveira87",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Praia_Brava_-_Búzios.jpg"
    },
    "info": {
      "description": "Praia de faixa longa, dividida em duas por uma formação rochosa de fácil travessia, com mar agitado e algum repuxo, o que atrai surfistas. O lado esquerdo concentra quiosques e restaurantes com vista; o direito é mais rústico, com aluguel de cadeiras e vendedores de bebida, e é de onde sai a trilha para a Praia Olho de Boi. Há bolsão de estacionamento na entrada. Em dias de ressaca, o banho pede cuidado, e quem busca mar tranquilo costuma preferir outras praias da península."
    }
  },
  "pub_buzios_praia-das-virgens": {
    "info": {
      "description": "Pequena praia de pedras e um trecho de areia, com cerca de 40 metros, quase sem estrutura e cercada de vegetação nativa. É considerada uma das mais íntimas de Búzios, boa para fotos e para o pôr do sol, mas o fundo rochoso não é indicado para banho. O acesso é a pé, por trilha estreita entre as pedras, que parte da Praia dos Amores ou do costão da Praia da Tartaruga, e é mais seguro na maré baixa. Vá com calçado firme e leve tudo de que precisar, pois não há quiosques."
    }
  },
  "pub_buzios_praia-dos-amores": {
    "info": {
      "description": "Praia pequena, com algumas dezenas de metros de areia entre paredões de rocha e vegetação nativa, quase sem movimento e sem infraestrutura. O mar é um pouco agitado e a areia é curta, mas o cenário é um dos mais reservados de Búzios. Chega-se por uma trilha de pedras a partir do costão esquerdo da Praia do Canto, na área da Orla Bardot, de onde também se alcança um mirante com vista para a Armação. Como é um ponto remoto, convém levar água e lixo de volta."
    }
  },
  "pub_buzios_mirante-do-forno": {
    "info": {
      "description": "Mirante com vista privilegiada para a cidade e para a Praia do Forno, de areias rosadas, e para as montanhas ao redor. Fica perto de hotéis e do caminho entre a Praia do Forno e a Praia da Ferradura, é de fácil acesso e é uma das paradas com descida do veículo no passeio de jardineira panorâmica por Búzios, junto com o Mirante de João Fernandes e as praias do Forno, da Foca e da Ferradura. A parada é curta e rende boas fotos; combine com uma visita à praia logo abaixo."
    }
  },
  "pub_buzios_mirante-de-joao-fernandes": {
    "info": {
      "description": "Ponto alto no bairro de João Fernandes, perto de hotéis, casas e condomínios, de onde se veem as praias de João Fernandes, João Fernandinho e Brava e parte do centro de Búzios. Dá para chegar de carro, estacionando em ruas internas do bairro e caminhando uns cinco minutos, ou a pé por trilha a partir do Mirante da Ponta do Pai Vitório, num trajeto de cerca de 40 minutos. É um dos mirantes mais famosos da cidade e uma das paradas do passeio de jardineira panorâmica. Há vaga para carro nas proximidades."
    }
  },
  "pub_buzios_mirante-da-ponta-do-pai-vitorio": {
    "info": {
      "description": "Mirante no alto de uma ponta estreita, com mar dos dois lados e uma minúscula prainha de areia, apontado como um dos visuais mais bonitos de Búzios. A trilha começa no fim da Praia Rasa, onde se estaciona numa estradinha de terra, e leva cerca de 10 minutos, com subida curta, sem cobrança de entrada. A trilha pode ser feita junto com a visita ao Mangue de Pedras, que fica na praia vizinha. Leve água, calçado fechado e proteção solar, pois há pouca sombra."
    }
  },
  "pub_buzios_mangue-de-pedras": {
    "info": {
      "description": "Um dos poucos mangues de pedras do mundo, na região da Praia Gorda, ao lado da Praia Rasa. Diferente dos mangues comuns, que se formam em solo de lama junto à foz de rios, este cresce em cascalho e areia grossa, sem rio por perto, com árvores na parte rasa do mar entre pedras, crustáceos e peixes. O acesso é por pequena trilha a partir de um mirante na Rua Carlito Gonçalves e leva pouco tempo. É um passeio curioso e rápido, normalmente combinado com a Ponta do Pai Vitório."
    }
  },
  "pub_buzios_ilha-branca": {
    "info": {
      "description": "Ilhota na ponta da península de Búzios, que lembra um ponto final no fim do litoral e dá nome à própria cor clara que mostra à distância. É vista de frente da Praia de João Fernandes e da Praia das Conchas, em Cabo Frio, e aparece como parada ou paisagem nos passeios de escuna e de jardineira panorâmica pela cidade, que contornam também as praias de João Fernandes, João Fernandinho, Brava, Forno, Foca e Ferradura. O programa é observar e fotografar a ilha da costa ou do barco; o acesso depende de embarcação."
    }
  },
  "pub_buzios_ilha-do-caboclo": {
    "info": {
      "description": "Ilha pequena e arborizada em frente à Praia da Armação, no centro de Búzios. Aparece nos roteiros de escuna que saem da orla central e passam pela Orla Bardot, pela Praia dos Ossos e pelas praias Azeda, Azedinha e João Fernandes, em trajetos de cerca de duas horas e meia a três. Para a maioria dos visitantes é um cenário para fotos feito do barco ou da orla, e não um destino de desembarque. Vale confirmar com o operador do passeio se haverá parada ou só passagem."
    }
  },
  "pub_buzios_mirante-da-brava": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Mirante_da_brava_-_búzios_-_rj_-_panoramio.jpg?width=1280",
    "imageCredit": {
      "author": "Newton paz peres",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Mirante_da_brava_-_búzios_-_rj_-_panoramio.jpg"
    }
  },
  "HECKRPedXgTiE7C4CcVq": {
    "info": {
      "description": "Continuação da Praia das Dunas na mesma faixa de areia que parte da Praia do Forte, já na divisa de Cabo Frio com Arraial do Cabo, onde encontra a Praia do Pontal. O mar é mais fundo e agitado que nas enseadas do centro, com vento constante e pouco movimento, e as ondas fortes atraem surfistas e recebem campeonatos ao longo do ano. Perto da areia há a Lagoa do Foguete, que forma um segundo espelho d'água. É bonita e preservada, mas tem pouca estrutura, então leve água e proteção solar."
    }
  },
  "P5D5ftY9ECSA4MXaCoBv": {
    "info": {
      "description": "Praça na orla da Praia do Forte, conhecida como aquário a céu aberto: lagos artificiais ligados por um calçadão curvo, com pedras, fontes e iluminação colorida à noite. É um dos lugares mais visitados da cidade e ponto de encontro para o fim de tarde à beira-mar, com acesso fácil a pé a partir dos hotéis e pousadas da orla. Fica ao lado da Passarela da Praia do Forte, boa para caminhar e pedalar, e a visita costuma ser curta, de uma ou duas horas."
    }
  },
  "pub_cabo_frio_duna-mae": {
    "info": {
      "description": "Também chamada Dama Branca, é a maior duna do complexo do Parque das Dunas, perto das praias das Dunas e do Foguete, no sentido de Arraial do Cabo. O acesso a pé é considerado fácil, pelo caminho que parte do Condomínio Praia das Dunas, e o visual de areia branca com mata verde é um dos preferidos para o pôr do sol. A sandboard exige agendamento prévio, porque não há atendimento fixo no local. Leve água, calçado fechado e proteção solar, pois não há sombra nem quiosques."
    }
  },
  "pub_cabo_frio_largo-de-sao-benedito": {
    "info": {
      "description": "Praça histórica no coração do Bairro da Passagem, onde fica a Igreja de São Benedito. Reúne casarões coloniais, feiras de artesanato e eventos culturais, e dali se chega ao Arco da Passagem, que liga o largo ao Canal do Itajuru. Em volta ficam bares, restaurantes e pousadas do bairro, e a Praia do Forte está a cerca de 15 minutos a pé. É um bom ponto para caminhar sem pressa, principalmente no fim da tarde, quando o movimento do bairro aumenta."
    }
  },
  "pub_cabo_frio_arco-da-passagem": {
    "info": {
      "description": "Arco que liga o Largo de São Benedito ao Canal do Itajuru, no Bairro da Passagem, em Cabo Frio. É um dos pontos mais fotografados do centro histórico, com o canal e os barcos de um lado e a praça e a igreja do outro. A visita é rápida e costuma ser combinada com um passeio a pé pelo bairro, que tem casarões coloniais, restaurantes e bares à beira da água. Vá no fim da tarde, quando a luz favorece as fotos e o bairro ganha movimento."
    }
  },
  "pub_cabo_frio_praia-brava": {
    "info": {
      "description": "Praia reservada entre a Ponta do Peró e o Morro do Farolete, de frente para a Ilha dos Papagaios e cercada de pedras. O acesso é por trilha, que parte de pontos como a Ilha do Japonês, e a praia é frequentada também por adeptos do naturismo. Não tem estrutura, então leve água e o que for consumir, use calçado firme e confirme a maré e as condições do mar, que costuma ser agitado. Por ser isolada, é uma das praias mais tranquilas da região."
    }
  },
  "mbWQvxkmfrKNuPBBt4fb": {
    "info": {
      "description": "Oficialmente Praça Daniel Barreto de Marco, na região da Praia dos Anjos, é um dos principais pontos de encontro do centro de Arraial do Cabo, com bares, restaurantes, banquinhas de artesanato e movimento de moradores e turistas ao entardecer, com música ao vivo. Passou por reforma em 2016. Fica perto da prefeitura e da Marina dos Pescadores, de onde saem os barcos. É um bom ponto para fechar o dia depois do passeio de barco."
    }
  },
  "pub_arraial_do_cabo_trilha-do-forno": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_do_Forno_-_vista_da_trilha.jpg?width=1280",
    "imageCredit": {
      "author": "João Paulo Domingos Terrazam",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Praia_do_Forno_-_vista_da_trilha.jpg"
    },
    "info": {
      "description": "Trilha curta e popular que parte do canto esquerdo da Praia dos Anjos, perto do píer dos barcos, e leva à Praia do Forno em cerca de 600 metros, por volta de 15 minutos. A subida é íngreme, mas segura e movimentada, e há mirantes no caminho com visual da cidade e da praia, com um banco para admirar a paisagem. É considerada fácil e dá para fazer de chinelo, embora tênis seja melhor. A volta pode ser de barco, e a praia tem águas calmas, boas para snorkel."
    }
  },
  "egzP7T2LmPP4bjPoaK33": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_Brava,_Arraial_do_Cabo_em_2016.jpg?width=1280",
    "imageCredit": {
      "author": "Arielom10",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Praia_Brava,_Arraial_do_Cabo_em_2016.jpg"
    },
    "info": {
      "description": "Praia isolada de Arraial do Cabo, de faixa de areia estreita e mar agitado, que pode quase desaparecer conforme a maré. É considerada uma das mais preservadas da cidade e está quase sempre vazia, no máximo com alguns surfistas. O acesso exige trilha íngreme pela encosta, a partir da Praia Grande, ou por trilha seguida de escadaria perto do Pontal do Atalaia. Não há estrutura, então leve água e observe a maré antes de ir; não é indicada para crianças pequenas."
    }
  },
  "UYt9CEkvlwDFUCTBt4Rp": {
    "info": {
      "description": "Pequena enseada logo no início da trilha que sai do canto direito da Prainha, em Arraial do Cabo, conhecida pelo clima tranquilo e pela água calma e turquesa, boa para snorkel, com tartarugas marinhas avistadas na região. O acesso é a pé por trilha curta, a mesma do circuito de cerca de 4 km, de dificuldade média, rumo ao Mirante da Cabocla e à Praia do Forno. Não há estrutura na praia, então leve água e protetor solar."
    }
  },
  "QijAaZcASjOkSzZIp6VU": {
    "info": {
      "description": "Mirante no alto da formação rochosa que fica na entrada das Prainhas do Pontal do Atalaia, apontado como um dos melhores lugares da Região dos Lagos para ver o pôr do sol, com vista ampla do oceano, da restinga e da Lagoa de Araruama. O acesso a pé é por trilha de cerca de 2 km, e também se chega de carro, táxi ou aplicativo. Leve água e chegue com antecedência, pois o fim de tarde costuma encher."
    }
  },
  "Uy0tjsfmwT75WWvodx72": {
    "info": {
      "description": "Trilha que começa na Enseada do Maramutá e leva às ruínas do Farol Velho, construído no século XIX e depois substituído pelo atual, que funciona desde 1861. As ruínas são descritas como um monumento belo e melancólico, em meio a paisagem de mar e mata. Pescadores tradicionais trabalham na enseada. Como é um trecho mais remoto, vá com água, calçado firme e proteção solar, de preferência acompanhado de guia local, e confirme as condições de acesso antes."
    }
  },
  "VmVlpsw1mF3H4iGEuehf": {
    "info": {
      "description": "Igreja matriz de Arraial do Cabo, dedicada ao Sagrado Coração de Jesus, vinculada à Arquidiocese de Niterói, na região de Lagos. Junto com a Igreja de Nossa Senhora dos Remédios, é um dos dois templos que se destacam no centro da cidade. A visita é de fora para admirar a fachada e, quando há missas, também por dentro, então confirme os horários na paróquia. Fica a uma curta caminhada da Praça da Cova e do centro."
    }
  },
  "emp_arraial_do_cabo_pousada-canto-da-baleia": {
    "info": {
      "description": "Pousada simples a poucos passos da Praia dos Anjos, em Arraial do Cabo, com jardim, piscina, restaurante e bar, estacionamento sem custo e recepção 24 horas. Fica perto da Praia do Forno, da Praia Grande e da Igreja de Nossa Senhora dos Remédios, a uma curta caminhada do centro e do porto de onde saem os passeios de barco. As acomodações têm ar-condicionado e TV, e parte delas tem varanda. É uma opção tradicional para quem quer ficar perto da praia e do movimento do centro.",
      "address": "Rua Kioto, 30, Praia dos Anjos, Arraial do Cabo - RJ, 28930-000"
    }
  },
  "emp_cabo_frio_restaurante-picolino": {
    "info": {
      "description": "Casarão da área histórica de Cabo Frio, num sobrado com varanda sobre o Boulevard Canal, e uma das casas mais tradicionais da cidade. O cardápio, com capa desenhada pelo cartunista Jaguar, é conhecido pelos frutos do mar e por pratos como arroz de pato, carpaccio de polvo, steak tartare e moqueca, com feijoada aos fins de semana e profiteroles de sobremesa. A dica é pedir uma mesa na varanda do andar de cima, de onde se vê o canal. Convém confirmar o horário antes de ir, porque ele varia entre baixa e alta temporada.",
      "address": "Rua Marechal Floriano, 319, São Bento, Cabo Frio - RJ, 28906-330",
      "phone": "(22) 2647-6222",
      "instagram": "https://www.instagram.com/restaurantepicolino"
    }
  },
  "emp_arraial_do_cabo_restaurante-saint-tropez": {
    "info": {
      "description": "Casa tradicional da Praça do Cova, na Praia dos Anjos, comandada por um chef francês que vive em Arraial do Cabo desde 1980 e mistura a mão francesa com o tempero e a fartura brasileiros. O cardápio é extenso, com carnes, massas, sopas, saladas, panquecas, pizzas e frutos do mar, e o frango à cubana com banana e abacaxi empanados é um dos pratos lembrados. As porções costumam servir bem mais de uma pessoa, então vale combinar o pedido na mesa. Fica numa esquina da praça, ótima para o almoço depois do passeio de barco.",
      "address": "Praça Daniel Barreto, 2, Praia dos Anjos, Arraial do Cabo - RJ, 28930-000",
      "phone": "(22) 2622-1222"
    }
  },
  "emp_araruama_restaurante-wellington": {
    "info": {
      "address": "Rua Bernardo Vasconcelos, 660, Centro, Araruama - RJ",
      "phone": "(22) 2664-7924"
    }
  },
  "pub_buzios_praia-de-caravelas": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_das_Caravelas_2.jpg?width=1280",
    "imageCredit": {
      "author": "Raquelmlinhares",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Praia_das_Caravelas_2.jpg"
    }
  },
  "pub_buzios_estatua-de-brigitte-bardot": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/B%C3%BAzios_RJ_Brasil_-_Est%C3%A1tua_de_Brigit_Bardot,_Orla_Bardot_-_panoramio.jpg?width=1280",
    "imageCredit": {
      "author": "Josue Marinho",
      "license": "CC BY 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:B%C3%BAzios_RJ_Brasil_-_Est%C3%A1tua_de_Brigit_Bardot,_Orla_Bardot_-_panoramio.jpg"
    }
  },
  "emp_iguaba_grande_agua-na-boca": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLenvsrPBtf63hmOzXsLz7QLqfcIz3FhD4haRfk5b1E2ZPSlJwbHmdOFo-bJQocJT0YiYGXgOJUvIft5ybLp4GNpa2sUYXl4akeIXdlL8YblIWN7-2GFPWzUSrwzORYJ07Uu7Ehh=w1280-h960-k-no"
  },
  "emp_cabo_frio_ancho-e-faca-churrascaria": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLc3gNKKrTjwGMrFstydi8_xrD_8_s4EuYnJeMOSLJX0fZw06Pxh4Zg4fSmD3VSOPsEEoG5AJCM_54twrdORcaA0ba9Q0kLATXsg_A-Vv3d2CwslPXFe45IpZkVA7NC7H6jekiKTcA=w1280-h960-k-no"
  },
  "emp_cabo_frio_bamba": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLcssSupfCCE3-QmziP-rvcXVVHdbvOJIzb7NANrUwKvkDdibiSShbObCLLrwNJ8ap07Qia7zhsx00V-f55F9NSJWB9Fid7LpyJL3L_R-LggopKfOQUnq1R6QhwM_skc1-V94lwzIg=w1280-h960-k-no"
  },
  "emp_sao_pedro_da_aldeia_cantinho-do-peixe": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLe6Q7xmZcaSQF1tfG6xLK6XNLu96XgTWXlrSN2kZvdoE4VrHvg0_UfWVLtn574hTq-kplJLYWhBbkpru5JNeSpa8U1PZDFw7-RJShOgXh3uXxLQByvVKX5YJLUeIk0LSCCRjQBShg=w1280-h960-k-no"
  },
  "emp_buzios_canto-resto": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLcEcrAGeiSmqlogcKnltxDpoiCctkCMUNHiRfktNHuqg3ar7SPaShZCmATw2uwlJvHsnm_XI2Ge_JAaqAFGcZTHaaPUKXp-0kSF7UbVIq6VtDhYfQXJY1EZJD2zH0xbPUMPgehSjVAhwBsy=w1280-h960-k-no"
  },
  "emp_iguaba_grande_casa-da-picanha": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLdCMDQLCPxfQN0AMsl8oUhi7p85JlipdDjb-ybklodH9MBlo-Ry8j3mgY2C3UsMF7jYehU8yEcaQAI2uQZqECitSMVzVBH4GoNxKbZlPK428stpF_XvzSTaKRNTgMlnJuRwxUY=w1280-h960-k-no"
  },
  "emp_saquarema_casa-da-praia-itauna": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLdcmJSQV-HKVLFCPmaVvz-j3isYyvBgk7oRzthKAnxt0BYz8SJR8RmzgjeCxRSkSmXvDL17uWLj7aGGYRLLxJpZMskEXjpcMx9wxhbUEGNv3zaM8EFmszGmMQogidtuS008SkUg=w1280-h960-k-no"
  },
  "emp_arraial_do_cabo_esquina-da-onda": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLfyHmcPlD4Yvk9g1b5bswMG_7AZ7OpuHUtgDj445PZwLHuUc_YKScYwrw-lvPFB1cdnEGRkvClsDvfY40dXFnumDNgplUie8bHDjTfLnH19WeuCMMIG2ljC8EclvI7y5FaKFNEt=w1280-h960-k-no"
  },
  "emp_saquarema_estrela-do-mar-saquarema": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLeJV9Bg_G_XwQPUjGCXfEyhyPsZPHfk7wST1G4WAemyliLfKYTNu8DK-mNKtSGENF55n9QTsQ2yDBcLdVWyxZzPEGnYO5aUU9y8dwusLiJ_Ci9TgsYvbw-SDd3Sdu5SSNRhPqPh3QNKJHrU=w1280-h960-k-no"
  },
  "emp_arraial_do_cabo_gabi-s-hamburgueria": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLeWS9AgPsitgeBiArXN61qVza2VMN00RPPvNefiop9mavhZrVYu6JA7Sq42U6J9QeRnSFH851uqJcBmm5O2Ek8Q38a_aC8mbB0c5za7Gg-AX28pRI3D9x4X6ztstEzHhd2ufs0=w1280-h960-k-no"
  },
  "emp_iguaba_grande_iguaba-palace-hotel": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLf6NUdBa6uG3GEFCedR2oijk-alk9B02AwNCJSgFXBzlClYs5I8de0qTe1Fe0BWM1OXPqvGj4f3PDv4Jyh6qWBrnskcNY4MnXQRrpVl7hx2bvYOuSNXuqG8qQ18HSc9HucyXuFPVw=w1280-h960-k-no"
  },
  "emp_cabo_frio_kento-cozinha-oriental": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLc50cf1w4TqV0O4VowA3tkg8HOHXqJrhqoA19rmy9Mk1xqXrmXP3jLytKofTvQgM7SzjyILUVA3TJJ3GaJj8MTmKaUCmUlIRduShx2L_n3loOLvqKBYauCqduofwQr6EscI7dQF=w1280-h960-k-no"
  },
  "emp_araruama_la-bodeguita-restaurante-e-pizzaria": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLcveAaMYQV6bHmY7_eqTTkHcgvygwfxpb9nC5J5IVTTNRcvsaP7qxopU-1n0xUJSrKWljXaOllwx1WcHdTTOWwhRSJIF1VeRuwnVfbrz-Se_uER6kle3PpZKoz51TEK1zh7PyBkdw=w1280-h960-k-no"
  },
  "emp_arraial_do_cabo_lorenzzo-burguer": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLeJ_yAFxHMLmCIkBcN0SFRsNbaIqK-cSfeW7xLi6MyifHb6sx7Y7CEWQctCAqnUDqmphzSB3hO3Q3azd0n6gVHdoUgbzdm72txa9vKKUh9C3k6IaSJd0E0EmlbKlrCPfFPKP-E=w1280-h960-k-no"
  },
  "emp_sao_pedro_da_aldeia_outros500-bar-restaurante": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLcCNiuwES2Q0cgJvhzG4UxOaR3icXAdajfOWyExYsXc4zow0NK4SLN1T_hEr28lmy7x2bTSHKbmUM42V_mb3RZWUWMHMTrnlYavmS7pLzskOaHk3F54zoaPwZkorfk51X7AO12PUw=w1280-h960-k-no"
  },
  "emp_arraial_do_cabo_pimenta-rosa-gastronomia": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLdCqPniECzhGb1hU1b14eScJd6e_3PSsFb3plMY8H3XhUZiIsRdwNMq_aoWvflVfbEuHULw9mOipY7MEyw8WxPp44qdAHHtTpMl6pAa2XSJl-cz-Ik3ql3WdmZ0Fg1YgXosQoY=w1280-h960-k-no"
  },
  "emp_arraial_do_cabo_pousada-atalaia-boutique": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLfTLYJxb41fcL4lLjOAgENHsQph41l4BopZliwdWMCdaovmrFe3DdHDgc42Mf23-cB05ItKNFp3itwgKzq59xY28Ox_S0R2roQ-3_h_f_Q98IrpGi1iyU-XryTnYu8qVSz9jkjAzMss648x=w1280-h960-k-no"
  },
  "emp_saquarema_pousada-catavento": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLf9sz6TWEY6cqZ7YZL2S03VzqZpgOUyrOA3YUaficIdydSzDvY3K7yov0T5R2gk85Z-nXOqyGFv1K2-fMEoD9TYuStk89FXWzHVD9gIjRj3W8hG96QNNHGpcREfurgw4d66zYDzrw=w1280-h960-k-no"
  },
  "emp_iguaba_grande_pousada-das-andorinhas": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLf5v1eVp5BYAM5nyPpCj_GAmLwEYu0WNAeYUq3Nf69YpApRXTEt14B3hq-uWJIsJWZTBuW7RbvngpQ16pPY7ozS0wskE-f4lK39Jbyr-nInrO94ga_vrll7Vx6XAjmDNg7R1c5W=w1280-h960-k-no"
  },
  "emp_saquarema_pousada-fruto-de-itauna": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLeAcHu7dPm10bSPEp-7gPEUsohttbHmnl0ftruZvO2gRc4E8iT80evW6YviJiBBCyzEi43O_F1WglU_zdLA7BZjz8qchLCIb_GTstgk_t-VQiBC17Wb6GEihD5txesQ4H4RqZ72RbksSKwA=w1280-h960-k-no"
  },
  "emp_arraial_do_cabo_pousada-hotel-praia-dos-anjos": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLfREuESWDTXlrV7SfVWl8MveN42pAPWJ7cbkLh8Bwy_CcElmsXrBA3P-XyEWOluz3UH13E644X6lv1Qgom5AFg4yi8-6qxA7rZbNJxJnwnYJHWxmjMC75e8RLQQ73pS8AwJxjyL=w1280-h960-k-no"
  },
  "emp_araruama_recanto-suites": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLfK-H532boz6du8SDu7MPRktDGPuNw5dAzDfmZA8JkITVWdLtEJBuTix_Ja32-CeRgJUPAFnoSQhgD7yUWc16k1KOCmUhY7dga4cQMVJaZLMFBBdIPrRVeFnaooqJ5vuVe8Uyi1=w1280-h960-k-no"
  },
  "emp_cabo_frio_restaurante-mar": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLcEp_qrgodoRWBY0csOUeh3hf1bGvGjgT0kWONC190LJ3KAWXum_FEI32anEqNXpH9-PCKgUkZqvwT8feOIJQBgF91cQoQBzRpon_ASspFKMPPCq0uUB2VhXw9Hbmst92mrkgSHhT7pxiE=w1280-h960-k-no"
  },
  "emp_araruama_restaurante-mediterraneo": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLcAIfzmXty6lgGMKEbwSJ0mH84rn0eke85w4S0-kq9308cmFOv6Qg-dcpakP8OWAXa1_smAX-5gSU9kpMBNbp499YlnZnisNk30uFeJfU-NWEzbmq2fo7gcx_tT7aKBSbUQJz97=w1280-h960-k-no"
  },
  "emp_araruama_restaurante-picanha-do-gugu": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLc_x-J79r2Xypo5_LMb3lGzFRFq1C-jJ5IILgJ5iujU0pYi7AfDQjo2YGW9ld8tdEIfxn_KrFqLxlHB17MipIRsdGi0u2_6e06cQ80bm4vU4dwUAqKs9V31ZNCRpHQ1hVlD5507=w1280-h960-k-no"
  },
  "emp_saquarema_restaurante-saquasuco": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLchI9i6aqkqGj-i4hV2pxMOYGW8y5WCJokzyUFfZ2LM4eVK3i_UPXjh6gQGRKvAYiXED2iTtoYN33NK77Vv0qdjmlPZjzZ_LoeXu0iMDNuGeyxWAdrToZLCKN4Pze0Nkzeqdt5LgGkVzZLj=w1280-h960-k-no"
  },
  "emp_arraial_do_cabo_smash-do-cabo-hamburgueria": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLfbr4LRNFeagdvQX-wrXAtQKUbC6gfQdY4pzsEexqM-e69rkWK_rZ0Kzvoq_c2_9iK6FfwfpVjXVUx6veny5ouIH06TmXFK9utGb6iEpsl1jQWv5LzJS1qOaRthQKiHs0UtUg9Q0FG1KOY=w1280-h960-k-no"
  },
  "emp_sao_pedro_da_aldeia_toshi-conceito": {
    "coverImage": "https://lh3.googleusercontent.com/grass-cs/AABkmLeUYrvnLRIcBn7fiv8ahpVALn64QoqI9VE09t67PaqMowI6RVsX4iWRrMMsPszqsFyXhZEsi_0w1s3LkafSNdI9viEA2tUHM8Qbg6tOHPF9C6cMJDjTWkiRM4jlGw1MHdZ3pMz-fw=w1280-h960-k-no"
  },
};
