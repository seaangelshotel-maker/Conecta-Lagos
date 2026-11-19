/**
 * Prévias PRIVADAS para mostrar a ficha completa ao dono da empresa antes de ele autorizar fotos.
 * Aberta só por link com chave (/previa/<id>?k=<chave>), fora do Google, sem aparecer no guia.
 * As imagens são exibidas direto do site oficial da própria empresa (não são copiadas nem guardadas aqui).
 * Quando o dono autorizar/enviar as fotos, o link é apagado daqui.
 */
import type { BusinessProfile } from '../types';
import { PRIVATE_PLACE_PREVIEWS } from './privatePlacePreviews';

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
  // Ancho e Faca Churrascaria
  'emp_cabo_frio_ancho-e-faca-churrascaria': { key: '0bc95c77ed', source: "sem foto (aguardando envio do dono)" },
  // Anchova na Brasa
  'emp_arraial_do_cabo_anchova-na-brasa': { key: 'a90e18a7d9', source: "sem foto (aguardando envio do dono)" },
  // Bamba
  'emp_cabo_frio_bamba': { key: 'aab15f2916', source: "sem foto (aguardando envio do dono)" },
  // Bar do Cajueiro by Bodega Boa
  'emp_saquarema_bar-do-cajueiro-by-bodega-boa': { key: '06248a3581', source: "sem foto (aguardando envio do dono)" },
  // Cantinho do Peixe
  'emp_sao_pedro_da_aldeia_cantinho-do-peixe': { key: 'b14b84e7b7', source: "sem foto (aguardando envio do dono)" },
  // Casa da Picanha
  'emp_iguaba_grande_casa-da-picanha': { key: 'dfc4f88272', source: "sem foto (aguardando envio do dono)" },
  // Casa da Praia Itaúna
  'emp_saquarema_casa-da-praia-itauna': { key: '61b25f1df6', source: "sem foto (aguardando envio do dono)" },
  // Estrela do Mar Saquarema
  'emp_saquarema_estrela-do-mar-saquarema': { key: '68af866ffb', source: "sem foto (aguardando envio do dono)" },
  // Kentô Cozinha Oriental
  'emp_cabo_frio_kento-cozinha-oriental': { key: '794ab33469', source: "sem foto (aguardando envio do dono)" },
  // La Bodeguita Restaurante e Pizzaria
  'emp_araruama_la-bodeguita-restaurante-e-pizzaria': { key: '7148c904af', source: "sem foto (aguardando envio do dono)" },
  // Lorenzzo Burguer
  'emp_arraial_do_cabo_lorenzzo-burguer': { key: 'fdf2d5fc59', source: "sem foto (aguardando envio do dono)" },
  // Lounge da Praia
  'emp_arraial_do_cabo_lounge-da-praia': { key: '5d026e3c75', source: "sem foto (aguardando envio do dono)" },
  // Outros500 Bar & Restaurante
  'emp_sao_pedro_da_aldeia_outros500-bar-restaurante': { key: '654c3718a1', source: "sem foto (aguardando envio do dono)" },
  // Pimenta Rosa Gastronomia
  'emp_arraial_do_cabo_pimenta-rosa-gastronomia': { key: '065db3d5bb', source: "sem foto (aguardando envio do dono)" },
  // Pousada Atalaia Boutique
  'emp_arraial_do_cabo_pousada-atalaia-boutique': { key: '207a85adaf', source: "sem foto (aguardando envio do dono)" },
  // Pousada Catavento
  'emp_saquarema_pousada-catavento': { key: '733adbe92d', source: "sem foto (aguardando envio do dono)" },
  // Pousada das Andorinhas
  'emp_iguaba_grande_pousada-das-andorinhas': { key: 'c40c536eb0', source: "sem foto (aguardando envio do dono)" },
  // Pousada Fruto de Itaúna
  'emp_saquarema_pousada-fruto-de-itauna': { key: '111ee2dcbf', source: "sem foto (aguardando envio do dono)" },
  // Pousada Hotel Praia dos Anjos
  'emp_arraial_do_cabo_pousada-hotel-praia-dos-anjos': { key: 'fea61b0893', source: "sem foto (aguardando envio do dono)" },
  // Pousada Melodia do Mar
  'emp_cabo_frio_pousada-melodia-do-mar': { key: '1bc6386ff0', source: "sem foto (aguardando envio do dono)" },
  // Recanto Suítes
  'emp_araruama_recanto-suites': { key: '684fbb35ff', source: "sem foto (aguardando envio do dono)" },
  // Restaurante Mar.
  'emp_cabo_frio_restaurante-mar': { key: 'e73779ac6c', source: "sem foto (aguardando envio do dono)" },
  // Restaurante Picanha do Gugu
  'emp_araruama_restaurante-picanha-do-gugu': { key: 'c9335b6224', source: "sem foto (aguardando envio do dono)" },
  // Restaurante Saquasuco
  'emp_saquarema_restaurante-saquasuco': { key: '2a58ad07b1', source: "sem foto (aguardando envio do dono)" },
  // Rocka Restaurant & Beach Lounge
  'emp_buzios_rocka-restaurant-beach-lounge': { key: '8888d51ddd', source: "sem foto (aguardando envio do dono)" },
  // Smash do Cabo Hamburgueria
  'emp_arraial_do_cabo_smash-do-cabo-hamburgueria': { key: '9f3b712231', source: "sem foto (aguardando envio do dono)" },
  // The Bull Restaurant
  'emp_sao_pedro_da_aldeia_the-bull-restaurant': { key: 'd5a13b61a6', source: "sem foto (aguardando envio do dono)" },
  // The Duck Rock Pub
  'emp_cabo_frio_the-duck-rock-pub': { key: '6cf47f5825', source: "sem foto (aguardando envio do dono)" },
  // Toshi Conceito
  'emp_sao_pedro_da_aldeia_toshi-conceito': { key: '161e005906', source: "sem foto (aguardando envio do dono)" },
};

export const getPrivatePreview = (businessId: string, key: string | null): PrivatePreview | null => {
  const p = PRIVATE_PREVIEWS[businessId] || PRIVATE_PLACE_PREVIEWS[businessId];
  return p && key && key === p.key ? p : null;
};
