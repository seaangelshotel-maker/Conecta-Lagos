# Lagos GO

Ecossistema digital da Região dos Lagos (RJ): conecta moradores, turistas, empresas e parceiros.
Guia de lugares, cupons, Ajuda Colaborativa (trabalhos, diárias e colaborações), registro de
conexões e atendimento especializado. Funciona como app instalável (PWA).

## Stack

React 18 + TypeScript (Vite), Firebase (Auth + Firestore), funções serverless na Vercel (`api/`),
Tailwind via CDN.

## Rodar localmente

```bash
npm install
cp .env.example .env     # opcional para o app; necessário para /api
npm run dev              # app + /api em http://localhost:3000
npm test                 # regras de negócio
npm run build            # build de produção em dist/
```

## Estrutura

| Pasta | Conteúdo |
| --- | --- |
| `pages/`, `components/` | Telas e componentes (`components/ui/States.tsx`: estados e campos padrão) |
| `services/` | Acesso a dados (`dataService`, `opportunityService`, `interactionService`) e regras puras (`opportunityRules`) |
| `api/`, `server/` | Funções serverless (pagamentos desativados, webhook, IA) |
| `public/` | PWA: manifest, service worker, ícones, página offline |
| `firestore.rules`, `firestore.indexes.json` | Segurança e índices (publicar com Firebase CLI) |
| `tests/` | Testes unitários, de regras (emulador) e de navegador |
| `docs/` | Auditoria, migração para a Vercel, pagamentos, Guida Trips, testes |

## Leitura obrigatória antes de alterar

1. `SAFETY_PROTOCOL.md`
2. `docs/AUDITORIA.md`
3. `docs/MIGRACAO_VERCEL.md` (antes de qualquer deploy)
