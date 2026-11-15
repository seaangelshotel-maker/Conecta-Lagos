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

/** Token público do Mapbox (feito para ficar no navegador; restrito ao nosso domínio no painel do Mapbox). */
// Leitura direta: o Vite só embute a chave no build se for escrito exatamente assim.
export const MAPBOX_TOKEN: string = (import.meta.env.VITE_MAPBOX_TOKEN as string | undefined) || '';
export const hasMapbox = (): boolean => MAPBOX_TOKEN.length > 20;

// Caixa da Região dos Lagos (oeste, sul, leste, norte) para a busca priorizar a região.
const REGION_BBOX = { w: -42.62, s: -23.12, e: -41.78, n: -22.62 };

const searchMapbox = async (q: string, signal?: AbortSignal): Promise<PlaceResult[]> => {
  const url = 'https://api.mapbox.com/search/geocode/v6/forward'
    + `?q=${encodeURIComponent(q)}&country=br&language=pt&limit=6&proximity=-42.03,-22.9`
    + `&bbox=${REGION_BBOX.w},${REGION_BBOX.s},${REGION_BBOX.e},${REGION_BBOX.n}&access_token=${MAPBOX_TOKEN}`;
  const res = await fetch(url, { signal });
  if (!res.ok) throw new Error('A busca de endereço está indisponível agora. Marque o local no mapa.');
  const data = await res.json() as { features?: Array<{ geometry?: { coordinates?: number[] }; properties?: { full_address?: string; name?: string; place_formatted?: string } }> };
  return (data.features || []).map(f => ({
    label: f.properties?.full_address || [f.properties?.name, f.properties?.place_formatted].filter(Boolean).join(', '),
    lat: Number(f.geometry?.coordinates?.[1]),
    lng: Number(f.geometry?.coordinates?.[0]),
  })).filter(r => r.label && isInsideRegion(r));
};

const searchNominatim = async (q: string, signal?: AbortSignal): Promise<PlaceResult[]> => {
  const url = `https://nominatim.openstreetmap.org/search?format=jsonv2&limit=6&countrycodes=br&accept-language=pt-BR`
    + `&viewbox=${REGION_BBOX.w},${REGION_BBOX.n},${REGION_BBOX.e},${REGION_BBOX.s}&bounded=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, { signal, headers: { Accept: 'application/json' } });
  if (!res.ok) throw new Error('A busca de endereço está indisponível agora. Marque o local no mapa.');
  const rows = (await res.json()) as Array<{ display_name?: string; lat?: string; lon?: string }>;
  return rows
    .map(r => ({ label: String(r.display_name || '').split(',').slice(0, 4).join(',').trim(), lat: Number(r.lat), lng: Number(r.lon) }))
    .filter(r => r.label && isInsideRegion(r));
};

/**
 * Procura um endereço dentro da Região dos Lagos. Usa o Mapbox quando há token; se falhar (ou sem token),
 * cai no OpenStreetMap. Só roda quando a pessoa toca no botão de buscar.
 */
export const searchAddress = async (query: string, signal?: AbortSignal): Promise<PlaceResult[]> => {
  const q = query.trim();
  if (q.length < 4) return [];
  if (hasMapbox()) {
    try {
      const r = await searchMapbox(q, signal);
      if (r.length) return r;
    } catch (e) { if ((e as any)?.name === 'AbortError') throw e; /* tenta o OpenStreetMap */ }
  }
  return searchNominatim(q, signal);
};

/** Camadas do mapa: satélite com nomes de ruas (precisão) e ruas. Sem token, só o OpenStreetMap. */
export const mapLayers = () => hasMapbox()
  ? {
      satellite: { url: `https://api.mapbox.com/styles/v1/mapbox/satellite-streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`, tileSize: 512, zoomOffset: -1, maxZoom: 19, label: 'Satélite' },
      streets: { url: `https://api.mapbox.com/styles/v1/mapbox/streets-v12/tiles/{z}/{x}/{y}?access_token=${MAPBOX_TOKEN}`, tileSize: 512, zoomOffset: -1, maxZoom: 19, label: 'Mapa' },
    }
  : {
      streets: { url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', tileSize: 256, zoomOffset: 0, maxZoom: 19, label: 'Mapa' },
    } as Record<string, { url: string; tileSize: number; zoomOffset: number; maxZoom: number; label: string }>;
