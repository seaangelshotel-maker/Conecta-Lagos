# Migração para um novo projeto na Vercel

Guia para publicar a Lagos GO em um projeto **independente** na Vercel, mantendo o
mesmo projeto Firebase (`conectario-dd04b`). Nada aqui apaga dados ou desativa a
infraestrutura atual.

> **Ordem importa.** As novas regras do Firestore fecham brechas que a versão
> antiga do site usa (senha mestra, ativação de plano pela URL, leitura de todos
> os usuários). Publique as regras **junto** com o novo site e aponte o domínio
> para ele. Veja a seção 7.

---

## 1. Criar o novo projeto na Vercel

1. Em vercel.com → **Add New… → Project** → importe o repositório `yuriguida30/conectario`.
2. Branch de produção: a branch que contém esta versão (`lagos-go-evolucao`, ou `main` depois do merge).
3. Configurações de build (o `vercel.json` já define, confira):
   - **Framework Preset:** Vite
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
   - **Install Command:** `npm install` (padrão)
   - **Node.js:** 20.x ou 22.x
4. Ainda **não** conecte o domínio principal. Use primeiro a URL `*.vercel.app` para validar (seção 7).

O que a Vercel publica:
- `dist/` — o app (arquivos estáticos, PWA, service worker).
- `api/*.ts` — funções serverless: `/api/health`, `/api/webhook`, `/api/create-checkout-session`, `/api/ai/generate`.
- O `server.ts` (Express) **não** é usado na Vercel; serve só para rodar localmente.

## 2. Variáveis de ambiente

Cadastre em **Settings → Environment Variables** (ambiente *Production*; repita em *Preview* se quiser testar lá).

| Variável | Obrigatória | Onde é usada | Valor |
| --- | --- | --- | --- |
| `APP_URL` | Sim | Servidor | URL pública sem barra final, ex. `https://lagosgo.com.br` |
| `FIREBASE_SERVICE_ACCOUNT` | Para IA e pagamentos | Servidor | JSON completo da conta de serviço (Firebase Console → Configurações do projeto → Contas de serviço → Gerar nova chave privada). Cole o JSON inteiro em uma linha. |
| `FIREBASE_PROJECT_ID` | Não | Servidor | `conectario-dd04b` (padrão) |
| `GEMINI_API_KEY` | Para IA | Servidor | Chave do Google AI Studio. **Nunca** use o prefixo `VITE_`. |
| `PAYMENTS_ENABLED` | Não | Servidor | `false` (padrão). Só mude depois de ler `docs/PAGAMENTOS.md`. |
| `PAGBANK_ENV` | Não | Servidor | `sandbox` ou `production` |
| `PAGBANK_TOKEN` | Não | Servidor | Token do PagBank (somente com pagamentos ativos) |
| `VITE_FIREBASE_*` | Não | Navegador | Só se for apontar para **outro** projeto Firebase. Sem elas, o app usa `conectario-dd04b`. |

Variáveis **antigas que não devem ser recriadas**: `API_KEY`, `GEMINI_API_KEY_PESQU`,
`PAYMENT_TEST_MODE`, `PAGBANK_WEBHOOK_SECRET` (a validação do webhook agora usa o próprio
`PAGBANK_TOKEN`, como o PagBank especifica).

## 3. Firebase para o novo domínio

1. **Regras e índices** (a partir de um computador com o Firebase CLI logado na conta dona do projeto):
   ```bash
   npm i -g firebase-tools
   firebase login
   firebase use conectario-dd04b
   firebase deploy --only firestore:indexes     # primeiro: os índices levam alguns minutos para ficar prontos
   firebase deploy --only firestore:rules       # depois, no momento da troca (seção 7)
   ```
   Os arquivos usados são `firestore.rules` e `firestore.indexes.json` (via `firebase.json`).
2. Antes de publicar as regras, faça uma cópia das regras atuais: Firebase Console → Firestore → Regras → copie o texto para um arquivo. É o seu **rollback**.
3. Índices novos criados: `interactions (ownerId, entityId, day)`, `opportunities (status, isHidden, publishedAt)`,
   `opportunities (ownerId, updatedAt)`, `applications` (grupo de coleções: `applicantId, createdAt`) e
   `redemptions (companyId, redeemedAt)`. Confira em Firestore → Índices que todos estão **Ativados**.

