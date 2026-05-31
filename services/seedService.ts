
import { BusinessProfile, AppCategory, City, Neighborhood, UserRole } from '../types';
import { 
  createAdminPlace, 
  getCities, 
  getNeighborhoods, 
  getCategories,
  saveCity,
  saveNeighborhood,
  saveCategory
} from './dataService';

/**
 * Ensures a city exists, creating it if necessary.
 */
async function ensureCity(cityName: string, cities: City[]): Promise<City> {
  const existing = cities.find(c => c.name.toLowerCase() === cityName.toLowerCase());
  if (existing) return existing;

  const newCity: City = {
    id: `city_${cityName.toLowerCase().replace(/\s+/g, '_')}`,
    name: cityName,
    active: true
  };
  await saveCity(newCity);
  cities.push(newCity);
  return newCity;
}

/**
 * Ensures a neighborhood exists for a city, creating it if necessary.
 */
async function ensureNeighborhood(name: string, cityId: string, neighborhoods: Neighborhood[]): Promise<Neighborhood> {
  const existing = neighborhoods.find(n => n.name.toLowerCase() === name.toLowerCase() && n.cityId === cityId);
  if (existing) return existing;

  const newNeighborhood: Neighborhood = {
    id: `nh_${name.toLowerCase().replace(/\s+/g, '_')}_${cityId}`,
    cityId,
    name: name,
    active: true
  };
  await saveNeighborhood(newNeighborhood);
  neighborhoods.push(newNeighborhood);
  return newNeighborhood;
}

/**
 * Ensures a category and its subcategories exist.
 */
async function ensureCategory(catName: string, subNames: string[], categories: AppCategory[]): Promise<AppCategory> {
  const existing = categories.find(c => c.name.toLowerCase() === catName.toLowerCase());
  if (existing) {
    // Ensure subcategories exist
    let changed = false;
    subNames.forEach(sub => {
      if (!existing.subcategories.find(s => s.name.toLowerCase() === sub.toLowerCase())) {
        existing.subcategories.push({ id: `sub_${sub.toLowerCase().replace(/\s+/g, '_')}`, name: sub });
        changed = true;
      }
    });
    if (changed) await saveCategory(existing);
    return existing;
  }

  const newCategory: AppCategory = {
    id: `cat_${catName.toLowerCase().replace(/\s+/g, '_')}`,
    name: catName,
    subcategories: subNames.map(sub => ({ id: `sub_${sub.toLowerCase().replace(/\s+/g, '_')}`, name: sub }))
  };
  await saveCategory(newCategory);
  categories.push(newCategory);
  return newCategory;
}

