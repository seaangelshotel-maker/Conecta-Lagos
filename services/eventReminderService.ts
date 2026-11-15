/** "Me avise no dia": lembrete pessoal de evento (lido pela rotina diária do servidor). */
import { deleteDoc, doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

const idOf = (uid: string, eventId: string) => `${uid}_${eventId}`;

export const hasEventReminder = async (uid: string, eventId: string): Promise<boolean> => {
  try { return (await getDoc(doc(db, 'event_reminders', idOf(uid, eventId)))).exists(); } catch { return false; }
};

export const setEventReminder = async (uid: string, ev: { id: string; title: string; startDate: string }): Promise<void> => {
  await setDoc(doc(db, 'event_reminders', idOf(uid, ev.id)), { uid, eventId: ev.id, title: ev.title.slice(0, 200), date: ev.startDate.slice(0, 10), createdAt: new Date().toISOString() });
};

export const clearEventReminder = async (uid: string, eventId: string): Promise<void> => { await deleteDoc(doc(db, 'event_reminders', idOf(uid, eventId))); };
