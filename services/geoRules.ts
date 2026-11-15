// Regras de geolocalização — funções puras (sem Firebase, sem navegador), testáveis em node:test.
// Usadas no check-in de avaliação, no cadastro da empresa (marcar o local) e na validação no servidor.
import { haversineKm, locateMunicipality } from './regionGeo';

export interface LatLng { lat: number; lng: number }

/** Distância máxima entre o cliente e a empresa para valer o check-in (metros). */
export const CHECKIN_RADIUS_M = 150;
/** Precisão mínima do GPS aceita no check-in (metros). GPS muito impreciso não prova presença. */
export const MAX_ACCURACY_M = 150;

export const isValidLatLng = (p: any): p is LatLng =>
  !!p && typeof p.lat === 'number' && typeof p.lng === 'number'
  && Number.isFinite(p.lat) && Number.isFinite(p.lng)
  && Math.abs(p.lat) <= 90 && Math.abs(p.lng) <= 180
  // (0,0) é o valor "vazio" de muitos aparelhos e nunca é um ponto da Região dos Lagos.
  && !(p.lat === 0 && p.lng === 0);

export const distanceMeters = (a: LatLng, b: LatLng): number => Math.round(haversineKm(a, b) * 1000);

export type CheckinFailure = 'no_business_location' | 'bad_position' | 'low_accuracy' | 'too_far';
export type CheckinResult =
  | { ok: true; distanceM: number }
  | { ok: false; reason: CheckinFailure; distanceM?: number };

/** O cliente está no local? Usa a posição do aparelho e a localização cadastrada da empresa. */
export const checkinCheck = (
  user: (Partial<LatLng> & { accuracy?: number }) | null | undefined,
  business: Partial<LatLng> | null | undefined,
): CheckinResult => {
  if (!isValidLatLng(business)) return { ok: false, reason: 'no_business_location' };
  const acc = user?.accuracy;
  if (!isValidLatLng(user)) return { ok: false, reason: 'bad_position' };
  if (typeof acc === 'number' && Number.isFinite(acc) && acc > MAX_ACCURACY_M) return { ok: false, reason: 'low_accuracy' };
  const d = distanceMeters(user, business);
  return d <= CHECKIN_RADIUS_M ? { ok: true, distanceM: d } : { ok: false, reason: 'too_far', distanceM: d };
};

export const CHECKIN_MESSAGES: Record<CheckinFailure, string> = {
  no_business_location: 'Esta empresa ainda não marcou o local no mapa, então o check-in não está disponível.',
  bad_position: 'Não conseguimos ler a sua localização. Ative o GPS e tente de novo.',
  low_accuracy: 'O GPS está impreciso agora. Vá para um local aberto, espere alguns segundos e tente de novo.',
  too_far: 'Você parece estar longe da empresa. O check-in só vale perto do local (até 150 m).',
};

/** O ponto escolhido no cadastro está na Região dos Lagos? (evita pin no meio do oceano ou em outra cidade) */
export const isInsideRegion = (p: unknown): boolean => isValidLatLng(p) && locateMunicipality(p).inRegion;

/** Texto de busca de endereço (para geocodificar), sem duplicar partes. */
export const buildAddressQuery = (parts: { address?: string; neighborhood?: string; city?: string }): string => {
  const out: string[] = [];
  for (const raw of [parts.address, parts.neighborhood, parts.city, 'RJ', 'Brasil']) {
    const v = (raw || '').trim();
    if (v && !out.some(o => o.toLowerCase().includes(v.toLowerCase()))) out.push(v);
  }
  return out.join(', ');
};

/** Link para abrir a rota no app de mapas do celular. */
export const directionsUrl = (to: LatLng): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${to.lat},${to.lng}`;
