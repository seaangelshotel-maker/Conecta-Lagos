/**
 * Fotos ILUSTRATIVAS (Wikimedia Commons, licença aberta) para eventos que não têm foto própria.
 *
 * Por que existe: o calendário oficial só traz nome e data, então a maioria dos eventos aparecia sem foto.
 * Aqui, por tema (palavra no título), entra uma foto do lugar/tema com o crédito de quem fez. A foto é do
 * tema, NÃO do evento deste ano, e por isso a legenda diz "Foto ilustrativa".
 *
 * Regras de segurança:
 *  - só entra quando o evento não tem `coverImage` própria (a do organizador sempre prevalece);
 *  - só licença aberta (CC0 / CC BY / CC BY-SA), com autor e link da fonte;
 *  - tema sem foto boa no Commons fica sem foto (melhor o ícone do que uma foto que não combina).
 */
import type { AppEvent, ImageCredit } from '../types';
import { OFFICIAL_EVENTS_EXTRA } from './officialEventsExtra';

/** Banners originais do Lagos GO (arte própria, sem foto de terceiros) em /public/eventos/<id>.jpg. */
const BANNER_IDS = new Set(OFFICIAL_EVENTS_EXTRA.map(e => e.id));

interface EventPhoto { match: RegExp; imageUrl: string; credit: ImageCredit; }

const F = (file: string) => `https://commons.wikimedia.org/wiki/Special:FilePath/${file}?width=1280`;
const S = (file: string) => `https://commons.wikimedia.org/wiki/File:${file}`;

const PHOTOS: EventPhoto[] = [
  { match: /baleia/i,
    imageUrl: F('Tour_boat_Sarita_beside_a_humpback_whale_off_Arraial_do_Cabo,_Brazil.jpg'),
    credit: { author: 'Wilfredor', license: 'CC0', sourceUrl: S('Tour_boat_Sarita_beside_a_humpback_whale_off_Arraial_do_Cabo,_Brazil.jpg') } },
  { match: /mergulho/i,
    imageUrl: F('Mergulho_IEAPM_para_levantamento_de_bentos_(52503707427).jpg'),
    credit: { author: 'Marinha do Brasil', license: 'CC BY-SA 2.0', sourceUrl: S('Mergulho_IEAPM_para_levantamento_de_bentos_(52503707427).jpg') } },
  { match: /padroeira/i,
    imageUrl: F('Igreja_de_Nossa_Senhora_dos_Rem%C3%A9dios_em_Arraial_do_Cabo.jpg'),
    credit: { author: 'Halley Pacheco de Oliveira', license: 'CC BY-SA 3.0', sourceUrl: S('Igreja_de_Nossa_Senhora_dos_Rem%C3%A9dios_em_Arraial_do_Cabo.jpg') } },
];

/** Devolve o evento com a foto ilustrativa do tema (se houver e se ele não tiver foto própria). */
export const withEventPhoto = (ev: AppEvent): AppEvent => {
  if (ev.coverImage) return ev;
  if (BANNER_IDS.has(ev.id)) return { ...ev, coverImage: `/eventos/${ev.id}.jpg` };
  const p = PHOTOS.find(x => x.match.test(ev.title));
  return p ? { ...ev, coverImage: p.imageUrl, imageCredit: p.credit } : ev;
};
