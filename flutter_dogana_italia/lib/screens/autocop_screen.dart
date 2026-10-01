import 'dart:math';
import 'package:flutter/material.dart';

class AutocopScreen extends StatefulWidget {
  const AutocopScreen({super.key});

  @override
  State<AutocopScreen> createState() => _AutocopScreenState();
}

class _AutocopScreenState extends State<AutocopScreen> {
  bool _isRunning = false;
  int? _reactionTimeMs;
  final List<String> _logs = [
    'Trapstar Decoded M → Acquistato in 184ms',
    'Nike Dunk Panda 42 → Acquistato in 210ms',
  ];

  void _runSimulation() {
    setState(() {
      _isRunning = true;
      _reactionTimeMs = null;
    });

    Future.delayed(const Duration(milliseconds: 600), () {
      final ms = 140 + Random().nextInt(100);
      setState(() {
        _isRunning = false;
        _reactionTimeMs = ms;
        _logs.insert(0, 'Stussy 8 Ball M → Preso in ${ms}ms!');
      });
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      appBar: AppBar(
        title: const Text('Autocop Bot Sniper', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: const Color(0xFF18181B),
        elevation: 0,
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
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
                  const Text(
                    'Simulatore Autocop Vinted',
                    style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  const SizedBox(height: 8),
                  const Text(
                    'Testa la reattività del bot per assicurarti capi rari al momento del drop prima degli altri.',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.white60, fontSize: 12),
                  ),
                  const SizedBox(height: 16),
                  ElevatedButton.icon(
                    onPressed: _isRunning ? null : _runSimulation,
                    icon: const Icon(Icons.bolt),
                    label: Text(_isRunning ? 'Simulazione...' : 'Testa Velocità Autocop'),
                    style: ElevatedButton.styleFrom(
                      backgroundColor: const Color(0xFF8B5CF6),
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  if (_reactionTimeMs != null) ...[
                    const SizedBox(height: 14),
                    Text(
                      '⚡ Tempo Reazione: $_reactionTimeMs ms',
                      style: const TextStyle(color: Color(0xFF34D399), fontWeight: FontWeight.w900, fontSize: 16),
                    ),
                  ],
                ],
              ),
            ),
            const SizedBox(height: 16),
            Expanded(
              child: Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: const Color(0xFF18181B),
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: const Color(0xFF27272A)),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Registro Operazioni Sniper', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14)),
                    const SizedBox(height: 10),
                    Expanded(
                      child: ListView.builder(
                        itemCount: _logs.length,
                        itemBuilder: (context, index) {
                          return Padding(
                            padding: const EdgeInsets.symmetric(vertical: 4),
                            child: Row(
                              children: [
                                const Icon(Icons.check_circle, color: Color(0xFF34D399), size: 14),
                                const SizedBox(width: 8),
                                Expanded(
                                  child: Text(_logs[index], style: const TextStyle(color: Colors.white70, fontSize: 12)),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}
