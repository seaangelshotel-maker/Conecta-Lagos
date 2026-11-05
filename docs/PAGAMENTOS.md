# Pagamentos — estado atual e integração futura

**Estado:** preparado e **desativado**. A aplicação funciona normalmente sem nenhum sistema financeiro ativo.

## O que foi corrigido

| Problema encontrado | Correção |
| --- | --- |
| Checkout no servidor começava com `isTestMode = true` fixo: todo "pagamento" era aprovado na hora e a pessoa virava `COMPANY` com plano pago | Bypass removido. Sem `PAYMENTS_ENABLED=true` + `PAGBANK_TOKEN`, o checkout responde 503 e nada é ativado |
| Preço do plano vinha do navegador (`price` no corpo da requisição) | Preço lido do documento `pricingPlans/{id}` no Firestore |
| Webhook aceitava qualquer POST sem validar origem | Exige assinatura `x-authenticity-token` (SHA-256 de `token-corpo`) **e** consulta o pedido na API do PagBank para confirmar `PAID` e valor ≥ preço do plano |
| A URL `/admin-dashboard?status=success&plan_id=X` ativava o plano X no próprio navegador | Removido. Só mostra aviso; quem ativa é o admin ou o webhook validado |
| Regras do Firestore deixavam o dono da empresa gravar `plan`, `isFeatured`, `subscriptionEndsAt` | Campos protegidos; só admin (ou o servidor) altera |
| Toggle "Bypass (Pagamento Direto)" no admin | Removido da interface; o campo é ignorado |
| Reprocessar o mesmo pedido ativava o plano de novo | Idempotência pela coleção `payments/{orderId}` |

## Como os planos funcionam hoje

- Participação básica gratuita (parceiros fundadores).
- O **admin** atribui planos manualmente em *Empresas* (seletor de plano), que define `plan`, `isFeatured` e `subscriptionEndsAt`.
- "Anuncie conosco" e a página de planos levam ao **WhatsApp comercial** configurado em *Admin → Ecossistema*.

## Contrato do campo `reference_id` (PagBank)

`userId:businessId:planId` — gerado pelo servidor (antes eram 4 partes com o nome do plano;
o nome não é mais usado porque o servidor relê o plano no Firestore).

## Para ativar no futuro (checklist)

1. Definir a política comercial (o que é pago, quanto, quando) — ainda não decidido.
2. Testar em `PAGBANK_ENV=sandbox` com `PAGBANK_TOKEN` de sandbox.
3. Cadastrar a URL de notificação `https://SEU_DOMINIO/api/webhook` no PagBank.
4. Confirmar o formato atual da assinatura do webhook na documentação do PagBank
   (implementado: `sha256("<token>-<corpo bruto>")` no cabeçalho `x-authenticity-token`).
5. Criar no app o botão de checkout que chama `POST /api/create-checkout-session` com
   `Authorization: Bearer <Firebase ID token>` e corpo `{ planId, businessId }`.
6. `PAYMENTS_ENABLED=true` em produção só após o teste completo em sandbox.
7. Pendências não implementadas: renovação/expiração automática, cancelamento, reembolso,
   comissão e split (dependem de decisão comercial).
