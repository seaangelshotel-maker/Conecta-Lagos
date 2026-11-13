/**
 * "Precisa agora?": atalhos para o que o visitante procura com urgência (farmácia, mercado, posto…).
 * Só aparecem os atalhos que têm ao menos um lugar cadastrado (sem prometer o que o app não tem).
 * A contagem usa a MESMA busca do clique, então o número mostrado é o que a pessoa encontra.
 */
import { BusinessProfile } from '../types';
import { filterBusinesses } from './discoverLogic';

export interface NeedItem { id: string; label: string; icon: string; query: string; }

export const NEED_NOW_ITEMS: NeedItem[] = [
  { id: 'farmacia', label: 'Farmácia', icon: 'Pill', query: 'farmacia' },
  { id: 'mercado', label: 'Mercado', icon: 'ShoppingCart', query: 'supermercado' },
  { id: 'posto', label: 'Posto', icon: 'Fuel', query: 'combustivel' },
  { id: 'taxi', label: 'Táxi', icon: 'Car', query: 'taxi' },
  { id: 'carro', label: 'Alugar carro', icon: 'KeyRound', query: 'aluguel carros' },
  { id: 'dentista', label: 'Dentista', icon: 'Smile', query: 'dentista' },
  { id: 'hospital', label: 'Saúde', icon: 'Stethoscope', query: 'hospital' },
  { id: 'pet', label: 'Pet', icon: 'PawPrint', query: 'veterinari' },
];

export interface NeedCount extends NeedItem { count: number; }

export const needNowCounts = (businesses: BusinessProfile[], items: NeedItem[] = NEED_NOW_ITEMS): NeedCount[] =>
  items
    .map(i => ({ ...i, count: filterBusinesses(businesses, { query: i.query } as any).length }))
    .filter(i => i.count > 0);
