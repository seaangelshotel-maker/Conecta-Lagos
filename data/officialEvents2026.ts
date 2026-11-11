/**
 * Calendário de Eventos 2026 de Arraial do Cabo (Prefeitura), usado na importação inicial da agenda.
 *
 * Conferido em 11/11/2026 contra a reprodução integral do calendário publicada pelo RC24H
 * (https://rc24h.com.br/arraial-do-cabo-divulga-calendario-de-eventos-2026/) e contra as
 * matérias da Rádio RC FM, Nossa Rádio e Portal Multiplix, que listam as mesmas datas.
 * O próprio calendário avisa que está "sujeito a alterações".
 *
 * Regras desta lista:
 * - Só entra o que consta no calendário. Local e horário só aparecem quando uma matéria os confirma
 *   (hoje, apenas o Festival de Frutos do Mar). Nos demais, `detailsTentative` avisa o público.
 * - Feriados nacionais sem programação própria ficam de fora (Finados, Corpus Christi, Independência,
 *   N. Sra. Aparecida, Proclamação da República, Consciência Negra).
 * - A categoria é uma classificação editorial nossa; quando o nome não diz o tipo, usa "outros".
 */
import type { AppEvent, EventCategory } from '../types';

export const OFFICIAL_SOURCE_LABEL = 'Calendário de Eventos 2026 — Prefeitura de Arraial do Cabo';
export const OFFICIAL_SOURCE_URL = 'https://rc24h.com.br/arraial-do-cabo-divulga-calendario-de-eventos-2026/';

type Row = [start: string, end: string | null, title: string, category: EventCategory, extra?: Partial<AppEvent>];

