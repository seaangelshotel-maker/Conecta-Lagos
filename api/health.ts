import type { Req, Res } from '../server/http.js';
import { sendJson } from '../server/http.js';
import { paymentsEnabled, paymentsProvider } from '../server/payments.js';
import { pushConfigured } from '../server/push.js';
import { mailConfigured } from '../server/mail.js';

export default function handler(_req: Req, res: Res) {
    sendJson(res, 200, {
        status: 'ok',
        paymentsEnabled: paymentsEnabled(),
        paymentsProvider,
        paymentsEnv: process.env.ASAAS_ENV === 'production' ? 'production' : 'sandbox',
        aiEnabled: !!process.env.GEMINI_API_KEY,
        pushEnabled: pushConfigured(),
        mailEnabled: mailConfigured(),
        siteUrl: process.env.SITE_URL || null,
        time: new Date().toISOString(),
    });
}
