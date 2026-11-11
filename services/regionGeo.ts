// Inteligência geográfica da Região dos Lagos (RJ).
// Funções puras: sem Firebase, sem navegador. Testáveis em node:test.

export interface Municipality {
  id: string;
  name: string;
  /** Formas curtas usadas no dia a dia e em matérias (ex.: "Búzios"). */
  aliases?: string[];
  /** Centro aproximado do município (graus decimais). Refinar com limites oficiais quando disponíveis. */
  lat: number;
  lng: number;
}

export const REGION_MUNICIPALITIES: Municipality[] = [
  { id: 'arraial-do-cabo', name: 'Arraial do Cabo', aliases: ['Arraial'], lat: -22.9662, lng: -42.0278 },
  { id: 'cabo-frio', name: 'Cabo Frio', lat: -22.8794, lng: -42.0188 },
  { id: 'buzios', name: 'Armação dos Búzios', aliases: ['Búzios', 'Buzios'], lat: -22.7469, lng: -41.8817 },
  { id: 'sao-pedro-da-aldeia', name: 'São Pedro da Aldeia', aliases: ['São Pedro'], lat: -22.8419, lng: -42.1022 },
  { id: 'iguaba-grande', name: 'Iguaba Grande', lat: -22.8414, lng: -42.2284 },
  { id: 'araruama', name: 'Araruama', lat: -22.8716, lng: -42.3432 },
  { id: 'saquarema', name: 'Saquarema', lat: -22.9209, lng: -42.5099 },
];

/** Vizinhança de município para o Nível 2 do feed (municípios que se tocam ou ficam a pouca distância). */
export const NEIGHBOR_IDS: Record<string, string[]> = {
  'arraial-do-cabo': ['cabo-frio', 'buzios'],
  'cabo-frio': ['arraial-do-cabo', 'sao-pedro-da-aldeia', 'iguaba-grande', 'buzios'],
  'buzios': ['cabo-frio', 'arraial-do-cabo'],
  'sao-pedro-da-aldeia': ['cabo-frio', 'iguaba-grande', 'araruama'],
  'iguaba-grande': ['cabo-frio', 'sao-pedro-da-aldeia', 'araruama'],
  'araruama': ['iguaba-grande', 'sao-pedro-da-aldeia', 'saquarema'],
  'saquarema': ['araruama'],
};

/** Distância máxima do centro de um município para considerar a pessoa "dentro" dele (km). */
export const MUNICIPALITY_MAX_KM = 14;
/** Acima disso, a pessoa está fora da região: a descoberta usa a região toda como referência. */
export const REGION_MAX_KM = 35;

export const haversineKm = (a: { lat: number; lng: number }, b: { lat: number; lng: number }) => {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
};

export interface LocatedMunicipality { municipality: Municipality | null; distanceKm: number; inRegion: boolean; }

/** Identifica o município mais próximo. `municipality` é null quando a pessoa está fora da região. */
export const locateMunicipality = (
  where: { lat: number; lng: number },
  list: Municipality[] = REGION_MUNICIPALITIES,
): LocatedMunicipality => {
  let best: Municipality | null = null;
  let bestKm = Infinity;
  for (const m of list) {
    const km = haversineKm(where, m);
    if (km < bestKm) { bestKm = km; best = m; }
  }
  if (!best) return { municipality: null, distanceKm: Infinity, inRegion: false };
  const inRegion = bestKm <= REGION_MAX_KM;
  return {
    municipality: inRegion && bestKm <= MUNICIPALITY_MAX_KM ? best : (inRegion ? best : null),
    distanceKm: bestKm,
    inRegion,
  };
};

/** Raios de busca em ordem crescente. Começa perto e só amplia se houver poucos resultados. */
export const RADIUS_STEPS_KM = [1, 3, 6, 12, 25, 50];

export interface NearbyResult<T> {
  items: Array<T & { distanceKm: number }>;
  radiusKm: number;
  /** true quando nem o maior raio trouxe o mínimo pedido, então a lista é só o que existe. */
  exhausted: boolean;
}

/**
 * Raio adaptativo: em regiões densas, o primeiro raio já traz resultados suficientes;
 * em regiões esparsas, amplia gradualmente. Nunca limita a um raio fixo que esconda tudo.
 */