const Y = '2026-';
const ROWS: Row[] = [
  // Janeiro
  [Y + '01-01', null, 'Ano-Novo', 'festa'],
  [Y + '01-16', Y + '01-31', 'Verão Musical', 'musica', { scheduleNote: 'Sextas e sábados' }],
  [Y + '01-17', null, 'Feira da Massambaba', 'feira', { locationName: 'Distrito de Massambaba' }],
  [Y + '01-31', null, 'Feira do Xaréu', 'feira'],
  [Y + '01-31', null, 'Arena Esportiva: Beach Tennis e Night Run', 'esporte'],
  // Fevereiro
  [Y + '02-01', null, 'Arena Esportiva: 1ª Etapa Arraial Fight', 'esporte'],
  [Y + '02-06', Y + '02-07', 'Verão Musical', 'musica'],
  [Y + '02-06', Y + '02-08', 'Polo do Mar', 'outros'],
  [Y + '02-13', Y + '02-17', 'Carnaval 2026', 'festa'],
  // Março
  [Y + '03-05', Y + '03-08', 'Arraial BBQ Festival', 'gastronomia'],
  [Y + '03-13', Y + '03-15', 'Estadual Bravanésia', 'esporte'],
  [Y + '03-20', Y + '03-22', 'Encontro de Carros Antigos', 'outros'],
  [Y + '03-21', null, 'Sunset Run', 'esporte'],
  [Y + '03-28', null, 'Feira do Xaréu', 'feira'],
  // Abril
  [Y + '04-02', Y + '04-05', 'Festival da Lula', 'gastronomia'],
  [Y + '04-03', null, 'Encenação da Paixão de Cristo', 'religioso'],
  [Y + '04-10', Y + '04-12', 'Beach Soccer', 'esporte'],
  [Y + '04-18', Y + '04-19', 'Feira do Xaréu', 'feira'],
  [Y + '04-25', null, '1ª Etapa ASAC 2026 (surfe)', 'esporte', { description: 'Etapa do circuito da ASAC (Associação de Surf de Arraial do Cabo).' }],
  [Y + '04-26', null, 'Dia Internacional da Dança', 'cultura'],
  // Maio
  [Y + '05-01', Y + '05-03', 'Mergulho', 'esporte'],
  [Y + '05-02', null, 'Feira do Xaréu', 'feira'],
  [Y + '05-13', Y + '05-16', 'Aniversário da Cidade', 'festa'],
  [Y + '05-23', null, 'WTR', 'outros'],
  [Y + '05-30', null, 'Feira da Massambaba', 'feira', { locationName: 'Distrito de Massambaba' }],
  [Y + '05-30', null, 'Abertura da Temporada de Baleias', 'turismo'],
  // Junho
  [Y + '06-01', null, 'Início da Temporada de Baleias', 'turismo'],
  [Y + '06-01', null, 'Início das Festas Juninas', 'festa'],
  [Y + '06-03', null, 'FUNTEC', 'outros'],
  [Y + '06-05', Y + '06-06', 'Dia Mundial do Meio Ambiente', 'turismo'],
  [Y + '06-05', Y + '06-07', 'Festival Audiovisual', 'cultura'],
  [Y + '06-12', Y + '06-14', 'Rota do Petisco', 'gastronomia', { description: 'Com show na praça.' }],
  [Y + '06-12', Y + '06-14', 'Jornada das Infâncias', 'cultura', { locationName: 'Estádio' }],
  [Y + '06-26', Y + '06-29', 'Festa de São Pedro', 'religioso', { locationName: 'Figueira' }],
  [Y + '06-27', null, 'Copa Atcheza Canoa', 'esporte'],
  // Julho
  [Y + '07-01', Y + '07-04', 'LiterArraial', 'cultura'],
  [Y + '07-11', null, 'Triathlon', 'esporte'],
  [Y + '07-18', null, 'Feira do Xaréu', 'feira'],
  [Y + '07-19', null, '2ª Etapa Arraial Fight', 'esporte'],
  [Y + '07-24', Y + '07-26', 'Estadual de Vôlei', 'esporte'],
  [Y + '07-24', Y + '07-26', 'Festival da Baleia', 'turismo'],
  // Agosto
  [Y + '08-01', null, 'Circuito Cervejeiro', 'gastronomia'],
  [Y + '08-07', Y + '08-09', 'Dia Municipal da Cultura', 'cultura'],
  [Y + '08-16', null, 'Evento de Fisiculturismo', 'esporte'],
  [Y + '08-22', null, '2ª Etapa ASAC 2026 (surfe)', 'esporte', { description: 'Etapa do circuito da ASAC (Associação de Surf de Arraial do Cabo).' }],
  [Y + '08-28', Y + '08-30', 'Bossa Nova', 'musica'],
  [Y + '08-29', null, 'Feira do Xaréu', 'feira'],
  // Setembro
  [Y + '09-04', Y + '09-07', 'Arraial Music Fest', 'musica'],
  [Y + '09-13', null, 'Parada do Orgulho LGBTQIAP+', 'cultura'],
  [Y + '09-19', Y + '09-20', 'Kite Surf', 'esporte'],
  [Y + '09-19', Y + '09-20', 'Maratona Ambiental: Corrida da Baleia', 'esporte'],
  [Y + '09-25', Y + '09-26', 'Celebra Arraial', 'festa'],
  [Y + '09-27', null, 'Torneio de Pesca de Pipa', 'esporte'],
  // Outubro
  [Y + '10-03', null, 'Feira do Xaréu', 'feira'],
  [Y + '10-03', null, 'Corrida Outubro Rosa', 'esporte'],
  [Y + '10-09', Y + '10-11', 'Motorock', 'musica'],
  [Y + '10-10', null, 'Feira do Xaréu', 'feira'],
  [Y + '10-11', null, 'Jiu-jitsu', 'esporte'],
  [Y + '10-16', Y + '10-18', 'Festa da Padroeira', 'religioso'],
  [Y + '10-27', Y + '10-28', 'Arraial Expo XP', 'outros'],
  // Novembro
  [Y + '11-04', null, 'Street Games: Batalha de Rap', 'cultura'],
  [Y + '11-13', Y + '11-15', 'Festival de Frutos do Mar: Gastronomia e Chopp', 'gastronomia', {
    description:
      'A 4ª edição do festival reúne gastronomia, música e chopp na Orla da Praia Grande. ' +
      'Shows: Nando Luiz (sexta, 13), Rosa Passos às 18h e Chimarruts às 22h (sábado, 14) e Chico Chico às 22h (domingo, 15), ' +
      'além de artistas locais selecionados pelo edital de credenciamento da Prefeitura. ' +
      'São 17 expositores de pratos principais (R$ 40 cada) e 8 de chopp. Promoção da Prefeitura de Arraial do Cabo.',
    locationName: 'Orla da Praia Grande',
    priceText: 'Pratos a R$ 40',
    detailsTentative: false,
    isFeatured: true,
    sourceUrl: 'https://www.nossaradio.fm/news/festival-de-frutos-do-mar-anuncia-chico-chico-para-encerrar-a-programacao-musical-de-domingo-em-arraial-do-cabo/',
    sourceLabel: 'Prefeitura de Arraial do Cabo (programação divulgada pela Nossa Rádio FM e RC24H)',
  }],
  [Y + '11-21', null, 'Feira do Xaréu', 'feira'],
  [Y + '11-28', null, 'Bugre', 'outros'],
  [Y + '11-29', null, '3ª Etapa Arraial Fight Perfect BJJ', 'esporte'],
  // Dezembro
  [Y + '12-01', null, 'Início do Brilho de Natal', 'festa'],
  [Y + '12-04', Y + '12-06', 'Festival da Lagoa', 'festa'],
  [Y + '12-05', null, 'Feira do Xaréu', 'feira'],
  [Y + '12-05', null, 'Corrida de Canoa Havaiana', 'esporte'],
  [Y + '12-12', null, '3ª Etapa ASAC 2026 (surfe)', 'esporte', { description: 'Etapa do circuito da ASAC (Associação de Surf de Arraial do Cabo).' }],
  [Y + '12-30', Y + '12-31', 'Réveillon 2027', 'festa'],
];

const slug = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 48);

/** Id estável (título + data) para a importação poder ser repetida sem duplicar nem sobrescrever edições do admin. */
export const officialEventId = (title: string, start: string) => `oficial-2026-${slug(title)}-${start}`;

export const OFFICIAL_EVENTS_2026: AppEvent[] = ROWS.map(([start, end, title, category, extra]) => ({
  id: officialEventId(title, start),
  title,
  category,
  startDate: start,
  ...(end ? { endDate: end } : {}),
  cityId: 'arraial-do-cabo',
  detailsTentative: true,
  source: 'official' as const,
  sourceLabel: OFFICIAL_SOURCE_LABEL,
  sourceUrl: OFFICIAL_SOURCE_URL,
  status: 'published' as const,
  ...extra,
}));