export const seedTouristSpots = async (notify: (type: 'success' | 'error', msg: string) => void) => {
  try {
    const cities = await getCities();
    const neighborhoods = await getNeighborhoods();
    const categories = await getCategories();

    // Ensure Prerequisites
    const arraial = await ensureCity('Arraial do Cabo', cities);
    const caboFrio = await ensureCity('Cabo Frio', cities);

    const nhAtalaia = await ensureNeighborhood('Pontal do Atalaia', arraial.id, neighborhoods);
    const nhAnjos = await ensureNeighborhood('Praia dos Anjos', arraial.id, neighborhoods);
    const nhCentroArraial = await ensureNeighborhood('Centro', arraial.id, neighborhoods);
    
    const nhForte = await ensureNeighborhood('Praia do Forte', caboFrio.id, neighborhoods);
    const nhPassagem = await ensureNeighborhood('Passagem', caboFrio.id, neighborhoods);
    const nhGamboa = await ensureNeighborhood('Gamboa', caboFrio.id, neighborhoods);

    await ensureCategory('Passeios', ['Praias', 'Pontos Históricos', 'Natureza', 'Trilhas'], categories);
    await ensureCategory('Gastronomia', ['Centro Histórico', 'Restaurantes', 'Quiosques'], categories);
    await ensureCategory('Hospedagem', ['Hotéis', 'Pousadas', 'Hostels'], categories);

    const spots: Partial<BusinessProfile>[] = [
      // ARRAIAL DO CABO
      {
        name: 'Prainhas do Pontal do Atalaia',
        category: 'Passeios',
        subcategory: 'Praias',
        description: 'Um dos cartões-postais mais famosos de Arraial do Cabo. Conhecida pela sua icônica escadaria de madeira que desce o morro, revelando águas transparentes e calmas em tons de azul e verde. Perfeito para fotos panorâmicas e snorkeling.',
        address: 'Pontal do Atalaia, Arraial do Cabo',
        cityId: arraial.id,
        neighborhoodId: nhAtalaia.id,
        lat: -22.9840,
        lng: -42.0224,
        coverImage: 'https://images.unsplash.com/photo-1590523741831-ab7e8b8f9c7f?auto=format&fit=crop&q=80&w=1200',
        rating: 5.0,
        reviewCount: 1540,
        canBeClaimed: false
      },
      {
        name: 'Praia do Farol',
        category: 'Passeios',
        subcategory: 'Praias',
        description: 'Considerada uma das praias mais perfeitas do Brasil, localizada na Ilha do Cabo Frio. O acesso é exclusivamente por barco e o tempo de permanência é controlado pela Marinha. Águas cristalinas e areia branquíssima.',
        address: 'Ilha do Cabo Frio, Arraial do Cabo',
        cityId: arraial.id,
        lat: -23.0034,
        lng: -42.0008,
        coverImage: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&q=80&w=1200',
        rating: 5.0,
        reviewCount: 890,
        canBeClaimed: false
      },
      {
        name: 'Praia do Forno',
        category: 'Passeios',
        subcategory: 'Praias',
        description: 'Acessível por trilha ou barco a partir da Praia dos Anjos. Oferece uma baía de águas mornas e calmas, cercada por vegetação preservada. No alto da trilha, há um mirante com uma das vistas mais fotografadas da cidade.',
        address: 'Enseada do Forno, Arraial do Cabo',
        cityId: arraial.id,
        neighborhoodId: nhAnjos.id,
        lat: -22.9697,
        lng: -42.0125,
        coverImage: 'https://images.unsplash.com/photo-1544274483-3652def6d4f9?auto=format&fit=crop&q=80&w=1200',
        rating: 4.9,
        reviewCount: 2100,
        canBeClaimed: false
      },
      {
        name: 'Igreja Nossa Senhora dos Remédios',
        category: 'Passeios',
        subcategory: 'Pontos Históricos',
        description: 'Construída em 1506 pelos portugueses, é uma das primeiras igrejas do Brasil. Localizada próxima à Praia dos Anjos, marca o local onde Américo Vespúcio desembarcou. Um marco histórico de simplicidade e beleza colonial.',
        address: 'Largo da Praia dos Anjos, Arraial do Cabo',
        cityId: arraial.id,
        neighborhoodId: nhAnjos.id,
        lat: -22.9715,
        lng: -42.0220,
        coverImage: 'https://images.unsplash.com/photo-1548543604-a87c9909abec?auto=format&fit=crop&q=80&w=1200',
        rating: 4.7,
        reviewCount: 320,
        canBeClaimed: false
      },

      {
        name: 'Praia Grande',
        category: 'Passeios',
        subcategory: 'Praias',
        description: 'Famosa pela extensa faixa de areia branca e por ter um dos pores do sol mais incríveis do mundo, onde o sol se põe diretamente no mar. Suas águas são frias (fenômeno da ressurgência) e frequentemente apresenta ondas fortes, o que atrai muitos surfistas. A orla é urbanizada com vários quiosques e restaurantes.',
        address: 'Orla Flávia Alessandra, Praia Grande, Arraial do Cabo',
        cityId: arraial.id,
        lat: -22.9721,
        lng: -42.0298,
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
        rating: 4.8,
        reviewCount: 3200,
        canBeClaimed: false
      },
      {
        name: 'Prainha',
        category: 'Passeios',
        subcategory: 'Praias',
        description: 'Primeira praia que se avista ao chegar na cidade. Suas águas são calmas, rasas e de um azul impressionante, tornando-a perfeita para famílias com crianças. Na maré baixa, o contraste da areia com o mar forma um cenário espetacular. O canto direito é ideal para praticar snorkel.',
        address: 'Prainha, Arraial do Cabo',
        cityId: arraial.id,
        lat: -22.9613,
        lng: -42.0223,
        coverImage: 'https://images.unsplash.com/photo-1544274483-3652def6d4f9?auto=format&fit=crop&q=80&w=1200',
        rating: 4.6,
        reviewCount: 2850,
        canBeClaimed: false
      },
      {
        name: 'Praia da Graçainha',
        category: 'Passeios',
        subcategory: 'Praias',
        description: 'Uma enseada minúscula e pouco conhecida localizada no início do caminho para o Pontal do Atalaia. Na maré baixa, revela piscinas naturais ricas em algas e estrelas-do-mar. É um dos melhores pontos quase secretos para mergulho livre (snorkel) e observação de tartarugas marinhas, devido à abundância de alimento nas pedras.',
        address: 'Canto Direito da Prainha, Arraial do Cabo',
        cityId: arraial.id,
        lat: -22.9640,
        lng: -42.0190,
        rating: 4.9,
        reviewCount: 412,
        canBeClaimed: false
      },
      {
        name: 'Praia dos Anjos',
        category: 'Passeios',
        subcategory: 'Praias',
        description: 'A praia com maior importância histórica e o principal ponto de partida dos famosos passeios de barco de Arraial. Normalmente suas águas recebem muitas embarcações e pescadores, mas o canto direito (próximo à trilha do Forno) oferece águas claras para banho. No centro, fica o marco histórico onde a esquadra de Américo Vespúcio aportou em 1503.',
        address: 'Praia dos Anjos, Arraial do Cabo',
        cityId: arraial.id,
        neighborhoodId: nhAnjos.id,
        lat: -22.9715,
        lng: -42.0125,
        rating: 4.5,
        reviewCount: 1540,
        canBeClaimed: false
      },
      {
        name: 'Pousada Caminho do Sol',
        category: 'Hospedagem',
        subcategory: 'Pousadas',
        description: 'Uma pousada de charme exclusiva localizada a poucos passos das areias da Praia Grande, o melhor ponto para assistir ao belíssimo pôr do sol de Arraial do Cabo. Com uma arquitetura que abraça a natureza e ambientes ricamente decorados, a Caminho do Sol oferece uma experiência de relaxamento total. Possui área de lazer completa, restaurante próprio com gastronomia requintada e quartos aconchegantes e serenos com decoração praiana moderna.',
        address: 'Rua Pedro Alexander, Praia Grande, Arraial do Cabo',
        cityId: arraial.id,
        lat: -22.9730,
        lng: -42.0280,
        coverImage: 'https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&q=80&w=1200',
        gallery: [
            'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1540518614846-7ededdd8ebc3?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1560662105-57f8ad6ae2d1?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1584132905271-512c958d674a?auto=format&fit=crop&q=80&w=1200'
        ],
        amenities: ['wifi', 'ac', 'pool', 'breakfast', 'tv', 'bar', 'parking'],
        openingHours: {
          seg: { open: '00:00', close: '23:59' },
          ter: { open: '00:00', close: '23:59' },
          qua: { open: '00:00', close: '23:59' },
          qui: { open: '00:00', close: '23:59' },
          sex: { open: '00:00', close: '23:59' },
          sab: { open: '00:00', close: '23:59' },
          dom: { open: '00:00', close: '23:59' }
        },
        phone: '(22) 2622-2000',
        instagram: '@caminhodosolarraial',
        rating: 4.8,
        reviewCount: 3125,
        canBeClaimed: true,
        plan: 'premium',
        isFeatured: true
      },
      // CABO FRIO
      {
        name: 'Forte São Mateus',
        category: 'Passeios',
        subcategory: 'Pontos Históricos',
        description: 'Monumento histórico do século XVII localizado no canto esquerdo da Praia do Forte. Oferece uma vista espetacular de toda a orla e do Canal Itajuru. Suas muralhas e canhões preservam a história da defesa da costa brasileira.',
        address: 'Praia do Forte, Cabo Frio',
        cityId: caboFrio.id,
        neighborhoodId: nhForte.id,
        lat: -22.8872,
        lng: -42.0055,
        coverImage: 'https://images.unsplash.com/photo-1564507592333-c60657eaa0ae?auto=format&fit=crop&q=80&w=1200',
        rating: 4.8,
        reviewCount: 4500,
        canBeClaimed: false
      },
      {
        name: 'Bairro da Passagem',
        category: 'Gastronomia',
        subcategory: 'Centro Histórico',
        description: 'O bairro mais antigo e charmoso de Cabo Frio. Com arquitetura colonial preservada, ruas de paralelepípedos e praças arborizadas, o local se transformou em um polo gastronômico com diversos restaurantes e música ao vivo.',
        address: 'Bairro da Passagem, Cabo Frio',
        cityId: caboFrio.id,
        neighborhoodId: nhPassagem.id,
        lat: -22.8797,
        lng: -42.0125,
        coverImage: 'https://images.unsplash.com/photo-1578307336481-3fd080447043?auto=format&fit=crop&q=80&w=1200',
        rating: 4.9,
        reviewCount: 1200,
        canBeClaimed: false
      },
      {
        name: 'Ilha do Japonês',
        category: 'Passeios',
        subcategory: 'Natureza',
        description: 'Um paraíso de águas rasas e calmas situado no Canal Itajuru. Ideal para famílias com crianças, stand-up paddle e caiaque. Localizada dentro do Parque Estadual da Costa do Sol, oferece contato direto com a natureza preservada.',
        address: 'Canal Itajuru, Cabo Frio',
        cityId: caboFrio.id,
        neighborhoodId: nhGamboa.id,
        lat: -22.8712,
        lng: -41.9950,
        coverImage: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&q=80&w=1200',
        rating: 4.8,
        reviewCount: 3400,
        canBeClaimed: false
      },
      {
        name: 'Rua dos Biquínis (Gamboa)',
        category: 'Passeios',
        subcategory: 'Natureza',
        description: 'O maior polo de moda praia do Brasil. São centenas de lojas que vendem biquínis, maiôs e acessórios produzidos localmente. Um shopping a céu aberto indispensável para quem visita a cidade em busca de qualidade e variedade.',
        address: 'Rua José Barbosa da Silva, Cabo Frio',
        cityId: caboFrio.id,
        neighborhoodId: nhGamboa.id,
        lat: -22.8750,
        lng: -42.0180,
        coverImage: 'https://images.unsplash.com/photo-1583209814613-5124f999d115?auto=format&fit=crop&q=80&w=1200',
        rating: 4.6,
        reviewCount: 2800,
        canBeClaimed: false
      },
      {
        name: 'Hotel Paradiso Corporate',
        category: 'Hospedagem',
        subcategory: 'Hotéis',
        description: 'O Hotel Paradiso Corporate é sinônimo de luxo e conforto em Cabo Frio, trazendo um padrão de classe mundial para a Região dos Lagos. Localizado estrategicamente com vista fácil e rápida para a Praia do Forte. A estrutura inclui piscina de borda infinita no rooftop com vista deslumbrante 360º de Cabo Frio, restaurantes de bistronomia internacional, academia requintada completa e suítes espaçosas com varanda. Um refúgio esplêndido para férias espetaculares ou encontros de negócios.',
        address: 'Avenida Teixeira e Souza, Braga, Cabo Frio',
        cityId: caboFrio.id,
        neighborhoodId: nhForte.id,
        lat: -22.8850,
        lng: -42.0250,
        coverImage: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&q=80&w=1200',
        gallery: [
            'https://images.unsplash.com/photo-1551882547-ff40c0d5b150?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1611892440504-42a792e24d32?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&q=80&w=1200',
            'https://images.unsplash.com/photo-1535827841776-24afc1e255ac?auto=format&fit=crop&q=80&w=1200'
        ],
        amenities: ['wifi', 'ac', 'pool', 'breakfast', 'tv', 'bar', 'access', 'card', 'parking'],
        openingHours: {
          seg: { open: '00:00', close: '23:59' },
          ter: { open: '00:00', close: '23:59' },
          qua: { open: '00:00', close: '23:59' },
          qui: { open: '00:00', close: '23:59' },
          sex: { open: '00:00', close: '23:59' },
          sab: { open: '00:00', close: '23:59' },
          dom: { open: '00:00', close: '23:59' }
        },
        phone: '(22) 2643-3000',
        instagram: '@paradisocorporate',
        rating: 4.9,
        reviewCount: 4522,
        canBeClaimed: true,
        plan: 'premium',
        isFeatured: true
      },
      {
        name: 'Canal Itajuru',
        category: 'Passeios',
        subcategory: 'Natureza',
        description: 'O canal navegável que liga a Lagoa de Araruama ao Oceano Atlântico. É o local ideal para passeios de barco ao pôr do sol, caminhadas na orla revitalizada e observação dos tradicionais barcos de pesca coloridos de Cabo Frio.',
        address: 'Orla do Canal, Cabo Frio',
        cityId: caboFrio.id,
        neighborhoodId: nhCentroArraial.id, // Just using center as fallback
        lat: -22.8810,
        lng: -42.0150,
        coverImage: 'https://images.unsplash.com/photo-1499793983690-e29da59ef1c2?auto=format&fit=crop&q=80&w=1200',
        rating: 4.7,
        reviewCount: 1560,
        canBeClaimed: false
      }
    ];

    for (const spot of spots) {
      await createAdminPlace(spot);
    }

    notify('success', `${spots.length} locais oficiais em Arraial e Cabo Frio foram sincronizados com sucesso!`);
  } catch (error: any) {
    console.error("Seed error:", error);
    notify('error', error.message || 'Erro ao sincronizar pontos turísticos.');
  }
};
