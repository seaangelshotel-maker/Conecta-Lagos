import type { Req, Res } from './http.js';
import { sendJson, readJsonBody } from './http.js';
import { adminDb } from './firebaseAdmin.js';
import { timingSafeEqual } from 'crypto';
import { validateEvent, todayISO } from '../services/eventRules.js';

/**
 * Ponte Execute Studio -> Lagos GO.
 * (Roteada por /api/email?action=studio-import e ?action=studio-status: a Vercel gratuita limita 12 funções.)
 *
 * Protegida por STUDIO_TOKEN (Vercel). Regras:
 * - Matéria do guia entra em blog_posts (kind 'guia') sempre como RASCUNHO.
 * - Evento entra em events sempre como PENDENTE (o admin aprova em Eventos > Pendentes).
 * - Exige 3+ fontes conferidas, ao menos 1 oficial no evento.
 * - Nunca altera o que já está publicado: correção de publicado é feita no painel.
 * - studio-status devolve a situação atual de cada id (rascunho, publicada, pendente...).
 */
const same = (a: string, b: string) => {
    const x = Buffer.from(a), y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
};

const goodSources = (s: unknown): string[] =>
    Array.isArray(s) ? s.filter((x): x is string => typeof x === 'string' && x.trim().length > 8).map(x => x.trim()).slice(0, 20) : [];
const OFFICIAL = /oficial|prefeitura|\.gov\.br|organizador|organização/i;

export const validateStudioArticle = (a: any): string | null => {
    if (!a || typeof a !== 'object') return 'Matéria inválida.';
    if (!/^guia_[a-z0-9-]{3,80}$/.test(String(a.id || ''))) return 'id inválido (use guia_<slug>).';
    if (!String(a.title || '').trim() || !String(a.content || '').trim()) return `"${a.title || a.id}": faltam título ou texto.`;
    if (goodSources(a.sources).length < 3) return `"${a.title}": menos de 3 fontes conferidas.`;
    if (/\[CONFIRMAR\]/i.test(`${a.title} ${a.content} ${a.excerpt || ''}`)) return `"${a.title}": ainda tem [CONFIRMAR] no texto.`;
    if (a.imageUrl && !/^https:\/\//.test(String(a.imageUrl))) return `"${a.title}": a foto de capa precisa ser um link https.`;
    return null;
};

export const validateStudioEvent = (e: any, today = todayISO()): string | null => {
    if (!e || typeof e !== 'object') return 'Evento inválido.';
    if (!/^studio_[a-z0-9-]{3,90}$/.test(String(e.id || ''))) return 'id de evento inválido (use studio_<slug>).';
    const errs = validateEvent({
        title: e.title, description: e.description, category: e.category, startDate: e.startDate, endDate: e.endDate,
        startTime: e.startTime, endTime: e.endTime, cityId: e.cityId, locationName: e.locationName, address: e.address,
        infoUrl: e.infoUrl, ticketUrl: e.ticketUrl, priceText: e.priceText, isFree: e.isFree,
    }, today, false);
    const first = Object.values(errs)[0];
    if (first) return `"${e.title || e.id}": ${first}`;
    const src = goodSources(e.sources);
    if (src.length < 3) return `"${e.title}": menos de 3 fontes conferidas.`;
    if (!src.some(s => OFFICIAL.test(s))) return `"${e.title}": falta uma fonte oficial (prefeitura, organizador ou perfil oficial).`;
    if (!e.startTime && !e.detailsTentative) return `"${e.title}": sem horário. Informe o horário ou marque "sem horário divulgado".`;
    if (/\[CONFIRMAR\]/i.test(`${e.title} ${e.description || ''} ${e.locationName || ''} ${e.priceText || ''}`)) return `"${e.title}": ainda tem [CONFIRMAR].`;
    return null;
};

const auth = (req: Req, res: Res): boolean => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.statusCode = 204; res.end(); return false; }
    if (req.method !== 'POST') { sendJson(res, 405, { error: 'Use POST.' }); return false; }
    const secret = process.env.STUDIO_TOKEN;
    if (!secret) { sendJson(res, 503, { error: 'STUDIO_TOKEN não configurado na Vercel.' }); return false; }
    const h = String(req.headers.authorization || '');
    if (!h.startsWith('Bearer ') || !same(h.slice(7), secret)) { sendJson(res, 401, { error: 'Não autorizado.' }); return false; }
    return true;
};

