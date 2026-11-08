# Auditoria e evolução — novembro/2026

Branch: `lagos-go-evolucao`. Nenhuma alteração foi publicada nem aplicada ao banco de produção.

## 1. Vulnerabilidades encontradas e corrigidas

| # | Gravidade | Problema | Correção |
| --- | --- | --- | --- |
| 1 | Crítica | Login aceitava a senha `123456` para qualquer conta e "senhas manuais" gravadas em texto puro no Firestore | Login só pelo Firebase Auth; admin envia e-mail oficial de redefinição |
| 2 | Crítica | Regras permitiam ao usuário editar o próprio `role` → virar `SUPER_ADMIN` | Usuário só altera campos de perfil; papel/plano/permissões/bloqueio só por admin |
| 3 | Crítica | Checkout com bypass fixo ativava planos pagos sem cobrança; webhook sem validação; preço vindo do navegador | Ver `docs/PAGAMENTOS.md` |
| 4 | Crítica | `?status=success&plan_id=X` ativava plano pelo navegador | Removido |
| 5 | Alta | Admin por e-mail sem exigir e-mail verificado | Exige `email_verified` |
| 6 | Alta | Qualquer logado lia todos os usuários (e-mail, telefone); blog e páginas públicas baixavam a lista inteira | Leitura só própria/admin; blog usa `public_profiles` (sem contato) |
| 7 | Alta | Chave do Gemini embutida no JavaScript público | IA via `/api/ai/generate` com chave no servidor, só para admins |
| 8 | Média | Dono da empresa podia se dar destaque, plano, aprovação e notas | Campos protegidos nas regras e no código |
| 9 | Média | Qualquer logado podia pôr qualquer valor no contador de resgates | Só incremento de 1, respeitando o limite |
| 10 | Média | Empresa podia autoaprovar cupons e avaliações nasciam com qualquer status | Cupom/avaliação nascem pendentes |
| 11 | Baixa | Sem `.gitignore` (risco de publicar `.env` e `node_modules`) | Criado |

## 2. Funcionalidades: verificação e estado

Legenda: ✅ corrigido e testado no navegador · 🔧 corrigido (sem teste automatizado) · ✔ revisado, sem mudança · ⚠ pendente

| Funcionalidade | Estado | Observação |
| --- | --- | --- |
| Cadastro e autenticação | ✅ | Senha mestra removida; perfil base criado no 1º login; retorno à tela que pediu login |
| Perfis de usuários | ✅ | Hub da conta: moradora/turista, cidade, painéis; e-mail não é mais "editável" sem efeito |
| Cadastro de empresas | ✅ | Nasce pendente e gratuita; usuário vira COMPANY via regra; tela não mostra mais plano pago fictício |
| Reivindicação de empresa | 🔧 | Antes gravava o campo `id` e o dono nunca conseguia editar; agora grava `ownerId` |
| Bloquear/excluir empresa | 🔧 | Bloquear empresa não bloqueia mais a pessoa; excluir empresa não apaga mais a conta do dono |
| Categorias / subcategorias | 🔧 | Regras para `app_amenities` e `app_settings` não existiam (tudo negado); jornalistas podem organizar categorias de Dicas |
| Cidades e bairros | ✔ | Usados pela Ajuda Colaborativa e pelo perfil |
| Busca | ✔ | Sem mudança de lógica |
| Mapa e localização | ✔ | Não testado (Leaflet por CDN) |
| Cupons | ✅ | Edição pela empresa não mexe em aprovação/contador |
| Resgates | ✅ | Código de 6 dígitos não aparecia após o resgate (retorno descartado) nem no comprovante; resgate não grava mais o e-mail do cliente |
| Avaliações | ✅ | **Nunca apareciam** (cache vazio) e a aprovação sempre falhava; agora carregam do banco e a aprovação recalcula a nota |
| Favoritos | ✅ | |
| Galerias / cardápios / redes sociais | 🔧 | Plano agora é encontrado pelo ID (antes só pelo nome, então planos atribuídos pelo admin não liberavam recursos) |
| Coleções | 🔧 | Visualização registrada como evento |
| Destaques | ✔ | Só admin |
| Blog / Dicas e roteiros | 🔧 | Jornalistas não conseguiam publicar (regra só admin); autores via perfil público |
| Links de agendamento | 🔧 | Cliques registrados |
| WhatsApp da empresa | ✅ | O campo existia mas **não havia botão**; criado e medido |
| Painel administrativo | ✅ | Novas abas Moderação e Ecossistema; contato comercial configurável (antes número fictício) |
| Painel empresarial | ✅ | Gráficos com números inventados (tendência, origem 60/30/10) substituídos por dados reais de 30 dias |
| Contadores de acesso e interação | ✅ | Antigos nunca gravavam para visitantes (permissão negada); nova coleção `interactions` |
| Página "Clube" (/subscribe) | — | Removida: preços e botões sem ação; o endereço leva aos planos |
| Componentes mortos | — | `SuperAdminDashboard` (não usado) e `AdminStats` ("economia" = resgates × 25) removidos |
| Rota "Admin" do celular | ✅ | Apontava para página inexistente |

