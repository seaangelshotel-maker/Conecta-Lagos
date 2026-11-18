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
export const APP_HOSTS = ['lagosgo.com.br', 'www.lagosgo.com.br', 'conecta-lagos-one.vercel.app'];
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

/** Links externos genéricos: no app abre numa aba do Chrome sobre o app (volta com o botão voltar); na web, nova aba sem opener. */
export const openExternal = async (url: string) => {
  const b = plugin('Browser');
  if (b?.open) { await b.open({ url }); return; }
  window.open(url, '_blank', 'noopener,noreferrer');
};

export type LinkKind = 'internal' | 'system' | 'external' | 'blocked';

/** Hosts que têm app próprio no celular: abrem direto no app dele (WhatsApp, Maps, Play, Instagram), não numa aba de navegador. */
const SYSTEM_HOSTS = ['wa.me', 'api.whatsapp.com', 'web.whatsapp.com', 'wa.link', 'maps.app.goo.gl', 'play.google.com', 'market.android.com', 'instagram.com', 'www.instagram.com'];
const isMapsUrl = (u: URL) => /(^|\.)google\.[a-z.]+$/.test(u.host) && u.pathname.startsWith('/maps');

/**
 * Decide para onde vai cada link:
 * - internal: é do Lagos GO → navega dentro do app (nunca abre navegador);
 * - system: telefone, e-mail, WhatsApp, Maps, Instagram, Play → entrega ao app do celular que cuida disso;
 * - external: qualquer outro site → aba do Chrome sobre o app (ou nova aba na web);
 * - blocked: esquema perigoso (javascript:, data:, intent:...).
 */
export const classifyLink = (raw: string, currentHost = ''): LinkKind => {
  const url = (raw || '').trim();
  if (!url) return 'blocked';
  if (toAppPath(url, currentHost)) return 'internal';
  if (/^(tel|mailto|sms):/i.test(url)) return 'system';
  try {
    const u = new URL(url);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return 'blocked';
    if (SYSTEM_HOSTS.includes(u.host) || isMapsUrl(u)) return 'system';
    return 'external';
  } catch { return 'blocked'; }
};

let internalNavigator: ((path: string) => void) | null = null;
/** O App registra aqui como navegar dentro do app. */
export const setInternalNavigator = (fn: ((path: string) => void) | null) => { internalNavigator = fn; };

/** Ponto único para abrir qualquer link do app (substitui window.open espalhado). */
export const openLink = async (raw: string): Promise<void> => {
  const kind = classifyLink(raw, typeof window !== 'undefined' ? window.location.host : '');
  if (kind === 'blocked') return;
  if (kind === 'internal') {
    const path = toAppPath(raw, typeof window !== 'undefined' ? window.location.host : '');
    if (path && internalNavigator) internalNavigator(path);
    else if (path) window.location.assign(path);
    return;
  }
  if (kind === 'system') {
    // No app, o Capacitor entrega endereço fora da lista de navegação permitida ao Android (que abre o app certo).
    if (isNative() || /^(tel|mailto|sms):/i.test(raw)) window.location.href = raw.trim();
    else window.open(raw.trim(), '_blank', 'noopener,noreferrer');
    return;
  }
  await openExternal(raw.trim());
};

/**
 * O que fazer com um clique em <a href>: 'ignore' deixa o navegador agir; 'open' passa por openLink.
 * No app, todo link que sai do Lagos GO e todo link marcado target=_blank passa por openLink (nunca vira navegador solto).
 */
export const clickLinkAction = (href: string, target: string | null, currentHost: string, native: boolean): 'ignore' | 'open' => {
  if (!href || href.startsWith('#')) return 'ignore';
  const kind = classifyLink(href, currentHost);
  if (kind === 'blocked') return 'ignore';
  if (kind === 'internal') return target === '_blank' ? 'open' : 'ignore';
  return native || target === '_blank' ? 'open' : 'ignore';
};

/** Intercepta cliques em links (blog, rodapé, textos de empresas) e manda para a regra única. */
export const installLinkInterceptor = (): (() => void) => {
  if (typeof document === 'undefined') return () => {};
  const onClick = (e: MouseEvent) => {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    const a = (e.target as Element | null)?.closest?.('a[href]') as HTMLAnchorElement | null;
    if (!a || a.hasAttribute('download') || a.hasAttribute('data-native-link')) return;
    const href = a.getAttribute('href') || '';
    if (clickLinkAction(href, a.getAttribute('target'), window.location.host, isNative()) === 'open') {
      e.preventDefault();
      void openLink(a.href || href);
    }
  };
  document.addEventListener('click', onClick, true);
  return () => document.removeEventListener('click', onClick, true);
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
