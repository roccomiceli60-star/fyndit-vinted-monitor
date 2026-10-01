# 🛃 DoganaItalia AI (Flutter Project)

Progetto Flutter completo e pronto all'uso per il calcolo dei dazi doganali, IVA all'importazione e spese di sdoganamento dei corrieri per l'Italia (TARIC / ADM 2026).

## Caratteristiche Tecniche del Progetto Flutter

- **Motore di calcolo TARIC locale e immediato** (senza dipendenze esterne bloccanti).
- **Franchigie doganali UE conformi al Reg. CE 1186/2009** (Soglia dazi 150€, Regali C2C 45€, Formula CIF).
- **Supporto Regime IOSS (Import One Stop Shop)**.
- **Convertitore di valuta estera** (USD, GBP, JPY, CAD, CHF, AUD, CNY).
- **Schermata di verifica bolla corriere (Audit)** per contestare addebiti errati.
- **Prontuario TARIC sfogliabile e ricercabile**.
- **Guida normativa interattiva**.
- **Dark Mode nativa** in stile Material 3.

---

## 🚀 Come Eseguire il Progetto

### 1. Prerequisiti
Assicurati di avere installato l'SDK di Flutter (versione >= 3.0.0):
```bash
flutter --version
```

### 2. Creazione / Configurazione del Progetto
Se vuoi integrarlo in una cartella appena creata:
```bash
flutter create dogana_italia
cd dogana_italia
```
Sostituisci la cartella `lib/` e il file `pubspec.yaml` con i file contenuti in questo progetto.

### 3. Installazione Dipendenze
```bash
flutter pub get
```

### 4. Avvio su Emulatore, Dispositivo Fisico o Desktop
```bash
# Esegui su Android o iOS
flutter run

# Oppure esegui su browser Web
flutter run -d chrome

# Oppure su macOS / Windows
flutter run -d macos
```

---

## Struttura della Cartella `lib/`

```
lib/
├── main.dart                          # Entry point dell'app Flutter
├── data/
│   └── customs_database.dart          # Database categorie TARIC, valute e corrieri
├── models/
│   ├── customs_category.dart          # Modello categoria merceologica TARIC
│   ├── courier_option.dart            # Modello tariffe corrieri (DHL, FedEx, UPS, Poste)
│   ├── currency_item.dart             # Modello tassi di cambio valute
│   └── calculation_result.dart        # Modello risultato di liquidazione doganale
├── services/
│   └── customs_calculator.dart        # Motore logico di calcolo tributario e CIF
└── screens/
    ├── home_screen.dart               # Calcolatore interattivo principale
    ├── catalog_screen.dart            # Prontuario categorie TARIC con ricerca
    ├── bill_auditor_screen.dart       # Verificatore bolla e reclami corriere
    └── guide_screen.dart              # Guida ufficiale alla normativa ADM
```
