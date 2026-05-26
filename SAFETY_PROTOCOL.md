# 🛡️ PROTOCOLO DE SEGURANÇA E INTEGRIDADE - LAGOS GO

Este documento é a "Constituição" do Lagos GO. Qualquer alteração no código deve respeitar estas regras para evitar quebras em produção e perda de dados históricos acumulados durante todo o desenvolvimento.

## 1. 🎟️ CUPONS E OFERTAS (Regra de Ouro)
*   **Compatibilidade Legada:** Cupons sem o campo `status` ou `active` DEVEM ser tratados como **Aprovados** e **Ativos**. 
*   **Filtros de Exibição:** Nunca use filtros estritos como `c.status === 'approved'`. Use sempre lógica inclusiva: `!c.status || c.status === 'approved'`.
*   **Resgate:** O processo de resgate (`redeemCoupon`) deve sempre validar se o usuário já resgatou o cupom antes de incrementar o contador, para evitar abusos.
*   **Vínculo:** O `companyId` no cupom deve sempre corresponder ao `id` de uma empresa válida para que o nome da empresa apareça corretamente.

## 2. 🏢 EMPRESAS E GUIA COMERCIAL
*   **Vínculo de Dados:** A exibição de cupons depende do `companyId`. Alterar o ID ou a forma como as empresas são buscadas quebra a exibição dos cupons.
*   **Planos de Assinatura:** Empresas com planos `active` têm prioridade na listagem, mas empresas sem plano (legado) não devem ser ocultadas do guia, a menos que o usuário use filtros específicos.
*   **Geolocalização:** A lógica de `calculateDistance` e `identifyNeighborhood` é baseada em coordenadas fixas da Região dos Lagos. Não altere os raios de busca sem testar o impacto na funcionalidade "Perto de Mim".

## 3. 💳 PAGAMENTOS E PLANOS (PagBank)
*   **Webhooks (server.ts):** A rota `/api/webhook` processa o faturamento. O formato do `reference` (`userId:businessId:planId:planName`) é o contrato entre o checkout e o banco de dados. Qualquer mudança aqui quebra a ativação automática de planos.
*   **Checkout:** O `unit_amount` deve ser sempre em centavos (valor * 100).
*   **Ambiente:** Mantenha a distinção entre `sandbox` e `production` via `PAGBANK_ENV` e `PAGBANK_TOKEN`.
*   **Modo de Teste (Bypass):** Existe um modo de "Pagamento Direto (Bypass)" que pode ser ativado via variável de ambiente `PAYMENT_TEST_MODE=true` ou nas configurações de Admin (`isDirectPaymentTest`). Quando ativo, as transações NÃO passam pelo PagBank e são aprovadas instantaneamente. Use APENAS para testes e desative em produção.

## 4. 👤 USUÁRIOS, LOGIN E PERMISSÕES
*   **Roles Fixas:** `USER`, `COMPANY`, `JOURNALIST`, `ADMIN`, `SUPER_ADMIN`. Nunca altere estes nomes; eles controlam o acesso a todos os dashboards e permissões do Firestore.
*   **Login Google:** Deve sempre verificar a existência do usuário pelo `uid` ou `email` antes de criar um novo perfil, para preservar planos ativos e cupons já resgatados.
*   **PII (Privacidade):** Dados sensíveis de usuários (email, telefone) só devem ser acessíveis pelo próprio usuário ou pelo `SUPER_ADMIN`.

## 5. 🚀 DESTAQUES E COLEÇÕES (Home)
*   **Home Highlights:** A Home depende da coleção `home_highlights`. Se estiver vazia, deve haver um fallback visual (texto padrão) para não deixar a tela preta.
*   **Coleções:** As coleções agrupam empresas por tema. A lógica de filtragem por `collectionId` deve ser preservada para não quebrar os links de "Ver Mais".

## 6. 🛠️ ARQUITETURA E PERFORMANCE
*   **SWR e Cache:** Usamos SWR para sincronização. As chaves de cache (`useCoupons`, `useBusinesses`) devem ser mantidas para evitar loops de renderização infinitos.
*   **DataService:** O `dataService.ts` centraliza toda a lógica. Evite colocar lógica de banco de dados diretamente nos componentes para facilitar a manutenção.
*   **Debug Logs:** Use `console.log('DEBUG: ...')` para rastrear problemas em produção, mas remova-os após a correção.

## 7. 🎨 IDENTIDADE VISUAL E UX
*   **Tailwind:** Use as cores do tema (ex: `ocean-900`, `gold-500`) definidas no `tailwind.config`.
*   **Responsividade:** O projeto é "Mobile-First". Teste sempre como as mudanças aparecem em telas pequenas (iPhone SE/Android médio).

---
**IMPORTANTE:** Este protocolo reflete meses de aprendizado e correções de erros. Antes de cada alteração, verifique se a mudança viola qualquer um destes pontos.
