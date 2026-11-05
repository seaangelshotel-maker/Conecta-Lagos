/**
 * Inicialização do Firebase Admin para o servidor (Vercel Functions ou Express local).
 *
 * Credenciais, em ordem de preferência:
 * 1. FIREBASE_SERVICE_ACCOUNT  — JSON da conta de serviço (string), recomendado na Vercel.
 * 2. Credenciais padrão do Google (GOOGLE_APPLICATION_CREDENTIALS / ambiente Google Cloud).
 *
 * O projectId vem de FIREBASE_PROJECT_ID (padrão: conectario-dd04b).
 */
import { initializeApp, getApps, cert, applicationDefault, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getAuth, Auth, DecodedIdToken } from 'firebase-admin/auth';

let _app: App | null = null;

export const getAdminApp = (): App => {
    if (_app) return _app;
    if (getApps().length > 0) {
        _app = getApps()[0];
        return _app;
    }
    const projectId = process.env.FIREBASE_PROJECT_ID || 'conectario-dd04b';
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    if (raw) {
        const parsed = JSON.parse(raw);
        _app = initializeApp({ credential: cert(parsed), projectId: parsed.project_id || projectId });
    } else {
        try {
            _app = initializeApp({ credential: applicationDefault(), projectId });
        } catch {
            _app = initializeApp({ projectId });
        }
    }
    return _app;
};

export const adminDb = (): Firestore => getFirestore(getAdminApp());
export const adminAuth = (): Auth => getAuth(getAdminApp());

const ADMIN_EMAILS = ['sea.angelshotel@gmail.com', 'admin@lagosgo.org'];

/** Lê "Authorization: Bearer <idToken>" e valida no Firebase Auth. */
export const verifyRequestUser = async (authorizationHeader?: string | string[]): Promise<DecodedIdToken | null> => {
    const header = Array.isArray(authorizationHeader) ? authorizationHeader[0] : authorizationHeader;
    if (!header || !header.startsWith('Bearer ')) return null;
    try {
        return await adminAuth().verifyIdToken(header.slice(7));
    } catch {
        return null;
    }
};

export const isAdminToken = async (token: DecodedIdToken): Promise<boolean> => {
    if (token.email_verified && token.email && ADMIN_EMAILS.includes(token.email.toLowerCase())) return true;
    const snap = await adminDb().collection('users').doc(token.uid).get();
    return snap.exists && snap.data()?.role === 'SUPER_ADMIN';
};
