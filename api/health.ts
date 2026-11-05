import type { Req, Res } from '../server/http.js';
import { sendJson } from '../server/http.js';
import { paymentsEnabled } from '../server/payments.js';

export default function handler(_req: Req, res: Res) {
    sendJson(res, 200, {
        status: 'ok',
        paymentsEnabled: paymentsEnabled(),
        aiEnabled: !!process.env.GEMINI_API_KEY,
        time: new Date().toISOString(),
    });
}
