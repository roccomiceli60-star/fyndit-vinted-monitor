import { VintedListing, VintedMonitor } from '../types';

/**
 * 8 Allowed European Countries strictly requested by user:
 * • Francia (FR)
 * • Spagna (ES)
 * • Portogallo (PT)
 * • Belgio (BE)
 * • Paesi Bassi / Olanda (NL)
 * • Lussemburgo (LU)
 * • Austria (AT)
 * • Germania (DE)
 */
export interface EuCountryMeta {
  code: string;
  name: string;
  aliases: string[];
  flag: string;
  domain: string;
}

export const ALLOWED_EU_COUNTRIES: Record<string, EuCountryMeta> = {
  FR: {
    code: 'FR',
    name: 'Francia',
    aliases: ['fr', 'francia', 'france'],
    flag: '🇫🇷',
    domain: 'www.vinted.fr',
  },
  ES: {
    code: 'ES',
    name: 'Spagna',
    aliases: ['es', 'spagna', 'spain', 'españa'],
    flag: '🇪🇸',
    domain: 'www.vinted.es',
  },
  PT: {
    code: 'PT',
    name: 'Portogallo',
    aliases: ['pt', 'portogallo', 'portugal'],
    flag: '🇵🇹',
    domain: 'www.vinted.pt',
  },
  BE: {
    code: 'BE',
    name: 'Belgio',
    aliases: ['be', 'belgio', 'belgium', 'belgique', 'belgië'],
    flag: '🇧🇪',
    domain: 'www.vinted.be',
  },
  NL: {
    code: 'NL',
    name: 'Paesi Bassi',
    aliases: ['nl', 'paesi bassi', 'olanda', 'netherlands', 'nederland', 'holland'],
    flag: '🇳🇱',
    domain: 'www.vinted.nl',
  },
  LU: {
    code: 'LU',
    name: 'Lussemburgo',
    aliases: ['lu', 'lussemburgo', 'luxembourg'],
    flag: '🇱🇺',
    domain: 'www.vinted.lu',
  },
  AT: {
    code: 'AT',
    name: 'Austria',
    aliases: ['at', 'austria', 'österreich'],
    flag: '🇦🇹',
    domain: 'www.vinted.at',
  },
  DE: {
    code: 'DE',
    name: 'Germania',
    aliases: ['de', 'germania', 'germany', 'deutschland'],
    flag: '🇩🇪',
    domain: 'www.vinted.de',
  },
};

/**
 * Checks if target country query (code or name) matches seller's country
 */
export function isCountryMatched(target: string, sellerCountry: string): boolean {
  const t = target.trim().toLowerCase();
  const s = sellerCountry.trim().toLowerCase();
  if (!t || !s) return false;

  for (const entry of Object.values(ALLOWED_EU_COUNTRIES)) {
    const targetMatches = entry.aliases.some((a) => t === a || t.includes(a));
    const sellerMatches = entry.aliases.some((a) => s === a || s.includes(a));
    if (targetMatches && sellerMatches) {
      return true;
    }
  }
  return false;
}

/**
 * Validates that seller country belongs to the 8 allowed European countries
 * and strictly excludes UK, Italy, or non-EU countries.
 */
export function isAllowedEuropeanCountry(sellerCountry: string): boolean {
  const s = (sellerCountry || '').trim().toLowerCase();
  if (!s) return false;

  // Strict exclusions: UK / Italy / Non-EU
  if (
    s.includes('regno unito') ||
    s.includes('united kingdom') ||
    s.includes('uk') ||
    s.includes('italia') ||
    s.includes('italy') ||
    s.includes('polonia') ||
    s.includes('poland') ||
    s.includes('stati uniti') ||
    s.includes('usa')
  ) {
    return false;
  }

  return Object.values(ALLOWED_EU_COUNTRIES).some((entry) =>
    entry.aliases.some((a) => s === a || s.includes(a))
  );
}

/**
 * High-precision matcher that strictly isolates search to monitor specifications:
 * 1. Excluded keywords: strict rejection if ANY appear in title, brand or category.
 * 2. Min/Max price: strict rejection if outside boundaries.
 * 3. Keywords isolation: If keywords are defined, the item MUST match at least one keyword (case-insensitive, whole phrase or words).
 * 4. Brands isolation: If brands are defined, the item MUST match at least one brand.
 * 5. Category isolation: If specified and not 'all' / 'Tutte', item must be in category.
 * 6. Sizes isolation: If specified, item size must match.
 * 7. Strict 8-Country isolation: Only items from the user's selected European nations among the 8 allowed countries.
 */
