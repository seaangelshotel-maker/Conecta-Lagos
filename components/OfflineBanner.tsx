import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

/** Aviso discreto quando o aparelho fica sem internet (o service worker segue mostrando o que já foi carregado). */
export const OfflineBanner: React.FC = () => {
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);
  useEffect(() => {
    const on = () => setOffline(false); const off = () => setOffline(true);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (!offline) return null;
  return (
    <div role="status" data-testid="offline-banner"
      className="fixed left-0 right-0 z-[60] bg-slate-800 text-white text-xs font-bold px-4 py-2 flex items-center justify-center gap-2"
      style={{ top: 'env(safe-area-inset-top)' }}>
      <WifiOff size={14} /> Sem conexão. Mostrando o que já foi carregado.
    </div>
  );
};
