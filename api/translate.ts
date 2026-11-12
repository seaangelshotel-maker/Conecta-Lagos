import type { Req, Res } from '../server/http.js';
import { handleTranslate } from '../server/translate.js';

export default function handler(req: Req, res: Res) {
    return handleTranslate(req, res);
}
