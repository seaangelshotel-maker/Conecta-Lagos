/**
 * Registro de acesso de usuários logados (IP, local aproximado, aparelho) e leitura pelo admin.
 * Finalidade: segurança, prevenção a fraude, suporte e auditoria. Retenção: 180 dias (ver purgeOldAccess).
 */
import { adminAuth, adminDb } from './firebaseAdmin.js';
import type { Req } from './http.js';

export const ACCESS_RETENTION_DAYS = 180;
const DAY = 86_400_000;

const header = (req: Req, name: string): string => {
    const v = req.headers[name];
    return (Array.isArray(v) ? v[0] : v || '').toString();
};
const dec = (s: string) => { try { return decodeURIComponent(s); } catch { return s; } };

export const clientInfo = (req: Req) => {
    const ip = (header(req, 'x-forwarded-for').split(',')[0] || header(req, 'x-real-ip') || req.socket?.remoteAddress || '').trim().slice(0, 64);
    return {
        ip,
        country: dec(header(req, 'x-vercel-ip-country')).slice(0, 8),
        region: dec(header(req, 'x-vercel-ip-country-region')).slice(0, 40),
        city: dec(header(req, 'x-vercel-ip-city')).slice(0, 80),
        userAgent: header(req, 'user-agent').slice(0, 300),
    };
};

export const deviceLabel = (ua: string): string => {
    if (!ua) return '';
    const os = /Android/i.test(ua) ? 'Android' : /iPhone|iPad|iPod/i.test(ua) ? 'iOS' : /Windows/i.test(ua) ? 'Windows' : /Mac OS X/i.test(ua) ? 'macOS' : /Linux/i.test(ua) ? 'Linux' : 'Outro';
    const br = /Edg\//.test(ua) ? 'Edge' : /OPR\/|Opera/.test(ua) ? 'Opera' : /Chrome\//.test(ua) ? 'Chrome' : /Firefox\//.test(ua) ? 'Firefox' : /Safari\//.test(ua) ? 'Safari' : 'Navegador';
    return `${br} · ${os}`;
};

/** Grava/atualiza o último acesso do usuário. */
export async function trackAccess(req: Req, uid: string) {
    const c = clientInfo(req);
    const now = new Date().toISOString();
    const ref = adminDb().collection('user_access').doc(uid);
    await adminDb().runTransaction(async tx => {
        const s = await tx.get(ref);
        const old = s.exists ? (s.data() as any) : {};
        const cutoff = Date.now() - ACCESS_RETENTION_DAYS * DAY;
        const recent = (Array.isArray(old.recentIps) ? old.recentIps : []).filter((r: any) => r?.ip && Date.parse(r.at) >= cutoff && r.ip !== c.ip);
        if (c.ip) recent.unshift({ ip: c.ip, at: now });
        tx.set(ref, {
            firstAccessAt: old.firstAccessAt || now,
            lastAccessAt: now,
            accessCount: Number(old.accessCount || 0) + 1,
            lastIp: c.ip, lastCountry: c.country, lastRegion: c.region, lastCity: c.city, lastUserAgent: c.userAgent,
            recentIps: recent.slice(0, 10),
        });
    });
}

/** Lista de usuários mais novos para o admin. */
export async function listNewUsers(limit: number) {
    const all: any[] = [];
    let token: string | undefined;
    do {
        const page = await adminAuth().listUsers(1000, token);
        all.push(...page.users);
        token = page.pageToken;
    } while (token && all.length < 5000);
    all.sort((a, b) => Date.parse(b.metadata.creationTime) - Date.parse(a.metadata.creationTime));
    const top = all.slice(0, limit);
    const db = adminDb();
    const [acc, prof] = await Promise.all([
        Promise.all(top.map(u => db.collection('user_access').doc(u.uid).get())),
        Promise.all(top.map(u => db.collection('users').doc(u.uid).get())),
    ]);
    return {
        total: all.length,
        users: top.map((u, i) => {
            const a = acc[i].exists ? (acc[i].data() as any) : null;
            const p = prof[i].exists ? (prof[i].data() as any) : {};
            return {
                uid: u.uid, name: u.displayName || p.name || '', email: u.email || '', photoURL: u.photoURL || p.avatar || p.photoURL || '',
                providers: u.providerData.map((x: any) => x.providerId),
                createdAt: u.metadata.creationTime, lastSignInAt: u.metadata.lastSignInTime || '',
                disabled: !!u.disabled, emailVerified: !!u.emailVerified,
                role: p.role || '', plan: p.plan || '',
                access: a ? {
                    firstAt: a.firstAccessAt, lastAt: a.lastAccessAt, count: a.accessCount || 0,
                    ip: a.lastIp || '', country: a.lastCountry || '', region: a.lastRegion || '', city: a.lastCity || '',
                    device: deviceLabel(a.lastUserAgent || ''), recentIps: a.recentIps || [],
                } : null,
            };
        }),
    };
}

/** Apaga dados de acesso mais antigos que a retenção. Chamado pelo cron diário. */
export async function purgeOldAccess(): Promise<number> {
    const cutoff = new Date(Date.now() - ACCESS_RETENTION_DAYS * DAY).toISOString();
    const snap = await adminDb().collection('user_access').where('lastAccessAt', '<', cutoff).limit(400).get();
    const batch = adminDb().batch();
    snap.docs.forEach(d => batch.delete(d.ref));
    if (!snap.empty) await batch.commit();
    return snap.size;
}
