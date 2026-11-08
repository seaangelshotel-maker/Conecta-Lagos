# Pagamentos — Asaas (preparado, desligado por padrão)

**Estado:** código pronto para o Asaas, **desativado**. Nada é cobrado e nenhum plano é ativado sem as variáveis abaixo.
Planos, preços, periodicidade, split e regras comerciais **não** são definidos no código: o preço vem sempre de `pricingPlans/{id}` no Firestore (cadastrado pelo admin).

## Fluxo
1. Empresa logada chama `POST /api/create-checkout-session` com `Authorization: Bearer <Firebase ID token>` e `{ planId, businessId, cpfCnpj? }`.
2. Servidor confere login, posse da empresa e preço do plano; cria (uma vez) o cliente no Asaas e guarda `paymentCustomerId` na empresa.
3. Cria a cobrança (`billingType: UNDEFINED`: a pessoa escolhe PIX, boleto ou cartão na fatura), vencimento em 3 dias, `externalReference = userId:businessId:planId`. Responde `{ id, url }` (fatura do Asaas) e registra `payment_intents/{id}`.
4. Asaas chama `POST /api/webhook` com o cabeçalho `asaas-access-token`. O servidor:
   - confere o token (comparação em tempo constante);
   - para `PAYMENT_RECEIVED`/`PAYMENT_CONFIRMED`, **consulta a cobrança na API** e exige status pago e valor ≥ preço do plano;
   - ativa o plano uma única vez (`payments/asaas_<id>`), somando o período ao prazo vigente;
   - estornos e contestações só são registrados (`payment_events`); a decisão sobre o plano é do admin.

## Variáveis na Vercel
| Variável | Valor |
| --- | --- |
| `PAYMENTS_ENABLED` | `true` só depois do teste completo em sandbox |
| `ASAAS_API_KEY` | chave da API (sandbox primeiro) |
| `ASAAS_WEBHOOK_TOKEN` | token de 32 a 255 caracteres, sem espaços, definido ao criar o webhook |
| `ASAAS_ENV` | `sandbox` (padrão) ou `production` |
| `FIREBASE_SERVICE_ACCOUNT` | JSON da conta de serviço do Firebase (necessário para gravar no banco pelo servidor) |

## Ativação (checklist)
1. Conta Asaas aprovada; gerar chave de **sandbox**.
2. Criar webhook no Asaas apontando para `https://SEU_DOMINIO/api/webhook`, eventos de cobrança, com o token escolhido.
3. Configurar as variáveis acima na Vercel (sandbox) e publicar.
4. Testar: criar cobrança, pagar no sandbox, conferir plano ativado e `payments/asaas_<id>`.
5. Repetir com chave de produção e `ASAAS_ENV=production`.

## Pendências que dependem de decisão comercial
Assinaturas recorrentes automáticas, split/comissões, cancelamento, reembolso e botão de compra na interface.
