/**
 * Pagamentos (PagBank) — PREPARADO, MAS DESATIVADO POR PADRÃO.
 *
 * Regras desta etapa (ver docs/PAGAMENTOS.md):
 * - Sem PAYMENTS_ENABLED=true, nenhuma cobrança é criada e nenhum plano é ativado.
 * - Não existe "pagamento direto"/bypass: nada é aprovado sem o PagBank.
 * - O preço vem SEMPRE do plano gravado no Firestore, nunca do navegador.
 * - O webhook só ativa um plano depois de:
 *     1. conferir a assinatura (x-authenticity-token = SHA-256 de "<token>-<corpo>"), e
 *     2. consultar o pedido na API do PagBank e confirmar status PAID e valor correto.
 */
import { createHash, timingSafeEqual } from 'crypto';
import { adminDb, verifyRequestUser } from './firebaseAdmin.js';
import { Req, Res, sendJson, readJsonBody, readRawBody, methodNotAllowed } from './http.js';

export const paymentsEnabled = () => process.env.PAYMENTS_ENABLED === 'true' && !!process.env.PAGBANK_TOKEN;

const pagbankBaseUrl = () => process.env.PAGBANK_ENV === 'production'
    ? 'https://api.pagseguro.com'
    : 'https://sandbox.api.pagseguro.com';

const REFERENCE_SEPARATOR = ':';

/** Contrato do campo reference (ver SAFETY_PROTOCOL.md): userId:businessId:planId */
export const buildReference = (userId: string, businessId: string, planId: string) =>
    [userId, businessId, planId].join(REFERENCE_SEPARATOR);

export const parseReference = (reference: string) => {
    const [userId, businessId, planId] = (reference || '').split(REFERENCE_SEPARATOR);
    if (!userId || !businessId || !planId) return null;
    return { userId, businessId, planId };
};

export const isValidPagbankSignature = (rawBody: string, signature: string | undefined, token: string) => {
    if (!signature || !token) return false;
    const expected = createHash('sha256').update(`${token}-${rawBody}`).digest('hex');
    const a = Buffer.from(expected, 'utf8');
    const b = Buffer.from(signature.trim().toLowerCase(), 'utf8');
    return a.length === b.length && timingSafeEqual(a, b);
};

