/**
 * Prévias PRIVADAS de lugares públicos (praias, ruas, igrejas, mirantes) com foto de licença aberta (Wikimedia Commons).
 * Link: /previa/<id>?k=<chave>. Autor e licença ficam em `source`; ao publicar, exibir o crédito.
 */
import type { PrivatePreview } from './privatePreviews';

export const PRIVATE_PLACE_PREVIEWS: Record<string, PrivatePreview> = {
  // vazio: fotos aprovadas e publicadas com crédito (ver data/approvedPhotos.ts)
};
