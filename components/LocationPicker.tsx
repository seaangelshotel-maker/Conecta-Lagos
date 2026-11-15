import React, { useState, useEffect, useRef } from 'react';
import { Crosshair, Loader2, MapPin, Search } from 'lucide-react';
import { useNotification } from './NotificationSystem';
import { loadLeaflet } from '../services/loadLeaflet';
import { getDevicePosition, searchAddress, type PlaceResult } from '../services/geoService';
import { isInsideRegion, isValidLatLng } from '../services/geoRules';

export type LocationSource = 'gps' | 'address' | 'map';

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number, source?: LocationSource) => void;
  /** Texto de busca sugerido (ex.: endereço digitado no cadastro). */
  addressHint?: string;
}

// Leaflet é carregado sob demanda (services/loadLeaflet) só nesta tela.
let L: any;

// Centro padrão: Região dos Lagos (Arraial do Cabo / Cabo Frio)
const DEFAULT = { lat: -22.9, lng: -42.03 };

/**
 * Marca o local da empresa no mapa. Três jeitos: "Estou aqui" (GPS do aparelho, o mais preciso quando o
 * dono está no estabelecimento), buscar pelo endereço, ou tocar/arrastar o pino no mapa.
 * O ponto precisa ficar na Região dos Lagos.
 */
