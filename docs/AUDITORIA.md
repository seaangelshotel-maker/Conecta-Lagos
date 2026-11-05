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

**Atenção:** o Conecta-Lagos e o conectario usam o **mesmo Firebase** (`conectario-dd04b`).
As regras novas ainda não foram publicadas no Firebase; até lá, a proteção real dos dados
continua sendo a das regras antigas.