## 3. Novidades

- **Ajuda Colaborativa** (`/ajuda`): publicação (rascunho/publicar), tipos (vaga, temporário, serviço pontual, ofereço serviços, colaboração), frequência, remuneração opcional e explícita, requisitos, vagas, contato pela plataforma ou direto; busca e filtros; interesse/candidatura (1 por pessoa, contato visível só ao anunciante); painel do anunciante com status e histórico; denúncia; moderação; antispam (1 publicação/minuto); avisos de que não há garantia de contratação.
- **Experiência de app**: abas inferiores fixas, telas com cabeçalho próprio, carregamento sob demanda, estados de carregamento/vazio/erro, PWA instalável com modo offline.
- **Identidade única**: uma conta acumula morador, turista, empresa, autor e anunciante.
- **Registro de conexões**: eventos sem dados pessoais (sessão aleatória), por origem e parceiro (`?ref=`).
- **Atendimento especializado** configurável (Guida Trips) — ver `docs/GUIDA_TRIPS.md`.

## 4. Decisões que dependem de você

1. **Apagar o campo `manualPassword` dos usuários em produção.** Ele guarda senhas em texto puro.
   O app não lê mais esse campo, mas os dados continuam no banco. É uma alteração de dados de produção
   (irreversível) — precisa da sua autorização. Recomendação: apagar.
2. **Momento de publicar as regras novas** (quebram partes da versão antiga do site — ver migração).
3. **Ícone do app**: foi criado um ícone provisório (sol e ondas). Substitua `public/icons/*` pela marca oficial se houver.

## 5. Pendências conhecidas

- Testes de regras escritos, **não executados** (emulador indisponível no ambiente) — rodar antes do deploy.
- Build oficial com Vite não executado aqui (npm bloqueado); empacotamento com esbuild passou.
- Tailwind continua via CDN (recomendação futura: compilar no build para carregar mais rápido).
- Telas antigas grandes (painel admin com ~3.200 linhas) receberam correções pontuais, não reescrita.
- Notificações (e-mail/push) de novos interessados ainda não existem; o anunciante acompanha pelo painel.
- Limite de publicações é por minuto (regra); limites diários exigiriam backend.

## 6. Porte para o Conecta-Lagos (05/nov/2026)

O repositório `seaangelshotel-maker/Conecta-Lagos` passou a ser a base do projeto. Ele foi criado
em 25/mai a partir da mesma versão do `conectario` e ganhou, até 31/mai: Feed (blog com curtidas,
comentários, conexões, eventos, recomendados e anúncios patrocinados), multi-idioma, guia com
ordenação e mais categorias, galeria nos cupons, Google Drive no painel e seed automático.
Todo o trabalho de segurança e evolução acima foi aplicado sobre ele (branch `evolucao`).

Ajustes feitos no próprio Conecta-Lagos durante o porte:

