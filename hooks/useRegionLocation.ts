import { useCallback, useState } from 'react';
import { REGION_MUNICIPALITIES, locateMunicipality, Municipality } from '../services/regionGeo';

/**
 * Localização para descoberta. Regras:
 * - Só pede o GPS quando a pessoa aciona "Usar minha localização" (nunca ao abrir o app).
 * - Guarda apenas a última posição autorizada na sessão, sem histórico e sem enviar ao servidor.
 * - Se negar ou o GPS falhar, oferece escolher um município manualmente.
 */
const SESSION_KEY = 'lagos_go_last_position';

export type LocationStatus = 'idle' | 'asking' | 'ok' | 'denied' | 'unavailable' | 'manual';

export interface RegionLocation {
  status: LocationStatus;
  where: { lat: number; lng: number } | null;
  municipality: Municipality | null;
  error: string;
  request: () => void;
  chooseManual: (id: string) => void;
  reset: () => void;
}

const readStored = (): { lat: number; lng: number } | null => {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const v = JSON.parse(raw);
    return typeof v?.lat === 'number' && typeof v?.lng === 'number' ? v : null;
  } catch { return null; }
};

const writeStored = (p: { lat: number; lng: number } | null) => {
  try {
    if (p) sessionStorage.setItem(SESSION_KEY, JSON.stringify(p));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch { /* armazenamento indisponível: segue sem cache */ }
};

export const useRegionLocation = (): RegionLocation => {
  const stored = readStored();
  const [status, setStatus] = useState<LocationStatus>(stored ? 'ok' : 'idle');
  const [where, setWhere] = useState<{ lat: number; lng: number } | null>(stored);
  const [manual, setManual] = useState<Municipality | null>(null);
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
        setWhere(p); writeStored(p); setManual(null); setStatus('ok');
      },
      err => {
        if (err.code === 1) {
          setStatus('denied');
          setError('Você não liberou a localização. Escolha sua cidade abaixo; o resto do app continua funcionando.');
        } else {
          setStatus('unavailable');
          setError('Não conseguimos o GPS agora. Tente de novo ou escolha uma cidade abaixo.');
        }
      },
      { timeout: 8000, maximumAge: 5 * 60 * 1000, enableHighAccuracy: false },
    );
  }, []);

  const chooseManual = useCallback((id: string) => {
    const m = REGION_MUNICIPALITIES.find(x => x.id === id) || null;
    if (!m) return;
    setManual(m);
    const p = { lat: m.lat, lng: m.lng };
    setWhere(p); writeStored(null); setStatus('manual'); setError('');
  }, []);

  const reset = useCallback(() => {
    setWhere(null); setManual(null); writeStored(null); setStatus('idle'); setError('');
  }, []);

  const municipality = manual ?? (where ? (() => {
    const l = locateMunicipality(where);
    return l.inRegion ? l.municipality : null;
  })() : null);

  return { status, where, municipality, error, request, chooseManual, reset };
};
