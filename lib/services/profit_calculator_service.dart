import '../models/profit_result.dart';

class ProfitCalculatorService {
  static double calculateBuyerProtection(double itemPrice) {
    if (itemPrice <= 0) return 0.0;
    // Vinted: 0.70€ + 5%
    return 0.70 + (itemPrice * 0.05);
  }

  static ProfitResult calculate({
    required double buyPrice,
    double shippingCost = 2.99,
    required double resellPrice,
    String platform = 'vinted',
  }) {
    final buyerProtection = calculateBuyerProtection(buyPrice);
    final totalCost = buyPrice + buyerProtection + shippingCost;

    double platformFee = 0.0;
    if (platform == 'stockx') {
      platformFee = resellPrice * 0.12;
    } else if (platform == 'ebay') {
      platformFee = resellPrice * 0.115;
    }

    final netRevenue = resellPrice - platformFee;
    final netProfit = netRevenue - totalCost;
    final roi = totalCost > 0 ? (netProfit / totalCost) * 100 : 0.0;

    String status = 'SUPER STEAL 🔥';
    if (netProfit <= 0) {
      status = 'IN PERDITA ❌';
    } else if (roi < 25 || netProfit < 10) {
      status = 'MARGINE BASSO ⚠️';
    } else if (roi >= 60 && netProfit >= 25) {
      status = 'SUPER STEAL 🔥';
    } else {
      status = 'BUON MARGINE ✅';
    }

    return ProfitResult(
      buyPrice: buyPrice,
      buyerProtection: buyerProtection,
      shippingCost: shippingCost,
      totalCost: totalCost,
      resellPrice: resellPrice,
      platformFee: platformFee,
      netRevenue: netRevenue,
      netProfit: netProfit,
      roiPercent: roi,
      status: status,
    );
  }
}
