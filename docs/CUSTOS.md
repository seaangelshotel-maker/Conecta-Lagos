# Custos e proteção contra abuso (Firebase / Vercel)

Última revisão: 2026-11-11. No Firestore você paga por **documento lido/gravado**; no Vercel, por requisições e tempo de função. O risco é um robô ou script usando a chave pública do app para ler/gravar sem parar. O que já está no código e o que só você faz no console:

## 1. Já no código (sem perder nenhuma funcionalidade)
- **Cache no aparelho** (`services/readCache.ts`): a lista de empresas fica 10 min e os perfis públicos 30 min no navegador de visitantes e clientes. Quem volta ao site não relê o banco inteiro. Empresa e admin sempre leem dados frescos.
- **Freio de analytics** (`services/throttle.ts`): o mesmo clique em menos de 3 s conta uma vez; máximo 120 eventos por 10 min por aparelho. O clique em si (abrir WhatsApp etc.) nunca é bloqueado.
- **Limites nas consultas** (cupons 100, posts 40/100, empresas da Home 20/50) e visualizações contadas uma vez por sessão.
- **Regras do banco** validam tamanho e campos de tudo que visitante ou usuário grava (comentários 1000 caracteres, denúncias, pedidos, interações, tokens de push).
- **App Check pronto** (`services/firebase.ts`): liga sozinho quando existir `VITE_APPCHECK_SITE_KEY`. Sem a chave, nada muda.
- **Busca de SEO e sitemap** usam cache de borda na Vercel, então robôs de busca não geram leitura no Firestore a cada visita.

## 2. O que só o Yuri faz no console (em ordem de importância)
1. **Alerta de orçamento** (Google Cloud → Faturamento → Orçamentos e alertas): crie um orçamento mensal (ex.: R$ 100) com avisos em 50%, 90% e 100% para o seu e-mail. Isso avisa antes de virar susto.
2. **Restringir a chave de API** (Google Cloud → APIs e serviços → Credenciais → chave "Browser key" do projeto `conectario-dd04b`): em "Restrições de aplicativo" escolha *Sites (HTTP referrers)* e liste `https://lagosgo.com.br/*`, `https://www.lagosgo.com.br/*`, `https://conecta-lagos-one.vercel.app/*`, `https://conectario-dd04b.firebaseapp.com/*` (tela de login Google do Firebase) e `http://localhost:*`. O servidor de SEO/sitemap da Vercel também usa essa chave e já envia o Referer `https://lagosgo.com.br/` (`fsFetch` em `server/seo.ts`); sem isso a restrição bloquearia o sitemap. Em "Restrições de API", deixe só as APIs que o app usa (Identity Toolkit, Firestore, FCM Registrations, Firebase Installations). Atenção: confira o login Google depois.
3. **App Check**:
   - Firebase Console → App Check → Apps → app Web → registrar em **Fraud Defense (reCAPTCHA Enterprise)** com a chave "Lagos GO" (Google Cloud → Segurança → Fraud Defense → Keys; domínios lagosgo.com.br e conecta-lagos-one.vercel.app). O código usa `ReCaptchaEnterpriseProvider`. Não clique em "Impor" antes de 1–2 dias de tráfego verificado.
   - Na Vercel, adicione a variável `VITE_APPCHECK_SITE_KEY` com a chave do site e faça um novo deploy.
   - Deixe 1 a 2 dias em modo **não imposto** olhando o painel (a maioria dos pedidos deve aparecer como "verificado"). Só então clique em **Impor** para Firestore. Impor antes de configurar a chave derruba o site.
4. **Cotas do Firestore**: Google Cloud → IAM e administrador → Cotas → filtre "Firestore" e defina um teto diário de leituras (ex.: 2 milhões/dia no começo). É um freio de emergência: se estourar, o site para de ler até o dia seguinte, mas você não recebe uma fatura gigante.
5. **Autenticação**: Firebase → Authentication → Configurações → *Proteção contra abuso* e limites de SMS desligados (o app não usa SMS). Em Domínios autorizados, deixe só os domínios reais.
6. **Vercel**: ligue *Spend Management* (limite de gastos) e o *Attack Challenge Mode* só se houver ataque. O cron `expire-plans` e as funções de SEO já têm cache.

## 3. Como saber se algo está errado
- Firebase Console → Firestore → Uso: leituras/dia. Referência saudável no início: algumas dezenas de milhares. Salto de 10x sem campanha = investigar.
- Admin → SEO e Analytics mostram o tráfego real; se leituras sobem sem visitas, é robô: aplique o passo 3 (App Check) e o 2 (chave restrita).

## 4. Limites conhecidos
- Comentário de visitante (sem login) e eventos de interação anônimos continuam permitidos de propósito (é função do produto). Com App Check imposto, só o seu site consegue gravá-los.
- As regras do Firestore não têm limite de frequência por si só; o freio fica no navegador (acima) e no App Check.
- Os 7 ouvintes em tempo real de listas pequenas (cidades, categorias, planos, destaques, bairros, coleções) custam poucos documentos por visita; só vale cachear se o admin passar a editar muito raramente.
