import { VintedListing, VintedMonitor } from '../types';

/**
 * High-precision matcher that strictly isolates search to monitor specifications:
 * 1. Excluded keywords: strict rejection if ANY appear in title, brand or category.
 * 2. Min/Max price: strict rejection if outside boundaries.
 * 3. Keywords isolation: If keywords are defined, the item MUST match at least one keyword (case-insensitive, whole phrase or words).
 * 4. Brands isolation: If brands are defined, the item MUST match at least one brand.
 * 5. Category isolation: If specified and not 'all' / 'Tutte', item must be in category.
 * 6. Sizes isolation: If specified, item size must match.
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

  // If neither keywords nor brands were specified, fallback to monitor name only if it is not generic
  if (!hasKeywords && !hasBrands) {
    const nameClean = monitor.name.trim().toLowerCase();
    if (nameClean && !nameClean.startsWith('monitor') && !nameClean.startsWith('nuovo')) {
      const nameWords = nameClean.split(/\s+/).filter((w) => w.length > 2);
      if (nameWords.length > 0) {
        const matchesName = nameWords.some((nw) => fullText.includes(nw));
        if (!matchesName) return false;
      }
    }
  }

  // 5. Category filter
  if (
    monitor.category &&
    monitor.category !== 'all' &&
    !monitor.category.toLowerCase().includes('tutte') &&
    !monitor.category.toLowerCase().includes('all')
  ) {
    const monCatLower = monitor.category.toLowerCase();
    const matchesCat = catLower.includes(monCatLower) || titleLower.includes(monCatLower);
    // Allow if subcategories match
    if (!matchesCat && Array.isArray(monitor.subcategories) && monitor.subcategories.length > 0) {
      const matchSub = monitor.subcategories.some((sub) => fullText.includes(sub.toLowerCase()));
      if (!matchSub) return false;
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

  return true;
}
