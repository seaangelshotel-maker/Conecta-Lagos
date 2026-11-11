import { useCallback, useEffect, useRef, useState } from 'react';
import { REGION_MUNICIPALITIES, locateMunicipality, movedEnough, Municipality } from '../services/regionGeo';

/**
 * Localização para descoberta. Regras:
 * - Só pede o GPS quando a pessoa aciona "Usar minha localização" (nunca ao abrir o app).
 * - Guarda apenas a última posição autorizada na sessão, sem histórico e sem enviar ao servidor.
 * - Se negar ou o GPS falhar, oferece escolher um município manualmente.
 */
// Mesma chave usada por Guia, Busca e Mapa, para o app inteiro compartilhar a última posição autorizada.
const SESSION_KEY = 'user_gps';
// Cidade preferida escolhida pela pessoa: é uma preferência (não rastreamento), fica só no aparelho.
const PREF_KEY = 'lagos_go_preferred_city';

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

const readPref = (): Municipality | null => {
  try {
    const id = localStorage.getItem(PREF_KEY);
    return REGION_MUNICIPALITIES.find(m => m.id === id) || null;
  } catch { return null; }
};
const writePref = (id: string | null) => {
  try { if (id) localStorage.setItem(PREF_KEY, id); else localStorage.removeItem(PREF_KEY); } catch { /* sem armazenamento */ }
};

export const useRegionLocation = (): RegionLocation => {
  const stored = readStored();
  const pref = stored ? null : readPref();
  const [status, setStatus] = useState<LocationStatus>(stored ? 'ok' : pref ? 'manual' : 'idle');
  const [where, setWhere] = useState<{ lat: number; lng: number } | null>(stored ?? (pref ? { lat: pref.lat, lng: pref.lng } : null));
  const [manual, setManual] = useState<Municipality | null>(pref);
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
    setWhere(p); writeStored(null); writePref(m.id); setStatus('manual'); setError('');
  }, []);

  const reset = useCallback(() => {
    setWhere(null); setManual(null); writeStored(null); writePref(null); setStatus('idle'); setError('');
  }, []);

  // Deslocamento: sem monitorar o GPS o tempo todo. Só confere quando a pessoa volta ao app
  // (aba visível), apenas se a permissão já foi concedida, e só atualiza se ela andou de verdade.
  const whereRef = useRef(where);
  whereRef.current = where;
  useEffect(() => {
    if (status !== 'ok') return;
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
          if (movedEnough(whereRef.current, p)) { setWhere(p); writeStored(p); }
        },
        () => { /* falha silenciosa: mantém a última posição */ },
        { timeout: 8000, maximumAge: 5 * 60 * 1000, enableHighAccuracy: false },
      );
    };
    document.addEventListener('visibilitychange', refresh);
    return () => { cancelled = true; document.removeEventListener('visibilitychange', refresh); };
  }, [status]);

  const municipality = manual ?? (where ? (() => {
    const l = locateMunicipality(where);
    return l.inRegion ? l.municipality : null;
  })() : null);

  return { status, where, municipality, error, request, chooseManual, reset };
};
