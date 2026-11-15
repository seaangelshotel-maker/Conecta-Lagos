/** Trava anti-spam dos avisos: no máximo N envios por dia (dia = fuso de Brasília). */
export const MAX_PUSH_PER_DAY = 2;

/** Início do dia de hoje em Brasília (UTC-3), em ISO UTC — para comparar com o campo `at` das campanhas. */
export const startOfDayBRT = (now: number = Date.now()): string => {
  const OFFSET = 3 * 3600000;
  const local = new Date(now - OFFSET);
  const startLocal = Date.UTC(local.getUTCFullYear(), local.getUTCMonth(), local.getUTCDate());
  return new Date(startLocal + OFFSET).toISOString();
};

export const limitReached = (sentToday: number, max: number = MAX_PUSH_PER_DAY): boolean => sentToday >= max;
