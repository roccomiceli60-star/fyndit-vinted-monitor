class DealItem {
  final String id;
  final String title;
  final String brand;
  final String size;
  final String condition;
  final double price;
  final double marketValue;
  final int discountPercent;
  final String sellerUsername;
  final double sellerRating;
  final String sellerCountry;
  final String sellerFlag;
  final String imageUrl;
  final String vintedUrl;
  final int publishedSecondsAgo;
  final bool isSteal;

  const DealItem({
    required this.id,
    required this.title,
    required this.brand,
    required this.size,
    required this.condition,
    required this.price,
    required this.marketValue,
    required this.discountPercent,
    required this.sellerUsername,
    required this.sellerRating,
    required this.sellerCountry,
    required this.sellerFlag,
    required this.imageUrl,
    required this.vintedUrl,
    required this.publishedSecondsAgo,
    this.isSteal = true,
  });
}
