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
