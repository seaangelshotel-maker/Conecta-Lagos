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

const omni = (hotel: number, kind: 'Property' | 'RoomTypes', id: string, size = '1024x768') => `https://media.omnibees.com/Images/${hotel}/${kind}/${size}/${id}.jpg`;

export const PRIVATE_PREVIEWS: Record<string, PrivatePreview> = {
  // Pousada Sentinelas do Mar autorizou as fotos e já está pública (19/11/2026)
  'c65FBUpQhACCBCZOUNhe': {
    key: 'ov4h8m2tq6',
    coverImage: omni(4468, 'Property', '202022', '1200x800'),
    gallery: [
      omni(4468, 'Property', '983199'),
      omni(4468, 'Property', '78609'),
      omni(4468, 'Property', '983198'),
      omni(4468, 'Property', '983195'),
      omni(4468, 'RoomTypes', '5766426'),
      omni(4468, 'RoomTypes', '202069'),
      omni(4468, 'RoomTypes', '578930'),
      omni(4468, 'RoomTypes', '983209'),
    ],
    source: 'https://book.omnibees.com/chain/2610/hotel/4468',
  },
};

export const getPrivatePreview = (businessId: string, key: string | null): PrivatePreview | null => {
  const p = PRIVATE_PREVIEWS[businessId];
  return p && key && key === p.key ? p : null;
};
