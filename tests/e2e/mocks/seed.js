import { seed } from './store.js';

seed((s) => {
  const now = new Date().toISOString();
  s.users = {
    ana: { email: 'ana@teste.com', password: 'senha123', name: 'Ana', emailVerified: true },
    bruno: { email: 'bruno@teste.com', password: 'senha123', name: 'Bruno', emailVerified: true },
    adm: { email: 'admin@teste.com', password: 'senha123', name: 'Admin', emailVerified: true },
    carla: { email: 'carla@teste.com', password: 'senha123', name: 'Carla', emailVerified: true },
  };
  const d = s.docs;
  d['users/ana'] = { id: 'ana', name: 'Ana', surname: 'Souza', email: 'ana@teste.com', role: 'COMPANY', favorites: { coupons: [], businesses: [] }, history: [], savedAmount: 0 };
  d['users/bruno'] = { id: 'bruno', name: 'Bruno', email: 'bruno@teste.com', role: 'CUSTOMER', phone: '22999990000', favorites: { coupons: [], businesses: [] }, history: [], savedAmount: 0 };
  d['users/adm'] = { id: 'adm', name: 'Admin', email: 'admin@teste.com', role: 'SUPER_ADMIN', favorites: { coupons: [], businesses: [] }, history: [], savedAmount: 0 };
  d['users/carla'] = { id: 'carla', name: 'Carla', email: 'carla@teste.com', role: 'CUSTOMER', permissions: { canCreateBusiness: true, canCreateCoupons: false, canManageBusiness: false }, favorites: { coupons: [], businesses: [] }, history: [], savedAmount: 0 };
  d['cities/arraial'] = { id: 'arraial', name: 'Arraial do Cabo', active: true };
  d['cities/cabo-frio'] = { id: 'cabo-frio', name: 'Cabo Frio', active: true };
  d['neighborhoods/praia-anjos'] = { id: 'praia-anjos', cityId: 'arraial', name: 'Praia dos Anjos', active: true, lat: -22.97, lng: -42.02 };
  d['neighborhoods/centro-cf'] = { id: 'centro-cf', cityId: 'cabo-frio', name: 'Centro', active: true, lat: -22.88, lng: -42.02 };
  d['app_categories_guia/passeios'] = { id: 'passeios', name: 'Passeios', subcategories: [] };
  d['app_categories_guia/gastronomia'] = { id: 'gastronomia', name: 'Gastronomia', subcategories: [] };
  d['pricingPlans/basic'] = { id: 'basic', name: 'Básico', price: 49.9, period: 'monthly', maxCoupons: 3, maxBusinesses: 1, isFeatured: false, showGallery: false, showMenu: false, showSocialMedia: true, showReviews: false, active: true };
  d['businesses/ana'] = { id: 'ana', ownerId: 'ana', name: 'Barco Azul Passeios', category: 'Passeios', description: 'Passeios de barco em Arraial do Cabo.', coverImage: '', gallery: [], address: 'Praia dos Anjos', phone: '2226220000', whatsapp: '22999998888', amenities: [], openingHours: {}, rating: 5, isBlocked: false, status: 'approved', cityId: 'arraial', neighborhoodId: 'praia-anjos' };
  d['coupons/c1'] = { id: 'c1', companyId: 'ana', companyName: 'Barco Azul Passeios', title: '10% no passeio', description: 'Desconto no passeio de barco', originalPrice: 100, discountedPrice: 90, discountPercentage: 10, imageUrl: '', category: 'Passeios', expiryDate: '2027-12-31', status: 'approved', code: 'AZUL10', active: true, currentRedemptions: 0, maxRedemptions: 100, limitPerUser: 1 };
  d['app_settings/global'] = { salesWhatsapp: '22999997777', specialistReferral: { enabled: true, partnerName: 'Guida Trips', description: 'Ajuda para montar roteiros na região.', whatsapp: '22999996666' } };
});
