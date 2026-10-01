import 'package:flutter/material.dart';

class BillAuditorScreen extends StatefulWidget {
  const BillAuditorScreen({super.key});

  @override
  State<BillAuditorScreen> createState() => _BillAuditorScreenState();
}

class _BillAuditorScreenState extends State<BillAuditorScreen> {
  final _valoreController = TextEditingController(text: '120');
  final _dazioController = TextEditingController(text: '0');

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      appBar: AppBar(
        title: const Text('Verifica Bolla Corriere', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF131826),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          children: [
            TextField(
              controller: _valoreController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Valore Merce Dichiarato (€)'),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: _dazioController,
              keyboardType: TextInputType.number,
              decoration: const InputDecoration(labelText: 'Dazio Addebitato (€)'),
            ),
          ],
        ),
      ),
    );
  }
}