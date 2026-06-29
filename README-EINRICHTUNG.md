# Betriebsleiter-Plan Autohausfiliale

Diese Webapp ist ein installierbares Dashboard für den täglichen, wöchentlichen, monatlichen, quartalsweisen und jährlichen Betriebsleiter-Rhythmus einer Autohausfiliale.

Die Mitarbeiterdaten aus Projekt 4 sind im Bereich `Team` hinterlegt:

- Kaan Coban: Verkauf, 250 Kontakte / 20 Verkäufe
- Ailton Muja: Verkauf, 250 Kontakte / 15 Verkäufe
- Shvan Ahmad: Verkauf, 250 Kontakte / 12 Verkäufe

Weitere Rollen wie Serviceleitung, Werkstattmeister, Teilelager, Disposition, Aufbereitung, Verwaltung und Gebäude / Sicherheit / IT sind als zu pflegende Platzhalter angelegt, weil Projekt 4 dafür keine echten Namen enthält.

Der Bereich `Verkauf` liest die Verkäuferzahlen ausschließlich aus der für diese App maßgeblichen Google-Tabelle über die gespeicherte Apps-Script-URL. Angezeigt werden Kontakte, Leads, Angebote, Probefahrten und Abschlüsse je Mitarbeiter. Die Werte werden automatisch mit den Kontakt- und Verkaufszielen abgeglichen.

Zusätzlich gibt es operative Steuerungsseiten für:

- Maßnahmenplan mit Verantwortlichen, Fristen, Priorität und Status.
- Fahrzeugbestand / Langsteher mit Bestandsalter, formaler Standzeit 0-3, Online-Status, Bildern, Marktpreisabweichung und DB.
- Werkstattsteuerung mit Kapazität, Produktivstunden, Auftragsbestand, Fehlteilen, Fertigstellungen und Reklamationen.
- Automatische Eskalationen und einen Wochenbericht für die Standortleitung.
- Datenpflege für echte Mitarbeiter, Zielwerte und manuelle Ergebnisdaten, inklusive Excel-/CSV-Import, falls ein Import über Google oder DMS nicht verfügbar ist.

Beim Google-Sync werden zusätzlich die periodischen Betriebsleiter-Aufgaben übertragen:

- Wochenaufgaben als Kalendertermine und Google-Tasks
- Monatsaufgaben als Kalendertermine und Google-Tasks
- Quartalsaufgaben als Kalendertermine und Google-Tasks
- Halbjahresaufgaben als Kalendertermine und Google-Tasks
- Jahresaufgaben als Kalendertermine und Google-Tasks

Die Google-Synchronisierung ist bewusst schlank gehalten:

- Der volle Schreib-Sync ist in der App auf etwa alle 10 Minuten begrenzt, damit Google Calendar nicht durch viele schnelle Kalenderaktionen blockiert.
- Klicks innerhalb dieser Zeit lesen nur aktuelle Google-Daten zurück, ohne Kalendertermine neu zu schreiben.

- Tägliche Checklistenpunkte bleiben lokal in der Webapp.
- Google Calendar bekommt nur Haupttermine.
- Google Tasks bekommt nur Board-To-dos und periodische Hauptaufgaben.
- Es werden keine verschachtelten Unteraufgaben mehr erzeugt.
- Routinen werden mit festen Kennungen synchronisiert: Wenn eine Aufgabe offen bleibt und am nächsten Arbeitstag wieder fällig wird, wird der bestehende Google-Eintrag verschoben/aktualisiert statt doppelt neu angelegt.
- KPI-, Bestands-, Werkstatt- und Maßnahmenwerte können aus Google Sheets gelesen werden.
- In `System -> Datenpflege -> Import` können CSV-, XLS- und XLSX-Dateien für KPI-Werte, Verkaufsergebnisse, Mitarbeiter, Ziele, Fahrzeugbestand und Werkstatt importiert werden. CSV funktioniert direkt im Browser; XLS/XLSX nutzt die eingebundene Excel-Bibliothek.
- Für spätere echte Tages-, Wochen- und Monatsroutinen liegt unter `import-vorlagen/routinen-vorlage.csv` eine Struktur bereit. Gesprochene Notizen können später in diese Struktur übertragen werden.

Folgende Tabellenblätter werden vom Apps Script für die App angelegt und gelesen:

- `KPIs` mit Spalten `key`, `value`, `area`, `metric`, `kind`, `updatedAt`
- `Mitarbeiter` mit Spalten `id`, `name`, `area`, `role`, `monthlyContactTarget`, `monthlySalesTarget`, `firstName`, `lastName`, `function`
- `Tagesmeldungen` mit Spalten `Eingang`, `Datum`, `Verkäufer`, `Kontakte`, `Leads`, `Angebote`, `Probefahrten`, `Verkäufe`, `Quelle`, `Meldungs-ID`
- `Verkäuferziele` mit Spalten `Monat`, `Verkäufer`, `Kontaktziel`, `Verkaufsziel`
- `Fahrzeugbestand` mit Spalten `stock`, `vehicle`, `days`, `price`, `marketDelta`, `photos`, `online`, `margin`, `status`, `standzeit0`, `standzeit1`, `standzeit2`, `standzeit3`
- `Werkstatt` mit Spalten `area`, `capacity`, `soldHours`, `openOrders`, `missingParts`, `completions`, `complaints`
- `Maßnahmen` mit Spalten `id`, `title`, `owner`, `due`, `priority`, `status`

