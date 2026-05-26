
import React, { useState, useEffect, useRef } from 'react';
import { MapPin, Navigation, Search, Loader2 } from 'lucide-react';
import { useNotification } from './NotificationSystem';

interface LocationPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
}

// Declare Leaflet global (loaded via CDN in index.html)
declare const L: any;

export const LocationPicker: React.FC<LocationPickerProps> = ({ initialLat, initialLng, onLocationSelect }) => {
  const { notify } = useNotification();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Rio de Janeiro Default Center (Centralizado para cobrir Zonas Norte, Sul, Oeste e Centro)
  const DEFAULT_LAT = -22.9068;
  const DEFAULT_LNG = -43.1729;

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Map only once
    if (!mapInstanceRef.current) {
        const startLat = initialLat || DEFAULT_LAT;
        const startLng = initialLng || DEFAULT_LNG;

        // Create Map
        const map = L.map(mapContainerRef.current, {
            center: [startLat, startLng],
            zoom: 11, // Zoom ajustado para ver o Rio como um todo
            zoomControl: false, 
            attributionControl: false
        });

        // Add OpenStreetMap Tiles
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
        }).addTo(map);

        // Custom Icon
        const customIcon = L.divIcon({
            className: 'custom-pin',
            html: `<div style="background-color: #ef4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 4px 6px rgba(0,0,0,0.3);"></div>`,
            iconSize: [12, 12],
            iconAnchor: [6, 6]
        });

        // Add Marker
        const marker = L.marker([startLat, startLng], { 
            draggable: true,
            icon: customIcon 
        }).addTo(map);

        marker.on('dragend', function(event: any) {
            const position = marker.getLatLng();
            onLocationSelect(position.lat, position.lng);
        });

        // Map Click Event
        map.on('click', function(e: any) {
            marker.setLatLng(e.latlng);
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        });

        mapInstanceRef.current = map;
        markerRef.current = marker;
    }

    // Cleanup
    return () => {
        if (mapInstanceRef.current) {
            mapInstanceRef.current.remove();
            mapInstanceRef.current = null;
        }
    };
  }, []); // Run once on mount

  // Update marker if props change externally (e.g. loading saved data)
  useEffect(() => {
      if (mapInstanceRef.current && markerRef.current && initialLat && initialLng) {
          const currentPos = markerRef.current.getLatLng();
          // Only update if significantly different to avoid loops
          if (Math.abs(currentPos.lat - initialLat) > 0.0001 || Math.abs(currentPos.lng - initialLng) > 0.0001) {
              const newLatLng = new L.LatLng(initialLat, initialLng);
              markerRef.current.setLatLng(newLatLng);
              mapInstanceRef.current.setView(newLatLng, 15);
          }
      }
  }, [initialLat, initialLng]);

  const performSearch = async () => {
      if (!searchQuery) return;

      setIsSearching(true);
      
      // Fecha o teclado no mobile
      const activeElement = document.activeElement as HTMLElement;
      if (activeElement) {
        activeElement.blur();
      }

      try {
          // Use OpenStreetMap Nominatim API (Free)
          // Appending ' Rio de Janeiro' to ensure it searches within the state/city
          const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery + ', Rio de Janeiro, Brasil')}`);
          const data = await response.json();

          if (data && data.length > 0) {
              const { lat, lon } = data[0];
              const newLat = parseFloat(lat);
              const newLng = parseFloat(lon);

              if (mapInstanceRef.current && markerRef.current) {
                  const newLatLng = new L.LatLng(newLat, newLng);
                  markerRef.current.setLatLng(newLatLng);
                  mapInstanceRef.current.setView(newLatLng, 14); // Zoom apropriado para bairro
                  onLocationSelect(newLat, newLng);
              }
          } else {
              notify('warning', "Local não encontrado. Tente digitar o nome do bairro seguido de 'RJ'. Ex: 'Sepetiba RJ'");
          }
      } catch (err) {
          console.error("Geocoding error:", err);
          notify('error', "Erro ao buscar local.");
      } finally {
          setIsSearching(false);
      }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') {
          e.preventDefault(); // Impede submissão de formulários pai
          performSearch();
      }
  };

  return (
    <div className="relative w-full h-full min-h-[300px] rounded-xl overflow-hidden shadow-inner border-2 border-slate-200 group isolate">
        
        {/* Map Container */}
        <div ref={mapContainerRef} className="absolute inset-0 z-0 bg-slate-100" />

        {/* Search Overlay - Estilo Mobile Safe */}
        <div className="absolute top-2 left-2 right-2 z-[1000]">
            <div className="relative shadow-lg rounded-lg flex items-center bg-white overflow-hidden border border-slate-200 w-full">
                <input 
                    type="text" 
                    placeholder="Buscar local..." 
                    className="flex-1 min-w-0 pl-3 pr-2 py-3 text-sm focus:outline-none text-slate-800 placeholder:text-slate-400 bg-transparent"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button 
                    type="button" 
                    onClick={performSearch}
                    className="px-4 py-3 bg-ocean-600 text-white hover:bg-ocean-700 transition-colors flex items-center justify-center border-l border-ocean-700 active:bg-ocean-800 shrink-0"
                    disabled={isSearching}
                >
                    {isSearching ? <Loader2 size={18} className="animate-spin" /> : <Search size={18} />}
                </button>
            </div>
        </div>

        {/* Pin Center Marker (Visual Aid) */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none z-[400] text-red-600 drop-shadow-md pb-8">
             <MapPin size={36} fill="currentColor" className="animate-bounce" />
        </div>

        <div className="absolute bottom-3 right-3 z-[400] bg-white/90 backdrop-blur px-3 py-1.5 rounded-lg shadow-sm border border-slate-200 pointer-events-none">
            <p className="text-[10px] text-slate-500 font-bold flex items-center gap-1">
                <Navigation size={10} /> Arraste o mapa
            </p>
        </div>
    </div>
  );
};
