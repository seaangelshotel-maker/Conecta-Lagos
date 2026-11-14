import React, { useEffect, useState } from 'react';
import { Share, PlusSquare, Smartphone, Compass, Download, MoreVertical, Check } from 'lucide-react';
import { SEO } from '../components/SEO';

type Os = 'ios' | 'android';

const STEPS: Record<Os, { icon: React.ReactNode; title: string; text: string }[]> = {
  ios: [
    { icon: <Compass size={20} />, title: 'Abra no Safari', text: 'No iPhone, só o Safari instala. Se você veio pelo WhatsApp ou Instagram, toque em "Abrir no Safari".' },
    { icon: <Share size={20} />, title: 'Toque em Compartilhar', text: 'É o quadrado com uma seta para cima, na barra do Safari.' },
    { icon: <PlusSquare size={20} />, title: 'Adicionar à Tela de Início', text: 'Role a lista até achar essa opção e toque nela.' },
    { icon: <Smartphone size={20} />, title: 'Toque em Adicionar', text: 'Pronto: o ícone da Lagos GO aparece na sua tela, como um app.' },
  ],
  android: [
    { icon: <Compass size={20} />, title: 'Abra no Chrome', text: 'Se você veio pelo WhatsApp ou Instagram, toque nos três pontinhos e em "Abrir no Chrome".' },
    { icon: <MoreVertical size={20} />, title: 'Toque nos três pontinhos', text: 'Ficam no canto de cima, à direita do Chrome.' },
    { icon: <Download size={20} />, title: 'Instalar app', text: 'Toque em "Instalar app" ou "Adicionar à tela inicial" e confirme.' },
    { icon: <Smartphone size={20} />, title: 'Pronto', text: 'O ícone da Lagos GO aparece na sua tela, como um app.' },
  ],
};

/** Página de instalação: serve para link no WhatsApp, e-mail e QR dos adesivos. */
export const InstallPage: React.FC<{ onNavigate: (page: string, params?: any) => void }> = ({ onNavigate }) => {
  const [os, setOs] = useState<Os>('android');
  const [deferred, setDeferred] = useState<any>(null);
  const [installed, setInstalled] = useState(false);

  useEffect(() => {
    if (/iPhone|iPad|iPod/.test(navigator.userAgent)) setOs('ios');
    setInstalled(!!(window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone));
    const h = (e: Event) => { e.preventDefault(); setDeferred(e); };
    window.addEventListener('beforeinstallprompt', h);
    return () => window.removeEventListener('beforeinstallprompt', h);
  }, []);

  const install = async () => { if (!deferred) return; deferred.prompt(); try { await deferred.userChoice; } finally { setDeferred(null); } };

  return (
    <main className="min-h-screen bg-slate-50 px-4 pt-8 pb-28 md:pt-24">
      <SEO title="Instalar o app Lagos GO" description="Coloque o Lagos GO na tela do seu celular em poucos segundos." noindex />
      <div className="max-w-md mx-auto bg-white rounded-3xl border border-slate-100 shadow-sm p-6">
        <img src="/icons/icon-192.png" alt="Lagos GO" className="w-16 h-16 rounded-2xl mx-auto" />
        <h1 className="text-2xl font-black text-ocean-950 text-center mt-4">Instale o Lagos GO</h1>
        <p className="text-sm text-slate-500 text-center mt-1">Guia, cupons e eventos da Região dos Lagos na tela do seu celular. Sem loja, leva 10 segundos.</p>

        {installed && (
          <div className="mt-5 rounded-2xl bg-emerald-50 text-emerald-700 text-sm font-bold p-3 flex items-center gap-2"><Check size={16} /> O app já está instalado neste aparelho.</div>
        )}

        <div className="mt-6 flex bg-slate-100 p-1 rounded-2xl" role="tablist" aria-label="Tipo de celular">
          {([['ios', 'iPhone'], ['android', 'Android']] as [Os, string][]).map(([id, label]) => (
            <button key={id} role="tab" aria-selected={os === id} onClick={() => setOs(id)} data-testid={`install-${id}`}
              className={`flex-1 py-2.5 rounded-xl text-xs font-black transition-all ${os === id ? 'bg-white text-ocean-600 shadow-sm' : 'text-slate-400'}`}>{label}</button>
          ))}
        </div>

        {os === 'android' && deferred && (
          <button onClick={install} className="mt-5 w-full bg-ocean-600 text-white font-black text-sm py-3.5 rounded-2xl flex items-center justify-center gap-2 active:scale-95"><Download size={16} /> Instalar agora</button>
        )}

        <ol className="mt-6 space-y-4">
          {STEPS[os].map((st, i) => (
            <li key={i} className="flex items-center gap-3">
              <span className="w-11 h-11 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center shrink-0">{st.icon}</span>
              <span><span className="block text-sm font-black text-ocean-950">{i + 1}. {st.title}</span><span className="block text-xs text-slate-500 leading-snug">{st.text}</span></span>
            </li>
          ))}
        </ol>

        <button onClick={() => onNavigate('home')} className="mt-7 w-full bg-slate-100 text-slate-700 font-black text-sm py-3.5 rounded-2xl active:scale-95">Ir para o início</button>
      </div>
    </main>
  );
};
