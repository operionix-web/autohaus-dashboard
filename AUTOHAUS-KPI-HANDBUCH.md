# Autohaus-KPI-Handbuch

Stand: 30.05.2026

Dieses Handbuch beschreibt die KPI-Logik der App fuer eine mittelgrosse Autohausfiliale mit Verkauf, Werkstatt, Serviceannahme, Teilelager, Disposition, Aufbereitung, Verwaltung sowie Gebaeude / Sicherheit / IT.

Die App ist bewusst betriebswirtschaftlich aufgebaut: zuerst Rohertrag und Deckungsbeitrag je Bereich, dann operative Prozesskennzahlen, dann Kapitalbindung, Qualitaet und Kundenzufriedenheit.

## Quellenbasis

Verwendete externe Quellen:

- NADA: `2025 Formulas, Definitions and Guides`, insbesondere Days Supply, Turn Rate, Fixed Absorption, Produktivitaets- und Service-Benchmarks.
- RAW Partner: `Kennzahlen-Poster fuer das Autohaus`, insbesondere Rohertrag / Deckungsbeitrag, Wareneinsatzlogik und Benchmarkbereiche fuer Autohaus-Geschaeftsbereiche.
- Deloitte: `2023 Dealership Benchmarks`, insbesondere Gross Profit je Einheit, Days Supply, F&I, Parts, Service, Absorption und Selling Gross Profit.
- DealerInt: `How to Read a Dealership Financial Statement`, insbesondere Profit-Center-Struktur nach New, Used, F&I, Service und Parts sowie Gross-Profit-Logik.
- Lokale Dateien im Ordner `Dokumente`: Autohaus-KPI-Dashboards, Bestandsanalyse, ExportKPI, Bestand und Gebrauchtwagen-Handbuch.

## Grundlogik

### Ertragsebenen

1. Umsatz
   Gesamtleistung beziehungsweise Erlos eines Bereichs.

2. Wareneinsatz / direkte Kosten
   Direkt zurechenbare Kosten, zum Beispiel Fahrzeug-EK, Teile-EK oder produktive Loehne.

3. DB I
   Umsatz minus direkt zurechenbare Kosten und variable Bereichskosten.

4. DB II
   DB I beziehungsweise Gesamtdeckungsbeitrag minus zurechenbare Fixkosten / Overhead.

5. Net-to-Gross
   Ergebnis nach Fixkosten im Verhaeltnis zum Gesamtdeckungsbeitrag.

## Deckungsbeitrag nach Bereichen

### Verkauf Neuwagen / Gebrauchtwagen

Eingabewerte:

- `Umsatz NW`
- `Umsatz GW`
- `Wareneinsatz NW`
- `Wareneinsatz GW`
- `Variable Verkaufskosten`
- `Abschlüsse`

Formeln:

- Verkaufserloes = Umsatz NW + Umsatz GW
- Verkauf-Wareneinsatz = Wareneinsatz NW + Wareneinsatz GW
- DB I Verkauf = Verkaufserloes - Verkauf-Wareneinsatz - Variable Verkaufskosten
- DB I Verkauf % = DB I Verkauf / Verkaufserloes
- DB pro Fahrzeug = DB I Verkauf / Abschluesse

Hinweis:
Bei Gebrauchtwagen sollen interne Leistungen und Aufbereitungskosten sauber zugeordnet werden. Wertberichtigungen, Abschreibungen, Zinsen, Provisionen und allgemeine Umlagen sollten nicht unklar doppelt in den Wareneinsatz laufen.

### Werkstatt

Eingabewerte:

- `Arbeitsumsatz`
- `Produktivlohn`
- `Werkstatt-Gemeinkosten`
- `Stunden verkauft`
- `Verrechnungssatz`

Formeln:

- Arbeitsumsatz = direkte Eingabe oder Stunden verkauft x Verrechnungssatz
- DB Werkstatt = Arbeitsumsatz - Produktivlohn - Werkstatt-Gemeinkosten
- DB Werkstatt % = DB Werkstatt / Arbeitsumsatz
- Lohnproduktivitaet = Arbeitsumsatz / Produktivlohn

Operative Zusatz-KPIs:

- Auslastung = Stunden verkauft / Kapazitaet
- Produktivitaet = fakturierte Stunden / Anwesenheitsstunden
- Effizienz = fakturierte Stunden / gestempelte Arbeitsstunden
- Reklamationsquote = Reklamationen / Auftraege

### Teilelager

Eingabewerte:

- `Teileumsatz`
- `Teile-Wareneinsatz`
- `Teile-Gemeinkosten`

Formeln:

- DB Teile = Teileumsatz - Teile-Wareneinsatz - Teile-Gemeinkosten
- DB Teile % = DB Teile / Teileumsatz
- Lagerumschlag = Teile-Wareneinsatz / durchschnittlicher Lagerbestand
- Verfuegbarkeit / Fill Rate = direkt verfuegbare Teile / angefragte Teile