| Problema encontrado | Correção |
| --- | --- |
| Senha mestra `123456` voltou (login e "ensureCorrectRole") | Removida; papéis não mudam mais pelo navegador |
| Comentários e anúncios do Feed com escrita liberada para qualquer pessoa | Comentário com campos validados (visitante = `guest`); anúncios só admin |
| "Conectar-se" regravava o post inteiro | Grava só `connectedUsers` (+1 ou −1 nome), garantido nas regras |
| Contador de conexões somava nomes e números inventados | Mostra apenas conexões reais |
| Resgate de cupom "resiliente" entregava o código mesmo sem gravar o resgate | Resgate falha se o registro ou o contador não forem gravados |
| Login anônimo silencioso para resgatar cupom | Removido |
| Visitantes tentavam gravar posts, categorias e pontos turísticos padrão | Seed só para administrador, em segundo plano |
| Seed automático travava o painel do administrador para sempre (esperava a si mesmo) | Corrigido |
| Pontos turísticos do seed com nota e nº de avaliações inventados | Removidos |
| Páginas do blog liam a lista completa de usuários (e-mail do autor no "Contato") | Usam perfis públicos; botão mostra o site do autor |
| `SuperAdminDashboard`, `AdminStats` e `/subscribe` | Removidos (mortos/fictícios); `/super-admin-dashboard` abre o painel admin |
| Nome misturado (Konecta Rio / Lagos GO) | Padronizado como Lagos GO |

Revisão geral (mesmo dia):

- Nota e nº de avaliações só aparecem quando há avaliações aprovadas de verdade (o banco tinha notas 5.0 com "850 avaliações" sem nenhuma avaliação); cupons não mostram mais nota.
- Contadores e avatares inventados nos roteiros do Guia removidos; distância fixa "1.8 km" na Início removida.
- Horário de funcionamento: textos estranhos (explicações da IA gravadas no banco) não aparecem; aceita chaves em maiúsculas; "Aberto/Fechado" calculado no horário de Brasília e oculto quando a empresa não informou horário.
- Chaves duplicadas nas traduções removidas (avisos do build).

Testes de navegador: `e2e.py` (42), `e2e_existing.py` (13) e `e2e_feed.py` (22) — 77/77.

**Firebase (`conectario-dd04b`, compartilhado com o antigo conectario):** em 05/nov/2026 as regras
deste repositório foram publicadas pelo console (antes estava tudo liberado para leitura e escrita
por qualquer pessoa — cópia em `docs/backup/firestore.rules.antes-2026-11-05`; o console também
guarda o histórico de versões) e criados os 6 índices compostos de `firestore.indexes.json`
(opportunities ×2, applications [grupo], interactions, redemptions, blog_comments).

## 7. Lugares públicos para o Guia (05/nov/2026)

`data/publicPlaces.ts` reúne 56 lugares públicos (praias, mirantes, trilhas, pontos históricos,
cultura e natureza) de Búzios, Cabo Frio e Arraial do Cabo que ainda não estavam no banco, cada um
com as fontes consultadas. Nada de nota, horário, telefone ou coordenadas: só o que as fontes dizem.
A importação é feita pelo administrador em **Painel → Ecossistema → Lugares públicos para o Guia**
(prévia antes de gravar, cria a cidade Búzios, não duplica e pode ser repetida com segurança).
A página do lugar mostra as fontes; o selo "Aberto agora" e o quadro de horário só aparecem quando há
horário informado.

## 8. Descubra: filtros, busca e matérias editoriais (08/nov/2026) — NÃO publicado

Implementado e testado só localmente. **Nada foi enviado ao GitHub/Vercel/Firebase.**

- Tela `/descubra`: busca (empresas, lugares, experiências e matérias), 10 categorias principais e 10 filtros contextuais funcionando sobre os dados reais. Filtros que dependem de curadoria (Gratuitos, Famílias, Casais, Crianças, Dias de chuva, Imperdíveis) usam `experienceTags` marcadas pelo admin; sem marcação, a tela mostra estado vazio explicado (nada é inventado).
- Matérias: 20 artigos em `data/guideArticles.ts`, gravados em `blog_posts` com `kind: 'guia'` (não aparecem no Feed). Página `/guia/:slug` com empresas reais ligadas por regra (`related`), matérias relacionadas e anterior/próxima.
- Admin (ECOSSISTEMA → "Descubra: matérias e curadoria"): cadastrar as 20 matérias, publicar/despublicar, destaque, popular, coleções, tags, resumo, empresas ligadas e curadoria de `experienceTags`.
- Home: convite Descubra. Navegação: aba "Descubra" substitui "Feed" na barra inferior mobile; menu superior ganhou "Descubra".
- Regras (`firestore.rules`, ainda não publicadas): `experienceTags` protegido para não-admin; só admin cria/edita `kind: 'guia'`. Testes de regra adicionados em `tests/rules` (não rodados: sem emulador neste ambiente).
- Testes: `tests/e2e/e2e_discover.py` (49) + suítes anteriores (42, 13, 29) sem regressão.
- Depois do deploy: publicar as regras, abrir o painel e clicar "Cadastrar matérias", curar `experienceTags` e conferir no site no ar.