const pick = (o: any, keys: string[]) => Object.fromEntries(keys.filter(k => o[k] !== undefined && o[k] !== null).map(k => [k, o[k]]));
const EVENT_KEYS = ['title', 'description', 'category', 'startDate', 'endDate', 'startTime', 'endTime', 'scheduleNote', 'cityId',
    'locationName', 'address', 'priceText', 'isFree', 'infoUrl', 'ticketUrl', 'detailsTentative', 'sourceLabel', 'sourceUrl', 'coverImage'];

export async function handleStudioImport(req: Req, res: Res) {
    if (!auth(req, res)) return;
    try {
        const body = await readJsonBody<{ articles?: any[]; events?: any[] }>(req);
        const arts = Array.isArray(body.articles) ? body.articles.slice(0, 20) : [];
        const evs = Array.isArray(body.events) ? body.events.slice(0, 30) : [];
        if (!arts.length && !evs.length) return sendJson(res, 400, { error: 'Envie { articles: [...] } e/ou { events: [...] }.' });
        for (const a of arts) { const err = validateStudioArticle(a); if (err) return sendJson(res, 422, { error: err }); }
        for (const e of evs) { const err = validateStudioEvent(e); if (err) return sendJson(res, 422, { error: err }); }
        const db = adminDb();
        const saved: string[] = [], savedEvents: string[] = [];
        for (const a of arts) {
            const ref = db.collection('blog_posts').doc(a.id);
            const prev = await ref.get();
            if (prev.exists && (prev.data() as any)?.status === 'published') return sendJson(res, 409, { error: `"${a.title}" já está publicada no site; correção de publicada é feita no painel.` });
            const clean = JSON.parse(JSON.stringify({ ...a, sources: goodSources(a.sources), kind: 'guia', status: 'draft', authorId: 'execute-studio', importBatch: a.importBatch || 'studio' }));
            await ref.set(clean, { merge: true });
            saved.push(a.id);
        }
        const now = new Date().toISOString();
        for (const e of evs) {
            const ref = db.collection('events').doc(e.id);
            const prev = await ref.get();
            const p = prev.exists ? (prev.data() as any) : null;
            if (p && p.status === 'published') return sendJson(res, 409, { error: `"${e.title}" já está publicado na agenda; correção de publicado é feita no painel.` });
            const ev = JSON.parse(JSON.stringify({
                ...pick(e, EVENT_KEYS), id: e.id, sources: goodSources(e.sources),
                isFree: !!e.isFree, detailsTentative: !!e.detailsTentative,
                source: 'admin', status: 'pending', isFeatured: false, ownerId: 'execute-studio',
                createdAt: p?.createdAt || now, updatedAt: now,
            }));
            await ref.set(ev);
            savedEvents.push(e.id);
        }
        return sendJson(res, 200, { ok: true, saved, savedEvents });
    } catch (e: any) {
        return sendJson(res, 500, { error: e?.message || 'Erro ao gravar.' });
    }
}

/** Situação no site de cada matéria/evento enviados pelo Studio. */
export async function handleStudioStatus(req: Req, res: Res) {
    if (!auth(req, res)) return;
    try {
        const body = await readJsonBody<{ articles?: string[]; events?: string[] }>(req);
        const ids = (x: unknown, re: RegExp) => (Array.isArray(x) ? x.filter((i): i is string => typeof i === 'string' && re.test(i)).slice(0, 100) : []);
        const db = adminDb();
        const read = async (col: string, list: string[]) => {
            const out: Record<string, string | null> = {};
            await Promise.all(list.map(async id => { const s = await db.collection(col).doc(id).get(); out[id] = s.exists ? String((s.data() as any)?.status || 'draft') : null; }));
            return out;
        };
        return sendJson(res, 200, {
            ok: true,
            articles: await read('blog_posts', ids(body.articles, /^guia_[a-z0-9-]{3,80}$/)),
            events: await read('events', ids(body.events, /^studio_[a-z0-9-]{3,90}$/)),
            checkedAt: new Date().toISOString(),
        });
    } catch (e: any) {
        return sendJson(res, 500, { error: e?.message || 'Erro ao ler.' });
    }
}
