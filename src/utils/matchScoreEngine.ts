import { VintedListing, VintedMonitor } from '../types';

export interface MatchScoreResult {
  score: number; // 0 to 100
  rating: 'PERFECT' | 'GREAT' | 'GOOD' | 'FAIR';
  label: string;
  badgeColor: string;
  badgeTextColor: string;
  borderColor: string;
  highlights: string[];
}

/**
 * Calculates the dynamic Match Score (0 - 100) based on user search profiles:
 * - Brand correspondence (25%)
 * - Model correspondence (20%)
 * - Size correspondence (15%)
 * - Quality / Price ratio & discount (20%)
 * - Condition match (10%)
 * - Keywords bonus (10%)
 */
export function calculateMatchScore(
  item: VintedListing,
  monitor?: VintedMonitor
): MatchScoreResult {
  let score = 0;
  const highlights: string[] = [];

  const titleLower = (item.title || '').toLowerCase();
  const brandLower = (item.brand || '').toLowerCase();
  const descLower = (item.description || '').toLowerCase();
  const sizeLower = (item.size || '').toLowerCase();

  // 1. BRAND MATCH (Max 25 pts)
  if (monitor && monitor.brands && monitor.brands.length > 0) {
    const matchedBrand = monitor.brands.find(
      (b) => brandLower.includes(b.toLowerCase()) || titleLower.includes(b.toLowerCase())
    );
    if (matchedBrand) {
      score += 25;
      highlights.push(`Marca: ${matchedBrand}`);
    } else {
      score += 5; // Partial
    }
  } else {
    score += 20; // Generic profile
  }

  // 2. MODEL MATCH (Max 20 pts)
  if (monitor && monitor.model) {
    const modLower = monitor.model.toLowerCase();
    if (titleLower.includes(modLower) || descLower.includes(modLower)) {
      score += 20;
      highlights.push(`Modello: ${monitor.model}`);
    }
  } else {
    // Model inferred from popular keywords
    const popularModels = ['jordan 1', 'dunk', 'panda', 'travis', 'fleece', 'tracksuit', 'air max', 'samba', 'gazelle', 'charizard', 'pokemon'];
    const matchedPopular = popularModels.find((m) => titleLower.includes(m));
    if (matchedPopular) {
      score += 18;
      highlights.push(`Modello top: ${matchedPopular.toUpperCase()}`);
    } else {
      score += 12;
    }
  }

  // 3. SIZE MATCH (Max 15 pts)
  if (monitor && monitor.sizes && monitor.sizes.length > 0) {
    const sizeMatched = monitor.sizes.some((s) => sizeLower === s.toLowerCase());
    if (sizeMatched) {
      score += 15;
      highlights.push(`Taglia esatta: ${item.size}`);
    } else {
      score += 2;
    }
  } else {
    score += 12;
  }

  // 4. PRICE / VALUE RATIO (Max 20 pts)
  const discount = item.discountPercent || 0;
  if (discount >= 50) {
    score += 20;
    highlights.push(`Super sconto: -${discount}%`);
  } else if (discount >= 30) {
    score += 16;
    highlights.push(`Ottimo affare: -${discount}%`);
  } else if (discount >= 15) {
    score += 12;
  } else {
    score += 8;
  }

  // 5. CONDITION MATCH (Max 10 pts)
  const condLower = (item.condition || '').toLowerCase();
  if (condLower.includes('nuovo') || condLower.includes('cartellino')) {
    score += 10;
    highlights.push('Nuovo con cartellino');
  } else if (condLower.includes('ottim')) {
    score += 8;
  } else {
    score += 5;
  }

  // 6. KEYWORDS BONUS (Max 10 pts)
  if (monitor && monitor.keywords && monitor.keywords.length > 0) {
    const matchedKw = monitor.keywords.filter((kw) =>
      titleLower.includes(kw.toLowerCase()) || descLower.includes(kw.toLowerCase())
    );
    if (matchedKw.length > 0) {
      score += Math.min(10, matchedKw.length * 5);
      highlights.push(`Keyword: ${matchedKw[0]}`);
    }
  } else {
    score += 8;
  }

  // Excluded keywords penalty
  if (monitor && monitor.excludedKeywords && monitor.excludedKeywords.length > 0) {
    const matchedEx = monitor.excludedKeywords.some((ex) =>
      titleLower.includes(ex.toLowerCase())
    );
    if (matchedEx) {
      score = Math.max(10, score - 50);
    }
  }

  // Seller rating bonus
  if (item.seller && item.seller.rating >= 4.8) {
    score = Math.min(100, score + 2);
  }

  const finalScore = Math.min(100, Math.max(35, Math.round(score)));

  let rating: 'PERFECT' | 'GREAT' | 'GOOD' | 'FAIR' = 'GOOD';
  let label = 'Buon Match';
  let badgeColor = 'bg-amber-500/20';
  let badgeTextColor = 'text-amber-300';
  let borderColor = 'border-amber-500/40';

  if (finalScore >= 93) {
    rating = 'PERFECT';
    label = 'STEAL ASSOLUTO';
    badgeColor = 'bg-emerald-500/25';
    badgeTextColor = 'text-emerald-300';
    borderColor = 'border-emerald-400';
  } else if (finalScore >= 80) {
    rating = 'GREAT';
    label = 'OTTIMO MATCH';
    badgeColor = 'bg-teal-500/20';
    badgeTextColor = 'text-teal-300';
    borderColor = 'border-teal-400';
  } else if (finalScore >= 65) {
    rating = 'GOOD';
    label = 'BUON AFFARE';
    badgeColor = 'bg-cyan-500/20';
    badgeTextColor = 'text-cyan-300';
    borderColor = 'border-cyan-500/30';
  } else {
    rating = 'FAIR';
    label = 'MATCH BASE';
    badgeColor = 'bg-zinc-800';
    badgeTextColor = 'text-zinc-300';
    borderColor = 'border-zinc-700';
  }

  return {
    score: finalScore,
    rating,
    label,
    badgeColor,
    badgeTextColor,
    borderColor,
    highlights,
  };
}