## 9. Missão autônoma: ciclos publicados (08/nov/2026)
Publicado em https://conecta-lagos-one.vercel.app (Vercel, branch `main`; rollback = promover o deploy anterior na Vercel).
- **Ciclo 1:** Descubra padronizado (busca com botão integrado, categorias e filtros com mesmo tamanho e margem, carrosséis com encaixe), feed editorial com rolagem infinita (`services/feedService.ts`, `EditorialFeed`; 8 por página, sem repetição, erro com "tentar de novo"), convite Descubra no topo da Home.
- **Ciclo 2:** ponte nativa (`services/native.ts`), aviso offline, teclado, links profundos, botão voltar, compartilhamento, `capacitor.config.json` e `docs/MOBILE_APP.md` (o que falta na etapa nativa).
- **Ciclo 3:** ecossistema: matéria → lugares reais → cupons dos lugares → "Ver todos" no Descubra → Ajuda Colaborativa; perfil do lugar → matérias que falam dele.
- Testes: `e2e_discover` (60), `e2e` (42), `e2e_existing` (13), `e2e_feed` (29), `e2e_native` (12), unitário `tests/native.test.ts` (4).
- Nenhuma regra comercial, plano, preço ou fluxo de pagamento foi alterado.

## 10. Home = Descubra + filtros de comodidades (08/nov/2026)
- A Home (`/`) agora renderiza a tela Descubra completa (cabeçalho, busca, categorias, filtros, comodidades, destaques, seções editoriais e feed infinito), com seletor de idioma. `/descubra` continua funcionando.
- Filtros de **Comodidades** (12 padrão do sistema, mais as que o admin cadastrar): seleção múltipla, só aparecem lugares que têm todas as marcadas; contagem real em cada chip; aceita comodidade salva como id ou rótulo; estado na URL (`am=`).
- Barra inferior: "Início" é o Descubra; "Feed" voltou como aba. Os blocos antigos da Home (carteira, banners, cupons, coleções, lista) saíram da Home; continuam no histórico do Git (commit anterior a esta mudança) se for preciso recuperar algo.

## 11. Reestruturação Home + Feed (08/nov/2026)
- **Home (vitrine):** busca (abre a página de lugares), 10 categorias com até 8 lugares da categoria escolhida + "Ver todos" (vai para `/descubra?cat=…`), banner de destaques restaurado (conteúdo do admin, `getHomeHighlights`), "O que dá para fazer" e convite de instalação, cupons e ofertas com a carteira de economia, coleções ("Vale conhecer") e roteiros do Guia, prévia editorial (1 destaque + 3 secundários) com "Ver tudo no Feed", atendimento especializado.
- **Feed (`/blog`):** portal editorial + comunidade numa só fonte (`blog_posts`: matérias do Guia `kind: 'guia'` + posts). Destaque principal e secundários, campanhas do Feed (mantidas), "Explore por tema" (coleções do Guia), agenda de eventos (mantida), fluxo contínuo intercalando formatos, carregando 9 por vez, cards de tamanhos diferentes, selo de tipo (Matéria, Notícia, Evento, Dica), filtros por tipo (na URL `?tipo=`), categorias do admin, favoritos e busca.
- **Lugares (`/descubra`):** página completa de lugares (lista todos sem filtro, "Mostrar mais" de 24 em 24), com categorias, filtros, comodidades e cidades. O conteúdo editorial saiu daqui para o Feed.
- **Matéria (`/guia/:slug`):** pertence ao Feed (aba Feed ativa, botão "Voltar para o Feed").
- Removidos por ficarem sem uso: `DiscoverTeaser`, `EditorialFeed` e `services/feedService.ts` (substituídos pelo Feed e pela prévia da Home).
