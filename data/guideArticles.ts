/**
 * 20 matérias editoriais sobre Arraial do Cabo (guia do visitante e do morador).
 *
 * Regras editoriais:
 * - Texto original. Nada de horário, preço, regra de acesso, telefone ou parceiro inventado.
 * - Tudo que muda com temporada, maré, clima, fiscalização ou órgão ambiental vem marcado
 *   com "> Confirme:" para o leitor checar antes de ir.
 * - Estabelecimentos NÃO são citados pelo nome no texto: a ligação com o Guia é feita em tempo real
 *   (campo `related`), apenas com o que existe cadastrado no banco.
 * - Sem imagens (imageUrl fica vazio; o layout funciona sem foto e aceita foto depois).
 *
 * Formato do `content` (lido por components/GuideContent.tsx):
 *   ## Título de seção        ### Subtítulo
 *   - item de lista
 *   > Dica: ...   > Alerta: ...   > Confirme: ...   > Prático: ...
 *   linha comum = parágrafo
 */
import { BlogPost } from '../types';

export const GUIDE_BATCH = 'guia-arraial-2026-11';

export const C = {
  descubra: 'Descubra Arraial do Cabo',
  lugares: 'Lugares que você precisa conhecer',
  roteiros: 'Roteiros para aproveitar melhor a cidade',
  dicas: 'Dicas de quem conhece a região',
  imperdiveis: 'Experiências imperdíveis',
  familia: 'Para fazer em família',
  casais: 'Para casais',
  aventura: 'Aventuras e natureza',
  gastronomia: 'Gastronomia local',
  historia: 'História e cultura',
  alem: 'Arraial além das praias',
  chuva: 'O que fazer em dias de chuva',
  arredores: 'Explore os arredores',
} as const;

/** Ordem em que as coleções aparecem na tela Descubra. */
export const COLLECTION_ORDER: string[] = Object.values(C);

type Seed = Omit<BlogPost, 'id' | 'date' | 'author' | 'imageUrl' | 'status' | 'kind' | 'readingMinutes' | 'excerpt'> & { summary: string };

const countWords = (t: string) => t.split(/\s+/).filter(Boolean).length;

const make = (n: number, s: Seed): BlogPost => {
  const { summary, ...rest } = s;
  return {
    ...rest,
    id: `guia_${s.slug}`,
    kind: 'guia',
    excerpt: summary,
    imageUrl: '',
    date: `2026-11-${String(Math.max(1, 8 - Math.floor(n / 5))).padStart(2, '0')}`,
    author: 'Equipe Lagos GO',
    status: 'published',
    readingMinutes: Math.max(2, Math.round(countWords(s.content) / 190)),
    order: n,
  };
};

const CONFIRME = '> Confirme: horários, regras de acesso, valores e condições mudam com a temporada, o clima e a fiscalização. Antes de sair, confirme os dados atuais com o estabelecimento, com o operador do passeio ou com os canais oficiais da cidade.';

