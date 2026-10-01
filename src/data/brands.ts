export const POPULAR_BRANDS = [
  'Nike',
  'Zara',
  'Adidas',
  'Trapstar',
  'Corteiz',
  'Ralph Lauren',
  'Carhartt',
  "Levi's",
  'Stone Island',
  'Stussy',
  'The North Face',
  'Jordan',
  'H&M',
  'Pull&Bear',
  'Bershka',
  'Tommy Hilfiger',
  'Lacoste',
  'New Balance',
  'Sp5der',
  'Syna World',
  'Supreme',
  'Bape',
  'Salomon',
  'CP Company',
  'Diesel',
  'Moncler',
  'Gucci',
  'Prada',
  'Louis Vuitton',
  'Apple',
  'PlayStation',
  'Nintendo',
  'Pokémon',
  'LEGO',
  'Mango',
  'Subdued',
  'Shein',
  'Massimo Dutti',
  'Calvin Klein',
  'Dickies',
  'Vans',
  'Converse',
  'Patagonia',
  "Arc'teryx",
];

export const VINTED_COUNTRIES = [
  { code: 'IT', name: 'Italia', flag: '🇮🇹' },
  { code: 'FR', name: 'Francia', flag: '🇫🇷' },
  { code: 'ES', name: 'Spagna', flag: '🇪🇸' },
  { code: 'DE', name: 'Germania', flag: '🇩🇪' },
  { code: 'NL', name: 'Paesi Bassi', flag: '🇳🇱' },
  { code: 'BE', name: 'Belgio', flag: '🇧🇪' },
  { code: 'PT', name: 'Portogallo', flag: '🇵🇹' },
  { code: 'UK', name: 'Regno Unito', flag: '🇬🇧' },
];

export const POPULAR_SIZES = [
  'XS', 'S', 'M', 'L', 'XL', 'XXL',
  'EU 39', 'EU 40', 'EU 41', 'EU 42', 'EU 42.5', 'EU 43', 'EU 44', 'EU 44.5', 'EU 45', 'EU 46'
];

export const CLOTHING_SIZES = [
  'Tutte',
  'XXS / 32',
  'XS / 34',
  'S / 36',
  'M / 38',
  'L / 40',
  'XL / 42',
  'XXL / 44',
  '3XL / 46',
];

export const SHOE_SIZES = [
  'Tutte',
  '36',
  '37',
  '38',
  '39',
  '40',
  '41',
  '42',
  '42.5',
  '43',
  '44',
  '44.5',
  '45',
  '46',
  '47',
];

export interface VintedConditionItem {
  id: string;
  name: string;
  description: string;
}

export const VINTED_CONDITIONS: VintedConditionItem[] = [
  {
    id: 'Nuovo con cartellino',
    name: 'Nuovo con cartellino',
    description: 'Mai indossato/usato, con etichette originali o nella confezione originale.',
  },
  {
    id: 'Nuovo senza cartellino',
    name: 'Nuovo senza cartellino',
    description: 'Mai indossato/usato, senza etichette o confezione originale.',
  },
  {
    id: 'Ottime condizioni',
    name: 'Ottime condizioni',
    description: 'Indossato/usato pochissimo, potrebbe presentare lievi imperfezioni ma è in ottimo stato.',
  },
  {
    id: 'Buone condizioni',
    name: 'Buone condizioni',
    description: 'Indossato/usato con qualche piccolo segno di usura, ma ben conservato.',
  },
  {
    id: 'Discreto',
    name: 'Discreto',
    description: 'Usato frequentemente, presenta difetti chiaramente visibili segnalati.',
  },
];

export interface VintedColorItem {
  id: string;
  name: string;
  hex: string;
  border?: string;
}

export const VINTED_COLORS: VintedColorItem[] = [
  { id: 'nero', name: 'Nero', hex: '#09090b', border: '#27272a' },
  { id: 'bianco', name: 'Bianco', hex: '#ffffff', border: '#e4e4e7' },
  { id: 'grigio', name: 'Grigio', hex: '#71717a' },
  { id: 'beige', name: 'Beige', hex: '#d4b996' },
  { id: 'marrone', name: 'Marrone', hex: '#78350f' },
  { id: 'rosso', name: 'Rosso', hex: '#dc2626' },
  { id: 'bordeaux', name: 'Bordeaux', hex: '#831843' },
  { id: 'blu', name: 'Blu', hex: '#1d4ed8' },
  { id: 'azzurro', name: 'Azzurro', hex: '#38bdf8' },
  { id: 'verde', name: 'Verde', hex: '#16a34a' },
  { id: 'kaki', name: 'Kaki', hex: '#4d533c' },
  { id: 'giallo', name: 'Giallo', hex: '#eab308' },
  { id: 'arancione', name: 'Arancione', hex: '#ea580c' },
  { id: 'rosa', name: 'Rosa', hex: '#ec4899' },
  { id: 'viola', name: 'Viola', hex: '#9333ea' },
  { id: 'oro', name: 'Oro', hex: '#ca8a04' },
  { id: 'argento', name: 'Argento', hex: '#94a3b8' },
  { id: 'multicolore', name: 'Multicolore', hex: 'linear-gradient(135deg, #ef4444 0%, #3b82f6 50%, #10b981 100%)' },
];

export const VINTED_SORT_OPTIONS = [
  { id: 'newest', label: 'Più recenti', icon: 'Clock' },
  { id: 'price_asc', label: 'Prezzo: dal più basso', icon: 'ArrowDown' },
  { id: 'price_desc', label: 'Prezzo: dal più alto', icon: 'ArrowUp' },
];
