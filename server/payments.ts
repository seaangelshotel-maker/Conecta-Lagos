/**
 * Pagamentos (Asaas) — PREPARADO, MAS DESATIVADO POR PADRÃO.
 *
 * Regras (ver docs/PAGAMENTOS.md):
 * - Sem PAYMENTS_ENABLED=true + ASAAS_API_KEY + ASAAS_WEBHOOK_TOKEN, nenhuma cobrança é criada e nenhum plano é ativado.
 * - Não existe "pagamento direto"/bypass: nada é aprovado sem o Asaas.
 * - O preço vem SEMPRE do plano gravado no Firestore (pricingPlans), nunca do navegador.
 * - O webhook só ativa um plano depois de:
 *     1. conferir o token do cabeçalho asaas-access-token, e
 *     2. consultar a cobrança na API do Asaas e confirmar status pago e valor correto.
 * - Planos, preços, periodicidade, split e regras comerciais NÃO são definidos aqui.
 */
import { adminDb, verifyRequestUser } from './firebaseAdmin.js';
import { Req, Res, sendJson, readJsonBody, readRawBody, methodNotAllowed } from './http.js';
import {
    asaasBaseUrl, asaasConfigured, buildReference, parseReference, isValidWebhookToken,
    PAID_STATUSES, PAID_EVENTS, REVERSAL_EVENTS, cleanCpfCnpj, toCents, dueDate, planEndsAt,
} from './asaasCore.js';

export { buildReference, parseReference };
export const paymentsEnabled = () => asaasConfigured();
export const paymentsProvider = 'asaas';

const asaas = async (path: string, init: RequestInit = {}) => {
    const r = await fetch(`${asaasBaseUrl()}${path}`, {
        ...init,
        headers: {
            'Content-Type': 'application/json', accept: 'application/json', 'User-Agent': 'LagosGO/1.0',
            access_token: process.env.ASAAS_API_KEY || '', ...(init.headers || {}),
        },
    });
    const data: any = await r.json().catch(() => ({}));
    return { ok: r.ok, status: r.status, data };
};

/** POST /api/create-checkout-session — exige login (Firebase ID token) e ser responsável pela empresa.
 *  Corpo: { planId, businessId, cpfCnpj? }. Responde { id, url } com a fatura do Asaas (PIX, boleto ou cartão). */
export const handleCreateCheckout = async (req: Req, res: Res) => {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    if (!paymentsEnabled()) {
        return sendJson(res, 503, { error: 'Pagamentos online ainda não estão ativos. Fale com a equipe Lagos GO para contratar um plano.' });
    }
    const token = await verifyRequestUser(req.headers.authorization);
    if (!token) return sendJson(res, 401, { error: 'Faça login para continuar.' });

    try {
        const { planId, businessId, cpfCnpj } = await readJsonBody<{ planId?: string; businessId?: string; cpfCnpj?: string }>(req);
        if (!planId || !businessId) return sendJson(res, 400, { error: 'Plano e empresa são obrigatórios.' });

        const db = adminDb();
        const [planSnap, bizSnap, userSnap] = await Promise.all([
            db.collection('pricingPlans').doc(planId).get(),
            db.collection('businesses').doc(businessId).get(),
            db.collection('users').doc(token.uid).get(),
        ]);
        if (!planSnap.exists || planSnap.data()?.active === false) return sendJson(res, 404, { error: 'Plano indisponível.' });
        if (!bizSnap.exists) return sendJson(res, 404, { error: 'Empresa não encontrada.' });
        const biz = bizSnap.data() || {};
        const isOwner = businessId === token.uid || biz.ownerId === token.uid;
        if (!isOwner) return sendJson(res, 403, { error: 'Você não é responsável por esta empresa.' });

        const plan = planSnap.data() || {};
        const price = Number(plan.price);
        if (!(price > 0)) return sendJson(res, 400, { error: 'Plano sem preço configurado.' });

        // Cliente no Asaas (um por empresa), criado na primeira cobrança.
        let customerId: string | undefined = biz.paymentCustomerId;
        if (!customerId) {
            const doc = cleanCpfCnpj(cpfCnpj) || cleanCpfCnpj(biz.cpfCnpj) || cleanCpfCnpj(biz.cnpj);
            if (!doc) return sendJson(res, 400, { error: 'Informe o CPF ou CNPJ do responsável para emitir a cobrança.', needCpfCnpj: true });
            const c = await asaas('/customers', {
                method: 'POST',
                body: JSON.stringify({
                    name: biz.name || (userSnap.data()?.name as string) || 'Cliente Lagos GO',
                    cpfCnpj: doc, email: token.email || undefined, mobilePhone: biz.whatsapp || biz.phone || undefined,
                    externalReference: businessId, notificationDisabled: false,
                }),
            });
            if (!c.ok || !c.data?.id) return sendJson(res, 502, { error: c.data?.errors?.[0]?.description || 'Não foi possível cadastrar o cliente no Asaas.' });
            customerId = c.data.id as string;
            await db.collection('businesses').doc(businessId).set({ paymentCustomerId: customerId }, { merge: true });
        }

        const p = await asaas('/payments', {
            method: 'POST',
            body: JSON.stringify({
                customer: customerId,
                billingType: 'UNDEFINED', // a pessoa escolhe PIX, boleto ou cartão na fatura
                value: price,
                dueDate: dueDate(3),
                description: `Lagos GO — Plano ${plan.name} (${plan.period === 'yearly' ? 'anual' : 'mensal'}) — ${biz.name || businessId}`,
                externalReference: buildReference(token.uid, businessId, planId),
            }),
        });
        if (!p.ok || !p.data?.invoiceUrl) {
            console.error('[payments] Asaas recusou a cobrança:', p.status, p.data?.errors);
            return sendJson(res, 502, { error: p.data?.errors?.[0]?.description || 'Erro ao criar a cobrança no Asaas.' });
        }
        await db.collection('payment_intents').doc(p.data.id).set({
            provider: 'asaas', paymentId: p.data.id, userId: token.uid, businessId, planId, valueCents: toCents(price),
            status: p.data.status, createdAt: new Date().toISOString(),
        });
        return sendJson(res, 200, { id: p.data.id, url: p.data.invoiceUrl });
    } catch (error) {
        console.error('[payments] Erro no checkout:', error);
        return sendJson(res, 500, { error: 'Erro interno ao iniciar o pagamento.' });
    }
};

