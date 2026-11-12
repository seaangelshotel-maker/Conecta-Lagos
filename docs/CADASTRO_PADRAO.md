# Padrão de cadastro de empresas (Lagos GO)

Como pesquisar, conferir e escrever uma empresa antes de ela entrar no guia. Vale para quem cadastra (Yuri, Claude ou ajudante).
Os campos abaixo vêm de `BusinessProfile` (types.ts), do formulário do admin e do importador `services/featuredBusinessesService.ts`.

## Regra de ouro
Só passa para a lista de aprovadas a empresa que cumpre **todos** os itens obrigatórios, com fonte. Dado não confirmado fica vazio e a empresa **não passa** (não se inventa nada). Foto está fora desta checagem.

## Relevância: quem entra primeiro na fila
Prioridade para negócios que o público já procura. A relevância ordena a fila e não substitui o checklist. Sinais, combinados:
- Volume de avaliações na ficha do Google Meu Negócio e no TripAdvisor, e a posição no ranking da cidade e da categoria.
- Instagram com muitos seguidores. Conferir que é o perfil oficial: existem perfis homônimos (o endereço da bio deve bater com o da ficha do Google).
- Citação em guias de viagem.

## Fontes de pesquisa
- **Ficha do Google Meu Negócio:** endereço, telefone, horário por dia, site.
- **TripAdvisor:** posição no ranking, tipo de cozinha, faixa de preço, facilidades.
- **Instagram oficial:** bio (endereço e horário), seguidores, canal de contato.
- **Site oficial** e guias de viagem como apoio.
- Para passar, dois ou mais itens independentes precisam concordar nos dados de contato. Uso: conferir fatos públicos. Notas, comentários e textos dessas plataformas não são copiados.

## Passo 0: antes de pesquisar, olhar o que já temos
Para cada empresa, antes de abrir qualquer fonte externa:
1. Conferir primeiro o site de produção pelo Chrome: abrir `https://lagosgo.com.br/descubra?q=<parte do nome>`, esperar uns 4 segundos carregar e ler o resultado (use só uma palavra do nome, a busca também casa descrição). Os cadastros reais ficam no banco e só aparecem aí. Depois olhar o código (data/featuredBusinesses.ts, data/publicPlaces.ts, services/dataService.ts, artigos do blog).
2. Se já existe: não duplicar. Comparar o que está salvo com as fontes (endereço, telefone, horário, Instagram, comodidades, descrição) e entregar só a lista do que precisa atualizar.
3. Se só aparece em texto (artigo do blog, roteiro), conferir se o texto ainda está correto e apontar o que corrigir.
4. Só se não existir, seguir o fluxo completo abaixo.
Regra de fonte para horário e contato: o Instagram oficial vale mais que o Google quando divergem (definido por Yuri, mais atual).

## 1. Barreiras eliminatórias (qualquer uma reprova)
- Empresa fechada, não localizada ou com CNPJ trocado.
- Já existe no guia (mesmo nome na mesma cidade, ignorando acento e parênteses).
- Fora de Arraial do Cabo, Cabo Frio ou Búzios (por enquanto).
- Categoria Passeios: ninguém cadastra passeio, só a Guida Trips vende.
- Fontes se contradizem em endereço ou telefone e não dá para resolver.

## 2. Checklist obrigatório (todos precisam estar OK)
| # | Campo | Critério | Campo no sistema |
|---|-------|----------|------------------|
| 1 | Nome | Como aparece na fachada, no site ou no perfil oficial | `name` |
| 2 | Cidade e bairro | Uma das 3 cidades; bairro quando a fonte informa | `cityId`, `neighborhoodId` |
| 3 | Categoria e subcategoria | Da taxonomia do guia (Gastronomia, Hospedagem, Comércio, Serviços) | `category`, `subcategory` |
| 4 | Endereço completo | Rua, número e bairro, em fonte confiável | `address` |
| 5 | Telefone | Número que atende, na fonte oficial | `phone` |
| 6 | Horário por dia | Domingo a Sábado, ou "Fechado", como a empresa publica | `openingHours` |
| 7 | Canal digital | Instagram e/ou site, conferido (perfil existe e é da mesma empresa) | `instagram`, `website` |
| 8 | Descrição editorial | Segue o padrão da seção 4 | `description` |
| 9 | Comodidades | Só as confirmadas, entre as 12 do guia | `amenities` |
| 10 | Fontes | Site oficial + pelo menos 1 ficha pública, ou 2 fontes independentes; data da conferência | `sources` |

## 3. Campos opcionais (preencher só se a fonte confirmar)
- WhatsApp (`whatsapp`), e-mail (`email`).
- Link de delivery (`deliveryUrl`) e de reserva (`bookingUrl`).
- Cardápio com preços ou lista de serviços (`menu`): só se a própria empresa publica; preço muda, registrar a data.
- Coordenadas (`lat`, `lng`).
- Etiquetas de experiência (`experienceTags`): familias, casais, criancas, aventura, chuva, gratuito, imperdivel. Sugestão minha, o administrador decide.
- Nunca preencher: nota (`rating`), número de avaliações (`reviewCount`), "aberto agora".

Comodidades do guia: Wi-Fi grátis, ar-condicionado, estacionamento, acessibilidade, espaço kids, pet friendly, piscina, café da manhã, televisão, bar no local, aceita cartão, faz entrega.

## 4. Padrão editorial da descrição
Objetivo: texto que o leitor lembra, sem exagero. A reputação do Lagos GO é a escrita.
- 450 a 700 caracteres, em português do Brasil.
- Abre com algo específico da empresa (um prato, a vista, o jeito de receber), não com "O restaurante X é…".
- Cada afirmação vem de fonte conferida. Sem adjetivo vazio ("incrível", "maravilhoso") e sem superlativo que ninguém comprovou ("o melhor").
- Diz para quem serve e em que momento faz sentido ir, só se a fonte sustenta.
- Sem preço, sem horário e sem nota no texto (mudam).
- Parafrasear sempre. Não copiar frase de site, de Instagram ou de ficha de terceiros.
- Fecha com utilidade concreta (onde fica em relação à praia ou ao centro, como chegar), se confirmado.

## 5. Como o resultado é entregue
Para cada empresa pesquisada:
1. Ficha com os campos acima.
2. Quadro de checagem: item, OK ou falta, e a fonte.
3. Descrição proposta.
4. Dúvidas em aberto, se houver.

No fim, a lista **Aprovadas** (todos os itens OK) vai para confirmação do Yuri. As reprovadas aparecem em uma linha cada, só com o motivo. Nada é gravado no guia sem a confirmação dele.

## 6. Limites conhecidos
- Google Maps, Instagram e iFood costumam bloquear a leitura automática. Quando o dado só existe lá, a empresa fica como "falta confirmar" e vai para o formulário de confirmação do dono (WhatsApp) em vez de ser inventada.
- Hospedagem: conferir também o cadastro no Cadastur, quando acessível.
