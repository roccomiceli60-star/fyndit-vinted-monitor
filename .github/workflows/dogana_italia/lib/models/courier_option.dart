enum CourierType {
  dhlExpress,
  dhlParcel,
  fedex,
  ups,
  poste,
  posteIoss,
  gls,
  none,
  custom,
}

class CourierOption {
  final CourierType type;
  final String name;
  final String description;
  final double baseFee;
  final double percentageFee;

  const CourierOption({
    required this.type,
    required this.name,
    required this.description,
    required this.baseFee,
    this.percentageFee = 0.0,
  });
}