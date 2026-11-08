/**
 * Notificações push (Firebase Cloud Messaging).
 * - Web/PWA: usa o service worker do app (/sw.js) e a chave VAPID (VITE_FIREBASE_VAPID_KEY).
 * - App nativo (Capacitor): usa o plugin PushNotifications quando o container o tiver.
 * O aparelho fica em push_tokens/{token} com os temas escolhidos; o envio é feito no servidor (api/push-send).
 * A permissão só é pedida quando a pessoa ativa os avisos.
 */
import { doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';
import { firebaseApp } from './firebase';
import { isNative, platform } from './native';

export const PUSH_TOPICS = [
  { id: 'cupons', label: 'Cupons e ofertas novas' },
  { id: 'materias', label: 'Matérias e notícias do Feed' },
  { id: 'eventos', label: 'Eventos na região' },
  { id: 'ajuda', label: 'Novidades da Ajuda Colaborativa' },
] as const;
export type PushTopic = typeof PUSH_TOPICS[number]['id'];

const VAPID = (import.meta as any).env?.VITE_FIREBASE_VAPID_KEY as string | undefined;
const LS = 'lagosgo_push_v1';

export interface PushState { token: string; topics: PushTopic[]; platform: string }

export const savedPush = (): PushState | null => { try { return JSON.parse(localStorage.getItem(LS) || 'null'); } catch { return null; } };
const remember = (s: PushState | null) => { try { s ? localStorage.setItem(LS, JSON.stringify(s)) : localStorage.removeItem(LS); } catch { /* ok */ } };

/** Push disponível neste aparelho e configurado no projeto? */
export const pushAvailability = (): { ok: boolean; reason?: string } => {
  if (isNative()) return (window as any).Capacitor?.Plugins?.PushNotifications ? { ok: true } : { ok: false, reason: 'O aplicativo ainda não tem o módulo de notificações.' };
  if (typeof window === 'undefined' || !('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) {
    return { ok: false, reason: 'Este navegador não recebe notificações. No iPhone, instale o app na tela inicial primeiro.' };
  }
  if (!VAPID) return { ok: false, reason: 'As notificações ainda estão sendo configuradas.' };
  return { ok: true };
};

const storeToken = async (token: string, topics: PushTopic[], uid?: string | null) => {
  const now = new Date().toISOString();
  const data: Record<string, unknown> = { token, topics, platform: platform(), updatedAt: now, lang: navigator.language || 'pt-BR' };
  if (uid) data.uid = uid;
  await setDoc(doc(db, 'push_tokens', token), data, { merge: true });
  const st = { token, topics, platform: platform() };
  remember(st);
  return st;
};

const nativeToken = (): Promise<string> => new Promise((resolve, reject) => {
  const P = (window as any).Capacitor.Plugins.PushNotifications;
  P.requestPermissions().then((r: any) => {
    if (r?.receive !== 'granted') { reject(new Error('denied')); return; }
    P.addListener('registration', (t: any) => resolve(t.value));
    P.addListener('registrationError', () => reject(new Error('registration')));
    P.register();
  }).catch(reject);
});

/** Ativa (ou atualiza) os avisos com os temas escolhidos. */
export const enablePush = async (topics: PushTopic[], uid?: string | null): Promise<PushState> => {
  const av = pushAvailability();
  if (!av.ok) throw new Error(av.reason);
  if (isNative()) return storeToken(await nativeToken(), topics, uid);
  const perm = await Notification.requestPermission();
  if (perm !== 'granted') throw new Error('Permissão negada. Para receber avisos, libere as notificações nas configurações do navegador.');
  const { getMessaging, getToken } = await import('firebase/messaging');
  const reg = await navigator.serviceWorker.register('/sw.js');
  const token = await getToken(getMessaging(firebaseApp), { vapidKey: VAPID, serviceWorkerRegistration: reg });
  if (!token) throw new Error('Não foi possível registrar este aparelho.');
  return storeToken(token, topics, uid);
};

export const disablePush = async () => {
  const s = savedPush();
  if (s) await deleteDoc(doc(db, 'push_tokens', s.token)).catch(() => undefined);
  if (!isNative()) {
    try { const { getMessaging, deleteToken } = await import('firebase/messaging'); await deleteToken(getMessaging(firebaseApp)); } catch { /* ok */ }
  }
  remember(null);
};
