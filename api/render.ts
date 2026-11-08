import type { Req, Res } from '../server/http.js';
import { handleRender } from '../server/seo.js';

export default function handler(req: Req, res: Res) {
    return handleRender(req, res);
}
