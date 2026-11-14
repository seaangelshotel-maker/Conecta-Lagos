import React, { useEffect, useRef, useState } from 'react';
import {
  Home, Compass, Ticket, Sparkles, HandHeart, CalendarDays, Map as MapIcon, Layers, Megaphone,
  User as UserIcon, LogIn, Share2, Star, Mail, ShieldCheck, FileText, X, ChevronRight, Menu, RefreshCw,
} from 'lucide-react';
import { User as UserType } from '../types';
import { isNativeApp } from '../services/appMode';

/** Evento global para abrir a gaveta de qualquer lugar (ex.: botão do topo da Home). */
export const openAppDrawer = () => window.dispatchEvent(new Event('lagosgo:drawer'));

interface Props {
  currentUser: UserType | null;
  currentPage: string;
  onNavigate: (page: string, params?: any) => void;
  onLogout: () => void;
}

const PLAY_URL = 'https://play.google.com/store/apps/details?id=org.lagosgo.app';
const SHARE_URL = 'https://lagosgo.com.br';
const SUPPORT_MAIL = 'mailto:comercial@lagosgo.com.br?subject=Lagos%20GO';

export const AppDrawer: React.FC<Props> = ({ currentUser, currentPage, onNavigate, onLogout }) => {
  const [open, setOpen] = useState(false);
  const touch = useRef<{ x: number; y: number; edge: boolean } | null>(null);

  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener('lagosgo:drawer', on);
    return () => window.removeEventListener('lagosgo:drawer', on);
  }, []);

  // Gesto: arrastar a partir da borda esquerda abre; arrastar para a esquerda dentro da gaveta fecha.
  useEffect(() => {
    const start = (e: TouchEvent) => {
      const t = e.touches[0];
      touch.current = { x: t.clientX, y: t.clientY, edge: t.clientX < 22 };
    };
    const end = (e: TouchEvent) => {
      const s = touch.current; touch.current = null;
      if (!s) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - s.x; const dy = Math.abs(t.clientY - s.y);
      if (!open && s.edge && dx > 60 && dy < 50) setOpen(true);
      if (open && dx < -60 && dy < 60) setOpen(false);
    };
    window.addEventListener('touchstart', start, { passive: true });
    window.addEventListener('touchend', end, { passive: true });
    return () => { window.removeEventListener('touchstart', start); window.removeEventListener('touchend', end); };
  }, [open]);

  useEffect(() => { setOpen(false); }, [currentPage]);
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', esc);
    return () => { document.body.style.overflow = prev; window.removeEventListener('keydown', esc); };
  }, [open]);

  const go = (page: string, params?: any) => { setOpen(false); onNavigate(page, params); };

  const share = async () => {
    const data = { title: 'Lagos GO', text: 'Baixe o Lagos GO: o guia da Região dos Lagos.', url: SHARE_URL };
    try {
      if (navigator.share) await navigator.share(data);
      else { await navigator.clipboard.writeText(SHARE_URL); alert('Link copiado!'); }
    } catch { /* cancelado */ }
  };

  type Item = { label: string; icon: React.ReactNode; page?: string; params?: any; onClick?: () => void; active?: string[] };
  const explore: Item[] = [
    { label: 'Início', icon: <Home size={20} />, page: 'home', active: ['home', 'discover'] },
    { label: 'Guia de lugares', icon: <Compass size={20} />, page: 'guide', active: ['guide'] },
    { label: 'Mapa', icon: <MapIcon size={20} />, page: 'map', active: ['map'] },
    { label: 'Cupons e ofertas', icon: <Ticket size={20} />, page: 'search', active: ['search'] },
    { label: 'Eventos', icon: <CalendarDays size={20} />, page: 'events', active: ['events', 'event-detail'] },
    { label: 'Feed e dicas', icon: <Sparkles size={20} />, page: 'blog', active: ['blog', 'blog-detail'] },
    { label: 'Coleções', icon: <Layers size={20} />, page: 'collections', active: ['collections', 'collection-detail'] },
    { label: 'Ajuda colaborativa', icon: <HandHeart size={20} />, page: 'opportunities', active: ['opportunities'] },
  ];
  const more: Item[] = [
    { label: 'Anuncie sua empresa', icon: <Megaphone size={20} />, page: 'pricing-plans' },
    { label: 'Compartilhar o app', icon: <Share2 size={20} />, onClick: share },
    ...(isNativeApp() ? [{ label: 'Avaliar na Play Store', icon: <Star size={20} />, onClick: () => window.open(PLAY_URL, '_blank') } as Item] : []),
    { label: 'Fale com a gente', icon: <Mail size={20} />, onClick: () => window.location.href = SUPPORT_MAIL },
    { label: 'Atualizar o app', icon: <RefreshCw size={20} />, onClick: () => window.location.reload() },
    { label: 'Privacidade', icon: <ShieldCheck size={20} />, page: 'privacy' },
    { label: 'Termos de uso', icon: <FileText size={20} />, page: 'terms' },
  ];

  const row = (it: Item) => {
    const active = it.active?.includes(currentPage);
    return (
      <button
        key={it.label}
        onClick={() => (it.onClick ? it.onClick() : go(it.page!, it.params))}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left font-bold text-[15px] active:scale-[0.98] transition ${active ? 'bg-ocean-50 text-ocean-700' : 'text-slate-700 hover:bg-slate-50'}`}
        aria-current={active ? 'page' : undefined}
      >
        <span className={active ? 'text-ocean-600' : 'text-slate-400'}>{it.icon}</span>
        <span className="flex-1">{it.label}</span>
        <ChevronRight size={16} className="text-slate-300" />
      </button>
    );
  };

  return (
    <div className="md:hidden">
      {/* aba na borda esquerda: sempre visível, mostra que existe uma gaveta */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          aria-label="Abrir menu"
          data-testid="drawer-handle"
          className="fixed left-0 top-1/2 -translate-y-1/2 z-40 w-5 h-16 rounded-r-xl bg-ocean-700/80 text-white flex items-center justify-center shadow-lg active:scale-95"
        >
          <Menu size={12} />
        </button>
      )}

      <div
        className={`fixed inset-0 z-[70] bg-black/50 transition-opacity duration-300 ${open ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        onClick={() => setOpen(false)}
        aria-hidden="true"
      />
      <aside
        role="dialog" aria-modal="true" aria-label="Menu" data-testid="app-drawer"
        className={`fixed top-0 left-0 bottom-0 z-[71] w-[84%] max-w-sm bg-white shadow-2xl flex flex-col transition-transform duration-300 ease-out ${open ? 'translate-x-0' : '-translate-x-full'}`}
        style={{ paddingTop: 'env(safe-area-inset-top)', paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="bg-gradient-to-br from-ocean-600 to-ocean-950 text-white px-5 pt-6 pb-5 relative">
          <button onClick={() => setOpen(false)} aria-label="Fechar menu" className="absolute right-3 top-3 w-9 h-9 rounded-full bg-white/15 flex items-center justify-center"><X size={18} /></button>
          <img src="/icons/icon-192.png" alt="" className="w-12 h-12 rounded-2xl mb-3 shadow-lg" />
          {currentUser ? (
            <button onClick={() => go('user-dashboard')} className="flex items-center gap-3 text-left">
              {currentUser.avatarUrl
                ? <img src={currentUser.avatarUrl} alt="" className="w-10 h-10 rounded-full object-cover border-2 border-white/40" />
                : <span className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center"><UserIcon size={18} /></span>}
              <span>
                <span className="block font-black leading-tight">{currentUser.name || 'Minha conta'}</span>
                <span className="block text-xs text-white/70">Ver meu painel</span>
              </span>
            </button>
          ) : (
            <>
              <p className="font-black text-lg leading-tight">Lagos GO</p>
              <p className="text-xs text-white/70 mb-3">O guia da Região dos Lagos</p>
              <button onClick={() => go('login')} className="inline-flex items-center gap-2 bg-white text-ocean-700 font-black text-sm px-4 py-2 rounded-full active:scale-95">
                <LogIn size={16} /> Entrar ou criar conta
              </button>
            </>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-0.5" aria-label="Menu do app">
          <p className="px-4 pt-1 pb-1 text-[11px] font-black uppercase tracking-widest text-slate-400">Explorar</p>
          {explore.map(row)}
          <p className="px-4 pt-4 pb-1 text-[11px] font-black uppercase tracking-widest text-slate-400">Mais</p>
          {more.map(row)}
          {currentUser && (
            <button onClick={() => { setOpen(false); onLogout(); }} className="w-full mt-2 px-4 py-3 rounded-xl text-left font-bold text-[15px] text-red-600 hover:bg-red-50">Sair da conta</button>
          )}
        </nav>
        <p className="text-center text-[11px] text-slate-400 py-3">© {new Date().getFullYear()} Lagos GO</p>
      </aside>
    </div>
  );
};
