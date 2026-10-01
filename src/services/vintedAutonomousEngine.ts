import { VintedListing } from '../types';
import { INITIAL_LISTINGS } from '../data/mockDeals';

// Comprehensive drop candidates across top streetwear and luxury brands on Vinted
const ITEM_POOL: Omit<VintedListing, 'id' | 'publishedSecondsAgo'>[] = [
  {
    title: 'Trapstar Decoded Puffer Jacket Black Ice',
    brand: 'Trapstar',
    category: 'Giacche & Cappotti',
    size: 'L',
    condition: 'Nuovo con cartellino',
    price: 85,
    marketValue: 240,
    discountPercent: 65,
    potentialProfit: 125,
    seller: { username: 'london_drip_uk', rating: 4.9, reviewCount: 88, country: 'Regno Unito', countryFlag: '🇬🇧' },
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
    vintedUrl: 'https://www.vinted.it/items/109301',
    dealScore: 'STEAL',
    likesCount: 12,
  },
  {
    title: 'Corteiz Guerillaz Cargo Pants Nero / Giallo',
    brand: 'Corteiz',
    category: 'Pantaloni Cargo',
    size: 'M',
    condition: 'Ottime condizioni',
    price: 45,
    marketValue: 140,
    discountPercent: 68,
    potentialProfit: 78,
    seller: { username: 'alessio_rtw', rating: 5.0, reviewCount: 34, country: 'Italia', countryFlag: '🇮🇹' },
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?auto=format&fit=crop&w=600&q=80',
    vintedUrl: 'https://www.vinted.it/items/109302',
    dealScore: 'STEAL',
    likesCount: 9,
  },
  {
    title: 'Air Jordan 4 Retro Military Black',
    brand: 'Jordan',
    category: 'Sneakers',
    size: 'EU 43',
    condition: 'Nuovo con cartellino',
    price: 110,
    marketValue: 320,
    discountPercent: 66,
    potentialProfit: 175,
    seller: { username: 'sneakers_collector99', rating: 4.8, reviewCount: 210, country: 'Francia', countryFlag: '🇫🇷' },
    imageUrl: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?auto=format&fit=crop&w=600&q=80',
    vintedUrl: 'https://www.vinted.it/items/109303',
    dealScore: 'STEAL',
    likesCount: 24,
  },
  {
    title: 'Sp5der 555555 Angel Hoodie Pink',
    brand: 'Sp5der',
    category: 'Tute & Felpe',
    size: 'M',
    condition: 'Nuovo con cartellino',
    price: 75,
    marketValue: 210,
    discountPercent: 64,
    potentialProfit: 108,
    seller: { username: 'drip_plug_es', rating: 4.9, reviewCount: 45, country: 'Spagna', countryFlag: '🇪🇸' },
    imageUrl: 'https://images.unsplash.com/photo-1509967419530-da38b4704bc6?auto=format&fit=crop&w=600&q=80',
    vintedUrl: 'https://www.vinted.it/items/109304',
    dealScore: 'STEAL',
    likesCount: 15,
  },
  {
    title: 'Maglione Ralph Lauren Lana Trecce Verde Bottiglia',
    brand: 'Ralph Lauren',
    category: 'Maglioni & Cardigan',
    size: 'M',
    condition: 'Ottime condizioni',
    price: 22,
    marketValue: 75,
    discountPercent: 71,
    potentialProfit: 43,
    seller: { username: 'vintage_milano', rating: 5.0, reviewCount: 92, country: 'Italia', countryFlag: '🇮🇹' },
    imageUrl: 'https://images.unsplash.com/photo-1620799140408-edc6dcb6d633?auto=format&fit=crop&w=600&q=80',
    vintedUrl: 'https://www.vinted.it/items/109305',
    dealScore: 'STEAL',
    likesCount: 7,
  },
  {
    title: 'Nike Tech Fleece Tracksuit Nero Completo',
    brand: 'Nike',
    category: 'Tute & Felpe',
    size: 'S',
    condition: 'Ottime condizioni',
    price: 45,
    marketValue: 120,
    discountPercent: 63,
    potentialProfit: 59,
    seller: { username: 'romain_street', rating: 4.7, reviewCount: 63, country: 'Belgio', countryFlag: '🇧🇪' },
    imageUrl: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=600&q=80',
    vintedUrl: 'https://www.vinted.it/items/109306',
    dealScore: 'DEAL',
    likesCount: 11,
  },
  {
    title: 'Stussy 8 Ball Fleece Reversible Giacca',
    brand: 'Stussy',
    category: 'Giacche & Cappotti',
    size: 'L',
    condition: 'Nuovo con cartellino',
    price: 60,
    marketValue: 175,
    discountPercent: 66,
    potentialProfit: 95,
    seller: { username: 'skate_store_nl', rating: 5.0, reviewCount: 150, country: 'Paesi Bassi', countryFlag: '🇳🇱' },
    imageUrl: 'https://images.unsplash.com/photo-1578587018452-892bacefd3f2?auto=format&fit=crop&w=600&q=80',
    vintedUrl: 'https://www.vinted.it/items/109307',
    dealScore: 'STEAL',
    likesCount: 19,
  },
  {
    title: 'Giacca Arc\'teryx Beta LT Gore-Tex All Black',
    brand: 'Arc\'teryx',
    category: 'Giacche & Cappotti',
    size: 'M',
    condition: 'Ottime condizioni',
    price: 130,
    marketValue: 390,
    discountPercent: 67,
    potentialProfit: 215,
    seller: { username: 'gorpcore_germany', rating: 4.9, reviewCount: 77, country: 'Germania', countryFlag: '🇩🇪' },
    imageUrl: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?auto=format&fit=crop&w=600&q=80',
    vintedUrl: 'https://www.vinted.it/items/109308',
    dealScore: 'STEAL',
    likesCount: 31,
  },
  {
    title: 'Giacca Stone Island Soft Shell-R con Badge',
    brand: 'Stone Island',
    category: 'Giacche & Cappotti',
    size: 'XL',
    condition: 'Ottime condizioni',
    price: 95,
    marketValue: 280,
    discountPercent: 66,
    potentialProfit: 150,
    seller: { username: 'casuals_terrace', rating: 5.0, reviewCount: 112, country: 'Regno Unito', countryFlag: '🇬🇧' },
    imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?auto=format&fit=crop&w=600&q=80',
    vintedUrl: 'https://www.vinted.it/items/109309',
    dealScore: 'STEAL',
    likesCount: 22,
  },
  {
    title: 'Piumino Moncler Maya Nero Lucido',
    brand: 'Moncler',
    category: 'Giacche & Cappotti',
    size: '3 (L)',
    condition: 'Ottime condizioni',
    price: 250,
    marketValue: 750,
    discountPercent: 67,
    potentialProfit: 420,
    seller: { username: 'luxury_archive_it', rating: 4.9, reviewCount: 185, country: 'Italia', countryFlag: '🇮🇹' },
    imageUrl: 'https://images.unsplash.com/photo-1544441893-675973e31985?auto=format&fit=crop&w=600&q=80',
    vintedUrl: 'https://www.vinted.it/items/109310',
    dealScore: 'STEAL',
    likesCount: 42,
  }
];

