/**
 * Utilitários HTTP compartilhados entre as funções da Vercel (pasta api/) e o
 * servidor Express de desenvolvimento (server.ts). Usa só tipos do Node.
 */
import type { IncomingMessage, ServerResponse } from 'http';

export type Req = IncomingMessage & { body?: unknown; rawBody?: string };
export type Res = ServerResponse;

export const sendJson = (res: Res, status: number, payload: unknown) => {
    res.statusCode = status;
    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.setHeader('Cache-Control', 'no-store');
    res.end(JSON.stringify(payload));
};

/** Lê o corpo bruto (necessário para validar a assinatura do webhook). */
export const readRawBody = async (req: Req): Promise<string> => {
    if (typeof req.rawBody === 'string') return req.rawBody;
    const chunks: Buffer[] = [];
    for await (const chunk of req as AsyncIterable<Buffer | string>) {
        chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
    }
    const raw = Buffer.concat(chunks).toString('utf8');
    req.rawBody = raw;
    return raw;
};

export const readJsonBody = async <T = Record<string, unknown>>(req: Req): Promise<T> => {
    if (req.body && typeof req.body === 'object') return req.body as T;
    const raw = await readRawBody(req);
    if (!raw) return {} as T;
    return JSON.parse(raw) as T;
};

export const methodNotAllowed = (res: Res, allowed: string[]) => {
    res.setHeader('Allow', allowed.join(', '));
    sendJson(res, 405, { error: 'Método não permitido.' });
};
