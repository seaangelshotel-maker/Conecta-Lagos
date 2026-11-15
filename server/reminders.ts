/**
 * Rotina diária (Vercel Cron, 08h de Brasília): lembretes pessoais de evento e cupom.
 * Cada pessoa recebe no máximo 1 por dia. Push só vai para aparelhos com o tema "lembretes";
 * a cópia no sininho vale para todos. Falha em um usuário não para os outros.
 */
import type { Firestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';
import { addPersonalToInbox } from './inbox.js';
import { buildReminders, dateBRT, EventReminderDoc, RedemptionDoc } from '../services/reminderRules.js';

export const runReminders = async (db: Firestore, now: number = Date.now()) => {
  const today = dateBRT(now), tomorrow = dateBRT(now, 1), dayAfter = dateBRT(now, 2);
  const [evSnap, rdSnap] = await Promise.all([
    db.collection('event_reminders').where('date', '==', today).get(),
    db.collection('redemptions').where('expiryDate', '>=', today).where('expiryDate', '<', dayAfter).get(),
  ]);
  const events = evSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as EventReminderDoc));
  const redemptions = rdSnap.docs.map(d => ({ id: d.id, ...(d.data() as any) } as RedemptionDoc));
  const list = buildReminders({ today, tomorrow, events, redemptions });

  let pushed = 0, inboxed = 0, failed = 0;
  for (const r of list) {
    try {
      const at = new Date(now).toISOString();
      await addPersonalToInbox(db, r.uid, { id: r.id, title: r.title, body: r.body, link: r.link, at, kind: r.kind }); inboxed++;
      const tk = await db.collection('push_tokens').where('uid', '==', r.uid).get();
      const tokens = tk.docs.filter(d => Array.isArray((d.data() as any).topics) && (d.data() as any).topics.includes('lembretes')).map(d => d.id);
      if (tokens.length) {
        const res = await getMessaging().sendEachForMulticast({
          tokens, notification: { title: r.title, body: r.body }, data: { link: r.link, title: r.title, body: r.body },
          webpush: { fcmOptions: { link: r.link } }, android: { priority: 'high', notification: { clickAction: 'FCM_PLUGIN_ACTIVITY' } },
        });
        pushed += res.successCount;
      }
      await Promise.all(r.eventDocIds.map(id => db.collection('event_reminders').doc(id).set({ sentOn: today }, { merge: true })));
    } catch (e: any) { failed++; console.error('[reminders] falha:', r.uid.slice(0, 6), String(e?.message || e).slice(0, 160)); }
  }
  return { today, candidates: list.length, inboxed, pushed, failed };
};
