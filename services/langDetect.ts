/** Detecção de idioma (pura, testável): mapeia navigator.languages para a bandeira do app. */
export const FLAGS = ['🇧🇷', '🇵🇹', '🇪🇸', '🇺🇸', '🇫🇷'] as const;
export const flagToLang: Record<string, string> = { '🇧🇷': 'pt', '🇵🇹': 'pt-PT', '🇪🇸': 'es', '🇺🇸': 'en', '🇫🇷': 'fr' };

export const detectFlag = (langs: readonly string[] | undefined | null): string => {
    for (const raw of langs || []) {
        const l = (raw || '').toLowerCase();
        if (l === 'pt-br' || l === 'pt') return '🇧🇷';
        if (l.startsWith('pt')) return '🇵🇹';
        if (l.startsWith('es') || l.startsWith('ca') || l.startsWith('gl')) return '🇪🇸';
        if (l.startsWith('fr')) return '🇫🇷';
        if (l.startsWith('en')) return '🇺🇸';
        // idioma sem tradução dedicada (de, it, zh...) → inglês como língua franca
        if (l.length >= 2) return '🇺🇸';
    }
    return '🇧🇷';
};

/** Textos que não valem tradução: sem letras, números/preços, URLs, e-mails. */
export const shouldTranslate = (s: string): boolean => {
    const t = s.trim();
    if (t.length < 2 || t.length > 1500) return false;
    if (!/\p{L}{2,}/u.test(t)) return false;
    if (/^(https?:\/\/|www\.)\S+$/i.test(t) || /^\S+@\S+\.\S+$/.test(t)) return false;
    return true;
};

export const chunk = <T,>(arr: T[], size: number): T[][] => {
    const out: T[][] = [];
    for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
    return out;
};
