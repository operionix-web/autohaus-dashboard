# Betriebsleiter-App mit integrierter Meeting-Zentrale

Diese zusätzliche Version basiert auf der bestehenden Betriebsleiter-App. Die ursprüngliche App im übergeordneten Ordner bleibt unverändert.

## Neu in dieser Version

- Eigener Menüpunkt **Planung > Meetings**
- Autohaus-Vorlagen für Verkauf, Werkstatt, Serviceannahme, Teilelager, Disposition, Gebrauchtwagen, Wochenführung und Monatsreview
- Teilnehmer und Moderation direkt aus der vorhandenen Teamverwaltung
- Agenda-Checkliste, Notizen und Spracheingabe
- Strukturierte Entscheidungen, Risiken und offene Punkte
- Meeting-Aufgaben werden automatisch in den vorhandenen Maßnahmenplan übernommen
- Statusänderungen im Maßnahmenplan werden zum Meeting zurückgespielt
- Druckbares Meeting-Protokoll
- Google-Sheet-Backup für Meetings und Maßnahmen vorbereitet
- Turnusaufgaben werden gleichmäßig über Monat, Quartal, Halbjahr und Jahr verteilt
- Wochenenden und Feiertage in Baden-Württemberg werden übersprungen
- Bereits erledigte Routinen bleiben bei einer Terminverschiebung erledigt
- Google Tasks und App-To-dos werden nach dem Prinzip „letzte Änderung gewinnt“ zusammengeführt
- To-do-Änderungen nutzen einen eigenen schnellen Sync, ohne den Kalender neu zu schreiben
- Freie Tagesordnungspunkte können ergänzt, verschoben und entfernt werden
- Abschlussprotokoll mit professioneller Druckausgabe und direktem PDF-Download
- Kompakte Teilnehmerauswahl mit gleichmäßiger Verteilung über die verfügbare Breite

## Google Apps Script aktualisieren

Damit Meetings auch im Google Sheet gespeichert werden, muss der Inhalt von `google-apps-script.js` im zugehörigen Apps-Script-Projekt dieser Version eingesetzt und neu bereitgestellt werden. Danach entstehen zusätzlich die Tabellenblätter `Meetings` und `Maßnahmen`.

## Veröffentlichung

Der Inhalt dieses Ordners kann direkt bei Netlify hochgeladen werden. `index.html` liegt bereits auf der obersten Ebene.
