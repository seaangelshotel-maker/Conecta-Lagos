/**
 * Newsletter semanal: inscrição com confirmação (double opt-in), descadastro com um clique e montagem do resumo.
 * Inscritos ficam em `newsletter_subscribers` (só o servidor lê e escreve; as regras do Firestore negam o resto).
 */
import { createHash, createHmac, timingSafeEqual } from 'crypto';
import { adminDb } from './firebaseAdmin.js';
import { isEmail, normalizeEmail, sendMail, sendMailBatch, siteUrl, type MailInput } from './mail.js';
import { newsletterConfirm, newsletterHasContent, newsletterWeekly, type DigestItem, type NewsletterData } from './mailTemplates.js';
import { topCoupons, weekendEvents } from '../services/weeklyDigest.js';
import { cityLabel, formatEventDates } from '../services/eventRules.js';
import { couponSaving, formatBRL } from '../services/walletRules.js';

export type SubscriberStatus = 'pending' | 'active' | 'unsubscribed';
export interface Subscriber {
    email: string;
    status: SubscriberStatus;
    source?: string;
    createdAt?: string;
    confirmedAt?: string;
    unsubscribedAt?: string;
    lastConfirmSentAt?: string;
    lastSentAt?: string;
}

const COLLECTION = 'newsletter_subscribers';
export const CONFIRM_COOLDOWN_MS = 10 * 60 * 1000;
export const CONFIRM_TTL_MS = 7 * 24 * 3600 * 1000;

export const subscriberId = (email: string) => createHash('sha256').update(normalizeEmail(email)).digest('hex').slice(0, 40);

const secret = (env: NodeJS.ProcessEnv = process.env) => env.MAIL_SECRET || env.CRON_SECRET || '';

export type TokenPurpose = 'confirm' | 'unsub';

/** Token = base64url(email).expira.assinatura. O descadastro não expira (exp = 0). */
export function makeToken(email: string, purpose: TokenPurpose, env: NodeJS.ProcessEnv = process.env, now = Date.now()): string {
    const exp = purpose === 'confirm' ? now + CONFIRM_TTL_MS : 0;
    const payload = `${Buffer.from(normalizeEmail(email)).toString('base64url')}.${exp}`;
    const sig = createHmac('sha256', secret(env)).update(`${purpose}.${payload}`).digest('base64url');
    return `${payload}.${sig}`;
}

export function readToken(token: string, purpose: TokenPurpose, env: NodeJS.ProcessEnv = process.env, now = Date.now()): string | null {
    const key = secret(env);
    if (!key || typeof token !== 'string') return null;
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [b64, expRaw, sig] = parts;
    const expected = createHmac('sha256', key).update(`${purpose}.${b64}.${expRaw}`).digest('base64url');
    const a = Buffer.from(sig), b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
    const exp = Number(expRaw);
    if (!Number.isFinite(exp) || (exp !== 0 && exp < now)) return null;
    try {
        const email = Buffer.from(b64, 'base64url').toString('utf8');
        return isEmail(email) ? email : null;
    } catch { return null; }
}

export const confirmUrl = (email: string, env: NodeJS.ProcessEnv = process.env) =>
    `${siteUrl(env)}/api/email?action=confirm&t=${makeToken(email, 'confirm', env)}`;
export const unsubscribeUrl = (email: string, env: NodeJS.ProcessEnv = process.env) =>
    `${siteUrl(env)}/api/email?action=unsubscribe&t=${makeToken(email, 'unsub', env)}`;

export type SubscribeResult = 'sent' | 'already' | 'cooldown' | 'invalid' | 'unavailable';

/** Cria/atualiza o inscrito como pendente e envia o e-mail de confirmação. Nunca revela se o e-mail já existia. */
export async function subscribe(rawEmail: string, source = 'site', env: NodeJS.ProcessEnv = process.env): Promise<SubscribeResult> {
    const email = normalizeEmail(rawEmail);
    if (!isEmail(email)) return 'invalid';
    if (!secret(env)) return 'unavailable';
    const ref = adminDb().collection(COLLECTION).doc(subscriberId(email));
    const snap = await ref.get();
    const cur = snap.exists ? (snap.data() as Subscriber) : null;
    if (cur?.status === 'active') return 'already';
    const now = Date.now();
    if (cur?.lastConfirmSentAt && now - Date.parse(cur.lastConfirmSentAt) < CONFIRM_COOLDOWN_MS) return 'cooldown';
    const nowIso = new Date(now).toISOString();
    await ref.set({
        email, status: 'pending', source: cur?.source || String(source).slice(0, 40),
        createdAt: cur?.createdAt || nowIso, lastConfirmSentAt: nowIso,
    } as Subscriber, { merge: true });
    const t = newsletterConfirm({ site: siteUrl(env), confirmUrl: confirmUrl(email, env) });
    const r = await sendMail({ to: email, ...t, tags: [{ name: 'type', value: 'newsletter_confirm' }] }, env);
    return r.ok ? 'sent' : 'unavailable';
}

