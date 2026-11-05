
export enum UserRole {
  CUSTOMER = 'CUSTOMER',
  COMPANY = 'COMPANY',
  SUPER_ADMIN = 'SUPER_ADMIN',
  CONTENT_CREATOR = 'CONTENT_CREATOR',
  JOURNALIST = 'JOURNALIST',
}

export interface PricingPlan {
  id: string;
  name: string;
  price: number;
  period: 'monthly' | 'yearly';
  maxCoupons: number;
  maxBusinesses: number;
  isFeatured: boolean;
  showGallery: boolean;
  showMenu: boolean;
  showSocialMedia: boolean;
  showReviews: boolean;
  hasFreeTrial?: boolean;
  trialDays?: number;
  active: boolean;
}

export interface UserPermissions {
  canCreateCoupons: boolean;
  canManageBusiness: boolean;
  canManageBlog?: boolean;
  canCreateBusiness?: boolean;
}

export interface User {
  id: string;
  name: string;
  surname?: string;
  email: string;
  role: UserRole;
  avatarUrl?: string;
  isPrime?: boolean;
  savedAmount?: number;
  history?: SavingsRecord[];
  companyName?: string;
  category?: string;
  phone?: string;
  maxCoupons?: number;
  plan?: string;
  permissions?: UserPermissions;
  isBlocked?: boolean;
  /** @deprecated Senhas nunca devem ser gravadas no Firestore. Campo mantido só para leitura de dados legados. */
  manualPassword?: string;
  /** Como a pessoa se identifica na plataforma. Uma mesma conta pode ser moradora e turista. */
  profileTypes?: ParticipantType[];
  /** Cidade de referência (morador) ou de interesse (turista). */
  cityId?: string;
  profession?: string;
  bio?: string;
  instagram?: string;
  website?: string;
  location?: string;
  specialties?: string[];
  achievements?: string[];
  favorites?: {
      coupons: string[];
      businesses: string[];
  };
  paymentCustomerId?: string;
  paymentSubscriptionStatus?: string;
  paymentSubscriptionId?: string;
}

