/**
 * Busca esperta ("escreva do seu jeito, a gente entende").
 * Funções puras, sem Firebase. Cobertas por tests/smartSearch.test.ts.
 *
 * O que entende:
 * - acento e maiúscula não importam;
 * - erro de digitação leve ("restaurnte", "pousda", "buzois");
 * - singular/plural e palavras de ligação ("onde comer em arraial");
 * - sinônimos do dia a dia ("comer" = restaurante, "dormir" = hospedagem, "lancha" = passeio de barco);
 * - cidade citada na frase ("pizza em cabo frio" só mostra Cabo Frio);
 * - comodidade citada ("pousada com wifi e estacionamento");
 * - ordem: acerto no nome vale mais que na descrição; quem tem foto vem antes em empate.
 */
import type { BusinessProfile } from '../types';
import { REGION_MUNICIPALITIES } from './regionGeo.js';

export const normText = (s: string = '') =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();

const STOP = new Set(['de', 'da', 'do', 'das', 'dos', 'em', 'na', 'no', 'nas', 'nos', 'o', 'a', 'os', 'as', 'um', 'uma', 'para', 'pra', 'pro', 'por', 'com', 'e', 'ou', 'que', 'onde', 'qual', 'quais', 'tem', 'ter', 'quero', 'preciso', 'perto', 'melhor', 'melhores', 'bom', 'boa', 'bons', 'boas', 'algum', 'alguma', 'ai', 'aqui', 'la']);

/** Termo digitado → palavras que a base usa. Só vale quando o termo aparece sozinho. */
export const SYNONYMS: Record<string, string[]> = {
  comer: ['restaurante', 'restaurantes', 'gastronomia', 'lanchonete', 'pizzaria', 'bistro'],
  almoco: ['restaurante', 'restaurantes'], jantar: ['restaurante', 'restaurantes'], comida: ['restaurante', 'restaurantes', 'gastronomia'],
  lanche: ['lanchonete', 'padaria', 'cafe'], pizza: ['pizzaria'], peixe: ['frutos do mar', 'restaurante'], frutos: ['frutos do mar'],
  cafe: ['cafeteria', 'padaria'], cafeteria: ['cafe'], sorvete: ['sorveteria', 'acai'],
  dormir: ['hospedagem', 'hotel', 'pousada', 'hostel'], hospedar: ['hospedagem', 'hotel', 'pousada'], hotel: ['hospedagem', 'pousada'],
  pousada: ['hospedagem', 'hotel'], hostel: ['hospedagem'], ficar: ['hospedagem', 'pousada'],
  barco: ['passeio de barco', 'escuna', 'lancha', 'barco'], lancha: ['passeio de barco', 'barco'], escuna: ['passeio de barco', 'barco'],
  passeio: ['passeios', 'passeio de barco', 'experiencias'], passear: ['passeios'], mergulho: ['mergulho', 'passeios', 'batismo'],
  quadriciclo: ['quadriciclo', 'passeios'], buggy: ['buggy', 'passeios'], trilha: ['trilhas', 'natureza'], caminhada: ['trilhas', 'natureza'],
  praia: ['praias'], mar: ['praias', 'passeio de barco'], sol: ['praias'],
  balada: ['bares', 'vida noturna', 'bar'], barzinho: ['bar', 'bares'], drink: ['bar', 'bares'], drinks: ['bar', 'bares'], cerveja: ['bar', 'bares'], noite: ['vida noturna', 'bares'],
  mercado: ['supermercado', 'mercado'], farmacia: ['farmacia', 'saude'], remedio: ['farmacia'], medico: ['saude', 'clinica'], dentista: ['dentista', 'saude'],
  banco: ['banco', 'caixa'], carro: ['aluguel de carros', 'estacionamento'], taxi: ['transporte', 'taxi'], uber: ['transporte'],
  loja: ['comercio'], comprar: ['comercio', 'loja'], lembranca: ['comercio', 'artesanato'], artesanato: ['artesanato', 'comercio'],
};

/** Intenções que viram etiqueta de experiência (admin marca em experienceTags). */
const INTENT_TAGS: Record<string, string> = {
  crianca: 'criancas', criancas: 'criancas', filho: 'criancas', filhos: 'criancas', kids: 'criancas', infantil: 'criancas',
  familia: 'familias', familias: 'familias', casal: 'casais', casais: 'casais', romantico: 'casais', namorada: 'casais', namorado: 'casais',
  chuva: 'chuva', chuvoso: 'chuva', gratis: 'gratuito', gratuito: 'gratuito', gratuita: 'gratuito', free: 'gratuito', aventura: 'aventura', radical: 'aventura',
};

/** Comodidade citada → id do catálogo. */
const AMENITY_WORDS: Record<string, string> = {
  wifi: 'wifi', 'wi fi': 'wifi', internet: 'wifi', 'ar condicionado': 'ac', climatizado: 'ac', estacionamento: 'parking', garagem: 'parking',
  pet: 'pet', cachorro: 'pet', cachorros: 'pet', piscina: 'pool', pix: 'pix', cartao: 'card', delivery: 'delivery', entrega: 'delivery',
  acessibilidade: 'access', acessivel: 'access', cadeirante: 'access',
};

/** Distância de edição (inserção, remoção, troca e troca de letras vizinhas), com corte antecipado. */
export const editDistance = (a: string, b: string, max = 2): number => {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const m = a.length, n = b.length;
  let prev2: number[] = [], prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const cur = [i];
    let rowMin = i;
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      let v = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) v = Math.min(v, prev2[j - 2] + 1);
      cur[j] = v; if (v < rowMin) rowMin = v;
    }
    if (rowMin > max) return max + 1;
    prev2 = prev; prev = cur;
  }
  return prev[n];
};

