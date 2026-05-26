
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
  manualPassword?: string;
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
}

export interface Collection {
  id: string;
  title: string;
  description: string;
  coverImage: string;
  businessIds: string[];
  active: boolean;
  order: number;
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
}

export interface PaymentSettings {
  isPaymentActive: boolean;
  isTestMode: boolean; // PagBank Sandbox
  isDirectPaymentTest: boolean; // Direct bypass for testing
  pagbankToken?: string;
  pagbankWebhookSecret?: string;
  salesWhatsapp?: string; // Adicionado aqui também por conveniência se preferir usar PaymentSettings
}

export const PROTECTED_CATEGORIES = ['Gastronomia', 'Hospedagem', 'Comércio', 'Serviços'];
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