/** POST /api/create-checkout-session — exige login (Firebase ID token) e dono da empresa. */
export const handleCreateCheckout = async (req: Req, res: Res) => {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    if (!paymentsEnabled()) {
        return sendJson(res, 503, {
            error: 'Pagamentos online ainda não estão ativos. Fale com a equipe Lagos GO para contratar um plano.'
        });
    }
    const token = await verifyRequestUser(req.headers.authorization);
    if (!token) return sendJson(res, 401, { error: 'Faça login para continuar.' });

    try {
        const { planId, businessId } = await readJsonBody<{ planId?: string; businessId?: string }>(req);
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

        const baseUrl = process.env.APP_URL;
        if (!baseUrl) return sendJson(res, 500, { error: 'APP_URL não configurada no servidor.' });

        const payload = {
            reference_id: buildReference(token.uid, businessId, planId),
            customer: {
                name: (userSnap.data()?.name as string) || 'Cliente Lagos GO',
                email: token.email,
            },
            items: [{
                reference_id: planId,
                name: `Plano ${plan.name} - ${plan.period === 'yearly' ? 'Anual' : 'Mensal'}`,
                quantity: 1,
                unit_amount: Math.round(price * 100), // centavos
            }],
            payment_methods: [{ type: 'CREDIT_CARD' }, { type: 'BOLETO' }, { type: 'PIX' }],
            redirect_url: `${baseUrl}/admin-dashboard?plan_id=${encodeURIComponent(planId)}&status=success`,
            notification_urls: [`${baseUrl}/api/webhook`],
            payment_notification_urls: [`${baseUrl}/api/webhook`],
        };

        const response = await fetch(`${pagbankBaseUrl()}/checkouts`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${process.env.PAGBANK_TOKEN}`,
                'Content-Type': 'application/json',
                accept: 'application/json',
            },
            body: JSON.stringify(payload),
        });
        const data: any = await response.json();
        if (!response.ok) {
            console.error('[payments] PagBank recusou o checkout:', data);
            return sendJson(res, 502, { error: data?.error_messages?.[0]?.description || 'Erro ao criar o checkout no PagBank.' });
        }
        const checkoutUrl = (data.links || []).find((l: any) => l.rel === 'PAY')?.href;
        return sendJson(res, 200, { id: data.id, url: checkoutUrl });
    } catch (error) {
        console.error('[payments] Erro no checkout:', error);
        return sendJson(res, 500, { error: 'Erro interno ao iniciar o pagamento.' });
    }
};

/** Consulta o pedido no PagBank para confirmar pagamento e valor (não confiamos só no corpo do webhook). */
const fetchPaidOrder = async (orderId: string) => {
    const response = await fetch(`${pagbankBaseUrl()}/orders/${encodeURIComponent(orderId)}`, {
        headers: { Authorization: `Bearer ${process.env.PAGBANK_TOKEN}`, accept: 'application/json' },
    });
    if (!response.ok) return null;
    return response.json() as Promise<any>;
};

/** POST /api/webhook — notificação do PagBank. */
export const handleWebhook = async (req: Req, res: Res) => {
    if (req.method !== 'POST') return methodNotAllowed(res, ['POST']);
    if (!paymentsEnabled()) {
        // Responde 200 para o PagBank não ficar reenviando, mas não ativa nada.
        return sendJson(res, 200, { received: true, processed: false, reason: 'payments_disabled' });
    }

    const raw = await readRawBody(req);
    const signature = req.headers['x-authenticity-token'];
    const token = process.env.PAGBANK_TOKEN || '';
    if (!isValidPagbankSignature(raw, Array.isArray(signature) ? signature[0] : signature, token)) {
        console.warn('[webhook] assinatura inválida — notificação ignorada');
        return sendJson(res, 401, { error: 'Assinatura inválida.' });
    }

    let payload: any;
    try {
        payload = JSON.parse(raw);
    } catch {
        return sendJson(res, 400, { error: 'JSON inválido.' });
    }

    try {
        const orderId: string | undefined = payload?.id;
        if (!orderId) return sendJson(res, 200, { received: true, processed: false, reason: 'no_order_id' });

        const order = await fetchPaidOrder(orderId);
        const charge = order?.charges?.find((c: any) => c.status === 'PAID');
        if (!order || !charge) return sendJson(res, 200, { received: true, processed: false, reason: 'not_paid' });

        const ref = parseReference(order.reference_id);
        if (!ref) return sendJson(res, 200, { received: true, processed: false, reason: 'bad_reference' });

        const db = adminDb();
        const planSnap = await db.collection('pricingPlans').doc(ref.planId).get();
        if (!planSnap.exists) return sendJson(res, 200, { received: true, processed: false, reason: 'unknown_plan' });
        const plan = planSnap.data() || {};
        const expectedCents = Math.round(Number(plan.price) * 100);
        const paidCents = Number(charge.amount?.value ?? charge.amount?.summary?.paid ?? 0);
        if (paidCents < expectedCents) {
            console.warn('[webhook] valor pago menor que o plano', { paidCents, expectedCents, orderId });
            return sendJson(res, 200, { received: true, processed: false, reason: 'amount_mismatch' });
        }

        // Idempotência: um pedido ativa o plano uma única vez.
        const paymentRef = db.collection('payments').doc(orderId);
        const already = await paymentRef.get();
        if (already.exists) return sendJson(res, 200, { received: true, processed: false, reason: 'already_processed' });

        const ends = new Date();
        if (plan.period === 'yearly') ends.setFullYear(ends.getFullYear() + 1);
        else ends.setMonth(ends.getMonth() + 1);

        const batch = db.batch();
        batch.set(paymentRef, {
            orderId, chargeId: charge.id, userId: ref.userId, businessId: ref.businessId, planId: ref.planId,
            amountCents: paidCents, processedAt: new Date().toISOString(),
        });
        batch.set(db.collection('businesses').doc(ref.businessId), {
            plan: ref.planId, planId: ref.planId, isFeatured: !!plan.isFeatured,
            paymentSubscriptionStatus: 'active', subscriptionEndsAt: ends.toISOString(),
        }, { merge: true });
        batch.set(db.collection('users').doc(ref.userId), {
            plan: plan.name, paymentSubscriptionStatus: 'active',
        }, { merge: true });
        await batch.commit();
        return sendJson(res, 200, { received: true, processed: true });
    } catch (error) {
        console.error('[webhook] erro ao processar:', error);
        return sendJson(res, 500, { error: 'Erro ao processar notificação.' });
    }
};
