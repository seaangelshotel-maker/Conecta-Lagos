# Padrão de cadastro de empresas (Lagos GO)

Como pesquisar, conferir, escrever e publicar uma empresa no guia. Vale para quem cadastra (Yuri, Claude ou ajudante) e é seguido **à risca**, sem pular etapa. Foi validado no cadastro do Saint Tropez e da Casa da Piedra (12/11/2026).
Os campos vêm de `BusinessProfile` (types.ts), do formulário do admin e do importador `services/featuredBusinessesService.ts`.

## Regra de ouro
Só passa a empresa que cumpre **todos** os itens obrigatórios, cada um com fonte. Dado não confirmado fica vazio e a empresa **não passa**: não se inventa nada, não se chuta, não se escolhe um lado quando as fontes divergem sem regra para decidir. Foto está fora desta checagem. Curadoria vale mais que quantidade.

## Fluxo, em ordem
0. **Passo 0: o que já temos.** 
1. **Fila por relevância.** 
2. **Pesquisa nas fontes**, pela extensão do Chrome. 
3. **Checklist** (seção 3) e **entrega** das aprovadas ao Yuri (seção 7). 
4. **Só com a confirmação dele:** gravar, importar, conferir no site (seção 8).

## Passo 0: antes de pesquisar, olhar o que já temos
1. Conferir o site de produção pelo Chrome: abrir `https://lagosgo.com.br/descubra?q=<uma palavra do nome>`, esperar uns 4 segundos carregar e ler o resultado. A busca também casa descrição (ex.: "Pimenta" trouxe um hostel). Os cadastros reais ficam no banco e só aparecem aí.
2. Depois olhar o código: `data/featuredBusinesses.ts`, `data/publicPlaces.ts`, `services/dataService.ts` e os artigos do blog.
3. Se já existe: não duplicar. Comparar o que está salvo com as fontes (endereço, telefone, horário, Instagram, comodidades, descrição) e entregar só o que precisa atualizar.
4. Se só aparece em texto (artigo, roteiro): conferir se está correto e apontar a correção.
5. Só se não existir, seguir o fluxo completo.

## 1. Relevância: quem entra primeiro
A relevância ordena a fila e não substitui o checklist. Sinais combinados: volume de avaliações no Google Meu Negócio e no TripAdvisor, posição no ranking da cidade, Instagram com muitos seguidores (conferir que é o perfil oficial: há homônimos; o endereço da bio deve bater), citação em guias de viagem.

## 2. Fontes e como ler cada uma
**Hierarquia quando divergem (regra do Yuri):** para horário e contato, o **Instagram oficial vale mais que o Google**, por ser mais atual. **Exceção definida pelo Yuri (12/11/2026):** se a empresa **não tem Instagram oficial** (não existe ou não foi achado), o horário da **ficha do Google** vale, desde que nenhuma outra fonte o contradiga (a página oficial do Facebook ou o site podem corroborar, mesmo sem publicar horário por dia). Se o Instagram existe mas não dá para ler (pede login), a empresa fica retida até o horário ser confirmado; a exceção não se aplica.

| Fonte | Serve para | Como ler |
|---|---|---|
| Instagram oficial | Horário, contato, endereço, seguidores | Bio visível sem login só até a primeira linha |
| Link da bio (Linktree, bit.ly) | WhatsApp oficial, cardápio, perguntas | Abrir no Chrome; o link do WhatsApp mostra o número |
| Ficha do Google Maps | Endereço, telefone, horário, **comodidades** | Chrome: aba "Sobre" |
| TripAdvisor, Wanderlog, guias de viagem | Segunda fonte de telefone, história, especialidades | WebSearch |
| Site oficial | Apoio (se estiver no ar) | Chrome |

Notas, comentários e textos dessas plataformas **não são copiados**; só fatos públicos são conferidos.

### Método no Chrome (extensão)
- Sempre abrir uma aba nova (`tabs_context_mcp` primeiro) e **fechar ao terminar**. `navigate` vai em chamada própria, nunca dentro de `browser_batch`.
- **Google Maps:** navegar para `https://www.google.com/maps/search/<nome>+<cidade>`, esperar 4 s, clicar na aba "Sobre" (aprox. x=430, y=370 em tela 1536×695, ou achar com `find`) e ler com `get_page_text`. Confirmar pelo título/endereço que é o lugar certo.
- **Aviso de cookies:** recusar os não essenciais.
- **Nunca entrar em conta** (login, "continuar com Facebook") nem digitar senha. Se o Instagram pedir login para abrir a bio completa, parar e usar o link da bio, ou pedir um print ao Yuri.
- **Links de WhatsApp:** só ler o número; **não enviar mensagem**.
- WebFetch costuma bloquear sites; nesse caso a leitura vai pelo Chrome.
- Esperar a página carregar antes de ler (a busca do site mostra "carregando" por alguns segundos).

## 3. Barreiras eliminatórias (qualquer uma reprova)
- Empresa fechada, não localizada ou com CNPJ trocado.
- Já existe no guia (Passo 0).
- Fora de Arraial do Cabo, Cabo Frio ou Búzios (por enquanto).
- Categoria Passeios (só a Guida Trips vende).
- Fontes se contradizem em endereço, telefone ou perfil do negócio e não dá para resolver (ex.: ficha do Google diz buffet a quilo, os guias dizem frutos do mar à la carte).

