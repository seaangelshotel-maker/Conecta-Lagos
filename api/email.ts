import type { Req, Res } from '../server/http.js';
import emailHandler from '../server/emailHandler.js';

/** Roteador único de e-mail: ver server/emailHandler.ts (ação em ?action=). */
export default function handler(req: Req, res: Res) {
    return emailHandler(req, res);
}
