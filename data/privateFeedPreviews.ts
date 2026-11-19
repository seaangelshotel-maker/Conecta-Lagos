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
  // Licença aberta (Wikimedia Commons): basta o crédito. Fotos escolhidas olhando cada uma (ver docs/FOTOS_FEED.md).
  'guia_praia-do-farol': {
    key: '201411b9dd',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Praia_do_Farol_-_Arraial_do_Cabo.JPG?width=1280',
    credit: { author: 'Edulonde', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Praia_do_Farol_-_Arraial_do_Cabo.JPG' },
  },
  'guia_praia-do-forno': {
    key: 'bbebcdfe5c',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Praia_do_Forno_-_Arraial.jpg?width=1280',
    credit: { author: 'Leonardo Shinagawa', license: 'CC BY 2.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Praia_do_Forno_-_Arraial.jpg' },
  },
  'guia_praia-grande-por-do-sol-estrutura-e-experiencias': {
    key: '7ccd92aca5',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Praia_Grande_-_Arraial_do_Cabo_-_panoramio.jpg?width=1280',
    credit: { author: 'TMbux', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Praia_Grande_-_Arraial_do_Cabo_-_panoramio.jpg' },
  },
  'guia_praias-de-arraial-do-cabo': {
    key: 'b6b20d5188',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Praia_do_Pontal_(Arraial_do_Cabo).JPG?width=1280',
    credit: { author: 'Eduardo P', license: 'Domínio público', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Praia_do_Pontal_(Arraial_do_Cabo).JPG' },
  },
  'guia_prainhas-do-pontal-do-atalaia': {
    key: '4ff5d0413a',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pontal_do_Atalaia,_Parque_Estadual_da_Costa_do_Sol,_N%C3%BAcleo_Atalaia_-_Dama_Branca.JPG?width=1280',
    credit: { author: 'Daniel Souza Lima', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pontal_do_Atalaia,_Parque_Estadual_da_Costa_do_Sol,_N%C3%BAcleo_Atalaia_-_Dama_Branca.JPG' },
  },
  'guia_mergulho-em-arraial-do-cabo': {
    key: 'ad5e5fffc7',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Mergulho_IEAPM_para_levantamento_de_bentos_(52503707427).jpg?width=1280',
    credit: { author: 'Marinha do Brasil', license: 'CC BY-SA 2.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Mergulho_IEAPM_para_levantamento_de_bentos_(52503707427).jpg' },
  },
  'guia_passeio-de-barco-em-arraial-do-cabo': {
    key: '1d755c6d5d',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pairando_no_mar_azul.jpg?width=1280',
    credit: { author: 'Anabel Kovacs', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pairando_no_mar_azul.jpg' },
  },
  'guia_a-historia-de-arraial-do-cabo': {
    key: '123aba2583',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Favela_doa_Pescadores_Praia_Grande_-_panoramio_(1).jpg?width=1280',
    credit: { author: 'TMbux', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Favela_doa_Pescadores_Praia_Grande_-_panoramio_(1).jpg' },
  },
  'mirantes-imperdiveis': {
    key: 'fdd3e9ad76',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Praia_Brava_-_Pontal_do_Atalaia.jpg?width=1280',
    credit: { author: 'Renan do Carmo de Souza', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Praia_Brava_-_Pontal_do_Atalaia.jpg' },
  },
  'compras-ruabiquinis': {
    key: '20d1ccd843',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Rua_dos_Biqu%C3%ADnis_em_Cabo_Frio.JPG?width=1280',
    credit: { author: 'Esalq', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Rua_dos_Biqu%C3%ADnis_em_Cabo_Frio.JPG' },
  },
  'gastronomia-buzios-orlabardot': {
    key: 'f86493c5bc',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/B%C3%BAzios_RJ_Brasil_-_Orla_Bardot_-_panoramio_(1).jpg?width=1280',
    credit: { author: 'Josue Marinho', license: 'CC BY 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:B%C3%BAzios_RJ_Brasil_-_Orla_Bardot_-_panoramio_(1).jpg' },
  },
  'festas-luau-praia': {
    key: '24a5d2b47d',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pontal_do_Atalaia_(Arraial_do_Cabo_-_RJ).jpg?width=1280',
    credit: { author: 'Gladstone Peixoto Moraes', license: 'Domínio público', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pontal_do_Atalaia_(Arraial_do_Cabo_-_RJ).jpg' },
  },
  'gastronomia-bairro-passagem': {
    key: '333f5576d7',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Passagem,_Cabo_Frio_-_RJ,_Brazil_-_panoramio.jpg?width=1280',
    credit: { author: 'Newton paz peres', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Passagem,_Cabo_Frio_-_RJ,_Brazil_-_panoramio.jpg' },
  },
  'guia_guia-completo-de-arraial-do-cabo': {
    key: '491db5efe3',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Prainha_Arraial_do_Cabo.jpg?width=1280',
    credit: { author: 'Noel Portugal', license: 'CC BY 2.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Prainha_Arraial_do_Cabo.jpg' },
  },
  'guia_quando-visitar-arraial-do-cabo': {
    key: '5b65a3c7f2',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Praia.dos.Anjos.Arraial.do.Cabo.jpg?width=1280',
    credit: { author: 'Msadp06', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Praia.dos.Anjos.Arraial.do.Cabo.jpg' },
  },
};

/** Devolve a prévia só se a chave do link bater (senão a página mostra a dica normal). */
export const getFeedPhotoPreview = (postId: string, key: string | null): FeedPhotoPreview | null => {
  const p = FEED_PHOTO_PREVIEWS[postId];
  return p && key && key === p.key ? p : null;
  'guia_arraial-do-cabo-alem-das-praias': {
    key: '0ce2e9709a',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Parque_Estadual_da_Costa_do_Sol_por_Cesar_Vieira_(04).jpg?width=1280',
    credit: { author: 'Cesar Vieira', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Parque_Estadual_da_Costa_do_Sol_por_Cesar_Vieira_(04).jpg' },
  },
  'guia_arraial-do-cabo-em-2-dias': {
    key: 'ab630fcf44',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Prainhas_do_Pontal_e_Ilha_do_Farol_em_Arraial_do_Cabo,RJ.jpg?width=1280',
    credit: { author: 'Eduardo Cerqueira dos Santos', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Prainhas_do_Pontal_e_Ilha_do_Farol_em_Arraial_do_Cabo,RJ.jpg' },
  },
  'guia_arraial-do-cabo-em-3-dias': {
    key: '9b8babde9e',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Pontal_do_Atalaia_(Arraial_do_Cabo_-_RJ).jpg?width=1280',
    credit: { author: 'Gladstone Peixoto Moraes', license: 'Domínio público', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Pontal_do_Atalaia_(Arraial_do_Cabo_-_RJ).jpg' },
  },
  'guia_arraial-do-cabo-para-casais': {
    key: 'a2c910b5d9',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/P%C3%B4r_do_Sol_na_praia_grande,_Arraial_do_Cabo.jpg?width=1280',
    credit: { author: 'Renan do Carmo de Souza', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:P%C3%B4r_do_Sol_na_praia_grande,_Arraial_do_Cabo.jpg' },
  },
  'guia_arraial-do-cabo-para-familias-com-criancas': {
    key: '73a8f2786e',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Praia.dos.Anjos.Arraial.do.Cabo.jpg?width=1280',
    credit: { author: 'Msadp06', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Praia.dos.Anjos.Arraial.do.Cabo.jpg' },
  },
  'guia_o-que-fazer-em-arraial-do-cabo-quando-chove': {
    key: 'a78a9b91f0',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Museu_Oceanogr%C3%A1fico,_em_Arraial_do_Cabo_RJ_(52247823379).jpg?width=1280',
    credit: { author: 'Marinha do Brasil', license: 'CC BY-SA 2.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Museu_Oceanogr%C3%A1fico,_em_Arraial_do_Cabo_RJ_(52247823379).jpg' },
  },
  'guia_os-arredores-de-arraial-do-cabo': {
    key: '40fefbca17',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Entrance_to_Gruta_Azul_on_Ilha_do_Cabo_Frio,_Arraial_do_Cabo,_Brazil.jpg?width=1280',
    credit: { author: 'Wilfredor', license: 'CC0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Entrance_to_Gruta_Azul_on_Ilha_do_Cabo_Frio,_Arraial_do_Cabo,_Brazil.jpg' },
  },
  'guia_praias-trilhas-e-natureza-explore-com-responsabilidade': {
    key: 'd153855d97',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Arraial_do_Cabo-RJ_Trilha_do_Vigia_Praia_Grande.jpg?width=1280',
    credit: { author: 'Adriane Rado', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Arraial_do_Cabo-RJ_Trilha_do_Vigia_Praia_Grande.jpg' },
  },
  'festival-gastronomico-cabofrio': {
    key: '8a41900784',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/PlayaForteSaoMateo1-CaboFrio-Brasil-feb2016.jpg?width=1280',
    credit: { author: 'Ezarate', license: 'CC BY-SA 3.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:PlayaForteSaoMateo1-CaboFrio-Brasil-feb2016.jpg' },
  },
  'guia-sobrevivencia-temporada': {
    key: 'b0ef6672ca',
    imageUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/O_caminho_do_azul.jpg?width=1280',
    credit: { author: 'Anabel Kovacs', license: 'CC BY-SA 4.0', sourceUrl: 'https://commons.wikimedia.org/wiki/File:O_caminho_do_azul.jpg' },
  },
};