let itemCounter = 200000;

export function generateNextAutonomousDrop(): VintedListing {
  itemCounter++;
  const template = ITEM_POOL[Math.floor(Math.random() * ITEM_POOL.length)];
  const variance = (Math.random() * 0.1 - 0.05); // +/- 5%
  const price = Math.max(15, Math.round(template.price * (1 + variance)));
  const marketValue = template.marketValue;
  const discountPercent = Math.round(((marketValue - price) / marketValue) * 100);

  return {
    ...template,
    id: `vnt-${itemCounter}`,
    price,
    marketValue,
    discountPercent,
    potentialProfit: Math.max(10, Math.round(marketValue * 0.88 - price)),
    publishedSecondsAgo: Math.floor(Math.random() * 8) + 1,
    likesCount: Math.floor(Math.random() * 6) + 1,
    vintedUrl: `https://www.vinted.it/items/${itemCounter}`,
    isNewDrop: true,
  };
}

export function searchClientItems(query: string, brand: string, currentPool: VintedListing[]): VintedListing[] {
  const allCandidates = [...currentPool, ...INITIAL_LISTINGS];
  const uniqueMap = new Map<string, VintedListing>();
  for (const it of allCandidates) {
    uniqueMap.set(it.id, it);
  }
  let results = Array.from(uniqueMap.values());

  const q = query.toLowerCase().trim();
  if (q) {
    results = results.filter((it) => 
      it.title.toLowerCase().includes(q) ||
      it.brand.toLowerCase().includes(q) ||
      it.category.toLowerCase().includes(q)
    );

    // If query returned few results, dynamically synthesize matching items for that keyword
    if (results.length < 3) {
      const capitalized = query.charAt(0).toUpperCase() + query.slice(1);
      const synthPrice = Math.floor(Math.random() * 40) + 25;
      const synthMarket = Math.round(synthPrice * 2.8);
      const synthItem: VintedListing = {
        id: `vnt-${Date.now()}`,
        title: `${capitalized} Originale Ottime Condizioni`,
        brand: brand && brand !== 'Tutti' ? brand : capitalized,
        category: 'Abbigliamento',
        size: 'M',
        condition: 'Ottime condizioni',
        price: synthPrice,
        marketValue: synthMarket,
        discountPercent: Math.round(((synthMarket - synthPrice) / synthMarket) * 100),
        potentialProfit: Math.round(synthMarket * 0.88 - synthPrice),
        seller: { username: 'vinted_top_seller', rating: 5.0, reviewCount: 74, country: 'Italia', countryFlag: '🇮🇹' },
        imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?auto=format&fit=crop&w=600&q=80',
        vintedUrl: `https://www.vinted.it/items/${Date.now()}`,
        publishedSecondsAgo: 2,
        dealScore: 'STEAL',
        likesCount: 5,
        isNewDrop: true,
      };
      results.unshift(synthItem);
    }
  }

  if (brand && brand !== 'Tutti') {
    results = results.filter((it) => it.brand.toLowerCase() === brand.toLowerCase());
  }

  return results;
}

// Play a discreet, ultra-fast synthesized notification sound via Web Audio API
export function playAlertChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(1320, ctx.currentTime + 0.12); // E6

    gain.gain.setValueAtTime(0.08, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.26);

    // Also trigger mobile haptic vibration if supported
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      navigator.vibrate([30, 40, 30]);
    }
  } catch {
    // Audio context may be restricted before first gesture; ignore
  }
}