export const nearbyAdaptive = <T extends { lat?: number; lng?: number }>(
  items: T[],
  where: { lat: number; lng: number },
  opts: { minResults?: number; steps?: number[] } = {},
): NearbyResult<T> => {
  const minResults = opts.minResults ?? 12;
  const steps = opts.steps ?? RADIUS_STEPS_KM;
  const withDist = items
    .filter(i => typeof i.lat === 'number' && typeof i.lng === 'number')
    .map(i => ({ ...i, distanceKm: haversineKm(where, { lat: i.lat as number, lng: i.lng as number }) }))
    .sort((a, b) => a.distanceKm - b.distanceKm);

  let radiusKm = steps[steps.length - 1];
  for (const step of steps) {
    radiusKm = step;
    if (withDist.filter(i => i.distanceKm <= step).length >= minResults) break;
  }
  const inRadius = withDist.filter(i => i.distanceKm <= radiusKm);
  if (inRadius.length >= minResults) return { items: inRadius, radiusKm, exhausted: false };

  // Poucos lugares até no maior raio: mostra os mais próximos mesmo assim, sinalizando o esgotamento.
  return { items: withDist.slice(0, Math.max(minResults, inRadius.length)), radiusKm, exhausted: true };
};

export interface FeedArticleLike {
  title?: string;
  excerpt?: string;
  content?: string;
  tags?: string[];
  publishedAt?: string;
  createdAt?: string;
  date?: string;
}

const foldText = (s: string = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Em qual município uma matéria fala. Usa tags e o início do texto (título, resumo). */
export const articleMunicipalityIds = (a: FeedArticleLike, list: Municipality[] = REGION_MUNICIPALITIES): string[] => {
  const head = foldText([a.title, a.excerpt, ...(a.tags || [])].join(' '));
  const body = foldText((a.content || '').slice(0, 1500));
  const hits = list.filter(m => {
    const keys = [m.name, ...(m.aliases || [])].map(k => foldText(k));
    return keys.some(key => head.includes(key) || body.includes(key));
  });
  return hits.map(m => m.id);
};

export type FeedTier = 1 | 2 | 3;

/** Nível do conteúdo em relação ao município da pessoa (1 = aqui, 2 = vizinho, 3 = região). */
export const feedTierFor = (articleMunis: string[], current: string | null): FeedTier => {
  if (!current) return 3;
  if (articleMunis.includes(current)) return 1;
  const neighbors = NEIGHBOR_IDS[current] || [];
  if (articleMunis.some(id => neighbors.includes(id))) return 2;
  return 3;
};

const recencyScore = (a: FeedArticleLike, now: number) => {
  const d = Date.parse(a.publishedAt || a.createdAt || a.date || '');
  if (Number.isNaN(d)) return 0;
  const days = Math.max(0, (now - d) / 86400000);
  return Math.exp(-days / 30); // 1 hoje, ~0,37 em um mês
};

/**
 * Ordena o feed sem esconder nada: prioriza o município da pessoa, depois a vizinhança,
 * depois a região. Dentro de cada nível, a atualidade pesa mais.
 */
export const orderFeedByGeo = <T extends FeedArticleLike>(
  articles: T[],
  current: string | null,
  now: number = Date.now(),
  list: Municipality[] = REGION_MUNICIPALITIES,
): Array<T & { tier: FeedTier }> => {
  return articles
    .map(a => ({ a, tier: feedTierFor(articleMunicipalityIds(a, list), current) }))
    .sort((x, y) => x.tier - y.tier || recencyScore(y.a, now) - recencyScore(x.a, now))
    .map(({ a, tier }) => ({ ...a, tier }));
};

/** Só atualiza a posição quando a pessoa realmente se moveu, evitando recalcular tudo por ruído do GPS. */
export const MOVE_THRESHOLD_KM = 1.5;

export const movedEnough = (
  prev: { lat: number; lng: number } | null,
  next: { lat: number; lng: number },
  minKm: number = MOVE_THRESHOLD_KM,
): boolean => !prev || haversineKm(prev, next) >= minKm;

/** Mudou de município? Útil para avisar "Você chegou em Cabo Frio". */
export const changedMunicipality = (
  prev: { lat: number; lng: number } | null,
  next: { lat: number; lng: number },
): boolean => {
  if (!prev) return false;
  const a = locateMunicipality(prev);
  const b = locateMunicipality(next);
  return (a.municipality?.id ?? null) !== (b.municipality?.id ?? null);
};
