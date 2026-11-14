import React, { useEffect, useState } from 'react';
import { WifiOff, RefreshCw } from 'lucide-react';
import { isNativeApp } from '../services/appMode';

/** Sem internet: no app instalado mostra uma tela cheia com botão de tentar de novo; no navegador, só um aviso discreto. */
export const OfflineBanner: React.FC = () => {
  const [offline, setOffline] = useState(typeof navigator !== 'undefined' && navigator.onLine === false);
  useEffect(() => {
    const on = () => setOffline(false); const off = () => setOffline(true);
    window.addEventListener('online', on); window.addEventListener('offline', off);
    return () => { window.removeEventListener('online', on); window.removeEventListener('offline', off); };
  }, []);
  if (!offline) return null;
  if (isNativeApp()) {
    return (
      <div role="status" data-testid="offline-screen" className="fixed inset-0 z-[90] flex flex-col items-center justify-center text-center px-8 text-white"
        style={{ background: 'radial-gradient(circle at 50% 35%, #1d5fa8 0%, #0A2242 70%)' }}>
        <WifiOff size={56} className="opacity-90" />
        <h2 className="mt-5 text-2xl font-black">Sem conexão</h2>
        <p className="mt-2 text-white/75 text-sm">Conecte-se ao Wi-Fi ou aos dados móveis para ver o Lagos GO.</p>
        <button onClick={() => (navigator.onLine ? window.location.reload() : setOffline(false))} className="mt-6 inline-flex items-center gap-2 bg-white text-ocean-700 font-black px-6 py-3 rounded-full active:scale-95">
          <RefreshCw size={16} /> Tentar de novo
        </button>
      </div>
    );
  }
  return (
    <div role="status" data-testid="offline-banner"
      className="fixed left-0 right-0 z-[60] bg-slate-800 text-white text-xs font-bold px-4 py-2 flex items-center justify-center gap-2"
      style={{ top: 'env(safe-area-inset-top)' }}>
      <WifiOff size={14} /> Sem conexão. Mostrando o que já foi carregado.
    </div>
  );
};
