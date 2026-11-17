/**
 * Catálogo único de comodidades do Lagos GO.
 * Cada comodidade diz para que TIPO de negócio faz sentido: "Faz entrega" é de comida e comércio,
 * não de hotel; "Piscina" é de hotel e beach club, não de farmácia. O mesmo catálogo alimenta
 * o cadastro da empresa (só mostra o que se aplica) e o filtro do usuário (idem).
 * Funções puras, sem Firebase.
 */

/** Tipo de negócio, para decidir quais comodidades aparecem. */
export type BusinessKind = 'restaurante' | 'bar' | 'hotel' | 'passeio' | 'atracao' | 'comercio' | 'servico';

export type AmenityGroup = 'geral' | 'pagamento' | 'comida' | 'ambiente' | 'noite' | 'hospedagem' | 'lazer' | 'passeio' | 'praia' | 'comercio' | 'servico';

export interface AmenityDef {
  id: string;
  label: string;
  group: AmenityGroup;
  /** Tipos de negócio a que se aplica. Ausente = vale para todos. */
  kinds?: BusinessKind[];
}

export const AMENITY_GROUP_LABEL: Record<AmenityGroup, string> = {
  geral: 'Geral',
  pagamento: 'Pagamento',
  comida: 'Comida e bebida',
  ambiente: 'Ambiente',
  noite: 'Noite e música',
  hospedagem: 'Hospedagem',
  lazer: 'Lazer e conforto',
  passeio: 'Passeio',
  praia: 'Praia e natureza',
  comercio: 'Compras',
  servico: 'Atendimento',
};

const FOOD: BusinessKind[] = ['restaurante', 'bar'];
const STAY: BusinessKind[] = ['hotel'];
const ALL_PLACES: BusinessKind[] = ['restaurante', 'bar', 'hotel', 'passeio', 'atracao', 'comercio', 'servico'];

