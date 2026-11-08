import type { Req, Res } from '../server/http.js';
import { handleRobots } from '../server/seo.js';

export default function handler(req: Req, res: Res) {
    return handleRobots(req, res);
}
