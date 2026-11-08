/**
 * Ponte web ↔ nativo. Funciona no navegador, no PWA e dentro de um container Capacitor
 * (Android/iOS) SEM importar o Capacitor no bundle web: usa o objeto global que o container injeta.
 * No navegador comum, cada função cai para a API web equivalente.
 */
type CapacitorGlobal = { isNativePlatform?: () => boolean; getPlatform?: () => string; Plugins?: Record<string, any> };

const cap = (): CapacitorGlobal | undefined => (typeof window !== 'undefined' ? (window as any).Capacitor : undefined);
const plugin = (name: string) => cap()?.Plugins?.[name];

export const isNative = () => !!cap()?.isNativePlatform?.();
export const platform = (): 'android' | 'ios' | 'web' => {
  const p = cap()?.getPlatform?.();
  return p === 'android' || p === 'ios' ? p : 'web';
};

/** Hosts que podem abrir telas do app por link (o domínio próprio entra aqui quando existir). */
export const APP_HOSTS = ['lagosgo.org', 'www.lagosgo.org', 'conecta-lagos-one.vercel.app'];
export const APP_SCHEME = 'lagosgo:';

/** Converte um link recebido (https ou lagosgo://) no caminho interno do app; null se não for nosso. */
export const toAppPath = (raw: string, currentHost = ''): string | null => {
  try {
    const u = new URL(raw);
    if (u.protocol === APP_SCHEME) {
      const path = `/${u.host}${u.pathname}`.replace(/\/+/g, '/').replace(/\/$/, '') || '/';
      return path + u.search;
    }
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return null;
    const hosts = currentHost ? [...APP_HOSTS, currentHost] : APP_HOSTS;
    if (!hosts.includes(u.host)) return null;
    return (u.pathname || '/') + u.search;
  } catch { return null; }
};

export type ShareResult = 'shared' | 'copied' | 'cancelled' | 'failed';

export const shareContent = async (data: { title: string; text?: string; url: string }): Promise<ShareResult> => {
  try {
    const native = plugin('Share');
    if (native?.share) { await native.share({ title: data.title, text: data.text, url: data.url, dialogTitle: data.title }); return 'shared'; }
    if (typeof navigator !== 'undefined' && navigator.share) { await navigator.share(data); return 'shared'; }
    if (typeof navigator !== 'undefined' && navigator.clipboard) { await navigator.clipboard.writeText(data.url); return 'copied'; }
    return 'failed';
  } catch (e: any) {
    return e?.name === 'AbortError' ? 'cancelled' : 'failed';
  }
};

/** Links externos: navegador do sistema no app nativo; nova aba (sem opener) na web. */
export const openExternal = async (url: string) => {
  const b = plugin('Browser');
  if (b?.open) { await b.open({ url }); return; }
  window.open(url, '_blank', 'noopener,noreferrer');
};

/**
 * Liga os eventos nativos ao roteador do app. Devolve a função de limpeza.
 * - appUrlOpen: link profundo → navega para a tela correspondente.
 * - backButton: volta no histórico; na tela inicial fecha o app (comportamento padrão do Android).
 */
export const bindNativeEvents = (handlers: { goTo: (path: string) => void; canGoBack: () => boolean }): (() => void) => {
  const app = plugin('App');
  if (!isNative() || !app?.addListener) return () => {};
  const subs: Array<Promise<{ remove: () => void }> | { remove: () => void }> = [];
  subs.push(app.addListener('appUrlOpen', (e: { url: string }) => {
    const path = toAppPath(e?.url || '', window.location.host);
    if (path) handlers.goTo(path);
  }));
  subs.push(app.addListener('backButton', () => {
    if (handlers.canGoBack()) window.history.back();
    else app.exitApp?.();
  }));
  return () => { subs.forEach(s => Promise.resolve(s).then(x => x?.remove?.()).catch(() => {})); };
};

/** Teclado virtual: marca <html class="kb-open"> quando ele ocupa a tela (esconde abas fixas). */
export const watchKeyboard = (): (() => void) => {
  const vv = typeof window !== 'undefined' ? window.visualViewport : undefined;
  if (!vv) return () => {};
  const update = () => {
    const open = window.innerHeight - vv.height > 140 && /input|textarea|select/i.test(document.activeElement?.tagName || '');
    document.documentElement.classList.toggle('kb-open', open);
  };
  vv.addEventListener('resize', update);
  window.addEventListener('focusout', update);
  return () => { vv.removeEventListener('resize', update); window.removeEventListener('focusout', update); document.documentElement.classList.remove('kb-open'); };
};
