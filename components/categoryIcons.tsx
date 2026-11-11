import React from 'react';
import {
  Waves, Utensils, Ship, Compass, BedDouble, Wine, Mountain, Landmark, Briefcase, Store,
  Coffee, Pizza, IceCream, Fish, Beer, Sun, Umbrella, Palmtree, Anchor, Sailboat, Camera,
  Map, MapPin, Tent, Bike, Car, Bus, Plane, ShoppingBag, ShoppingCart, Pill, Heart, Sparkles,
  Music, PartyPopper, Baby, Dog, Dumbbell, Scissors, Wrench, GraduationCap, Church, Trees, Flower2,
  Star, Ticket, Gift, Hotel, Home as HomeIcon, Building2, Stethoscope, Shirt, Gem, Wifi,
} from 'lucide-react';

/** Ícones disponíveis para as categorias da Home (o admin escolhe pelo nome). */
export const CATEGORY_ICONS: Record<string, any> = {
  Waves, Utensils, Ship, Compass, BedDouble, Wine, Mountain, Landmark, Briefcase, Store,
  Coffee, Pizza, IceCream, Fish, Beer, Sun, Umbrella, Palmtree, Anchor, Sailboat, Camera,
  Map, MapPin, Tent, Bike, Car, Bus, Plane, ShoppingBag, ShoppingCart, Pill, Heart, Sparkles,
  Music, PartyPopper, Baby, Dog, Dumbbell, Scissors, Wrench, GraduationCap, Church, Trees, Flower2,
  Star, Ticket, Gift, Hotel, Home: HomeIcon, Building2, Stethoscope, Shirt, Gem, Wifi,
};

export const ICON_NAMES = Object.keys(CATEGORY_ICONS);

export const CategoryIcon: React.FC<{ name?: string; size?: number; className?: string }> = ({ name, size = 22, className }) => {
  const Icon = (name && CATEGORY_ICONS[name]) || Compass;
  return <Icon size={size} className={className} />;
};

const fold = (x: string) => x.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();

/** Escolhe um ícone coerente pelo nome da categoria (categorias do Guia não guardam ícone). */
export const guessCategoryIcon = (name: string): string => {
  const n = fold(name || '');
  const has = (...w: string[]) => w.some(k => n.includes(k));
  if (has('bar', 'noturna', 'balada', 'drink')) return 'Wine';
  if (has('gastro', 'restaurante', 'comida', 'lanche', 'cafe', 'padaria')) return 'Utensils';
  if (has('hospedagem', 'hotel', 'pousada', 'hostel')) return 'BedDouble';
  if (has('passeio', 'barco', 'ilha', 'mergulho', 'turismo')) return 'Ship';
  if (has('praia')) return 'Waves';
  if (has('festa', 'evento', 'entreten', 'show')) return 'PartyPopper';
  if (has('bem-estar', 'bem estar', 'saude', 'beleza', 'spa', 'estetica')) return 'Heart';
  if (has('compra', 'comercio', 'loja', 'moda')) return 'ShoppingBag';
  if (has('cultura', 'historia', 'museu')) return 'Landmark';
  if (has('natureza', 'aventura', 'trilha')) return 'Mountain';
  if (has('esporte', 'academia', 'fitness')) return 'Dumbbell';
  if (has('transporte', 'carro', 'locadora', 'taxi')) return 'Car';
  if (has('educa', 'curso', 'escola')) return 'GraduationCap';
  if (has('pet', 'veterin')) return 'Dog';
  if (has('servico', 'delivery', 'profission')) return 'Briefcase';
  return 'Store';
};