export const GUIDE_ARTICLES: BlogPost[] = [
  make(1, {
    slug: 'guia-completo-de-arraial-do-cabo',
    title: 'O guia completo de Arraial do Cabo: tudo o que você precisa saber antes de visitar',
    subtitle: 'Onde fica, por que a água é tão azul e como começar a planejar a viagem',
    summary: 'Entenda o que torna Arraial única, quais são as grandes atrações e como organizar a primeira visita sem arrependimentos.',
    category: 'Guia', tags: ['Arraial do Cabo', 'Planejamento', 'Primeira vez', 'Região dos Lagos'],
    collections: [C.descubra, C.dicas],
    related: { categories: ['Praias'], cityId: 'city_arraial_do_cabo', label: 'Explorar as praias cadastradas' },
    relatedSlugs: ['praias-de-arraial-do-cabo', 'arraial-do-cabo-em-2-dias', 'quando-visitar-arraial-do-cabo', 'como-chegar-e-circular-por-arraial-do-cabo'],
    featured: true, popular: true,
    content: `Arraial do Cabo fica na Região dos Lagos, no litoral do estado do Rio de Janeiro, e é conhecida pelo apelido de "Caribe brasileiro": areia clara, mar em tons de azul e verde e uma costa recortada que esconde pequenas enseadas.

## Por que a água de Arraial é diferente
O cenário tem uma explicação natural. Na região acontece o fenômeno da ressurgência: águas profundas, frias e ricas em nutrientes sobem em direção à superfície. O resultado é um mar com muita vida, de coloração marcante e, muitas vezes, mais frio do que o visitante espera. Isso também ajuda a explicar a fama da cidade entre quem gosta de mergulho.

## O que a cidade oferece
- Praias urbanas, com estrutura próxima, como a Praia Grande e a Praia dos Anjos.
- Praias de acesso mais difícil, por trilha ou por barco, como a Praia do Forno e as Prainhas do Pontal do Atalaia.
- Passeios de barco, com paradas para banho e snorkel.
- Mergulho de observação e de aprendizado, em operadores licenciados.
- Mirantes, trilhas, pontos históricos e uma boa mesa de frutos do mar.

## Como começar a planejar
Defina primeiro quantos dias você tem. Com dois dias já dá para conhecer o essencial; com três, a viagem fica mais tranquila. Em seguida escolha o estilo: mais praia e descanso, mais aventura ou mais cultura e gastronomia. Os roteiros desta seção ajudam a montar cada versão.

> Dica: reserve os passeios que dependem de barco com antecedência na alta temporada e deixe um dia de folga na programação, porque o mar e o vento podem alterar os planos.

> Alerta: o mar frio surpreende. Leve proteção contra o sol, mas também uma peça de roupa para o vento, mesmo em dia quente.

${CONFIRME}

## Conclusão
Arraial recompensa quem planeja um pouco e aceita improvisar outro tanto. Comece pelas praias, escolha um passeio de barco e reserve um fim de tarde para o pôr do sol. O resto vem naturalmente.`,
  }),

  make(2, {
    slug: 'praias-de-arraial-do-cabo',
    title: 'As praias de Arraial do Cabo: como escolher a melhor para cada ocasião',
    subtitle: 'Das praias de rua às enseadas escondidas: diferenças, perfis e cuidados',
    summary: 'Praia Grande, Prainha, Praia dos Anjos, Forno, Farol e Pontal: o que muda de uma para outra e qual combina com o seu dia.',
    category: 'Praias', tags: ['Praias', 'Arraial do Cabo', 'Escolha', 'Mar'],
    collections: [C.lugares, C.descubra],
    related: { categories: ['Praias'], cityId: 'city_arraial_do_cabo', label: 'Ver as praias cadastradas' },
    relatedSlugs: ['praia-do-forno', 'prainhas-do-pontal-do-atalaia', 'praia-do-farol', 'praia-grande-por-do-sol-estrutura-e-experiencias'],
    popular: true,
    content: `Escolher a praia certa muda a viagem. Em Arraial, o litoral é pequeno, mas cada trecho tem personalidade própria: o vento, a ondulação, a movimentação e a forma de chegar variam bastante.

## Praias com acesso fácil
Algumas praias ficam dentro da área urbana e dispensam trilha ou barco. A Praia Grande é extensa e comporta bem quem quer caminhar. A Praia dos Anjos fica ao lado do porto e da região de embarque dos passeios. A Prainha é uma das mais procuradas pela proximidade com o centro.

## Praias que exigem um pouco mais de esforço
A Praia do Forno costuma ser alcançada por trilha ou por barco, e a recompensa é uma enseada de água calma. As Prainhas do Pontal do Atalaia ficam ao pé de uma escadaria e são pequenas, o que pede organização e paciência em dias cheios. A Praia do Farol, na Ilha do Cabo Frio, depende de barco e de regras específicas de visitação.

## Como decidir
- **Quer estrutura por perto?** Prefira as praias urbanas.
- **Quer água calma e paisagem?** Vale pesquisar as enseadas protegidas, sabendo que o acesso é mais trabalhoso.
- **Vai com crianças ou idosos?** Priorize praias de acesso simples e pouca caminhada.
- **Quer fotografar?** Chegue cedo e escolha o horário de luz mais suave.

> Dica: o vento muda a sensação térmica e o estado do mar. Em dia ventoso, procure o lado mais abrigado da costa.

> Alerta: o mar de Arraial pode ter correntes e ondulação. Respeite sinalização, bandeiras e orientação de salva-vidas e operadores.

${CONFIRME}

## Conclusão
Não existe "a melhor" praia, e sim a melhor para o seu dia. Combine uma praia fácil, para descansar, com uma de acesso especial, para marcar a viagem.`,
  }),

  make(3, {
    slug: 'praia-do-forno',
    title: 'Praia do Forno: como chegar, o que esperar e dicas para aproveitar o passeio',
    subtitle: 'Uma enseada de água calma que costuma entrar em todo roteiro',
    summary: 'Saiba como é chegar à Praia do Forno por trilha ou por barco, o que levar e como evitar os horários mais cheios.',
    category: 'Praias', tags: ['Praia do Forno', 'Trilha', 'Passeio de barco', 'Arraial do Cabo'],
    collections: [C.lugares, C.aventura],
    related: { nameKeywords: ['Forno'], cityId: 'city_arraial_do_cabo', label: 'Ver a Praia do Forno no Guia' },
    relatedSlugs: ['passeio-de-barco-em-arraial-do-cabo', 'praias-trilhas-e-natureza-explore-com-responsabilidade'],
    content: `A Praia do Forno é uma das mais conhecidas de Arraial do Cabo e aparece com frequência em roteiros de barco. É uma enseada, ou seja, uma pequena baía protegida, o que costuma resultar em um mar mais tranquilo do que o de outras praias da cidade.

## Como chegar
Existem, em geral, dois caminhos: por barco, em passeios que incluem a parada na praia, ou por trilha, a pé, a partir da região da Prainha. A trilha atravessa vegetação de restinga e dá vistas bonitas, mas exige calçado adequado, água e atenção ao calor.

> Confirme: tempo de caminhada, condições da trilha e eventual restrição de acesso variam. Pergunte a quem faz o passeio ou a moradores antes de ir.

## O que esperar
- Faixa de areia pequena em relação ao movimento de dias cheios.
- Água em tons claros, com frio característico da região em alguns dias.
- Estrutura limitada: não conte com tudo à mão, principalmente se for a pé.

## Dicas para aproveitar
- Chegue cedo ou no fim da tarde para fugir do pico de visitantes.
- Leve água, protetor solar, chapéu e um saco para recolher o próprio lixo.
- Calce algo firme para a trilha e leve o calçado de praia na mochila.
- Se for de barco, combine com o operador o tempo de permanência.

> Alerta: respeite a área de banho, a sinalização e a vida marinha. Não retire nada do ambiente.

${CONFIRME}

## Conclusão
A Praia do Forno vale o esforço pela paisagem e pela calma da água. Planeje a chegada, leve o essencial e aproveite sem pressa.`,
  }),

  make(4, {
    slug: 'prainhas-do-pontal-do-atalaia',
    title: 'Prainhas do Pontal do Atalaia: como funciona a visita e o que considerar antes de ir',
    subtitle: 'Escadaria, enseadas pequenas e a importância de se organizar',
    summary: 'As Prainhas são pequenas e muito procuradas. Veja o que considerar sobre acesso, horário, lotação e segurança.',
    category: 'Praias', tags: ['Pontal do Atalaia', 'Prainhas', 'Mirante', 'Arraial do Cabo'],
    collections: [C.lugares],
    related: { nameKeywords: ['Prainhas', 'Pontal do Atalaia'], cityId: 'city_arraial_do_cabo', label: 'Ver o Pontal do Atalaia no Guia' },
    relatedSlugs: ['praias-de-arraial-do-cabo', 'arraial-do-cabo-para-casais'],
    content: `O Pontal do Atalaia é um dos cartões-postais de Arraial do Cabo. No alto, há um mirante com vista ampla do mar; ao pé de uma escadaria, ficam pequenas enseadas conhecidas como Prainhas.

## Como é a visita
O acesso às Prainhas é feito por escada, e a descida é a parte fácil: a volta, sob sol e calor, cansa. Como o espaço é pequeno, a experiência muda muito de acordo com o horário e a época do ano.

## O que considerar antes de ir
- **Lotação:** em dias de pico, o espaço pode ficar apertado e há possibilidade de controle de entrada.
- **Condição do mar:** com ressaca ou ondulação forte, o acesso à água pode ser desaconselhável.
- **Condicionamento:** pessoas com mobilidade reduzida devem avaliar bem a escadaria.
- **Segurança:** leve água, protetor e evite calçados escorregadios.

> Confirme: regras de acesso, horário de funcionamento do local, cobrança (se houver) e limite de visitantes podem mudar. Procure informação oficial atualizada antes de ir.

> Dica: o mirante do alto é um bom plano de reserva quando o acesso às prainhas não for possível.

## Conclusão
As Prainhas recompensam quem chega cedo, respeita as regras do local e entende que o mar é quem manda. Com planejamento, a visita vira uma das melhores memórias da viagem.`,
  }),

  make(5, {
    slug: 'praia-do-farol',
    title: 'Praia do Farol: por que é tão especial e quais são as regras de visitação',
    subtitle: 'Na Ilha do Cabo Frio, uma das praias mais comentadas da região',
    summary: 'Um dos destinos mais desejados de Arraial depende de barco e de regras específicas. Entenda como funciona e como se preparar.',
    category: 'Praias', tags: ['Praia do Farol', 'Ilha do Cabo Frio', 'Passeio de barco', 'Regras'],
    collections: [C.lugares, C.imperdiveis],
    related: { nameKeywords: ['Farol'], cityId: 'city_arraial_do_cabo', label: 'Ver a Praia do Farol no Guia' },
    relatedSlugs: ['passeio-de-barco-em-arraial-do-cabo', 'praias-trilhas-e-natureza-explore-com-responsabilidade'],
    popular: true,
    content: `A Praia do Farol fica na Ilha do Cabo Frio, em frente a Arraial do Cabo, e é frequentemente citada entre as mais bonitas do país. A fama vem da areia clara, da água límpida e do cenário preservado.

## Como funciona o acesso
A ilha não tem ponte nem acesso por terra: a chegada é feita por barco, normalmente em embarcações autorizadas. Por se tratar de uma área de interesse ambiental e de uso controlado, a visitação costuma seguir regras específicas, definidas por órgãos responsáveis.

> Confirme: quem pode visitar, em quais dias, por quanto tempo e com que limite de pessoas é determinado por regras que podem mudar. Use apenas operadores regularizados e peça a informação atualizada antes de pagar.

## O que esperar
- Paisagem preservada e pouca estrutura, o que faz parte do atrativo.
- Tempo de permanência combinado com o operador.
- Possibilidade de trechos de caminhada na ilha, conforme as regras do momento.

## Como se preparar
- Leve água, protetor solar, chapéu e roupa leve.
- Evite plásticos descartáveis e retire todo o lixo.
- Não alimente animais nem recolha conchas, corais ou pedras.

> Alerta: o mar pode impedir a saída dos barcos. Tenha flexibilidade na programação.

## Conclusão
O Farol é um privilégio, e não um direito garantido: o respeito às regras é o que preserva o lugar. Planeje com antecedência e vá com o espírito de visitante, não de dono.`,
  }),

  make(6, {
    slug: 'praia-grande-por-do-sol-estrutura-e-experiencias',
    title: 'Praia Grande: pôr do sol, estrutura e experiências',
    subtitle: 'A praia mais extensa da cidade, boa para caminhar e ficar',
    summary: 'A Praia Grande combina areia extensa, estrutura de cidade e uma luz de fim de tarde que vale o programa.',
    category: 'Praias', tags: ['Praia Grande', 'Pôr do sol', 'Estrutura', 'Arraial do Cabo'],
    collections: [C.lugares, C.casais],
    related: { nameKeywords: ['Praia Grande'], cityId: 'city_arraial_do_cabo', label: 'Ver a Praia Grande no Guia' },
    relatedSlugs: ['arraial-do-cabo-para-casais', 'onde-comer-em-arraial-do-cabo'],
    content: `A Praia Grande é a mais extensa de Arraial do Cabo e uma das mais frequentadas por quem se hospeda na cidade. Fica em área urbana, com ruas, pousadas, restaurantes e comércio nas proximidades.

## Um dia de praia sem complicação
Como o acesso é simples, a Praia Grande funciona bem como "praia base": você chega a pé, circula, almoça por perto e volta para descansar. É uma boa opção para quem viaja com crianças ou prefere não depender de barco ou trilha.

## Pôr do sol
O fim de tarde costuma atrair visitantes e moradores. Chegue com antecedência para escolher o lugar na areia e leve um agasalho, porque o vento aumenta quando o sol baixa.

## Experiências
- Caminhadas ao longo da faixa de areia, em horários mais frescos.
- Esportes de praia, nos trechos em que o uso é permitido.
- Refeições e petiscos em estabelecimentos próximos.

> Dica: observe a condição do mar e as bandeiras antes de entrar. Em alguns dias a ondulação é forte.

> Confirme: funcionamento de quiosques, aluguel de cadeiras e regras de uso da faixa de areia dependem da temporada e da fiscalização.

## Conclusão
A Praia Grande é a escolha da praticidade: grande, acessível e boa para encerrar o dia com o pôr do sol.`,
  }),

  make(7, {
    slug: 'passeio-de-barco-em-arraial-do-cabo',
    title: 'Passeio de barco em Arraial do Cabo: como escolher, o que observar e como se preparar',
    subtitle: 'Antes de comprar, saiba o que perguntar ao operador',
    summary: 'Um bom passeio depende de embarcação regularizada, roteiro claro e informação honesta. Veja o que checar.',
    category: 'Passeios', tags: ['Passeio de barco', 'Segurança', 'Planejamento', 'Arraial do Cabo'],
    collections: [C.imperdiveis, C.dicas],
    related: { nameKeywords: ['barco', 'lancha', 'escuna', 'traineira', 'passeio'], cityId: 'city_arraial_do_cabo', label: 'Ver passeios cadastrados' },
    relatedSlugs: ['praia-do-farol', 'praia-do-forno', 'mergulho-em-arraial-do-cabo'],
    popular: true,
    content: `O passeio de barco é uma das experiências mais procuradas de Arraial do Cabo. Ele permite chegar a praias e enseadas de difícil acesso e ver a costa por outro ângulo, mas a qualidade varia bastante de um passeio para outro.

## O que perguntar antes de contratar
- **O que está incluído?** Roteiro, paradas, tempo em cada local, equipamentos de snorkel e coletes.
- **A embarcação é regularizada?** Peça informação sobre a regularização do barco e do condutor.
- **Quantas pessoas por embarcação?** Lotação demais atrapalha conforto e segurança.
- **O que acontece se o mar não permitir o passeio?** Entenda a política de reagendamento ou de reembolso.
- **Há alimentação ou bebida a bordo?** Se sim, o que é cobrado à parte.

## Como se preparar
- Leve protetor solar, chapéu, óculos escuros e roupa de banho.
- Use calçado que possa molhar e leve uma toalha.
- Quem enjoa com facilidade deve se informar sobre cuidados antes da saída.
- Leve apenas o necessário e proteja celular e documentos da água.

> Alerta: nunca escolha apenas pelo preço mais baixo. Segurança, regularização e transparência importam mais.

> Dica: se possível, compare mais de uma opção e prefira quem informa claramente roteiro, duração e condições.

${CONFIRME}

## Conclusão
Um bom passeio de barco é feito de informação clara antes e de respeito ao mar durante. Pergunte, compare e vá com flexibilidade.`,
  }),

  make(8, {
    slug: 'arraial-do-cabo-em-2-dias',
    title: 'Arraial do Cabo para quem está visitando pela primeira vez: roteiro inteligente de 2 dias',
    subtitle: 'O essencial da cidade em um fim de semana, sem correria desnecessária',
    summary: 'Um roteiro de dois dias que equilibra praia, passeio de barco, pôr do sol e boa comida, com margem para o imprevisto.',
    category: 'Roteiros', tags: ['Roteiro', '2 dias', 'Primeira vez', 'Arraial do Cabo'],
    collections: [C.roteiros, C.descubra],
    related: { categories: ['Praias', 'Pontos Históricos', 'Mirantes'], cityId: 'city_arraial_do_cabo', label: 'Ver lugares para o roteiro' },
    relatedSlugs: ['arraial-do-cabo-em-3-dias', 'passeio-de-barco-em-arraial-do-cabo', 'onde-comer-em-arraial-do-cabo'],
    featured: true,
    content: `Dois dias são suficientes para conhecer o essencial de Arraial do Cabo, desde que você aceite escolher. A ideia aqui é um roteiro enxuto, que deixa espaço para descansar e para o clima mudar os planos.

## Dia 1: o mar como protagonista
- **Manhã:** passeio de barco, que costuma ser a atração principal. Saia cedo, quando o mar costuma estar mais calmo e o movimento é menor.
- **Almoço:** reserve um horário tranquilo e aproveite para provar peixes e frutos do mar.
- **Tarde:** descanso na praia mais próxima da hospedagem.
- **Fim de tarde:** pôr do sol em um mirante ou na Praia Grande.

## Dia 2: praias e história
- **Manhã:** uma praia de acesso especial, como a Praia do Forno ou as Prainhas do Pontal do Atalaia, conforme condição do mar e do acesso.
- **Almoço:** algo leve perto do centro.
- **Tarde:** caminhada pelo centro histórico, igrejas e praças, e compras de lembranças.
- **Noite:** jantar sem pressa e volta cedo se for estrada longa.

> Dica: deixe a manhã do segundo dia como "folga de mar": se o passeio do primeiro dia for cancelado, você troca com facilidade.

> Alerta: nos meses de pico, saia para os passeios mais cedo e reserve com antecedência.

${CONFIRME}

## Conclusão
Com dois dias, o segredo é priorizar. Um grande passeio, uma praia especial e um pôr do sol bem escolhido já fazem a viagem valer.`,
  }),

  make(9, {
    slug: 'arraial-do-cabo-em-3-dias',
    title: 'Arraial do Cabo em 3 dias: um roteiro para aproveitar a cidade sem correria',
    subtitle: 'Mais tempo para descansar, repetir o que gostou e conhecer o que quase ninguém vê',
    summary: 'Com três dias dá para unir praia, passeio, mergulho ou trilha e um dia mais leve de cultura e gastronomia.',
    category: 'Roteiros', tags: ['Roteiro', '3 dias', 'Planejamento', 'Arraial do Cabo'],
    collections: [C.roteiros],
    related: { categories: ['Praias', 'Pontos Históricos', 'Cultura'], cityId: 'city_arraial_do_cabo', label: 'Ver lugares para o roteiro' },
    relatedSlugs: ['arraial-do-cabo-em-2-dias', 'arraial-do-cabo-alem-das-praias', 'mergulho-em-arraial-do-cabo'],
    content: `Três dias permitem trocar a lógica de "ver tudo" pela de aproveitar. Você pode repetir uma praia de que gostou, dedicar um dia a uma experiência mais especial e ainda ter espaço para descansar.

## Dia 1: chegada e praia urbana
Chegue, deixe a bagagem e vá a uma praia próxima. O primeiro dia serve para entender a cidade, o vento e o clima. Termine com um pôr do sol e um jantar tranquilo.

## Dia 2: o grande passeio
Reserve o dia para o passeio de barco, que pode incluir paradas para banho e snorkel. Se preferir uma experiência mais ativa, avalie o mergulho de observação com operador licenciado. Volte com tempo de descansar.

## Dia 3: história, trilha ou gastronomia
Escolha uma linha:
- **Cultura:** centro, igrejas, praças e museus, quando abertos.
- **Natureza:** uma trilha curta com água, protetor e saída cedo.
- **Gastronomia:** almoço demorado e passeio sem horário.

> Dica: se o mar atrapalhar um dia, empurre o passeio de barco para o dia seguinte. Três dias dão essa margem.

> Alerta: trilhas pedem calçado adequado, água e atenção ao calor. Não subestime o sol.

${CONFIRME}

## Conclusão
O roteiro de três dias é o mais confortável para quem não quer correr. Ele oferece margem para o clima, para o cansaço e para a vontade de ficar mais um pouco.`,
  }),

  make(10, {
    slug: 'onde-comer-em-arraial-do-cabo',
    title: 'Onde comer em Arraial do Cabo: gastronomia, especialidades e como escolher bons restaurantes',
    subtitle: 'Peixes, frutos do mar e o que observar antes de sentar à mesa',
    summary: 'A cozinha de Arraial gira em torno do mar. Saiba o que provar e como escolher com critério.',
    category: 'Gastronomia', tags: ['Gastronomia', 'Frutos do mar', 'Restaurantes', 'Arraial do Cabo'],
    collections: [C.gastronomia, C.dicas],
    related: { categories: ['Gastronomia'], cityId: 'city_arraial_do_cabo', label: 'Ver restaurantes e bares cadastrados' },
    relatedSlugs: ['arraial-do-cabo-em-2-dias', 'o-que-fazer-em-arraial-do-cabo-quando-chove'],
    popular: true,
    content: `Quem vive de pesca e de turismo costuma valorizar o prato do mar. Em Arraial do Cabo, peixes e frutos do mar têm presença forte nos cardápios, ao lado de petiscos, pizzas, lanches e opções para todos os gostos.

## O que costuma valer a pena provar
- Peixe do dia, grelhado ou frito.
- Moquecas e preparos com frutos do mar.
- Petiscos para dividir, bons para o fim de tarde.
- Sucos e sobremesas com frutas, nos dias de calor.

## Como escolher bem
- **Observe o movimento e a rotina do lugar:** casa que serve bem costuma ter fluxo constante.
- **Pergunte o que é fresco no dia:** bons restaurantes explicam sem constrangimento.
- **Compare porções e preços no cardápio:** peça sempre para ver antes de pedir.
- **Cuidado com a alta temporada:** a espera pode ser longa, e a cozinha, mais corrida.

> Dica: almoçar um pouco antes ou depois do horário de pico evita fila e costuma render atendimento mais atento.

> Alerta: se você tem alergia ou restrição alimentar, avise ao atendimento antes de pedir. Frutos do mar exigem atenção.

> Confirme: horários de funcionamento e cardápios mudam. Confira com o estabelecimento antes de ir, principalmente fora da alta temporada.

## Conclusão
Comer bem em Arraial é uma questão de curiosidade e critério. Experimente o peixe do dia, divida petiscos e use o Guia para encontrar opções com contato e endereço.`,
  }),

  make(11, {
    slug: 'arraial-do-cabo-alem-das-praias',
    title: 'Arraial do Cabo além das praias: experiências e lugares menos óbvios',
    subtitle: 'Mirantes, centro histórico, trilhas curtas e a vida da cidade',
    summary: 'Quando a praia cansa, a cidade guarda mirantes, pontos históricos e passeios que mostram outro lado de Arraial.',
    category: 'Experiências', tags: ['Além das praias', 'Mirantes', 'História', 'Arraial do Cabo'],
    collections: [C.alem, C.descubra],
    related: { categories: ['Mirantes', 'Pontos Históricos', 'Cultura', 'Trilhas'], cityId: 'city_arraial_do_cabo', label: 'Explorar lugares além das praias' },
    relatedSlugs: ['a-historia-de-arraial-do-cabo', 'o-que-fazer-em-arraial-do-cabo-quando-chove', 'arraial-do-cabo-em-3-dias'],
    content: `Arraial do Cabo é muito mais do que praia. Quem reserva uma parte da viagem para o que fica longe da areia descobre mirantes, ruas históricas, praças e uma vida local que ajuda a entender o lugar.

## Mirantes e vistas
Pontos altos ao longo da costa mostram a geografia da cidade, com a sequência de enseadas e a ilha ao fundo. São bons no início da manhã e no fim da tarde, quando a luz favorece.

## Centro e memória
Caminhar sem pressa pelo centro, observar igrejas, praças e construções antigas e conversar com moradores é uma forma de conhecer a cidade pelo que ela já foi.

## Trilhas curtas
Algumas trilhas oferecem vista e natureza sem exigir um dia inteiro. Vá cedo, leve água e respeite a sinalização.

## Vida local
Feiras, pequenos comércios, padarias e quiosques mostram o cotidiano, e é aí que muita gente encontra o melhor café da viagem.

> Dica: reserve uma manhã sem planejamento. Muitas das melhores descobertas acontecem sem roteiro.

> Alerta: em trilhas e mirantes, siga as regras locais, não saia dos caminhos marcados e cuide da vegetação.

${CONFIRME}

## Conclusão
Quem olha além das praias volta com uma ideia mais completa de Arraial. Use o Guia para encontrar mirantes, pontos históricos e experiências cadastradas.`,
  }),

  make(12, {
    slug: 'o-que-fazer-em-arraial-do-cabo-quando-chove',
    title: 'O que fazer em Arraial do Cabo quando chove: alternativas para não perder a viagem',
    subtitle: 'Planos B para dias de chuva ou de mar impróprio',
    summary: 'Chuva não precisa estragar a viagem: cultura, gastronomia, compras e descanso são boas alternativas.',
    category: 'Dicas', tags: ['Chuva', 'Plano B', 'Cultura', 'Gastronomia'],
    collections: [C.chuva, C.dicas],
    related: { categories: ['Cafés e Padarias', 'Pontos Históricos', 'Cultura', 'Restaurantes'], cityId: 'city_arraial_do_cabo', label: 'Ver opções para dias de chuva' },
    relatedSlugs: ['onde-comer-em-arraial-do-cabo', 'arraial-do-cabo-alem-das-praias'],
    content: `Chuva ou mar impróprio fazem parte da vida de um destino litorâneo. A diferença entre uma viagem estragada e uma viagem diferente está no plano B.

## Ideias para o dia de chuva
- **Gastronomia sem pressa:** um almoço demorado, um café com tempo e uma tarde de petiscos.
- **Cultura e história:** igrejas, museus e centros culturais, quando abertos. Confirme o funcionamento.
- **Compras e artesanato:** lojas e feiras cobertas para procurar lembranças.
- **Descanso:** muita gente esquece, mas viagem também é dormir bem e ler um livro.

## Quando o problema é o mar
Se a chuva for leve, mas o mar estiver agitado, os passeios de barco podem ser suspensos por segurança. Siga sempre a orientação do operador e negocie reagendamento.

> Dica: guarde uma lista curta de planos B e confirme horários na véspera.

> Alerta: em chuva forte, evite trilhas e escadarias molhadas, que ficam escorregadias.

> Confirme: funcionamento de museus, igrejas e centros culturais varia com dia e feriado. Ligue ou pergunte na hospedagem.

## Conclusão
A chuva passa, e a viagem continua. Com um plano B simples, você transforma o dia cinzento em uma boa história.`,
  }),

  make(13, {
    slug: 'arraial-do-cabo-para-familias-com-criancas',
    title: 'Arraial do Cabo para famílias com crianças: dicas para organizar os passeios',
    subtitle: 'Segurança, ritmo e escolhas que fazem toda a diferença',
    summary: 'Com crianças, o segredo é ritmo, segurança e escolhas simples. Veja como montar dias leves e divertidos.',
    category: 'Famílias', tags: ['Famílias', 'Crianças', 'Segurança', 'Arraial do Cabo'],
    collections: [C.familia],
    related: { categories: ['Praias'], cityId: 'city_arraial_do_cabo', label: 'Ver praias cadastradas' },
    relatedSlugs: ['praias-de-arraial-do-cabo', 'praia-grande-por-do-sol-estrutura-e-experiencias', 'passeio-de-barco-em-arraial-do-cabo'],
    content: `Viajar com crianças pede outro ritmo. A boa notícia é que Arraial do Cabo tem opções simples e agradáveis para a família, sem exigir grandes esforços.

## Escolha praias de acesso fácil
Praias urbanas poupam o cansaço de trilhas e escadarias e facilitam as pausas para lanche, banheiro e descanso. Prefira o início da manhã e o fim da tarde, que são mais frescos.

## Passeio de barco com crianças
Pergunte ao operador sobre idade mínima, coletes do tamanho certo, duração e paradas. Passeios longos podem cansar os pequenos.

## Segurança em primeiro lugar
- Colete salva-vidas de tamanho adequado em qualquer passeio náutico.
- Supervisão constante dentro e perto da água, pois o mar pode ter corrente.
- Protetor solar, chapéu e camisa com proteção UV.
- Água e lanches, principalmente em passeios longos.

## Ritmo
Um grande programa por dia é suficiente. Reserve a tarde para descansar e deixe espaço para brincar.

> Dica: leve uma bolsa com muda de roupa, toalhas e um saco para roupa molhada.

> Alerta: o mar de Arraial pode ser frio. Crianças perdem calor mais depressa; tenha agasalho à mão.

${CONFIRME}

## Conclusão
Com ritmo, segurança e simplicidade, Arraial funciona muito bem para famílias. O melhor plano é o que deixa todos descansados no fim do dia.`,
  }),

  make(14, {
    slug: 'arraial-do-cabo-para-casais',
    title: 'Arraial do Cabo para casais: experiências, paisagens e programas especiais',
    subtitle: 'Pôr do sol, gastronomia e um passeio só de vocês',
    summary: 'Paisagem, boa mesa e momentos a dois: ideias para quem viaja em casal.',
    category: 'Casais', tags: ['Casais', 'Pôr do sol', 'Gastronomia', 'Arraial do Cabo'],
    collections: [C.casais],
    related: { categories: ['Mirantes', 'Praias'], cityId: 'city_arraial_do_cabo', label: 'Ver mirantes e praias cadastrados' },
    relatedSlugs: ['praia-grande-por-do-sol-estrutura-e-experiencias', 'prainhas-do-pontal-do-atalaia', 'onde-comer-em-arraial-do-cabo'],
    content: `Arraial do Cabo oferece uma combinação que agrada a casais: paisagens bonitas, boa comida do mar e a possibilidade de fugir do movimento se você souber quando e onde ir.

## Pôr do sol
Escolha um mirante ou uma praia e chegue com antecedência. O fim de tarde costuma ser movimentado nos meses de pico, então um pouco de antecedência garante o melhor lugar.

## Passeio de barco mais tranquilo
Se existirem opções com menos pessoas por embarcação, vale perguntar. Um passeio com menos gente tende a ser mais confortável.

## Jantar sem pressa
Reserve com antecedência na alta temporada e escolha um lugar de que vocês gostem, com cardápio que respeite restrições de ambos.

## Manhãs de caminhada e café
Caminhar pela orla no início do dia, quando a cidade ainda está desperta, é um dos programas mais agradáveis.

> Dica: deixem uma tarde sem planos. Viagem de casal também é descansar junto.

> Alerta: celebrações especiais (aniversário, pedido de casamento) pedem combinação antecipada com o estabelecimento.

${CONFIRME}

## Conclusão
Para casais, Arraial é uma questão de escolher bem os momentos. Pôr do sol, mesa boa e tempo livre bastam para uma viagem memorável.`,
  }),

  make(15, {
    slug: 'mergulho-em-arraial-do-cabo',
    title: 'Mergulho em Arraial do Cabo: conheça a vida marinha e as possibilidades de exploração',
    subtitle: 'Do batismo ao mergulho de observação: o que saber antes de entrar na água',
    summary: 'A ressurgência faz de Arraial um destino de mergulho. Entenda as modalidades, os cuidados e como escolher um operador.',
    category: 'Experiências', tags: ['Mergulho', 'Vida marinha', 'Segurança', 'Aventura'],
    collections: [C.aventura, C.imperdiveis],
    related: { nameKeywords: ['mergulho', 'dive', 'diving'], cityId: 'city_arraial_do_cabo', label: 'Ver operadores de mergulho cadastrados' },
    relatedSlugs: ['passeio-de-barco-em-arraial-do-cabo', 'guia-completo-de-arraial-do-cabo'],
    content: `Arraial do Cabo é conhecida entre mergulhadores por reunir, em um litoral pequeno, uma combinação de águas ricas em nutrientes e paisagens submersas variadas. A ressurgência, que traz águas profundas para perto da superfície, ajuda a sustentar uma vida marinha diversa.

## Modalidades
- **Batismo de mergulho:** experiência introdutória, feita com instrutor, em que você mergulha pela primeira vez com acompanhamento direto.
- **Mergulho de observação com certificação:** para quem já é mergulhador certificado.
- **Mergulho livre e snorkel:** com máscara e snorkel, sem cilindro, em locais permitidos.

## Como escolher um operador
- Verifique se o operador é regularizado e se os instrutores têm certificação.
- Pergunte sobre estado e manutenção dos equipamentos.
- Entenda como funciona o briefing de segurança.
- Pergunte quantos alunos por instrutor e qual é o tempo em cada mergulho.

## Cuidados
A água de Arraial pode ser fria em muitos dias, e é comum o uso de roupa de neoprene. Pessoas com condições de saúde devem consultar um médico antes. Siga todas as orientações do instrutor e nunca mergulhe sozinho.

> Alerta: mergulho depende de condição de mar e visibilidade. Pode haver cancelamento ou remarcação por segurança.

> Dica: não coma em excesso antes do mergulho e mantenha-se hidratado.

${CONFIRME}

## Conclusão
O mergulho em Arraial é uma experiência marcante quando feita com segurança e respeito. Escolha bem o operador e deixe a pressa de lado.`,
  }),

  make(16, {
    slug: 'a-historia-de-arraial-do-cabo',
    title: 'A história de Arraial do Cabo: origem, pesca, cultura e transformação da cidade',
    subtitle: 'De comunidade de pescadores a um dos destinos mais procurados do litoral fluminense',
    summary: 'Pesca, sal, indústria e turismo: um panorama da história de Arraial, com os alertas de quem prefere conferir nas fontes.',
    category: 'História', tags: ['História', 'Cultura', 'Pesca', 'Arraial do Cabo'],
    collections: [C.historia],
    related: { categories: ['Pontos Históricos', 'Cultura'], cityId: 'city_arraial_do_cabo', label: 'Ver pontos históricos cadastrados' },
    relatedSlugs: ['arraial-do-cabo-alem-das-praias', 'os-arredores-de-arraial-do-cabo'],
    content: `A história de Arraial do Cabo está ligada ao mar. A região fez parte da ocupação do litoral fluminense, com a presença de povos originários antes da chegada dos europeus, e se desenvolveu em torno da pesca e de atividades ligadas ao litoral.

## Pesca e vida de comunidade
A pesca artesanal esteve no centro da vida local e deixou marcas na cultura, na culinária e na identidade da cidade. A relação entre comunidade pesqueira e o ambiente marinho é um dos fios condutores da história de Arraial.

## Transformações
Ao longo do século XX, a região conheceu atividades industriais e mudanças sociais, que alteraram o perfil econômico e o espaço urbano. Mais tarde, a cidade se emancipou de Cabo Frio, em meados dos anos 1980, e passou a ter administração própria.

## O mar como patrimônio
O reconhecimento da importância ambiental da região levou à criação de áreas de proteção, como uma reserva extrativista marinha, que busca conciliar uso tradicional dos recursos e conservação.

## Turismo
O crescimento do turismo trouxe oportunidades e desafios: movimento de visitantes, pressão sobre o ambiente e necessidade de regras de uso.

> Confirme: datas, nomes e detalhes históricos devem ser conferidos em fontes oficiais, museus e instituições locais. Este texto é um panorama geral, não um registro acadêmico.

## Conclusão
Entender a história de Arraial ajuda a olhar a cidade com mais respeito. Visite museus, converse com moradores e leia fontes oficiais para aprofundar.`,
  }),

  make(17, {
    slug: 'quando-visitar-arraial-do-cabo',
    title: 'Quando visitar Arraial do Cabo: clima, sazonalidade, movimento e planejamento',
    subtitle: 'Verão cheio, inverno tranquilo e o que muda entre uma estação e outra',
    summary: 'A melhor época depende do que você procura: calor e movimento, ou calma e preços mais acessíveis.',
    category: 'Planejamento', tags: ['Quando ir', 'Clima', 'Sazonalidade', 'Planejamento'],
    collections: [C.dicas, C.descubra],
    related: { categories: ['Hospedagem'], cityId: 'city_arraial_do_cabo', label: 'Ver hospedagens cadastradas' },
    relatedSlugs: ['guia-completo-de-arraial-do-cabo', 'como-chegar-e-circular-por-arraial-do-cabo'],
    popular: true,
    content: `Arraial do Cabo pode ser visitada o ano todo, mas a experiência muda bastante entre as estações.

## Alta temporada
Verão, feriados prolongados e férias escolares concentram o maior movimento. Há mais oferta de atividades e vida noturna, e também mais fila, mais trânsito e disputa por vagas em passeios e hospedagens.

## Baixa temporada
Nos períodos mais calmos, a cidade fica mais tranquila, e o ritmo é outro. Alguns estabelecimentos reduzem o horário ou fecham dias. O clima pode ser mais instável.

## O mar e o vento
Em qualquer época, a condição do mar, o vento e a ressurgência influenciam a temperatura da água e a visibilidade. Planeje com flexibilidade.

## Como decidir
- **Quer calor e agito?** Prefira o verão, reservando tudo com antecedência.
- **Quer calma e paz?** Considere meses fora de feriados.
- **Quer mergulhar?** Converse com os operadores sobre a melhor época para visibilidade.

> Dica: se possível, vá no meio da semana. Muda a experiência em praias e restaurantes.

> Alerta: nos feriados, reserve hospedagem e passeios com bastante antecedência.

${CONFIRME}

## Conclusão
Não existe época perfeita, e sim a época certa para o seu estilo de viagem. Decida o que mais importa e planeje a partir disso.`,
  }),

  make(18, {
    slug: 'como-chegar-e-circular-por-arraial-do-cabo',
    title: 'Como chegar e circular por Arraial do Cabo: transporte, deslocamentos e dicas práticas',
    subtitle: 'De carro, de ônibus ou de avião, e como se mover com tranquilidade na cidade',
    summary: 'Rotas, transporte público e dicas práticas para chegar a Arraial e circular sem estresse.',
    category: 'Planejamento', tags: ['Como chegar', 'Transporte', 'Planejamento', 'Arraial do Cabo'],
    collections: [C.dicas],
    related: { categories: ['Aluguel de Carros', 'Táxi e Transfer'], label: 'Ver transporte cadastrado' },
    relatedSlugs: ['guia-completo-de-arraial-do-cabo', 'quando-visitar-arraial-do-cabo'],
    content: `Chegar a Arraial do Cabo é simples, mas vale conhecer as opções para escolher a mais confortável.

## De carro
O acesso por rodovia é feito, em geral, por vias que ligam o Rio de Janeiro e a Região dos Lagos, como a Via Lagos (RJ-124) e a Rodovia Amaral Peixoto (RJ-106). Nos feriados e fins de semana de verão, o trânsito pode aumentar bastante.

## De ônibus
Existem linhas rodoviárias que ligam cidades do estado à Região dos Lagos. Confira empresas, horários e preços com antecedência.

## De avião
Há aeroporto em Cabo Frio, cidade vizinha. A disponibilidade de voos varia, e é preciso combinar o translado até Arraial.

## Circulando por Arraial
O centro e as praias urbanas costumam ser acessíveis a pé. Para trechos maiores, há táxis, transporte por aplicativo e transfer, conforme disponibilidade. Em dias de pico, o estacionamento é limitado.

> Dica: deixe o carro na hospedagem, se puder, e circule a pé ou de transporte local.

> Alerta: em feriados, planeje horário de ida e volta fora do pico para evitar estrada parada.

> Confirme: rotas, horários de ônibus, voos e regras de estacionamento mudam. Consulte fontes atualizadas antes de sair.

## Conclusão
Pensar no deslocamento antes da viagem evita estresse. Escolha o modo mais confortável, saia fora do pico e circule com calma.`,
  }),

  make(19, {
    slug: 'praias-trilhas-e-natureza-explore-com-responsabilidade',
    title: 'Praias, trilhas e natureza: como explorar a região com responsabilidade ambiental',
    subtitle: 'Pequenos hábitos que preservam o que atrai todo mundo',
    summary: 'Lixo, fauna, trilhas e regras: o que cada visitante pode fazer para preservar Arraial.',
    category: 'Natureza', tags: ['Natureza', 'Trilhas', 'Sustentabilidade', 'Responsabilidade'],
    collections: [C.aventura, C.dicas],
    related: { categories: ['Trilhas', 'Natureza'], label: 'Ver trilhas e natureza cadastradas' },
    relatedSlugs: ['praia-do-forno', 'praia-do-farol', 'mergulho-em-arraial-do-cabo'],
    content: `O que torna Arraial do Cabo especial é frágil: um mar rico em vida, vegetação de restinga e enseadas que sofrem com excesso de visitantes. Cada pessoa faz diferença.

## Antes de ir
- Informe-se sobre regras da área que vai visitar. Algumas têm limite de visitantes ou regras específicas.
- Leve garrafa reutilizável e um saco para o lixo.
- Escolha protetor solar de menor impacto ambiental, quando possível.

## Durante o passeio
- Não deixe lixo, nem restos de comida. Leve tudo de volta.
- Não alimente animais e não toque na vida marinha.
- Não retire conchas, pedras, corais ou plantas.
- Fique nas trilhas marcadas, pois sair delas danifica a vegetação.
- Evite barulho que perturbe fauna e outros visitantes.

## Em passeios náuticos
Peça informações sobre descarte de resíduos a bordo e prefira operadores que cuidem do assunto.

> Dica: leve um saquinho a mais e recolha também o lixo que não é seu. Faz diferença.

> Alerta: regras de áreas protegidas podem prever multa. Respeite sinalização e orientação.

${CONFIRME}

## Conclusão
Visitar com responsabilidade é uma forma de agradecer o lugar. Deixe a praia como encontrou, ou melhor.`,
  }),

  make(20, {
    slug: 'os-arredores-de-arraial-do-cabo',
    title: 'Os arredores de Arraial do Cabo: experiências e destinos para conhecer na Região dos Lagos',
    subtitle: 'Cabo Frio, Búzios e outras paradas que combinam com a sua viagem',
    summary: 'Quem fica alguns dias pode somar Cabo Frio e Búzios: perfis, distâncias a confirmar e ideias de passeios.',
    category: 'Região dos Lagos', tags: ['Região dos Lagos', 'Cabo Frio', 'Búzios', 'Arredores'],
    collections: [C.arredores, C.descubra],
    related: { categories: ['Praias', 'Mirantes', 'Pontos Históricos'], label: 'Ver lugares da região' },
    relatedSlugs: ['praias-de-arraial-do-cabo', 'arraial-do-cabo-em-3-dias', 'como-chegar-e-circular-por-arraial-do-cabo'],
    content: `Arraial do Cabo faz parte de uma região com mais de um destino de peso. Quem tem mais dias pode combinar a cidade com vizinhas próximas, cada uma com personalidade própria.

## Cabo Frio
Vizinha de Arraial, tem orla extensa, centro histórico, canal e bairros com perfis diferentes, como a Passagem. É uma boa base ou um passeio de um dia.

## Búzios
Conhecida por suas praias numerosas, orla movimentada e vida gastronômica, Búzios tem um clima mais sofisticado. Praias como Geribá, Ferradura e João Fernandes são algumas das mais citadas.

## Como combinar
- Defina qual cidade será sua base e faça as demais como bate-volta.
- Considere o tempo de deslocamento, que varia conforme trânsito e época.
- Evite encaixar cidades demais em poucos dias.

> Dica: se for combinar mais de um destino, divida as hospedagens ou escolha a que fica mais ao centro do roteiro.

> Alerta: em feriados e no verão, o trânsito entre as cidades pode ser lento. Saia cedo.

${CONFIRME}

## Conclusão
A Região dos Lagos recompensa quem explora com calma. Use o Guia para ver lugares cadastrados em Cabo Frio, Búzios e Arraial e monte o seu roteiro.`,
  }),
];
