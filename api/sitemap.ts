import type { Req, Res } from '../server/http.js';
import { handleSitemap } from '../server/seo.js';

export default function handler(req: Req, res: Res) {
    return handleSitemap(req, res);
}
