/**
 * Serviços públicos de saúde e segurança (hospitais, UPAs, delegacias, bombeiros, guarda, defesa civil)
 * de Arraial do Cabo, Cabo Frio e Búzios, para o atalho "Precisa agora?".
 *
 * Regras (para não haver informação inventada):
 * - Endereço e telefone vêm das fichas públicas do Google Maps e dos sites oficiais, conferidos em 13/11/2026.
 * - Telefone só entra se for fixo e não contradito por outra fonte. Número celular, divergente ou sem
 *   confirmação fica vazio (o visitante usa 192, 193 ou 190, sempre visíveis no app).
 * - Sem nota, sem avaliações e sem fotos. A descrição é neutra.
 * - Lugares que já existem na mesma cidade são pulados na importação.
 */
import type { CityId } from './featuredBusinesses';

export interface PublicService {
  name: string;
  cityId: CityId;
  category: 'Saúde' | 'Segurança e Emergência';
  subcategory: 'Hospitais' | 'Pronto Atendimento e UPAs' | 'Postos de Saúde' | 'Delegacias' | 'Bombeiros' | 'Guarda Municipal' | 'Defesa Civil';
  address: string;
  neighborhood?: string;
  phone?: string;
  hours?: Record<string, string>;
  description: string;
  sources: string[];
  checkedAt: string;
}

export const PUBLIC_SERVICES_BATCH = 'servicos-publicos-2026-11';
const D = '2026-11-13';
const AC = 'city_arraial_do_cabo' as const;
const CF = 'city_cabo_frio' as const;
const BZ = 'city_buzios' as const;
const all = (h: string) => ({ Domingo: h, Segunda: h, 'Terça': h, Quarta: h, Quinta: h, Sexta: h, 'Sábado': h });
const H24 = all('24 horas');
const maps = (q: string) => `https://www.google.com/maps/search/${encodeURIComponent(q).replace(/%20/g, '+')}`;
const SOS = ' Em risco de vida, ligue 192 (SAMU).';
const SOS_POLICE = ' Em emergência, ligue 190 (Polícia Militar).';

