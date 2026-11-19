/**
 * Fotos de licença aberta (Wikimedia Commons) aplicadas nas dicas e matérias PÚBLICAS.
 *
 * A fonte é a mesma tabela das prévias (data/privateFeedPreviews.ts): toda linha SEM `needsPermission`
 * já tem licença que permite uso com crédito, então vai para o ar com a legenda "Foto: autor · licença".
 * Linhas com `needsPermission: true` ficam só na prévia privada até o autor autorizar.
 *
 * Regra de segurança: a foto só entra quando a dica não tem imagem própria (vazia ou genérica do Unsplash).
 * Se o admin colocar uma foto própria depois, ela prevalece.
 */
import type { BlogPost } from '../types';
import { FEED_PHOTO_PREVIEWS } from './privateFeedPreviews';

const isGeneric = (url?: string) => !url || /unsplash\.com/i.test(url);

export const withOpenPhoto = <T extends Pick<BlogPost, 'id' | 'imageUrl' | 'imageCredit'>>(post: T): T => {
  const p = FEED_PHOTO_PREVIEWS[post.id];
  if (!p || p.needsPermission || post.imageCredit || !isGeneric(post.imageUrl)) return post;
  return { ...post, imageUrl: p.imageUrl, imageCredit: p.credit };
};