Im Bereich `System -> Team` können Mitarbeiter mit Abteilung, Nachname, Vorname, Funktion und optionalen Verkaufszielen bequem gepflegt werden. Verkäuferziele werden beim Speichern zusätzlich in die Zieltabelle übernommen. Im Bereich `System -> KPI-Eingabe` können Ist-Werte und Monatsziele je Autohausbereich eingegeben werden: Verkauf, Serviceannahme, Werkstatt, Teilelager, Disposition, Fahrzeugaufbereitung, Verwaltung, Gebäude / Sicherheit / IT und Gesamtbetrieb. Im Bereich `System -> Datenpflege` können Verkäuferziele, KPI-Istwerte, KPI-Monatsziele, Ergebnisdaten, Fahrzeugbestand und Werkstattdaten per CSV/Excel importiert oder manuell erfasst werden. Alle Zielvorgaben und Istwerte werden in die Google-Tabelle geschrieben und nach dem Speichern wieder aus der Tabelle zurückgelesen. Damit kann die Tabelle im Worst Case als Backup des Systems dienen. Ohne gespeicherte Apps-Script-URL bleiben die Daten lokal im Browser.

Für den Monatsbericht können Monatsziele im Blatt `KPIs` gepflegt werden. Dafür als `key` zum Beispiel `Ziel Umsatz`, `Ziel Ertrag`, `Ziel Leads`, `Ziel Abschlüsse`, `Ziel Produktivstunden`, `Ziel Fehlteile` oder `Ziel Krankenquote` eintragen und in `value` den Zielwert hinterlegen. Der Bericht berechnet daraus den zeitanteiligen Sollwert bis zum aktuellen Datum und die Zielerreichung zum Monatsziel.

Die KPI-Formeln sind mit den fachlich relevanten Dokumenten im Ordner `Dokumente` und externen Autohaus-Benchmark-Quellen abgeglichen. Die Kurzgrundlage steht in `KPI-METHODIK.md`; das ausführliche Nachschlagewerk steht in `AUTOHAUS-KPI-HANDBUCH.md`. Wichtige Anpassungen: Verkauf-Conversion = Abschlüsse / Leads, Deckungsbeitrag je Bereich, Absorption, Net-to-Gross, eigener KPI-Bereich `Fahrzeugbestand` mit Bestandsalter-Klassen, formaler Prozess-Standzeit 0-3, Preisquote, Onlinequote, Bildquote 15+, Fahrzeuge ohne Preis/Bilder/Online-Status, Anteil verkaufsfertig und Anteil >90 Tage, Monats-Soll zeitanteilig nach Arbeitstagen ohne Wochenenden und Feiertage Baden-Württemberg.

Der Bereich `Board` ist ein eigenes To-do-Board mit den Spalten `Offen`, `In Arbeit` und `Erledigt`. Neue Aufgaben werden lokal erstellt und beim Google-Sync als flache Google Tasks angelegt oder aktualisiert. Wird ein Board-To-do in Google Tasks erledigt, landet es beim nächsten Sync in der Spalte `Erledigt`.

Samstage, Sonntage und gesetzliche Feiertage in Baden-Württemberg werden beim Sync berücksichtigt:

- Tägliche Standardaufgaben werden an diesen Tagen nicht in Calendar oder Tasks angelegt.
- Bereits von der App angelegte tägliche Aufgaben für solche Tage werden beim Sync entfernt.
- Wöchentliche, monatliche, quartalsweise, halbjährliche und jährliche Aufgaben werden automatisch auf den nächsten Arbeitstag verschoben.
- Samstags gibt es keine Wochenroutine mehr; die früheren Samstagsthemen sind auf Montag, Dienstag und Freitag verteilt.
- Alte doppelte Kalenderkopien aus früheren Sync-Versionen werden beim nächsten Sync automatisch aufgeräumt.

## Start

Öffne `index.html` im Browser oder veröffentliche den Ordner statisch, zum Beispiel über Netlify.

## Google Kalender und To-dos in beide Richtungen synchronisieren

Zielkonto: `operionix@gmail.com`

1. Melde dich mit `operionix@gmail.com` bei Google an.
2. Öffne Google Tabellen und erstelle eine neue Tabelle, oder nutze direkt ein eigenständiges Apps-Script-Projekt.
3. Bei einer Tabelle: `Erweiterungen -> Apps Script` öffnen. Bei einem eigenständigen Apps Script erstellt `authorizeOnce` automatisch eine Datei `Betriebsleiter Dashboard Daten` in Google Drive.
4. Ersetze den vorhandenen Inhalt durch den Inhalt aus `google-apps-script.js`.
5. Aktiviere für To-dos im Apps-Script-Editor den Dienst `Tasks API`.
6. Wähle einmal die Funktion `authorizeOnce` aus und führe sie aus. Dabei werden die Berechtigungen bestätigt und die optionalen Tabellenblätter angelegt.
7. Stelle das Script als Web-App bereit:
   - Ausführen als: `Ich selbst`
   - Zugriff: `Jeder mit dem Link`
8. Kopiere die Web-App-URL in der App unter `Google`.
9. Klicke in der Webapp auf `Google synchronisieren`.

Was synchronisiert wird:

- Tagesblöcke aus der Webapp werden als Termine in Google Calendar angelegt oder aktualisiert.
- Periodische Aufgaben werden als einfache Google Tasks angelegt oder aktualisiert.
- Board-Aufgaben werden als einfache Google Tasks angelegt oder aktualisiert.
- In Google Tasks erledigte Board-Aufgaben werden beim nächsten Sync in der Webapp als erledigt angezeigt.
- Quick-Einträge aus der rechten Google-Spalte können direkt als Kalendertermin oder To-do angelegt werden.

Kalenderzugriff läuft über dein Google-Konto, weil das Apps Script mit deinen Berechtigungen ausgeführt wird. Die App speichert nur die Script-URL und lokale Tageshaken im Browser.
