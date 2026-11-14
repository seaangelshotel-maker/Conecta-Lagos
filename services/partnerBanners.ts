/** Banners de parceiros (links de afiliado). Funções puras: validação e filtro do que aparece na Home. */
export interface PartnerBanner {
  id: string;
  name: string;
  /** Link de afiliado (https). */
  url: string;
  /** Logo ou banner do programa de afiliados (https). Opcional. */
  imageUrl?: string;
  /** Frase curta sob o nome. */
  text?: string;
  active: boolean;
}

const isHttps = (u?: string) => { try { return !!u && new URL(u).protocol === 'https:'; } catch { return false; } };

/** Mantém só banners válidos: nome, link https e (se houver) imagem https. */
export const sanitizePartnerBanners = (list: PartnerBanner[] = []): PartnerBanner[] =>
  list
    .map(b => ({ ...b, name: (b.name || '').trim().slice(0, 40), text: (b.text || '').trim().slice(0, 80), url: (b.url || '').trim(), imageUrl: (b.imageUrl || '').trim() }))
    .filter(b => b.name && isHttps(b.url) && (!b.imageUrl || isHttps(b.imageUrl)))
    .map(b => ({ ...b, imageUrl: b.imageUrl || undefined, text: b.text || undefined }));

/** O que o visitante vê: só os ativos e válidos. */
export const visiblePartnerBanners = (list: PartnerBanner[] = []): PartnerBanner[] =>
  sanitizePartnerBanners(list).filter(b => b.active);

export const PARTNER_DISCLOSURE = 'Links de parceiros: o Lagos GO pode receber uma comissão se você comprar, sem custo extra para você.';
