/**
 * POST /api/translate { target: 'en'|'es'|'fr'|'pt-PT', texts: string[] } → { translations: string[] }
 * Tradução com cache em memória e limite por IP. Usa o Gemini (GEMINI_API_KEY) quando existir;
 * senão cai no endpoint público do Google Translate, chamado pelo servidor (sem expor nada ao navegador).
 */
import { GoogleGenAI } from '@google/genai';
import { Req, Res, sendJson, readJsonBody, methodNotAllowed } from './http.js';

const TARGETS: Record<string, string> = { en: 'English', es: 'Spanish', fr: 'French', 'pt-PT': 'European Portuguese' };
const MAX_TEXTS = 60;
const MAX_CHARS = 12000;
const cache = new Map<string, string>();
const hits = new Map<string, { n: number; reset: number }>();

const rateLimited = (ip: string) => {
    const now = Date.now();
    const h = hits.get(ip);
    if (!h || h.reset < now) { hits.set(ip, { n: 1, reset: now + 60_000 }); return false; }
    h.n++;
    return h.n > 200;
};

const viaGoogle = async (text: string, target: string, tries = 3): Promise<string> => {
    for (let i = 0; i < tries; i++) {
        try { return await viaGoogleOnce(text, target); } catch { await new Promise(r => setTimeout(r, 250 * (i + 1))); }
    }
    return text;
};
const viaGoogleOnce = async (text: string, target: string): Promise<string> => {
    const r = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=pt&tl=${encodeURIComponent(target)}&dt=t&q=${encodeURIComponent(text)}`);
    if (!r.ok) throw new Error('google ' + r.status);
    const data: any = await r.json();
    return (data[0] || []).map((i: any) => i[0]).join('') || text;
};

const viaGemini = async (texts: string[], target: string, apiKey: string): Promise<string[]> => {
    const ai = new GoogleGenAI({ apiKey });
    const resp = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Translate each string of this JSON array from Brazilian Portuguese to ${TARGETS[target]}. Keep proper nouns (places, brands), emojis, numbers, URLs and formatting. Return ONLY a JSON array of the same length.\n${JSON.stringify(texts)}`,
        config: { responseMimeType: 'application/json', temperature: 0 } as any,
    });
    const arr = JSON.parse(resp.text || '[]');
    if (!Array.isArray(arr) || arr.length !== texts.length) throw new Error('bad gemini output');
    return arr.map((x, i) => (typeof x === 'string' && x ? x : texts[i]));
};

export const handleTranslate = async (req: Req, res: Res) => {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const ip = String(req.headers['x-forwarded-for'] || req.socket?.remoteAddress || 'x').split(',')[0].trim();
    if (rateLimited(ip)) return sendJson(res, 429, { error: 'Muitas requisições.' });
    let body: { target?: string; texts?: unknown };
    try { body = await readJsonBody(req); } catch { return sendJson(res, 400, { error: 'JSON inválido.' }); }
    const target = body.target || '';
    if (!TARGETS[target]) return sendJson(res, 400, { error: 'Idioma não suportado.' });
    const texts = Array.isArray(body.texts) ? body.texts.filter((t): t is string => typeof t === 'string') : [];
    if (!texts.length || texts.length > MAX_TEXTS || texts.join('').length > MAX_CHARS) return sendJson(res, 400, { error: 'Lote inválido.' });

    const out: string[] = texts.map(t => cache.get(target + '|' + t) as string);
    const missIdx = out.map((v, i) => (v === undefined ? i : -1)).filter(i => i >= 0);
    if (missIdx.length) {
        const miss = missIdx.map(i => texts[i]);
        let done: string[] | null = null;
        const key = process.env.GEMINI_API_KEY;
        if (key) { try { done = await viaGemini(miss, target, key); } catch (e) { console.warn('[translate] gemini falhou', e); } }
        if (!done) {
            const g = target === 'pt-PT' ? 'pt-PT' : target;
            done = [];
            for (const part of Array.from({ length: Math.ceil(miss.length / 8) }, (_, i) => miss.slice(i * 8, i * 8 + 8)))
                done.push(...await Promise.all(part.map(t => viaGoogle(t, g))));
        }
        missIdx.forEach((idx, k) => {
            out[idx] = done![k];
            if (done![k] !== texts[idx]) { if (cache.size > 5000) cache.clear(); cache.set(target + '|' + texts[idx], done![k]); }
        });
    }
    res.setHeader('Cache-Control', 'no-store');
    return sendJson(res, 200, { translations: out });
};
