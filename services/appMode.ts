/** Detecta se o site está rodando dentro do app instalado (Android nativo ou PWA), e não no navegador comum. */
export const isNativeApp = (): boolean => {
  if (typeof window === 'undefined') return false;
  const cap = (window as any).Capacitor;
  if (cap?.isNativePlatform?.()) return true;
  return !!(window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone);
};