export interface BusinessProfile {
  id: string;
  ownerId?: string;
  name: string;
  email?: string;
  category: string;
  subcategory?: string;
  description: string;
  coverImage: string;
  gallery: string[];
  address: string;
  locationId?: string;
  phone: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  deliveryUrl?: string;
  bookingUrl?: string;
  amenities: string[];
  openingHours: { [key: string]: string };
  menu?: MenuSection[];
  reviews?: Review[];
  rating: number;
  reviewCount?: number;
  isOpenNow?: boolean;
  isFeatured?: boolean;
  lat?: number;
  lng?: number;
  views?: number;
  shares?: number;
  actionCounts?: { [key: string]: number };
  isClaimed?: boolean;
  isBlocked?: boolean;
  canBeClaimed?: boolean;
  plan?: string;
  subscriptionEndsAt?: string;
  cityId?: string;
  neighborhoodId?: string;
  paymentCustomerId?: string;
  paymentSubscriptionStatus?: string;
  paymentSubscriptionId?: string;
  status?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CompanyRequest {
  id: string;
  userId?: string;
  companyId?: string; // For claims
  companyName: string;
  ownerName: string;
  email: string;
  phone: string;
  whatsapp?: string;
  instagram?: string;
  website?: string;
  document: string;
  category: string;
  description: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  type: 'NEW_REGISTRATION' | 'CLAIM';
  requestDate: string;
}

export interface SavingsRecord {
  date: string;
  amount: number;
  couponTitle: string;
  couponId?: string;
  companyName?: string;
  expiryDate?: string;
  code?: string;
  verificationId?: string;
  /** Código de 6 dígitos gerado no resgate, conferido pela empresa. */
  verificationCode?: string;
}

export interface Coupon {
  id: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  title: string;
  description: string;
  rules?: string[];
  address?: string;
  lat?: number;
  lng?: number;
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  imageUrl: string;
  gallery?: string[];
  category: string;
  subcategory?: string;
  expiryDate: string;
  status?: 'pending' | 'approved' | 'rejected';
  code: string;
  active: boolean;
  rating?: number;
  reviews?: number;
  maxRedemptions?: number;
  currentRedemptions?: number;
  limitPerUser?: number;
}

export interface CouponRedemption {
  id: string;
  userId: string;
  userName: string;
  couponId: string;
  companyId: string;
  couponTitle: string;
  amountSaved: number;
  redeemedAt: string;
  status: 'PENDING' | 'USED' | 'EXPIRED';
  verificationCode: string;
}

export interface Subcategory {
  id: string;
  name: string;
}

export interface AppCategory {
  id: string;
  name: string;
  subcategories: Subcategory[];
}

export interface AppLocation {
  id: string;
  name: string;
  active: boolean;
  lat?: number;
  lng?: number;
}

export interface AppAmenity {
  id: string;
  label: string;
  icon?: string;
}

export interface AppConfig {
    appName: string;
    appNameHighlight: string;
    logoUrl?: string;
    loginLogoUrl?: string;
    faviconUrl?: string;
    defaultCityId?: string;
}

export interface City {
  id: string;
  name: string;
  active: boolean;
}

export interface Neighborhood {
  id: string;
  cityId: string;
  name: string;
  active: boolean;
  lat?: number;
  lng?: number;
}

export interface MenuItem {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
}

export interface MenuSection {
  title: string;
  items: MenuItem[];
}

export interface Review {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: string;
  status?: 'pending' | 'approved' | 'rejected';
  businessId?: string;
  businessName?: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  imageUrl: string;
  category: string;
  subcategory?: string;
  date: string;
  author: string;
  authorId?: string;
  tags?: string[];
  metaTitle?: string;
  metaDescription?: string;
  metaKeywords?: string;
  status?: 'draft' | 'published';
  eventDate?: string;
  eventLocation?: string;
  connectedUsers?: string[];
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  businessIds: string[];
  active: boolean;
  order: number;
  themeColor?: string; // hex color for gradient
  gradientOpacity?: number; // 0 to 1
}

export interface HomeHighlight {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  buttonText: string;
  buttonLink: string;
  order: number;
  active: boolean;
}

export interface FeaturedConfig {
  title: string;
  subtitle: string;
  imageUrl: string;
  buttonText: string;
}

export interface AppGlobalSettings {
  salesWhatsapp: string;
  supportWhatsapp?: string;
  emailContact?: string;
  /** Atendimento especializado (Guida Trips ou outra operação configurada). */
  specialistReferral?: SpecialistReferralSettings;
}

export interface PaymentSettings {
  isPaymentActive: boolean;
  isTestMode: boolean; // PagBank Sandbox
  /** @deprecated O bypass de pagamento foi removido; o servidor ignora este campo. */
  isDirectPaymentTest?: boolean;
  pagbankToken?: string;
  pagbankWebhookSecret?: string;
  salesWhatsapp?: string; // Adicionado aqui também por conveniência se preferir usar PaymentSettings
}

// ===============================================================
// Identidade única e participação
// ===============================================================

/** Formas de participação que uma mesma conta pode acumular. */
export type ParticipantType = 'morador' | 'turista';

export const PARTICIPANT_LABELS: Record<ParticipantType, string> = {
  morador: 'Moro na região',
  turista: 'Estou visitando',
};

/** Perfil público mínimo (sem e-mail ou telefone). Usado por blog e páginas de autores. */
export interface PublicProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  bio?: string;
  profession?: string;
  instagram?: string;
  website?: string;
  location?: string;
  specialties?: string[];
  achievements?: string[];
  role?: UserRole;
  updatedAt?: string;
}

// ===============================================================
// Ajuda Colaborativa
// ===============================================================

export type OpportunityType =
  | 'vaga'            // vaga de trabalho
  | 'temporario'      // trabalho temporário / diária
  | 'servico_pontual' // serviço pontual
  | 'prestacao'       // prestação de serviços (alguém oferece)
  | 'colaboracao';    // colaboração / troca

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  vaga: 'Vaga de trabalho',
  temporario: 'Temporário / diária',
  servico_pontual: 'Serviço pontual',
  prestacao: 'Ofereço meus serviços',
  colaboracao: 'Colaboração',
};

