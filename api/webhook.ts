import type { Req, Res } from '../server/http.js';
import { handleWebhook } from '../server/payments.js';

export default function handler(req: Req, res: Res) {
    return handleWebhook(req, res);
}