export function matchListingToMonitor(listing: VintedListing, monitor: VintedMonitor): boolean {
  if (!monitor.isActive) return false;

  const titleLower = (listing.title || '').toLowerCase();
  const brandLower = (listing.brand || '').toLowerCase();
  const catLower = (listing.category || '').toLowerCase();
  const fullText = `${titleLower} ${brandLower} ${catLower}`;

  // 1. Excluded keywords (Highest priority: immediate discard)
  if (Array.isArray(monitor.excludedKeywords) && monitor.excludedKeywords.length > 0) {
    for (const ex of monitor.excludedKeywords) {
      const cleanEx = ex.trim().toLowerCase();
      if (!cleanEx) continue;
      if (fullText.includes(cleanEx)) {
        return false;
      }
    }
  }

  // 2. Price filter
  if (monitor.minPrice && monitor.minPrice > 0 && listing.price < monitor.minPrice) {
    return false;
  }
  if (monitor.maxPrice && monitor.maxPrice > 0 && listing.price > monitor.maxPrice) {
    return false;
  }

  // 3. Keywords filter (Strict Isolation)
  // If user provided keywords, the item MUST contain at least one of those keywords!
  const hasKeywords = Array.isArray(monitor.keywords) && monitor.keywords.some((k) => k.trim().length > 0);
  if (hasKeywords) {
    const validKeywords = monitor.keywords.map((k) => k.trim().toLowerCase()).filter(Boolean);
    const matchesAnyKeyword = validKeywords.some((kw) => {
      // If keyword has multiple words like "dunk low", all words must be present in the listing text
      const subWords = kw.split(/\s+/).filter(Boolean);
      if (subWords.length > 1) {
        return subWords.every((sw) => fullText.includes(sw));
      }
      return fullText.includes(kw);
    });

    if (!matchesAnyKeyword) {
      return false;
    }
  }

  // 4. Brands filter (Strict Isolation)
  // If user selected brands, the item MUST match one of the brands
  const hasBrands = Array.isArray(monitor.brands) && monitor.brands.length > 0;
  if (hasBrands) {
    const matchesAnyBrand = monitor.brands.some((b) => {
      const bLower = b.trim().toLowerCase();
      if (!bLower) return false;
      return brandLower.includes(bLower) || titleLower.includes(bLower);
    });
    if (!matchesAnyBrand) {
      return false;
    }
  }

  // 5. Category filter
  if (monitor.category && monitor.category !== 'all' && !monitor.category.toLowerCase().includes('tutte')) {
    const monCatLower = monitor.category.toLowerCase();
    const matchesCat = catLower.includes(monCatLower) || titleLower.includes(monCatLower);
    if (!matchesCat && Array.isArray(monitor.subcategories) && monitor.subcategories.length > 0) {
      const matchesSub = monitor.subcategories.some((sub) => fullText.includes(sub.toLowerCase()));
      if (!matchesSub) return false;
    } else if (!matchesCat) {
      return false;
    }
  }

  // 6. Sizes filter
  if (Array.isArray(monitor.sizes) && monitor.sizes.length > 0) {
    const itemSizeLower = (listing.size || '').trim().toLowerCase();
    const matchesSize = monitor.sizes.some((s) => {
      const sLower = s.trim().toLowerCase();
      return itemSizeLower === sLower || itemSizeLower.includes(sLower);
    });
    if (!matchesSize) {
      return false;
    }
  }

  // 7. Strict European Country Isolation
  const sellerCountry = (listing.seller?.country || '').trim();

  // Strictly block UK / English listings or non-EUR currency
  if (listing.originalCurrency && listing.originalCurrency !== 'EUR') {
    return false;
  }
  if (listing.originalCurrencySymbol === '£' || listing.originalCurrencySymbol === '$') {
    return false;
  }

  if (!isAllowedEuropeanCountry(sellerCountry)) {
    return false;
  }

  // Check monitor-specified country selection
  if (Array.isArray(monitor.countries) && monitor.countries.length > 0) {
    const cleanTargets = monitor.countries.map((c) => c.trim().toLowerCase());
    const isAll = cleanTargets.includes('tutti') || cleanTargets.includes('tutte') || cleanTargets.length >= 8;
    if (!isAll) {
      const isMatched = cleanTargets.some((target) => isCountryMatched(target, sellerCountry));
      if (!isMatched) {
        return false;
      }
    }
  }

  return true;
}