## 4. Autenticação

1. Firebase Console → **Authentication → Settings → Authorized domains** → adicione:
   - o domínio `*.vercel.app` do novo projeto (para os testes);
   - o domínio definitivo (ex. `lagosgo.com.br` e `www.lagosgo.com.br`).
2. Provedores usados: **E-mail/senha** e **Google**. Nada muda neles.
3. **Senha mestra removida.** Quem entrava com `123456` ou com "senha manual" definida pelo admin
   precisa usar **"Esqueci minha senha"** na tela de login. O painel admin agora envia o e-mail
   oficial de redefinição (botão "SENHA" na lista de empresas).
4. Administradores: contas com `role: SUPER_ADMIN` no Firestore, ou os e-mails
   `sea.angelshotel@gmail.com` / `admin@lagosgo.org` **com e-mail verificado** (login Google conta como verificado).

## 5. Serviços externos

| Serviço | Situação | O que fazer |
| --- | --- | --- |
| Gemini (IA do painel admin) | Agora roda no servidor (`/api/ai/generate`), só para admins | Definir `GEMINI_API_KEY` e `FIREBASE_SERVICE_ACCOUNT`. Sem elas, a IA mostra "indisponível" e o resto funciona. |
| PagBank | Preparado, **desativado** | Nada nesta etapa. Ver `docs/PAGAMENTOS.md`. |
| Tailwind (CDN), Leaflet (unpkg), Google Fonts | Carregados por CDN | Nada. O service worker guarda cópia para uso offline. |
| Domínio | `lagosgo.com.br` (metatags no `index.html`) | Conectar no novo projeto só na troca (seção 7). |
| Webhook PagBank | URL nova: `https://SEU_DOMINIO/api/webhook` | Só cadastrar no PagBank quando os pagamentos forem ativados. |

## 6. Build

Local (precisa de Node 20+):
```bash
npm install
npm run build        # gera dist/
npm run preview      # serve dist/ em http://localhost:4173
npm test             # testes de regras de negócio (node:test)
```
Servidor local completo (com as rotas /api):
```bash
cp .env.example .env   # preencha
npm run dev            # http://localhost:3000
```

## 7. Validação depois da implantação

Faça nesta ordem, usando a URL `*.vercel.app`:

1. `GET /api/health` → `{"status":"ok", "paymentsEnabled": false, ...}`.
2. Abrir o site no celular: Início, Guia, Cupons, Ajuda, Perfil (abas inferiores).
3. Login com e-mail/senha e com Google (domínio autorizado — seção 4).
4. **Publicar as regras** (`firebase deploy --only firestore:rules`) e logo em seguida:
   - Ajuda Colaborativa: publicar uma oportunidade de teste, ver na lista, demonstrar interesse com outra conta, gerenciar, marcar como preenchida (some da lista), cancelar.
   - Página de uma empresa: clicar em WhatsApp; no painel da empresa os números de "Resultados reais" devem subir.
   - Resgatar um cupom: aparece o código de 6 dígitos; a empresa valida em "Resgates".
   - Avaliação: enviar, aprovar no admin (Avaliações), conferir na página da empresa.
   - Admin → Ecossistema: preencher o WhatsApp comercial e o atendimento especializado; clicar em
     **"Gerar perfis públicos dos autores"** (necessário para o blog mostrar autores).
   - Admin → Moderação: denúncia de teste aparece e pode ser resolvida.
5. Conferir o console do navegador (sem erros de `permission-denied` nos fluxos acima).
6. Instalar como app (Android: "Instalar"; iPhone: Compartilhar → Adicionar à Tela de Início).
7. Só então: **Settings → Domains** no novo projeto → adicionar o domínio e remover/redirecionar do projeto antigo.

**Rollback:** reverter o domínio para o projeto antigo e republicar as regras antigas guardadas no passo 3.2.
Nenhum dado foi apagado ou migrado de forma irreversível.