### Fahrzeugaufbereitung

Eingabewerte:

- `Aufbereitungsumsatz intern`
- `Aufbereitungskosten`

Formeln:

- DB Aufbereitung = Aufbereitungsumsatz intern - Aufbereitungskosten
- Durchlaufzeit = Fertigstellungsdatum - Eingang
- Rueckstand = offene Fahrzeuge in Aufbereitung

### F&I

Eingabewerte:

- `F&I-Ertrag`
- `Abschlüsse`
- Finanzierungen / Versicherungen

Formeln:

- F&I-Ertrag pro Fahrzeug = F&I-Ertrag / Abschluesse
- Finanzierungsquote = Finanzierungen / Abschluesse
- Versicherungsquote = Versicherungen / Abschluesse
- Stornoquote = Stornos / abgeschlossene F&I-Produkte

### Gesamtbetrieb

Eingabewerte:

- Summe DB I aus Verkauf, Werkstatt, Teilelager, Aufbereitung und F&I
- `Fixkosten gesamt`

Formeln:

- Gesamtdeckungsbeitrag = DB Verkauf + DB Werkstatt + DB Teile + DB Aufbereitung + F&I-Ertrag
- DB-Quote gesamt = Gesamtdeckungsbeitrag / Gesamtumsatz
- Deckungsbeitrag II = Gesamtdeckungsbeitrag - Fixkosten gesamt
- Absorption = (DB Werkstatt + DB Teile) / Fixkosten gesamt
- Overheadquote = Fixkosten gesamt / Gesamtdeckungsbeitrag
- Net-to-Gross = Deckungsbeitrag II / Gesamtdeckungsbeitrag

Interpretation:
Eine hohe Absorption bedeutet, dass die stabileren Fixed-Ops-Bereiche Werkstatt und Teile einen grossen Anteil der Standortfixkosten tragen. Das reduziert die Abhaengigkeit vom volatilen Fahrzeugverkauf.

## Verkauf-Funnel

Eingabewerte:

- Kontakte
- Leads
- Angebote
- Probefahrten
- Abschluesse

Formeln:

- Lead->Angebot = Angebote / Leads
- Probefahrtquote = Probefahrten / Angebote
- Conversion = Abschluesse / Leads
- Abschlussquote Kontakt = Abschluesse / Kontakte

Warum Conversion nicht auf Kontakte gerechnet wird:
Kontakte sind oft Vorstufe oder Aktivitaetsmass. Die saubere Verkaufsconversion wird in den meisten Dashboards von verwertbaren Leads beziehungsweise Opportunities bis Abschluss betrachtet.

## Gebrauchtwagen / Bestand

Eingabewerte:

- Gesamtbestand
- Standtage je Fahrzeug
- Preis vorhanden
- Anzahl Bilder
- Online-Status
- Verkaufsfertig-Status
- Marktpreisabweichung

Formeln:

- Gesamtbestand = Anzahl Fahrzeuge
- Durchschnittliches Bestandsalter = Mittelwert der Tage im Bestand
- Median Bestandsalter = mittlerer Bestandsalter-Wert
- Bestandsalter 0-30 Tage = Fahrzeuge mit maximal 30 Tagen im Bestand
- Bestandsalter 31-60 Tage = Fahrzeuge mit 31 bis 60 Tagen im Bestand
- Bestandsalter 61-90 Tage = Fahrzeuge mit 61 bis 90 Tagen im Bestand
- Bestandsalter 91-180 Tage = Fahrzeuge mit 91 bis 180 Tagen im Bestand
- Bestandsalter >180 Tage = Fahrzeuge mit mehr als 180 Tagen im Bestand
- Standzeit 0 = durchschnittliche Prozessdauer von Hereinnahme bis Werkstatt
- Standzeit 1 = durchschnittliche Prozessdauer von Anlieferung/Hereinnahme bis Verkaufsbereitschaft
- Standzeit 2 = durchschnittliche Prozessdauer der aktiven Vermarktung bis Kaufvertrag
- Standzeit 3 = durchschnittliche Prozessdauer von Kaufvertrag bis Auslieferung
- Anteil >90 Tage = Fahrzeuge >90 Standtage / Gesamtbestand
- Fahrzeuge mit Bildern = Fahrzeuge mit mindestens einem Bild
- Fahrzeuge ohne Bilder = Fahrzeuge ohne Bild
- Preisquote = Fahrzeuge mit Preis / Gesamtbestand
- Fahrzeuge ohne Preis = Fahrzeuge ohne gepflegten Preis
- Bildquote 15+ = Fahrzeuge mit mindestens 15 Bildern / Gesamtbestand
- Onlinequote = Fahrzeuge online / Gesamtbestand
- Fahrzeuge nicht online = Fahrzeuge ohne aktiven Online-Status
- Anteil verkaufsfertig = verkaufsfertige Fahrzeuge / Gesamtbestand
- Nicht verkaufsfertig = Gesamtbestand minus verkaufsfertige Fahrzeuge
- Ø Marktpreisabweichung = durchschnittliche Marktpreisabweichung der Fahrzeuge
- Days Supply in Units = Bestand / durchschnittliche Monatsverkaeufe x Arbeitstage im Monat
- Umschlag = verkaufte Einheiten / durchschnittlicher Bestand

