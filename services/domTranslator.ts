/**
 * Tradutor de página inteira: percorre os textos visíveis (inclusive conteúdo vindo do banco de dados),
 * traduz em lotes via /api/translate e mantém tudo traduzido enquanto a tela muda.
 * Voltar para 🇧🇷 restaura os textos originais.
 */
import { translateText } from './translations';
import { flagToLang, shouldTranslate, chunk } from './langDetect';

const SKIP = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'TEXTAREA', 'INPUT', 'CODE', 'PRE', 'SVG', 'IFRAME', 'SELECT', 'OPTION']);
const ATTRS = ['placeholder', 'title', 'aria-label', 'alt'];

const original = new WeakMap<Node, string>();       // nó/atributo → texto original (pt)
const applied = new WeakMap<Node, string>();        // último texto aplicado por nós
const attrOriginal = new WeakMap<Element, Record<string, string>>();
const attrApplied = new WeakMap<Element, Record<string, string>>();
const touchedText = new Set<Text>();
const touchedEls = new Set<Element>();
const memo = new Map<string, string>();             // `${lang}|${texto}`
let lang = 'pt';
let observer: MutationObserver | null = null;
let timer: number | undefined;
const pending = new Set<Node>();

const blocked = (el: Element | null): boolean => {
    for (let e = el; e; e = e.parentElement) {
        if (SKIP.has(e.tagName.toUpperCase()) || e.getAttribute('translate') === 'no' || e.classList.contains('notranslate') || (e as HTMLElement).isContentEditable) return true;
    }
    return false;
};

const loadStore = (): Record<string, string> => { try { return JSON.parse(localStorage.getItem('lagos_tr_' + lang) || '{}'); } catch { return {}; } };
let store: Record<string, string> = {};
const saveStore = () => { try { const s = JSON.stringify(store); if (s.length < 1_500_000) localStorage.setItem('lagos_tr_' + lang, s); } catch { /* cheio */ } };

const lookup = (src: string): string | undefined => {
    const key = src.trim();
    const fromDict = translateText(key, lang === 'pt-PT' ? '🇵🇹' : lang === 'es' ? '🇪🇸' : lang === 'fr' ? '🇫🇷' : '🇺🇸');
    if (fromDict !== key) return fromDict;
    return memo.get(lang + '|' + key) ?? store[key];
};

const fetchBatch = async (target: string, texts: string[]): Promise<string[] | null> => {
    try {
        const r = await fetch('/api/translate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ target, texts }) });
        if (!r.ok) return null;
        const d = await r.json();
        return Array.isArray(d.translations) ? d.translations : null;
    } catch { return null; }
};

const setText = (t: Text, src: string, tr: string) => {
    const lead = src.match(/^\s*/)![0], trail = src.match(/\s*$/)![0];
    const val = lead + tr + trail;
    applied.set(t, val);
    if (t.nodeValue !== val) t.nodeValue = val;
};

const collect = (root: Node, texts: Text[], attrs: Element[]) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT, {
        acceptNode: n => (n.nodeType === 1 && (SKIP.has((n as Element).tagName.toUpperCase()) || (n as Element).getAttribute('translate') === 'no' || (n as Element).classList.contains('notranslate')))
            ? NodeFilter.FILTER_REJECT : NodeFilter.FILTER_ACCEPT,
    });
    if (root.nodeType === 1) attrs.push(root as Element);
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
        if (n.nodeType === 3) texts.push(n as Text); else attrs.push(n as Element);
    }
};

const run = async (root: Node) => {
    if (lang === 'pt') return;
    const myLang = lang;
    const texts: Text[] = []; const els: Element[] = [];
    if (root.nodeType === 3) texts.push(root as Text); else collect(root, texts, els);
    type Job = { apply: (tr: string) => void; src: string };
    const jobs: Job[] = [];
    for (const t of texts) {
        if (!t.parentElement || blocked(t.parentElement)) continue;
        const cur = t.nodeValue || '';
        if (applied.get(t) === cur) continue;           // já é a nossa tradução
        if (!shouldTranslate(cur)) continue;
        original.set(t, cur); touchedText.add(t);
        jobs.push({ src: cur, apply: tr => { if (t.isConnected && original.get(t) === cur) setText(t, cur, tr); } });
    }
    for (const el of els) {
        if (blocked(el)) continue;
        for (const a of ATTRS) {
            const v = el.getAttribute(a);
            if (!v) continue;
            if (attrApplied.get(el)?.[a] === v) continue;
            if (!shouldTranslate(v)) continue;
            const o = attrOriginal.get(el) || {}; o[a] = v; attrOriginal.set(el, o); touchedEls.add(el);
            jobs.push({ src: v, apply: tr => { const ap = attrApplied.get(el) || {}; ap[a] = tr; attrApplied.set(el, ap); el.setAttribute(a, tr); } });
        }
    }
    const need: string[] = [];
    for (const j of jobs) {
        const key = j.src.trim();
        const hit = lookup(key);
        if (hit !== undefined) j.apply(hit); else if (!need.includes(key)) need.push(key);
    }
    for (const part of chunk(need, 40)) {
        const res = await fetchBatch(myLang, part);
        if (myLang !== lang) return;
        if (!res) continue;
        part.forEach((s, i) => { if (res[i]) { memo.set(myLang + '|' + s, res[i]); store[s] = res[i]; } });
        saveStore();
        for (const j of jobs) { const h = memo.get(myLang + '|' + j.src.trim()); if (h) j.apply(h); }
    }
};

const flush = () => {
    const nodes = [...pending]; pending.clear();
    for (const n of nodes) if (n.isConnected) void run(n);
};
const schedule = (n: Node) => { pending.add(n); window.clearTimeout(timer); timer = window.setTimeout(flush, 120); };

const restore = () => {
    for (const t of touchedText) { const o = original.get(t); if (o !== undefined && t.isConnected) t.nodeValue = o; applied.delete(t); }
    for (const el of touchedEls) { const o = attrOriginal.get(el); if (o) for (const a in o) el.setAttribute(a, o[a]); attrApplied.delete(el); }
    touchedText.clear(); touchedEls.clear();
};

export const setPageLanguage = (flag: string) => {
    const next = flagToLang[flag] || 'pt';
    document.documentElement.lang = next === 'pt' ? 'pt-BR' : next;
    if (next === lang) return;
    observer?.disconnect(); observer = null;
    restore();
    lang = next;
    if (lang === 'pt') return;
    store = loadStore();
    void run(document.body);
    observer = new MutationObserver(muts => {
        for (const m of muts) {
            if (m.type === 'characterData') schedule(m.target);
            else if (m.type === 'attributes') schedule(m.target);
            else m.addedNodes.forEach(n => schedule(n));
        }
    });
    observer.observe(document.body, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ATTRS });
};
