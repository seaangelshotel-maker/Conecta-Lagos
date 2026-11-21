import React, { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { Compass, X } from 'lucide-react';
import { getConsent, CONSENT_EVENT } from '../services/consent';

/**
 * Tutorial do primeiro acesso: boas-vindas + balões apontando para cada ferramenta do app.
 * Aparece uma única vez (depois do aviso de privacidade) e pode ser pulado a qualquer momento.
 * Dá para rever em "Como funciona", na gaveta do menu (evento TOUR_EVENT).
 */
export const TOUR_KEY = 'lagos_go_tour_v1';
export const TOUR_EVENT = 'lagosgo:tour';
export const TOUR_DONE_EVENT = 'lagosgo:tour-done';
/** Outros avisos (ex.: convite para ligar notificações) esperam o tutorial acabar para não cobrir a barra de baixo. */
export const tourSeen = () => { try { return localStorage.getItem(TOUR_KEY) === '1'; } catch { return true; } };
export const tourActive = () => !!(window as any).__lagosTourActive;
export const startAppTour = () => window.dispatchEvent(new Event(TOUR_EVENT));

export interface TourStep {
  /** Valor do atributo data-tour do elemento apontado. Sem alvo = cartão no centro da tela. */
  target?: string;
  title: string;
  text: string;
}

export const TOUR_STEPS: TourStep[] = [
  { title: 'Bem-vindo ao Lagos GO', text: 'O guia da Região dos Lagos: o que fazer, onde comer, onde ficar e quem chamar. Vamos te mostrar rapidinho como tudo funciona.' },
  { target: 'home', title: 'Início', text: 'O que está em alta agora: lugares, eventos e novidades da região.' },
  { target: 'guide', title: 'Guia', text: 'O coração do app: praias, passeios, restaurantes, hospedagem e serviços, com mapa e como chegar.' },
  { target: 'coupons', title: 'Cupons', text: 'Descontos e benefícios de empresas parceiras. Pegue o cupom e use direto no local.' },
  { target: 'feed', title: 'Feed e dicas', text: 'Notícias, dicas de quem conhece e a agenda de eventos da região.' },
  { target: 'tours', title: 'Passeios', text: 'Escolha o passeio, veja no calendário as datas com vaga e peça sua reserva. A operadora confirma pelo WhatsApp.' },
  { target: 'profile', title: 'Sua conta', text: 'Seus cupons, suas avaliações e, se você tem um negócio, o painel da sua empresa.' },
  { title: 'Pronto, pode explorar!', text: 'Qualquer dúvida, o "Como funciona" fica no menu. Boa viagem pela Região dos Lagos!' },
];

const isVisible = (el: Element) => {
  const r = el.getBoundingClientRect();
  return r.width > 0 && r.height > 0;
};

/** Há dois menus no DOM (celular e computador); vale o que estiver visível. */
export const findTourTarget = (key: string): HTMLElement | null => {
  const all = Array.from(document.querySelectorAll<HTMLElement>(`[data-tour="${key}"]`));
  return all.find(isVisible) || null;
};

const seen = () => { try { return localStorage.getItem(TOUR_KEY) === '1'; } catch { return false; } };
const markSeen = () => { try { localStorage.setItem(TOUR_KEY, '1'); } catch { /* sem armazenamento */ } };

interface Props { page: string }

export const AppTour: React.FC<Props> = ({ page }) => {
  const [active, setActive] = useState(false);
  const [steps, setSteps] = useState<TourStep[]>(TOUR_STEPS);
  const [i, setI] = useState(0);
  const [rect, setRect] = useState<DOMRect | null>(null);

  const begin = useCallback(() => {
    // Só entram os passos cujo alvo existe nesta tela (ex.: sem menu inferior, o passo some).
    const usable = TOUR_STEPS.filter(s => !s.target || !!findTourTarget(s.target));
    setSteps(usable);
    setI(0);
    setActive(true);
  }, []);

  // Primeiro acesso: só na Home e depois que a pessoa respondeu ao aviso de privacidade.
  useEffect(() => {
    if (seen() || page !== 'home') return;
    let timer: ReturnType<typeof setTimeout> | undefined;
    let cancelled = false;
    const tryStart = () => {
      if (cancelled || seen()) return;
      if (getConsent() === null) return; // espera responder ao aviso de privacidade
      timer = setTimeout(() => { if (!cancelled && !seen()) begin(); }, 900);
    };
    tryStart();
    window.addEventListener(CONSENT_EVENT, tryStart);
    return () => { cancelled = true; if (timer) clearTimeout(timer); window.removeEventListener(CONSENT_EVENT, tryStart); };
  }, [page, begin]);

  // Reabrir pelo menu "Como funciona".
  useEffect(() => {
    const on = () => setTimeout(begin, 350);
    window.addEventListener(TOUR_EVENT, on);
    return () => window.removeEventListener(TOUR_EVENT, on);
  }, [begin]);

  const step = steps[i];

  const measure = useCallback(() => {
    if (!step?.target) { setRect(null); return; }
    const el = findTourTarget(step.target);
    setRect(el ? el.getBoundingClientRect() : null);
  }, [step]);

  useLayoutEffect(() => {
    if (!active) return;
    measure();
    window.addEventListener('resize', measure);
    window.addEventListener('scroll', measure, true);
    return () => { window.removeEventListener('resize', measure); window.removeEventListener('scroll', measure, true); };
  }, [active, measure]);

  const finish = useCallback(() => {
    markSeen(); setActive(false); setI(0);
    (window as any).__lagosTourActive = false;
    window.dispatchEvent(new Event(TOUR_DONE_EVENT));
  }, []);

  useEffect(() => { (window as any).__lagosTourActive = active; }, [active]);

  useEffect(() => {
    if (!active) return;
    const key = (e: KeyboardEvent) => {
      if (e.key === 'Escape') finish();
      if (e.key === 'ArrowRight' || e.key === 'Enter') setI(n => (n < steps.length - 1 ? n + 1 : n));
      if (e.key === 'ArrowLeft') setI(n => Math.max(0, n - 1));
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [active, steps.length, finish]);

  if (!active || !step) return null;

  const last = i === steps.length - 1;
  const next = () => (last ? finish() : setI(n => n + 1));
  const PAD = 6;
  const vw = typeof window !== 'undefined' ? window.innerWidth : 360;
  const vh = typeof window !== 'undefined' ? window.innerHeight : 640;
  const CARD_W = Math.min(320, vw - 24);

  // Posição do balão: acima do alvo se ele estiver na metade de baixo da tela, senão abaixo.
  let cardStyle: React.CSSProperties;
  if (rect) {
    const cx = rect.left + rect.width / 2;
    const left = Math.min(Math.max(12, cx - CARD_W / 2), vw - CARD_W - 12);
    const below = rect.top < vh / 2;
    cardStyle = below
      ? { left, width: CARD_W, top: rect.bottom + PAD + 14 }
      : { left, width: CARD_W, bottom: vh - rect.top + PAD + 14 };
  } else {
    cardStyle = { left: (vw - CARD_W) / 2, width: CARD_W, top: '50%', transform: 'translateY(-50%)' };
  }

  return (
    <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="Tutorial do Lagos GO" data-testid="app-tour">
      {/* Fundo: escurece tudo e deixa um "buraco" em volta do item apontado */}
      {rect ? (
        <div
          className="absolute rounded-2xl pointer-events-none transition-all duration-300"
          style={{
            left: rect.left - PAD, top: rect.top - PAD, width: rect.width + PAD * 2, height: rect.height + PAD * 2,
            boxShadow: '0 0 0 9999px rgba(8, 28, 48, 0.72)', outline: '2px solid rgba(255,255,255,0.9)',
          }}
        />
      ) : (
        <div className="absolute inset-0 bg-ocean-950/75" />
      )}
      {/* Bloqueia toques no app por baixo durante o tutorial */}
      <div className="absolute inset-0" onClick={e => e.stopPropagation()} />

      <div className="absolute bg-white rounded-3xl shadow-2xl p-5 animate-in fade-in zoom-in-95 duration-200" style={cardStyle} data-testid="app-tour-card">
        <button onClick={finish} className="absolute top-3 right-3 p-1.5 text-slate-300 hover:text-slate-500" aria-label="Fechar tutorial"><X size={16} /></button>
        {!rect && <span className="w-11 h-11 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center mb-3"><Compass size={22} /></span>}
        <h3 className="font-black text-ocean-950 text-lg leading-tight pr-6">{step.title}</h3>
        <p className="text-sm text-slate-600 mt-1.5 leading-snug">{step.text}</p>
        <div className="flex items-center justify-between mt-4">
          <div className="flex gap-1" aria-hidden="true">
            {steps.map((_, n) => <span key={n} className={`h-1.5 rounded-full transition-all ${n === i ? 'w-5 bg-ocean-600' : 'w-1.5 bg-slate-200'}`} />)}
          </div>
          <div className="flex items-center gap-2">
            {!last && <button onClick={finish} data-testid="app-tour-skip" className="text-xs font-bold text-slate-400 px-2 py-2">Pular</button>}
            <button onClick={next} data-testid="app-tour-next" className="h-10 px-5 rounded-xl bg-ocean-600 text-white text-sm font-black active:scale-95">
              {last ? 'Começar' : i === 0 ? 'Vamos lá' : 'Próximo'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