export const LocationPicker: React.FC<LocationPickerProps> = ({ initialLat, initialLng, onLocationSelect, addressHint }) => {
  const { notify } = useNotification();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const onSelectRef = useRef(onLocationSelect);
  onSelectRef.current = onLocationSelect;

  const [searchQuery, setSearchQuery] = useState(addressHint || '');
  const [isSearching, setIsSearching] = useState(false);
  const [locating, setLocating] = useState(false);
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [leafletReady, setLeafletReady] = useState(!!(typeof window !== 'undefined' && (window as any).L));

  useEffect(() => { if (addressHint) setSearchQuery(prev => prev || addressHint); }, [addressHint]);

  useEffect(() => {
    let alive = true;
    loadLeaflet().then(lib => { L = lib; if (alive) setLeafletReady(true); }).catch(() => notify('error', 'Não foi possível carregar o mapa. Verifique a conexão.'));
    return () => { alive = false; };
  }, []);

  // Aceita o ponto só se estiver na região; senão avisa e volta ao ponto anterior.
  const accept = (lat: number, lng: number, source: LocationSource): boolean => {
    if (!isInsideRegion({ lat, lng })) {
      notify('warning', 'Esse ponto fica fora da Região dos Lagos. Escolha o local da empresa dentro da região.');
      return false;
    }
    onSelectRef.current(lat, lng, source);
    return true;
  };

  useEffect(() => {
    if (!mapContainerRef.current || !leafletReady) return;
    L = L || (window as any).L;

    if (!mapInstanceRef.current) {
      const has = isValidLatLng({ lat: initialLat, lng: initialLng });
      const start = has ? { lat: initialLat!, lng: initialLng! } : DEFAULT;
      const map = L.map(mapContainerRef.current, { center: [start.lat, start.lng], zoom: has ? 17 : 11, zoomControl: true, attributionControl: false });
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

      const icon = L.divIcon({
        className: 'custom-pin',
        html: `<div style="background-color:#ef4444;width:18px;height:18px;border-radius:50%;border:3px solid white;box-shadow:0 4px 8px rgba(0,0,0,.35)"></div>`,
        iconSize: [18, 18], iconAnchor: [9, 9],
      });
      const marker = L.marker([start.lat, start.lng], { draggable: true, icon }).addTo(map);
      let last = start;

      marker.on('dragend', () => {
        const p = marker.getLatLng();
        if (accept(p.lat, p.lng, 'map')) last = { lat: p.lat, lng: p.lng };
        else marker.setLatLng([last.lat, last.lng]);
      });
      map.on('click', (e: any) => {
        if (accept(e.latlng.lat, e.latlng.lng, 'map')) { marker.setLatLng(e.latlng); last = { lat: e.latlng.lat, lng: e.latlng.lng }; }
      });

      mapInstanceRef.current = map;
      markerRef.current = marker;
    }
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; markerRef.current = null; }
    };
  }, [leafletReady]);

  // Quando o ponto muda por fora (dados carregados), move o pino.
  useEffect(() => {
    if (mapInstanceRef.current && markerRef.current && isValidLatLng({ lat: initialLat, lng: initialLng })) {
      const cur = markerRef.current.getLatLng();
      if (Math.abs(cur.lat - initialLat!) > 0.00005 || Math.abs(cur.lng - initialLng!) > 0.00005) {
        const ll = new L.LatLng(initialLat, initialLng);
        markerRef.current.setLatLng(ll);
        mapInstanceRef.current.setView(ll, Math.max(mapInstanceRef.current.getZoom(), 16));
      }
    }
  }, [initialLat, initialLng]);

  const moveTo = (lat: number, lng: number, source: LocationSource, zoom = 17) => {
    if (!accept(lat, lng, source)) return;
    if (mapInstanceRef.current && markerRef.current) {
      const ll = new L.LatLng(lat, lng);
      markerRef.current.setLatLng(ll);
      mapInstanceRef.current.setView(ll, zoom);
    }
  };

  const useMyLocation = async () => {
    setLocating(true);
    try {
      const p = await getDevicePosition();
      moveTo(p.lat, p.lng, 'gps');
      if (isInsideRegion(p)) notify('success', 'Local marcado com o seu GPS. Se não for aqui, arraste o pino.');
    } catch (e: any) {
      notify('error', e?.message || 'Não conseguimos ler a sua localização.');
    } finally { setLocating(false); }
  };

  const performSearch = async () => {
    if (searchQuery.trim().length < 4) return notify('warning', 'Digite o endereço (rua, número e bairro).');
    setIsSearching(true);
    (document.activeElement as HTMLElement | null)?.blur();
    try {
      const found = await searchAddress(searchQuery);
      if (!found.length) {
        setResults([]);
        notify('warning', 'Não achamos esse endereço. Use "Estou aqui" ou toque no mapa para marcar o local.');
      } else if (found.length === 1) {
        setResults([]); moveTo(found[0].lat, found[0].lng, 'address');
      } else {
        setResults(found);
      }
    } catch (err: any) {
      notify('error', err?.message || 'Erro ao buscar o endereço. Marque o local no mapa.');
    } finally { setIsSearching(false); }
  };

  return (
    <div className="space-y-3" data-testid="location-picker">
      <button type="button" onClick={useMyLocation} disabled={locating}
        className="w-full py-3 rounded-2xl bg-ocean-600 text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60" data-testid="location-gps">
        {locating ? <Loader2 size={16} className="animate-spin" /> : <Crosshair size={16} />}
        {locating ? 'Lendo o GPS...' : 'Estou aqui — usar minha localização'}
      </button>

      <div className="relative shadow-sm rounded-xl flex items-center bg-white overflow-hidden border border-slate-200">
        <input type="text" placeholder="Ou busque pelo endereço..." value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); void performSearch(); } }}
          className="flex-1 min-w-0 pl-3 pr-2 py-3 text-sm focus:outline-none text-slate-800 placeholder:text-slate-400 bg-transparent" />
        <button type="button" onClick={() => void performSearch()} disabled={isSearching} aria-label="Buscar endereço"
          className="px-4 py-3 bg-slate-800 text-white flex items-center justify-center shrink-0">
          {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
        </button>
      </div>

      {results.length > 0 && (
        <ul className="bg-white border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden" data-testid="location-results">
          {results.map((r, i) => (
            <li key={i}>
              <button type="button" onClick={() => { moveTo(r.lat, r.lng, 'address'); setResults([]); }}
                className="w-full text-left px-3 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-start gap-2">
                <MapPin size={14} className="text-ocean-600 mt-0.5 shrink-0" /> <span>{r.label}</span>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className="relative w-full h-64 rounded-2xl overflow-hidden border border-slate-200 isolate">
        <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-slate-100" />
      </div>
      <p className="text-[11px] text-slate-400">Toque no mapa ou arraste o pino até a porta do estabelecimento. É esse ponto que libera o check-in dos clientes.</p>
    </div>
  );
};
