/**
 * "Precisa agora?": atalhos para o que o visitante procura com urgência (farmácia, mercado, posto, saúde…).
 * O casamento usa só subcategoria/categoria e o NOME do lugar (palavra inteira), nunca a descrição ou o
 * endereço: assim "Saúde" não traz um passeio que apenas cita "hospital" no texto.
 * Só aparecem os atalhos que têm ao menos um lugar cadastrado, e a contagem é a mesma lista que abre no clique.
 */
import { BusinessProfile } from '../types';
import { subIs, catIs, hasWord } from './discoverLogic';

export interface NeedItem { id: string; label: string; icon: string; subs: string[]; cats?: string[]; words: string[]; }

export const NEED_NOW_ITEMS: NeedItem[] = [
  { id: 'farmacia', label: 'Farmácia', icon: 'Pill', subs: ['Farmácias', 'Farmácia', 'Drogarias'], words: ['farmácia', 'farmácias', 'drogaria', 'drogarias'] },
  { id: 'mercado', label: 'Mercado', icon: 'ShoppingCart', subs: ['Supermercados', 'Supermercado', 'Mercados', 'Hortifruti'], words: ['supermercado', 'supermercados', 'minimercado', 'hortifruti'] },
  { id: 'posto', label: 'Posto', icon: 'Fuel', subs: ['Postos de Combustível', 'Posto de Combustível', 'Postos de Gasolina'], words: ['combustível', 'combustíveis', 'gasolina', 'auto posto', 'autoposto'] },
  { id: 'taxi', label: 'Táxi', icon: 'Car', subs: ['Táxi e Transfer', 'Táxi', 'Taxi'], words: ['táxi', 'taxi'] },
  { id: 'carro', label: 'Alugar carro', icon: 'KeyRound', subs: ['Aluguel de Carros', 'Locadoras'], words: ['locadora de veículos', 'locadora de carros', 'aluguel de carros'] },
  { id: 'dentista', label: 'Dentista', icon: 'Smile', subs: ['Dentistas', 'Dentista', 'Odontologia'], words: ['dentista', 'odontologia', 'odontológica', 'odonto'] },
  { id: 'saude', label: 'Saúde', icon: 'Stethoscope', subs: ['Saúde', 'Clínicas', 'Hospitais', 'Postos de Saúde', 'Pronto Atendimento', 'Pronto Atendimento e UPAs', 'UPA'], cats: ['Saúde'], words: ['hospital', 'clínica', 'pronto socorro', 'pronto-socorro', 'pronto atendimento', 'upa', 'posto de saúde', 'unidade de saúde'] },
  { id: 'seguranca', label: 'Polícia e Bombeiros', icon: 'ShieldCheck', subs: ['Delegacias', 'Bombeiros', 'Guarda Municipal', 'Defesa Civil'], cats: ['Segurança e Emergência'], words: ['delegacia', 'bombeiros', 'guarda civil municipal', 'guarda municipal', 'defesa civil'] },
  { id: 'pet', label: 'Pet', icon: 'PawPrint', subs: ['Veterinário', 'Veterinária', 'Pet Shop', 'Petshop'], words: ['veterinário', 'veterinária', 'pet shop', 'petshop'] },
];

export const needMatch = (b: BusinessProfile, item: NeedItem): boolean =>
  subIs(b, item.subs) || (!!item.cats && catIs(b, item.cats)) || hasWord([b.name, b.subcategory].join(' '), item.words);

const isLive = (b: BusinessProfile) => !b.isBlocked && (!b.status || b.status === 'approved');

export const findNeed = (id: string | undefined | null) => NEED_NOW_ITEMS.find(i => i.id === id);

export interface NeedCount extends NeedItem { count: number; }

export const needNowCounts = (businesses: BusinessProfile[], items: NeedItem[] = NEED_NOW_ITEMS): NeedCount[] =>
  items.map(i => ({ ...i, count: businesses.filter(b => isLive(b) && needMatch(b, i)).length })).filter(i => i.count > 0);

/** Números de emergência do Brasil (valem em qualquer cidade da região). */
export const EMERGENCY_MAIN = [
  { number: '192', label: 'SAMU', hint: 'Emergência médica' },
  { number: '193', label: 'Bombeiros', hint: 'Incêndio e resgate, inclusive no mar' },
  { number: '190', label: 'Polícia Militar', hint: 'Crime e perigo' },
];
export const EMERGENCY_MORE = [
  { number: '199', label: 'Defesa Civil' },
  { number: '191', label: 'Polícia Rodoviária Federal' },
  { number: '180', label: 'Central de Atendimento à Mulher' },
  { number: '188', label: 'CVV (apoio emocional, 24 h)' },
  { number: '100', label: 'Disque Direitos Humanos' },
];
