import type { Req, Res } from '../../server/http.js';
import { handleAiGenerate } from '../../server/ai.js';

export default function handler(req: Req, res: Res) {
    return handleAiGenerate(req, res);
}
