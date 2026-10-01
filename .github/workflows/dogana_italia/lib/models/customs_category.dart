class CustomsCategory {
  final String id;
  final String name;
  final String subCategory;
  final String hsCode;
  final double dutyRate;
  final int suggestedVat;
  final List<String> keywords;
  final List<String> brands;
  final bool isAgri;
  final List<String> warnings;
  final String description;

  const CustomsCategory({
    required this.id,
    required this.name,
    required this.subCategory,
    required this.hsCode,
    required this.dutyRate,
    required this.suggestedVat,
    required this.keywords,
    this.brands = const [],
    this.isAgri = false,
    this.warnings = const [],
    this.description = '',
  });
}