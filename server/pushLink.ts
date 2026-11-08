/** Link sempre interno ("/guia/x"), para a notificação nunca abrir site de terceiros. */
export const safeLink = (link: unknown) => {
  const s = String(link || '/').trim();
  return s === '/' || /^\/[^/\\]/.test(s) ? s : '/';
};
