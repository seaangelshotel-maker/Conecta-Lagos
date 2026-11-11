/**
 * Testes das regras de segurança do Firestore (firestore.rules) no EMULADOR.
 * Nunca rodam contra produção.
 *
 * Pré-requisitos (uma vez):
 *   npm i -D @firebase/rules-unit-testing firebase-tools
 * Rodar:
 *   npm run test:rules
 */
import { test, before, after, beforeEach } from 'node:test';
import { readFileSync } from 'node:fs';
import {
    initializeTestEnvironment, assertFails, assertSucceeds, RulesTestEnvironment
} from '@firebase/rules-unit-testing';
import { doc, getDoc, setDoc, updateDoc, collection, getDocs, query, where, writeBatch, serverTimestamp, addDoc } from 'firebase/firestore';

let env: RulesTestEnvironment;

before(async () => {
    env = await initializeTestEnvironment({
        projectId: 'lagosgo-rules-test',
        firestore: { rules: readFileSync('firestore.rules', 'utf8') },
    });
});
after(async () => { await env.cleanup(); });

beforeEach(async () => {
    await env.clearFirestore();
    await env.withSecurityRulesDisabled(async (ctx) => {
        const db = ctx.firestore();
        await setDoc(doc(db, 'users/ana'), { id: 'ana', name: 'Ana', email: 'ana@x.com', role: 'COMPANY' });
        await setDoc(doc(db, 'users/bruno'), { id: 'bruno', name: 'Bruno', email: 'b@x.com', role: 'CUSTOMER', phone: '22999990000' });
        await setDoc(doc(db, 'users/adm'), { id: 'adm', name: 'Adm', email: 'adm@x.com', role: 'SUPER_ADMIN' });
        await setDoc(doc(db, 'businesses/ana'), { id: 'ana', ownerId: 'ana', name: 'Barco Azul', status: 'approved', isBlocked: false, isFeatured: false, plan: 'free' });
        await setDoc(doc(db, 'coupons/c1'), { id: 'c1', companyId: 'ana', status: 'approved', currentRedemptions: 0, maxRedemptions: 1 });
        await setDoc(doc(db, 'settings/payment'), { isPaymentActive: false });
        await setDoc(doc(db, 'opportunities/o1'), {
            id: 'o1', title: 'Marinheiro sábado', description: 'Descrição com mais de vinte caracteres.', category: 'Outros',
            type: 'temporario', recurrence: 'pontual', ownerId: 'ana', posterName: 'Ana', compensationType: 'to_agree',
            peopleNeeded: 1, contactMethod: 'in_app', status: 'published', isHidden: false,
            createdAt: '2026-11-01', updatedAt: '2026-11-01', publishedAt: '2026-11-01',
        });
    });
});

const as = (uid: string | null, extra: Record<string, unknown> = {}) =>
    (uid ? env.authenticatedContext(uid, extra) : env.unauthenticatedContext()).firestore();

// ---- Usuários / privilégios ----
test('usuário NÃO pode se promover a administrador', async () => {
    await assertFails(updateDoc(doc(as('bruno'), 'users/bruno'), { role: 'SUPER_ADMIN' }));
});
test('usuário NÃO lê dados de outros usuários (e-mail/telefone)', async () => {
    await assertFails(getDoc(doc(as('ana'), 'users/bruno')));
    await assertFails(getDocs(collection(as('ana'), 'users')));
});
test('usuário edita o próprio nome', async () => {
    await assertSucceeds(updateDoc(doc(as('bruno'), 'users/bruno'), { name: 'Bruno S.' }));
});
test('cadastro nasce como CUSTOMER', async () => {
    await assertFails(setDoc(doc(as('novo'), 'users/novo'), { id: 'novo', role: 'COMPANY' }));
    await assertSucceeds(setDoc(doc(as('novo'), 'users/novo'), { id: 'novo', role: 'CUSTOMER', savedAmount: 0 }));
});
test('e-mail admin NÃO verificado não vira admin', async () => {
    await assertFails(getDoc(doc(as('x', { email: 'sea.angelshotel@gmail.com', email_verified: false }), 'settings/payment')));
});
test('admin lê configurações de pagamento', async () => {
    await assertSucceeds(getDoc(doc(as('adm'), 'settings/payment')));
});

