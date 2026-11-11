/** Tipos e funções puras de privacidade (sem Firebase, testáveis em Node). */
export type PrivacyRequestType = 'access' | 'correction' | 'deletion' | 'portability' | 'revoke_consent' | 'review_removal' | 'info' | 'account_deleted' | 'other';
export type PrivacyRequestStatus = 'open' | 'done' | 'rejected';

export interface PrivacyRequest {
  id: string;
  userId: string;
  userName: string;
  email: string;
  type: PrivacyRequestType;
  message: string;
  /** Só em "account_deleted": o que ficou para o admin tratar (ex.: { reviews: 2, redemptions: 3 }). */
  residual?: Record<string, number>;
  status: PrivacyRequestStatus;
  createdAt: string;
  resolvedAt?: string;
  resolutionNote?: string;
}

export const PRIVACY_TYPE_LABEL: Record<PrivacyRequestType, string> = {
  access: 'Acessar meus dados',
  correction: 'Corrigir dados',
  deletion: 'Excluir dados',
  portability: 'Receber meus dados (portabilidade)',
  revoke_consent: 'Retirar um consentimento',
  review_removal: 'Remover uma avaliação ou anúncio meu',
  info: 'Saber com quem meus dados foram compartilhados',
  account_deleted: 'Conta excluída: dados que sobraram',
  other: 'Outro assunto de privacidade',
};

/** Tipos que a pessoa escolhe no formulário (account_deleted é gerado pelo sistema). */
export const USER_REQUEST_TYPES = (Object.keys(PRIVACY_TYPE_LABEL) as PrivacyRequestType[]).filter(t => t !== 'account_deleted');

/** Prazo legal para responder: 15 dias (LGPD, art. 19, II). */
export const PRIVACY_DEADLINE_DAYS = 15;
export const privacyDueDate = (createdAt: string) => new Date(new Date(createdAt).getTime() + PRIVACY_DEADLINE_DAYS * 86_400_000);
export const privacyDaysLeft = (createdAt: string, now = Date.now()) => Math.ceil((privacyDueDate(createdAt).getTime() - now) / 86_400_000);

export interface ExportPart { key: string; label: string; data: unknown; error?: string }

/** Monta o arquivo final (função pura, coberta por teste). */
export const buildExport = (uid: string, email: string, parts: ExportPart[], now = new Date()) => ({
  geradoEm: now.toISOString(),
  titular: { id: uid, email },
  observacao: 'Cópia dos dados pessoais que o Lagos GO guarda sobre você e que você pode ler. Em caso de dúvida, use a página Privacidade.',
  dados: Object.fromEntries(parts.map(p => [p.key, p.error ? { indisponivel: p.error } : p.data])),
});