export const AMENITY_CATALOG: AmenityDef[] = [
  // ---- Geral (os ids antigos continuam os mesmos: nada que já está cadastrado se perde)
  { id: 'wifi', label: 'Wi-Fi Grátis', group: 'geral', kinds: ['restaurante', 'bar', 'hotel', 'comercio', 'servico'] },
  { id: 'ac', label: 'Ar Condicionado', group: 'geral', kinds: ['restaurante', 'bar', 'hotel', 'comercio', 'servico'] },
  { id: 'parking', label: 'Estacionamento', group: 'geral' },
  { id: 'parking_free', label: 'Estacionamento gratuito', group: 'geral', kinds: ['restaurante', 'bar', 'hotel', 'comercio', 'servico', 'passeio'] },
  { id: 'valet', label: 'Manobrista', group: 'geral', kinds: ['restaurante', 'bar', 'hotel'] },
  { id: 'access', label: 'Acessibilidade', group: 'geral' },
  { id: 'pet', label: 'Pet Friendly', group: 'geral' },
  { id: 'kids', label: 'Espaço Kids', group: 'geral', kinds: ['restaurante', 'hotel', 'passeio', 'atracao'] },
  { id: 'english', label: 'Atendimento em inglês', group: 'geral' },
  { id: 'whatsapp_service', label: 'Atende por WhatsApp', group: 'geral' },
  { id: 'open_sunday', label: 'Abre aos domingos', group: 'geral', kinds: ['restaurante', 'bar', 'comercio', 'servico'] },
  { id: 'open_late', label: 'Aberto até tarde', group: 'geral', kinds: ['restaurante', 'bar', 'comercio', 'servico'] },
  { id: 'open_24h', label: 'Aberto 24 horas', group: 'geral', kinds: ['comercio', 'servico', 'hotel'] },

  // ---- Pagamento
  { id: 'card', label: 'Aceita Cartão', group: 'pagamento', kinds: ALL_PLACES.filter(k => k !== 'atracao') },
  { id: 'pix', label: 'Aceita Pix', group: 'pagamento', kinds: ALL_PLACES.filter(k => k !== 'atracao') },
  { id: 'installments', label: 'Parcela no cartão', group: 'pagamento', kinds: ['hotel', 'passeio', 'comercio', 'servico'] },
  { id: 'meal_voucher', label: 'Aceita vale-refeição', group: 'pagamento', kinds: FOOD },

  // ---- Comida e bebida
  { id: 'delivery', label: 'Faz Entrega', group: 'comida', kinds: ['restaurante', 'bar', 'comercio'] },
  { id: 'free_delivery', label: 'Entrega grátis', group: 'comida', kinds: ['restaurante', 'bar', 'comercio'] },
  { id: 'takeaway', label: 'Retirada no local', group: 'comida', kinds: ['restaurante', 'bar', 'comercio'] },
  { id: 'reservation', label: 'Aceita reservas', group: 'comida', kinds: ['restaurante', 'bar', 'passeio'] },
  { id: 'buffet', label: 'Self-service / buffet', group: 'comida', kinds: ['restaurante'] },
  { id: 'rodizio', label: 'Rodízio', group: 'comida', kinds: ['restaurante'] },
  { id: 'kids_menu', label: 'Cardápio infantil', group: 'comida', kinds: ['restaurante'] },
  { id: 'vegetarian', label: 'Opções vegetarianas', group: 'comida', kinds: ['restaurante', 'bar'] },
  { id: 'vegan', label: 'Opções veganas', group: 'comida', kinds: ['restaurante', 'bar'] },
  { id: 'gluten_free', label: 'Opções sem glúten', group: 'comida', kinds: ['restaurante', 'bar'] },
  { id: 'lactose_free', label: 'Opções sem lactose', group: 'comida', kinds: ['restaurante', 'bar'] },
  { id: 'bar', label: 'Bar no Local', group: 'comida', kinds: ['restaurante', 'hotel'] },
  { id: 'happy_hour', label: 'Happy hour', group: 'comida', kinds: FOOD },
  { id: 'breakfast', label: 'Café da Manhã', group: 'comida', kinds: ['hotel', 'restaurante'] },
  { id: 'group_friendly', label: 'Atende grupos', group: 'comida', kinds: ['restaurante', 'bar', 'passeio'] },

  // ---- Ambiente
  { id: 'sea_view', label: 'Vista para o mar', group: 'ambiente', kinds: ['restaurante', 'bar', 'hotel'] },
  { id: 'beachfront', label: 'Pé na areia', group: 'ambiente', kinds: ['restaurante', 'bar', 'hotel'] },
  { id: 'near_beach', label: 'Perto da praia', group: 'ambiente', kinds: STAY },
  { id: 'outdoor', label: 'Área ao ar livre', group: 'ambiente', kinds: ['restaurante', 'bar', 'hotel'] },
  { id: 'sunset', label: 'Pôr do sol', group: 'ambiente', kinds: ['restaurante', 'bar'] },
  { id: 'tv', label: 'Televisão', group: 'ambiente', kinds: ['restaurante', 'bar', 'hotel'] },
  { id: 'romantic', label: 'Ambiente romântico', group: 'ambiente', kinds: ['restaurante', 'bar', 'hotel'] },

  // ---- Noite e música
  { id: 'live_music', label: 'Música ao vivo', group: 'noite', kinds: FOOD },
  { id: 'dj', label: 'DJ', group: 'noite', kinds: ['bar'] },
  { id: 'dance_floor', label: 'Pista de dança', group: 'noite', kinds: ['bar'] },
  { id: 'vip_area', label: 'Área VIP / camarote', group: 'noite', kinds: ['bar'] },
  { id: 'sports_tv', label: 'Transmite jogos', group: 'noite', kinds: ['bar', 'restaurante'] },
  { id: 'cover_free', label: 'Sem consumação mínima', group: 'noite', kinds: ['bar'] },

  // ---- Hospedagem
  { id: 'pool', label: 'Piscina', group: 'hospedagem', kinds: ['hotel', 'bar', 'restaurante'] },
  { id: 'reception_24h', label: 'Recepção 24h', group: 'hospedagem', kinds: STAY },
  { id: 'room_service', label: 'Serviço de quarto', group: 'hospedagem', kinds: STAY },
  { id: 'breakfast_included', label: 'Café da manhã incluso', group: 'hospedagem', kinds: STAY },
  { id: 'airport_transfer', label: 'Traslado / transfer', group: 'hospedagem', kinds: STAY },
  { id: 'daily_cleaning', label: 'Limpeza diária', group: 'hospedagem', kinds: STAY },
  { id: 'laundry', label: 'Lavanderia', group: 'hospedagem', kinds: STAY },
  { id: 'kitchenette', label: 'Cozinha equipada', group: 'hospedagem', kinds: STAY },
  { id: 'family_rooms', label: 'Quartos para família', group: 'hospedagem', kinds: STAY },
  { id: 'adults_only', label: 'Só para adultos', group: 'hospedagem', kinds: STAY },
  { id: 'restaurant_onsite', label: 'Restaurante no local', group: 'hospedagem', kinds: STAY },
  { id: 'elevator', label: 'Elevador', group: 'hospedagem', kinds: STAY },
  { id: 'safe', label: 'Cofre', group: 'hospedagem', kinds: STAY },
  { id: 'beach_gear', label: 'Cadeiras e guarda-sol de praia', group: 'hospedagem', kinds: STAY },

  // ---- Lazer e conforto
  { id: 'spa', label: 'Spa', group: 'lazer', kinds: ['hotel', 'servico'] },
  { id: 'sauna', label: 'Sauna', group: 'lazer', kinds: STAY },
  { id: 'gym', label: 'Academia', group: 'lazer', kinds: STAY },
  { id: 'garden', label: 'Jardim', group: 'lazer', kinds: STAY },
  { id: 'barbecue', label: 'Churrasqueira', group: 'lazer', kinds: STAY },
  { id: 'bikes', label: 'Bicicletas', group: 'lazer', kinds: STAY },

  // ---- Passeio
  { id: 'guide_included', label: 'Guia incluso', group: 'passeio', kinds: ['passeio'] },
  { id: 'equipment_included', label: 'Equipamentos inclusos', group: 'passeio', kinds: ['passeio'] },
  { id: 'hotel_pickup', label: 'Busca no hotel', group: 'passeio', kinds: ['passeio'] },
  { id: 'photos_included', label: 'Fotos incluídas', group: 'passeio', kinds: ['passeio'] },
  { id: 'drinks_onboard', label: 'Bebidas e lanche a bordo', group: 'passeio', kinds: ['passeio'] },
  { id: 'life_jackets', label: 'Coletes salva-vidas', group: 'passeio', kinds: ['passeio'] },
  { id: 'private_tour', label: 'Passeio privativo', group: 'passeio', kinds: ['passeio'] },
  { id: 'small_group', label: 'Grupos pequenos', group: 'passeio', kinds: ['passeio'] },
  { id: 'free_cancel', label: 'Cancelamento grátis', group: 'passeio', kinds: ['passeio', 'hotel'] },

  // ---- Praia e natureza
  { id: 'restrooms', label: 'Banheiros', group: 'praia', kinds: ['atracao'] },
  { id: 'showers', label: 'Chuveiros', group: 'praia', kinds: ['atracao'] },
  { id: 'lifeguard', label: 'Salva-vidas', group: 'praia', kinds: ['atracao'] },
  { id: 'kiosks', label: 'Quiosques', group: 'praia', kinds: ['atracao'] },
  { id: 'chair_rental', label: 'Aluguel de cadeiras e guarda-sol', group: 'praia', kinds: ['atracao'] },
  { id: 'calm_water', label: 'Mar calmo', group: 'praia', kinds: ['atracao'] },
  { id: 'free_entry', label: 'Entrada gratuita', group: 'praia', kinds: ['atracao'] },

  // ---- Compras e serviços
  { id: 'exchange', label: 'Aceita trocas', group: 'comercio', kinds: ['comercio'] },
  { id: 'gift_wrap', label: 'Embalagem para presente', group: 'comercio', kinds: ['comercio'] },
  { id: 'home_service', label: 'Atende a domicílio', group: 'servico', kinds: ['servico'] },
  { id: 'by_appointment', label: 'Com agendamento', group: 'servico', kinds: ['servico'] },
  { id: 'free_quote', label: 'Orçamento grátis', group: 'servico', kinds: ['servico'] },
  { id: 'emergency', label: 'Plantão / urgência', group: 'servico', kinds: ['servico'] },
];

