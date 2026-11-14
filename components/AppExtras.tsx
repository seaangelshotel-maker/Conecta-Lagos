import React, { useEffect, useRef, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { isNativeApp } from '../services/appMode';

/** Tela de abertura do app: aparece uma vez por sessão e some com fade (o carregamento inicial usa o splash do index.html). */
export const AppSplash: React.FC = () => {
  const [show, setShow] = useState(() => isNativeApp() && !sessionStorage.getItem('lagosgo_splash_done'));
  const [fade, setFade] = useState(false);
  useEffect(() => {
    if (!show) return;
    sessionStorage.setItem('lagosgo_splash_done', '1');
    const a = setTimeout(() => setFade(true), 900);
    const b = setTimeout(() => setShow(false), 1300);
    return () => { clearTimeout(a); clearTimeout(b); };
  }, [show]);
  if (!show) return null;
  return (
    <div data-testid="app-splash" className={`fixed inset-0 z-[100] flex flex-col items-center justify-center text-white transition-opacity duration-400 ${fade ? 'opacity-0' : 'opacity-100'}`}
      style={{ background: 'radial-gradient(circle at 50% 35%, #1d5fa8 0%, #0A2242 70%)' }}>
      <img src="/icons/icon-512.png" alt="" className="w-28 h-28 rounded-[28px] shadow-2xl animate-pulse" />
      <p className="mt-6 text-3xl font-black tracking-wide">LAGOS <span className="text-amber-300">GO</span></p>
      <p className="mt-1 text-sm text-white/70">O guia da Região dos Lagos</p>
    </div>
  );
};

/** Puxar para atualizar (só no app instalado): puxe a tela para baixo estando no topo. */
export const PullToRefresh: React.FC = () => {
  const [pull, setPull] = useState(0);
  const [busy, setBusy] = useState(false);
  const start = useRef<number | null>(null);
  const native = isNativeApp();
  useEffect(() => {
    if (!native) return;
    const ts = (e: TouchEvent) => { start.current = window.scrollY <= 0 && e.touches[0].clientX > 24 ? e.touches[0].clientY : null; };
    const tm = (e: TouchEvent) => {
      if (start.current == null) return;
      const d = e.touches[0].clientY - start.current;
      if (d > 0 && window.scrollY <= 0) setPull(Math.min(d * 0.5, 90)); else setPull(0);
    };
    const te = () => {
      if (start.current != null && pull >= 70) { setBusy(true); setTimeout(() => window.location.reload(), 250); }
      else setPull(0);
      start.current = null;
    };
    window.addEventListener('touchstart', ts, { passive: true });
    window.addEventListener('touchmove', tm, { passive: true });
    window.addEventListener('touchend', te, { passive: true });
    return () => { window.removeEventListener('touchstart', ts); window.removeEventListener('touchmove', tm); window.removeEventListener('touchend', te); };
  }, [native, pull]);
  if (!native || (pull === 0 && !busy)) return null;
  return (
    <div className="fixed left-0 right-0 z-[65] flex justify-center pointer-events-none" style={{ top: `calc(env(safe-area-inset-top) + ${Math.max(pull - 36, 4)}px)` }}>
      <span className="w-9 h-9 rounded-full bg-white shadow-lg text-ocean-600 flex items-center justify-center">
        <RefreshCw size={18} className={busy ? 'animate-spin' : ''} style={{ transform: busy ? undefined : `rotate(${pull * 4}deg)` }} />
      </span>
    </div>
  );
};