## 4. Checklist obrigatório (todos OK)
| # | Campo | Critério | Campo no sistema |
|---|-------|----------|------------------|
| 1 | Nome | Como na fachada, site ou perfil oficial | `name` |
| 2 | Cidade e bairro | Uma das 3 cidades; bairro se a fonte informa | `cityId`, `neighborhood` |
| 3 | Categoria e subcategoria | Da taxonomia do guia | `category`, `subcategory` |
| 4 | Endereço completo | Rua, número, bairro e CEP, em fonte confiável | `address` |
| 5 | Telefone | Confirmado em **duas fontes independentes** | `phone` |
| 6 | Horário por dia | Domingo a Sábado ou "Fechado", pela hierarquia da seção 2 | `hours` |
| 7 | Canal digital | Instagram e/ou site, conferido: existe e é da mesma empresa. Sem Instagram, a página oficial do Facebook entra como canal (campo `website`) | `instagram`, `website` |
| 8 | Descrição editorial | Padrão da seção 6 | `description` |
| 9 | Comodidades | Só as confirmadas, pelo mapa abaixo | `amenities` |
| 10 | Fontes | Lista de URLs conferidas + data | `sources`, `checkedAt` |

### Comodidades: como confirmar
Fonte: aba "Sobre" do Google, site ou Instagram da própria empresa. **Agregadores de terceiros não valem** (ex.: sites que listam "Wi-Fi" sem estar na ficha).

| Item do Google | Id no guia |
|---|---|
| Wi-Fi gratuito | `wifi` |
| Ar-condicionado | `ac` |
| Qualquer estacionamento listado (gratuito, pago, na rua) | `parking` |
| Entrada, assento, banheiro ou estacionamento com acessibilidade | `access` |
| Bom para crianças, cadeirinhas, cardápio infantil, espaço kids | `kids` |
| Cães permitidos (área externa ou entrada) | `pet` |
| Piscina | `pool` |
| Café da manhã | `breakfast` |
| Televisão | `tv` |
| Bar no local | `bar` |
| Cartão de crédito ou débito | `card` |
| Entrega | `delivery` |

Item que não aparece na fonte **não entra** (ex.: Casa da Piedra não lista "pets", então não leva `pet`).

## 5. Formato dos dados no cadastro (`data/featuredBusinesses.ts`)
- `phone`: telefone principal no formato `(22) 2622-1222`. `whatsapp`: número do link oficial da bio ou da ficha, separado.
- `instagram`: endereço completo do perfil (`https://www.instagram.com/perfil/`). O botão da ficha aceita também `@perfil`.
- `hours`: objeto com as chaves `Domingo, Segunda, Terça, Quarta, Quinta, Sexta, Sábado`, valor `'12:00 - 23:30'` ou `'Fechado'`.
- `amenities`: lista de ids da tabela acima.
- `sources`: URLs das páginas conferidas (Instagram, ficha do Google, link da bio, guias). `checkedAt`: data da conferência (AAAA-MM-DD).
- `description`: texto puro. Sem foto, sem nota, sem `reviewCount`, sem "aberto agora".
- Opcionais só se a fonte confirmar: e-mail, `deliveryUrl`, `bookingUrl`, `lat`/`lng`, cardápio com preços e data, `experienceTags` (sugestão; o admin decide).
- Sem `lat`/`lng`, o botão "Rota" busca pelo **endereço**; por isso o endereço precisa estar completo.

## 6. Padrão editorial da descrição
A reputação do Lagos GO é a escrita.
- 450 a 700 caracteres, português do Brasil.
- Abre com algo específico (a cozinha, o prédio, o jeito de receber), nunca "O restaurante X é…".
- Cada afirmação vem de fonte conferida. Sem adjetivo vazio e sem superlativo não comprovado.
- Diz para quem serve e quando faz sentido ir, só se a fonte sustenta.
- Sem preço, horário ou nota no texto (mudam).
- Parafrasear sempre; não copiar frases de site, Instagram, avaliações ou terceiros.
- Fecha com utilidade concreta (onde fica, momento ideal), se confirmado.

## 7. Entrega ao Yuri
Para cada empresa: ficha (endereço, telefones, horário, Instagram, comodidades) com a fonte de cada item, descrição pronta e dúvidas em aberto.
- **Aprovadas:** todos os itens OK. Vão para confirmação dele.
- **Retidas:** uma linha cada, dizendo exatamente o que falta e como fechar (ex.: "horário só pelo Instagram, que pede login: mande print da bio").
- Se as fontes divergirem, mostrar o conflito e perguntar; não escolher sozinho fora da regra da hierarquia.
- **Nada é gravado sem a confirmação dele.**

## 8. Publicação e conferência (só após a confirmação)
1. Acrescentar a empresa em `FEATURED_BUSINESSES` (`data/featuredBusinesses.ts`), commit e push no `main` (a Vercel publica).
2. No site, logado como administrador (sessão do Chrome do Yuri): painel admin → **Ecossistema** → **Empresas em destaque** → **Ver prévia**. A prévia tem que listar **exatamente** as empresas esperadas (as já existentes aparecem como "puladas"). Só então **Importar**.
3. O importador publica as completas (endereço, telefone e fonte) com 90 dias grátis do plano Pro; incompletas viram rascunho. Ele pula as que já existem.
4. **Conferir no site público:** `descubra?q=` encontra a empresa, a contagem da categoria subiu e os filtros de comodidade refletem as novas. Abrir a ficha e testar **horário, descrição, botão do Instagram e botão Rota**. Corrigir o que falhar antes de dar como concluído.
5. Fechar abas do Chrome abertas e relatar o resultado ao Yuri.

## 9. Limites conhecidos
- Instagram sem login mostra a bio só até a primeira linha; Google Maps e iFood podem bloquear leitura automática.
- Hospedagem: conferir também o Cadastur, quando acessível.
- Empresa sem canal digital oficial ou com dado de uma fonte só fica retida; o caminho é o formulário de confirmação do dono (WhatsApp).
