class MonitorItem {
  final String id;
  final String name;
  final List<String> brands;
  final List<String> keywords;
  final List<String> sizes;
  final double maxPrice;
  final List<String> countries;
  bool isActive;
  final int matchCount;

  MonitorItem({
    required this.id,
    required this.name,
    required this.brands,
    required this.keywords,
    required this.sizes,
    required this.maxPrice,
    required this.countries,
    this.isActive = true,
    this.matchCount = 0,
  });
}
