/** Carrega o Leaflet (mapa) só quando uma tela precisa dele, em vez de em todas as páginas. */
let _p: Promise<any> | null = null;

export const loadLeaflet = (): Promise<any> => {
  if (typeof window === 'undefined') return Promise.reject(new Error('sem janela'));
  if ((window as any).L) return Promise.resolve((window as any).L);
  if (_p) return _p;
  _p = new Promise((resolve, reject) => {
    const css = document.createElement('link');
    css.rel = 'stylesheet';
    css.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    css.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    css.crossOrigin = '';
    document.head.appendChild(css);
    const js = document.createElement('script');
    js.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    js.integrity = 'sha256-20nQCchB9co0qIjJZRGuk2/Z9VM+kNiyxNV1lvTlZBo=';
    js.crossOrigin = '';
    js.async = true;
    js.onload = () => resolve((window as any).L);
    js.onerror = () => { _p = null; reject(new Error('Não foi possível carregar o mapa.')); };
    document.head.appendChild(js);
  });
  return _p;
};