export type OpportunityStatus =
  | 'draft'       // Rascunho
  | 'published'   // Publicada
  | 'in_progress' // Em andamento (seleção acontecendo)
  | 'filled'      // Preenchida
  | 'closed'      // Encerrada
  | 'cancelled';  // Cancelada

export const OPPORTUNITY_STATUS_LABELS: Record<OpportunityStatus, string> = {
  draft: 'Rascunho',
  published: 'Publicada',
  in_progress: 'Em andamento',
  filled: 'Preenchida',
  closed: 'Encerrada',
  cancelled: 'Cancelada',
};

export type OpportunityRecurrence = 'pontual' | 'temporaria' | 'recorrente';

export const OPPORTUNITY_RECURRENCE_LABELS: Record<OpportunityRecurrence, string> = {
  pontual: 'Pontual (um dia/turno)',
  temporaria: 'Temporária (um período)',
  recorrente: 'Recorrente',
};

export type CompensationType = 'fixed' | 'range' | 'to_agree' | 'none';

export const COMPENSATION_LABELS: Record<CompensationType, string> = {
  fixed: 'Valor definido',
  range: 'Faixa de valor',
  to_agree: 'A combinar',
  none: 'Sem remuneração (colaboração/troca)',
};

export type ContactMethod = 'in_app' | 'whatsapp' | 'email' | 'phone';

export interface Opportunity {
  id: string;
  title: string;
  description: string;
  category: string;
  type: OpportunityType;
  recurrence: OpportunityRecurrence;
  /** Quem publicou (sempre o usuário autenticado que criou). */
  ownerId: string;
  /** Nome exibido do anunciante (pessoa ou empresa). */
  posterName: string;
  /** Empresa vinculada, quando a publicação é feita em nome de uma empresa. */
  businessId?: string;
  cityId?: string;
  cityName?: string;
  neighborhoodId?: string;
  neighborhoodName?: string;
  locationDetail?: string;
  /** Data de início (YYYY-MM-DD). Opcional para oportunidades recorrentes ou sem data. */
  startDate?: string;
  endDate?: string;
  schedule?: string;
  compensationType: CompensationType;
  compensationMin?: number;
  compensationMax?: number;
  compensationUnit?: string; // ex.: 'por dia', 'por hora', 'total'
  requirements?: string[];
  peopleNeeded: number;
  additionalInfo?: string;
  contactMethod: ContactMethod;
  /** Contato público apenas quando o anunciante escolheu WhatsApp/telefone/e-mail. */
  contactValue?: string;
  status: OpportunityStatus;
  applicationsCount?: number;
  /** Moderação administrativa: oculta da listagem pública sem apagar. */
  isHidden?: boolean;
  hiddenReason?: string;
  reportsCount?: number;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
}

export type ApplicationStatus = 'interested' | 'contacted' | 'selected' | 'declined' | 'withdrawn';

export const APPLICATION_STATUS_LABELS: Record<ApplicationStatus, string> = {
  interested: 'Interesse enviado',
  contacted: 'Em contato',
  selected: 'Selecionado(a)',
  declined: 'Não selecionado(a)',
  withdrawn: 'Desistiu',
};

