import 'package:flutter/material.dart';

class GuideScreen extends StatelessWidget {
  const GuideScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      appBar: AppBar(
        title: const Text('Guida Normativa ADM', style: TextStyle(fontWeight: FontWeight.bold)),
        backgroundColor: const Color(0xFF131826),
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          ListTile(
            title: Text('Soglia Franchigia 150€', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            subtitle: Text('Le merci di valore fino a 150€ sono esenti da dazio (Reg. CE 1186/2009 art. 23). L\'IVA rimane dovuta.', style: TextStyle(color: Colors.white70)),
          ),
          ListTile(
            title: Text('Regime IOSS', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
            subtitle: Text('Se l\'IVA è inclusa al checkout, alla consegna non dovrai pagare nulla in più al fattorino.', style: TextStyle(color: Colors.white70)),
          ),
        ],
      ),
    );
  }
}