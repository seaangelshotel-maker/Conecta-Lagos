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
    }
  },
  "9K9O3hoHo0M2Zt1kysPC": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Museu_Oceanogr%C3%A1fico,_em_Arraial_do_Cabo_RJ_(52247823379).jpg?width=1280",
    "imageCredit": {
      "author": "Marinha do Brasil",
      "license": "CC BY-SA 2.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Museu_Oceanogr%C3%A1fico,_em_Arraial_do_Cabo_RJ_(52247823379).jpg"
    }
  },
  "pub_buzios_estatua-de-juscelino-kubitschek": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/ThiagoFreitas_Estatua_de_Juscelino_Kubitschek_Armacao_dos_Buzios_RJ_(27180961608).jpg?width=1280",
    "imageCredit": {
      "author": "MTur Destinos",
      "license": "Public domain",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:ThiagoFreitas_Estatua_de_Juscelino_Kubitschek_Armacao_dos_Buzios_RJ_(27180961608).jpg"
    }
  },
  "pub_cabo_frio_capela-de-nossa-senhora-da-guia": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/CaboFrio_Chapel_of_Nossa_Senhora_da_Guia.JPG?width=1280",
    "imageCredit": {
      "author": "Frenz 69",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:CaboFrio_Chapel_of_Nossa_Senhora_da_Guia.JPG"
    }
  },
  "pub_cabo_frio_igreja-de-sao-benedito": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/CaboFrio_Igreja_de_S%C3%A3o_Benedito.JPG?width=1280",
    "imageCredit": {
      "author": "Frenz 69",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:CaboFrio_Igreja_de_S%C3%A3o_Benedito.JPG"
    }
  },
  "pub_cabo_frio_mirantes-da-praia-das-conchas": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Mirante_da_Praia_das_Conchas_-_Cabo_Frio._(6894111536).jpg?width=1280",
    "imageCredit": {
      "author": "Marinelson Almeida",
      "license": "CC BY 2.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Mirante_da_Praia_das_Conchas_-_Cabo_Frio._(6894111536).jpg"
    }
  },
  "pub_cabo_frio_passarela-e-mirantes-do-forte": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Forte_de_S%C3%A3o_Mateus_do_Cabo_Frio_01.jpg?width=1280",
    "imageCredit": {
      "author": "Halley Pacheco de Oliveira",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Forte_de_S%C3%A3o_Mateus_do_Cabo_Frio_01.jpg"
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
    }
  },
  "HFDqT61LCgznhV0FLqEy": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_das_Conchas_em_Cabo_Frio.JPG?width=1280",
    "imageCredit": {
      "author": "Esalq",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Praia_das_Conchas_em_Cabo_Frio.JPG"
    }
  },
  "KFcex4ruU64009ddTyNx": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_do_Per%C3%B3,_no_Parque_Estadual_da_costa_do_Sol_em_Cabo_Frio-RJ.JPG?width=1280",
    "imageCredit": {
      "author": "Eduardo Cerqueira dos Santos",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Praia_do_Per%C3%B3,_no_Parque_Estadual_da_costa_do_Sol_em_Cabo_Frio-RJ.JPG"
    }
  },
  "QznImY9rWZZxk3mGpUpZ": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Fenda_de_Nossa_Senhora_da_Concei%C3%A7%C3%A3o.jpg?width=1280",
    "imageCredit": {
      "author": "Lorraineoli",
      "license": "CC BY-SA 4.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Fenda_de_Nossa_Senhora_da_Concei%C3%A7%C3%A3o.jpg"
    }
  },
  "YyqC6RzefQKmxEnx8V03": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Convento_e_Igreja_de_Nossa_Senhora_dos_Anjos_01.jpg?width=1280",
    "imageCredit": {
      "author": "Halley Pacheco de Oliveira",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Convento_e_Igreja_de_Nossa_Senhora_dos_Anjos_01.jpg"
    }
  },
  "i1lnZjubrZnJZLQdciA7": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_do_Siqueira_-_Parque_Estadual_da_Costa_do_Sol_-_Cabo_Frio,RJ.JPG?width=1280",
    "imageCredit": {
      "author": "Eduardo Cerqueira dos Santos",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Praia_do_Siqueira_-_Parque_Estadual_da_Costa_do_Sol_-_Cabo_Frio,RJ.JPG"
    }
  },
  "oCQHKACV6VRkdFJIq6rj": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/S%C3%A3o_Bento,_Cabo_Frio_-_RJ,_Brazil_-_panoramio.jpg?width=1280",
    "imageCredit": {
      "author": "Newton paz peres",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:S%C3%A3o_Bento,_Cabo_Frio_-_RJ,_Brazil_-_panoramio.jpg"
    }
  },
  "xujTPc43IbEuuSVo1aq4": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/GrutaAzulArraialdoCaboBrasil-feb2016.jpg?width=1280",
    "imageCredit": {
      "author": "Ezarate",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:GrutaAzulArraialdoCaboBrasil-feb2016.jpg"
    }
  },
  "8BRL8yQLLUKis13rZbtA": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Canal_do_Itajuru_05.jpg?width=1280",
    "imageCredit": {
      "author": "Halley Pacheco de Oliveira",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Canal_do_Itajuru_05.jpg"
    }
  },
  "90dvvjysg7xSLL37OaIw": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Rua_dos_Biqu%C3%ADnis_em_Cabo_Frio.JPG?width=1280",
    "imageCredit": {
      "author": "Esalq",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Rua_dos_Biqu%C3%ADnis_em_Cabo_Frio.JPG"
    }
  },
  "LBkhfzRRUt29ChItkSeW": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Ilha_do_Japon%C3%AAs_em_Cabo_Frio,_Regi%C3%A3o_dos_lagos-RJ.JPG?width=1280",
    "imageCredit": {
      "author": "Eduardo Cerqueira dos Santos",
      "license": "CC BY-SA 3.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Ilha_do_Japon%C3%AAs_em_Cabo_Frio,_Regi%C3%A3o_dos_lagos-RJ.JPG"
    }
  },
  "NatqpP54P8F3lBcSYLs3": {
    "coverImage": "https://commons.wikimedia.org/wiki/Special:FilePath/Igreja_de_Nossa_Senhora_dos_Rem%C3%A9dios_em_Arraial_do_Cabo_.jpg?width=1280",
    "imageCredit": {
      "author": "marcusrg",
      "license": "CC BY 2.0",
      "sourceUrl": "https://commons.wikimedia.org/wiki/File:Igreja_de_Nossa_Senhora_dos_Rem%C3%A9dios_em_Arraial_do_Cabo_.jpg"
    }
  }
};
