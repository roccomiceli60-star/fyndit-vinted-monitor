export type ConditionType = 
  | 'Nuovo con cartellino'
  | 'Nuovo senza cartellino'
  | 'Ottime condizioni'
  | 'Buone condizioni'
  | string;

export type DealScore = 'STEAL' | 'DEAL' | 'GOOD' | 'FAIR';

export interface VintedListing {
  id: string;
  rawId?: number;
  title: string;
  brand: string;
  model?: string;
  color?: string;
  category: string;
  size: string;
  condition: ConditionType;
  price: number;
  originalPrice?: number;
  originalCurrency?: string;
  originalCurrencySymbol?: string;
  originalPriceDisplay?: string;
  marketValue: number;
  discountPercent: number;
  seller: {
    username: string;
    rating: number;
    reviewCount: number;
    country: string;
    countryFlag: string;
  };
  imageUrl: string;
  vintedUrl: string;
  publishedSecondsAgo: number;
  dealScore: DealScore;
  matchScore?: number; // 0 to 100 priority score
  likesCount: number;
  isNewDrop?: boolean;
  discoveredAt?: number;
  potentialProfit?: number;
  resellNotes?: string;
  description?: string;
  matchedMonitorName?: string;
  matchedMonitorId?: string;
  itemStatus?: 'DISPONIBILE' | 'ACQUISTATO' | 'VENDUTO';
}

export interface VintedMonitor {
  id: string;
  name: string;
  category?: string;
  subcategories?: string[];
  brands: string[];
  model?: string;
  color?: string;
  keywords: string[];
  excludedKeywords: string[];
  sizes: string[];
  maxPrice: number;
  minPrice: number;
  minDiscountPercent?: number;
  minCondition?: ConditionType | 'Tutte';
  countries?: string[];
  minSellerRating?: number;
  targetMatchScoreMin?: number;
  isActive: boolean;
  enableSound?: boolean;
  enableNotifications?: boolean;
  soundEnabled?: boolean;
  notificationEnabled?: boolean;
  discordWebhookUrl?: string;
  createdAt: number;
  matchCount: number;
}

export type ResellPlatform = 'vinted' | 'stockx' | 'wallapop' | 'ebay' | 'private';

export interface ResellCalculationResult {
  buyPrice: number;
  buyerProtection: number;
  shippingCost: number;
  totalCost: number;
  resellPrice: number;
  platform: ResellPlatform;
  platformFee: number;
  netRevenue: number;
  netProfit: number;
  roiPercent: number;
  rating: 'SUPER_STEAL' | 'BUON_MARGINE' | 'RISCHIOSO' | 'IN_PERDITA';
}

export interface AutocopLog {
  id: string;
  itemTitle: string;
  brand: string;
  price: number;
  reactionTimeMs: number;
  status: 'SUCCESS' | 'MISSED' | 'PENDING';
  timestamp: string;
}

export type VintedCarrier = 
  | 'InPost Locker 24/7' 
  | 'PuntoPoste (Poste Italiane)' 
  | 'BRT Fermopoint' 
  | 'Mondial Relay / Punto Pack' 
  | 'UPS Access Point' 
  | 'GLS ParcelShop';

export interface VintedPickupPoint {
  id: string;
  carrier: VintedCarrier;
  name: string;
  address: string;
  city: string;
  postalCode: string;
  country: string;
  distanceMeters: number;
  openingHours: string;
  isLocker247: boolean;
  shippingFee: number;
  code?: string;
}

export interface VintedAccount {
  isConnected: boolean;
  username: string;
  email?: string;
  rating?: number;
  reviewCount?: number;
  avatarUrl?: string;
  country: string;
  preferredPickupPoint?: VintedPickupPoint;
  alternativePickupPoints?: VintedPickupPoint[];
  fallbackStrategy?: 'NEAREST' | 'FIRST_AVAILABLE' | 'ONLY_247_LOCKER';
  maxPickupDistanceMeters?: number;
  fastModeEnabled?: boolean;
  soundEnabled?: boolean;
  vibrationEnabled?: boolean;
  paymentMethod: {
    type: string;
    last4?: string;
    balance?: number;
  };
  connectedAt?: number;
}

export interface VintedOrder {
  orderId: string;
  itemId: string;
  itemTitle: string;
  itemBrand: string;
  itemSize: string;
  itemPrice: number;
  itemImageUrl: string;
  buyerProtectionFee: number;
  shippingFee: number;
  totalPaid: number;
  sellerUsername: string;
  pickupPoint: VintedPickupPoint;
  trackingCode: string;
  estimatedDelivery: string;
  createdAt: number;
  status: 'CONFERMATO' | 'IN_PREPARAZIONE' | 'SPEDITO' | 'CONSEGNATO_AL_LOCKER';
}
