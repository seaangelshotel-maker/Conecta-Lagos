import React, { useEffect, useState } from 'react';
import { Download, Share, X, PlusSquare, Smartphone, Compass } from 'lucide-react';

const KEY = 'lagos_go_install_dismissed_v1';

/**
 * Convite para instalar a Lagos GO na tela inicial.
 * - Android/Chrome: usa o evento beforeinstallprompt.
 * - iPhone/Safari: mostra a instrução "Compartilhar > Adicionar à Tela de Início".
 * - Não aparece se já estiver instalado ou se a pessoa fechou o aviso.
 */
export const InstallAppPrompt: React.FC = () => {
    const [deferred, setDeferred] = useState<any>(null);
    const [showIos, setShowIos] = useState(false);
    const [iosOtherBrowser, setIosOtherBrowser] = useState(false);
    const [guide, setGuide] = useState(false);
    const [dismissed, setDismissed] = useState(() => {
        try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
    });

    useEffect(() => {
        const standalone = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone;
        if (standalone || dismissed) return;
        const handler = (e: Event) => { e.preventDefault(); setDeferred(e); };
        window.addEventListener('beforeinstallprompt', handler);
        const ua = navigator.userAgent;
        const isIos = /iPhone|iPad|iPod/.test(ua);
        if (isIos) { setShowIos(true); setIosOtherBrowser(/CriOS|FxiOS|EdgiOS|OPiOS/.test(ua)); }
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, [dismissed]);

    if (dismissed || (!deferred && !showIos)) return null;

    const close = () => {
        try { localStorage.setItem(KEY, '1'); } catch { /* sem armazenamento */ }
        setDismissed(true);
    };

    const install = async () => {
        if (!deferred) return;
        deferred.prompt();
        try { await deferred.userChoice; } finally { setDeferred(null); close(); }
    };

    return (
      <>
        <div className="bg-ocean-950 text-white rounded-3xl p-4 flex items-center gap-3 shadow-xl md:hidden" role="region" aria-label="Instalar aplicativo">
            <img src="/icons/icon-192.png" alt="" className="w-11 h-11 rounded-xl shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="font-black text-sm">Instale a Lagos GO</p>
                {deferred ? (
                    <p className="text-[11px] text-ocean-200">Acesso rápido pela tela inicial, como um app.</p>
                ) : (
                    <p className="text-[11px] text-ocean-200">Fica na tela do iPhone como um app, com ícone.</p>
                )}
            </div>
            {!deferred && showIos && (
                <button onClick={() => setGuide(true)} className="bg-gold-500 text-ocean-950 font-black text-xs px-4 py-2.5 rounded-xl active:scale-95">Como instalar</button>
            )}
            {deferred && (
                <button onClick={install} className="bg-gold-500 text-ocean-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1 active:scale-95"><Download size={14} /> Instalar</button>
            )}
            <button onClick={close} className="p-1.5 text-ocean-300" aria-label="Fechar"><X size={18} /></button>
        </div>
        {guide && (
            <div className="fixed inset-0 z-[120] bg-black/60 flex items-end md:items-center justify-center" role="dialog" aria-modal="true" aria-label="Como instalar no iPhone" onClick={() => setGuide(false)}>
                <div className="bg-white w-full max-w-md rounded-t-3xl md:rounded-3xl p-6 pb-8" onClick={e => e.stopPropagation()}>
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <h3 className="text-lg font-black text-ocean-950">Instalar a Lagos GO no iPhone</h3>
                            <p className="text-xs text-slate-500 mt-0.5">Leva 10 segundos e não precisa de loja.</p>
                        </div>
                        <button onClick={() => setGuide(false)} className="p-1.5 text-slate-400" aria-label="Fechar"><X size={20} /></button>
                    </div>
                    {iosOtherBrowser && (
                        <div className="mt-4 rounded-2xl bg-amber-50 text-amber-800 text-xs font-bold p-3 flex gap-2">
                            <Compass size={16} className="shrink-0 mt-0.5" /> Você está em outro navegador. No iPhone só o Safari instala: abra lagosgo.com.br no Safari e siga os passos.
                        </div>
                    )}
                    <ol className="mt-5 space-y-4">
                        {[
                            { icon: <Share size={20} />, title: 'Toque em Compartilhar', text: 'É o quadrado com uma seta para cima, na barra do Safari.' },
                            { icon: <PlusSquare size={20} />, title: 'Adicionar à Tela de Início', text: 'Role a lista para baixo até achar essa opção e toque nela.' },
                            { icon: <Smartphone size={20} />, title: 'Toque em Adicionar', text: 'Pronto: o ícone da Lagos GO aparece na sua tela, como um app.' },
                        ].map((st, i) => (
                            <li key={i} className="flex items-center gap-3">
                                <span className="w-11 h-11 rounded-2xl bg-ocean-50 text-ocean-600 flex items-center justify-center shrink-0">{st.icon}</span>
                                <span><span className="block text-sm font-black text-ocean-950">{i + 1}. {st.title}</span><span className="block text-xs text-slate-500 leading-snug">{st.text}</span></span>
                            </li>
                        ))}
                    </ol>
                    <button onClick={() => { setGuide(false); close(); }} className="mt-6 w-full bg-ocean-600 text-white font-black text-sm py-3.5 rounded-2xl active:scale-95">Entendi</button>
                </div>
            </div>
        )}
      </>
    );
};
