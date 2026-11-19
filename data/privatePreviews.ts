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

const wix = (id: string, w: number, h: number) => `https://static.wixstatic.com/media/${id}/v1/fill/w_${w},h_${h},al_c,q_80/foto.jpg`;

export const PRIVATE_PREVIEWS: Record<string, PrivatePreview> = {
  'emp_arraial_do_cabo_pousada-sentinelas-do-mar': {
    key: 'sm7k2q9x4v',
    coverImage: wix('9f7454_635ecb1d93ea4a20afcfeec1193b45f4~mv2.png', 1200, 700),
    gallery: [
      wix('9f7454_09c1c90503fb4baeaf84bc3416b30670~mv2.png', 1000, 750),
      wix('9f7454_d824e6f9cb354c61ac57b366791b2980~mv2.png', 1000, 750),
      wix('9f7454_125e93a435464a468300f96cfa7aa9ebf002.jpg', 1000, 750),
    ],
    source: 'https://www.sentinelasdomar.com.br/pousada',
  },
};

export const getPrivatePreview = (businessId: string, key: string | null): PrivatePreview | null => {
  const p = PRIVATE_PREVIEWS[businessId];
  return p && key && key === p.key ? p : null;
};
