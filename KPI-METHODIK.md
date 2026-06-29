# KPI-Methodik

Abgleich vom 30.05.2026 auf Basis der fachlich relevanten Dateien im Ordner `Dokumente`.

## Genutzte Quellen

- `Documents/Codex/KPI/Autohaus_KPI_Dashboard.xlsx`
- `Documents/Codex/KPI/ExportKPI.xlsx`
- `Documents/New project 2/autohaus-bestandsanalyse/ausgabe/Bestand_Boersenabgleich_KPI_Check.xlsx`
- `Documents/New project 2/autohaus-bestandsanalyse/ausgabe/Autohaus_Bestandsanalyse_KPI_Marktcheck.xlsx`
- `Documents/Codex/outputs/autohaus_dashboard/Autohaus_Verkaeuferbesprechung_Dashboard.xlsx`
- `Documents/Bestand.xlsx`
- `Documents/Einleitung_Gebrauchtwagen_Handbuch.pdf`

Musiknoten, Steuerunterlagen, private Schreiben und fachfremde PDFs wurden nicht als KPI-Grundlage verwendet.

## Verkauf

- Kontakte, Leads, Angebote, Probefahrten und Abschluesse werden als Monatssummen gerechnet.
- Conversion = Abschluesse / Leads.
- Lead->Angebot = Angebote / Leads.
- Probefahrtquote = Probefahrten / Angebote.
- Monats-Soll fuer Mengen-KPIs wird zeitanteilig nach Arbeitstagen berechnet.
- Samstage, Sonntage und Feiertage Baden-Wuerttemberg werden fuer den Zeitanteil nicht gezaehlt.

## Bestand / Gebrauchtwagen

- Gesamtbestand = Anzahl Fahrzeuge im Bestand.
- Durchschnittliches Bestandsalter = Mittelwert der Tage im Bestand.
- Median Bestandsalter = mittlerer Bestandsalter-Wert, robust gegen Ausreisser.
- Bestandsalter-Klassen = 0-30, 31-60, 61-90, 91-180 und >180 Tage.
- Standzeit 0 = Prozessdauer von Hereinnahme bis Werkstatt.
- Standzeit 1 = Prozessdauer von Anlieferung/Hereinnahme bis Verkaufsbereitschaft.
- Standzeit 2 = Prozessdauer der aktiven Vermarktung bis Kaufvertrag.
- Standzeit 3 = Prozessdauer von Kaufvertrag bis Auslieferung.
- Anteil >90 Tage = Fahrzeuge mit mehr als 90 Standtagen / Gesamtbestand.
- Fahrzeuge ohne Bilder, ohne Preis und nicht online sind operative Fehlerlisten mit Zielwert 0.
- Preisquote = Fahrzeuge mit Preis / Gesamtbestand.
- Bildquote 15+ = Fahrzeuge mit mindestens 15 Bildern / Gesamtbestand.
- Onlinequote = Fahrzeuge online / Gesamtbestand.

Hinweis: `Standzeit 0`, `Standzeit 1`, `Standzeit 2` und `Standzeit 3` sind eigene Prozess-KPIs im Gebrauchtwagenmanagement. Die App nutzt fuer reine Hof-Altersklassen deshalb den Begriff `Bestandsalter`.
- Anteil verkaufsfertig = Fahrzeuge mit Status `ok`, `verkaufsfertig` oder `online` / Gesamtbestand.

Diese Bestandskennzahlen sind Punkt-in-Zeit-KPIs und werden nicht zeitanteilig auf den Monat heruntergerechnet.

## Werkstatt / Teilelager

- Auslastung = verkaufte beziehungsweise produktive Stunden / Kapazitaet.
- Produktivstunden und Fertigstellungen werden als Mengen-KPIs zeitanteilig zum Monatsziel bewertet.
- Fehlteile und Reklamationen sind niedriger-ist-besser-KPIs.

## Zielerreichung

- Normale KPIs: Ist / Soll.
- Niedriger-ist-besser-KPIs: Ziel / Ist, bei Ist unter Ziel wird 100 Prozent Zielerreichung angesetzt.
- Monitor-Status:
  - ab 100 Prozent: gut
  - ab 85 Prozent: beobachten
  - darunter: kritisch