/** POST /api/webhook — eventos de cobrança do Asaas. */
export const handleWebhook = async (req: Req, res: Res) => {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    if (!paymentsEnabled()) return sendJson(res, 200, { received: true, processed: false, reason: 'payments_disabled' });

    if (!isValidWebhookToken(req.headers['asaas-access-token'], process.env.ASAAS_WEBHOOK_TOKEN)) {
        console.warn('[webhook] token inválido — notificação ignorada');
        return sendJson(res, 401, { error: 'Token inválido.' });
    }

    let payload: any;
    try { payload = JSON.parse(await readRawBody(req)); } catch { return sendJson(res, 400, { error: 'JSON inválido.' }); }
    const event: string = payload?.event || '';
    const paymentId: string | undefined = payload?.payment?.id;
    if (!paymentId) return sendJson(res, 200, { received: true, processed: false, reason: 'no_payment' });

    try {
        const db = adminDb();
        const paymentRef = db.collection('payments').doc(`asaas_${paymentId}`);

        if (REVERSAL_EVENTS.includes(event)) {
            // Estorno/contestação: registra e avisa o admin; a decisão sobre o plano é humana.
            await paymentRef.set({ reversal: { event, at: new Date().toISOString() } }, { merge: true });
            await db.collection('payment_events').add({ provider: 'asaas', event, paymentId, at: new Date().toISOString() });
            return sendJson(res, 200, { received: true, processed: true, reason: 'reversal_recorded' });
        }
        if (!PAID_EVENTS.includes(event)) return sendJson(res, 200, { received: true, processed: false, reason: 'ignored_event' });

        // Não confiamos só no corpo: consultamos a cobrança na API.
        const p = await asaas(`/payments/${encodeURIComponent(paymentId)}`);
        if (!p.ok || !PAID_STATUSES.includes(p.data?.status)) return sendJson(res, 200, { received: true, processed: false, reason: 'not_paid' });

        const ref = parseReference(p.data.externalReference);
        if (!ref) return sendJson(res, 200, { received: true, processed: false, reason: 'bad_reference' });

        const planSnap = await db.collection('pricingPlans').doc(ref.planId).get();
        if (!planSnap.exists) return sendJson(res, 200, { received: true, processed: false, reason: 'unknown_plan' });
        const plan = planSnap.data() || {};
        const paidCents = toCents(p.data.value);
        if (paidCents < toCents(plan.price)) {
            console.warn('[webhook] valor pago menor que o plano', { paidCents, paymentId });
            return sendJson(res, 200, { received: true, processed: false, reason: 'amount_mismatch' });
        }

        // Idempotência: uma cobrança ativa o plano uma única vez.
        const already = await paymentRef.get();
        if (already.exists && already.data()?.processedAt) return sendJson(res, 200, { received: true, processed: false, reason: 'already_processed' });

        const bizRef = db.collection('businesses').doc(ref.businessId);
        const biz = (await bizRef.get()).data() || {};
        const ends = planEndsAt(plan.period, biz.planId === ref.planId ? biz.subscriptionEndsAt : undefined);

        const batch = db.batch();
        batch.set(paymentRef, {
            provider: 'asaas', paymentId, event, status: p.data.status, billingType: p.data.billingType,
            userId: ref.userId, businessId: ref.businessId, planId: ref.planId, amountCents: paidCents,
            processedAt: new Date().toISOString(),
        }, { merge: true });
        batch.set(bizRef, {
            plan: ref.planId, planId: ref.planId, isFeatured: !!plan.isFeatured,
            paymentSubscriptionStatus: 'active', subscriptionEndsAt: ends,
        }, { merge: true });
        batch.set(db.collection('users').doc(ref.userId), { plan: plan.name, paymentSubscriptionStatus: 'active' }, { merge: true });
        batch.set(db.collection('payment_intents').doc(paymentId), { status: p.data.status, paidAt: new Date().toISOString() }, { merge: true });
        await batch.commit();
        return sendJson(res, 200, { received: true, processed: true });
    } catch (error) {
        console.error('[webhook] erro ao processar:', error);
        return sendJson(res, 500, { error: 'Erro ao processar notificação.' });
    }
};
