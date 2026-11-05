# Testes

| Suíte | Comando | O que cobre | Status nesta entrega |
| --- | --- | --- | --- |
| Regras de negócio | `npm test` | Validação de oportunidades, transições de status, remuneração, filtros (`services/opportunityRules.ts`) | 7/7 passando |
| Navegador (E2E) | ver `tests/e2e/README.md` | Interface real no Chromium (iPhone 13 e desktop) com Firebase simulado: login e retorno à tela pedida, Ajuda Colaborativa completa (rascunho, publicar, filtros, busca, interesse, denúncia, gestão, preenchida, histórico), hub da conta, permissões de tela, WhatsApp e eventos da empresa, painel com dados reais, moderação, ecossistema, cupom (código de 6 dígitos), favorito, avaliação + aprovação, cadastro de empresa | 55/55 passando, 0 erros de console |
| Regras do Firestore | `npm run test:rules` | Privilégios, dados pessoais, planos/destaque, cupons, eventos, oportunidades, candidaturas, denúncias, antispam (`tests/rules/firestore.rules.spec.ts`) | **Escrita, ainda não executada** (o emulador não pôde ser baixado no ambiente de desenvolvimento). Rodar antes de publicar as regras. |

## Rodando os testes de regras

```bash
npm i -D @firebase/rules-unit-testing firebase-tools
npm run test:rules
```
Usa o emulador local (projeto fictício `lagosgo-rules-test`). Nunca toca em produção.

## Limitações conhecidas

- O E2E usa um Firestore simulado **sem** regras: valida telas e fluxo de dados, não permissões.
  As permissões são validadas pela suíte de regras.
- O build oficial (`npm run build` com Vite) não pôde ser executado no ambiente desta entrega
  (registro do npm bloqueado). O código foi empacotado com esbuild sem erros. Rode
  `npm install && npm run build` antes do deploy — a Vercel faz isso automaticamente.
