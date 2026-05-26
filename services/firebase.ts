import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getAnalytics, isSupported } from 'firebase/analytics';

// --- CONFIGURAÇÃO DO FIREBASE (LAGOS GO) ---
export const firebaseConfig = {
  apiKey: "AIzaSyCLyaiF_RVOd4BXNE9sZ4sGNsjlqu6ihdQ",
  authDomain: "conectario-dd04b.firebaseapp.com",
  projectId: "conectario-dd04b",
  storageBucket: "conectario-dd04b.firebasestorage.app",
  messagingSenderId: "733864820546",
  appId: "1:733864820546:web:9dc7affdf1e76ec92cd2db",
  measurementId: "G-39XG38B9GK"
};

// Inicializa o App do Firebase
const app = initializeApp(firebaseConfig);

// Inicializa os serviços que o site usa
const auth = getAuth(app);        // Para login
const db = getFirestore(app);     // Para banco de dados (cupons, empresas)

let analytics: any = null;
isSupported().then(supported => {
  if (supported) {
    analytics = getAnalytics(app); // Para métricas de acesso
  }
});

console.log("🔥 Firebase conectado e pronto para uso!");

export { auth, db, analytics };