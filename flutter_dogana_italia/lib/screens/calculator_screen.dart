import 'package:flutter/material.dart';
import '../models/deal_item.dart';
import '../models/profit_result.dart';
import '../services/profit_calculator_service.dart';

class CalculatorScreen extends StatefulWidget {
  final DealItem? selectedDeal;

  const CalculatorScreen({super.key, this.selectedDeal});

  @override
  State<CalculatorScreen> createState() => _CalculatorScreenState();
}

class _CalculatorScreenState extends State<CalculatorScreen> {
  late TextEditingController _buyController;
  late TextEditingController _resellController;
  late TextEditingController _shippingController;
  String _platform = 'vinted';

  @override
  void initState() {
    super.initState();
    final buy = widget.selectedDeal?.price ?? 40.0;
    final resell = widget.selectedDeal?.marketValue ?? 110.0;
    _buyController = TextEditingController(text: buy.toStringAsFixed(0));
    _resellController = TextEditingController(text: resell.toStringAsFixed(0));
    _shippingController = TextEditingController(text: '2.99');
  }

  @override
  void dispose() {
    _buyController.dispose();
    _resellController.dispose();
    _shippingController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final buy = double.tryParse(_buyController.text) ?? 0.0;
    final resell = double.tryParse(_resellController.text) ?? 0.0;
    final shipping = double.tryParse(_shippingController.text) ?? 2.99;

    final ProfitResult result = ProfitCalculatorService.calculate(
      buyPrice: buy,
      shippingCost: shipping,
      resellPrice: resell,
      platform: _platform,
    );

    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      appBar: AppBar(
        title: const Text('Calcolatore Margini Vinted', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: const Color(0xFF18181B),
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: const Color(0xFF18181B),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFF27272A)),
              ),
              child: Column(
                children: [
                  TextField(
                    controller: _buyController,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
                    decoration: const InputDecoration(
                      labelText: 'Prezzo Inserzione Vinted (€)',
                      labelStyle: TextStyle(color: Colors.white60),
                      prefixText: '€ ',
                      prefixStyle: TextStyle(color: Colors.cyan),
                    ),
                    onChanged: (v) => setState(() {}),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _shippingController,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      labelText: 'Spedizione stimata (€) InPost/Locker',
                      labelStyle: TextStyle(color: Colors.white60),
                      prefixText: '€ ',
                    ),
                    onChanged: (v) => setState(() {}),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: _resellController,
                    keyboardType: TextInputType.number,
                    style: const TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.bold),
                    decoration: const InputDecoration(
                      labelText: 'Prezzo stimato di rivendita (€)',
                      labelStyle: TextStyle(color: Colors.white60),
                      prefixText: '€ ',
                    ),
                    onChanged: (v) => setState(() {}),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    value: _platform,
                    dropdownColor: const Color(0xFF18181B),
                    style: const TextStyle(color: Colors.white),
                    decoration: const InputDecoration(
                      labelText: 'Piattaforma di Rivendita',
                      labelStyle: TextStyle(color: Colors.white60),
                    ),
                    items: const [
                      DropdownMenuItem(value: 'vinted', child: Text('Vinted (0% fee)')),
                      DropdownMenuItem(value: 'stockx', child: Text('StockX (12% fee)')),
                      DropdownMenuItem(value: 'ebay', child: Text('eBay (11.5% fee)')),
                    ],
                    onChanged: (val) {
                      if (val != null) setState(() => _platform = val);
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF18181B), Color(0xFF0F172A)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                border: Border.all(color: const Color(0xFF06B6D4)),
              ),
              child: Column(
                children: [
                  Text(
                    result.status,
                    style: const TextStyle(color: Color(0xFFFBBF24), fontWeight: FontWeight.bold, fontSize: 14),
                  ),
                  const SizedBox(height: 8),
                  const Text('Profitto Netto Guadagno', style: TextStyle(color: Colors.white60, fontSize: 12)),
                  Text(
                    '€${result.netProfit.toStringAsFixed(2)}',
                    style: TextStyle(
                      color: result.netProfit >= 0 ? const Color(0xFF34D399) : Colors.redAccent,
                      fontWeight: FontWeight.w900,
                      fontSize: 32,
                    ),
                  ),
                  Text(
                    'ROI: ${result.roiPercent.toStringAsFixed(1)}%',
                    style: const TextStyle(color: Color(0xFF22D3EE), fontWeight: FontWeight.bold, fontSize: 13),
                  ),
                  const Divider(color: Colors.white24, height: 24),
                  _buildRow('Spesa Totale Acquisto', '€${result.totalCost.toStringAsFixed(2)}'),
                  _buildRow('Protezione Acquisti (0.70€ + 5%)', '€${result.buyerProtection.toStringAsFixed(2)}'),
                  _buildRow('Incasso Lordo Rivendita', '€${result.resellPrice.toStringAsFixed(2)}'),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildRow(String label, String value) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 4),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
          Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 12)),
        ],
      ),
    );
  }
}
