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
  // vazio: tudo aprovado e publicado (ver data/approvedPhotos.ts)
};

export const getPrivatePreview = (businessId: string, key: string | null): PrivatePreview | null => {
  const p = PRIVATE_PREVIEWS[businessId] || PRIVATE_PLACE_PREVIEWS[businessId];
  return p && key && key === p.key ? p : null;
};
