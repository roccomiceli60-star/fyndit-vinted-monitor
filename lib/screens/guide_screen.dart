import 'package:flutter/material.dart';

class GuideScreen extends StatelessWidget {
  const GuideScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF09090B),
      appBar: AppBar(
        title: const Text('Guida Reselling Fyndit', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
        backgroundColor: const Color(0xFF18181B),
        elevation: 0,
      ),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: const [
          _GuideCard(
            title: '1. Configurazione Webhook Discord',
            content: 'Crea un canale Discord personale, genera un URL Webhook e incollalo nel bot. Riceverai le notifiche con foto e link diretto sul tuo iPhone in meno di 200ms!',
            badge: 'VELOCITÀ',
            color: Color(0xFF818CF8),
          ),
          SizedBox(height: 12),
          _GuideCard(
            title: '2. I Brand più venduti',
            content: 'Concentrati su Trapstar (Chenille, Hyperdrive), Ralph Lauren vintage (maglioni trecce), Carhartt (Detroit) e Corteiz. Offrono un margine medio di oltre il 60% e si vendono in poche ore.',
            badge: 'PROFITTO',
            color: Color(0xFFFBBF24),
          ),
          SizedBox(height: 12),
          _GuideCard(
            title: '3. Evitare Fake e Repliche',
            content: 'Controlla sempre il codice seriale sull\'etichetta interna (Wash Tag), la fattura originale del venditore e diffida di account con 0 recensioni creati in giornata.',
            badge: 'SICUREZZA',
            color: Color(0xFFF87171),
          ),
          SizedBox(height: 12),
          _GuideCard(
            title: '4. Regola Fiscale DAC7',
            content: 'Vinted comunica all\'Agenzia delle Entrate i dati degli utenti che superano 30 vendite o 2.000€ annui di incasso complessivo.',
            badge: 'NORMATIVA',
            color: Color(0xFF34D399),
          ),
        ],
      ),
    );
  }
}

class _GuideCard extends StatelessWidget {
  final String title;
  final String content;
  final String badge;
  final Color color;

  const _GuideCard({
    required this.title,
    required this.content,
    required this.badge,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF18181B),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: const Color(0xFF27272A)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(6),
                ),
                child: Text(
                  badge,
                  style: TextStyle(color: color, fontWeight: FontWeight.bold, fontSize: 10),
                ),
              ),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  title,
                  style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 14),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(content, style: const TextStyle(color: Colors.white70, fontSize: 12, height: 1.4)),
        ],
      ),
    );
  }
}