export const AMENITY_BY_ID: Record<string, AmenityDef> = Object.fromEntries(AMENITY_CATALOG.map(a => [a.id, a]));

const n = (s: string = '') => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim();

const NIGHT_SUBS = ['bares e quiosques', 'beach clubs', 'baladas e casas noturnas', 'bares', 'casas noturnas', 'vida noturna'];
const ATTRACTION_SUBS = ['praias', 'natureza', 'trilhas', 'mirantes', 'pontos historicos', 'cultura'];

/** Tipo do negócio, a partir da categoria e da subcategoria cadastradas. Sem categoria conhecida: undefined. */
export const businessKind = (b: { category?: string; subcategory?: string }): BusinessKind | undefined => {
  const cat = n(b.category);
  const sub = n(b.subcategory);
  if (ATTRACTION_SUBS.includes(sub)) return 'atracao';
  if (cat === 'gastronomia') return NIGHT_SUBS.includes(sub) ? 'bar' : 'restaurante';
  if (cat === 'hospedagem') return 'hotel';
  if (cat === 'passeios' || cat === 'entretenimento') return 'passeio';
  if (cat === 'comercio' || cat === 'compras') return 'comercio';
  if (cat === 'servicos' || cat === 'bem-estar e beleza') return 'servico';
  return undefined;
};

