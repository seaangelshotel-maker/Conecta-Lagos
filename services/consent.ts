/**
 * Consentimento para o Google Analytics (LGPD). Sem escolha registrada, o Analytics fica desligado.
 * Guardado só no aparelho (localStorage); a pessoa muda quando quiser na Política de Privacidade.
 */
export type ConsentChoice = 'granted' | 'denied';
const KEY = 'lagosgo_consent_analytics_v1';
export const CONSENT_EVENT = 'consentChanged';

export const getConsent = (): ConsentChoice | null => {
  try { const v = localStorage.getItem(KEY); return v === 'granted' || v === 'denied' ? v : null; } catch { return null; }
};

export const setConsent = (v: ConsentChoice) => {
  try { localStorage.setItem(KEY, v); } catch { /* aparelho sem armazenamento: vale só nesta visita */ }
  if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: v }));
};
