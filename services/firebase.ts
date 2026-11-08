import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported, setAnalyticsCollectionEnabled } from 'firebase/analytics';
import { getConsent, CONSENT_EVENT } from './consent';

// --- CONFIGURAÇÃO DO FIREBASE (LAGOS GO) ---
// Estes valores são públicos por natureza (identificam o projeto no navegador);
// a proteção dos dados é feita pelas regras do Firestore (firestore.rules).
// Para apontar para outro projeto sem mudar o código, defina VITE_FIREBASE_* na Vercel.
const env = import.meta.env;
export const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyCLyaiF_RVOd4BXNE9sZ4sGNsjlqu6ihdQ",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "conectario-dd04b.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "conectario-dd04b",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "conectario-dd04b.firebasestorage.app",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "733864820546",
  appId: env.VITE_FIREBASE_APP_ID || "1:733864820546:web:9dc7affdf1e76ec92cd2db",
  measurementId: env.VITE_FIREBASE_MEASUREMENT_ID || "G-39XG38B9GK"
};

const app = initializeApp(firebaseConfig);

const auth = getAuth(app);
const db = getFirestore(app);

// Analytics só liga depois do consentimento (LGPD). Recusa ou sem escolha = nada é coletado.
let analytics: ReturnType<typeof getAnalytics> | null = null;
const startAnalytics = () => {
  if (analytics) { setAnalyticsCollectionEnabled(analytics, true); return; }
  isSupported().then(supported => { if (supported) analytics = getAnalytics(app); }).catch(() => undefined);
};
if (getConsent() === 'granted') startAnalytics();
if (typeof window !== 'undefined') {
  window.addEventListener(CONSENT_EVENT, (e: Event) => {
    const v = (e as CustomEvent).detail;
    if (v === 'granted') startAnalytics();
    else if (analytics) setAnalyticsCollectionEnabled(analytics, false);
  });
}

export { auth, db, analytics };
