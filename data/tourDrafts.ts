/**
 * Pré-cadastro de passeios (rascunho, nunca público): o admin importa e depois completa o que falta
 * (fotos, WhatsApp da operadora, vagas) e publica. Texto reescrito a partir do que a operadora enviou;
 * afirmações que não dá para verificar (nota no Google, anos de mercado, clientes atendidos) ficam de fora.
 * Importação idempotente: um passeio que já existe (mesmo id) é pulado e nada é sobrescrito.
 */
import type { Tour } from '../types';

export const TOUR_DRAFTS: Tour[] = [
  {
    id: 'passeio-de-escuna-arraial-do-cabo-saida-local',
    title: 'Passeio de escuna em Arraial do Cabo (saída local)',
    shortDescription: 'Escuna de 2 andares com toboágua, paradas para mergulho e pontos panorâmicos, em 4 horas pelas águas de Arraial do Cabo.',
    description:
      'Quatro horas a bordo de uma escuna de 2 andares com toboágua, no roteiro completo pelas águas de Arraial do Cabo. ' +
      'O barco para para mergulho na Ilha do Farol (com opção de desembarque), na Enseada do Guriri e na Enseada da Praia do Forno, ' +
      'e passa pelos pontos panorâmicos: Rota das Baleias e Gruta Azul (mar aberto), Pedra do Gorila, Pedra da Tartaruga, ' +
      'Fenda de Nossa Senhora, Impacto do Meteorito e as Prainhas do Pontal do Atalaia, onde o desembarque na areia é condicionado pela Marinha.\n\n' +
      'Saídas diárias. Apresente-se às 11h30 no ponto de encontro: o barco sai às 12h e o passeio dura 4 horas, com retorno por volta das 16h.\n\n' +
      'Há dois pacotes, com o mesmo roteiro e a mesma duração: o Básico, com água livre, e o Completo, que inclui também caipirinha, almoço self-service e sobremesa no restaurante depois do passeio. ' +
      'Valores do primeiro lote, sujeitos a alteração.',
    coverImage: '/passeios/escuna-arraial-do-cabo.jpg',
    gallery: ['/passeios/escuna-ilha-do-farol.jpg', '/passeios/escuna-toboagua.jpg', '/passeios/escuna-prainhas.jpg'],
    cityId: 'arraial-do-cabo',
    meetingPoint: 'Praça do Cova, na Praia dos Anjos (em frente ao Museu Oceanográfico)',
    durationText: '4 horas (das 12h às 16h, com encontro às 11h30)',
    includes: [
      'Barco de 2 andares com toboágua', 'Serviço de bordo com barzinho e cozinha', '2 banheiros', 'Wi-Fi a bordo',
      'Música e guia credenciado', 'Espaguetes e tapete flutuantes', 'Bote de apoio (flex-boat)', 'Coração para fotos',
    ],
    notIncluded: ['Taxa do píer: R$ 15 por pessoa, paga à parte em dinheiro'],
    requirements:
      'Taxa do píer paga à parte (R$ 15 por pessoa, em dinheiro). Isentos: crianças até 5 anos, idosos acima de 60 anos, militares e moradores. ' +
      'É proibido levar coolers, alimentos, bolsas térmicas ou caixas de som. Copos descartáveis são proibidos por lei: leve o seu copo ou compre um personalizado a bordo.',
    packages: [
      { id: 'basico', name: 'Básico', price: 49.99, includes: ['Água livre'] },
      { id: 'completo', name: 'Completo', price: 99.99, includes: ['Água livre', '1 caipirinha', 'Almoço self-service sem balança, no restaurante após o passeio', 'Sobremesa após o passeio'] },
    ],
    // Vagas: sem limite prático (teto do sistema = 500 por saída). Mínimo/máximo por reserva ainda a confirmar.
    capacityPerSlot: 500,
    minPeople: 1,
    maxPeoplePerBooking: 6,
    minNoticeHours: 12,
    // Só novembro e início de dezembro de 2026 (de 23/11 a 07/12).
    schedule: { weekdays: [0, 1, 2, 3, 4, 5, 6], times: ['12:00'], startDate: '2026-11-23', endDate: '2026-12-07', blockedDates: [], extraDates: [] },
    operatorName: 'Guida Trips',
    operatorBusinessId: 'cnYye6yHwbaS07Px3P7y0BXEKG33',
    operatorWhatsapp: '5522988227730',
    status: 'draft',
  },
  {
    id: 'passeio-de-escuna-saida-do-rio-bate-e-volta',
    title: 'Passeio de escuna com saída do Rio (bate e volta)',
    shortDescription: 'Bate e volta saindo do Rio de Janeiro: transporte ida e volta, escuna de 2 andares com toboágua, mergulho, almoço e tudo incluso.',
    description:
      'Um dia inteiro em Arraial do Cabo saindo do Rio de Janeiro, sem se preocupar com nada: o transporte de ida e volta, o passeio de escuna de 2 andares com toboágua, a caipirinha ou suco, o almoço e a taxa da marina já estão no valor.\n\n' +
      'O barco navega pelos principais cartões-postais de Arraial do Cabo e para para mergulho e praias na Ilha do Farol (com opção de desembarque para conhecer), nas Prainhas do Pontal do Atalaia, na Enseada do Guriri e na Praia do Forno. ' +
      'Pelo caminho passa pelos pontos panorâmicos: Gruta Azul, Pedra do Gorila, Pedra da Tartaruga, Fenda de Nossa Senhora e Impacto do Meteorito.\n\n' +
      'Saídas diárias, com embarque em diversos pontos do Rio entre 6h30 e 8h40. Depois do passeio, o almoço self-service sem balança é no restaurante na Praia dos Anjos, em Arraial do Cabo.\n\n' +
      'Na reserva, informe no campo de observações o bairro ou hotel onde prefere embarcar. A operadora confirma o ponto e o horário exatos pelo WhatsApp.',
    coverImage: '/passeios/bate-e-volta-rio-arraial.jpg',
    gallery: ['/passeios/escuna-arraial-do-cabo.jpg', '/passeios/escuna-ilha-do-farol.jpg', '/passeios/escuna-toboagua.jpg', '/passeios/escuna-prainhas.jpg'],
    cityId: 'arraial-do-cabo',
    meetingPoint: 'Embarque no Rio de Janeiro: Leblon/Ipanema 6h30, Copacabana 6h45, Leme 7h10, Botafogo 7h20, Flamengo 7h30, Centro/Lapa 7h45, Niterói 8h30 e São Gonçalo 8h40. A lista completa dos pontos é confirmada pela operadora.',
    durationText: 'Dia inteiro (bate e volta, embarque entre 6h30 e 8h40)',
    includes: [
      'Transporte ida e volta', 'Passeio de escuna de 2 andares com toboágua', 'Macarrões flutuantes', '2 banheiros', 'Serviço de bordo',
      'Coração para fotos', 'Som bluetooth e Wi-Fi', '1 caipirinha ou suco por pessoa (na recepção do passeio)',
      'Refeição self-service sem balança, no restaurante na Praia dos Anjos após o passeio', 'Água livre', 'Taxa da marina e translado obrigatórios',
    ],
    notIncluded: [],
    requirements: 'Criança até 5 anos não paga (vai no colo no ônibus). Informe na reserva o ponto de embarque desejado; a operadora confirma o horário exato pelo WhatsApp.',
    price: 215,
    priceNote: 'por pessoa, com tudo incluso',
    // Vagas: sem limite prático (teto do sistema = 500 por saída). Mínimo/máximo por reserva ainda a confirmar.
    capacityPerSlot: 500,
    minPeople: 1,
    maxPeoplePerBooking: 6,
    minNoticeHours: 12,
    // Horário = primeiro embarque do dia (Leblon/Ipanema). Só novembro e início de dezembro de 2026 (de 23/11 a 07/12).
    schedule: { weekdays: [0, 1, 2, 3, 4, 5, 6], times: ['06:30'], startDate: '2026-11-23', endDate: '2026-12-07', blockedDates: [], extraDates: [] },
    operatorName: 'Guida Trips',
    operatorBusinessId: 'cnYye6yHwbaS07Px3P7y0BXEKG33',
    operatorWhatsapp: '5522988227730',
    status: 'draft',
  },
  {
    id: 'mergulho-de-snorkel-santuario-das-tartarugas',
    title: 'Mergulho de snorkel no Santuário das Tartarugas',
    shortDescription: 'Snorkel guiado em águas rasas de Arraial do Cabo, com equipamento, instrutores e filmagem subaquática. Ideal para quem nunca mergulhou ou nadou.',
    description:
      'Uma aventura de 2 horas na biodiversidade marinha de Arraial do Cabo, pensada para quem nunca mergulhou ou nadou, com acompanhamento de instrutores o tempo todo.\n\n' +
      'Primeiro, uma trilha de 5 a 7 minutos pela vegetação nativa até a praia. Lá acontece uma conversa introdutória sobre Arraial e o ecossistema marinho, com catálogos de tartarugas, peixes e corais. ' +
      'Depois, a distribuição dos equipamentos, as orientações de segurança e uso, a sinalização de mergulho, exercícios de respiração e o treino em águas rasas: flutuabilidade, desalagamento de máscara e uso das nadadeiras.\n\n' +
      'Na exploração guiada, o percurso vai de uma praia à outra em águas rasas (1 a 5 metros), com observação de tartarugas, peixes ornamentais, corais, estrelas-do-mar, ouriços e muito mais. ' +
      'Todos são acompanhados por safety divers e o passeio tem registro em GoPro, com filmagem e fotos subaquáticas entregues em 48 a 72 horas.',
    coverImage: '/passeios/snorkel-santuario-das-tartarugas.jpg',
    gallery: ['/passeios/escuna-ilha-do-farol.jpg', '/passeios/escuna-prainhas.jpg'],
    cityId: 'arraial-do-cabo',
    meetingPoint: 'A verificar. A operadora confirma o ponto de encontro pelo WhatsApp.',
    durationText: '2 horas',
    includes: [
      'Máscara e snorkel', 'Colete de flutuação', 'Lycra com proteção solar 50+', 'Nadadeiras',
      'Orientações de segurança e adaptação', 'Treino em águas rasas', 'Acompanhamento de safety divers', 'Registro em GoPro: filmagem e fotos subaquáticas (entregues em 48 a 72 horas)',
    ],
    notIncluded: ['Fotógrafa profissional (serviço adicional, consulte a operadora)'],
    requirements: 'Indicado para quem nunca mergulhou ou nadou. Inclui uma trilha curta (5 a 7 minutos) até a praia, então use calçado confortável.',
    price: 149.99,
    priceNote: 'por pessoa',
    // A CONFIRMAR antes de publicar: dias, horário(s) de saída, vagas e mínimo/máximo por reserva (valores abaixo são provisórios).
    capacityPerSlot: 500,
    minPeople: 1,
    maxPeoplePerBooking: 6,
    minNoticeHours: 12,
    schedule: { weekdays: [0, 1, 2, 3, 4, 5, 6], times: ['09:00'], startDate: '2026-11-23', endDate: '2026-12-07', blockedDates: [], extraDates: [] },
    operatorName: 'Guida Trips',
    operatorBusinessId: 'cnYye6yHwbaS07Px3P7y0BXEKG33',
    operatorWhatsapp: '5522988227730',
    status: 'draft',
  },
];