// ---- Empresas / planos ----
test('dono NÃO ativa plano nem destaque por conta própria', async () => {
    await assertFails(updateDoc(doc(as('ana'), 'businesses/ana'), { plan: 'premium' }));
    await assertFails(updateDoc(doc(as('ana'), 'businesses/ana'), { isFeatured: true }));
    await assertFails(updateDoc(doc(as('ana'), 'businesses/ana'), { status: 'approved', subscriptionEndsAt: '2099-01-01' }));
});
test('dono edita descrição da própria empresa', async () => {
    await assertSucceeds(updateDoc(doc(as('ana'), 'businesses/ana'), { description: 'Nova descrição' }));
});
test('outro usuário não edita a empresa', async () => {
    await assertFails(updateDoc(doc(as('bruno'), 'businesses/ana'), { description: 'hack' }));
});
test('nova empresa nasce pendente', async () => {
    await assertFails(setDoc(doc(as('bruno'), 'businesses/bruno'), { id: 'bruno', ownerId: 'bruno', status: 'approved' }));
    await assertSucceeds(setDoc(doc(as('bruno'), 'businesses/bruno'), { id: 'bruno', ownerId: 'bruno', status: 'PENDING', name: 'Loja' }));
});

// ---- Cupons ----
test('resgate incrementa contador em exatamente 1 e respeita o limite', async () => {
    await assertFails(updateDoc(doc(as('bruno'), 'coupons/c1'), { currentRedemptions: 5 }));
    await assertSucceeds(updateDoc(doc(as('bruno'), 'coupons/c1'), { currentRedemptions: 1 }));
});
test('empresa não autoaprova cupom', async () => {
    await assertFails(setDoc(doc(as('ana'), 'coupons/c2'), { id: 'c2', companyId: 'ana', status: 'approved', currentRedemptions: 0 }));
    await assertSucceeds(setDoc(doc(as('ana'), 'coupons/c2'), { id: 'c2', companyId: 'ana', status: 'pending', currentRedemptions: 0 }));
});

// ---- Registro de conexões ----
test('visitante anônimo registra evento válido, sem poder ler', async () => {
    const ev = { type: 'business_view', entityType: 'business', entityId: 'ana', ownerId: 'ana', sessionId: 's1', isAuthenticated: false, createdAt: 'x', day: '2026-11-05', ts: serverTimestamp() };
    await assertSucceeds(addDoc(collection(as(null), 'interactions'), ev));
    await assertFails(addDoc(collection(as(null), 'interactions'), { ...ev, ownerId: 'bruno' }));
    await assertFails(addDoc(collection(as(null), 'interactions'), { ...ev, email: 'x@y.com' }));
    await assertFails(getDocs(query(collection(as('bruno'), 'interactions'), where('ownerId', '==', 'ana'))));
    await assertSucceeds(getDocs(query(collection(as('ana'), 'interactions'), where('ownerId', '==', 'ana'))));
});

// ---- Ajuda Colaborativa ----
const newOpp = (id: string, ownerId: string, extra: Record<string, unknown> = {}) => ({
    id, title: 'Garçom para sábado', description: 'Atendimento no restaurante no sábado à noite.', category: 'Outros',
    type: 'temporario', recurrence: 'pontual', ownerId, posterName: 'Bruno', compensationType: 'to_agree',
    peopleNeeded: 1, contactMethod: 'in_app', status: 'published', isHidden: false, createdAt: 'x', updatedAt: 'x', ...extra,
});