/** Id da categoria da tela Descubra → tipo de negócio (undefined = sem tipo único, mostra tudo que existe). */
export const KIND_BY_DISCOVER_CATEGORY: Record<string, BusinessKind> = {
  praias: 'atracao',
  restaurantes: 'restaurante',
  barco: 'passeio',
  passeios: 'passeio',
  hospedagens: 'hotel',
  bares: 'bar',
  natureza: 'atracao',
  cultura: 'atracao',
  servicos: 'servico',
  comercio: 'comercio',
};

/** A comodidade vale para este tipo? Comodidade sem `kinds` (ou criada pelo admin) vale para todos. */
export const amenityAppliesTo = (a: { kinds?: BusinessKind[] }, kind?: BusinessKind): boolean =>
  !a.kinds || !kind || a.kinds.includes(kind);

/** Comodidades que a empresa pode marcar no cadastro, na ordem do catálogo. */
export const amenitiesForKind = (kind?: BusinessKind): AmenityDef[] => AMENITY_CATALOG.filter(a => amenityAppliesTo(a, kind));

/** Agrupa para exibir no cadastro (títulos de seção). */
export const groupAmenities = (list: AmenityDef[]): { group: AmenityGroup; label: string; items: AmenityDef[] }[] => {
  const out: { group: AmenityGroup; label: string; items: AmenityDef[] }[] = [];
  for (const a of list) {
    let g = out.find(x => x.group === a.group);
    if (!g) { g = { group: a.group, label: AMENITY_GROUP_LABEL[a.group], items: [] }; out.push(g); }
    g.items.push(a);
  }
  return out;
};
