import { useCallback, useEffect, useRef, useState } from 'react';
import { REGION_MUNICIPALITIES, locateMunicipality, movedEnough, Municipality } from '../services/regionGeo';

/**
 * Localização para descoberta. Separa duas coisas:
 *  - ONDE A PESSOA ESTÁ (gps): só vem do aparelho, com autorização, e nunca é enviada ao servidor.
 *  - O QUE ELA QUER VER (choice): 'geral' (toda a região) ou uma cidade escolhida. Sempre prevalece sobre o GPS.
 * A localização apenas prioriza o conteúdo; nunca esconde nem impede de ver outra cidade.
 * Fora da Região dos Lagos (ex.: Minas, São Paulo), o padrão é o conteúdo geral.
 */
// Mesma chave usada por Guia, Busca e Mapa, para o app inteiro compartilhar a última posição autorizada.
const SESSION_KEY = 'user_gps';
// Escolha da pessoa (cidade ou "geral"): é preferência, não rastreamento; fica só no aparelho.
const PREF_KEY = 'lagos_go_preferred_city';
export const GENERAL = 'geral';

export type LocationStatus = 'idle' | 'asking' | 'ok' | 'denied' | 'unavailable' | 'manual';
type LatLng = { lat: number; lng: number };

export interface RegionLocation {
  status: LocationStatus;
  /** Posição real do aparelho (null se não autorizada). Use só para o "pino de GPS". */
  gps: LatLng | null;
  /** Ponto de referência para "perto de mim": o GPS (se dentro da região) ou o centro da cidade escolhida. */
  where: LatLng | null;
  /** Cidade que organiza o conteúdo; null = conteúdo geral da região. */
  municipality: Municipality | null;
  /** Escolha explícita da pessoa: 'geral', id de município ou null (seguir o GPS). */
  choice: string | null;
  /** GPS autorizado, mas a pessoa está fora da Região dos Lagos. */
  outside: boolean;
  error: string;
  request: () => void;
  /** 'geral' | 'auto' (voltar a seguir o GPS) | id de município. */
  choose: (id: string) => void;
  reset: () => void;
}

const readStored = (): LatLng | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return typeof v?.lat === 'number' && typeof v?.lng === 'number' ? v : null;
  } catch { return null; }
};
const writeStored = (p: LatLng | null) => {
  try {
    if (p) sessionStorage.setItem(SESSION_KEY, JSON.stringify(p));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch { /* armazenamento indisponível: segue sem cache */ }
};
const readChoice = (): string | null => {
  try {
    const id = localStorage.getItem(PREF_KEY);
    return id === GENERAL || REGION_MUNICIPALITIES.some(m => m.id === id) ? id : null;
  } catch { return null; }
};
const writeChoice = (id: string | null) => {
  try { if (id) localStorage.setItem(PREF_KEY, id); else localStorage.removeItem(PREF_KEY); } catch { /* sem armazenamento */ }
};

export const useRegionLocation = (): RegionLocation => {
  const [gps, setGps] = useState<LatLng | null>(readStored);
  const [choice, setChoice] = useState<string | null>(readChoice);
  const [status, setStatus] = useState<LocationStatus>(() => (readStored() ? 'ok' : readChoice() ? 'manual' : 'idle'));
  const [error, setError] = useState('');

  const request = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('unavailable');
      setError('Seu navegador não permite localização. Escolha uma cidade abaixo.');
      return;
    }
    setStatus('asking');
    setError('');
    navigator.geolocation.getCurrentPosition(
      pos => {
        const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setGps(p); writeStored(p);
        // Quem pede "usar minha localização" quer seguir o GPS: limpa a escolha manual anterior.
        setChoice(null); writeChoice(null);
        setStatus('ok');
      },
      err => {
        setStatus(readChoice() ? 'manual' : err.code === 1 ? 'denied' : 'unavailable');
        setError(err.code === 1
          ? 'Você não liberou a localização. Escolha uma cidade abaixo; o resto do app continua funcionando.'
          : 'Não conseguimos o GPS agora. Tente de novo ou escolha uma cidade abaixo.');
      },
      { timeout: 8000, maximumAge: 5 * 60 * 1000, enableHighAccuracy: false },
    );
  }, []);

  const choose = useCallback((id: string) => {
    setError('');
    if (id === 'auto') { setChoice(null); writeChoice(null); setStatus(gps ? 'ok' : 'idle'); return; }
    if (id !== GENERAL && !REGION_MUNICIPALITIES.some(m => m.id === id)) return;
    setChoice(id); writeChoice(id);
    if (!gps) setStatus('manual'); // o GPS, se houver, é mantido
  }, [gps]);

  const reset = useCallback(() => {
    setGps(null); setChoice(null); writeStored(null); writeChoice(null); setStatus('idle'); setError('');
  }, []);

  // Deslocamento: sem monitorar o GPS o tempo todo. Só confere quando a pessoa volta ao app
  // (aba visível), apenas se a permissão já foi concedida, e só atualiza se ela andou de verdade.
  const gpsRef = useRef(gps);
  gpsRef.current = gps;
  const hasGps = !!gps;
  useEffect(() => {
    if (!hasGps) return;
    let cancelled = false;
    const refresh = async () => {
      if (document.visibilityState !== 'visible' || !navigator.geolocation) return;
      try {
        const perm = await navigator.permissions?.query({ name: 'geolocation' as PermissionName });
        if (perm && perm.state !== 'granted') return; // nunca pede de novo por conta própria
      } catch { /* sem Permissions API: segue, pois já houve autorização nesta sessão */ }
      navigator.geolocation.getCurrentPosition(
        pos => {
          if (cancelled) return;
          const p = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          if (movedEnough(gpsRef.current, p)) { setGps(p); writeStored(p); }
        },
        () => { /* falha silenciosa: mantém a última posição */ },
        { timeout: 8000, maximumAge: 5 * 60 * 1000, enableHighAccuracy: false },
      );
    };
    document.addEventListener('visibilitychange', refresh);
    return () => { cancelled = true; document.removeEventListener('visibilitychange', refresh); };
  }, [hasGps]);

  const located = gps ? locateMunicipality(gps) : null;
  const gpsInRegion = !!located?.inRegion;
  const chosen = choice && choice !== GENERAL ? REGION_MUNICIPALITIES.find(m => m.id === choice) || null : null;

  // Escolha explícita vence o GPS. Sem escolha: município do GPS se estiver na região; fora dela, conteúdo geral.
  const municipality = choice === GENERAL ? null : chosen ?? (gpsInRegion ? located!.municipality : null);
  const where = gps && gpsInRegion ? gps : chosen ? { lat: chosen.lat, lng: chosen.lng } : null;
  const outside = !!gps && !gpsInRegion;

  return { status, gps, where, municipality, choice, outside, error, request, choose, reset };
};
