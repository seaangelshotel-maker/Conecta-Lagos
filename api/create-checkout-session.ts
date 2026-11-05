import type { Req, Res } from '../server/http.js';
import { handleCreateCheckout } from '../server/payments.js';

export default function handler(req: Req, res: Res) {
    return handleCreateCheckout(req, res);
}
