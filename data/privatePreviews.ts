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
  // Açaí Forte do Cabo
  'emp_arraial_do_cabo_acai-forte-do-cabo': { key: 'f0f83ab67c', source: "sem foto (aguardando envio do dono)" },
  // Anchova na Brasa
  'emp_arraial_do_cabo_anchova-na-brasa': { key: 'a90e18a7d9', source: "sem foto (aguardando envio do dono)" },
  // Bar do Cajueiro by Bodega Boa
  'emp_saquarema_bar-do-cajueiro-by-bodega-boa': { key: '06248a3581', source: "sem foto (aguardando envio do dono)" },
  // Lounge da Praia
  'emp_arraial_do_cabo_lounge-da-praia': { key: '5d026e3c75', source: "sem foto (aguardando envio do dono)" },
  // Pousada Melodia do Mar
  'emp_cabo_frio_pousada-melodia-do-mar': { key: '1bc6386ff0', source: "sem foto (aguardando envio do dono)" },
  // Princesa Supermercados - Arraial do Cabo III
  'emp_arraial_do_cabo_princesa-supermercados-arraial-do-cabo-iii': { key: '7b41982f6a', source: "sem foto (aguardando envio do dono)" },
  // Restobar Dos Anjos
  'emp_arraial_do_cabo_restobar-dos-anjos': { key: '397b7d1c3a', source: "sem foto (aguardando envio do dono)" },
  // Rocka Restaurant & Beach Lounge
  'emp_buzios_rocka-restaurant-beach-lounge': { key: '8888d51ddd', source: "sem foto (aguardando envio do dono)" },
  // The Bull Restaurant
  'emp_sao_pedro_da_aldeia_the-bull-restaurant': { key: 'd5a13b61a6', source: "sem foto (aguardando envio do dono)" },
  // The Duck Rock Pub
  'emp_cabo_frio_the-duck-rock-pub': { key: '6cf47f5825', source: "sem foto (aguardando envio do dono)" },
};

export const getPrivatePreview = (businessId: string, key: string | null): PrivatePreview | null => {
  const p = PRIVATE_PREVIEWS[businessId] || PRIVATE_PLACE_PREVIEWS[businessId];
  return p && key && key === p.key ? p : null;
};
