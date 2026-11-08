import type { Req, Res } from '../server/http.js';
import { handlePushSend } from '../server/push.js';

export default function handler(req: Req, res: Res) {
    return handlePushSend(req, res);
}
