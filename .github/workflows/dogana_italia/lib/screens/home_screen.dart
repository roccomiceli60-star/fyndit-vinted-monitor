import 'package:flutter/material.dart';
import '../data/customs_database.dart';
import '../models/calculation_result.dart';
import '../models/courier_option.dart';
import '../models/currency_item.dart';
import '../models/customs_category.dart';
import '../services/customs_calculator.dart';
import 'bill_auditor_screen.dart';
import 'catalog_screen.dart';
import 'guide_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final _searchController = TextEditingController(text: 'carte pokemon');
  final _valoreController = TextEditingController(text: '100');
  final _spedizioneController = TextEditingController(text: '15');
  final _assicurazioneController = TextEditingController(text: '0');

  late CustomsCategory _selectedCategory;
  CurrencyItem _selectedCurrency = CustomsDatabase.currencies.first;
  double _vatRate = 22.0;
  OriginRegion _originRegion = OriginRegion.mfn;
  bool _isGift = false;
  bool _isIoss = false;
  CourierOption _selectedCourier = CustomsDatabase.couriers.first;

  @override
  void initState() {
    super.initState();
    _selectedCategory = CustomsCalculatorService.detectCategory(_searchController.text);
  }

  void _onSearchChanged(String query) {
    setState(() {
      _selectedCategory = CustomsCalculatorService.detectCategory(query);
      _vatRate = _selectedCategory.suggestedVat.toDouble();
    });
  }

  @override
  Widget build(BuildContext context) {
    final double productVal = double.tryParse(_valoreController.text) ?? 0.0;
    final double shippingVal = double.tryParse(_spedizioneController.text) ?? 0.0;
    final double insuranceVal = double.tryParse(_assicurazioneController.text) ?? 0.0;

    final result = CustomsCalculatorService.calculate(
      category: _selectedCategory,
      currency: _selectedCurrency,
      productValue: productVal,
      shippingValue: shippingVal,
      insuranceValue: insuranceVal,
      vatRate: _vatRate,
      originRegion: _originRegion,
      isGift: _isGift,
      isIoss: _isIoss,
      courier: _selectedCourier,
    );

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      appBar: AppBar(
        title: const Text('🛃 DoganaItalia', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: const Color(0xFF131826),
        foregroundColor: Colors.white,
        actions: [
          IconButton(
            icon: const Icon(Icons.shield_outlined),
            tooltip: 'Verifica Bolla',
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const BillAuditorScreen())),
          ),
          IconButton(
            icon: const Icon(Icons.menu_book_outlined),
            tooltip: 'Guida Normativa',
            onPressed: () => Navigator.push(context, MaterialPageRoute(builder: (_) => const GuideScreen())),
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Sezione 1: Ricerca
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF131826),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF262D40)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  TextField(
                    controller: _searchController,
                    onChanged: _onSearchChanged,
                    style: const TextStyle(color: Colors.white),
                    decoration: InputDecoration(
                      hintText: 'Cosa hai acquistato?',
                      prefixIcon: const Icon(Icons.search, color: Colors.white54),
                      suffixIcon: IconButton(
                        icon: const Icon(Icons.list, color: Color(0xFF818CF8)),
                        onPressed: () {
                          Navigator.push(
                            context,
                            MaterialPageRoute(
                              builder: (_) => CatalogScreen(
                                selectedCategory: _selectedCategory,
                                onCategorySelected: (c) => setState(() {
                                  _selectedCategory = c;
                                  _vatRate = c.suggestedVat.toDouble();
                                }),
                              ),
                            ),
                          );
                        },
                      ),
                      filled: true,
                      fillColor: const Color(0xFF0A0E1A),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    mainAxisAlignment: MainAxisAlignment.between,
                    children: [
                      Text(_selectedCategory.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                      Text('Dazio: ${_selectedCategory.dutyRate.toStringAsFixed(1)}%', style: const TextStyle(color: Color(0xFFFBBF24), fontWeight: FontWeight.bold)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            // Prospetto Sintesi
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF131826),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(color: const Color(0xFF6366F1)),
              ),
              child: Column(
                children: [
                  Text('Alla Consegna: €${result.totalOnDelivery.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 20)),
                  const SizedBox(height: 8),
                  Text('Spesa Totale Complessiva: €${result.grandTotalCost.toStringAsFixed(2)}', style: const TextStyle(color: Colors.white70, fontSize: 14)),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}