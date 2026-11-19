import React from 'react';
import {
  Wifi, Snowflake, ParkingCircle, Accessibility, PawPrint, Baby, Languages, MessageCircle, CalendarCheck, Moon, Clock,
  CreditCard, QrCode, Ticket, Truck, ShoppingBag, UtensilsCrossed, Salad, Leaf, Wheat, Milk, Wine, Coffee, Users, Waves,
  Umbrella, Trees, Sunset, Tv, Heart, Music, Mic2, PartyPopper, Crown, Waves as Wave, Bell, BedDouble, Shirt, ChefHat,
  Home, UserX, Store, ArrowUpDown, Lock, Dumbbell, Flower2, Flame, Bike, Camera, LifeBuoy, ShowerHead, ShieldCheck,
  Gift, RefreshCw, Stethoscope, FileText, Siren, Check, Car, Sparkles, MapPin, Droplets, Plane, Bath,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { AMENITIES_LABELS } from '../types';

type IconC = LucideIcon;

/** Ícone de cada comodidade do catálogo (data/amenityCatalog.ts). */
const ICONS: Record<string, IconC> = {
  wifi: Wifi, ac: Snowflake, parking: ParkingCircle, parking_free: ParkingCircle, valet: Car, access: Accessibility,
  pet: PawPrint, kids: Baby, english: Languages, whatsapp_service: MessageCircle, open_sunday: CalendarCheck,
  open_late: Moon, open_24h: Clock, card: CreditCard, pix: QrCode, installments: CreditCard, meal_voucher: Ticket,
  delivery: Truck, free_delivery: Truck, takeaway: ShoppingBag, reservation: CalendarCheck, buffet: UtensilsCrossed,
  rodizio: UtensilsCrossed, kids_menu: Baby, vegetarian: Salad, vegan: Leaf, gluten_free: Wheat, lactose_free: Milk,
  bar: Wine, happy_hour: Wine, breakfast: Coffee, breakfast_included: Coffee, group_friendly: Users,
  sea_view: Waves, beachfront: Umbrella, near_beach: Umbrella, outdoor: Trees, sunset: Sunset, tv: Tv, romantic: Heart,
  live_music: Music, dj: Mic2, dance_floor: PartyPopper, vip_area: Crown, sports_tv: Tv, cover_free: Ticket,
  pool: Waves, reception_24h: Bell, room_service: Bell, airport_transfer: Plane, daily_cleaning: Sparkles,
  laundry: Shirt, kitchenette: ChefHat, family_rooms: Home, adults_only: UserX, restaurant_onsite: UtensilsCrossed,
  elevator: ArrowUpDown, safe: Lock, beach_gear: Umbrella, spa: Flower2, sauna: Droplets, gym: Dumbbell, garden: Flower2,
  barbecue: Flame, bikes: Bike, guide_included: MapPin, equipment_included: ShieldCheck, hotel_pickup: Car,
  photos_included: Camera, drinks_onboard: Wine, life_jackets: LifeBuoy, private_tour: Users, small_group: Users,
  free_cancel: RefreshCw, restrooms: Bath, showers: ShowerHead, lifeguard: LifeBuoy, kiosks: Store,
  chair_rental: Umbrella, calm_water: Wave, free_entry: Ticket, exchange: RefreshCw, gift_wrap: Gift,
  home_service: Home, by_appointment: CalendarCheck, free_quote: FileText, emergency: Siren,
};

/** Cadastros antigos guardaram ids soltos ("food", "shade"): sem rótulo, não viram ícone. */
const isRawId = (am: string) => !AMENITIES_LABELS[am] && /^[a-z0-9_]+$/.test(am);

/** Comodidades com ícone, no mesmo lugar das antigas etiquetas (abaixo de "Sobre o Local"). */
export const AmenityIcons: React.FC<{ amenities?: string[] }> = ({ amenities }) => {
  const list = (amenities || []).filter(a => !isRawId(a));
  if (list.length === 0) return null;
  return (
    <div data-testid="amenity-icons" className="flex flex-wrap gap-2.5 md:gap-3">
      {list.map(am => {
        const Icon = ICONS[am] || Check;
        return (
          <div key={am} className="flex items-center gap-2.5 bg-white pl-2.5 pr-4 py-2 rounded-full border border-slate-100 shadow-sm shadow-slate-200/30 cursor-default">
            <span className="w-7 h-7 rounded-full bg-ocean-50 text-ocean-600 flex items-center justify-center flex-shrink-0"><Icon size={15} /></span>
            <span className="text-[13px] font-extrabold text-slate-600">{AMENITIES_LABELS[am] || am}</span>
          </div>
        );
      })}
    </div>
  );
};
