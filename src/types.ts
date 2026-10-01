export type ConditionType = 
  | 'Nuovo con cartellino'
  | 'Nuovo senza cartellino'
  | 'Ottime condizioni'
  | 'Buone condizioni';

export type DealScore = 'STEAL' | 'DEAL' | 'GOOD' | 'FAIR';

export interface VintedListing {
  id: string;
  title: string;
  brand: string;
  category: string;
  size: string;
  condition: ConditionType;
  price: number;
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
  likesCount: number;
  isNewDrop?: boolean;
  discoveredAt?: number;
}

export interface VintedMonitor {
  id: string;
  name: string;
  brands: string[];
  keywords: string[];
  excludedKeywords: string[];
  sizes: string[];
  maxPrice: number;
  minPrice: number;
  minCondition: ConditionType | 'Tutte';
  countries: string[];
  isActive: boolean;
  enableSound: boolean;
  enableNotifications: boolean;
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
