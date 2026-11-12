/**
 * POST /api/ai/generate — proxy para o Gemini com a chave guardada no servidor.
 *
 * Antes, a chave do Gemini era embutida no JavaScript público do site
 * (vite define process.env.API_KEY), visível para qualquer visitante.
 * Agora só administradores autenticados usam a IA, e a chave fica em
 * GEMINI_API_KEY (variável de ambiente do servidor).
 */
import { GoogleGenAI } from '@google/genai';
import { verifyRequestUser, isAdminToken } from './firebaseAdmin.js';
import { Req, Res, sendJson, readJsonBody, methodNotAllowed } from './http.js';

const ALLOWED_MODELS = new Set([
    'gemini-flash-latest', 'gemini-3.8-flash', 'gemini-3-flash-preview', 'gemini-2.5-flash', 'gemini-2.5-pro', 'gemini-2.0-flash', 'gemini-1.5-flash'
]);

export const handleAiGenerate = async (req: Req, res: Res) => {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return sendJson(res, 503, { error: 'IA indisponível: GEMINI_API_KEY não configurada no servidor.' });

    const token = await verifyRequestUser(req.headers.authorization);
    if (!token) return sendJson(res, 401, { error: 'Faça login para usar a IA.' });
    if (!(await isAdminToken(token))) return sendJson(res, 403, { error: 'Recurso disponível apenas para administradores.' });

    try {
        const body = await readJsonBody<{ model?: string; contents?: unknown; config?: Record<string, unknown> }>(req);
        const model = body.model && ALLOWED_MODELS.has(body.model) ? body.model : 'gemini-flash-latest';
        if (!body.contents) return sendJson(res, 400, { error: 'Conteúdo vazio.' });
        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model,
            contents: body.contents as any,
            config: body.config as any,
        });
        return sendJson(res, 200, { text: response.text || '' });
    } catch (error: any) {
        console.error('[ai] erro:', error);
        return sendJson(res, 502, { error: error?.message || 'Erro ao consultar a IA.' });
    }
};
