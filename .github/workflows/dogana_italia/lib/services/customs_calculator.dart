import '../data/customs_database.dart';
import '../models/calculation_result.dart';
import '../models/courier_option.dart';
import '../models/currency_item.dart';
import '../models/customs_category.dart';

class CustomsCalculatorService {
  static CustomsCategory detectCategory(String query, [String? manualId]) {
    if (manualId != null && manualId.isNotEmpty) {
      final found = CustomsDatabase.categories.where((c) => c.id == manualId);
      if (found.isNotEmpty) return found.first;
    }

    final clean = query.trim().toLowerCase();
    if (clean.isEmpty) return CustomsDatabase.categories.first;

    CustomsCategory best = CustomsDatabase.categories.first;
    int bestScore = 0;

    for (final cat in CustomsDatabase.categories) {
      int score = 0;
      if (clean.contains(cat.name.toLowerCase())) {
        score += 25;
      }
      for (final kw in cat.keywords) {
        if (clean == kw.toLowerCase()) {
          score += 30;
        } else if (clean.contains(kw.toLowerCase())) {
          score += 15;
        }
      }
      for (final br in cat.brands) {
        if (clean.contains(br.toLowerCase())) {
          score += 20;
        }
      }
      if (score > bestScore) {
        bestScore = score;
        best = cat;
      }
    }

    return best;
  }

  static CalculationResult calculate({
    required CustomsCategory category,
    required CurrencyItem currency,
    required double productValue,
    required double shippingValue,
    required double insuranceValue,
    required double vatRate,
    required OriginRegion originRegion,
    required bool isGift,
    required bool isIoss,
    required CourierOption courier,
    double customCourierFee = 10.0,
  }) {
    final rate = currency.rateToEur;
    final productEur = productValue * rate;
    final shippingEur = shippingValue * rate;
    final insuranceEur = insuranceValue * rate;
    final cif = productEur + shippingEur + insuranceEur;

    final List<String> notes = [];
    final List<String> warnings = List.from(category.warnings);
    final List<String> legalReferences = [
      'Codice Doganale dell\'Unione (Regolamento UE n. 952/2013)',
      'Regolamento (CE) n. 1186/2009 (Franchigie comunitarie)',
      'D.P.R. 26 ottobre 1972, n. 633 (Disciplina IVA)',
    ];

    double appliedDutyRate = category.dutyRate;
    double appliedVatRate = vatRate;
    double dutyAmount = 0.0;
    double vatBase = cif;
    double vatAmount = 0.0;
    double carrierFee = 0.0;

    if (originRegion == OriginRegion.ue) {
      appliedDutyRate = 0.0;
      appliedVatRate = 0.0;
      dutyAmount = 0.0;
      vatBase = 0.0;
      vatAmount = 0.0;
      carrierFee = 0.0;
      notes.add('Spedizione intra-UE: Nessun dazio, nessuna IVA import e nessun diritto postale (libera circolazione merci).');
    } else if (isIoss) {
      appliedDutyRate = 0.0;
      dutyAmount = 0.0;
      vatAmount = 0.0;
      carrierFee = (courier.type == CourierType.posteIoss || courier.type == CourierType.poste) ? 0.0 : 5.0;
      notes.add('Regime IOSS: L\'IVA italiana al ${vatRate.toInt()}% è già stata assolta durante il checkout del marketplace.');
      notes.add('Per invii IOSS con valore fino a 150€ il dazio è 0% e nulla è dovuto al corriere alla consegna.');
      legalReferences.add('Direttiva (UE) 2017/2455 (E-commerce VAT Package)');
    } else if (isGift && productEur <= 45.0) {
      appliedDutyRate = 0.0;
      appliedVatRate = 0.0;
      dutyAmount = 0.0;
      vatBase = 0.0;
      vatAmount = 0.0;
      carrierFee = 0.0;
      notes.add('Regalo tra privati (C2C) entro 45,00 €: esenzione totale da dazio e IVA (art. 25-27 Reg. CE 1186/2009).');
    } else {
      if (originRegion == OriginRegion.preferential) {
        appliedDutyRate = 0.0;
        notes.add('Accordo commerciale preferenziale UE: dazio azzerato a condizione di attestazione d\'origine valida in fattura (REX).');
      } else if (cif <= 150.0) {
        appliedDutyRate = 0.0;
        notes.add('Franchigia comunitaria (Reg. CE 1186/2009 art. 23): CIF ≤ 150€, dazio doganale esente (0%). L\'IVA rimane dovuta.');
      } else {
        notes.add('Valore CIF > 150€: si applica il dazio ordinario TARIC ${category.hsCode} (${category.dutyRate}%).');
      }

      if (isGift && productEur > 45.0) {
        notes.add('Regalo oltre 45€: franchigia decaduta, si applicano dazio e IVA ordinari.');
      }

      dutyAmount = cif * (appliedDutyRate / 100.0);
      vatBase = cif + dutyAmount;
      vatAmount = vatBase * (appliedVatRate / 100.0);

      if (courier.type == CourierType.custom) {
        carrierFee = customCourierFee;
      } else if (courier.type == CourierType.none) {
        carrierFee = 0.0;
      } else if (courier.type == CourierType.poste) {
        carrierFee = productEur <= 150.0 ? 5.0 : 11.50;
      } else if (courier.type == CourierType.posteIoss) {
        carrierFee = 0.0;
      } else {
        final totalTaxes = dutyAmount + vatAmount;
        final percentageAmount = courier.percentageFee > 0 ? totalTaxes * (courier.percentageFee / 100.0) : 0.0;
        carrierFee = courier.baseFee > percentageAmount ? courier.baseFee : percentageAmount;
      }
    }

    if (category.isAgri) {
      notes.add('Prodotto alimentare/agricolo: verificare eventuali oneri di ispezione sanitaria USMAF/PIF.');
    }

    final taxesOnly = dutyAmount + vatAmount;
    final totalOnDelivery = taxesOnly + carrierFee;
    final grandTotalCost = cif + totalOnDelivery;

    return CalculationResult(
      category: category,
      currency: currency,
      productValueEur: productEur,
      shippingValueEur: shippingEur,
      insuranceValueEur: insuranceEur,
      cif: cif,
      appliedDutyRate: appliedDutyRate,
      dutyAmount: dutyAmount,
      vatBase: vatBase,
      appliedVatRate: appliedVatRate,
      vatAmount: vatAmount,
      carrierFee: carrierFee,
      taxesOnly: taxesOnly,
      totalOnDelivery: totalOnDelivery,
      grandTotalCost: grandTotalCost,
      notes: notes,
      warnings: warnings,
      legalReferences: legalReferences,
    );
  }
}