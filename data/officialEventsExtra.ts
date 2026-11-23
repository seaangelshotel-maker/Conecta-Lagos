/**
 * Eventos conferidos na varredura semanal (23/11/2026) que não constam no calendário 2026 de Arraial.
 * Cada item traz a fonte e quando foi conferido. Só entra o que tem data confirmada por fonte oficial
 * (prefeitura) ou, nos casos marcados, por imprensa/organizador. Horário só quando a fonte divulgou.
 * Importação idempotente (ver importOfficialCalendar): não sobrescreve edições do admin.
 */
import type { AppEvent, EventCategory } from '../types';

const CHECKED = 'conferido em 23/11/2026';
type Row = [city: string, start: string, end: string | null, title: string, category: EventCategory, extra: Partial<AppEvent>];

const ARR = { sourceLabel: `Prefeitura de Arraial do Cabo (divulgação via RC24H e Nossa Rádio, ${CHECKED})`, sourceUrl: 'https://www.instagram.com/prefeituradearraialdocabo/' };
const CF = { sourceLabel: `Prefeitura de Cabo Frio (${CHECKED})`, sourceUrl: 'https://cabofrio.rj.gov.br' };
const CFC = { sourceLabel: `Secretaria de Cultura de Cabo Frio (${CHECKED})`, sourceUrl: 'https://www.instagram.com/cabofriocultura/' };
const BZ = { sourceLabel: `Calendário oficial de eventos da Prefeitura de Búzios (${CHECKED})`, sourceUrl: 'https://buzios.rj.gov.br/calendario-eventos' };

const ROWS: Row[] = [
  // Arraial do Cabo — Réveillon 2027 (horários ainda não divulgados)
  ['arraial-do-cabo', '2026-12-31', null, 'Réveillon 2027: Tuca Fernandes', 'musica', { ...ARR, locationName: 'Praia Grande', detailsTentative: true }],
  ['arraial-do-cabo', '2026-12-31', null, 'Réveillon 2027: ImaginaSamba', 'musica', { ...ARR, locationName: 'Monte Alto', detailsTentative: true }],
  ['arraial-do-cabo', '2026-12-31', null, 'Réveillon 2027: Arlindinho', 'musica', { ...ARR, locationName: 'Figueira', detailsTentative: true }],
  ['arraial-do-cabo', '2027-01-01', null, 'Felipe Araújo no Réveillon de Arraial', 'musica', { ...ARR, locationName: 'Praia Grande', detailsTentative: true }],
  ['arraial-do-cabo', '2027-01-02', null, 'Yan no Réveillon de Arraial', 'musica', { ...ARR, locationName: 'Praia Grande', detailsTentative: true }],
  // Cabo Frio — Réveillon 2027 (Prefeitura, 20/11)
  ['cabo-frio', '2026-12-29', null, 'Réveillon Cabo Frio: noite gospel', 'musica', { ...CF, locationName: 'Praia do Forte', detailsTentative: true, description: 'Abertura da programação do Réveillon 2027 na Praia do Forte, com atrações gospel. Programação sujeita a alterações pela Prefeitura.' }],
  ['cabo-frio', '2026-12-30', null, 'Roupa Nova no Réveillon de Cabo Frio', 'musica', { ...CF, locationName: 'Praia do Forte', detailsTentative: true }],
  ['cabo-frio', '2026-12-31', null, 'Zé Neto & Cristiano no Réveillon de Cabo Frio', 'musica', { ...CF, locationName: 'Praia do Forte', detailsTentative: true, isFeatured: true, description: 'Show da virada na Praia do Forte, com queima de fogos. No distrito de Tamoios, a virada tem Dudu Nobre, Di Propósito e Fabinho, também com fogos.' }],
  ['cabo-frio', '2027-01-01', null, 'Pixote no Réveillon de Cabo Frio (Sunset)', 'musica', { ...CF, locationName: 'Praia do Forte', detailsTentative: true }],
  ['cabo-frio', '2027-01-02', null, 'Jota Quest no Réveillon de Cabo Frio', 'musica', { ...CF, locationName: 'Praia do Forte', detailsTentative: true }],
  // Cabo Frio — Semana da Consciência Negra
  ['cabo-frio', '2026-11-25', '2026-11-29', 'Semana da Consciência Negra de Cabo Frio', 'cultura', { ...CFC, isFree: undefined, detailsTentative: false,
    description: 'Programação da Secretaria de Cultura em vários locais: Tamoios (25/11), Costa Azul Iate Clube (26/11) e Museu e Casa de Cultura José de Dome (27, 28 e 29/11). Em 28/11 acontece o Prêmio Mulheres Negras 2026. Confira horários e detalhes no Instagram da Secretaria.',
    locationName: 'Tamoios, Costa Azul Iate Clube e Museu e Casa de Cultura José de Dome' }],
  // Búzios
  ['buzios', '2026-11-26', '2026-11-29', 'Parafina', 'outros', { ...BZ, detailsTentative: true }],
  ['buzios', '2026-12-01', '2026-12-31', 'Natal de Luz de Búzios', 'festa', { ...BZ, detailsTentative: true }],
  ['buzios', '2026-12-06', null, 'Meia Maratona de Búzios', 'esporte', { ...BZ, detailsTentative: true }],
  ['buzios', '2026-12-11', '2026-12-12', 'Cantata de Natal de Búzios', 'cultura', { ...BZ, detailsTentative: true }],
  ['buzios', '2026-12-31', null, 'Réveillon 2027 All Inclusive — Bar dos Pescadores e Le Sancerre', 'festa', {
    source: 'admin', sourceLabel: `Divulgação do evento nos canais dos organizadores (${CHECKED}); ingressos em 2º lote`, sourceUrl: 'https://buzios.rj.gov.br/calendario-eventos',
    startTime: '21:00', endTime: '02:00', locationName: 'Porto da Barra, Búzios', priceText: 'Ingressos à venda (2º lote)', detailsTentative: false }],
  // Saquarema
  ['saquarema', '2026-11-21', null, 'Natal de Luz de Saquarema', 'festa', { sourceLabel: `Imprensa: Correio da Manhã (${CHECKED})`, sourceUrl: 'https://correiodamanha.com.br', scheduleNote: 'Programação iniciada em 21/11; datas finais não divulgadas', detailsTentative: true }],
];

const slug = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);
export const extraEventId = (title: string, start: string) => `varredura-${slug(title)}-${start}`;

export const OFFICIAL_EVENTS_EXTRA: AppEvent[] = ROWS.map(([cityId, start, end, title, category, extra]) => {
  const e: AppEvent = {
    id: extraEventId(title, start), title, category, startDate: start, ...(end ? { endDate: end } : {}),
    cityId, source: 'official', status: 'published', ...extra,
  } as AppEvent;
  Object.keys(e).forEach(k => (e as any)[k] === undefined && delete (e as any)[k]);
  return e;
});