export async function confirm(token: string, env: NodeJS.ProcessEnv = process.env): Promise<boolean> {
    const email = readToken(token, 'confirm', env);
    if (!email) return false;
    const ref = adminDb().collection(COLLECTION).doc(subscriberId(email));
    await ref.set({ email, status: 'active', confirmedAt: new Date().toISOString() } as Partial<Subscriber>, { merge: true });
    return true;
}

export async function unsubscribe(token: string, env: NodeJS.ProcessEnv = process.env): Promise<boolean> {
    const email = readToken(token, 'unsub', env);
    if (!email) return false;
    const ref = adminDb().collection(COLLECTION).doc(subscriberId(email));
    await ref.set({ email, status: 'unsubscribed', unsubscribedAt: new Date().toISOString() } as Partial<Subscriber>, { merge: true });
    return true;
}

export async function listActive(): Promise<Subscriber[]> {
    const snap = await adminDb().collection(COLLECTION).where('status', '==', 'active').get();
    return snap.docs.map(d => d.data() as Subscriber).filter(s => isEmail(s.email));
}

export async function countByStatus(): Promise<Record<SubscriberStatus, number>> {
    const out: Record<SubscriberStatus, number> = { pending: 0, active: 0, unsubscribed: 0 };
    const snap = await adminDb().collection(COLLECTION).get();
    snap.docs.forEach(d => { const s = (d.data() as Subscriber).status; if (s in out) out[s]++; });
    return out;
}

/** Monta o conteúdo do resumo a partir do que está publicado agora. */
export async function buildNewsletterData(env: NodeJS.ProcessEnv = process.env, intro?: string): Promise<NewsletterData> {
    const db = adminDb();
    const site = siteUrl(env);
    const [evSnap, cpSnap, postSnap] = await Promise.all([
        db.collection('events').where('status', '==', 'published').get(),
        db.collection('coupons').where('active', '==', true).get(),
        db.collection('blog_posts').get(),
    ]);
    const events = evSnap.docs.map(d => ({ ...(d.data() as any), id: d.id }));
    const coupons = cpSnap.docs.map(d => ({ ...(d.data() as any), id: d.id }));
    const evItems: DigestItem[] = weekendEvents(events).slice(0, 5).map(e => ({
        title: e.title,
        subtitle: [formatEventDates(e), [e.locationName, cityLabel(e.cityId)].filter(Boolean).join(', ')].filter(Boolean).join(' · '),
        url: `${site}/eventos/${e.id}`,
    }));
    const cpItems: DigestItem[] = topCoupons(coupons, 3).map(c => ({
        title: `${c.companyName}: ${c.title}`,
        subtitle: `Economize ${formatBRL(couponSaving(c))}`,
        url: `${site}/user-dashboard`,
    }));
    const posts = postSnap.docs.map(d => ({ ...(d.data() as any), id: d.id }))
        .filter(p => p.title && p.date)
        .sort((a, b) => String(b.date).localeCompare(String(a.date)))
        .slice(0, 3);
    const postItems: DigestItem[] = posts.map(p => ({ title: p.title, subtitle: p.excerpt ? String(p.excerpt).slice(0, 140) : undefined, url: `${site}/blog/${p.id}` }));
    return { intro, events: evItems, coupons: cpItems, posts: postItems };
}

/** Envia o resumo para todos os inscritos ativos. `dryRun` só devolve a contagem. */
export async function sendWeekly(opts: { env?: NodeJS.ProcessEnv; subject?: string; intro?: string; dryRun?: boolean } = {}) {
    const env = opts.env || process.env;
    const data = await buildNewsletterData(env, opts.intro);
    if (!newsletterHasContent(data)) return { sent: 0, failed: 0, recipients: 0, empty: true };
    const subs = await listActive();
    if (opts.dryRun) return { sent: 0, failed: 0, recipients: subs.length, empty: false };
    const site = siteUrl(env);
    const list: MailInput[] = subs.map(s => {
        const u = unsubscribeUrl(s.email, env);
        const t = newsletterWeekly({ site, data, unsubscribeUrl: u, subject: opts.subject });
        return {
            to: s.email, ...t,
            headers: { 'List-Unsubscribe': `<${u}>`, 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
            tags: [{ name: 'type', value: 'newsletter_weekly' }],
        };
    });
    const r = await sendMailBatch(list, env);
    if (r.sent > 0) {
        const db = adminDb();
        const nowIso = new Date().toISOString();
        for (let i = 0; i < subs.length; i += 400) {
            const batch = db.batch();
            subs.slice(i, i + 400).forEach(s => batch.set(db.collection(COLLECTION).doc(subscriberId(s.email)), { lastSentAt: nowIso }, { merge: true }));
            await batch.commit();
        }
    }
    return { ...r, recipients: subs.length, empty: false };
}

