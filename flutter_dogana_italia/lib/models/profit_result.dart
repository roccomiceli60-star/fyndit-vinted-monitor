class ProfitResult {
  final double buyPrice;
  final double buyerProtection;
  final double shippingCost;
  final double totalCost;
  final double resellPrice;
  final double platformFee;
  final double netRevenue;
  final double netProfit;
  final double roiPercent;
  final String status;

  const ProfitResult({
    required this.buyPrice,
    required this.buyerProtection,
    required this.shippingCost,
    required this.totalCost,
    required this.resellPrice,
    required this.platformFee,
    required this.netRevenue,
    required this.netProfit,
    required this.roiPercent,
    required this.status,
  });
}
