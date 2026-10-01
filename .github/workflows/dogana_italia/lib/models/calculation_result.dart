import 'customs_category.dart';
import 'currency_item.dart';

enum OriginRegion {
  mfn, // Extra-UE standard
  preferential, // Accordo preferenziale (Giappone EPA, UK, Svizzera, ecc.)
  ue, // Mercato unico europeo
}

class CalculationResult {
  final CustomsCategory category;
  final CurrencyItem currency;
  final double productValueEur;
  final double shippingValueEur;
  final double insuranceValueEur;
  final double cif;
  final double appliedDutyRate;
  final double dutyAmount;
  final double vatBase;
  final double appliedVatRate;
  final double vatAmount;
  final double carrierFee;
  final double taxesOnly;
  final double totalOnDelivery;
  final double grandTotalCost;
  final List<String> notes;
  final List<String> warnings;
  final List<String> legalReferences;

  const CalculationResult({
    required this.category,
    required this.currency,
    required this.productValueEur,
    required this.shippingValueEur,
    required this.insuranceValueEur,
    required this.cif,
    required this.appliedDutyRate,
    required this.dutyAmount,
    required this.vatBase,
    required this.appliedVatRate,
    required this.vatAmount,
    required this.carrierFee,
    required this.taxesOnly,
    required this.totalOnDelivery,
    required this.grandTotalCost,
    required this.notes,
    required this.warnings,
    required this.legalReferences,
  });
}