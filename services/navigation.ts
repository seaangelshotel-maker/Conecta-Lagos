/**
 * Origem da navegação dentro do app (para o registro de conexões).
 * O App grava a página anterior a cada troca de tela; as páginas de destino
 * leem esse valor para saber se a visita veio da busca, do guia, da home etc.
 */
const KEY = 'lagos_go_nav_from';

const PAGE_TO_SOURCE: Record<string, string> = {
    home: 'home', guide: 'guide', search: 'search', map: 'map',
    collections: 'collection', 'collection-detail': 'collection', blog: 'blog', 'blog-detail': 'blog',
    opportunities: 'opportunities', 'user-dashboard': 'profile',
};

export const setNavigationOrigin = (fromPage: string) => {
    try { sessionStorage.setItem(KEY, fromPage); } catch { /* sem armazenamento */ }
};

export const getNavigationSource = (): string => {
    try {
        const from = sessionStorage.getItem(KEY);
        if (from && PAGE_TO_SOURCE[from]) return PAGE_TO_SOURCE[from];
        if (document.referrer && !document.referrer.startsWith(window.location.origin)) return 'external';
    } catch { /* sem armazenamento */ }
    return 'direct';
};
