/**
 * Chat cliente ↔ empresa (regras puras, usadas pelo servidor, pelo app e pelos testes).
 *
 * Princípios de segurança:
 *  - Toda gravação passa pelo servidor (Admin SDK). O app só LÊ as próprias conversas.
 *  - Só os dois participantes (cliente e dono da empresa) leem; o admin só lê conversa denunciada.
 *  - O cliente precisa aceitar o aviso de responsabilidade antes da primeira conversa (data/hora guardadas).
 *  - O chat só existe se o plano da empresa liberar e a empresa tiver ligado o canal.
 */
export const CHAT_TERMS_VERSION = 1;

export const CHAT_NOTICE_TITLE = 'Antes de conversar com a empresa';
export const CHAT_NOTICE_LINES = [
  'Esta conversa é entre você e a empresa. O Lagos GO apenas conecta vocês dois.',
  'Pedido, preço, prazo, pagamento, entrega e atendimento são combinados e de responsabilidade exclusiva da empresa. O Lagos GO não participa da venda, não recebe pagamento e não se responsabiliza pelas tratativas feitas neste chat.',
  'Nunca envie senha, número de cartão ou código de verificação por aqui.',
] as const;
export const CHAT_NOTICE_CHECK = 'Li e entendi que o Lagos GO só conecta as partes e que a responsabilidade pela tratativa é da empresa.';

export const MAX_MESSAGE_LEN = 1000;
export const MAX_ORDER_LEN = 2000;
export const MAX_PER_HOUR = 120;      // mensagens por conversa por hora
export const MIN_GAP_MS = 800;        // intervalo mínimo entre mensagens do mesmo usuário
export const MAX_NEW_THREADS_PER_DAY = 15;
export const REPORT_REASONS = ['spam', 'golpe', 'ofensa', 'outro'] as const;
export type ReportReason = typeof REPORT_REASONS[number];

export type OrderChannels = 'whatsapp' | 'chat' | 'both';

export const threadIdFor = (businessId: string, customerId: string) => `${businessId}__${customerId}`;

/** Remove caracteres de controle, limita linhas em branco e tamanho. Vazio = inválido. */
export const cleanMessage = (raw: unknown, max = MAX_MESSAGE_LEN): string | null => {
  if (typeof raw !== 'string') return null;
  const t = raw.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F​-‏‪-‮⁦-⁩]/g, '')
    .replace(/\r\n?/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
  if (!t || t.length > max) return null;
  return t;
};

export const previewOf = (text: string, n = 80) => text.replace(/\s+/g, ' ').slice(0, n);

/** Canal efetivo da empresa. Sem escolha = só WhatsApp (comportamento de sempre). */
export const resolveChannels = (
  biz: { ordersEnabled?: boolean; orderChannels?: string },
  plan?: { showChat?: boolean } | null,
): { whatsapp: boolean; chat: boolean } => {
  const c = biz.orderChannels === 'chat' || biz.orderChannels === 'both' ? biz.orderChannels : 'whatsapp';
  const chatAllowed = plan?.showChat === true && biz.ordersEnabled === true;
  const chat = chatAllowed && (c === 'chat' || c === 'both');
  // sem chat liberado a empresa continua no WhatsApp; com "só chat" o WhatsApp some
  const whatsapp = !(chat && c === 'chat');
  return { whatsapp, chat };
};

export interface ThreadLike { customerId: string; ownerId: string; blockedBy?: string | null; status?: string }

export const isParticipant = (t: Pick<ThreadLike, 'customerId' | 'ownerId'>, uid: string) => t.customerId === uid || t.ownerId === uid;
export const otherParty = (t: Pick<ThreadLike, 'customerId' | 'ownerId'>, uid: string) => (t.customerId === uid ? t.ownerId : t.customerId);

/** Por que uma mensagem não pode ser enviada agora (null = pode). */
export const sendBlockReason = (t: ThreadLike, uid: string): string | null => {
  if (!isParticipant(t, uid)) return 'Conversa não encontrada.';
  if (t.blockedBy) return t.blockedBy === uid ? 'Você bloqueou esta conversa. Desbloqueie para enviar mensagens.' : 'Esta conversa foi bloqueada pela outra parte.';
  if (t.status === 'closed') return 'Esta conversa foi encerrada.';
  return null;
};

/** Janela de 1 hora por conversa. Devolve a nova janela ou null se estourou o limite. */
export const bumpWindow = (w: { start?: number; count?: number } | undefined, now: number, max = MAX_PER_HOUR): { start: number; count: number } | null => {
  const start = w?.start && now - w.start < 3_600_000 ? w.start : now;
  const count = (w?.start && now - w.start < 3_600_000 ? w.count || 0 : 0) + 1;
  return count > max ? null : { start, count };
};
