/**
 * Prévias PRIVADAS de lugares públicos (praias, ruas, igrejas, mirantes) com foto de licença aberta (Wikimedia Commons).
 * Link: /previa/<id>?k=<chave>. Autor e licença ficam em `source`; ao publicar, exibir o crédito.
 */
import type { PrivatePreview } from './privatePreviews';

export const PRIVATE_PLACE_PREVIEWS: Record<string, PrivatePreview> = {
  'pub_buzios_praia-de-caravelas': { key: 'be267f3e7c', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/Praia_das_Caravelas_2.jpg?width=1280", source: "Wikimedia Commons · Raquelmlinhares · CC BY-SA 4.0 · https://commons.wikimedia.org/wiki/File:Praia_das_Caravelas_2.jpg" },
  'pub_buzios_estatua-de-brigitte-bardot': { key: 'c4e93faf8d', coverImage: "https://commons.wikimedia.org/wiki/Special:FilePath/B%C3%BAzios_RJ_Brasil_-_Est%C3%A1tua_de_Brigit_Bardot,_Orla_Bardot_-_panoramio.jpg?width=1280", source: "Wikimedia Commons · Josue Marinho · CC BY 3.0 · https://commons.wikimedia.org/wiki/File:B%C3%BAzios_RJ_Brasil_-_Est%C3%A1tua_de_Brigit_Bardot,_Orla_Bardot_-_panoramio.jpg" },
};
