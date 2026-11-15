/** Lembretes pessoais automáticos (evento do dia e cupom vencendo). Regras puras, sem Firebase. */
export interface EventReminderDoc { id?: string; uid: string; eventId: string; title: string; date: string; sentOn?: string }
export interface RedemptionDoc { id?: string; userId: string; couponTitle?: string; companyName?: string; expiryDate?: string; status?: string; usedClaimedAt?: string }
export interface Reminder { uid: string; kind: 'evento' | 'cupom'; title: string; body: string; link: string; id: string; eventDocIds: string[] }

const BRT = 3 * 3600000;
/** Data de hoje em Brasília (AAAA-MM-DD). `plusDays` soma dias. */
export const dateBRT = (now: number = Date.now(), plusDays = 0): string => new Date(now - BRT + plusDays * 86400000).toISOString().slice(0, 10);

export const buildReminders = (a: { today: string; tomorrow: string; events: EventReminderDoc[]; redemptions: RedemptionDoc[] }): Reminder[] => {
  const byUser = new Map<string, { ev: EventReminderDoc[]; cp: RedemptionDoc[] }>();
  const slot = (u: string) => { if (!byUser.has(u)) byUser.set(u, { ev: [], cp: [] }); return byUser.get(u)!; };
  a.events.filter(e => e.uid && e.date === a.today && e.sentOn !== a.today).forEach(e => slot(e.uid).ev.push(e));
  a.redemptions
    .filter(r => r.userId && r.status === 'PENDING' && !r.usedClaimedAt && [a.today, a.tomorrow].includes(String(r.expiryDate || '').slice(0, 10)))
    .forEach(r => slot(r.userId).cp.push(r));

  const out: Reminder[] = [];
  byUser.forEach((v, uid) => {
    // No máximo 1 lembrete por pessoa por dia: evento tem prioridade sobre cupom.
    if (v.ev.length) {
      const one = v.ev.length === 1 ? v.ev[0] : null;
      out.push({
        uid, kind: 'evento', id: `lembrete:evento:${uid}:${a.today}`,
        title: one ? `Hoje: ${one.title}` : `Hoje você tem ${v.ev.length} eventos`,
        body: one ? 'Você pediu para ser avisado. Toque para ver horário e local.' : v.ev.map(e => e.title).slice(0, 3).join(', '),
        link: one ? `/eventos/${one.eventId}` : '/eventos',
        eventDocIds: v.ev.map(e => e.id || `${e.uid}_${e.eventId}`),
      });
    } else if (v.cp.length) {
      const one = v.cp.length === 1 ? v.cp[0] : null;
      const hoje = one ? String(one.expiryDate).slice(0, 10) === a.today : v.cp.some(c => String(c.expiryDate).slice(0, 10) === a.today);
      out.push({
        uid, kind: 'cupom', id: `lembrete:cupom:${uid}:${a.today}`,
        title: one ? `Seu cupom vence ${hoje ? 'hoje' : 'amanhã'}` : `Você tem ${v.cp.length} cupons vencendo`,
        body: one ? `${one.couponTitle || 'Cupom'}${one.companyName ? ` em ${one.companyName}` : ''}. Não esquece de usar!` : 'Não esquece de usar antes de vencer.',
        link: '/user-dashboard', eventDocIds: [],
      });
    }
  });
  return out;
};