/** Candidatura/manifestação de interesse. Documento com id = uid do candidato (evita duplicidade). */
export interface OpportunityApplication {
  id: string;
  opportunityId: string;
  opportunityTitle: string;
  opportunityOwnerId: string;
  applicantId: string;
  applicantName: string;
  /** Contato do candidato: visível somente para o anunciante, o próprio candidato e admins. */
  applicantContact?: string;
  message?: string;
  status: ApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OpportunityHistoryEntry {
  id: string;
  actorId: string;
  action: 'created' | 'updated' | 'status_changed' | 'hidden' | 'unhidden';
  fromStatus?: OpportunityStatus;
  toStatus?: OpportunityStatus;
  note?: string;
  at: string;
}

export type ReportTargetType = 'opportunity' | 'business' | 'review';

export interface ContentReport {
  id: string;
  targetType: ReportTargetType;
  targetId: string;
  targetTitle?: string;
  reporterId: string;
  reason: string;
  details?: string;
  status: 'open' | 'resolved' | 'dismissed';
  createdAt: string;
  resolvedAt?: string;
  resolvedBy?: string;
}

// ===============================================================
// Registro de conexões (eventos de interação)
// ===============================================================

export type InteractionType =
  | 'business_view'
  | 'whatsapp_click'
  | 'phone_click'
  | 'website_click'
  | 'map_click'
  | 'social_click'
  | 'menu_open'
  | 'delivery_click'
  | 'booking_click'
  | 'share'
  | 'collection_view'
  | 'coupon_redeem'
  | 'opportunity_view'
  | 'opportunity_interest'
  | 'specialist_referral';

export const INTERACTION_LABELS: Record<InteractionType, string> = {
  business_view: 'Visualizações do perfil',
  whatsapp_click: 'Cliques no WhatsApp',
  phone_click: 'Cliques no telefone',
  website_click: 'Acessos ao site',
  map_click: 'Pedidos de rota',
  social_click: 'Cliques no Instagram',
  menu_open: 'Cardápio aberto',
  delivery_click: 'Cliques no delivery',
  booking_click: 'Cliques em agendamento',
  share: 'Compartilhamentos',
  collection_view: 'Visualizações de coleção',
  coupon_redeem: 'Cupons resgatados',
  opportunity_view: 'Visualizações de oportunidade',
  opportunity_interest: 'Interesses em oportunidade',
  specialist_referral: 'Encaminhamentos para atendimento especializado',
};

/**
 * Evento de interação. Não guarda dados pessoais: usa um identificador de sessão
 * aleatório (sessionId) e, quando a pessoa está logada, apenas indica isso (isAuthenticated).
 */
export interface InteractionEvent {
  id?: string;
  type: InteractionType;
  entityType: 'business' | 'collection' | 'coupon' | 'opportunity' | 'specialist';
  entityId: string;
  /** Dono da entidade, quando houver (permite à empresa consultar seus próprios eventos). */
  ownerId?: string;
  /** Origem do acesso: busca, guia, home, coleção, link externo, etc. */
  source?: string;
  /** Parâmetro de campanha/parceiro (ex.: ?ref=parceiro). */
  ref?: string;
  sessionId: string;
  isAuthenticated: boolean;
  createdAt: string; // ISO
  day: string; // YYYY-MM-DD, para agregações
}

/** Configuração do encaminhamento para atendimento especializado (ex.: Guida Trips). */
export interface SpecialistReferralSettings {
  enabled: boolean;
  /** Nome exibido. Identificado como operação do ecossistema, sem prioridade oculta. */
  partnerName: string;
  description?: string;
  whatsapp?: string;
  url?: string;
}

export const PROTECTED_CATEGORIES =['Gastronomia', 'Hospedagem', 'Comércio', 'Serviços'];
export const DEFAULT_CATEGORIES = [...PROTECTED_CATEGORIES, 'Passeios', 'Entretenimento'];

export const AMENITIES_LABELS: { [key: string]: string } = {
    wifi: 'Wi-Fi Grátis',
    ac: 'Ar Condicionado',
    parking: 'Estacionamento',
    access: 'Acessibilidade',
    kids: 'Espaço Kids',
    pet: 'Pet Friendly',
    pool: 'Piscina',
    breakfast: 'Café da Manhã',
    tv: 'Televisão',
    bar: 'Bar no Local',
    card: 'Aceita Cartão',
    delivery: 'Faz Entrega'
};

export const DEFAULT_AMENITIES: AppAmenity[] = [
    { id: 'wifi', label: 'Wi-Fi Grátis' },
    { id: 'ac', label: 'Ar Condicionado' },
    { id: 'parking', label: 'Estacionamento' },
    { id: 'access', label: 'Acessibilidade' },
    { id: 'kids', label: 'Espaço Kids' },
    { id: 'pet', label: 'Pet Friendly' },
    { id: 'pool', label: 'Piscina' },
    { id: 'breakfast', label: 'Café da Manhã' },
    { id: 'tv', label: 'Televisão' },
    { id: 'bar', label: 'Bar no Local' },
    { id: 'card', label: 'Aceita Cartão' },
    { id: 'delivery', label: 'Faz Entrega' }
];

export interface BlogAd {
  id: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  tag: string;
  actionLabel?: string;
  badgeColor?: string;
  targetCategory?: string; // category inside guide (e.g. Passeios)
  active: boolean;
  order: number;
}