export const PUBLIC_SERVICES: PublicService[] = [
  // ───────── Arraial do Cabo
  { name: 'Hospital Geral de Arraial do Cabo', cityId: AC, category: 'Saúde', subcategory: 'Hospitais',
    address: 'Av. Getúlio Vargas, s/n, Praia Grande, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Praia Grande',
    phone: '(22) 2622-2107', hours: H24,
    description: 'Hospital público de Arraial do Cabo, com atendimento 24 horas.' + SOS,
    sources: [maps('Hospital Geral de Arraial do Cabo'), 'https://www.arraial.rj.gov.br'], checkedAt: D },
  { name: '132ª Delegacia de Polícia (Arraial do Cabo)', cityId: AC, category: 'Segurança e Emergência', subcategory: 'Delegacias',
    address: 'Rod. Gen. Bruno Martins, 68-92, Centro, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Centro',
    description: 'Delegacia da Polícia Civil que atende Arraial do Cabo.' + SOS_POLICE,
    sources: [maps('132 delegacia policial arraial do cabo')], checkedAt: D },
  { name: 'Corpo de Bombeiros Militar de Arraial do Cabo', cityId: AC, category: 'Segurança e Emergência', subcategory: 'Bombeiros',
    address: 'Rod. Gen. Bruno Martins, 111, Arraial do Cabo - RJ',
    phone: '(22) 2622-8158', hours: H24,
    description: 'Quartel do Corpo de Bombeiros em Arraial do Cabo: incêndio, resgate e salvamento. Em emergência, ligue 193.',
    sources: [maps('corpo de bombeiros arraial do cabo'), 'https://www.cbmerj.rj.gov.br'], checkedAt: D },
  { name: 'Guarda Civil Municipal de Arraial do Cabo', cityId: AC, category: 'Segurança e Emergência', subcategory: 'Guarda Municipal',
    address: 'Rod. Gen. Alfredo Bruno, 2, Vila Industrial, Arraial do Cabo - RJ, 28930-000', neighborhood: 'Vila Industrial',
    description: 'Guarda Civil Municipal de Arraial do Cabo.' + SOS_POLICE,
    sources: [maps('guarda civil municipal arraial do cabo')], checkedAt: D },

  // ───────── Cabo Frio
  { name: 'UPA 24h Cabo Frio I (Parque Burle)', cityId: CF, category: 'Saúde', subcategory: 'Pronto Atendimento e UPAs',
    address: 'Av. Vítor Rocha, 410, Parque Burle, Cabo Frio - RJ, 28913-000', neighborhood: 'Parque Burle', hours: H24,
    description: 'Unidade de Pronto Atendimento 24 horas da rede municipal de Cabo Frio.' + SOS,
    sources: [maps('UPA Unidade de Pronto Atendimento de Cabo Frio'), 'https://www.mprj.mp.br/web/guest/visualizar?noticiaId=84101'], checkedAt: D },
  { name: 'Hospital Municipal da Mulher (Cabo Frio)', cityId: CF, category: 'Saúde', subcategory: 'Hospitais',
    address: 'R. Florisbela Pena, s/n, Braga, Cabo Frio - RJ, 28908-050', neighborhood: 'Braga',
    phone: '(22) 2647-0807', hours: H24,
    description: 'Hospital público de Cabo Frio, com atendimento 24 horas.' + SOS,
    sources: [maps('Hospital Municipal da Mulher cabo frio')], checkedAt: D },
  { name: 'Hospital Municipal Otime Cardoso dos Santos (Jardim Esperança)', cityId: CF, category: 'Saúde', subcategory: 'Hospitais',
    address: 'Estr. dos Búzios, s/n, Jardim Esperança, Cabo Frio - RJ', neighborhood: 'Jardim Esperança',
    phone: '(22) 2629-9056', hours: H24,
    description: 'Hospital público municipal de Cabo Frio, na Estrada dos Búzios, com atendimento 24 horas.' + SOS,
    sources: [maps('Hospital Municipal Otime Cardoso dos Santos cabo frio'), maps('Hospital Municipal Jardim Esperança cabo frio')], checkedAt: D },
  { name: 'Hospital Municipal São José Operário (Hospital Central de Emergências)', cityId: CF, category: 'Saúde', subcategory: 'Hospitais',
    address: 'R. Gov. Valadares, 22, Cabo Frio - RJ', hours: H24,
    description: 'Hospital público de emergências de Cabo Frio, na Rua Governador Valadares.' + SOS,
    sources: [maps('Hospital Central de Emergências HCE cabo frio'), maps('Hospital Municipal São José Operário cabo frio')], checkedAt: D },
  { name: '18º Grupamento de Bombeiros Militar (Cabo Frio)', cityId: CF, category: 'Segurança e Emergência', subcategory: 'Bombeiros',
    address: 'Av. Nilo Peçanha, 265, Cabo Frio - RJ',
    phone: '(22) 2647-0193', hours: H24,
    description: 'Quartel do Corpo de Bombeiros de Cabo Frio: incêndio, resgate e salvamento. Em emergência, ligue 193.',
    sources: [maps('corpo de bombeiros cabo frio'), 'https://www.cbmerj.rj.gov.br'], checkedAt: D },
  { name: 'Defesa Civil Municipal de Cabo Frio', cityId: CF, category: 'Segurança e Emergência', subcategory: 'Defesa Civil',
    address: 'Av. Hilton Massa, 126, Cabo Frio - RJ',
    phone: '(22) 2647-0199',
    description: 'Defesa Civil do município de Cabo Frio. Em situação de risco, ligue 199.',
    sources: [maps('defesa civil municipal cabo frio')], checkedAt: D },
  { name: '126ª Delegacia de Polícia (Cabo Frio)', cityId: CF, category: 'Segurança e Emergência', subcategory: 'Delegacias',
    address: 'Av. Teixeira e Souza, s/n, Cabo Frio - RJ',
    description: 'Delegacia da Polícia Civil que atende Cabo Frio.' + SOS_POLICE,
    sources: [maps('126 delegacia policial cabo frio')], checkedAt: D },

  // ───────── Búzios
  { name: 'Hospital Municipal Dr. Rodolpho Perissé (Búzios)', cityId: BZ, category: 'Saúde', subcategory: 'Hospitais',
    address: 'Estr. dos Búzios, s/n, Armação dos Búzios - RJ', hours: H24,
    description: 'Hospital público municipal de Búzios, com atendimento 24 horas.' + SOS,
    sources: [maps('Hospital Municipal Dr Rodolpho Perisse buzios'), 'https://www.gov.br/saude/pt-br/assuntos/saude-de-a-a-z/a/animais-peconhentos/hospitais-de-referencia/rio-de-janeiro'], checkedAt: D },
  { name: 'Posto de Urgência (Búzios)', cityId: BZ, category: 'Saúde', subcategory: 'Pronto Atendimento e UPAs',
    address: 'R. Justiniano de Souza, s/n, Armação dos Búzios - RJ',
    phone: '(22) 2895-6450', hours: H24,
    description: 'Posto de urgência da rede municipal de Búzios, com atendimento 24 horas.' + SOS,
    sources: [maps('Posto de Urgência armação dos búzios')], checkedAt: D },
  { name: 'Policlínica de Manguinhos (Búzios)', cityId: BZ, category: 'Saúde', subcategory: 'Postos de Saúde',
    address: 'R. 4, 4, Manguinhos, Armação dos Búzios - RJ', neighborhood: 'Manguinhos',
    phone: '(22) 2623-8038',
    description: 'Policlínica da rede municipal de saúde de Búzios, em Manguinhos.',
    sources: [maps('Policlinica Manguinhos armação dos búzios')], checkedAt: D },
  { name: '127ª Delegacia de Polícia (Búzios)', cityId: BZ, category: 'Segurança e Emergência', subcategory: 'Delegacias',
    address: 'Rua B, Av. Parque, 127, Ferradura, Armação dos Búzios - RJ', neighborhood: 'Ferradura',
    phone: '(22) 2633-0059', hours: H24,
    description: 'Delegacia da Polícia Civil que atende Búzios.' + SOS_POLICE,
    sources: [maps('delegacia policia armação dos búzios')], checkedAt: D },
  { name: 'Corpo de Bombeiros Militar de Búzios (DBM 2/18)', cityId: BZ, category: 'Segurança e Emergência', subcategory: 'Bombeiros',
    address: 'R. das Flores de Maio, Manguinhos, Armação dos Búzios - RJ, 28950-000', neighborhood: 'Manguinhos',
    phone: '(22) 3399-9335',
    description: 'Quartel do Corpo de Bombeiros em Búzios: incêndio, resgate e salvamento. Em emergência, ligue 193.',
    sources: [maps('corpo de bombeiros armação dos búzios'), 'https://www.cbmerj.rj.gov.br'], checkedAt: D },
];
