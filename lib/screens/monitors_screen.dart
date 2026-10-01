import 'package:flutter/material.dart';
import '../models/monitor_item.dart';

class MonitorsScreen extends StatefulWidget {
  final List<MonitorItem> monitors;

  const MonitorsScreen({super.key, required this.monitors});

  @override
  State<MonitorsScreen> createState() => _MonitorsScreenState();
}

class _MonitorsScreenState extends State<MonitorsScreen> {
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      appBar: AppBar(
        title: const Text('Miei Monitor Vinted', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: const Color(0xFF18181B),
        elevation: 0,
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: widget.monitors.length,
        itemBuilder: (context, index) {
          final mon = widget.monitors[index];
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF18181B),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: mon.isActive ? const Color(0xFF06B6D4) : const Color(0xFF27272A)),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    Text(
                      mon.name,
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                    Switch(
                      value: mon.isActive,
                      activeColor: const Color(0xFF06B6D4),
                      onChanged: (val) {
                        setState(() => mon.isActive = val);
                      },
                    ),
                  ],
                ),
                Text(
                  'Trovati: ${mon.matchCount} annunci',
                  style: const TextStyle(color: Color(0xFF22D3EE), fontSize: 12),
                ),
                const SizedBox(height: 8),
                Text(
                  'Brand: ${mon.brands.join(", ")} · Max: €${mon.maxPrice.toStringAsFixed(0)}',
                  style: const TextStyle(color: Colors.white70, fontSize: 12),
                ),
                Text(
                  'Taglie: ${mon.sizes.join(", ")} · Paesi: ${mon.countries.join(", ")}',
                  style: const TextStyle(color: Colors.white54, fontSize: 11),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
