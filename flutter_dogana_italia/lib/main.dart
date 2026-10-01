import 'package:flutter/material.dart';
import 'data/sample_deals.dart';
import 'models/deal_item.dart';
import 'models/monitor_item.dart';
import 'screens/autocop_screen.dart';
import 'screens/calculator_screen.dart';
import 'screens/feed_screen.dart';
import 'screens/guide_screen.dart';
import 'screens/monitors_screen.dart';

void main() {
  runApp(const FynditApp());
}

class FynditApp extends StatelessWidget {
  const FynditApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'Fyndit Vinted Bot',
      debugShowCheckedModeBanner: false,
      theme: ThemeData.dark().copyWith(
        scaffoldBackgroundColor: const Color(0xFF09090B),
        primaryColor: const Color(0xFF06B6D4),
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF06B6D4),
          secondary: Color(0xFF8B5CF6),
          surface: Color(0xFF18181B),
        ),
      ),
      home: const MainNavigationScreen(),
    );
  }
}

class MainNavigationScreen extends StatefulWidget {
  const MainNavigationScreen({super.key});

  @override
  State<MainNavigationScreen> createState() => _MainNavigationScreenState();
}

class _MainNavigationScreenState extends State<MainNavigationScreen> {
  int _currentIndex = 0;
  final List<DealItem> _deals = List.from(SampleDealsData.initialDeals);
  final List<MonitorItem> _monitors = List.from(SampleDealsData.defaultMonitors);
  DealItem? _selectedDealForCalc;

  void _openCalculatorWithDeal(DealItem item) {
    setState(() {
      _selectedDealForCalc = item;
      _currentIndex = 2; // Index of calculator
    });
  }

  @override
  Widget build(BuildContext context) {
    final List<Widget> screens = [
      FeedScreen(
        deals: _deals,
        onSelectDealForCalculator: _openCalculatorWithDeal,
      ),
      MonitorsScreen(monitors: _monitors),
      CalculatorScreen(selectedDeal: _selectedDealForCalc),
      const AutocopScreen(),
      const GuideScreen(),
    ];

    return Scaffold(
      body: screens[_currentIndex],
      bottomNavigationBar: NavigationBar(
        selectedIndex: _currentIndex,
        backgroundColor: const Color(0xFF18181B),
        indicatorColor: const Color(0xFF083344),
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.flash_on_outlined, color: Colors.white70),
            selectedIcon: Icon(Icons.flash_on, color: Color(0xFF22D3EE)),
            label: 'Live',
          ),
          NavigationDestination(
            icon: Icon(Icons.track_changes_outlined, color: Colors.white70),
            selectedIcon: Icon(Icons.track_changes, color: Color(0xFF22D3EE)),
            label: 'Monitor',
          ),
          NavigationDestination(
            icon: Icon(Icons.calculate_outlined, color: Colors.white70),
            selectedIcon: Icon(Icons.calculate, color: Color(0xFF34D399)),
            label: 'Profitto',
          ),
          NavigationDestination(
            icon: Icon(Icons.smart_toy_outlined, color: Colors.white70),
            selectedIcon: Icon(Icons.smart_toy, color: Color(0xFFA78BFA)),
            label: 'Autocop',
          ),
          NavigationDestination(
            icon: Icon(Icons.menu_book_outlined, color: Colors.white70),
            selectedIcon: Icon(Icons.menu_book, color: Color(0xFF60A5FA)),
            label: 'Guida',
          ),
        ],
        onDestinationSelected: (idx) {
          setState(() => _currentIndex = idx);
        },
      ),
    );
  }
}
