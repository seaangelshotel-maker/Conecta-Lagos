import React, { useEffect, useState } from 'react';
import { Download, Share, X } from 'lucide-react';

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
    const [dismissed, setDismissed] = useState(() => {
        try { return localStorage.getItem(KEY) === '1'; } catch { return false; }
    });

    useEffect(() => {
        const standalone = window.matchMedia?.('(display-mode: standalone)').matches || (navigator as any).standalone;
        if (standalone || dismissed) return;
        const handler = (e: Event) => { e.preventDefault(); setDeferred(e); };
        window.addEventListener('beforeinstallprompt', handler);
        const ua = navigator.userAgent;
        const isIos = /iPhone|iPad|iPod/.test(ua) && !/CriOS|FxiOS/.test(ua);
        if (isIos) setShowIos(true);
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
        <div className="bg-ocean-950 text-white rounded-3xl p-4 flex items-center gap-3 shadow-xl md:hidden" role="region" aria-label="Instalar aplicativo">
            <img src="/icons/icon-192.png" alt="" className="w-11 h-11 rounded-xl shrink-0" />
            <div className="flex-1 min-w-0">
                <p className="font-black text-sm">Instale a Lagos GO</p>
                {deferred ? (
                    <p className="text-[11px] text-ocean-200">Acesso rápido pela tela inicial, como um app.</p>
                ) : (
                    <p className="text-[11px] text-ocean-200 flex items-center gap-1 flex-wrap">Toque em <Share size={12} /> e depois em “Adicionar à Tela de Início”.</p>
                )}
            </div>
            {deferred && (
                <button onClick={install} className="bg-gold-500 text-ocean-950 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-1 active:scale-95"><Download size={14} /> Instalar</button>
            )}
            <button onClick={close} className="p-1.5 text-ocean-300" aria-label="Fechar"><X size={18} /></button>
        </div>
    );
};
