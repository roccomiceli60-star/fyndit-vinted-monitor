import { ResellCalculationResult, ResellPlatform } from '../types';

export function calculateVintedBuyerProtection(itemPrice: number): number {
  if (itemPrice <= 0) return 0;
  // Vinted Buyer Protection fee: 0.70€ fixed + 5% of item price
  return Number((0.70 + (itemPrice * 0.05)).toFixed(2));
}

export function calculateResellProfit({
  buyPrice,
  shippingCost = 2.99,
  resellPrice,
  platform = 'vinted',
}: {
  buyPrice: number;
  shippingCost?: number;
  resellPrice: number;
  platform?: ResellPlatform;
}): ResellCalculationResult {
  const safeBuyPrice = Math.max(0, buyPrice);
  const buyerProtection = calculateVintedBuyerProtection(safeBuyPrice);
  const totalCost = Number((safeBuyPrice + buyerProtection + shippingCost).toFixed(2));

  // Platform selling fees
  let platformFee = 0;
  if (platform === 'stockx') {
    // StockX: ~9% seller fee + 3% payment processing
    platformFee = Number((resellPrice * 0.12).toFixed(2));
  } else if (platform === 'ebay') {
    // eBay fashion: ~11.5%
    platformFee = Number((resellPrice * 0.115).toFixed(2));
  } else {
    // Vinted / Wallapop / Private hand-to-hand: 0% fee for seller
    platformFee = 0;
  }

  const netRevenue = Number((resellPrice - platformFee).toFixed(2));
  const netProfit = Number((netRevenue - totalCost).toFixed(2));
  const roiPercent = totalCost > 0 ? Number(((netProfit / totalCost) * 100).toFixed(1)) : 0;

  let rating: ResellCalculationResult['rating'] = 'SUPER_STEAL';
  if (netProfit <= 0) {
    rating = 'IN_PERDITA';
  } else if (roiPercent < 25 || netProfit < 10) {
    rating = 'RISCHIOSO';
  } else if (roiPercent >= 60 && netProfit >= 25) {
    rating = 'SUPER_STEAL';
  } else {
    rating = 'BUON_MARGINE';
  }

  return {
    buyPrice: safeBuyPrice,
    buyerProtection,
    shippingCost,
    totalCost,
    resellPrice,
    platform,
    platformFee,
    netRevenue,
    netProfit,
    roiPercent,
    rating,
  };
}
