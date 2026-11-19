/**
 * Prévias PRIVADAS das dicas do Feed com foto real e crédito.
 *
 * Por que existe: as dicas do feed usavam fotos genéricas de banco de imagem. Aqui cada dica ganha uma foto
 * do lugar, com o crédito de quem fez. Enquanto a foto não é aprovada, ela só aparece por um link secreto:
 *   /previa-dica/<id-da-dica>?k=<chave>
 * A página não vai para o Google (noindex + robots) e não aparece no feed.
 *
 * Fluxo:
 *  1. As fotos são buscadas no Wikimedia Commons (licença aberta: basta o crédito) pelo script em
 *     docs/FOTOS_FEED.md. Foto que NÃO é de licença aberta entra com `needsPermission: true` e o contato
 *     de quem precisa autorizar em `permissionNote`.
 *  2. O Yuri confere cada link. Aprovada, a foto passa para o campo imageUrl/imageCredit da dica no
 *     Admin (ou é aplicada pelo importador) e a linha daqui é apagada.
 *
 * As imagens são exibidas direto da fonte (endereço), não são copiadas para o nosso servidor.
 */
import type { ImageCredit } from '../types';

export interface FeedPhotoPreview {
  /** Chave secreta do link de prévia */
  key: string;
  /** Endereço da imagem (já em largura adequada) */
  imageUrl: string;
  /** Autor + licença mostrados em legenda sob a foto */
  credit: ImageCredit;
  /** true = licença não é aberta: precisa de autorização do autor antes de publicar */
  needsPermission?: boolean;
  /** Quem contatar / como pedir a autorização (só aparece para nós, nunca na página) */
  permissionNote?: string;
}

export const FEED_PHOTO_PREVIEWS: Record<string, FeedPhotoPreview> = {
};

/** Devolve a prévia só se a chave do link bater (senão a página mostra a dica normal). */
export const getFeedPhotoPreview = (postId: string, key: string | null): FeedPhotoPreview | null => {
  const p = FEED_PHOTO_PREVIEWS[postId];
  return p && key && key === p.key ? p : null;
};