Der App-Reiter `Fahrzeugbestand` fuehrt diese Kennzahlen bewusst separat, damit Bestandsqualitaet, Online-Reife, Preis-Pflege und Bestandsalter nicht im Gesamtbetrieb untergehen.

Wichtig zur Begrifflichkeit:

Die Begriffe `Standzeit 0`, `Standzeit 1`, `Standzeit 2` und `Standzeit 3` werden im Gebrauchtwagenprozess als Prozessphasen verwendet und duerfen nicht als Altersklassen fuer Hofbestand missverstanden werden.

- Standzeit 0 = Vorlauf von Hereinnahme bis Werkstatt; sie bereitet eine kurze Standzeit 1 vor.
- Standzeit 1 = Hereinnahme, Preisauszeichnung, Prozessplanung sowie technische/optische Aufbereitung bis zur Endkontrolle.
- Standzeit 2 = Zeit nach der Auspreisung, in der das Fahrzeug auf dem Gebrauchtwagenplatz steht und vermarktet wird.
- Standzeit 3 = Zeit vom unterschriebenen Kaufvertrag bis zur Auslieferung an den Kunden.

Die App wertet `Standzeit 0-3` als eigene Prozess-KPIs aus. Fuer reine Altersgruppen des Fahrzeugbestands verwendet sie bewusst `Bestandsalter ...` statt `Standzeit 1/2/3` oder `Standtage 1/2/3`.

Ampel-Logik:

- Bestand ohne Preis: sofort klaeren
- Bestand mit weniger als 15 Bildern: Onlinequalitaet offen
- Fahrzeuge >90 Tage: Bestandsalter-Risiko
- Fahrzeuge >180 Tage: Eskalation

## Monats-Soll und Zielerreichung

Die App rechnet Mengen- und Ertragsziele zeitanteilig nach Arbeitstagen:

- Soll bis heute = Monatsziel x vergangene Arbeitstage / Arbeitstage im Monat
- Zeitquote = Ist bis heute / Soll bis heute
- Monatszielquote = Ist bis heute / Monatsziel

Nicht gezaehlt werden:

- Samstag
- Sonntag
- gesetzliche Feiertage Baden-Wuerttemberg

Punkt-in-Zeit-KPIs werden nicht zeitanteilig gerechnet:

- Preisquote
- Bildquote 15+
- Anteil verkaufsfertig
- Anteil >90 Tage
- Absorption
- DB-Quote
- Conversion-Raten

## Niedriger-ist-besser-KPIs

Beispiele:

- Fehlteile
- Reklamationen
- Krankenquote
- Anteil >90 Tage
- Stornoquote

Formel:

- Zielerreichung = Ziel / Ist
- Wenn Ist <= Ziel, wird die Kennzahl als erfuellt betrachtet.

## Daten, die in der App gepflegt werden sollten

### Verkauf

- Kontakte
- Leads
- Angebote
- Probefahrten
- Abschluesse
- Umsatz NW
- Umsatz GW
- Wareneinsatz NW
- Wareneinsatz GW
- Variable Verkaufskosten

### Werkstatt

- Kapazitaet
- Stunden verkauft
- Arbeitsumsatz
- Produktivlohn
- Werkstatt-Gemeinkosten
- offene Auftraege
- Fehlteile
- Reklamationen

### Teilelager

- Teileumsatz
- Teile-Wareneinsatz
- Teile-Gemeinkosten
- Lagerbestand
- Fehlteile
- Retouren

### Bestand

- Fahrzeugnummer
- Modell
- Standtage
- Preis
- Bilder
- Online
- Verkaufsfertig
- Marktpreisabweichung
- DB / Marge je Fahrzeug, sobald belastbar verfuegbar

## Vorsicht bei der Interpretation

- DB pro Fahrzeug ist nur belastbar, wenn EK, interne Leistungen und variable Kosten sauber erfasst sind.
- Rohertrag und Deckungsbeitrag duerfen nicht mit Liquiditaet verwechselt werden.
- Gebrauchtwagen-DB darf nicht durch uneinheitliche Brutto-/Netto-Logik verfaelscht werden.
- F&I-Ertraege sollten getrennt vom Fahrzeug-DB beobachtet werden.
- Bestands-KPIs sind Stichtagskennzahlen und keine Monatsfortschrittskennzahlen.