test('publicação exige lote com antispam e limita 1 por minuto', async () => {
    const db = as('bruno');
    await assertFails(setDoc(doc(db, 'opportunities/o2'), newOpp('o2', 'bruno')));
    const b1 = writeBatch(db);
    b1.set(doc(db, 'opportunities/o2'), newOpp('o2', 'bruno'));
    b1.set(doc(db, 'rateLimits/bruno'), { lastOpportunityAt: serverTimestamp() });
    await assertSucceeds(b1.commit());
    const b2 = writeBatch(db);
    b2.set(doc(db, 'opportunities/o3'), newOpp('o3', 'bruno'));
    b2.set(doc(db, 'rateLimits/bruno'), { lastOpportunityAt: serverTimestamp() });
    await assertFails(b2.commit());
});
test('não publica em nome de outra pessoa nem já oculta', async () => {
    const db = as('bruno');
    const b = writeBatch(db);
    b.set(doc(db, 'opportunities/o4'), newOpp('o4', 'ana'));
    b.set(doc(db, 'rateLimits/bruno'), { lastOpportunityAt: serverTimestamp() });
    await assertFails(b.commit());
});
test('terceiro não altera nem encerra oportunidade alheia', async () => {
    await assertFails(updateDoc(doc(as('bruno'), 'opportunities/o1'), { status: 'closed' }));
});
test('dono não reabre oportunidade encerrada e não se desoculta', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => {
        await updateDoc(doc(ctx.firestore(), 'opportunities/o1'), { status: 'closed', isHidden: true });
    });
    await assertFails(updateDoc(doc(as('ana'), 'opportunities/o1'), { status: 'published' }));
    await assertFails(updateDoc(doc(as('ana'), 'opportunities/o1'), { isHidden: false }));
});
test('candidatura: uma por pessoa, contato visível só ao anunciante', async () => {
    const app = {
        id: 'bruno', opportunityId: 'o1', opportunityTitle: 'Marinheiro sábado', opportunityOwnerId: 'ana',
        applicantId: 'bruno', applicantName: 'Bruno', applicantContact: '22999990000', status: 'interested', createdAt: 'x', updatedAt: 'x',
    };
    await assertFails(setDoc(doc(as('bruno'), 'opportunities/o1/applications/outro'), app));
    await assertSucceeds(setDoc(doc(as('bruno'), 'opportunities/o1/applications/bruno'), app));
    await assertSucceeds(getDoc(doc(as('ana'), 'opportunities/o1/applications/bruno')));
    await assertFails(getDoc(doc(as('adm2'), 'opportunities/o1/applications/bruno')));
    await assertFails(updateDoc(doc(as('bruno'), 'opportunities/o1/applications/bruno'), { status: 'selected' }));
    await assertSucceeds(updateDoc(doc(as('ana'), 'opportunities/o1/applications/bruno'), { status: 'selected', updatedAt: 'y' }));
});
test('anunciante não se candidata à própria oportunidade', async () => {
    await assertFails(setDoc(doc(as('ana'), 'opportunities/o1/applications/ana'), {
        id: 'ana', opportunityId: 'o1', opportunityTitle: 't', opportunityOwnerId: 'ana', applicantId: 'ana',
        applicantName: 'Ana', status: 'interested', createdAt: 'x', updatedAt: 'x',
    }));
});
test('denúncia só pode ser lida por quem denunciou e por admin', async () => {
    const r = { id: 'r1', targetType: 'opportunity', targetId: 'o1', reporterId: 'bruno', reason: 'Spam', status: 'open', createdAt: 'x' };
    await assertSucceeds(setDoc(doc(as('bruno'), 'reports/r1'), r));
    await assertFails(getDoc(doc(as('ana'), 'reports/r1')));
    await assertSucceeds(getDoc(doc(as('adm'), 'reports/r1')));
});

// ---- Descubra: matérias do Guia e curadoria ----
test('só o admin cria matéria do Guia (kind guia)', async () => {
    const post = { id: 'guia_x', kind: 'guia', title: 'T', authorId: 'adm', status: 'published' };
    await assertSucceeds(setDoc(doc(as('adm'), 'blog_posts/guia_x'), post));
    await assertFails(setDoc(doc(as('bruno'), 'blog_posts/guia_y'), { ...post, id: 'guia_y', authorId: 'bruno' }));
});
test('qualquer visitante lê matérias do Guia', async () => {
    await env.withSecurityRulesDisabled(async (ctx) => { await setDoc(doc(ctx.firestore(), 'blog_posts/guia_x'), { kind: 'guia', title: 'T', status: 'published' }); });
    await assertSucceeds(getDocs(query(collection(as(null), 'blog_posts'), where('kind', '==', 'guia'))));
});
test('dono da empresa NÃO altera experienceTags (curadoria é do admin)', async () => {
    await assertFails(updateDoc(doc(as('ana'), 'businesses/ana'), { experienceTags: ['gratuito'] }));
    await assertSucceeds(updateDoc(doc(as('adm'), 'businesses/ana'), { experienceTags: ['gratuito'] }));
});
