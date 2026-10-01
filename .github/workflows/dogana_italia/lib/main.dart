import 'package:flutter/material.dart';
import 'screens/home_screen.dart';

void main() {
  runApp(const DoganaItaliaApp());
}

class DoganaItaliaApp extends StatelessWidget {
  const DoganaItaliaApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'DoganaItalia AI',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        brightness: Brightness.dark,
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFF6366F1),
          secondary: Color(0xFF38BDF8),
          surface: Color(0xFF131826),
          background: Color(0xFF0A0E1A),
        ),
        scaffoldBackgroundColor: const Color(0xFF0A0E1A),
      ),
      home: const HomeScreen(),
    );
  }
}