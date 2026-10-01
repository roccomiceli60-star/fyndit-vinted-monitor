import 'package:flutter/material.dart';
import '../data/customs_database.dart';
import '../models/customs_category.dart';

class CatalogScreen extends StatefulWidget {
  final CustomsCategory selectedCategory;
  final ValueChanged<CustomsCategory> onCategorySelected;

  const CatalogScreen({
    super.key,
    required this.selectedCategory,
    required this.onCategorySelected,
  });

  @override
  State<CatalogScreen> createState() => _CatalogScreenState();
}

class _CatalogScreenState extends State<CatalogScreen> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final filtered = CustomsDatabase.categories.where((cat) {
      final q = _searchQuery.toLowerCase();
      return cat.name.toLowerCase().contains(q) ||
          cat.hsCode.toLowerCase().contains(q) ||
          cat.keywords.any((k) => k.toLowerCase().contains(q));
    }).toList();

    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      appBar: AppBar(
        title: const Text('Prontuario TARIC', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF131826),
      ),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: TextField(
              onChanged: (val) => setState(() => _searchQuery = val),
              style: const TextStyle(color: Colors.white),
              decoration: InputDecoration(
                hintText: 'Cerca prodotto o codice TARIC...',
                prefixIcon: const Icon(Icons.search, color: Colors.white54),
                filled: true,
                fillColor: const Color(0xFF131826),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              itemCount: filtered.length,
              itemBuilder: (context, index) {
                final cat = filtered[index];
                return ListTile(
                  title: Text(cat.name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                  subtitle: Text('TARIC: ${cat.hsCode} · Dazio: ${cat.dutyRate}%', style: const TextStyle(color: Colors.white54)),
                  trailing: const Icon(Icons.chevron_right, color: Colors.white30),
                  onTap: () {
                    widget.onCategorySelected(cat);
                    Navigator.pop(context);
                  },
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}