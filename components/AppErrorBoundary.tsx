import React from 'react';

const RELOAD_KEY = 'lagosgo:reloaded-at';

/** Erro típico de depois de uma atualização do site: a página antiga pede um arquivo que não existe mais. */
export const isChunkLoadError = (e: unknown): boolean => {
  const msg = String((e as any)?.message || e || '');
  return /Failed to fetch dynamically imported module|error loading dynamically imported module|Importing a module script failed|Loading chunk [\w-]+ failed|ChunkLoadError|Unable to preload CSS/i.test(msg);
};

/** Recarrega uma única vez (no máximo a cada 60s) para pegar a versão nova; evita laço infinito. */
export const reloadOnce = (): boolean => {
  try {
    const last = Number(sessionStorage.getItem(RELOAD_KEY) || 0);
    if (Date.now() - last < 60_000) return false;
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()));
  } catch { /* sem sessionStorage: tenta mesmo assim */ }
  window.location.reload();
  return true;
};

/** Registra os ouvintes globais (chamar uma vez no início). */
export const installChunkErrorRecovery = () => {
  window.addEventListener('vite:preloadError', (ev) => { ev.preventDefault(); reloadOnce(); });
  window.addEventListener('unhandledrejection', (ev) => { if (isChunkLoadError(ev.reason)) reloadOnce(); });
};

interface State { error: unknown | null }

/** Evita a "tela branca": qualquer erro de tela vira uma mensagem com botão, e erro de atualização recarrega sozinho. */
export class AppErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: unknown): State { return { error }; }

  componentDidCatch(error: unknown) {
    console.error('Erro na tela:', error);
    if (isChunkLoadError(error)) reloadOnce();
  }

  render() {
    if (this.state.error === null) return this.props.children;
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-sm w-full bg-white rounded-3xl border border-slate-100 shadow-xl p-8 text-center">
          <h1 className="text-xl font-black text-ocean-950 mb-2">Ops, algo não carregou</h1>
          <p className="text-sm text-slate-500 mb-6">Pode ter sido uma atualização do site ou a conexão. Toque abaixo para tentar de novo.</p>
          <button
            onClick={() => { try { sessionStorage.removeItem(RELOAD_KEY); } catch { /* ignore */ } window.location.reload(); }}
            className="w-full bg-ocean-600 text-white font-black py-4 rounded-2xl"
          >
            Recarregar
          </button>
          <a href="/" className="block mt-4 text-xs font-bold text-slate-400">Ir para o início</a>
        </div>
      </div>
    );
  }
}
