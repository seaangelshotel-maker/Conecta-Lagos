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
];
