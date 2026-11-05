# 🛡️ PROTOCOLO DE SEGURANÇA E INTEGRIDADE - LAGOS GO

Este documento é a "Constituição" da Lagos GO. Qualquer alteração no código deve respeitar estas regras para evitar quebras em produção e perda de dados históricos.

**Fonte da verdade das permissões: `firestore.rules`.** O frontend só melhora a experiência; nunca é a barreira de segurança.

## 1. 🎟️ CUPONS E OFERTAS (Regra de Ouro)
*   **Compatibilidade Legada:** Cupons sem o campo `status` ou `active` DEVEM ser tratados como **Aprovados** e **Ativos**.
*   **Filtros de Exibição:** Nunca use filtros estritos como `c.status === 'approved'`. Use: `!c.status || c.status === 'approved'`.
*   **Criação:** cupom de empresa nasce `pending` com `currentRedemptions: 0`. Só admin aprova.
*   **Resgate:** `redeemCoupon` valida limites; o contador só sobe de 1 em 1 (regra). O código de verificação de 6 dígitos fica no resgate e no histórico do usuário (`verificationCode`).
*   **Vínculo:** `companyId` = ID da empresa.

## 2. 🏢 EMPRESAS E GUIA COMERCIAL
*   **Dono da empresa:** legado (`businesses/{id}` com `id == uid`) **ou** campo `ownerId`. Use `isOwnerOfBusiness()`.
*   **Campos protegidos** (só admin/servidor): `isFeatured, plan, planId, status, isBlocked, payment*, subscriptionEndsAt, ownerId, rating, reviewCount, reviews, views, shares, actionCounts, isClaimed, canBeClaimed, active, id`. Lista espelhada em `BUSINESS_PROTECTED_KEYS` (dataService) e nas regras.
*   **Plano:** gravado pelo **ID** do plano. Ao ler, aceite ID ou nome (dados antigos).
*   **Planos de assinatura:** empresas sem plano não são ocultadas do guia.
*   **Bloquear/excluir empresa** não bloqueia nem apaga a conta da pessoa.

## 3. 💳 PAGAMENTOS (PagBank)
*   **Desativados por padrão** (`PAYMENTS_ENABLED`). Não existe bypass. Ver `docs/PAGAMENTOS.md`.
*   Preço sempre lido do Firestore no servidor. `reference_id` = `userId:businessId:planId`.
*   Webhook: assinatura + consulta do pedido no PagBank + idempotência (`payments/{orderId}`).
*   **Nunca** ative plano a partir de parâmetros de URL ou de qualquer dado vindo do navegador.

## 4. 👤 USUÁRIOS, LOGIN E PERMISSÕES
*   **Papéis:** `CUSTOMER`, `COMPANY`, `JOURNALIST`, `CONTENT_CREATOR`, `SUPER_ADMIN` (enum `UserRole` em `types.ts`). Não renomeie.
*   **Identidade única:** a mesma conta pode ser moradora/turista (`profileTypes`), dona de empresa e anunciante de oportunidades.
*   **Autoedição:** o usuário só altera `USER_SELF_EDITABLE_KEYS`. Única mudança de papel permitida a ele: `CUSTOMER → COMPANY` depois de cadastrar a própria empresa.
*   **Admin:** `role == SUPER_ADMIN` ou e-mail fundador **verificado**.
*   **Senhas:** nunca gravar senha no Firestore. Sem senha mestra. Redefinição só pelo e-mail do Firebase.
*   **PII:** `users/{uid}` é lido só pelo próprio usuário e admins. Dados públicos de autores ficam em `public_profiles` (sem e-mail/telefone).

## 5. 🚀 DESTAQUES E COLEÇÕES (Home)
*   A Home depende de `home_highlights`; se vazia, há fallback visual.
*   Filtragem por `collectionId` preservada.

## 6. 🤝 AJUDA COLABORATIVA
*   Coleções: `opportunities`, `opportunities/{id}/applications/{uid}`, `opportunities/{id}/history`, `rateLimits/{uid}`, `reports`.
*   Publicação sempre em lote com `rateLimits/{uid}` (antispam de 1/minuto exigido pelas regras).
*   Status: `draft → published → in_progress → filled/closed/cancelled` (transições em `opportunityRules.ts` e nas regras — mantenha iguais).
*   Disponível ao público = `published|in_progress`, `isHidden == false` e data não vencida.
*   Contato do candidato: só anunciante, candidato e admin. Não prometer vínculo empregatício ou garantia.
*   Moderação: admin oculta (`isHidden` + motivo), nunca apaga publicações de terceiros.

## 7. 📊 REGISTRO DE CONEXÕES
*   Eventos em `interactions` (somente criação). Não guardar nome, e-mail, telefone, UID ou IP.
*   `ownerId` do evento precisa ser o dono real da entidade (validado nas regras).
*   Painéis mostram apenas números reais; nada de estimativas apresentadas como dados.

## 8. 🛠️ ARQUITETURA E PERFORMANCE
*   `dataService.ts` centraliza o acesso ao banco; novas áreas têm serviço próprio (`opportunityService`, `interactionService`).
*   Telas carregadas sob demanda (`React.lazy` em `App.tsx`).
*   Segredos só no servidor (`api/`, `server/`). Variáveis `VITE_*` são públicas.

## 9. 🎨 IDENTIDADE VISUAL E UX
*   Cores do tema: `ocean-*`, `gold-*` (configuração do Tailwind no `index.html`).
*   **Mobile-first**, abas inferiores fixas. Barras fixas acima das abas usam a classe `above-bottom-nav` (não use `env()` dentro de classes arbitrárias do Tailwind — gera CSS inválido).
*   Todo carregamento tem estado de carregando, vazio e erro (`components/ui/States.tsx`).

---
**IMPORTANTE:** antes de cada alteração, rode `npm test` e, ao mexer em regras, `npm run test:rules`.