const stem = (w: string) => (w.length > 4 && w.endsWith('s') ? w.slice(0, -1) : w);
/** Quantos erros aceitar, conforme o tamanho da palavra (palavra curta não perdoa). */
const tolerance = (w: string) => (w.length <= 3 ? 0 : w.length <= 6 ? 1 : 2);

export interface ParsedQuery {
  /** Termos que precisam aparecer (cada um com suas alternativas). */
  groups: string[][];
  cityIds: string[];
  tags: string[];
  amenityIds: string[];
  /** Texto limpo, usado para dar bônus a quem tem exatamente a frase. */
  phrase: string;
}

const CITY_FORMS: { id: string; forms: string[] }[] = REGION_MUNICIPALITIES.map(m => ({
  id: m.id,
  forms: [m.name, ...(m.aliases || []), m.id.replace(/-/g, ' ')].map(normText),
}));

export const parseQuery = (raw: string): ParsedQuery => {
  let text = normText(raw);
  const phrase = text;
  const cityIds: string[] = [], amenityIds: string[] = [], tags: string[] = [];
  // cidades (frases maiores primeiro: "sao pedro da aldeia" antes de "sao pedro")
  const forms = CITY_FORMS.flatMap(c => c.forms.map(f => ({ id: c.id, f }))).sort((a, b) => b.f.length - a.f.length);
  for (const { id, f } of forms) {
    const re = new RegExp(`(^| )${f}( |$)`);
    if (f && re.test(text)) { if (!cityIds.includes(id)) cityIds.push(id); text = text.replace(re, ' ').trim(); }
  }
  for (const [w, id] of Object.entries(AMENITY_WORDS).sort((a, b) => b[0].length - a[0].length)) {
    const re = new RegExp(`(^| )${w}( |$)`);
    if (re.test(text)) { if (!amenityIds.includes(id)) amenityIds.push(id); text = text.replace(re, ' ').trim(); }
  }
  const groups: string[][] = [];
  for (const tok of text.split(' ').filter(Boolean)) {
    if (STOP.has(tok)) continue;
    const t = INTENT_TAGS[tok];
    if (t) { if (!tags.includes(t)) tags.push(t); continue; }
    const base = stem(tok);
    const syn = SYNONYMS[tok] || SYNONYMS[base] || [];
    groups.push([tok, base, ...syn.map(normText)].filter((v, i, a) => v && a.indexOf(v) === i));
  }
  return { groups, cityIds, tags, amenityIds, phrase };
};

const words = (s: string) => normText(s).split(' ').filter(w => w.length > 1);

/**
 * Nota de 0 a N. 0 = não combina. Cada grupo de termos precisa combinar em algum campo;
 * cidade, etiqueta e comodidade citadas também são exigidas.
 */
export const scoreBusiness = (b: BusinessProfile, q: ParsedQuery): number => {
  if (q.cityIds.length && !q.cityIds.includes(b.cityId || '')) {
    // cidade também pode estar no endereço quando cityId não foi preenchido
    const addr = normText(b.address || '');
    if (!q.cityIds.some(id => CITY_FORMS.find(c => c.id === id)!.forms.some(f => addr.includes(f)))) return 0;
  }
  if (q.tags.length && !q.tags.every(t => (b.experienceTags || []).includes(t) || (t === 'criancas' && (b.amenities || []).includes('kids')))) return 0;
  if (q.amenityIds.length && !q.amenityIds.every(a => (b.amenities || []).map(x => normText(x)).includes(normText(a)))) return 0;

  const fields = [
    { w: 10, ws: words(b.name || ''), text: normText(b.name || '') },
    { w: 6, ws: words(b.subcategory || ''), text: normText(b.subcategory || '') },
    { w: 5, ws: words(b.category || ''), text: normText(b.category || '') },
    { w: 2, ws: words(b.description || ''), text: normText(b.description || '') },
    { w: 1, ws: words(b.address || ''), text: normText(b.address || '') },
  ];
  let score = 0;
  for (const group of q.groups) {
    let best = 0;
    for (const f of fields) {
      for (const alt of group) {
        const isSyn = alt !== group[0] && alt !== group[1];
        const factor = isSyn ? 0.7 : 1;
        if (f.text.includes(alt) && alt.length >= 3) { best = Math.max(best, f.w * factor * (f.ws.includes(alt) ? 1 : 0.8)); continue; }
        const tol = tolerance(alt);
        if (tol > 0 && alt.length >= 4) {
          for (const w of f.ws) {
            if (Math.abs(w.length - alt.length) <= tol && editDistance(w, alt, tol) <= tol) { best = Math.max(best, f.w * factor * 0.6); break; }
          }
        }
      }
    }
    if (best === 0) return 0;
    score += best;
  }
  const onlyFilters = q.groups.length === 0;
  if (onlyFilters && !q.cityIds.length && !q.tags.length && !q.amenityIds.length) return 0;
  if (onlyFilters) score = 1;
  if (q.phrase && normText(b.name || '').includes(q.phrase)) score += 8;
  return score;
};

/** Filtra e ordena por relevância (empate: quem tem foto primeiro, depois ordem original). */
export const smartSearch = (list: BusinessProfile[], rawQuery: string): BusinessProfile[] => {
  const q = parseQuery(rawQuery);
  if (!q.groups.length && !q.cityIds.length && !q.tags.length && !q.amenityIds.length) return list;
  return list
    .map((b, i) => ({ b, i, s: scoreBusiness(b, q) }))
    .filter(x => x.s > 0)
    .sort((x, y) => y.s - x.s || (x.b.coverImage ? 0 : 1) - (y.b.coverImage ? 0 : 1) || x.i - y.i)
    .map(x => x.b);
};
