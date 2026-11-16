/**
 * Traduções guardadas junto do conteúdo (empresa, cupom, matéria).
 * Ao SALVAR, o texto é traduzido uma única vez (en/es/fr) e gravado no documento em `i18n`.
 * Quem lê só usa o que já está pronto: nenhuma chamada de tradução por visitante.
 */
import type { BusinessProfile, Coupon, BlogPost } from '../types';
import { learnTranslations } from './domTranslator';

export interface ContentI18n { src: string[]; en: string[]; es: string[]; fr: string[]; }
const LANGS = ['en', 'es', 'fr'] as const;
const MAX_LEN = 1500;
const MAX_TEXTS = 120;
const BATCH = 40;

const clean = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');
/** Só vale traduzir texto com letras (nada de preço, telefone, código). */
const worth = (s: string) => s.length >= 3 && s.length <= MAX_LEN && /[A-Za-zÀ-ÿ]{3,}/.test(s) && !/^https?:\/\//i.test(s);
const uniq = (list: string[]) => Array.from(new Set(list.map(clean).filter(worth))).slice(0, MAX_TEXTS);

export const businessTexts = (b: Partial<BusinessProfile>): string[] => uniq([
    b.description || '',
    b.subcategory || '',
    ...(b.menu || []).flatMap(s => [s.title, ...(s.items || []).flatMap(i => [i.name, i.description || ''])]),
]);

export const couponTexts = (c: Partial<Coupon>): string[] => uniq([c.title || '', c.description || '', ...(c.rules || [])]);

export const postTexts = (p: Partial<BlogPost>): string[] => {
    const paras = typeof p.content === 'string' && !/<[a-z][\s\S]*>/i.test(p.content)
        ? p.content.split(/\n{2,}/).map(x => x.replace(/^#+\s*/, '').trim()) : [];
    return uniq([p.title || '', p.subtitle || '', p.excerpt || '', ...paras]);
};

const withTimeout = <T,>(p: Promise<T>, ms: number): Promise<T> =>
    new Promise((res, rej) => { const t = setTimeout(() => rej(new Error('timeout')), ms); p.then(v => { clearTimeout(t); res(v); }, e => { clearTimeout(t); rej(e); }); });

const fetchLang = async (target: string, texts: string[]): Promise<string[] | null> => {
    const out: string[] = [];
    for (let i = 0; i < texts.length; i += BATCH) {
        const part = texts.slice(i, i + BATCH);
        let res: string[] | null = null;
        for (let a = 0; a < 2 && !res; a++) {
            try {
                const r = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target, texts: part }) });
                if (r.ok) { const d = await r.json(); if (Array.isArray(d.translations) && d.translations.length === part.length) res = d.translations; }
            } catch { /* tenta de novo */ }
            if (!res) await new Promise(r => setTimeout(r, 700));
        }
        if (!res) return null;
        out.push(...res);
    }
    return out;
};

/** Pares prontos (texto → tradução) que ainda valem para os textos atuais. */
const reusable = (prev: ContentI18n | undefined) => {
    const m: Record<string, Record<string, string>> = { en: {}, es: {}, fr: {} };
    if (prev?.src) prev.src.forEach((s, i) => LANGS.forEach(l => { const t = prev[l]?.[i]; if (t && t !== s) m[l][s] = t; }));
    return m;
};

/**
 * Monta o `i18n` do documento. Reaproveita o que já estava traduzido e traduz só o texto novo.
 * Nunca lança erro: se a tradução falhar, devolve o que tiver pronto (o salvamento não pode travar).
 */
export const buildI18n = async (texts: string[], prev?: ContentI18n, maxMs = 20000): Promise<ContentI18n | undefined> => {
    if (!texts.length) return undefined;
    const have = reusable(prev);
    const missing = texts.filter(t => LANGS.some(l => !have[l][t]));
    if (missing.length) {
        try {
            await withTimeout(Promise.all(LANGS.map(async l => {
                const need = texts.filter(t => !have[l][t]);
                const tr = need.length ? await fetchLang(l, need) : [];
                if (tr) need.forEach((t, i) => { if (tr[i] && tr[i].trim() !== t.trim()) have[l][t] = tr[i]; });
            })), maxMs);
        } catch { /* usa o que deu */ }
    }
    const src = texts.filter(t => LANGS.every(l => have[l][t]));
    if (!src.length) return undefined;
    return { src, en: src.map(t => have.en[t]), es: src.map(t => have.es[t]), fr: src.map(t => have.fr[t]) };
};

/** Tem texto sem tradução pronta? */
export const needsI18n = (texts: string[], cur?: ContentI18n) => {
    const s = new Set(cur?.src || []);
    return texts.some(t => !s.has(t));
};

/** Ensina o tradutor da tela com o que veio do banco (sem nenhuma chamada). */
export const learnI18n = (entity: { i18n?: ContentI18n } | null | undefined) => {
    const x = entity?.i18n;
    if (!x || !Array.isArray(x.src)) return;
    LANGS.forEach(l => { if (Array.isArray(x[l])) learnTranslations(l, x.src, x[l]); });
};
export const learnAll = (list: Array<{ i18n?: ContentI18n }>) => { for (const e of list) learnI18n(e); };
