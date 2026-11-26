import type { Req, Res } from '../server/http.js';
import { sendJson, readJsonBody } from '../server/http.js';
import { adminDb } from '../server/firebaseAdmin.js';
import { timingSafeEqual } from 'crypto';

/**
 * Entrada de matérias produzidas no Execute Studio.
 * Protegida por STUDIO_TOKEN (Vercel). Só grava RASCUNHO em blog_posts (kind 'guia'),
 * exige 3+ fontes e nunca altera matéria já publicada. Quem publica é o administrador no painel.
 */
const same = (a: string, b: string) => {
    const x = Buffer.from(a), y = Buffer.from(b);
    return x.length === y.length && timingSafeEqual(x, y);
};

export const validateStudioArticle = (a: any): string | null => {
    if (!a || typeof a !== 'object') return 'Matéria inválida.';
    if (!/^guia_[a-z0-9-]{3,80}$/.test(String(a.id || ''))) return 'id inválido (use guia_<slug>).';
    if (!String(a.title || '').trim() || !String(a.content || '').trim()) return `"${a.title || a.id}": faltam título ou texto.`;
    const src = Array.isArray(a.sources) ? a.sources.filter((x: unknown) => typeof x === 'string' && x.trim().length > 8) : [];
    if (src.length < 3) return `"${a.title}": menos de 3 fontes conferidas.`;
    return null;
};

export default async function handler(req: Req, res: Res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Authorization, Content-Type');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    if (req.method === 'OPTIONS') { res.statusCode = 204; return res.end(); }
    if (req.method !== 'POST') return sendJson(res, 405, { error: 'Use POST.' });
    const secret = process.env.STUDIO_TOKEN;
    if (!secret) return sendJson(res, 503, { error: 'STUDIO_TOKEN não configurado na Vercel.' });
    const h = String(req.headers.authorization || '');
    if (!h.startsWith('Bearer ') || !same(h.slice(7), secret)) return sendJson(res, 401, { error: 'Não autorizado.' });
    try {
        const body = await readJsonBody<{ articles?: any[] }>(req);
        const list = Array.isArray(body.articles) ? body.articles.slice(0, 20) : [];
        if (!list.length) return sendJson(res, 400, { error: 'Envie { articles: [...] }.' });
        for (const a of list) { const err = validateStudioArticle(a); if (err) return sendJson(res, 422, { error: err }); }
        const db = adminDb();
        const saved: string[] = [];
        for (const a of list) {
            const ref = db.collection('blog_posts').doc(a.id);
            const prev = await ref.get();
            if (prev.exists && (prev.data() as any)?.status === 'published') return sendJson(res, 409, { error: `"${a.title}" já está publicada; edite no painel.` });
            const clean = JSON.parse(JSON.stringify({ ...a, kind: 'guia', status: 'draft', authorId: 'execute-studio', importBatch: a.importBatch || 'studio' }));
            await ref.set(clean, { merge: true });
            saved.push(a.id);
        }
        return sendJson(res, 200, { ok: true, saved });
    } catch (e: any) {
        return sendJson(res, 500, { error: e?.message || 'Erro ao gravar.' });
    }
}
