// Geolocalização no navegador/app: posição do aparelho e busca de endereço (OpenStreetMap/Nominatim).
// As regras (distância, raio, validações) ficam em geoRules.ts.
import { isInsideRegion, isValidLatLng, type LatLng } from './geoRules';

export interface DevicePosition extends LatLng { accuracy?: number }

export type GeoErrorCode = 'unsupported' | 'denied' | 'unavailable' | 'timeout';
export class GeoError extends Error {
  code: GeoErrorCode;
  constructor(code: GeoErrorCode, message: string) { super(message); this.code = code; }
}

const MESSAGES: Record<GeoErrorCode, string> = {
  unsupported: 'Este aparelho não permite localização.',
  denied: 'A localização está bloqueada. Libere o acesso à localização nas configurações do app ou do navegador e tente de novo.',
  unavailable: 'Não conseguimos ler o GPS agora. Vá para um local aberto e tente de novo.',
  timeout: 'O GPS demorou demais. Tente de novo em um local aberto.',
};

/** Posição atual com boa precisão (para check-in e para marcar o local da empresa). */
export const getDevicePosition = (opts: { timeoutMs?: number; highAccuracy?: boolean } = {}): Promise<DevicePosition> =>
  new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) return reject(new GeoError('unsupported', MESSAGES.unsupported));
    navigator.geolocation.getCurrentPosition(
      pos => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude, accuracy: pos.coords.accuracy };
        isValidLatLng(p) ? resolve(p) : reject(new GeoError('unavailable', MESSAGES.unavailable));
      },
      err => {
        const code: GeoErrorCode = err.code === 1 ? 'denied' : err.code === 3 ? 'timeout' : 'unavailable';
        reject(new GeoError(code, MESSAGES[code]));
      },
      { enableHighAccuracy: opts.highAccuracy !== false, timeout: opts.timeoutMs ?? 15000, maximumAge: 0 },
    );
  });

export interface PlaceResult { label: string; lat: number; lng: number }

// Caixa da Região dos Lagos (esquerda, topo, direita, base) para a busca priorizar a região.
const REGION_VIEWBOX = '-42.62,-22.62,-41.78,-23.12';

/**
 * Procura um endereço. Só devolve resultados dentro da Região dos Lagos.
 * Serviço público e gratuito (OpenStreetMap): a busca só roda quando a pessoa toca no botão.
 */
export const searchAddress = async (query: string, signal?: AbortSignal): Promise<PlaceResult[]> => {
  const q = query.trim();
  if (q.length < 4) return [];
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=br&accept-language=pt-BR`
    + `&viewbox=${REGION_VIEWBOX}&bounded=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('A busca de endereço está indisponível agora. Marque o local no mapa.');
  const rows = (await res.json()) as Array<{ display_name?: string; lat?: string; lon?: string }>;
  return rows
    .map(r => ({ label: String(r.display_name || '').split(',').slice(0, 4).join(',').trim(), lat: Number(r.lat), lng: Number(r.lon) }))
    .filter(r => r.label && isInsideRegion(r));
};
