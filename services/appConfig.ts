import { OFFICIAL_SITE_URL } from './seoRoutes.js';

/**
 * Endereço público do app (usado em textos de WhatsApp, avisos etc.).
 * Quando o domínio próprio estiver no ar, defina VITE_APP_URL na Vercel (ex.: https://lagosgo.com.br) e publique de novo.
 */
const fromEnv = ((import.meta as any).env?.VITE_APP_URL as string | undefined)?.trim().replace(/\/+$/, '');
export const APP_URL = fromEnv || OFFICIAL_SITE_URL;
