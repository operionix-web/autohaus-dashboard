let todayKey = formatDateKey(new Date());
const storageKey = 'betriebsleiter-plan-autohaus-v1';
const googleWriteSyncCooldownMs = 10 * 60 * 1000;
const dailyQuoteCachePrefix = 'autohaus-management-quote-';
const managementQuoteUrl = 'https://quotes.rest/qod.json?category=management&language=en';

const fallbackDailyQuotes = [
  { quote: 'Fuehrung beginnt dort, wo Klarheit den naechsten Schritt moeglich macht.', author: 'Operative Steuerung' },
  { quote: 'Ein guter Betrieb braucht keine Hektik, sondern sichtbare Prioritaeten.', author: 'Operative Steuerung' },
  { quote: 'Was taeglich sauber gesehen wird, muss spaeter nicht teuer repariert werden.', author: 'Operative Steuerung' },
  { quote: 'Zahlen sind kein Selbstzweck. Sie zeigen, wo Fuehrung heute gebraucht wird.', author: 'Operative Steuerung' },
  { quote: 'Konsequenz ist im Tagesgeschaeft oft wertvoller als die grosse Idee.', author: 'Operative Steuerung' },
  { quote: 'Der beste Plan ist der, den das Team versteht und wirklich nutzen kann.', author: 'Operative Steuerung' },
  { quote: 'Gute Standortleitung macht Probleme frueh sichtbar und Entscheidungen leicht.', author: 'Operative Steuerung' },
];

const appThemes = [
  { id: 'orange', label: 'Orange Klassik', accent: '#f47a20', soft: '#fff1e7', bg: '#f5f6f7', ink: '#202428' },
  { id: 'graphite', label: 'Graphit', accent: '#505a64', soft: '#eef1f3', bg: '#f4f5f6', ink: '#1f2428' },
  { id: 'grayscale', label: 'Graustufen', accent: '#3f454b', soft: '#eceff1', bg: '#f6f6f6', ink: '#1f2327' },
  { id: 'nordic', label: 'Nordblau', accent: '#2f6f9f', soft: '#e7f1f8', bg: '#f4f7f9', ink: '#1f2933' },
  { id: 'petrol', label: 'Petrol', accent: '#13817b', soft: '#e3f3f1', bg: '#f4f7f6', ink: '#1f2a2b' },
  { id: 'sage', label: 'Salbei', accent: '#6c8f62', soft: '#edf4ea', bg: '#f6f7f4', ink: '#242a22' },
  { id: 'ruby', label: 'Rubin', accent: '#b84a55', soft: '#faeaec', bg: '#f7f5f6', ink: '#2a2022' },
  { id: 'violet', label: 'Violett', accent: '#7561a8', soft: '#f0edf8', bg: '#f6f5f8', ink: '#25222d' },
  { id: 'gold', label: 'Gold', accent: '#b87910', soft: '#fff4dc', bg: '#f7f6f2', ink: '#29251d' },
];

const navIcons = {
  start: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 11.5 12 5l8 6.5"/><path d="M6.5 10.5V19h11v-8.5"/><path d="M10 19v-5h4v5"/></svg>',
  planning: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 3v3M17 3v3M5 8h14"/><rect x="5" y="5" width="14" height="16" rx="3"/><path d="M8 12h3M8 16h6"/></svg>',
  control: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 19V5"/><path d="M5 19h14"/><path d="M9 16v-5M13 16V8M17 16v-8"/></svg>',
  monitor: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 14a7 7 0 0 1 14 0"/><path d="M12 14l4-4"/><path d="M4 19h16"/><path d="M7 17h10"/></svg>',
  system: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="M19 12a7 7 0 0 0-.1-1.2l2-1.5-2-3.4-2.4 1a7.5 7.5 0 0 0-2-1.2L14.2 3h-4.4l-.4 2.7a7.5 7.5 0 0 0-2 1.2l-2.4-1-2 3.4 2 1.5A7 7 0 0 0 5 12c0 .4 0 .8.1 1.2l-2 1.5 2 3.4 2.4-1a7.5 7.5 0 0 0 2 1.2l.4 2.7h4.4l.4-2.7a7.5 7.5 0 0 0 2-1.2l2.4 1 2-3.4-2-1.5c.1-.4.1-.8.1-1.2Z"/></svg>',
};

const navGroups = [
  {
    label: 'Start',
    icon: navIcons.start,
    items: [
      ['home-view', 'Startseite'],
      ['today-view', 'Heute'],
      ['board-view', 'To-do-Board'],
      ['actions-view', 'Maßnahmen'],
    ],
  },
  {
    label: 'Planung',
    icon: navIcons.planning,
    items: [
      ['meetings-view', 'Meetings'],
      ['meeting-archive-view', 'Meetingarchiv'],
      ['week-view', 'Woche'],
      ['month-view', 'Monat'],
      ['quarter-view', 'Quartal'],
      ['halfyear-view', 'Halbjahr'],
      ['year-view', 'Jahr'],
    ],
  },
  {
    label: 'Steuerung',
    icon: navIcons.control,
    items: [
      ['kpi-view', 'KPIs'],
      ['monitor-view', 'Monitor', navIcons.monitor],
      ['sales-view', 'Verkauf'],
      ['inventory-view', 'Bestand'],
      ['workshop-view', 'Werkstatt'],
      ['report-view', 'Bericht'],
      ['print-view', 'Druck'],
    ],
  },
  {
    label: 'System',
    icon: navIcons.system,
    items: [
      ['team-view', 'Team'],
      ['kpi-input-view', 'KPI-Eingabe'],
      ['data-view', 'Datenpflege'],
      ['export-view', 'Export'],
      ['google-view', 'Google'],
    ],
  },
];

const streamDeckRoutes = {
  start: { view: 'home-view', label: 'Startseite' },
  heute: { view: 'today-view', label: 'Heute' },
  aufgaben: { view: 'board-view', label: 'To-do-Board' },
  massnahmen: { view: 'actions-view', label: 'Maßnahmen' },
  meetings: { view: 'meetings-view', label: 'Meetings' },
  meetingarchiv: { view: 'meeting-archive-view', label: 'Meetingarchiv' },
  woche: { view: 'week-view', label: 'Woche' },
  monat: { view: 'month-view', label: 'Monat' },
  kpis: { view: 'kpi-view', label: 'KPIs' },
  monitor: { view: 'monitor-view', label: 'Monitor' },
  verkauf: { view: 'sales-view', label: 'Verkauf' },
  bestand: { view: 'inventory-view', label: 'Bestand' },
  werkstatt: { view: 'workshop-view', label: 'Werkstatt' },
  bericht: { view: 'report-view', label: 'Bericht' },
  druck: { view: 'print-view', label: 'Druck' },
  team: { view: 'team-view', label: 'Team' },
  kpi_eingabe: { view: 'kpi-input-view', label: 'KPI-Eingabe' },
  datenpflege: { view: 'data-view', label: 'Datenpflege' },
  export: { view: 'export-view', label: 'Export' },
  google: { view: 'google-view', label: 'Google' },
  neuer_termin: { view: 'today-view', label: 'Heute', focus: '#quick-title' },
  neue_aufgabe: { view: 'board-view', label: 'To-do-Board', focus: '#board-title' },
  neue_massnahme: { view: 'actions-view', label: 'Maßnahmen', focus: '#action-title' },
  neues_meeting: { view: 'meetings-view', label: 'Meetings', focus: '#meeting-title' },
  tagesabschluss: { view: 'today-view', label: 'Heute', block: 'closing' },
  sync: { view: 'today-view', label: 'Heute', action: 'sync' },
};

const employees = [
  { id: 'kaan-coban', firstName: 'Kaan', lastName: 'Coban', name: 'Kaan Coban', area: 'Verkauf', role: 'Verkäufer', monthlyContactTarget: 250, monthlySalesTarget: 20 },
  { id: 'ailton-muja', firstName: 'Ailton', lastName: 'Muja', name: 'Ailton Muja', area: 'Verkauf', role: 'Verkäufer', monthlyContactTarget: 250, monthlySalesTarget: 15 },
  { id: 'shvan-ahmad', firstName: 'Shvan', lastName: 'Ahmad', name: 'Shvan Ahmad', area: 'Verkauf', role: 'Verkäufer', monthlyContactTarget: 250, monthlySalesTarget: 12 },
  { id: 'serviceleitung', name: 'Serviceleitung', area: 'Serviceannahme', role: 'zu pflegen' },
  { id: 'werkstattmeister', name: 'Werkstattmeister', area: 'Werkstatt', role: 'zu pflegen' },
  { id: 'teilelager', name: 'Teilelager', area: 'Teilelager', role: 'zu pflegen' },
  { id: 'disposition', name: 'Disposition', area: 'Disposition', role: 'zu pflegen' },
  { id: 'aufbereitung', name: 'Aufbereitung', area: 'Fahrzeugaufbereitung', role: 'zu pflegen' },
  { id: 'verwaltung', name: 'Verwaltung', area: 'Verwaltung', role: 'zu pflegen' },
  { id: 'facility-it', name: 'Gebäude / Sicherheit / IT', area: 'Facility / IT', role: 'zu pflegen' },
];

const initialSalesTeam = employees.filter(employee => employee.area === 'Verkauf');

const meetingTemplates = [
  {
    id: 'frei',
    title: 'Freies Meeting',
    area: 'Standortleitung',
    start: '09:00',
    end: '09:30',
    agenda: [],
  },
  {
    id: 'vertrieb-tag',
    title: 'Tagesmeeting Verkauf',
    area: 'Verkauf',
    start: '08:30',
    end: '08:45',
    agenda: ['Tagesziele und Fokusmodelle', 'Leads und Wiedervorlagen', 'Probefahrten und Auslieferungen', 'Finanzierungen und Preisfreigaben', 'Langsteher und Online-Qualität'],
  },
  {
    id: 'werkstatt-kurz',
    title: 'Service/Werkstatt-Kurzmeeting',
    area: 'Werkstatt',
    start: '07:45',
    end: '08:05',
    agenda: ['Auslastung heute', 'Fehlteile und Rückstände', 'Expressfälle und Reklamationen', 'Hebebühnen- und Diagnoseengpässe', 'Fertigstellungen und Krankmeldungen'],
  },
  {
    id: 'serviceannahme',
    title: 'Service- und Annahmerunde',
    area: 'Serviceannahme',
    start: '08:05',
    end: '08:25',
    agenda: ['Terminlage und Kundenfreigaben', 'Ersatzmobilität', 'Rückrufe und Reklamationen', 'Fertigmeldungen', 'Eskalationen mit Kundenkontakt'],
  },
  {
    id: 'teilelager',
    title: 'Teilelager-Besprechung',
    area: 'Teilelager',
    start: '09:00',
    end: '09:20',
    agenda: ['Fehlteile', 'Teileeingänge', 'Rückstände', 'Retouren und Altteile', 'Verfügbarkeit und Bestände'],
  },
  {
    id: 'dispo',
    title: 'Disposition und Auslieferung',
    area: 'Disposition',
    start: '09:30',
    end: '10:00',
    agenda: ['Zulassungen und Fahrzeugbriefe', 'Rechnungen und Liefertermine', 'Auslieferungen', 'Fehlende Dokumente', 'Hersteller- und Logistikthemen'],
  },
  {
    id: 'gw-langsteher',
    title: 'Gebrauchtwagen- und Langsteherrunde',
    area: 'Verkauf',
    start: '10:00',
    end: '10:30',
    agenda: ['Kritische Standzeiten', 'Marktpreise und Preismaßnahmen', 'Bilder und Online-Status', 'Aufbereitungsstatus', 'Konkrete Verkaufsmaßnahmen'],
  },
  {
    id: 'fuehrung-woche',
    title: 'Wochen-Führungsmeeting',
    area: 'Standortleitung',
    start: '09:00',
    end: '10:00',
    agenda: ['Wochenziele', 'Verkauf und Bestand', 'Werkstatt und Service', 'Teilelager und Disposition', 'Personal, Risiken und Maßnahmenplan'],
  },
  {
    id: 'monatsreview',
    title: 'Monatsreview Standortleitung',
    area: 'Standortleitung',
    start: '14:00',
    end: '15:30',
    agenda: ['Zielerreichung und Deckungsbeitrag', 'Budget und Liquidität', 'Herstellerziele', 'Personal und Schulungen', 'Maßnahmen für den Folgemonat'],
  },
];

const boardColumns = [
  ['open', 'Offen', 'Noch nicht begonnen'],
  ['doing', 'In Arbeit', 'Gerade dran'],
  ['done', 'Erledigt', 'Abgeschlossen'],
];

const dailyBlocks = [
  {
    id: 'early',
    time: '07:30 - 07:45',
    title: 'Betriebsrundgang: Frühe Lage',
    meta: 'Serviceannahme, Teile, Hof, Werkstatt, Sicherheit',
    checks: ['Hofzustand', 'Sauberkeit Showroom', 'Fahrzeugpräsentation außen', 'Licht / Screens / CI', 'Werkstattbelegung', 'Aufbereitung', 'Unfallfahrzeuge', 'Schlüsselschrank', 'Kundenparkplätze', 'Probefahrtfahrzeuge', 'Ladezustand E-Fahrzeuge', 'Sicherheitsmängel', 'Schäden am Gebäude', 'Müll / Container', 'Winterdienst / Außenanlage', 'Fahrzeuge falsch gestellt?', 'Preiszettel sauber?', 'Langsteher sichtbar?', 'Übergaben vorbereitet?', 'Eskalationen vom Vortag?'],
  },
  {
    id: 'workshop',
    time: '07:45 - 08:05',
    title: 'Service/Werkstatt-Kurzmeeting',
    meta: 'Serviceannahme, Werkstattmeister, Teilevertrieb',
    checks: ['Auslastung heute', 'Fehlteile', 'Expressfälle', 'Reklamationen', 'Hebebühnenstatus', 'Diagnoseengpässe', 'Karosserie/Lack', 'Standzeiten', 'Garantiearbeiten', 'Krankmeldungen', 'Fahrzeugfertigstellungen'],
  },
  {
    id: 'sales',
    time: '08:30 - 08:45',
    title: 'Verkäufermeeting',
    meta: initialSalesTeam.map(person => person.name).join(', '),
    checks: ['Tagesziele', 'Leads gestern', 'Abschlüsse gestern', 'Termine heute', 'mobile.de / AutoScout', 'Fahrzeuge online <48h?', 'Standtage kritisch', 'Bestand', 'Deckungsbeiträge', 'Finanzierungen', 'Wiedervorlagen'],
  },
  {
    id: 'numbers',
    time: '08:45 - 09:30',
    title: 'Zahlen & Steuerung',
    meta: 'DMS, Umsatz, DB, offene Punkte',
    checks: ['Tagesreport DMS', 'Umsatz', 'Deckungsbeiträge', 'Werkstattumsatz', 'Teileumsatz', 'Neuwagen/Gebrauchtwagen', 'Finanzierung', 'Garantiequote', 'Reklamationen', 'Offene Rechnungen', 'Außenstände', 'Fahrzeugeinkäufe', 'Offene Werkstattaufträge', 'Prozess-Standzeit 1 / 2', 'Fahrzeuge ohne Bilder', 'Fahrzeuge ohne Preis', 'Fahrzeuge ohne Internetstatus'],
  },
  {
    id: 'operations',
    time: '09:30 - 12:00',
    title: 'Operative Führung',
    meta: 'Kunden, Eskalationen, Freigaben, Personal',
    checks: ['Kundengespräche', 'Eskalationen', 'Verkäufer-Coaching', 'Werkstattentscheidungen', 'Preisfreigaben', 'Reklamationen', 'Fahrzeugfreigaben', 'Leasingrückläufer', 'Großkunden', 'Versicherungen', 'Herstellerkommunikation', 'Personalthemen', 'Spontane Hofkontrollen', 'Rechnungsprüfung'],
  },
  {
    id: 'midday',
    time: '12:00 - 13:00',
    title: 'Mittagsfenster & Betriebskontrolle',
    meta: 'Pause, Fortschritt, Teile, Auslieferungen, Frequenz',
    checks: ['Werkstattfortschritt', 'Fahrzeugfertigstellung', 'Teileeingänge', 'Auslieferungen', 'Sauberkeit', 'Kundenfrequenz'],
  },
  {
    id: 'strategy',
    time: '13:00 - 14:30',
    title: 'Strategische Themen',
    meta: 'Marketing, Prozesse, KPI, Digitalisierung',
    checks: ['Marketing', 'Recruiting', 'Prozesse', 'KPI-Auswertung', 'Herstellerprogramme', 'Digitalisierung', 'Gebrauchtwagensteuerung', 'Preisstrategie', 'Gewerbekunden', 'Social Media', 'Controlling', 'Audits'],
  },
  {
    id: 'coaching',
    time: '14:30 - 15:30',
    title: 'Einzelgespräche / Coaching',
    meta: 'Verkauf, Service, Lager, Aufbereitung, Dispo',
    checks: ['Verkäufer', 'Serviceberater', 'Lagerleiter', 'Aufbereitung', 'Disposition', 'Leistung', 'Ziele', 'Fehler', 'Verbesserung', 'Prozesse', 'Training'],
  },
  {
    id: 'closing',
    time: '17:00 - 17:30',
    title: 'Tagesabschluss Steuerung',
    meta: 'Offene Fälle, Morgenplanung, Personal, Termine',
    checks: ['Offene Kundenfälle', 'Fahrzeugstatus', 'Morgenplanung', 'Werkstattauslastung morgen', 'Fehlteile morgen', 'Personalplanung', 'Fahrzeugbewegungen', 'Terminlage'],
  },
  {
    id: 'lockup',
    time: '17:30 - 18:00',
    title: 'Abschlussrundgang',
    meta: 'Sicherheit, Ordnung, IT, Alarm, Gefahrstoffe',
    checks: ['Sicherheit', 'Abschließen', 'Fahrzeuge', 'Werkstattordnung', 'Ladegeräte', 'IT', 'Alarmanlage', 'Licht', 'Tore', 'Gefahrstoffe'],
  },
];

const plans = {
  week: [
    ['Montag', 'Wochenstart', ['Wochenziele', 'Umsatzplanung', 'Werkstattkapazität', 'Fahrzeugbewegungen', 'Verkäuferziele', 'Kundenfrequenz']],
    ['Dienstag', 'Bestand & Internet', ['Langsteheranalyse', 'Preisstrategie', 'Internetauftritt', 'Fotoqualität', 'mobile.de Ranking', 'Fahrzeugpräsentation']],
    ['Mittwoch', 'Menschen & Prozesse', ['Personalgespräche', 'Coaching', 'Schulungen', 'Prozessprüfung']],
    ['Donnerstag', 'Werkstattreview', ['Werkstattanalyse', 'Garantie', 'Produktivität', 'Reklamationen']],
    ['Freitag', 'Wochenabschluss', ['KPI-Review', 'Forecast', 'Herstellerberichte', 'Liquidität', 'Probefahrten']],
  ],
  month: [
    ['Monatsanfang', 'Zielsystem', ['Zielvereinbarungen', 'Budgetabgleich', 'Herstellerziele', 'Bonusprogramme', 'Marketingplanung']],
    ['Verkauf', 'Monatlich prüfen', ['Absatz', 'Deckungsbeitrag', 'Marge', 'Standtage', 'Preisniveau', 'Conversion']],
    ['Werkstatt', 'Monatlich prüfen', ['Produktivität', 'Auslastung', 'Garantiequote', 'Stundenverrechnungssatz', 'Reklamationsquote']],
    ['Teilelager', 'Monatlich prüfen', ['Lagerumschlag', 'Schwund', 'Altteile', 'Verfügbarkeit', 'Retourenquote']],
    ['Gebäude / IT', 'Sichtkontrolle', ['Reinigung', 'Schäden', 'Beleuchtung', 'Brandschutz Sichtkontrolle', 'Datensicherung', 'Benutzerrechte', 'Updates', 'Drucker / Scanner']],
    ['Recht / Compliance', 'Pflichten', ['UVV', 'Datenschutz', 'Gefahrstoffe', 'Führerscheinkontrolle', 'DSGVO-Themen']],
  ],
  quarter: [
    ['Strategische Analyse', 'Quartal', ['Marktanalyse', 'Wettbewerberpreise', 'Herstellerperformance', 'Personalentwicklung', 'Zielerreichung', 'Kostenanalyse']],
    ['Technische Prüfungen', 'Quartal', ['Hebebühnen', 'Kompressoren', 'Tore', 'Feuerlöscher', 'Klimaanlagen', 'Ladeinfrastruktur', 'Alarmanlagen']],
    ['Mitarbeiter', 'Quartal', ['Quartalsgespräche', 'Zielkontrolle', 'Schulungsbedarf', 'Recruiting']],
    ['Marketing', 'Quartal', ['Kampagnenplanung', 'Gewerbekundenaktionen', 'Events', 'Social Media Strategie']],
  ],
  halfyear: [
    ['Große Betriebsanalyse', 'Halbjahr', ['Gesamtrentabilität', 'Standortperformance', 'Prozessschwachstellen', 'Herstellervergleich', 'Marktposition', 'Personalstruktur']],
    ['Gebäude & Investitionen', 'Halbjahr', ['Renovierungen', 'Möbel', 'Außenwirkung', 'Werkstattausrüstung', 'Digital Signage', 'Parkplatzmarkierungen', 'Bodenbeschichtung']],
    ['IT / Digitalisierung', 'Halbjahr', ['Softwarelandschaft', 'Schnittstellen', 'DMS-Prozesse', 'Automatisierungen', 'Cybersecurity']],
  ],
  year: [
    ['Jahresanfang', 'Strategietage', ['Absatzplanung', 'Ertragsplanung', 'Personalplanung', 'Investitionen', 'Marketingbudget', 'Gebrauchtwagenstrategie', 'Werkstattstrategie']],
    ['Gebäude / Sicherheit', 'Pflichtprüfungen', ['Brandschutz', 'Elektroprüfung', 'UVV', 'Gefahrstofflager', 'Alarmanlage', 'Heizungswartung', 'Klimawartung', 'Dachprüfung', 'Winterdienstverträge']],
    ['Werkstatt', 'Pflichtprüfungen', ['Hebebühnenprüfung', 'Werkzeugkalibrierung', 'AU/SP Geräte', 'Diagnosegeräte', 'Kompressoren']],
    ['IT', 'Jahrescheck', ['Lizenzprüfung', 'Backupkonzept', 'Passwortkonzept', 'Datenschutzprüfung', 'Zugriffsrechte']],
    ['Personal', 'Jahresplanung', ['Mitarbeitergespräche', 'Gehaltsgespräche', 'Schulungsplanung', 'Urlaubsplanung', 'Ausbildungsplanung']],
    ['Hersteller', 'Standards', ['Zielvereinbarungen', 'Standards', 'CI-Prüfungen', 'Auditvorbereitung']],
  ],
};

const kpiGroups = [
  ['Verkauf', ['Kontakte', 'Leads', 'Angebote', 'Probefahrten', 'Abschlüsse', 'Conversion', 'Lead->Angebot', 'Probefahrtquote', 'Umsatz NW', 'Umsatz GW', 'Wareneinsatz NW', 'Wareneinsatz GW', 'Variable Verkaufskosten', 'DB I Verkauf', 'DB I Verkauf %', 'DB pro Fahrzeug']],
  ['Serviceannahme', ['Termine', 'Terminquote', 'offene Kundenfälle', 'CSI/Kundenzufriedenheit', 'Reklamationen']],
  ['Werkstatt', ['Auslastung', 'Produktivität', 'Produktivstunden', 'Stunden verkauft', 'Verrechnungssatz', 'Auftragsbestand', 'Durchlaufzeit', 'Hebebühnenbelegung', 'Fertigstellungen', 'Garantiequote', 'Reklamationen', 'Arbeitsumsatz', 'Produktivlohn', 'Werkstatt-Gemeinkosten', 'DB Werkstatt', 'DB Werkstatt %', 'Lohnproduktivität']],
  ['Teilelager', ['Lagerumschlag', 'Fehlteile', 'Schwund', 'Verfügbarkeit', 'Retourenquote', 'Teileumsatz', 'Teile-Wareneinsatz', 'Teile-Gemeinkosten', 'DB Teile', 'DB Teile %']],
  ['Disposition', ['Fahrzeugbewegungen', 'Auslieferungen', 'Zulassungen offen', 'Papiere offen', 'Leasingrückläufer']],
  ['Fahrzeugaufbereitung', ['Fahrzeuge bereit', 'Fertigstellungen', 'Rückstände', 'Durchlaufzeit', 'Reklamationen', 'Aufbereitungsumsatz intern', 'Aufbereitungskosten', 'DB Aufbereitung']],
  ['Fahrzeugbestand', ['Bestand gesamt', 'Ø Bestandsalter', 'Median Bestandsalter', 'Bestandsalter 0-30 Tage', 'Bestandsalter 31-60 Tage', 'Bestandsalter 61-90 Tage', 'Bestandsalter 91-180 Tage', 'Bestandsalter >180 Tage', 'Standzeit 0', 'Standzeit 1', 'Standzeit 2', 'Standzeit 3', 'Anteil >90 Tage', 'Fahrzeuge mit Bildern', 'Fahrzeuge ohne Bilder', 'Bildquote 15+', 'Fahrzeuge mit Preis', 'Fahrzeuge ohne Preis', 'Preisquote', 'Fahrzeuge online', 'Fahrzeuge nicht online', 'Onlinequote', 'Verkaufsfertig', 'Nicht verkaufsfertig', 'Anteil verkaufsfertig', 'Ø Marktpreisabweichung']],
  ['F&I', ['Finanzierungsquote', 'Versicherungsquote', 'F&I-Ertrag', 'F&I-Ertrag pro Fahrzeug', 'Stornoquote']],
  ['Verwaltung', ['Offene Rechnungen', 'Außenstände', 'Liquidität', 'Krankenquote', 'Compliance-Punkte offen', 'Fixkosten gesamt', 'Overheadquote', 'Net-to-Gross']],
  ['Gebäude / Sicherheit / IT', ['Sicherheitsmängel', 'IT-Störungen', 'offene Wartungen', 'Backupstatus', 'UVV-Prüfungen offen']],
  ['Gesamtbetrieb', ['Umsatz', 'Ertrag', 'Gesamtdeckungsbeitrag', 'DB-Quote gesamt', 'Deckungsbeitrag II', 'Absorption', 'Fixkosten gesamt', 'Gesamtbestand', 'Ø Bestandsalter', 'Median Bestandsalter', 'Anteil >90 Tage', 'Anteil verkaufsfertig', 'Preisquote', 'Bildquote 15+', 'Google-Bewertungen']],
];

const seedInventory = [
  { stock: 'GW-1842', vehicle: 'VW Golf Variant 1.5 TSI', days: 86, price: 21980, marketDelta: -3, photos: 22, online: true, margin: 2450, status: 'kritisch' },
  { stock: 'GW-1917', vehicle: 'Audi A4 Avant 35 TDI', days: 64, price: 28750, marketDelta: 2, photos: 18, online: true, margin: 3180, status: 'prüfen' },
  { stock: 'NW-0441', vehicle: 'Cupra Formentor e-Hybrid', days: 21, price: 42890, marketDelta: 0, photos: 14, online: true, margin: 4100, status: 'ok' },
  { stock: 'GW-2012', vehicle: 'Skoda Octavia Combi', days: 49, price: 23940, marketDelta: 5, photos: 0, online: false, margin: 2100, status: 'kritisch' },
];

const seedWorkshop = [
  { area: 'Mechanik', capacity: 72, soldHours: 63, openOrders: 18, missingParts: 3, completions: 11, complaints: 1 },
  { area: 'Diagnose', capacity: 18, soldHours: 19, openOrders: 7, missingParts: 1, completions: 4, complaints: 0 },
  { area: 'Karosserie/Lack', capacity: 24, soldHours: 17, openOrders: 9, missingParts: 2, completions: 3, complaints: 1 },
  { area: 'Aufbereitung', capacity: 30, soldHours: 24, openOrders: 12, missingParts: 0, completions: 8, complaints: 0 },
];

const seedKpis = [
  { key: 'Umsatz', value: '68.400 €' },
  { key: 'Ertrag', value: '11.900 €' },
  { key: 'Liquidität', value: 'stabil' },
  { key: 'CSI/Kundenzufriedenheit', value: '91%' },
  { key: 'Google-Bewertungen', value: '4,6' },
  { key: 'Krankenquote', value: '3,2%' },
];

const state = loadState();
let activeBlockId = getCurrentBlock()?.id || dailyBlocks[0].id;
let activeKpiInputArea = kpiGroups[0][0];
let deferredPrompt;
let boardSyncTimer;
let meetingSyncTimer;
const meetingSyncQueue = new Map();
let meetingSyncRunning = false;
let googleSyncRunning = false;
let importDraft = { type: '', rows: [], rawRows: [], fileName: '' };

const els = {
  nav: document.querySelector('#main-nav'),
  title: document.querySelector('#view-title'),
  date: document.querySelector('#date-label'),
  homeQuoteText: document.querySelector('#home-quote-text'),
  homeQuoteAuthor: document.querySelector('#home-quote-author'),
  homeQuoteSource: document.querySelector('#home-quote-source'),
  dailyKpis: document.querySelector('#daily-kpis'),
  timeline: document.querySelector('#timeline'),
  activeTitle: document.querySelector('#active-block-title'),
  activeTime: document.querySelector('#active-block-time'),
  checklist: document.querySelector('#active-checklist'),
  progress: document.querySelector('#progress-label'),
  note: document.querySelector('#daily-note'),
  googleStatus: document.querySelector('#google-status'),
  calendarList: document.querySelector('#calendar-list'),
  taskList: document.querySelector('#task-list'),
  quickTitle: document.querySelector('#quick-title'),
  quickStart: document.querySelector('#quick-start'),
  quickEnd: document.querySelector('#quick-end'),
  quickSaveFeedback: document.querySelector('#quick-save-feedback'),
  googleAccount: document.querySelector('#google-account'),
  scriptUrl: document.querySelector('#script-url'),
  tasklistId: document.querySelector('#tasklist-id'),
  themePicker: document.querySelector('#theme-picker'),
  syncSalesButton: document.querySelector('#sync-sales-button'),
  salesSourceLabel: document.querySelector('#sales-source-label'),
  monitorSummary: document.querySelector('#monitor-summary'),
  monitorBoard: document.querySelector('#monitor-board'),
  salesKpis: document.querySelector('#sales-kpis'),
  salesMonthLabel: document.querySelector('#sales-month-label'),
  salesGoalBoard: document.querySelector('#sales-goal-board'),
  salesTable: document.querySelector('#sales-table'),
  actionForm: document.querySelector('#action-form'),
  actionTitle: document.querySelector('#action-title'),
  actionOwner: document.querySelector('#action-owner'),
  actionDue: document.querySelector('#action-due'),
  actionPriority: document.querySelector('#action-priority'),
  actionList: document.querySelector('#action-list'),
  actionSummary: document.querySelector('#action-summary'),
  actionFocus: document.querySelector('#action-focus'),
  meetingKpis: document.querySelector('#meeting-kpis'),
  meetingForm: document.querySelector('#meeting-form'),
  meetingTemplate: document.querySelector('#meeting-template'),
  meetingTitle: document.querySelector('#meeting-title'),
  meetingArea: document.querySelector('#meeting-area'),
  meetingDate: document.querySelector('#meeting-date'),
  meetingStart: document.querySelector('#meeting-start'),
  meetingEnd: document.querySelector('#meeting-end'),
  meetingModerator: document.querySelector('#meeting-moderator'),
  meetingParticipants: document.querySelector('#meeting-participants'),
  meetingList: document.querySelector('#meeting-list'),
  meetingDetail: document.querySelector('#meeting-detail'),
  meetingTemplateBoard: document.querySelector('#meeting-template-board'),
  meetingArchiveList: document.querySelector('#meeting-archive-list'),
  meetingArchiveSummary: document.querySelector('#meeting-archive-summary'),
  meetingArchiveSearch: document.querySelector('#meeting-archive-search'),
  meetingArchiveStatus: document.querySelector('#meeting-archive-status'),
  meetingArchiveArea: document.querySelector('#meeting-archive-area'),
  meetingArchiveFrom: document.querySelector('#meeting-archive-from'),
  meetingArchiveTo: document.querySelector('#meeting-archive-to'),
  meetingDriveBackup: document.querySelector('#meeting-drive-backup'),
  setupBackupButton: document.querySelector('#setup-backup-button'),
  backupSetupStatus: document.querySelector('#backup-setup-status'),
  inventoryKpis: document.querySelector('#inventory-kpis'),
  inventoryTable: document.querySelector('#inventory-table'),
  workshopKpis: document.querySelector('#workshop-kpis'),
  workshopBoard: document.querySelector('#workshop-board'),
  workshopRisks: document.querySelector('#workshop-risks'),
  escalationCount: document.querySelector('#escalation-count'),
  escalationList: document.querySelector('#escalation-list'),
  weeklyReport: document.querySelector('#weekly-report'),
  printCatalog: document.querySelector('#print-catalog'),
  exportCatalog: document.querySelector('#export-catalog'),
  teamForm: document.querySelector('#team-form'),
  teamEditId: document.querySelector('#team-edit-id'),
  teamArea: document.querySelector('#team-area'),
  teamLastName: document.querySelector('#team-last-name'),
  teamFirstName: document.querySelector('#team-first-name'),
  teamRole: document.querySelector('#team-role'),
  teamContactTarget: document.querySelector('#team-contact-target'),
  teamSalesTarget: document.querySelector('#team-sales-target'),
  teamSubmitButton: document.querySelector('#team-submit-button'),
  teamCancelEdit: document.querySelector('#team-cancel-edit'),
  teamSummary: document.querySelector('#team-summary'),
  teamOverview: document.querySelector('#team-overview'),
  dataStatus: document.querySelector('#data-admin-status'),
  dataPreview: document.querySelector('#data-admin-preview'),
  dataTabs: document.querySelector('.data-admin-tabs'),
  employeeForm: document.querySelector('#employee-form'),
  employeeName: document.querySelector('#employee-name'),
  employeeArea: document.querySelector('#employee-area'),
  employeeRole: document.querySelector('#employee-role'),
  employeeContactTarget: document.querySelector('#employee-contact-target'),
  employeeSalesTarget: document.querySelector('#employee-sales-target'),
  employeeCsv: document.querySelector('#employee-csv'),
  targetForm: document.querySelector('#target-form'),
  targetMonth: document.querySelector('#target-month'),
  targetSeller: document.querySelector('#target-seller'),
  targetContacts: document.querySelector('#target-contacts'),
  targetSales: document.querySelector('#target-sales'),
  targetCsv: document.querySelector('#target-csv'),
  kpiDataForm: document.querySelector('#kpi-data-form'),
  kpiDataArea: document.querySelector('#kpi-data-area'),
  kpiDataMetric: document.querySelector('#kpi-data-metric'),
  kpiDataActual: document.querySelector('#kpi-data-actual'),
  kpiDataTarget: document.querySelector('#kpi-data-target'),
  kpiDataUnit: document.querySelector('#kpi-data-unit'),
  kpiCsv: document.querySelector('#kpi-csv'),
  kpiDataTable: document.querySelector('#kpi-data-table'),
  importType: document.querySelector('#import-type'),
  importFile: document.querySelector('#import-file'),
  importApply: document.querySelector('#import-apply'),
  importPreview: document.querySelector('#import-preview'),
  kpiInputTabs: document.querySelector('#kpi-input-tabs'),
  kpiBulkForm: document.querySelector('#kpi-bulk-form'),
  kpiBulkFields: document.querySelector('#kpi-bulk-fields'),
  kpiInputStatus: document.querySelector('#kpi-input-status'),
  kpiInputSummary: document.querySelector('#kpi-input-summary'),
  resultForm: document.querySelector('#result-form'),
  resultDate: document.querySelector('#result-date'),
  resultSeller: document.querySelector('#result-seller'),
  resultContacts: document.querySelector('#result-contacts'),
  resultLeads: document.querySelector('#result-leads'),
  resultOffers: document.querySelector('#result-offers'),
  resultTestDrives: document.querySelector('#result-testdrives'),
  resultSales: document.querySelector('#result-sales'),
  boardForm: document.querySelector('#board-form'),
  boardTitle: document.querySelector('#board-title'),
  boardPriority: document.querySelector('#board-priority'),
  boardDue: document.querySelector('#board-due'),
  todoBoard: document.querySelector('#todo-board'),
  installButton: document.querySelector('#install-button'),
};

boot();

function boot() {
  applyTheme(state.theme || 'orange');
  updateDateLabel();
  renderNav();
  renderHome();
  renderDaily();
  renderPlans();
  renderKpis();
  renderMonitor();
  renderSales();
  renderActions();
  renderMeetings();
  renderMeetingArchive();
  renderInventory();
  renderWorkshop();
  renderReport();
  renderPrint();
  renderExport();
  renderBoard();
  renderTeam();
  renderDataAdmin();
  renderKpiInput();
  renderGoogle();
  bindEvents();
  bindTodayRefresh();
  handleStreamDeckRoute();
}

function updateDateLabel() {
  els.date.textContent = new Intl.DateTimeFormat('de-DE', {
    weekday: 'long',
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(new Date(`${todayKey}T12:00:00`));
}

function ensureTodayIsCurrent({ rerender = false } = {}) {
  const currentKey = formatDateKey(new Date());
  if (currentKey === todayKey) return false;
  todayKey = currentKey;
  const currentBlock = getCurrentBlock();
  activeBlockId = currentBlock?.id || dailyBlocks[0]?.id || activeBlockId;
  updateDateLabel();
  if (rerender) {
    renderHome();
    renderDaily();
    renderPlans();
    renderKpis();
    renderMonitor();
    renderSales();
    renderActions();
    renderMeetings();
    renderMeetingArchive();
    renderInventory();
    renderWorkshop();
    renderReport();
    renderPrint();
    renderExport();
    renderBoard();
    renderTeam();
    renderDataAdmin();
    renderKpiInput();
    renderGoogle();
    toast('Datum aktualisiert. Die App arbeitet jetzt mit dem heutigen Tag.');
  }
  return true;
}

function bindTodayRefresh() {
  window.addEventListener('focus', () => ensureTodayIsCurrent({ rerender: true }));
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) ensureTodayIsCurrent({ rerender: true });
  });
  setInterval(() => ensureTodayIsCurrent({ rerender: true }), 60000);
}

function renderNav() {
  els.nav.innerHTML = navGroups.map(group => {
    const groupActive = group.items.some(([id]) => id === 'home-view');
    return `
      <section class="nav-group ${groupActive ? 'open' : ''}" data-nav-group>
        <button class="nav-button nav-group-button ${groupActive ? 'active' : ''}" type="button" data-group-toggle>
          <span class="nav-icon">${group.icon}</span>
          <strong>${group.label}</strong>
          <span class="nav-caret">⌄</span>
        </button>
        <div class="nav-sublist">
          ${group.items.map(([id, label, subIcon]) => `
            <button class="nav-subbutton ${id === 'home-view' ? 'active' : ''}" type="button" data-view="${id}" data-label="${label}">
              ${subIcon ? `<span class="nav-subicon">${subIcon}</span>` : ''}
              <span>${label}</span>
            </button>
          `).join('')}
        </div>
      </section>
    `;
  }).join('');
}

function renderHome() {
  renderDailyQuote();
}

async function renderDailyQuote() {
  if (!els.homeQuoteText) return;
  const cached = readDailyQuoteCache();
  if (cached) {
    applyDailyQuote(cached);
    return;
  }

  applyDailyQuote({ quote: 'Der Tagesimpuls wird geladen ...', author: 'Management-Impuls', sourceLabel: 'They Said So', sourceUrl: 'https://theysaidso.com/quote-of-the-day/management' });

  try {
    const quote = await fetchManagementQuote();
    cacheDailyQuote(quote);
    applyDailyQuote(quote);
  } catch (error) {
    applyDailyQuote(getFallbackDailyQuote());
  }
}

function applyDailyQuote(quote) {
  if (!els.homeQuoteText) return;
  els.homeQuoteText.textContent = quote.quote || 'Heute klar fuehren, ruhig entscheiden und sichtbar nachhalten.';
  if (els.homeQuoteAuthor) els.homeQuoteAuthor.textContent = quote.author || 'Management-Impuls';
  if (els.homeQuoteSource) {
    els.homeQuoteSource.textContent = quote.sourceLabel || 'Quelle';
    if (quote.sourceUrl && quote.sourceUrl !== '#') {
      els.homeQuoteSource.href = quote.sourceUrl;
      els.homeQuoteSource.target = '_blank';
      els.homeQuoteSource.rel = 'noopener';
    } else {
      els.homeQuoteSource.removeAttribute('href');
      els.homeQuoteSource.removeAttribute('target');
      els.homeQuoteSource.removeAttribute('rel');
    }
  }
}

async function fetchManagementQuote() {
  const controller = new AbortController();
  const timeout = window.setTimeout(() => controller.abort(), 4500);
  try {
    const response = await fetch(managementQuoteUrl, { signal: controller.signal });
    if (!response.ok) throw new Error(`Quote service ${response.status}`);
    const data = await response.json();
    const item = data?.contents?.quotes?.[0];
    if (!item?.quote) throw new Error('No quote returned');
    return {
      quote: String(item.quote).trim(),
      author: String(item.author || 'They Said So').trim(),
      sourceLabel: 'They Said So',
      sourceUrl: item.permalink || 'https://theysaidso.com/quote-of-the-day/management',
    };
  } finally {
    window.clearTimeout(timeout);
  }
}

function readDailyQuoteCache() {
  try {
    const raw = localStorage.getItem(`${dailyQuoteCachePrefix}${todayKey}`);
    return raw ? JSON.parse(raw) : null;
  } catch (error) {
    return null;
  }
}

function cacheDailyQuote(quote) {
  try {
    localStorage.setItem(`${dailyQuoteCachePrefix}${todayKey}`, JSON.stringify(quote));
  } catch (error) {
    // Cache is optional; the quote still renders without localStorage.
  }
}

function getFallbackDailyQuote() {
  const [year, month, day] = todayKey.split('-').map(Number);
  const index = (year + month * 31 + day) % fallbackDailyQuotes.length;
  return {
    ...fallbackDailyQuotes[index],
    sourceLabel: 'Lokaler Impuls',
    sourceUrl: '#',
  };
}

function renderDaily() {
  const day = getDayState();
  const total = dailyBlocks.reduce((sum, block) => sum + block.checks.length, 0);
  const done = Object.values(day.checks).filter(Boolean).length;
  const doneBlocks = dailyBlocks.filter(block => block.checks.every((_, index) => day.checks[checkKey(block.id, index)])).length;
  const kpiValues = getKpiActualValues();
  const langsteher = getInventory().filter(vehicle => vehicle.days >= 60 || vehicle.status === 'kritisch').length;
  els.progress.textContent = `${done} von ${total} Punkten erledigt`;
  els.note.value = day.note || '';
  els.dailyKpis.innerHTML = [
    ['Tagesfortschritt', `${Math.round((done / total) * 100)}%`, `${doneBlocks}/${dailyBlocks.length} Blöcke`],
    ['Werkstatt', kpiValues.Auslastung, 'Auslastung geplant'],
    ['Leads', kpiValues.Leads, 'Monat erfasst'],
    ['Langsteher', langsteher, 'kritisch prüfen'],
    ['Fehlteile', kpiValues.Fehlteile, 'für heute'],
    ['Google', state.scriptUrl ? 'aktiv' : 'lokal', state.scriptUrl ? 'Sync bereit' : 'URL fehlt'],
  ].map(kpiCard).join('');

  const timelineItems = [
    ...dailyBlocks.map(block => ({ type: 'routine', sortTime: block.time.slice(0, 5), block })),
    ...getManualCalendarEvents().map(event => ({ type: 'calendar', sortTime: event.time || '23:59', event })),
  ].sort((a, b) => timeSortValue(a.sortTime) - timeSortValue(b.sortTime));
  els.timeline.innerHTML = timelineItems.map(item => {
    if (item.type === 'calendar') {
      const event = item.event;
      return `
        <article class="time-block calendar-time-block">
          <span class="time-range">${event.time || 'heute'}${event.endTime ? ` - ${event.endTime}` : ''}</span>
          <span><span class="time-title">${event.title || event.summary}</span><span class="time-meta">Google Kalender</span></span>
          <span class="status-pill">Termin</span>
        </article>
      `;
    }
    const block = item.block;
    const complete = block.checks.every((_, index) => day.checks[checkKey(block.id, index)]);
    return `
      <button class="time-block ${block.id === activeBlockId ? 'active' : ''} ${complete ? 'done' : ''}" type="button" data-block="${block.id}">
        <span class="time-range">${block.time}</span>
        <span><span class="time-title">${block.title}</span><span class="time-meta">${block.meta}</span></span>
        <span class="status-pill ${complete ? 'done' : ''}">${complete ? 'erledigt' : 'offen'}</span>
      </button>
    `;
  }).join('');
  renderActiveChecklist();
}

function getManualCalendarEvents() {
  return (state.calendarEvents || [])
    .filter(event => !event.managed || event.source === 'quick-calendar')
    .sort((a, b) => String(a.time || '').localeCompare(String(b.time || '')));
}

function renderActiveChecklist() {
  const block = dailyBlocks.find(item => item.id === activeBlockId) || dailyBlocks[0];
  const day = getDayState();
  els.activeTitle.textContent = block.title;
  els.activeTime.textContent = block.time;
  els.checklist.innerHTML = block.checks.map((label, index) => {
    const key = checkKey(block.id, index);
    return `
      <label class="check-row">
        <input type="checkbox" data-check="${key}" ${day.checks[key] ? 'checked' : ''} />
        <span>${label}</span>
      </label>
    `;
  }).join('');
}

function renderPlans() {
  renderPlanBoard('week-board', plans.week);
  renderPlanBoard('month-board', plans.month);
  renderPlanBoard('quarter-board', plans.quarter);
  renderPlanBoard('halfyear-board', plans.halfyear);
  renderPlanBoard('year-board', plans.year);
}

function renderPlanBoard(id, items) {
  document.querySelector(`#${id}`).innerHTML = items.map(([title, tagline, list]) => `
    <article class="plan-card">
      <span class="tagline">${tagline}</span>
      <h2>${title}</h2>
      <ul>${list.map(item => `<li>${item}</li>`).join('')}</ul>
    </article>
  `).join('');
}

function renderKpis() {
  const values = getKpiActualValues();
  document.querySelector('#kpi-board').innerHTML = kpiGroups.map(([title, items]) => `
    <article class="plan-card">
      <span class="tagline">Kennzahlen</span>
      <h2>${title}</h2>
      <ul class="kpi-value-list">${items.map(item => `
        <li>
          <span>${item}</span>
          <strong class="kpi-actual-value">${kpiValue(title, item, 'actual', values) || '–'}</strong>
        </li>
      `).join('')}</ul>
    </article>
  `).join('');
}

function renderMonitor() {
  const rows = buildMonthlyReportRows().map(monitorMetric);
  const usable = rows.filter(row => row.target > 0);
  const good = usable.filter(row => row.status === 'good').length;
  const watch = usable.filter(row => row.status === 'watch').length;
  const bad = usable.filter(row => row.status === 'bad').length;
  els.monitorSummary.innerHTML = [
    ['Gut', good, 'good'],
    ['Beobachten', watch, 'watch'],
    ['Kritisch', bad, 'bad'],
  ].map(([label, value, status]) => `<span class="monitor-count ${status}"><strong>${value}</strong>${label}</span>`).join('');
  els.monitorBoard.innerHTML = usable.map(row => `
    <article class="monitor-card ${row.status}">
      <div class="monitor-card-head">
        <div>
          <span class="tagline">${row.area}</span>
          <h2>${row.metric}</h2>
        </div>
        <strong>${row.timePct}%</strong>
      </div>
      ${gaugeSvg(row)}
      <div class="monitor-values">
        <span><strong>${row.actualLabel}</strong>Ist</span>
        <span><strong>${row.expectedLabel}</strong>Soll heute</span>
        <span><strong>${row.targetLabel}</strong>Monatsziel</span>
      </div>
    </article>
  `).join('');
}

function gaugeSvg(row) {
  const center = 120;
  const needle = polarPoint(center, center, 70, row.angle);
  const ticks = [0, 50, 85, 100, 125, 150].map(value => {
    const angle = gaugeAngle(value);
    const outer = polarPoint(center, center, 93, angle);
    const inner = polarPoint(center, center, value === 100 ? 75 : 81, angle);
    const label = polarPoint(center, center, 62, angle);
    return `
      <line class="gauge-tick ${value === 100 ? 'target' : ''}" x1="${inner.x}" y1="${inner.y}" x2="${outer.x}" y2="${outer.y}"></line>
      <text class="gauge-label ${value === 100 ? 'target' : ''}" x="${label.x}" y="${label.y}">${value === 100 ? 'Plan' : value}</text>
    `;
  }).join('');
  return `
    <svg class="monitor-gauge" viewBox="0 0 240 150" role="img" aria-label="${row.metric}: ${row.timePct}% vom Soll bis heute">
      <path class="gauge-track" d="${arcPath(center, center, 88, -140, 140)}"></path>
      <path class="gauge-zone bad" d="${arcPath(center, center, 88, -140, gaugeAngle(85))}"></path>
      <path class="gauge-zone watch" d="${arcPath(center, center, 88, gaugeAngle(85), gaugeAngle(100))}"></path>
      <path class="gauge-zone good" d="${arcPath(center, center, 88, gaugeAngle(100), 140)}"></path>
      ${ticks}
      <line class="gauge-needle" x1="${center}" y1="${center}" x2="${needle.x}" y2="${needle.y}"></line>
      <circle class="gauge-hub" cx="${center}" cy="${center}" r="8"></circle>
      <text class="gauge-value" x="${center}" y="112">${row.timePct}%</text>
    </svg>
  `;
}

function renderSales() {
  const sales = getSalesState();
  const salesTeam = getSalesTeam();
  const entries = sales.entries || [];
  const salesPeriod = getSalesReportPeriod(entries);
  const monthKey = salesPeriod.monthKey;
  const todayEntries = entries.filter(entry => entry.date === todayKey);
  const monthEntries = salesPeriod.entries;
  const todayTotals = aggregateSales(todayEntries);
  const monthTotals = aggregateSales(monthEntries);
  const monthLabel = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(new Date(`${monthKey}-01T12:00:00`));
  els.salesSourceLabel.textContent = sales.lastSync
    ? `Zuletzt geladen: ${new Intl.DateTimeFormat('de-DE', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(sales.lastSync))}`
    : 'Liest Kontakte, Leads, Angebote, Probefahrten und Abschlüsse aus der App-Google-Tabelle.';
  els.salesMonthLabel.textContent = monthLabel;
  els.salesKpis.innerHTML = [
    ['Meldungen heute', todayEntries.length, `${salesTeam.length} Verkäufer erwartet`],
    ['Kontakte heute', todayTotals.contacts, 'mobile Eingaben'],
    ['Leads heute', todayTotals.leads, 'mobile Eingaben'],
    ['Angebote heute', todayTotals.offers, 'mobile Eingaben'],
    ['Probefahrten heute', todayTotals.testDrives, 'mobile Eingaben'],
    ['Abschlüsse Monat', monthTotals.sales, 'gegen Ziel'],
  ].map(kpiCard).join('');
  els.salesGoalBoard.innerHTML = salesTeam.map(person => sellerGoalRow(person, monthEntries, sales.targets)).join('');
  els.salesTable.innerHTML = renderSalesTable(entries);
}

function renderBoard() {
  const visibleTodos = sortBoardTodos(getVisibleBoardTodos().filter(todo => todo.status !== 'done'));
  const openCount = visibleTodos.filter(todo => todo.status === 'open').length;
  const doingCount = visibleTodos.filter(todo => todo.status === 'doing').length;
  const highCount = visibleTodos.filter(todo => todo.priority === 'hoch').length;
  els.todoBoard.innerHTML = `
    <section class="todo-list-panel panel">
      <div class="todo-list-head">
        <div>
          <h2>Arbeitsliste</h2>
          <p>Aktive Aufgaben nach Wichtigkeit sortiert. Erledigte Punkte verschwinden aus der Liste.</p>
        </div>
        <div class="todo-list-stats" aria-label="Aufgabenübersicht">
          <span><strong>${highCount}</strong> Hoch</span>
          <span><strong>${doingCount}</strong> Begonnen</span>
          <span><strong>${openCount}</strong> Offen</span>
        </div>
      </div>
      <div class="todo-list">
        ${visibleTodos.length ? visibleTodos.map(renderBoardCard).join('') : '<p class="empty-note">Keine aktiven Aufgaben fällig.</p>'}
      </div>
    </section>
  `;
}

function sortBoardTodos(todos) {
  const priorityRank = { hoch: 0, mittel: 1, niedrig: 2 };
  return [...todos].sort((a, b) => {
    const priorityDiff = (priorityRank[a.priority] ?? 1) - (priorityRank[b.priority] ?? 1);
    if (priorityDiff) return priorityDiff;
    const dueA = a.due || '9999-12-31';
    const dueB = b.due || '9999-12-31';
    if (dueA !== dueB) return dueA.localeCompare(dueB);
    return String(a.title || '').localeCompare(String(b.title || ''), 'de');
  });
}

function getVisibleBoardTodos() {
  return getBoardTodos().filter(todo => {
    if (todo.status === 'done') return false;
    return isBoardTodoVisible(todo);
  });
}

function isBoardTodoVisible(todo) {
  if (!todo.due) return true;
  const visibleFrom = addDays(new Date(`${todo.due}T12:00:00`), -1);
  return visibleFrom <= new Date();
}

function renderBoardCard(todo) {
  const isGoogleTask = todo.source === 'google';
  const isDoing = todo.status === 'doing';
  return `
    <article class="board-card status-${todo.status} priority-${todo.priority}" data-todo-id="${todo.id}">
      <span class="todo-priority-marker" aria-hidden="true"></span>
      <div class="board-card-text">
        <div class="board-card-top">
          <strong>${todo.title}</strong>
          <span>${priorityLabel(todo.priority)}</span>
        </div>
        <p>${todo.due ? `Fällig ${formatDateShort(todo.due)}` : 'Ohne Fälligkeit'} · ${statusLabel(todo.status)}${isGoogleTask ? ' · Google Tasks' : ''}</p>
      </div>
      <div class="board-card-actions" aria-label="Aufgabe bearbeiten">
        <button class="mini-button" type="button" data-board-status="${todo.id}" data-status="${isDoing ? 'open' : 'doing'}">${isDoing ? 'Offen' : 'Beginnen'}</button>
        <button class="board-icon-button complete-action" type="button" data-board-status="${todo.id}" data-status="done" title="Erledigen" aria-label="Erledigen">✓</button>
        <button class="board-icon-button danger-action" type="button" data-board-delete="${todo.id}" title="Entfernen" aria-label="Entfernen">&times;</button>
      </div>
    </article>
  `;
}

function sellerGoalRow(person, entries, targets) {
  const target = targets?.[person.name] || {};
  const contactTarget = Number(target.contactTarget || person.monthlyContactTarget || 0);
  const salesTarget = Number(target.salesTarget || person.monthlySalesTarget || 0);
  const totals = aggregateSales(entries.filter(entry => entry.seller === person.name));
  const contactPct = percent(totals.contacts, contactTarget);
  const salesPct = percent(totals.sales, salesTarget);
  return `
    <article class="seller-goal-row">
      <div>
        <strong>${person.name}</strong>
        <span>${totals.contacts} / ${contactTarget} Kontakte · ${totals.sales} / ${salesTarget} Verkäufe</span>
      </div>
      <div class="goal-bars">
        ${goalBar('Kontakte', contactPct)}
        ${goalBar('Verkäufe', salesPct)}
      </div>
    </article>
  `;
}

function goalBar(label, value) {
  return `
    <div class="goal-bar">
      <span>${label} ${value}%</span>
      <div><i style="width:${Math.min(value, 120)}%"></i></div>
    </div>
  `;
}

function renderSalesTable(entries) {
  if (!entries.length) return '<p class="empty-note">Noch keine mobilen Eingaben geladen. Bitte Datenquelle speichern und Mitarbeiterdaten laden.</p>';
  const rows = [...entries]
    .sort((a, b) => b.date.localeCompare(a.date) || a.seller.localeCompare(b.seller))
    .slice(0, 80)
    .map(entry => `
      <tr>
        <td>${formatDateShort(entry.date)}</td>
        <td>${entry.seller}</td>
        <td>${entry.contacts}</td>
        <td>${entry.leads}</td>
        <td>${entry.offers}</td>
        <td>${entry.testDrives}</td>
        <td>${entry.sales}</td>
      </tr>
    `).join('');
  return `
    <table class="data-table">
      <thead><tr><th>Datum</th><th>Mitarbeiter</th><th>Kontakte</th><th>Leads</th><th>Angebote</th><th>Probefahrten</th><th>Abschlüsse</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function renderActions() {
  const actions = getActions();
  els.actionOwner.innerHTML = getEmployees().map(person => `<option value="${person.name}">${person.name}</option>`).join('');
  const open = actions.filter(action => action.status !== 'done');
  const overdue = open.filter(action => action.due && action.due < todayKey);
  els.actionSummary.textContent = `${open.length} offen · ${overdue.length} überfällig`;
  els.actionList.innerHTML = actions.length ? actions.map(renderActionRow).join('') : '<p class="empty-note">Noch keine Maßnahmen angelegt.</p>';
  els.actionFocus.innerHTML = open
    .sort((a, b) => (a.due || '9999-12-31').localeCompare(b.due || '9999-12-31'))
    .slice(0, 6)
    .map(action => `
      <div class="compact-item">
        <strong>${action.title}</strong>
        <span class="task-meta">${action.owner} · ${action.due ? formatDateShort(action.due) : 'ohne Frist'}</span>
      </div>
    `).join('') || '<div class="compact-item"><span class="task-meta">Keine offenen Maßnahmen</span></div>';
}

function renderActionRow(action) {
  return `
    <article class="ops-row priority-${action.priority}">
      <div>
        <strong>${action.title}</strong>
        <span>${action.owner} · ${action.due ? `fällig ${formatDateShort(action.due)}` : 'ohne Frist'} · ${priorityLabel(action.priority)}</span>
      </div>
      <div class="segmented-actions">
        ${['open', 'doing', 'done'].map(status => `
          <button type="button" data-action-status="${action.id}" data-status="${status}" class="${action.status === status ? 'active' : ''}">${statusLabel(status)}</button>
        `).join('')}
        <button type="button" data-action-delete="${action.id}" class="danger-mini">Entfernen</button>
      </div>
    </article>
  `;
}

function renderMeetings() {
  const meetings = getMeetings();
  const team = getEmployees();
  const todayMeetings = meetings.filter(meeting => meeting.date === todayKey);
  const openMeetingTasks = meetings.flatMap(meeting => meeting.tasks || []).filter(task => task.status !== 'done');
  els.meetingKpis.innerHTML = [
    ['Meetings heute', todayMeetings.length, 'Tagesübersicht'],
    ['Geplant', meetings.filter(meeting => meeting.status === 'planned').length, 'kommende Besprechungen'],
    ['Laufend', meetings.filter(meeting => meeting.status === 'running').length, 'aktuell aktiv'],
    ['Offene Aufgaben', openMeetingTasks.length, 'im Maßnahmenplan'],
  ].map(kpiCard).join('');

  const areas = [...new Set(['Standortleitung', ...team.map(person => person.area), ...meetingTemplates.map(template => template.area)])].sort();
  els.meetingTemplate.innerHTML = meetingTemplates.map(template => `<option value="${template.id}">${template.title}</option>`).join('');
  els.meetingArea.innerHTML = areas.map(area => `<option value="${area}">${area}</option>`).join('');
  els.meetingModerator.innerHTML = team.map(person => `<option value="${person.id}">${person.name} · ${person.role}</option>`).join('');
  els.meetingParticipants.innerHTML = team.map(person => `
    <label class="meeting-person">
      <input type="checkbox" name="meeting-participant" value="${person.id}" />
      <span><strong>${person.name}</strong><small>${person.area} · ${person.role}</small></span>
    </label>
  `).join('');
  els.meetingDate.value ||= todayKey;
  if (!els.meetingTitle.value) applyMeetingTemplate();

  els.meetingList.innerHTML = meetings.length ? [...meetings]
    .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`))
    .map(meeting => {
      const moderator = team.find(person => person.id === meeting.moderatorId)?.name || 'Standortleitung';
      return `
        <button type="button" class="meeting-list-item ${meeting.id === state.activeMeetingId ? 'active' : ''}" data-meeting-open="${meeting.id}">
          <span class="meeting-status-dot status-${meeting.status}"></span>
          <span>
            <strong>${meeting.title}</strong>
            <small>${formatDateShort(meeting.date)} · ${meeting.startTime} · ${moderator}</small>
          </span>
          <em>${meetingStatusLabel(meeting.status)}</em>
        </button>
      `;
    }).join('') : '<p class="empty-note">Noch keine Besprechung angelegt.</p>';

  els.meetingTemplateBoard.innerHTML = meetingTemplates.map(template => `
    <article class="meeting-template-card">
      <span class="tagline">${template.area}</span>
      <h3>${template.title}</h3>
      <p>${template.agenda.slice(0, 3).join(' · ')}</p>
      <button class="ghost-button mini-button" type="button" data-meeting-template-use="${template.id}">Vorlage nutzen</button>
    </article>
  `).join('');
  renderMeetingDetail();
  renderMeetingArchive();
}

function renderMeetingArchive() {
  if (!els.meetingArchiveList) return;
  const team = getEmployees();
  const query = String(els.meetingArchiveSearch?.value || '').trim().toLowerCase();
  const status = els.meetingArchiveStatus?.value || '';
  const area = els.meetingArchiveArea?.value || '';
  const from = els.meetingArchiveFrom?.value || '';
  const to = els.meetingArchiveTo?.value || '';
  const areas = [...new Set(getMeetings().map(meeting => meeting.area).filter(Boolean))].sort();
  const selectedArea = els.meetingArchiveArea.value;
  els.meetingArchiveArea.innerHTML = `<option value="">Alle Bereiche</option>${areas.map(item => `<option value="${escapeHtml(item)}">${escapeHtml(item)}</option>`).join('')}`;
  els.meetingArchiveArea.value = areas.includes(selectedArea) ? selectedArea : '';
  const filtered = [...getMeetings()]
    .filter(meeting => !status || meeting.status === status)
    .filter(meeting => !area || meeting.area === area)
    .filter(meeting => !from || meeting.date >= from)
    .filter(meeting => !to || meeting.date <= to)
    .filter(meeting => {
      if (!query) return true;
      const participants = (meeting.participantIds || []).map(id => team.find(person => person.id === id)?.name || '').join(' ');
      const searchable = [
        meeting.title, meeting.area, meeting.notes, participants,
        ...(meeting.agenda || []).map(item => item.title),
        ...(meeting.decisions || []).map(item => item.title),
        ...(meeting.issues || []).map(item => item.title),
        ...(meeting.tasks || []).map(item => `${item.title} ${item.owner}`),
      ].join(' ').toLowerCase();
      return searchable.includes(query);
    })
    .sort((a, b) => `${b.date}${b.startTime}`.localeCompare(`${a.date}${a.startTime}`));
  els.meetingArchiveSummary.textContent = `${filtered.length} von ${getMeetings().length} Besprechungen`;
  els.meetingArchiveList.innerHTML = filtered.length ? filtered.map(meeting => {
    const moderator = team.find(person => person.id === meeting.moderatorId)?.name || 'nicht hinterlegt';
    return `
      <article class="panel meeting-archive-card">
        <div class="meeting-archive-card-head">
          <div>
            <span class="tagline">${escapeHtml(meeting.area)} · ${formatDateShort(meeting.date)} · ${meeting.startTime}-${meeting.endTime}</span>
            <h3>${escapeHtml(meeting.title)}</h3>
            <p>${escapeHtml(moderator)} · ${(meeting.participantIds || []).length} Teilnehmer</p>
          </div>
          <span class="status-pill ${meeting.status === 'done' ? 'done' : ''}">${meetingStatusLabel(meeting.status)}</span>
        </div>
        <div class="meeting-archive-metrics">
          <span><strong>${(meeting.agenda || []).length}</strong> Agenda</span>
          <span><strong>${(meeting.decisions || []).length}</strong> Entscheidungen</span>
          <span><strong>${(meeting.issues || []).length}</strong> offene Punkte</span>
          <span><strong>${(meeting.tasks || []).length}</strong> Maßnahmen</span>
        </div>
        <div class="meeting-archive-actions">
          <button class="ghost-button" type="button" data-archive-open="${meeting.id}">Meeting öffnen</button>
          <button class="primary-button" type="button" data-archive-pdf="${meeting.id}">PDF öffnen</button>
          ${meeting.driveFileUrl ? `<a class="ghost-button" href="${escapeHtml(meeting.driveFileUrl)}" target="_blank" rel="noopener">Drive-Kopie</a>` : ''}
        </div>
      </article>
    `;
  }).join('') : '<section class="panel meeting-archive-empty"><h3>Keine passenden Meetings</h3><p>Ändere die Filter oder lege zunächst eine Besprechung an.</p></section>';
}

function renderMeetingDetail() {
  const meeting = getMeetings().find(item => item.id === state.activeMeetingId);
  if (!meeting) {
    els.meetingDetail.innerHTML = `
      <div class="meeting-empty">
        <span class="meeting-empty-icon">${navIcons.planning}</span>
        <h2>Besprechung auswählen</h2>
        <p>Hier entsteht während des Meetings ein klares Protokoll mit Entscheidungen, Risiken und nachverfolgbaren Maßnahmen.</p>
      </div>
    `;
    return;
  }
  const team = getEmployees();
  const participants = (meeting.participantIds || []).map(id => team.find(person => person.id === id)).filter(Boolean);
  const decisions = meeting.decisions || [];
  const issues = meeting.issues || [];
  const tasks = meeting.tasks || [];
  meeting.agenda ||= [];
  els.meetingDetail.innerHTML = `
    <div class="meeting-detail-head">
      <div>
        <span class="tagline">${meeting.area} · ${formatDateShort(meeting.date)} · ${meeting.startTime}–${meeting.endTime}</span>
        <h2>${meeting.title}</h2>
        <p>${participants.map(person => `${person.name} (${person.role})`).join(', ') || 'Teilnehmer noch nicht festgelegt'}</p>
      </div>
      <div class="meeting-status-actions">
        ${['planned', 'running', 'done'].map(status => `<button type="button" class="${meeting.status === status ? 'active' : ''}" data-meeting-status="${status}">${meetingStatusLabel(status)}</button>`).join('')}
      </div>
    </div>

    <div class="meeting-detail-grid">
      <section class="meeting-section">
        <div class="section-heading"><div><h3>Agenda</h3><span>${(meeting.agenda || []).filter(item => item.done).length}/${(meeting.agenda || []).length} erledigt</span></div></div>
        <form class="meeting-agenda-form" data-meeting-agenda-form>
          <input name="title" type="text" placeholder="Eigenen Tagesordnungspunkt hinzufügen" required />
          <button class="ghost-button" type="submit">Hinzufügen</button>
        </form>
        <div class="meeting-agenda">
          ${(meeting.agenda || []).map((item, index) => `
            <div class="meeting-agenda-row">
              <input type="checkbox" data-meeting-agenda="${item.id}" ${item.done ? 'checked' : ''} />
              <span>${escapeHtml(item.title)}</span>
              <div class="meeting-agenda-actions">
                <button type="button" data-meeting-agenda-move="${item.id}" data-direction="-1" title="Nach oben" aria-label="Nach oben" ${index === 0 ? 'disabled' : ''}>↑</button>
                <button type="button" data-meeting-agenda-move="${item.id}" data-direction="1" title="Nach unten" aria-label="Nach unten" ${index === meeting.agenda.length - 1 ? 'disabled' : ''}>↓</button>
                <button type="button" data-meeting-agenda-delete="${item.id}" title="Entfernen" aria-label="Entfernen">×</button>
              </div>
            </div>
          `).join('') || '<span class="empty-note">Noch keine Tagesordnungspunkte. Ergänze das Meeting frei.</span>'}
        </div>
      </section>

      <section class="meeting-section meeting-notes-section">
        <div class="section-heading">
          <div><h3>Notizen und Sprache</h3><span>Freitext wird in Ergebnisse überführt</span></div>
          <button class="ghost-button mini-button" type="button" data-meeting-speech>Spracheingabe</button>
        </div>
        <textarea data-meeting-notes rows="8" placeholder="Beschlüsse, Probleme und Aufgaben einfach notieren oder einsprechen...">${meeting.notes || ''}</textarea>
        <div class="meeting-note-actions">
          <button class="ghost-button" type="button" data-meeting-analyze>Notizen strukturieren</button>
        </div>
      </section>
    </div>

    <div class="meeting-results-grid">
      <section class="meeting-result-card">
        <div class="section-heading"><div><h3>Entscheidungen</h3><span>${decisions.length}</span></div></div>
        <form class="meeting-inline-form" data-meeting-decision-form>
          <input name="title" placeholder="Neue Entscheidung" required />
          <button class="ghost-button" type="submit">+</button>
        </form>
        <div class="compact-list">${decisions.map(item => `<div class="compact-item"><strong>${item.title}</strong></div>`).join('') || '<span class="empty-note">Noch keine Entscheidung</span>'}</div>
      </section>

      <section class="meeting-result-card">
        <div class="section-heading"><div><h3>Risiken / offene Punkte</h3><span>${issues.length}</span></div></div>
        <form class="meeting-inline-form" data-meeting-issue-form>
          <input name="title" placeholder="Neuer offener Punkt" required />
          <button class="ghost-button" type="submit">+</button>
        </form>
        <div class="compact-list">${issues.map(item => `<div class="compact-item"><strong>${item.title}</strong><span class="task-meta">${priorityLabel(item.priority)}</span></div>`).join('') || '<span class="empty-note">Keine offenen Punkte</span>'}</div>
      </section>

      <section class="meeting-result-card meeting-task-result">
        <div class="section-heading"><div><h3>Aufgaben und Maßnahmen</h3><span>${tasks.filter(task => task.status !== 'done').length} offen</span></div></div>
        <form class="meeting-task-form" data-meeting-task-form>
          <input name="title" placeholder="Neue Aufgabe" required />
          <select name="owner">${team.map(person => `<option value="${person.name}">${person.name} · ${person.role}</option>`).join('')}</select>
          <input name="due" type="date" value="${meeting.date}" />
          <select name="priority"><option value="hoch">Hoch</option><option value="mittel" selected>Mittel</option><option value="niedrig">Niedrig</option></select>
          <button class="primary-button" type="submit">In Maßnahmenplan</button>
        </form>
        <div class="meeting-task-list">${tasks.map(task => `
          <div class="compact-item">
            <strong>${task.title}</strong>
            <span class="task-meta">${task.owner} · ${formatDateShort(task.due)} · ${priorityLabel(task.priority)}</span>
          </div>
        `).join('') || '<span class="empty-note">Noch keine Meeting-Aufgabe</span>'}</div>
      </section>
    </div>

    <section class="meeting-protocol-finish">
      <div>
        <span class="tagline">Meetingabschluss</span>
        <h3>Tagungsprotokoll erstellen</h3>
        <p>Agenda, Teilnehmer, Entscheidungen, offene Punkte, Maßnahmen und Notizen werden automatisch zusammengeführt.</p>
      </div>
      <div class="meeting-protocol-actions">
        <button class="ghost-button" type="button" data-meeting-print>Protokoll drucken</button>
        <button class="primary-button" type="button" data-meeting-pdf>PDF öffnen</button>
      </div>
    </section>
  `;
  els.meetingDetail.querySelector('[data-meeting-agenda-form]')?.addEventListener('submit', addMeetingAgendaItem);
  els.meetingDetail.querySelector('[data-meeting-decision-form]')?.addEventListener('submit', addMeetingDecision);
  els.meetingDetail.querySelector('[data-meeting-issue-form]')?.addEventListener('submit', addMeetingIssue);
  els.meetingDetail.querySelector('[data-meeting-task-form]')?.addEventListener('submit', addMeetingTask);
}

function applyMeetingTemplate() {
  const template = meetingTemplates.find(item => item.id === els.meetingTemplate.value) || meetingTemplates[0];
  if (!template) return;
  els.meetingTitle.value = template.title;
  els.meetingArea.value = template.area;
  els.meetingStart.value = template.start;
  els.meetingEnd.value = template.end;
  const team = getEmployees();
  const preferredModerator = team.find(person => person.area === 'Standortleitung')
    || team.find(person => person.area === template.area)
    || team[0];
  if (preferredModerator) els.meetingModerator.value = preferredModerator.id;
  els.meetingParticipants.querySelectorAll('input').forEach(input => {
    const person = team.find(item => item.id === input.value);
    input.checked = person?.area === template.area || person?.area === 'Standortleitung';
  });
}

function addMeeting(event) {
  event.preventDefault();
  const template = meetingTemplates.find(item => item.id === els.meetingTemplate.value) || meetingTemplates[0];
  const meeting = {
    id: crypto.randomUUID?.() || `meeting-${Date.now()}`,
    title: els.meetingTitle.value.trim(),
    type: template.id,
    area: els.meetingArea.value,
    status: 'planned',
    date: els.meetingDate.value,
    startTime: els.meetingStart.value,
    endTime: els.meetingEnd.value,
    moderatorId: els.meetingModerator.value,
    participantIds: [...els.meetingParticipants.querySelectorAll('input:checked')].map(input => input.value),
    agenda: template.agenda.map((title, index) => ({ id: `${Date.now()}-${index}`, title, done: false })),
    notes: '',
    decisions: [],
    issues: [],
    tasks: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  state.meetings.unshift(meeting);
  state.activeMeetingId = meeting.id;
  event.currentTarget.reset();
  els.meetingDate.value = todayKey;
  touchMeeting(meeting);
  renderMeetings();
  toast('Meeting angelegt und zur Vorbereitung geöffnet.');
}

function handleMeetingListClick(event) {
  const button = event.target.closest('[data-meeting-open]');
  if (!button) return;
  state.activeMeetingId = button.dataset.meetingOpen;
  saveState();
  renderMeetings();
}

function handleMeetingArchiveClick(event) {
  const openButton = event.target.closest('[data-archive-open]');
  const pdfButton = event.target.closest('[data-archive-pdf]');
  const meetingId = openButton?.dataset.archiveOpen || pdfButton?.dataset.archivePdf;
  if (!meetingId) return;
  const meeting = getMeetings().find(item => item.id === meetingId);
  if (!meeting) return;
  if (pdfButton) {
    exportMeetingProtocolPdf(meeting);
    return;
  }
  state.activeMeetingId = meeting.id;
  saveState();
  renderMeetings();
  switchView('meetings-view', 'Meetings');
}

function touchMeeting(meeting) {
  if (!meeting) return;
  meeting.updatedAt = new Date().toISOString();
  saveState();
  renderMeetingArchive();
  scheduleMeetingGoogleSave(meeting);
}

function scheduleMeetingGoogleSave(meeting) {
  if (!state.scriptUrl || !meeting?.id) return;
  meetingSyncQueue.set(meeting.id, JSON.parse(JSON.stringify(meeting)));
  clearTimeout(meetingSyncTimer);
  meetingSyncTimer = setTimeout(syncMeetingChangesToGoogle, 900);
}

async function syncMeetingChangesToGoogle() {
  if (!state.scriptUrl || !meetingSyncQueue.size) return;
  if (meetingSyncRunning) {
    clearTimeout(meetingSyncTimer);
    meetingSyncTimer = setTimeout(syncMeetingChangesToGoogle, 1200);
    return;
  }
  meetingSyncRunning = true;
  const meetings = [...meetingSyncQueue.values()];
  meetingSyncQueue.clear();
  try {
    if (!validateGoogleScriptUrl()) {
      meetings.forEach(meeting => meetingSyncQueue.set(meeting.id, meeting));
      return;
    }
    await fetchGoogleJson(state.scriptUrl, googlePostOptions({ action: 'meeting-save', meetings }));
    state.lastMeetingBackupAt = new Date().toISOString();
    saveState();
  } catch (error) {
    meetings.forEach(meeting => meetingSyncQueue.set(meeting.id, meeting));
    els.googleStatus.textContent = 'Meeting-Sicherung ausstehend';
    clearTimeout(meetingSyncTimer);
    meetingSyncTimer = setTimeout(syncMeetingChangesToGoogle, 6000);
  } finally {
    meetingSyncRunning = false;
  }
}

function handleMeetingTemplateClick(event) {
  const button = event.target.closest('[data-meeting-template-use]');
  if (!button) return;
  els.meetingTemplate.value = button.dataset.meetingTemplateUse;
  applyMeetingTemplate();
  els.meetingTitle.focus();
}

function handleMeetingDetailInput(event) {
  const meeting = getActiveMeeting();
  if (!meeting) return;
  const agenda = event.target.closest('[data-meeting-agenda]');
  if (agenda) {
    const item = meeting.agenda.find(entry => entry.id === agenda.dataset.meetingAgenda);
    if (item) item.done = agenda.checked;
  }
  if (event.target.matches('[data-meeting-notes]')) meeting.notes = event.target.value;
  touchMeeting(meeting);
}

function handleMeetingDetailClick(event) {
  const meeting = getActiveMeeting();
  if (!meeting) return;
  const statusButton = event.target.closest('[data-meeting-status]');
  if (statusButton) {
    meeting.status = statusButton.dataset.meetingStatus;
    touchMeeting(meeting);
    renderMeetings();
    return;
  }
  if (event.target.closest('[data-meeting-analyze]')) analyzeMeetingNotes(meeting);
  if (event.target.closest('[data-meeting-speech]')) startMeetingSpeech(meeting);
  if (event.target.closest('[data-meeting-print]')) printMeetingProtocol(meeting, 'print');
  if (event.target.closest('[data-meeting-pdf]')) exportMeetingProtocolPdf(meeting);
  const agendaDelete = event.target.closest('[data-meeting-agenda-delete]');
  if (agendaDelete) {
    meeting.agenda = meeting.agenda.filter(item => item.id !== agendaDelete.dataset.meetingAgendaDelete);
    touchMeeting(meeting);
    renderMeetingDetail();
    return;
  }
  const agendaMove = event.target.closest('[data-meeting-agenda-move]');
  if (agendaMove) {
    moveMeetingAgendaItem(meeting, agendaMove.dataset.meetingAgendaMove, Number(agendaMove.dataset.direction));
  }
}

function addMeetingAgendaItem(event) {
  event.preventDefault();
  const meeting = getActiveMeeting();
  const title = new FormData(event.currentTarget).get('title')?.trim();
  if (!meeting || !title) return;
  meeting.agenda ||= [];
  meeting.agenda.push({ id: crypto.randomUUID?.() || `agenda-${Date.now()}`, title, done: false });
  touchMeeting(meeting);
  renderMeetingDetail();
}

function moveMeetingAgendaItem(meeting, id, direction) {
  const index = meeting.agenda.findIndex(item => item.id === id);
  const target = index + direction;
  if (index < 0 || target < 0 || target >= meeting.agenda.length) return;
  [meeting.agenda[index], meeting.agenda[target]] = [meeting.agenda[target], meeting.agenda[index]];
  touchMeeting(meeting);
  renderMeetingDetail();
}

function addMeetingDecision(event) {
  event.preventDefault();
  const meeting = getActiveMeeting();
  const title = new FormData(event.currentTarget).get('title')?.trim();
  if (!meeting || !title) return;
  meeting.decisions.push({ id: `decision-${Date.now()}`, title });
  touchMeeting(meeting);
  renderMeetings();
}

function addMeetingIssue(event) {
  event.preventDefault();
  const meeting = getActiveMeeting();
  const title = new FormData(event.currentTarget).get('title')?.trim();
  if (!meeting || !title) return;
  meeting.issues.push({ id: `issue-${Date.now()}`, title, priority: 'hoch', status: 'open' });
  touchMeeting(meeting);
  renderMeetings();
}

function addMeetingTask(event) {
  event.preventDefault();
  const meeting = getActiveMeeting();
  if (!meeting) return;
  const data = new FormData(event.currentTarget);
  const task = {
    id: crypto.randomUUID?.() || `meeting-task-${Date.now()}`,
    title: data.get('title')?.trim(),
    owner: data.get('owner'),
    due: data.get('due') || meeting.date,
    priority: data.get('priority') || 'mittel',
    status: 'open',
  };
  if (!task.title) return;
  meeting.tasks.push(task);
  state.actions.unshift({ ...task, source: 'meeting', meetingId: meeting.id, area: meeting.area, createdAt: new Date().toISOString() });
  touchMeeting(meeting);
  renderMeetings();
  renderActions();
  renderReport();
  toast('Aufgabe wurde im Meeting und im Maßnahmenplan angelegt.');
}

function analyzeMeetingNotes(meeting) {
  const lines = (meeting.notes || '').split(/\n|[.!?]\s+/).map(line => line.trim()).filter(Boolean);
  lines.forEach(line => {
    const lower = line.toLowerCase();
    if ((lower.includes('entscheidung') || lower.includes('beschluss')) && !meeting.decisions.some(item => item.title === line)) {
      meeting.decisions.push({ id: `decision-${Date.now()}-${meeting.decisions.length}`, title: line });
    } else if ((lower.includes('problem') || lower.includes('risiko') || lower.includes('eskalation')) && !meeting.issues.some(item => item.title === line)) {
      meeting.issues.push({ id: `issue-${Date.now()}-${meeting.issues.length}`, title: line, priority: 'hoch', status: 'open' });
    }
  });
  meeting.summary = lines.slice(0, 4).join(' · ');
  touchMeeting(meeting);
  renderMeetings();
  toast(lines.length ? 'Notizen wurden in Entscheidungen und Risiken eingeordnet.' : 'Bitte zuerst Notizen erfassen.');
}

function startMeetingSpeech(meeting) {
  const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Recognition) {
    toast('Spracheingabe wird von diesem Browser nicht unterstützt.');
    return;
  }
  const recognition = new Recognition();
  recognition.lang = 'de-DE';
  recognition.continuous = true;
  recognition.interimResults = false;
  recognition.onresult = event => {
    const text = [...event.results].slice(event.resultIndex).map(result => result[0].transcript).join(' ');
    meeting.notes = `${meeting.notes || ''}${meeting.notes ? '\n' : ''}${text}`;
    touchMeeting(meeting);
    renderMeetingDetail();
  };
  recognition.onerror = () => toast('Spracheingabe konnte nicht gestartet werden.');
  recognition.start();
  toast('Spracheingabe läuft. Zum Beenden erneut auf die Seite klicken.');
}

function printMeetingProtocol(meeting, mode = 'print') {
  const team = getEmployees();
  const participantNames = (meeting.participantIds || []).map(id => team.find(person => person.id === id)?.name).filter(Boolean);
  const protocol = window.open('', '_blank');
  if (!protocol) {
    toast('Bitte Pop-up-Fenster für das Meeting-Protokoll erlauben.');
    return;
  }
  protocol.document.write(buildMeetingProtocolHtml(meeting, participantNames, mode));
  protocol.document.close();
}

function exportMeetingProtocolPdf(meeting) {
  const team = getEmployees();
  const participants = (meeting.participantIds || []).map(id => team.find(person => person.id === id)?.name).filter(Boolean);
  const moderator = team.find(person => person.id === meeting.moderatorId)?.name || 'nicht hinterlegt';
  const pdfWindow = window.open('', '_blank');
  if (!pdfWindow) {
    toast('Bitte Pop-up-Fenster erlauben, damit das PDF geöffnet werden kann.');
    return;
  }
  pdfWindow.document.write('<title>Meetingprotokoll wird erstellt ...</title><body style="font-family:Arial,sans-serif;padding:32px;color:#30363b">Meetingprotokoll wird erstellt ...</body>');
  pdfWindow.document.close();
  const pdf = createMeetingProtocolPdf(meeting, participants, moderator);
  const url = URL.createObjectURL(new Blob([pdf], { type: 'application/pdf' }));
  pdfWindow.location.replace(url);
  setTimeout(() => URL.revokeObjectURL(url), 120000);
  toast('Meetingprotokoll wurde als PDF geöffnet.');
  if (state.meetingDriveBackup && state.scriptUrl) saveMeetingPdfToDrive(meeting, pdf);
}

async function saveMeetingPdfToDrive(meeting, pdfBytes) {
  try {
    if (!validateGoogleScriptUrl()) return;
    const data = await fetchGoogleJson(state.scriptUrl, googlePostOptions({
      action: 'meeting-pdf-drive',
      filename: `${slugify(meeting.title) || 'meeting'}-protokoll-${meeting.date}.pdf`,
      base64: bytesToBase64(pdfBytes),
      meeting,
    }));
    meeting.driveFileUrl = data.driveFileUrl || '';
    meeting.driveFileId = data.driveFileId || '';
    meeting.driveSavedAt = new Date().toISOString();
    touchMeeting(meeting);
    renderMeetings();
    toast('PDF geöffnet und zusätzlich in Google Drive archiviert.');
  } catch (error) {
    toast(`PDF geöffnet. Drive-Ablage nicht möglich: ${googleConnectionErrorMessage(error)}`);
  }
}

function bytesToBase64(bytes) {
  let binary = '';
  const chunkSize = 8192;
  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }
  return btoa(binary);
}

function createMeetingProtocolPdf(meeting, participants, moderator) {
  const pages = [];
  let commands = [];
  let top = 38;
  let sectionNumber = 0;
  const pageWidth = 595;
  const pageHeight = 842;
  const left = 46;
  const right = 549;
  const contentWidth = right - left;
  const graphite = '0.12 0.15 0.17';
  const muted = '0.39 0.43 0.47';
  const line = '0.86 0.88 0.90';
  const soft = '0.96 0.97 0.975';
  const orange = '0.96 0.48 0.13';
  const green = '0.13 0.51 0.37';
  const red = '0.72 0.23 0.23';

  const addText = (text, x, yTop, options = {}) => {
    const { size = 10, font = 'normal', color = graphite } = options;
    commands.push(`BT /${font === 'bold' ? 'F2' : 'F1'} ${size} Tf ${color} rg ${x} ${(pageHeight - yTop - size).toFixed(1)} Td (${pdfEscape(text)}) Tj ET`);
  };
  const addLine = (x1, y1, x2, y2, color = line, width = 1) => {
    commands.push(`${color} RG ${width} w ${x1} ${(pageHeight - y1).toFixed(1)} m ${x2} ${(pageHeight - y2).toFixed(1)} l S`);
  };
  const addRect = (x, yTop, width, height, fill = soft, stroke = '') => {
    const operation = stroke ? `${fill} rg ${stroke} RG 1 w` : `${fill} rg`;
    commands.push(`${operation} ${x} ${(pageHeight - yTop - height).toFixed(1)} ${width} ${height} re ${stroke ? 'B' : 'f'}`);
  };
  const addWrappedText = (text, x, yTop, width, options = {}) => {
    const size = options.size || 10;
    const lineHeight = options.lineHeight || size * 1.45;
    const maxChars = Math.max(15, Math.floor(width / (size * 0.51)));
    const lines = wrapPdfText(text, maxChars);
    lines.forEach((lineText, index) => addText(lineText, x, yTop + index * lineHeight, options));
    return lines.length * lineHeight;
  };
  const wrappedHeight = (text, width, size = 10, lineHeight = size * 1.45) => {
    const maxChars = Math.max(15, Math.floor(width / (size * 0.51)));
    return wrapPdfText(text, maxChars).length * lineHeight;
  };
  const finishPage = () => {
    pages.push(commands);
    commands = [];
    top = 38;
  };
  const drawPageHeader = (continuation = false) => {
    addRect(0, 0, pageWidth, 92, graphite);
    addRect(0, 88, pageWidth, 4, orange);
    addText('OPERATIVE STEUERUNG', left, 25, { size: 9, font: 'bold', color: orange });
    addText(continuation ? 'MEETINGPROTOKOLL · FORTSETZUNG' : 'MEETINGPROTOKOLL', left, 47, { size: 18, font: 'bold', color: '1 1 1' });
    addText(formatDateShort(meeting.date), 470, 29, { size: 9, font: 'bold', color: '1 1 1' });
    addText(`${meeting.startTime} - ${meeting.endTime}`, 470, 48, { size: 9, color: '0.78 0.81 0.83' });
    top = 118;
  };
  const ensureSpace = height => {
    if (top + height <= 786) return;
    finishPage();
    drawPageHeader(true);
  };
  const sectionHeading = title => {
    ensureSpace(90);
    sectionNumber += 1;
    addText(String(sectionNumber).padStart(2, '0'), left, top, { size: 9, font: 'bold', color: orange });
    addText(title.toUpperCase(), left + 28, top - 2, { size: 13, font: 'bold', color: graphite });
    addLine(left, top + 21, right, top + 21, line, 1);
    top += 38;
  };
  const emptyNote = text => {
    ensureSpace(42);
    addRect(left, top, contentWidth, 34, soft);
    addText(text, left + 12, top + 11, { size: 9, color: muted });
    top += 46;
  };
  const infoCard = (text, accent = orange) => {
    const height = wrappedHeight(text, contentWidth - 28, 10, 15);
    ensureSpace(height + 26);
    addRect(left, top, contentWidth, height + 18, soft);
    addRect(left, top, 3, height + 18, accent);
    addWrappedText(text, left + 14, top + 9, contentWidth - 28, { size: 10, lineHeight: 15 });
    top += height + 28;
  };

  drawPageHeader();
  const titleHeight = addWrappedText(meeting.title, left, top, contentWidth, { size: 23, lineHeight: 28, font: 'bold', color: graphite });
  top += titleHeight + 14;
  const participantText = participants.join(', ') || 'nicht hinterlegt';
  const participantHeight = wrappedHeight(participantText, contentWidth - 32, 9.5, 12);
  const metaHeight = 105 + participantHeight;
  addRect(left, top, contentWidth, metaHeight, soft, line);
  addText('BEREICH', left + 16, top + 16, { size: 7.5, font: 'bold', color: orange });
  addWrappedText(meeting.area || 'nicht hinterlegt', left + 16, top + 29, 218, { size: 9.5, lineHeight: 12 });
  addText('STATUS', left + 266, top + 16, { size: 7.5, font: 'bold', color: orange });
  addWrappedText(meetingStatusLabel(meeting.status), left + 266, top + 29, 218, { size: 9.5, lineHeight: 12 });
  addText('MODERATION', left + 16, top + 56, { size: 7.5, font: 'bold', color: orange });
  addWrappedText(moderator, left + 16, top + 69, contentWidth - 32, { size: 9.5, lineHeight: 12 });
  addText('TEILNEHMER', left + 16, top + 92, { size: 7.5, font: 'bold', color: orange });
  addWrappedText(participantText, left + 16, top + 105, contentWidth - 32, { size: 9.5, lineHeight: 12 });
  top += metaHeight + 24;

  sectionHeading('Tagesordnung');
  const agenda = meeting.agenda || [];
  if (!agenda.length) emptyNote('Keine Tagesordnungspunkte dokumentiert.');
  agenda.forEach((item, index) => {
    const rowHeight = Math.max(30, wrapPdfText(item.title, 76).length * 14 + 12);
    ensureSpace(rowHeight + 7);
    addRect(left, top, contentWidth, rowHeight, item.done ? '0.94 0.98 0.96' : soft, line);
    addText(String(index + 1).padStart(2, '0'), left + 12, top + 10, { size: 9, font: 'bold', color: item.done ? green : orange });
    addWrappedText(item.title, left + 44, top + 9, contentWidth - 142, { size: 10, lineHeight: 14, font: 'bold' });
    addText(item.done ? 'BESPROCHEN' : 'OFFEN', right - 76, top + 10, { size: 7.5, font: 'bold', color: item.done ? green : muted });
    top += rowHeight + 7;
  });

  sectionHeading('Entscheidungen');
  if (!(meeting.decisions || []).length) emptyNote('Keine Entscheidungen dokumentiert.');
  (meeting.decisions || []).forEach(item => infoCard(item.title, green));

  sectionHeading('Risiken und offene Punkte');
  if (!(meeting.issues || []).length) emptyNote('Keine Risiken oder offenen Punkte dokumentiert.');
  (meeting.issues || []).forEach(item => infoCard(item.title, red));

  sectionHeading('Maßnahmen');
  if (!(meeting.tasks || []).length) {
    emptyNote('Keine Maßnahmen dokumentiert.');
  } else {
    ensureSpace(30);
    addRect(left, top, contentWidth, 25, graphite);
    addText('MAßNAHME', left + 10, top + 8, { size: 7.5, font: 'bold', color: '1 1 1' });
    addText('VERANTWORTLICH', 344, top + 8, { size: 7.5, font: 'bold', color: '1 1 1' });
    addText('FÄLLIG / PRIORITÄT', 452, top + 8, { size: 7.5, font: 'bold', color: '1 1 1' });
    top += 25;
    (meeting.tasks || []).forEach((item, index) => {
      const titleLines = wrapPdfText(item.title, 50);
      const height = Math.max(36, titleLines.length * 13 + 14);
      ensureSpace(height + 1);
      addRect(left, top, contentWidth, height, index % 2 ? '1 1 1' : soft);
      addWrappedText(item.title, left + 10, top + 9, 278, { size: 9, lineHeight: 13, font: 'bold' });
      addWrappedText(item.owner || 'offen', 344, top + 9, 98, { size: 8.5, lineHeight: 12 });
      addText(formatDateShort(item.due), 452, top + 8, { size: 8.5, font: 'bold' });
      addText(priorityLabel(item.priority).toUpperCase(), 452, top + 21, { size: 7.5, color: item.priority === 'hoch' ? red : orange });
      addLine(left, top + height, right, top + height, line, .7);
      top += height;
    });
    top += 12;
  }

  sectionHeading('Notizen');
  const noteParagraphs = String(meeting.notes || '').split('\n').map(text => text.trim()).filter(Boolean);
  if (!noteParagraphs.length) emptyNote('Keine ergänzenden Notizen dokumentiert.');
  noteParagraphs.forEach(paragraph => {
    const height = wrappedHeight(paragraph, contentWidth, 10, 16);
    ensureSpace(height + 12);
    addWrappedText(paragraph, left, top, contentWidth, { size: 10, lineHeight: 16 });
    top += height + 12;
  });
  finishPage();

  const documentTitle = `Meetingprotokoll · ${meeting.title}`;
  const objects = [null, '', '', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>', '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>'];
  const pageRefs = [];
  pages.forEach((pageCommands, pageIndex) => {
    const pageRef = objects.length;
    const contentRef = pageRef + 1;
    pageRefs.push(`${pageRef} 0 R`);
    const footer = [
      `0.86 0.88 0.90 RG 0.7 w ${left} 36 m ${right} 36 l S`,
      `BT /F1 7.5 Tf ${muted} rg ${left} 20 Td (${pdfEscape(documentTitle)}) Tj ET`,
      `BT /F1 7.5 Tf ${muted} rg 505 20 Td (${pdfEscape(`${pageIndex + 1} / ${pages.length}`)}) Tj ET`,
    ];
    const content = [...pageCommands, ...footer].join('\n');
    objects.push(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentRef} 0 R >>`);
    objects.push(`<< /Length ${latin1Bytes(content).length} >>\nstream\n${content}\nendstream`);
  });
  objects[1] = '<< /Type /Catalog /Pages 2 0 R >>';
  objects[2] = `<< /Type /Pages /Kids [${pageRefs.join(' ')}] /Count ${pages.length} >>`;
  return buildPdfBytes(objects);
}

function wrapPdfText(value, maxLength) {
  const words = pdfText(value).split(/\s+/).filter(Boolean);
  if (!words.length) return [''];
  const lines = [];
  let current = '';
  words.forEach(word => {
    if (!current || `${current} ${word}`.length <= maxLength) current = current ? `${current} ${word}` : word;
    else {
      lines.push(current);
      current = word;
    }
  });
  if (current) lines.push(current);
  return lines;
}

function pdfText(value) {
  return String(value ?? '')
    .replace(/[–—]/g, '-')
    .replace(/[“”„]/g, '"')
    .replace(/[’‘]/g, "'")
    .replace(/→/g, '->')
    .replace(/[^\x20-\xFF]/g, '');
}

function pdfEscape(value) {
  return pdfText(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function latin1Bytes(value) {
  return Uint8Array.from(String(value), character => character.charCodeAt(0) & 255);
}

function buildPdfBytes(objects) {
  let binary = '%PDF-1.4\n%\xE2\xE3\xCF\xD3\n';
  const offsets = [0];
  for (let index = 1; index < objects.length; index += 1) {
    offsets[index] = binary.length;
    binary += `${index} 0 obj\n${objects[index]}\nendobj\n`;
  }
  const xref = binary.length;
  binary += `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let index = 1; index < objects.length; index += 1) binary += `${String(offsets[index]).padStart(10, '0')} 00000 n \n`;
  binary += `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xref}\n%%EOF`;
  return latin1Bytes(binary);
}

function downloadBlob(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

function buildMeetingProtocolHtml(meeting, participantNames, mode) {
  const moderator = getEmployees().find(person => person.id === meeting.moderatorId)?.name || 'nicht hinterlegt';
  return `<!doctype html><html lang="de"><head><meta charset="utf-8"><title>${escapeHtml(meeting.title)} – Protokoll</title><style>@page{size:A4;margin:15mm}*{box-sizing:border-box}body{font-family:Arial,sans-serif;color:#202428;margin:0;line-height:1.45;font-size:11pt}header{border-bottom:4px solid #f47a20;padding-bottom:16px;margin-bottom:22px}.eyebrow{color:#f47a20;font-weight:700;text-transform:uppercase;letter-spacing:.08em;font-size:9pt}h1{font-size:25pt;margin:5px 0 8px}h2{font-size:15pt;margin-top:25px;border-bottom:1px solid #dce1e5;padding-bottom:6px}.meta{color:#65707a;display:grid;grid-template-columns:repeat(2,1fr);gap:5px 25px}.box{padding:10px 13px;background:#f5f6f7;margin:7px 0;border-left:4px solid #f47a20;break-inside:avoid}.done{color:#21835f}.open{color:#b73b3b}.task{display:grid;grid-template-columns:1.6fr 1fr .7fr;gap:10px;padding:8px 0;border-bottom:1px solid #e5e8eb}li{margin:5px 0}.footer{margin-top:35px;padding-top:12px;border-top:1px solid #dce1e5;color:#68717a;font-size:9pt}@media print{button{display:none}}</style></head><body><header><span class="eyebrow">Operative Steuerung · Standortleitung</span><h1>${escapeHtml(meeting.title)}</h1><div class="meta"><span><strong>Bereich:</strong> ${escapeHtml(meeting.area)}</span><span><strong>Status:</strong> ${meetingStatusLabel(meeting.status)}</span><span><strong>Datum:</strong> ${formatDateShort(meeting.date)}</span><span><strong>Zeit:</strong> ${meeting.startTime}–${meeting.endTime}</span><span><strong>Moderation:</strong> ${escapeHtml(moderator)}</span><span><strong>Teilnehmer:</strong> ${participantNames.map(escapeHtml).join(', ') || 'nicht hinterlegt'}</span></div></header><h2>Tagesordnung</h2><ol>${meeting.agenda.map(item => `<li class="${item.done ? 'done' : ''}">${escapeHtml(item.title)}${item.done ? ' – besprochen' : ''}</li>`).join('') || '<li>Keine Tagesordnungspunkte dokumentiert.</li>'}</ol><h2>Entscheidungen</h2>${meeting.decisions.map(item => `<div class="box">${escapeHtml(item.title)}</div>`).join('') || '<p>Keine Entscheidungen dokumentiert.</p>'}<h2>Risiken und offene Punkte</h2>${meeting.issues.map(item => `<div class="box open">${escapeHtml(item.title)}</div>`).join('') || '<p>Keine offenen Punkte dokumentiert.</p>'}<h2>Maßnahmen</h2>${meeting.tasks.map(item => `<div class="task"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.owner)}</span><span>${formatDateShort(item.due)}</span></div>`).join('') || '<p>Keine Maßnahmen dokumentiert.</p>'}<h2>Notizen</h2><p>${escapeHtml(meeting.notes || 'Keine Notizen').replace(/\n/g, '<br>')}</p><div class="footer">Erstellt am ${new Intl.DateTimeFormat('de-DE', { dateStyle: 'long', timeStyle: 'short' }).format(new Date())} · Operative Steuerung Standortleitung</div><script>window.onload=()=>window.print()<\/script></body></html>`;
}

function getMeetings() {
  state.meetings ||= [];
  return state.meetings;
}

function getActiveMeeting() {
  return getMeetings().find(meeting => meeting.id === state.activeMeetingId);
}

function meetingStatusLabel(status) {
  return ({ planned: 'Geplant', running: 'Läuft', done: 'Abgeschlossen' })[status] || status;
}

function renderInventory() {
  const inventory = getInventory();
  const avgDays = inventory.length ? Math.round(inventory.reduce((sum, vehicle) => sum + Number(vehicle.days || 0), 0) / inventory.length) : 0;
  const medianDays = inventory.length ? median(inventory.map(vehicle => Number(vehicle.days || 0)).filter(Number.isFinite)) : 0;
  const totalMargin = inventory.reduce((sum, vehicle) => sum + Number(vehicle.margin || 0), 0);
  els.inventoryKpis.innerHTML = [
    ['Bestand', inventory.length, 'Fahrzeuge'],
    ['>90 Tage', inventory.filter(vehicle => Number(vehicle.days || 0) > 90).length, 'Bestandsalter-Risiko'],
    ['Ø Bestandsalter', avgDays, 'Bestand'],
    ['Median Bestandsalter', medianDays, 'robustes Bestandsalter'],
    ['Bildstandard offen', inventory.filter(vehicle => Number(vehicle.photos || 0) < 15).length, 'unter 15 Bilder'],
    ['Nicht online', inventory.filter(vehicle => !vehicle.online).length, 'Internetstatus'],
    ['DB offen', formatCurrency(totalMargin), 'kalkuliert'],
  ].map(kpiCard).join('');
  els.inventoryTable.innerHTML = inventory.length ? `
    <table class="data-table">
      <thead><tr><th>Nr.</th><th>Fahrzeug</th><th>Standtage</th><th>Preis</th><th>Markt</th><th>Bilder</th><th>Online</th><th>Status</th></tr></thead>
      <tbody>${inventory.map(vehicle => `
        <tr>
          <td>${vehicle.stock}</td>
          <td>${vehicle.vehicle}</td>
          <td><strong class="${vehicle.days >= 60 ? 'value-danger' : ''}">${vehicle.days}</strong></td>
          <td>${formatCurrency(vehicle.price)}</td>
          <td>${Number(vehicle.marketDelta || 0) > 0 ? '+' : ''}${vehicle.marketDelta}%</td>
          <td>${vehicle.photos}</td>
          <td>${vehicle.online ? 'ja' : 'nein'}</td>
          <td><span class="status-pill ${vehicle.status === 'ok' ? 'done' : ''}">${vehicle.status}</span></td>
        </tr>
      `).join('')}</tbody>
    </table>
  ` : '<p class="empty-note">Noch keine Bestandsdaten geladen.</p>';
}

function renderWorkshop() {
  const workshop = getWorkshop();
  const totals = workshop.reduce((sum, item) => {
    sum.capacity += Number(item.capacity || 0);
    sum.soldHours += Number(item.soldHours || 0);
    sum.openOrders += Number(item.openOrders || 0);
    sum.missingParts += Number(item.missingParts || 0);
    sum.completions += Number(item.completions || 0);
    sum.complaints += Number(item.complaints || 0);
    return sum;
  }, { capacity: 0, soldHours: 0, openOrders: 0, missingParts: 0, completions: 0, complaints: 0 });
  const utilization = totals.capacity ? Math.round((totals.soldHours / totals.capacity) * 100) : 0;
  els.workshopKpis.innerHTML = [
    ['Auslastung', `${utilization}%`, 'verkaufte Stunden'],
    ['Produktivstunden', totals.soldHours, `${totals.capacity} Kapazität`],
    ['Auftragsbestand', totals.openOrders, 'offene Aufträge'],
    ['Fehlteile', totals.missingParts, 'blockieren Ablauf'],
    ['Fertigstellungen', totals.completions, 'heute geplant'],
    ['Reklamationen', totals.complaints, 'aktiv'],
  ].map(kpiCard).join('');
  els.workshopBoard.innerHTML = workshop.map(item => {
    const pct = item.capacity ? Math.round((Number(item.soldHours || 0) / Number(item.capacity || 0)) * 100) : 0;
    return `
      <article class="ops-row">
        <div>
          <strong>${item.area}</strong>
          <span>${item.openOrders} offene Aufträge · ${item.missingParts} Fehlteile · ${item.completions} Fertigstellungen</span>
        </div>
        <div class="metric-stack">
          <span>${pct}% Auslastung</span>
          <div class="goal-bar"><div><i style="width:${Math.min(pct, 120)}%"></i></div></div>
        </div>
      </article>
    `;
  }).join('');
  const risks = getWorkshopRisks(workshop);
  els.workshopRisks.innerHTML = risks.length ? risks.map(item => `
    <div class="compact-item">
      <strong>${item.title}</strong>
      <span class="task-meta">${item.note}</span>
    </div>
  `).join('') : '<div class="compact-item"><span class="task-meta">Keine Engpässe</span></div>';
}

function renderReport() {
  const escalations = getEscalations();
  els.escalationCount.textContent = `${escalations.length} kritisch`;
  els.escalationList.innerHTML = escalations.length ? escalations.map(item => `
    <article class="ops-row priority-hoch">
      <div>
        <strong>${item.title}</strong>
        <span>${item.area} · ${item.note}</span>
      </div>
      <button class="ghost-button" type="button" data-escalation-action="${item.title}">Maßnahme</button>
    </article>
  `).join('') : '<p class="empty-note">Keine automatischen Eskalationen.</p>';
  els.weeklyReport.value = buildWeeklyReport(escalations);
}

function renderPrint() {
  const reports = [
    ['executive', 'Bericht für GL', 'Executive Summary mit Top-10-KPIs und Grafiken'],
    ['monthly', 'Monatsbericht', 'Alle Bereiche mit Ist bis heute, Zeitquote und Monatszielquote'],
    ['weekly', 'Wochenbericht', 'Management-Review mit KPIs, Maßnahmen und Eskalationen'],
    ['kpi', 'KPI-Bericht', 'Kennzahlen je Bereich mit Ist-Werten'],
    ['inventory', 'Bestandsbericht', 'Langsteher, Online-Status, Bilder und DB'],
    ['workshop', 'Werkstattbericht', 'Auslastung, Fehlteile, Auftragsbestand und Reklamationen'],
    ['actions', 'Maßnahmenbericht', 'Offene Punkte mit Verantwortlichen und Fristen'],
    ['meetings', 'Meeting-Übersicht', 'Besprechungen, Teilnehmer, Entscheidungen und Aufgaben'],
  ];
  els.printCatalog.innerHTML = reports.map(([type, title, description]) => `
    <article class="report-card">
      <div>
        <span class="tagline">PDF</span>
        <h2>${title}</h2>
        <p>${description}</p>
      </div>
      <button class="primary-button" type="button" data-print-report="${type}">PDF erstellen</button>
    </article>
  `).join('');
}

function renderExport() {
  const datasets = [
    ['actions', 'Maßnahmen', 'Status, Verantwortliche, Priorität, Frist'],
    ['meetings', 'Meetings', 'Besprechungen, Teilnehmer, Status und Ergebnisse'],
    ['inventory', 'Fahrzeugbestand', 'Fahrzeugdaten, Standtage, Preise, Status'],
    ['workshop', 'Werkstatt', 'Kapazität, Aufträge, Fehlteile, Fertigstellungen'],
    ['kpis', 'KPIs', 'Aktuelle Kennzahlen der Standortsteuerung'],
    ['sales', 'Verkaufsmeldungen', 'Mobile Verkäufermeldungen und Abschlüsse'],
  ];
  els.exportCatalog.innerHTML = datasets.map(([type, title, description]) => `
    <article class="report-card">
      <div>
        <span class="tagline">Export</span>
        <h2>${title}</h2>
        <p>${description}</p>
      </div>
      <div class="export-actions">
        <button class="ghost-button" type="button" data-export="${type}" data-format="pdf">PDF</button>
        <button class="ghost-button" type="button" data-export="${type}" data-format="csv">CSV</button>
        <button class="ghost-button" type="button" data-export="${type}" data-format="xls">XLS</button>
      </div>
    </article>
  `).join('');
}

function renderDataAdmin() {
  const team = getEmployees();
  const salesPeople = getSalesTeam();
  renderKpiDataControls();
  renderImportPreview();
  els.targetMonth.value ||= todayKey.slice(0, 7);
  els.resultDate.value ||= todayKey;
  const sellerOptions = salesPeople.map(person => `<option value="${person.name}">${person.name}</option>`).join('');
  els.targetSeller.innerHTML = sellerOptions;
  els.resultSeller.innerHTML = sellerOptions;
  els.dataStatus.textContent = state.scriptUrl ? 'schreibt in Google Tabelle' : 'lokaler Fallback aktiv';
  const sales = getSalesState();
  els.dataPreview.innerHTML = [
    ['Mitarbeiter', team.length],
    ['Verkäufer', salesPeople.length],
    ['Verkaufsmeldungen', (sales.entries || []).length],
    ['Zielwerte', Object.keys(sales.targets || {}).length || salesPeople.length],
    ['KPI-Werte', Object.keys(state.sheetKpis || {}).filter(key => !key.startsWith('Ziel ')).length],
    ['Fahrzeugbestand', getInventory().length],
    ['Werkstattbereiche', getWorkshop().length],
  ].map(([label, value]) => `
    <div class="compact-item">
      <strong>${label}</strong>
      <span class="task-meta">${value}</span>
    </div>
  `).join('');
}

function renderKpiInput() {
  if (!els.kpiInputTabs) return;
  const values = getKpiActualValues();
  els.kpiInputStatus.textContent = state.scriptUrl ? 'Google-Tabelle aktiv' : 'lokal, Google-URL fehlt';
  els.kpiInputTabs.innerHTML = kpiGroups.map(([area]) => `
    <button class="${area === activeKpiInputArea ? 'active' : ''}" type="button" data-kpi-area="${area}">
      ${area}
    </button>
  `).join('');
  const group = kpiGroups.find(([area]) => area === activeKpiInputArea) || kpiGroups[0];
  els.kpiBulkFields.innerHTML = group[1].map(metric => `
    <article class="kpi-input-row">
      <div>
        <strong>${metric}</strong>
        <span>${group[0]}</span>
      </div>
      <label>Ist
        <input type="text" data-kpi-actual="${metric}" value="${escapeHtml(kpiValue(group[0], metric, 'actual', values) || '')}" placeholder="Ist-Wert" />
      </label>
      <label>Monatsziel
        <input type="text" data-kpi-target="${metric}" value="${escapeHtml(kpiValue(group[0], metric, 'target') || '')}" placeholder="Ziel" />
      </label>
      <label>Einheit
        <select data-kpi-unit="${metric}">
          <option value="">Zahl</option>
          <option value="€">Euro</option>
          <option value="%">Prozent</option>
        </select>
      </label>
    </article>
  `).join('');
  els.kpiInputSummary.innerHTML = kpiGroups.map(([area, metrics]) => {
    const filled = metrics.filter(metric => kpiValue(area, metric, 'actual', values) !== '').length;
    return `
      <div class="compact-item">
        <strong>${area}</strong>
        <span class="task-meta">${filled}/${metrics.length} Werte</span>
      </div>
    `;
  }).join('');
}

function renderKpiDataControls() {
  els.kpiDataArea.innerHTML = kpiGroups.map(([area]) => `<option value="${area}">${area}</option>`).join('');
  renderKpiMetricOptions();
  renderKpiDataTable();
}

function renderKpiMetricOptions() {
  const area = els.kpiDataArea.value || kpiGroups[0][0];
  const group = kpiGroups.find(([label]) => label === area) || kpiGroups[0];
  els.kpiDataMetric.innerHTML = group[1].map(metric => `<option value="${metric}">${metric}</option>`).join('');
}

function renderKpiDataTable() {
  const values = getKpiActualValues();
  const rows = kpiGroups.flatMap(([area, metrics]) => metrics.map(metric => ({
    area,
    metric,
    actual: kpiValue(area, metric, 'actual', values) || '–',
    target: kpiValue(area, metric, 'target') || '–',
  })));
  els.kpiDataTable.innerHTML = `
    <table class="data-table">
      <thead><tr><th>Bereich</th><th>Kennzahl</th><th>Ist aktuell</th><th>Monatsziel</th></tr></thead>
      <tbody>${rows.map(row => `
        <tr>
          <td>${row.area}</td>
          <td>${row.metric}</td>
          <td><strong class="kpi-actual-value">${row.actual}</strong></td>
          <td>${row.target}</td>
        </tr>
      `).join('')}</tbody>
    </table>
  `;
}

function renderTeam() {
  const team = getEmployees();
  els.teamArea.value ||= 'Verkauf';
  els.teamRole.value ||= 'Mitarbeiter';
  els.teamSummary.textContent = `${team.length} Mitarbeiter · ${new Set(team.map(employee => employee.area)).size} Abteilungen`;
  const areaCounts = team.reduce((counts, employee) => {
    counts[employee.area] = (counts[employee.area] || 0) + 1;
    return counts;
  }, {});
  els.teamOverview.innerHTML = Object.entries(areaCounts).map(([area, count]) => `
    <div class="compact-item">
      <strong>${area}</strong>
      <span class="task-meta">${count} Mitarbeiter</span>
    </div>
  `).join('');
  const grouped = team.reduce((groups, employee) => {
    groups[employee.area] ||= [];
    groups[employee.area].push(employee);
    return groups;
  }, {});
  document.querySelector('#team-board').innerHTML = Object.entries(grouped).map(([area, people]) => `
    <article class="plan-card team-card">
      <div class="team-card-header">
        <div>
          <span class="tagline">${area}</span>
          <h2>${people.length === 1 ? people[0].name : `${people.length} Mitarbeiter`}</h2>
        </div>
        <span class="team-count">${people.length}</span>
      </div>
      <div class="employee-list">
        ${people.map(employee => `
          <div class="employee-row">
            <div>
              <strong>${employee.firstName && employee.lastName ? `${employee.lastName}, ${employee.firstName}` : employee.name}</strong>
              <span>${employee.role || 'Funktion ergänzen'}</span>
              ${Number(employee.monthlyContactTarget || employee.monthlySalesTarget || 0) ? `<small>${Number(employee.monthlyContactTarget || 0)} Kontakte · ${Number(employee.monthlySalesTarget || 0)} Verkäufe/Monat</small>` : ''}
            </div>
            <div class="employee-actions">
              <button class="ghost-button mini-button" type="button" data-edit-employee="${employee.id}">Bearbeiten</button>
              <button class="ghost-button mini-button danger-button" type="button" data-delete-employee="${employee.id}">Löschen</button>
            </div>
          </div>
        `).join('')}
      </div>
    </article>
  `).join('');
}

function renderGoogle() {
  els.googleAccount.value = state.googleAccount || 'operionix@gmail.com';
  els.scriptUrl.value = state.scriptUrl || '';
  els.tasklistId.value = state.tasklistId || '@default';
  els.meetingDriveBackup.checked = Boolean(state.meetingDriveBackup);
  els.backupSetupStatus.innerHTML = state.backupFolderUrl
    ? `Automatische Sicherung aktiv · <a href="${escapeHtml(state.backupFolderUrl)}" target="_blank" rel="noopener">Drive-Ordner öffnen</a>`
    : 'Noch nicht über diese App eingerichtet';
  els.themePicker.innerHTML = appThemes.map(theme => `
    <label class="theme-card ${theme.id === (state.theme || 'orange') ? 'active' : ''}">
      <input type="radio" name="app-theme" value="${theme.id}" ${theme.id === (state.theme || 'orange') ? 'checked' : ''} />
      <span class="theme-swatch" style="--theme-accent: ${theme.accent}; --theme-soft: ${theme.soft}; --theme-bg: ${theme.bg}; --theme-ink: ${theme.ink}">
        <i></i><i></i><i></i>
      </span>
      <strong>${theme.label}</strong>
    </label>
  `).join('');
  els.googleStatus.textContent = state.scriptUrl ? `${state.googleAccount || 'Google'} verbunden` : `${state.googleAccount || 'operionix@gmail.com'} vorbereitet`;
  els.calendarList.innerHTML = listOrEmpty(state.calendarEvents, 'Keine Termine geladen');
  els.taskList.innerHTML = listOrEmpty(state.tasks, 'Keine To-dos geladen');
}

async function setupAutomaticGoogleBackup() {
  if (!validateGoogleScriptUrl()) return;
  els.setupBackupButton.disabled = true;
  els.backupSetupStatus.textContent = 'Automatische Sicherung wird eingerichtet ...';
  try {
    const data = await fetchGoogleJson(state.scriptUrl, googlePostOptions({ action: 'backup-setup' }));
    state.backupFolderUrl = data.backupFolderUrl || '';
    state.backupConfiguredAt = new Date().toISOString();
    saveState();
    els.backupSetupStatus.innerHTML = state.backupFolderUrl
      ? `Automatische Sicherung aktiv · <a href="${escapeHtml(state.backupFolderUrl)}" target="_blank" rel="noopener">Drive-Ordner öffnen</a>`
      : 'Automatische Sicherung aktiv';
    toast(data.message || 'Automatische Sicherung wurde eingerichtet.');
  } catch (error) {
    els.backupSetupStatus.textContent = `Einrichtung fehlgeschlagen: ${googleConnectionErrorMessage(error)}`;
    toast('Automatische Sicherung konnte noch nicht eingerichtet werden.');
  } finally {
    els.setupBackupButton.disabled = false;
  }
}

function bindEvents() {
  els.nav.addEventListener('click', event => {
    const toggle = event.target.closest('[data-group-toggle]');
    if (toggle) {
      const group = toggle.closest('[data-nav-group]');
      document.querySelectorAll('[data-nav-group]').forEach(item => item.classList.remove('open'));
      group?.classList.add('open');
      return;
    }
    const button = event.target.closest('[data-view]');
    if (!button) return;
    switchView(button.dataset.view, button.dataset.label);
  });
  document.querySelector('#home-view')?.addEventListener('click', event => {
    const button = event.target.closest('[data-view]');
    if (!button) return;
    switchView(button.dataset.view, button.dataset.label);
  });
  els.timeline.addEventListener('click', event => {
    const button = event.target.closest('[data-block]');
    if (!button) return;
    activeBlockId = button.dataset.block;
    renderDaily();
  });
  els.checklist.addEventListener('change', event => {
    const input = event.target.closest('[data-check]');
    if (!input) return;
    getDayState().checks[input.dataset.check] = input.checked;
    saveState();
    renderDaily();
    renderKpis();
  });
  els.note.addEventListener('input', () => {
    getDayState().note = els.note.value;
    saveState();
  });
  document.querySelector('#reset-day-button').addEventListener('click', () => {
    state.days[todayKey] = { checks: {}, note: '' };
    saveState();
    renderDaily();
    renderKpis();
  });
  document.querySelector('#settings-form').addEventListener('submit', event => {
    event.preventDefault();
    state.googleAccount = els.googleAccount.value.trim() || 'operionix@gmail.com';
    state.scriptUrl = els.scriptUrl.value.trim();
    state.tasklistId = els.tasklistId.value.trim() || '@default';
    state.meetingDriveBackup = Boolean(els.meetingDriveBackup.checked);
    state.theme = new FormData(event.currentTarget).get('app-theme') || state.theme || 'orange';
    applyTheme(state.theme);
    saveState();
    renderGoogle();
    renderHome();
    toast('Google-Einstellungen gespeichert.');
  });
  els.themePicker.addEventListener('change', event => {
    const input = event.target.closest('input[name="app-theme"]');
    if (!input) return;
    state.theme = input.value;
    applyTheme(state.theme);
    saveState();
    renderGoogle();
    renderHome();
  });
  els.setupBackupButton.addEventListener('click', setupAutomaticGoogleBackup);
  document.querySelector('#sync-button').addEventListener('click', syncGoogle);
  els.syncSalesButton.addEventListener('click', syncSalesData);
  els.actionForm.addEventListener('submit', addAction);
  els.actionList.addEventListener('click', handleActionClick);
  els.meetingForm.addEventListener('submit', addMeeting);
  els.meetingTemplate.addEventListener('change', applyMeetingTemplate);
  els.meetingList.addEventListener('click', handleMeetingListClick);
  els.meetingDetail.addEventListener('click', handleMeetingDetailClick);
  els.meetingDetail.addEventListener('input', handleMeetingDetailInput);
  els.meetingDetail.addEventListener('change', handleMeetingDetailInput);
  els.meetingTemplateBoard.addEventListener('click', handleMeetingTemplateClick);
  els.meetingArchiveList.addEventListener('click', handleMeetingArchiveClick);
  [els.meetingArchiveSearch, els.meetingArchiveStatus, els.meetingArchiveArea, els.meetingArchiveFrom, els.meetingArchiveTo].forEach(control => {
    control.addEventListener(control === els.meetingArchiveSearch ? 'input' : 'change', renderMeetingArchive);
  });
  document.querySelector('#meeting-archive-reset').addEventListener('click', () => {
    els.meetingArchiveSearch.value = '';
    els.meetingArchiveStatus.value = '';
    els.meetingArchiveArea.value = '';
    els.meetingArchiveFrom.value = '';
    els.meetingArchiveTo.value = '';
    renderMeetingArchive();
  });
  els.escalationList.addEventListener('click', handleEscalationClick);
  document.querySelector('#refresh-report-button').addEventListener('click', renderReport);
  els.printCatalog.addEventListener('click', handlePrintClick);
  els.exportCatalog.addEventListener('click', handleExportClick);
  els.teamForm.addEventListener('submit', handleTeamSubmit);
  els.teamCancelEdit.addEventListener('click', resetTeamForm);
  document.querySelector('#team-board').addEventListener('click', handleTeamBoardClick);
  els.dataTabs.addEventListener('click', handleDataTabClick);
  els.employeeForm.addEventListener('submit', handleEmployeeSubmit);
  els.targetForm.addEventListener('submit', handleTargetSubmit);
  els.kpiDataForm.addEventListener('submit', handleKpiDataSubmit);
  els.kpiDataArea.addEventListener('change', renderKpiMetricOptions);
  els.kpiInputTabs.addEventListener('click', handleKpiInputTabClick);
  els.kpiBulkForm.addEventListener('submit', handleKpiBulkSubmit);
  els.resultForm.addEventListener('submit', handleResultSubmit);
  els.employeeCsv.addEventListener('change', event => handleCsvUpload(event, 'employees'));
  els.targetCsv.addEventListener('change', event => handleCsvUpload(event, 'targets'));
  els.kpiCsv.addEventListener('change', event => handleCsvUpload(event, 'kpis'));
  els.importFile.addEventListener('change', handleImportFile);
  els.importType.addEventListener('change', resetImportDraft);
  els.importApply.addEventListener('click', applyImportDraft);
  els.boardForm.addEventListener('submit', addBoardTodo);
  els.todoBoard.addEventListener('click', handleBoardClick);
  els.todoBoard.addEventListener('dragstart', handleBoardDragStart);
  els.todoBoard.addEventListener('dragover', handleBoardDragOver);
  els.todoBoard.addEventListener('drop', handleBoardDrop);
  document.querySelector('#add-calendar-button').addEventListener('click', () => createGoogleItem('calendar'));
  document.querySelector('#add-task-button').addEventListener('click', () => createGoogleItem('task'));
  window.addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    deferredPrompt = event;
    els.installButton.hidden = false;
  });
  els.installButton.addEventListener('click', async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    await deferredPrompt.userChoice;
    deferredPrompt = null;
    els.installButton.hidden = true;
  });
  window.addEventListener('hashchange', handleStreamDeckRoute);
}

function addAction(event) {
  event.preventDefault();
  const title = els.actionTitle.value.trim();
  if (!title) return;
  state.actions ||= [];
  state.actions.unshift({
    id: crypto.randomUUID?.() || `action-${Date.now()}`,
    title,
    owner: els.actionOwner.value || getEmployees()[0]?.name || 'Standortleitung',
    due: els.actionDue.value,
    priority: els.actionPriority.value,
    status: 'open',
    createdAt: new Date().toISOString(),
  });
  els.actionForm.reset();
  els.actionPriority.value = 'mittel';
  saveState();
  renderActions();
  renderReport();
}

function handleActionClick(event) {
  const statusButton = event.target.closest('[data-action-status]');
  if (statusButton) {
    const action = getActions().find(item => item.id === statusButton.dataset.actionStatus);
    if (!action) return;
    action.status = statusButton.dataset.status;
    if (action.meetingId) {
      const meetingTask = getMeetings().find(meeting => meeting.id === action.meetingId)?.tasks?.find(task => task.id === action.id);
      if (meetingTask) meetingTask.status = action.status;
    }
    saveState();
    renderActions();
    renderMeetings();
    renderReport();
    return;
  }
  const deleteButton = event.target.closest('[data-action-delete]');
  if (!deleteButton) return;
  const deletedAction = getActions().find(item => item.id === deleteButton.dataset.actionDelete);
  state.actions = getActions().filter(item => item.id !== deleteButton.dataset.actionDelete);
  if (deletedAction?.meetingId) {
    const meeting = getMeetings().find(item => item.id === deletedAction.meetingId);
    if (meeting) meeting.tasks = (meeting.tasks || []).filter(task => task.id !== deletedAction.id);
  }
  saveState();
  renderActions();
  renderMeetings();
  renderReport();
}

function handleEscalationClick(event) {
  const button = event.target.closest('[data-escalation-action]');
  if (!button) return;
  state.actions ||= [];
  state.actions.unshift({
    id: crypto.randomUUID?.() || `action-${Date.now()}`,
    title: button.dataset.escalationAction,
    owner: 'Serviceleitung',
    due: formatDateKey(nextBusinessDay(addDays(new Date(), 1))),
    priority: 'hoch',
    status: 'open',
    createdAt: new Date().toISOString(),
  });
  saveState();
  renderActions();
  renderReport();
  toast('Eskalation als Maßnahme angelegt.');
}

function handlePrintClick(event) {
  const button = event.target.closest('[data-print-report]');
  if (!button) return;
  event.preventDefault();
  event.stopPropagation();
  openPrintReport(button.dataset.printReport);
}

function handleExportClick(event) {
  const button = event.target.closest('[data-export]');
  if (!button) return;
  event.preventDefault();
  const type = button.dataset.export;
  const format = button.dataset.format;
  if (format === 'pdf') {
    openPrintReport(type);
    return;
  }
  const dataset = getExportDataset(type);
  if (format === 'csv') downloadText(`${dataset.filename}.csv`, toCsv(dataset.headers, dataset.rows), 'text/csv;charset=utf-8');
  if (format === 'xls') downloadText(`${dataset.filename}.xls`, toXls(dataset.title, dataset.headers, dataset.rows), 'application/vnd.ms-excel;charset=utf-8');
}

function handleDataTabClick(event) {
  const button = event.target.closest('[data-data-tab]');
  if (!button) return;
  document.querySelectorAll('[data-data-tab]').forEach(item => item.classList.toggle('active', item === button));
  document.querySelectorAll('.data-pane').forEach(pane => pane.classList.toggle('active', pane.id === `data-pane-${button.dataset.dataTab}`));
}

async function handleTeamSubmit(event) {
  event.preventDefault();
  const firstName = els.teamFirstName.value.trim();
  const lastName = els.teamLastName.value.trim();
  const editId = els.teamEditId.value.trim();
  const employee = {
    id: editId || slugify(`${firstName}-${lastName}`),
    firstName,
    lastName,
    name: `${firstName} ${lastName}`.trim(),
    area: els.teamArea.value.trim() || 'Verwaltung',
    role: els.teamRole.value.trim() || 'Mitarbeiter',
    function: els.teamRole.value.trim() || 'Mitarbeiter',
    monthlyContactTarget: Number(els.teamContactTarget.value || 0),
    monthlySalesTarget: Number(els.teamSalesTarget.value || 0),
    active: true,
  };
  if (!employee.firstName || !employee.lastName) return;
  upsertLocalEmployee(employee);
  const target = employee.area === 'Verkauf' && (employee.monthlyContactTarget || employee.monthlySalesTarget)
    ? {
        month: todayKey.slice(0, 7),
        seller: employee.name,
        contactTarget: employee.monthlyContactTarget,
        salesTarget: employee.monthlySalesTarget,
      }
    : null;
  if (target) upsertLocalTarget(target);
  await pushDataRows('employees', [employee]);
  if (target) await pushDataRows('targets', [target]);
  resetTeamForm(employee.area, employee.role);
  refreshAfterDataChange(editId ? 'Mitarbeiter aktualisiert.' : 'Mitarbeiter im Team gespeichert.');
}

function handleTeamBoardClick(event) {
  const deleteButton = event.target.closest('[data-delete-employee]');
  if (deleteButton) {
    deactivateEmployee(deleteButton.dataset.deleteEmployee);
    return;
  }
  const editButton = event.target.closest('[data-edit-employee]');
  if (!editButton) return;
  const employee = getEmployees().find(item => item.id === editButton.dataset.editEmployee);
  if (!employee) return;
  els.teamEditId.value = employee.id;
  els.teamArea.value = employee.area || 'Verkauf';
  els.teamLastName.value = employee.lastName || splitEmployeeName(employee.name).lastName;
  els.teamFirstName.value = employee.firstName || splitEmployeeName(employee.name).firstName;
  els.teamRole.value = employee.function || employee.role || 'Mitarbeiter';
  els.teamContactTarget.value = employee.monthlyContactTarget || '';
  els.teamSalesTarget.value = employee.monthlySalesTarget || '';
  els.teamSubmitButton.textContent = 'Änderungen speichern';
  els.teamCancelEdit.hidden = false;
  els.teamForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

async function deactivateEmployee(employeeId) {
  const employee = getAllEmployees().find(item => item.id === employeeId);
  if (!employee) return;
  const confirmed = window.confirm(`${employee.name || 'Mitarbeiter'} aus der App ausblenden? Der Datensatz bleibt in Google Sheets deaktiviert erhalten.`);
  if (!confirmed) return;
  const inactiveEmployee = { ...employee, active: false, deactivatedAt: new Date().toISOString() };
  upsertLocalEmployee(inactiveEmployee);
  await pushDataRows('employees', [inactiveEmployee]);
  if (els.teamEditId.value === employeeId) resetTeamForm(employee.area || 'Verkauf', employee.role || 'Mitarbeiter');
  refreshAfterDataChange('Mitarbeiter wurde deaktiviert und aus der App ausgeblendet.');
}

function resetTeamForm(area = 'Verkauf', role = 'Mitarbeiter') {
  els.teamForm.reset();
  els.teamEditId.value = '';
  els.teamArea.value = area;
  els.teamRole.value = role;
  els.teamSubmitButton.textContent = 'Mitarbeiter speichern';
  els.teamCancelEdit.hidden = true;
}

async function handleEmployeeSubmit(event) {
  event.preventDefault();
  const parsedName = splitEmployeeName(els.employeeName.value);
  const employee = {
    id: slugify(els.employeeName.value),
    firstName: parsedName.firstName,
    lastName: parsedName.lastName,
    name: els.employeeName.value.trim(),
    area: els.employeeArea.value.trim() || 'Verkauf',
    role: els.employeeRole.value.trim() || 'Mitarbeiter',
    monthlyContactTarget: Number(els.employeeContactTarget.value || 0),
    monthlySalesTarget: Number(els.employeeSalesTarget.value || 0),
    active: true,
  };
  if (!employee.name) return;
  upsertLocalEmployee(employee);
  await pushDataRows('employees', [employee]);
  els.employeeForm.reset();
  els.employeeArea.value = 'Verkauf';
  els.employeeRole.value = 'Verkäufer';
  refreshAfterDataChange('Mitarbeiter gespeichert.');
}

async function handleTargetSubmit(event) {
  event.preventDefault();
  const target = {
    month: els.targetMonth.value || todayKey.slice(0, 7),
    seller: els.targetSeller.value,
    contactTarget: Number(els.targetContacts.value || 0),
    salesTarget: Number(els.targetSales.value || 0),
  };
  upsertLocalTarget(target);
  await pushDataRows('targets', [target]);
  els.targetForm.reset();
  refreshAfterDataChange('Zielwert gespeichert.');
}

async function handleKpiDataSubmit(event) {
  event.preventDefault();
  const metric = els.kpiDataMetric.value;
  const area = els.kpiDataArea.value;
  const unit = els.kpiDataUnit.value;
  const actual = formatKpiInputValue(els.kpiDataActual.value, unit);
  const target = formatKpiInputValue(els.kpiDataTarget.value, unit);
  const rows = [];
  state.sheetKpis ||= {};
  if (actual !== '') {
    const key = kpiStorageKey(area, metric, 'actual');
    state.sheetKpis[key] = actual;
    rows.push({ key, value: actual, area, metric, kind: 'actual' });
  }
  if (target !== '') {
    const key = kpiStorageKey(area, metric, 'target');
    state.sheetKpis[key] = target;
    rows.push({ key, value: target, area, metric, kind: 'target' });
  }
  if (!rows.length) return;
  await pushDataRows('kpis', rows);
  els.kpiDataForm.reset();
  renderKpiMetricOptions();
  refreshAfterDataChange('KPI-Wert gespeichert.');
}

function handleKpiInputTabClick(event) {
  const button = event.target.closest('[data-kpi-area]');
  if (!button) return;
  activeKpiInputArea = button.dataset.kpiArea;
  renderKpiInput();
}

async function handleKpiBulkSubmit(event) {
  event.preventDefault();
  const group = kpiGroups.find(([area]) => area === activeKpiInputArea) || kpiGroups[0];
  const rows = [];
  state.sheetKpis ||= {};
  group[1].forEach(metric => {
    const unit = kpiBulkField('unit', metric)?.value || '';
    const actual = formatKpiInputValue(kpiBulkField('actual', metric)?.value, unit);
    const target = formatKpiInputValue(kpiBulkField('target', metric)?.value, unit);
    if (actual !== '') {
      const key = kpiStorageKey(group[0], metric, 'actual');
      state.sheetKpis[key] = actual;
      rows.push({ key, value: actual, area: group[0], metric, kind: 'actual' });
    }
    if (target !== '') {
      const key = kpiStorageKey(group[0], metric, 'target');
      state.sheetKpis[key] = target;
      rows.push({ key, value: target, area: group[0], metric, kind: 'target' });
    }
  });
  if (!rows.length) {
    toast('Bitte mindestens einen KPI-Wert eintragen.');
    return;
  }
  await pushDataRows('kpis', rows);
  refreshAfterDataChange(`${group[0]} gespeichert.`);
}

function kpiBulkField(type, metric) {
  return [...els.kpiBulkForm.querySelectorAll(`[data-kpi-${type}]`)].find(input => input.dataset[`kpi${capitalize(type)}`] === metric);
}

function capitalize(value) {
  return String(value || '').charAt(0).toUpperCase() + String(value || '').slice(1);
}

async function handleResultSubmit(event) {
  event.preventDefault();
  const result = {
    date: els.resultDate.value || todayKey,
    seller: els.resultSeller.value,
    contacts: Number(els.resultContacts.value || 0),
    leads: Number(els.resultLeads.value || 0),
    offers: Number(els.resultOffers.value || 0),
    testDrives: Number(els.resultTestDrives.value || 0),
    sales: Number(els.resultSales.value || 0),
    source: 'Manuelle Datenpflege',
    id: `manual-${Date.now()}`,
  };
  upsertLocalResult(result);
  await pushDataRows('results', [result]);
  els.resultForm.reset();
  refreshAfterDataChange('Ergebnisdaten eingetragen.');
}

async function handleCsvUpload(event, type) {
  const file = event.target.files?.[0];
  if (!file) return;
  const rows = parseCsv(await file.text());
  const normalized = type === 'employees'
    ? rows.map(csvEmployee).filter(Boolean)
    : type === 'kpis'
      ? rows.flatMap(csvKpiRows).filter(Boolean)
      : rows.map(csvTarget).filter(Boolean);
  if (type === 'employees') normalized.forEach(upsertLocalEmployee);
  if (type === 'targets') normalized.forEach(upsertLocalTarget);
  if (type === 'kpis') normalized.forEach(row => {
    state.sheetKpis ||= {};
    state.sheetKpis[row.key] = row.value;
  });
  await pushDataRows(type, normalized);
  event.target.value = '';
  refreshAfterDataChange(`${normalized.length} Datensätze importiert.`);
}

async function handleImportFile(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  const type = els.importType.value || 'kpis';
  try {
    const rawRows = await readImportFile(file);
    const rows = normalizeImportRows(type, rawRows);
    importDraft = { type, rows, rawRows, fileName: file.name };
    renderImportPreview();
    toast(`${rows.length} passende Zeilen erkannt. Bitte Import übernehmen.`);
  } catch (error) {
    importDraft = { type: '', rows: [], rawRows: [], fileName: '' };
    renderImportPreview();
    toast(`Import konnte nicht gelesen werden: ${error.message}`);
  }
}

function resetImportDraft() {
  importDraft = { type: '', rows: [], rawRows: [], fileName: '' };
  if (els.importFile) els.importFile.value = '';
  renderImportPreview();
}

async function applyImportDraft() {
  if (!importDraft.rows.length) {
    toast('Bitte zuerst eine Datei auswählen.');
    return;
  }
  applyImportedRows(importDraft.type, importDraft.rows);
  await pushDataRows(importDraft.type, importDraft.rows);
  const count = importDraft.rows.length;
  importDraft = { type: '', rows: [], rawRows: [], fileName: '' };
  if (els.importFile) els.importFile.value = '';
  refreshAfterDataChange(`${count} Importzeilen übernommen.`);
}

async function readImportFile(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith('.csv') || name.endsWith('.txt')) return parseCsv(await file.text());
  if (!name.endsWith('.xlsx') && !name.endsWith('.xls')) throw new Error('Bitte CSV, XLS oder XLSX verwenden.');
  if (!window.XLSX) throw new Error('Excel-Import ist offline nicht geladen. CSV funktioniert immer.');
  const workbook = window.XLSX.read(await file.arrayBuffer(), { type: 'array', cellDates: true });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = window.XLSX.utils.sheet_to_json(sheet, { defval: '' });
  return rows.map(row => Object.entries(row).reduce((normalized, [key, value]) => {
    normalized[normalizeLocalHeader(key)] = value;
    return normalized;
  }, {}));
}

function normalizeImportRows(type, rawRows) {
  if (type === 'employees') return rawRows.map(csvEmployee).filter(Boolean);
  if (type === 'targets') return rawRows.map(csvTarget).filter(Boolean);
  if (type === 'results') return rawRows.map(csvResult).filter(Boolean);
  if (type === 'inventory') return normalizeInventory(rawRows);
  if (type === 'workshop') return normalizeWorkshop(rawRows);
  return rawRows.flatMap(csvKpiRows).filter(Boolean);
}

function applyImportedRows(type, rows) {
  if (type === 'employees') rows.forEach(upsertLocalEmployee);
  if (type === 'targets') rows.forEach(upsertLocalTarget);
  if (type === 'results') rows.forEach(upsertLocalResult);
  if (type === 'inventory') upsertInventoryRows(rows);
  if (type === 'workshop') upsertWorkshopRows(rows);
  if (type === 'kpis') {
    state.sheetKpis ||= {};
    rows.forEach(row => {
      state.sheetKpis[row.key] = row.value;
    });
  }
}

function renderImportPreview() {
  if (!els.importPreview || !els.importApply) return;
  els.importApply.disabled = !importDraft.rows.length;
  if (!importDraft.rows.length) {
    els.importPreview.innerHTML = `
      <div class="empty-state">
        <strong>Noch keine Datei ausgewählt</strong>
        <span>Unterstützt werden CSV, XLS und XLSX. Die erste Tabellenmappe wird importiert.</span>
      </div>
    `;
    return;
  }
  const rows = importDraft.rows.slice(0, 12);
  const headers = Object.keys(rows[0] || {}).slice(0, 8);
  els.importPreview.innerHTML = `
    <table class="data-table">
      <thead>
        <tr><th colspan="${headers.length}">${escapeHtml(importDraft.fileName)} · ${importDraft.rows.length} Zeilen erkannt</th></tr>
        <tr>${headers.map(header => `<th>${escapeHtml(importHeaderLabel(header))}</th>`).join('')}</tr>
      </thead>
      <tbody>${rows.map(row => `
        <tr>${headers.map(header => `<td>${escapeHtml(row[header] ?? '')}</td>`).join('')}</tr>
      `).join('')}</tbody>
    </table>
  `;
}

function importHeaderLabel(header) {
  return String(header || '')
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, letter => letter.toUpperCase());
}

async function pushDataRows(type, rows) {
  if (!state.scriptUrl || !rows.length) return;
  try {
    if (!validateGoogleScriptUrl()) return;
    const data = await fetchGoogleJson(state.scriptUrl, googlePostOptions({ action: 'data-upsert', type, rows }));
    applyBackupPayload(data);
  } catch (error) {
    toast(`Lokal gespeichert. Google-Tabelle nicht erreicht: ${googleConnectionErrorMessage(error)}`);
  }
}

function applyBackupPayload(data) {
  if (data.employees && data.employees.length) state.customEmployees = normalizeEmployees(data.employees);
  if (data.records || data.targets) {
    const normalizedSales = normalizeSalesPayload(data);
    if (normalizedSales.entries.length || Object.keys(normalizedSales.targets).length) {
      state.salesData = normalizedSales;
      state.salesData.lastSync = new Date().toISOString();
    }
  }
  if (data.kpis) state.sheetKpis = normalizeSheetKpis(data.kpis);
  if (data.inventory) state.inventory = normalizeInventory(data.inventory);
  if (data.workshop) state.workshop = normalizeWorkshop(data.workshop);
  if (data.actions) state.actions = mergeActions(getActions(), normalizeActions(data.actions));
}

function refreshAfterDataChange(message) {
  saveState();
  renderDataAdmin();
  renderKpiInput();
  renderTeam();
  renderActions();
  renderMeetings();
  renderMonitor();
  renderSales();
  renderKpis();
  renderHome();
  renderDaily();
  renderReport();
  renderPrint();
  renderExport();
  toast(message);
}

function addBoardTodo(event) {
  event.preventDefault();
  const title = els.boardTitle.value.trim();
  if (!title) return;
  state.boardTodos ||= [];
  state.boardTodos.unshift({
    id: crypto.randomUUID?.() || `todo-${Date.now()}`,
    title,
    priority: els.boardPriority.value,
    due: els.boardDue.value,
    status: 'open',
    updatedAt: new Date().toISOString(),
  });
  els.boardForm.reset();
  els.boardPriority.value = 'mittel';
  saveState();
  renderBoard();
  scheduleBoardGoogleSync();
}

function handleBoardClick(event) {
  const statusButton = event.target.closest('[data-board-status]');
  if (statusButton) {
    moveBoardTodo(statusButton.dataset.boardStatus, statusButton.dataset.status);
    return;
  }
  const button = event.target.closest('[data-board-move]');
  if (button) {
    moveBoardTodo(button.dataset.boardMove, Number(button.dataset.direction));
    return;
  }
  const deleteButton = event.target.closest('[data-board-delete]');
  if (!deleteButton) return;
  state.deletedBoardTodoIds ||= [];
  state.deletedBoardTodoIds.push(deleteButton.dataset.boardDelete);
  state.boardTodos = getBoardTodos().filter(todo => todo.id !== deleteButton.dataset.boardDelete);
  saveState();
  renderBoard();
  scheduleBoardGoogleSync();
}

function moveBoardTodo(id, directionOrStatus) {
  const todos = getBoardTodos();
  const todo = todos.find(item => item.id === id);
  if (!todo) return;
  if (typeof directionOrStatus === 'string') {
    todo.status = directionOrStatus;
  } else {
    const currentIndex = boardColumns.findIndex(([status]) => status === todo.status);
    todo.status = boardColumns[Math.max(0, Math.min(boardColumns.length - 1, currentIndex + directionOrStatus))][0];
  }
  todo.updatedAt = new Date().toISOString();
  saveState();
  renderBoard();
  scheduleBoardGoogleSync();
}

function handleBoardDragStart(event) {
  const card = event.target.closest('[data-todo-id]');
  if (!card) return;
  event.dataTransfer.setData('text/plain', card.dataset.todoId);
}

function handleBoardDragOver(event) {
  if (event.target.closest('[data-board-column]')) event.preventDefault();
}

function handleBoardDrop(event) {
  const column = event.target.closest('[data-board-column]');
  if (!column) return;
  event.preventDefault();
  const id = event.dataTransfer.getData('text/plain');
  moveBoardTodo(id, column.dataset.boardColumn);
}

async function syncSalesData() {
  ensureTodayIsCurrent({ rerender: true });
  if (!validateGoogleScriptUrl()) return;
  try {
    els.salesSourceLabel.textContent = 'Lade aus der App-Google-Tabelle...';
    const url = new URL(state.scriptUrl);
    url.searchParams.set('date', todayKey);
    url.searchParams.set('tasklist', state.tasklistId || '@default');
    const payload = await fetchGoogleJson(url.toString());
    applyBackupPayload(payload);
    state.salesData ||= normalizeSalesPayload(payload);
    state.salesData.lastSync = new Date().toISOString();
    saveState();
    renderDataAdmin();
    renderTeam();
    renderSales();
    renderKpis();
    renderMonitor();
    toast('Verkäuferzahlen aus der App-Google-Tabelle geladen.');
  } catch (error) {
    els.salesSourceLabel.textContent = 'Laden fehlgeschlagen';
    toast(googleConnectionErrorMessage(error));
  }
}

function switchView(id, label, updateRoute = true) {
  document.querySelectorAll('.view').forEach(view => view.classList.toggle('active', view.id === id));
  document.querySelectorAll('.nav-subbutton').forEach(button => button.classList.toggle('active', button.dataset.view === id));
  const compactNav = window.matchMedia('(max-width: 1180px)').matches;
  document.querySelectorAll('[data-nav-group]').forEach(group => {
    const active = Boolean(group.querySelector(`.nav-subbutton[data-view="${id}"]`));
    group.classList.toggle('open', active && !compactNav);
    group.querySelector('.nav-group-button')?.classList.toggle('active', active);
  });
  els.title.textContent = label;
  if (updateRoute) {
    const route = Object.entries(streamDeckRoutes).find(([, item]) => item.view === id && !item.action && !item.focus && !item.block)?.[0];
    if (route && window.location.hash !== `#${route}`) history.replaceState(null, '', `#${route}`);
  }
}

function handleStreamDeckRoute() {
  const routeName = decodeURIComponent(window.location.hash.slice(1)).trim().toLowerCase();
  if (!routeName) return;
  const route = streamDeckRoutes[routeName];
  if (!route) return;
  switchView(route.view, route.label, false);
  if (route.block) {
    activeBlockId = route.block;
    renderDaily();
  }
  if (route.focus) {
    requestAnimationFrame(() => {
      const target = document.querySelector(route.focus);
      target?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      target?.focus();
    });
  }
  if (route.action === 'sync') {
    history.replaceState(null, '', '#heute');
    syncGoogle();
  }
}

function applyTheme(themeId = 'orange') {
  const theme = getCurrentTheme(themeId);
  document.body.dataset.theme = theme.id;
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme.bg);
}

function getCurrentTheme(themeId = state.theme || 'orange') {
  return appThemes.find(item => item.id === themeId) || appThemes[0];
}

function validateGoogleScriptUrl() {
  if (!state.scriptUrl) {
    switchView('google-view', 'Google');
    toast('Bitte zuerst die Google Apps Script URL speichern.');
    return false;
  }
  try {
    const url = new URL(state.scriptUrl);
    const validScriptUrl = url.protocol === 'https:'
      && url.hostname === 'script.google.com'
      && url.pathname.includes('/macros/s/')
      && url.pathname.endsWith('/exec');
    if (!validScriptUrl) throw new Error('ungueltige-url');
    return true;
  } catch (error) {
    switchView('google-view', 'Google');
    toast('Die gespeicherte Google-URL wirkt nicht wie eine Apps-Script-Web-App. Bitte die /exec-Adresse neu speichern.');
    return false;
  }
}

function googleConnectionErrorMessage(error) {
  const raw = String(error?.message || error || '').trim();
  if (/zu viele Kalender|Kalendereinträge erstellt oder gelöscht|too many calendar|calendar entries/i.test(raw)) {
    return 'Google hat den Kalender-Sync vorübergehend gebremst, weil zu viele Kalendereinträge in kurzer Zeit erstellt oder gelöscht wurden. Bitte 30-60 Minuten warten; die App schreibt Routine-Termine künftig deutlich sparsamer.';
  }
  if (/failed to fetch|load failed|networkerror|cancelled|aborted/i.test(raw)) {
    return 'Google-Verbindung fehlgeschlagen. Bitte Internet prüfen, die App einmal neu laden und in System > Google kontrollieren, ob die Apps-Script-URL mit /exec endet.';
  }
  if (/unexpected token|json/i.test(raw)) {
    return 'Google hat keine lesbare Antwort geliefert. Bitte Apps Script neu bereitstellen und die /exec-Web-App-URL erneut in der App speichern.';
  }
  return raw || 'Google-Sync fehlgeschlagen.';
}

async function fetchGoogleJson(target, options = {}) {
  try {
    const response = await fetch(target, options);
    if (!response.ok) {
      throw new Error(`Google antwortet mit Fehler ${response.status}. Bitte Apps-Script-Bereitstellung und Berechtigungen prüfen.`);
    }
    const payload = await response.json();
    if (payload?.ok === false) {
      throw new Error(payload.error || 'Google hat den Vorgang abgelehnt.');
    }
    return payload;
  } catch (error) {
    throw new Error(googleConnectionErrorMessage(error));
  }
}

function googlePostOptions(payload) {
  return {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
  };
}

async function syncGoogle() {
  ensureTodayIsCurrent({ rerender: true });
  if (!validateGoogleScriptUrl()) return;
  if (googleSyncRunning) {
    toast('Google-Sync läuft bereits.');
    return;
  }
  const lastWrite = Number(state.lastGoogleWriteSyncAt || 0);
  const waitMs = googleWriteSyncCooldownMs - (Date.now() - lastWrite);
  if (lastWrite && waitMs > 0) {
    await loadGoogleSnapshot(`Schreib-Sync geschont. Nur Google-Daten gelesen. Voller Sync wieder in ${Math.ceil(waitMs / 60000)} Min.`);
    return;
  }
  try {
    googleSyncRunning = true;
    document.querySelector('#sync-button').disabled = true;
    els.googleStatus.textContent = 'Synchronisiere in beide Richtungen...';
    const data = await fetchGoogleJson(state.scriptUrl, googlePostOptions(buildSyncPayload()));
    applyRemoteSync(data);
    state.deletedBoardTodoIds = [];
    state.lastGoogleWriteSyncAt = Date.now();
    saveState();
    renderGoogle();
    renderHome();
    renderDaily();
    renderKpis();
    renderMonitor();
    renderActions();
    renderInventory();
    renderWorkshop();
    renderReport();
    toast('Google Calendar und Google Tasks sind in beide Richtungen synchronisiert.');
  } catch (error) {
    els.googleStatus.textContent = 'Sync-Fehler';
    toast(googleConnectionErrorMessage(error));
  } finally {
    googleSyncRunning = false;
    document.querySelector('#sync-button').disabled = false;
  }
}

async function loadGoogleSnapshot(message = 'Google-Daten gelesen, ohne Kalender neu zu schreiben.') {
  ensureTodayIsCurrent({ rerender: true });
  if (!validateGoogleScriptUrl()) return;
  try {
    googleSyncRunning = true;
    document.querySelector('#sync-button').disabled = true;
    els.googleStatus.textContent = 'Lese Google-Daten...';
    const url = new URL(state.scriptUrl);
    url.searchParams.set('date', todayKey);
    url.searchParams.set('tasklist', state.tasklistId || '@default');
    const data = await fetchGoogleJson(url.toString());
    applyRemoteSync(data);
    saveState();
    renderGoogle();
    renderHome();
    renderDaily();
    renderKpis();
    renderMonitor();
    renderActions();
    renderInventory();
    renderWorkshop();
    renderReport();
    toast(message);
  } catch (error) {
    els.googleStatus.textContent = 'Sync-Fehler';
    toast(googleConnectionErrorMessage(error));
  } finally {
    googleSyncRunning = false;
    document.querySelector('#sync-button').disabled = false;
  }
}

async function createGoogleItem(type) {
  ensureTodayIsCurrent({ rerender: true });
  const title = els.quickTitle.value.trim();
  if (!title) {
    toast('Bitte zuerst einen Titel eintragen.');
    return;
  }
  if (!validateGoogleScriptUrl()) return;
  const payload = {
    action: type,
    title,
    date: todayKey,
    startTime: els.quickStart.value || '09:00',
    endTime: els.quickEnd.value || addMinutesToTime(els.quickStart.value || '09:00', 30),
    tasklist: state.tasklistId || '@default',
  };
  showQuickSaveFeedback(type === 'calendar' ? 'Termin wird gespeichert ...' : 'Aufgabe wird gespeichert ...', 'pending');
  const optimisticCalendarId = type === 'calendar' ? `quick-calendar-${Date.now()}` : '';
  if (optimisticCalendarId) {
    state.calendarEvents = [
      ...(state.calendarEvents || []),
      {
        id: optimisticCalendarId,
        title,
        time: payload.startTime,
        endTime: payload.endTime,
        managed: false,
        source: 'quick-calendar',
      },
    ];
    saveState();
    renderHome();
    renderDaily();
    renderGoogle();
  }
  try {
    const data = await fetchGoogleJson(state.scriptUrl, googlePostOptions(payload));
    els.quickTitle.value = '';
    applyRemoteSync(data);
    saveState();
    renderHome();
    renderDaily();
    renderGoogle();
    renderBoard();
    const successMessage = type === 'calendar'
      ? 'Termin gespeichert und im Tagesplan ergänzt.'
      : 'Aufgabe erfolgreich gespeichert.';
    showQuickSaveFeedback(successMessage, 'success');
    toast(successMessage);
  } catch (error) {
    if (optimisticCalendarId) {
      state.calendarEvents = (state.calendarEvents || []).filter(event => event.id !== optimisticCalendarId);
      saveState();
      renderHome();
      renderDaily();
      renderGoogle();
    }
    const message = googleConnectionErrorMessage(error);
    showQuickSaveFeedback(`Speichern nicht möglich: ${message}`, 'error');
    toast(message);
  }
}

let quickSaveFeedbackTimer;

function showQuickSaveFeedback(message, status = 'success') {
  if (!els.quickSaveFeedback) return;
  clearTimeout(quickSaveFeedbackTimer);
  els.quickSaveFeedback.className = `quick-save-feedback visible ${status}`;
  els.quickSaveFeedback.textContent = message;
  if (status === 'pending') return;
  quickSaveFeedbackTimer = setTimeout(() => {
    els.quickSaveFeedback.className = 'quick-save-feedback';
    els.quickSaveFeedback.textContent = '';
  }, 4200);
}

function buildSyncPayload() {
  const day = getDayState();
  const businessDay = isBusinessDay(new Date(`${todayKey}T12:00:00`));
  return {
    action: 'sync',
    date: todayKey,
    businessDay,
    tasklist: state.tasklistId || '@default',
    note: day.note || '',
    employees: getEmployees(),
    boardTodos: getBoardTodos(),
    actions: getActions(),
    meetings: getMeetings(),
    deletedBoardTodoIds: state.deletedBoardTodoIds || [],
    calendarWrite: false,
    cleanup: false,
    periodicPlans: buildPeriodicPlans(),
    blocks: businessDay ? dailyBlocks.map(block => ({
      id: block.id,
      title: block.title,
      time: block.time,
      meta: block.meta,
      done: block.checks.every((_, index) => day.checks[checkKey(block.id, index)]),
    })) : [],
  };
}

function buildPeriodicPlans() {
  const now = new Date();
  const monday = startOfWeek(now);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const quarterStart = new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1);
  const halfyearStart = new Date(now.getFullYear(), now.getMonth() < 6 ? 0 : 6, 1);
  const yearStart = new Date(now.getFullYear(), 0, 1);
  const scheduled = [
    ...plans.week.map((item, index) => planPayload('week', item, addDays(monday, index))),
    ...spreadPlansAcrossPeriod('month', plans.month, monthStart, new Date(now.getFullYear(), now.getMonth() + 1, 0)),
    ...spreadPlansAcrossPeriod('quarter', plans.quarter, quarterStart, new Date(quarterStart.getFullYear(), quarterStart.getMonth() + 3, 0)),
    ...spreadPlansAcrossPeriod('halfyear', plans.halfyear, halfyearStart, new Date(halfyearStart.getFullYear(), halfyearStart.getMonth() + 6, 0)),
    ...spreadPlansAcrossPeriod('year', plans.year, yearStart, new Date(now.getFullYear(), 11, 31)),
  ];
  return balancePeriodicWorkload(scheduled);
}

function spreadPlansAcrossPeriod(period, periodPlans, start, end) {
  const businessDays = businessDaysBetween(start, end);
  if (!businessDays.length) return [];
  const padding = period === 'month' ? 0.08 : 0.1;
  return periodPlans.map((item, index) => {
    const ratio = periodPlans.length === 1
      ? 0.5
      : padding + (index / (periodPlans.length - 1)) * (1 - padding * 2);
    const date = businessDays[Math.round((businessDays.length - 1) * ratio)];
    return planPayload(period, item, date, end);
  });
}

function balancePeriodicWorkload(periodicPlans) {
  const workload = new Map();
  return periodicPlans.map(plan => {
    let date = new Date(`${plan.date}T12:00:00`);
    const end = new Date(`${plan.periodEnd || plan.date}T12:00:00`);
    while ((workload.get(formatDateKey(date)) || 0) >= 2 && date < end) {
      date = nextBusinessDay(addDays(date, 1));
    }
    const dateKey = formatDateKey(date);
    workload.set(dateKey, (workload.get(dateKey) || 0) + 1);
    return { ...plan, date: dateKey };
  }).map(({ periodEnd, ...plan }) => plan);
}

function businessDaysBetween(start, end) {
  const days = [];
  let cursor = new Date(start);
  cursor.setHours(12, 0, 0, 0);
  const last = new Date(end);
  last.setHours(12, 0, 0, 0);
  while (cursor <= last) {
    if (isBusinessDay(cursor)) days.push(new Date(cursor));
    cursor = addDays(cursor, 1);
  }
  return days;
}

function planPayload(period, [title, tagline, items], date, periodEnd = date) {
  const originalDate = formatDateKey(date);
  const dueDate = nextBusinessDay(date);
  return {
    id: `${period}-${slugify(title)}`,
    period,
    title,
    tagline,
    date: formatDateKey(dueDate),
    originalDate,
    periodEnd: formatDateKey(periodEnd),
    cycleKey: periodicCycleKey(period, date),
    items: items.map((item, index) => ({ id: `${period}-${slugify(title)}-${index}`, title: item })),
  };
}

function periodicCycleKey(period, date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  if (period === 'week') return `${year}-W${String(weekNumber(date)).padStart(2, '0')}`;
  if (period === 'month') return `${year}-${String(month + 1).padStart(2, '0')}`;
  if (period === 'quarter') return `${year}-Q${Math.floor(month / 3) + 1}`;
  if (period === 'halfyear') return `${year}-H${month < 6 ? 1 : 2}`;
  return String(year);
}

function weekNumber(date) {
  const target = new Date(date);
  target.setHours(12, 0, 0, 0);
  target.setDate(target.getDate() + 3 - ((target.getDay() + 6) % 7));
  const weekOne = new Date(target.getFullYear(), 0, 4, 12);
  return 1 + Math.round(((target - weekOne) / 86400000 - 3 + ((weekOne.getDay() + 6) % 7)) / 7);
}

function applyRemoteSync(data) {
  state.calendarEvents = data.events || [];
  state.tasks = data.tasks || [];
  applyBackupPayload(data);
  if (Array.isArray(data.meetings) && data.meetings.length) state.meetings = mergeMeetingsLatest(getMeetings(), data.meetings);
  if (Array.isArray(data.boardTodos)) {
    const deletedIds = new Set(state.deletedBoardTodoIds || []);
    state.boardTodos = mergeBoardTodosLatest(getBoardTodos(), data.boardTodos).filter(todo => !deletedIds.has(todo.id));
    renderBoard();
  }
  renderMeetings();
  if (!data.checkStates) return;
  state.googleTaskStates = data.checkStates;
  const day = getDayState();
  Object.entries(data.checkStates).forEach(([id, done]) => {
    day.checks[id] = Boolean(done);
  });
}

function mergeMeetingsLatest(localMeetings = [], remoteMeetings = []) {
  const merged = new Map();
  remoteMeetings.forEach(meeting => merged.set(meeting.id, meeting));
  localMeetings.forEach(local => {
    const remote = merged.get(local.id);
    const localTime = Date.parse(local.updatedAt || local.createdAt || '') || 0;
    const remoteTime = Date.parse(remote?.updatedAt || remote?.createdAt || '') || 0;
    if (!remote || localTime >= remoteTime) merged.set(local.id, { ...remote, ...local });
  });
  return [...merged.values()];
}

function mergeBoardTodosLatest(localItems = [], remoteItems = []) {
  const merged = new Map();
  remoteItems.forEach(item => merged.set(item.id, item));
  localItems.forEach(local => {
    const remote = merged.get(local.id);
    if (!remote || boardTodoTimestamp(local) >= boardTodoTimestamp(remote)) merged.set(local.id, local);
  });
  return [...merged.values()];
}

function boardTodoTimestamp(todo) {
  const timestamp = Date.parse(todo?.updatedAt || '');
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function normalizeSalesPayload(payload) {
  const targets = {};
  const currentMonth = todayKey.slice(0, 7);
  (payload.targets || []).forEach(target => {
    if (target.month && target.month !== currentMonth) return;
    targets[String(target.seller || '').trim()] = {
      contactTarget: Number(target.contactTarget || target.monthlyContactTarget || 0),
      salesTarget: Number(target.salesTarget || target.monthlySalesTarget || 0),
    };
  });
  const entriesBySellerAndDay = new Map();
  (payload.records || []).forEach(record => {
    const seller = String(record.seller || '').trim();
    const date = normalizeDate(record.date);
    if (!seller || !date || isPlaceholderSeller(seller)) return;
    entriesBySellerAndDay.set(`${date}|${seller}`, {
      date,
      seller,
      contacts: Number(record.contacts || 0),
      leads: Number(record.leads || 0),
      offers: Number(record.offers || 0),
      testDrives: Number(record.testDrives || 0),
      sales: Number(record.sales || 0),
      receivedAt: record.received_at || record.receivedAt || '',
    });
  });
  return { entries: [...entriesBySellerAndDay.values()], targets, lastSync: '' };
}

function normalizeSheetKpis(rows = []) {
  return rows.reduce((map, row) => {
    const key = String(row.key || row.name || '').trim();
    if (!key) return map;
    map[key] = String(row.value ?? '').trim();
    return map;
  }, {});
}

function normalizeEmployees(rows = []) {
  return rows.map(csvEmployee).filter(Boolean);
}

function normalizeInventory(rows = []) {
  return rows.map((row, index) => ({
    stock: String(row.stock || row.bestand || row.id || `FZ-${index + 1}`).trim(),
    vehicle: String(row.vehicle || row.fahrzeug || row.model || '').trim(),
    days: parseMetricNumber(row.days || row.standtage || row.bestandsalter || 0),
    price: parseMetricNumber(row.price || row.preis || row.kundenpreis || 0),
    marketDelta: parseMetricNumber(row.marketDelta || row.marketdelta || row.markt || row.marktabweichung || 0),
    photos: parseMetricNumber(row.photos || row.bilder || 0),
    online: String(row.online ?? 'true').toLowerCase() !== 'false' && String(row.online ?? 'ja').toLowerCase() !== 'nein',
    margin: parseMetricNumber(row.margin || row.db || row.deckungsbeitrag || 0),
    standzeit0: parseMetricNumber(row.standzeit0 || row.prozessStandzeit0 || row.prozessstandzeit0 || 0),
    standzeit1: parseMetricNumber(row.standzeit1 || row.prozessStandzeit1 || row.prozessstandzeit1 || 0),
    standzeit2: parseMetricNumber(row.standzeit2 || row.prozessStandzeit2 || row.prozessstandzeit2 || 0),
    standzeit3: parseMetricNumber(row.standzeit3 || row.prozessStandzeit3 || row.prozessstandzeit3 || 0),
    status: String(row.status || '').trim() || (parseMetricNumber(row.days || row.standtage || row.bestandsalter || 0) >= 60 ? 'kritisch' : 'ok'),
  })).filter(row => row.vehicle);
}

function normalizeWorkshop(rows = []) {
  return rows.map(row => ({
    area: String(row.area || row.bereich || '').trim(),
    capacity: parseMetricNumber(row.capacity || row.kapazitaet || row.kapazität || row.kapazitaetHeute || 0),
    soldHours: parseMetricNumber(row.soldHours || row.soldhours || row.produktivstunden || row.verkaufteStunden || row.verkauftestunden || 0),
    openOrders: parseMetricNumber(row.openOrders || row.openorders || row.offeneAuftraege || row.offeneAufträge || 0),
    missingParts: parseMetricNumber(row.missingParts || row.missingparts || row.fehlteile || 0),
    completions: parseMetricNumber(row.completions || row.fertigstellungen || 0),
    complaints: parseMetricNumber(row.complaints || row.reklamationen || 0),
  })).filter(row => row.area);
}

function normalizeActions(rows = []) {
  return rows.map((row, index) => ({
    id: String(row.id || `sheet-action-${index + 1}`),
    title: String(row.title || row.massnahme || row.maßnahme || '').trim(),
    owner: String(row.owner || row.verantwortlich || 'Standortleitung').trim(),
    due: normalizeDate(row.due || row.faellig || row.fällig),
    priority: String(row.priority || row.prioritaet || row.priorität || 'mittel').toLowerCase(),
    status: normalizeStatus(row.status),
    source: row.source || 'sheet',
    meetingId: row.meetingId || '',
  })).filter(row => row.title);
}

function mergeActions(localActions, sheetActions) {
  const map = new Map();
  [...sheetActions, ...localActions].forEach(action => map.set(action.id, action));
  return [...map.values()];
}

function getSalesState() {
  return state.salesData || { entries: [], targets: {}, lastSync: '' };
}

function getEmployees() {
  return getAllEmployees().filter(employee => employee.active !== false);
}

function getAllEmployees() {
  return state.customEmployees?.length ? state.customEmployees : employees.map(employee => ({ ...employee, active: true }));
}

function getSalesTeam() {
  return getEmployees().filter(employee => employee.area === 'Verkauf');
}

function upsertLocalEmployee(employee) {
  state.customEmployees ||= [...employees];
  const index = state.customEmployees.findIndex(item => item.id === employee.id || item.name === employee.name);
  if (index >= 0) state.customEmployees[index] = { ...state.customEmployees[index], ...employee };
  else state.customEmployees.push(employee);
}

function upsertLocalTarget(target) {
  state.salesData ||= { entries: [], targets: {}, lastSync: '' };
  if (target.month === todayKey.slice(0, 7)) {
    state.salesData.targets ||= {};
    state.salesData.targets[target.seller] = {
      contactTarget: Number(target.contactTarget || 0),
      salesTarget: Number(target.salesTarget || 0),
    };
  }
}

function upsertLocalResult(result) {
  state.salesData ||= { entries: [], targets: {}, lastSync: '' };
  state.salesData.entries ||= [];
  const index = state.salesData.entries.findIndex(entry => entry.date === result.date && entry.seller === result.seller);
  if (index >= 0) state.salesData.entries[index] = { ...state.salesData.entries[index], ...result };
  else state.salesData.entries.push(result);
  state.salesData.lastSync = new Date().toISOString();
}

function upsertInventoryRows(rows) {
  state.inventory ||= [];
  rows.forEach(row => {
    const index = state.inventory.findIndex(item => item.stock === row.stock);
    if (index >= 0) state.inventory[index] = { ...state.inventory[index], ...row };
    else state.inventory.push(row);
  });
}

function upsertWorkshopRows(rows) {
  state.workshop ||= [];
  rows.forEach(row => {
    const index = state.workshop.findIndex(item => item.area === row.area);
    if (index >= 0) state.workshop[index] = { ...state.workshop[index], ...row };
    else state.workshop.push(row);
  });
}

function parseCsv(text) {
  const lines = String(text || '').split(/\r?\n/).filter(line => line.trim());
  if (!lines.length) return [];
  const separator = lines[0].includes(';') ? ';' : ',';
  const headers = splitCsvLine(lines[0], separator).map(header => normalizeLocalHeader(header));
  return lines.slice(1).map(line => {
    const cells = splitCsvLine(line, separator);
    return headers.reduce((row, header, index) => {
      row[header] = cells[index] || '';
      return row;
    }, {});
  });
}

function splitCsvLine(line, separator) {
  const result = [];
  let current = '';
  let quoted = false;
  for (const char of line) {
    if (char === '"') quoted = !quoted;
    else if (char === separator && !quoted) {
      result.push(current.trim());
      current = '';
    } else current += char;
  }
  result.push(current.trim());
  return result;
}

function normalizeLocalHeader(value) {
  return String(value || '').trim().toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+(.)/g, (_, chr) => chr.toUpperCase());
}

function csvEmployee(row) {
  const firstName = String(row.firstName || row.firstname || row.vorname || '').trim();
  const lastName = String(row.lastName || row.lastname || row.nachname || row.name || '').trim();
  const fullName = firstName && lastName ? `${firstName} ${lastName}` : '';
  const name = String(row.fullName || row.fullname || row.mitarbeiter || row.verkaeufer || row.verkäufer || fullName || row.name || '').trim();
  if (!name) return null;
  const parsedName = splitEmployeeName(name);
  const activeValue = row.active ?? row.aktiv ?? row.status ?? true;
  const inactive = activeValue === false
    || ['false', 'nein', 'inaktiv', 'deaktiviert', '0'].includes(String(activeValue).trim().toLowerCase());
  return {
    id: String(row.id || '').trim() || slugify(name),
    firstName: firstName || parsedName.firstName,
    lastName: lastName && firstName ? lastName : parsedName.lastName,
    name,
    area: String(row.area || row.bereich || 'Verkauf').trim(),
    role: String(row.role || row.rolle || row.funktion || 'Verkäufer').trim(),
    function: String(row.function || row.funktion || row.role || row.rolle || 'Verkäufer').trim(),
    monthlyContactTarget: parseMetricNumber(row.monthlyContactTarget || row.monthlycontacttarget || row.contactTarget || row.contacttarget || row.kontaktziel || row.kontakte || 0),
    monthlySalesTarget: parseMetricNumber(row.monthlySalesTarget || row.monthlysalesTarget || row.monthlysalestarget || row.salesTarget || row.salestarget || row.verkaufsziel || row.abschluesse || row.abschlüsse || 0),
    active: !inactive,
    deactivatedAt: row.deactivatedAt || row.deactivatedat || '',
  };
}

function splitEmployeeName(name) {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return { firstName: '', lastName: '' };
  if (parts.length === 1) return { firstName: parts[0], lastName: '' };
  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts.at(-1),
  };
}

function csvTarget(row) {
  const seller = String(row.seller || row.verkaeufer || row.verkäufer || row.mitarbeiter || '').trim();
  if (!seller) return null;
  return {
    month: normalizeMonth(row.month || row.monat) || todayKey.slice(0, 7),
    seller,
    contactTarget: parseMetricNumber(row.contactTarget || row.contacttarget || row.kontaktziel || row.kontakte || 0),
    salesTarget: parseMetricNumber(row.salesTarget || row.salestarget || row.verkaufsziel || row.abschluesse || row.abschlüsse || 0),
  };
}

function csvResult(row) {
  const seller = String(row.seller || row.verkaeufer || row.verkäufer || row.mitarbeiter || '').trim();
  const date = normalizeDate(row.date || row.datum || row.tag) || todayKey;
  if (!seller || isPlaceholderSeller(seller)) return null;
  return {
    date,
    seller,
    contacts: parseMetricNumber(row.contacts || row.kontakte || row.kontaktzahl || 0),
    leads: parseMetricNumber(row.leads || row.anfragen || 0),
    offers: parseMetricNumber(row.offers || row.angebote || 0),
    testDrives: parseMetricNumber(row.testDrives || row.testdrives || row.probefahrten || 0),
    sales: parseMetricNumber(row.sales || row.verkaeufe || row.verkäufe || row.abschluesse || row.abschlüsse || 0),
    source: row.source || row.quelle || 'Import',
    id: row.id || row.meldungsId || row.meldungsid || `import-${date}-${slugify(seller)}`,
  };
}

function csvKpiRows(row) {
  const metric = String(row.metric || row.kennzahl || row.key || '').trim();
  if (!metric) return [];
  const area = String(row.area || row.bereich || '').trim();
  const unit = String(row.unit || row.einheit || '').trim();
  const rows = [];
  const actual = row.value ?? row.ist ?? row.actual ?? row.aktuell;
  const target = row.ziel ?? row.target ?? row.monatsziel;
  if (actual !== undefined && String(actual).trim() !== '') {
    rows.push({ key: row.key || kpiStorageKey(area, metric, 'actual'), value: formatKpiInputValue(actual, unit), area, metric, kind: 'actual' });
  }
  if (target !== undefined && String(target).trim() !== '') {
    rows.push({ key: kpiStorageKey(area, metric, 'target'), value: formatKpiInputValue(target, unit), area, metric, kind: 'target' });
  }
  return rows;
}

function formatKpiInputValue(value, unit = '') {
  const text = String(value ?? '').trim();
  if (!text) return '';
  if (unit && !text.includes(unit)) return `${text} ${unit}`;
  return text;
}

function normalizeMonth(value) {
  const text = String(value || '').trim();
  if (/^\d{4}-\d{2}$/.test(text)) return text;
  const date = normalizeDate(text);
  return date ? date.slice(0, 7) : '';
}

function getActions() {
  state.actions ||= [];
  return state.actions;
}

function getInventory() {
  return state.inventory?.length ? state.inventory : seedInventory;
}

function getWorkshop() {
  return state.workshop?.length ? state.workshop : seedWorkshop;
}

function getBoardTodos() {
  state.boardTodos ||= [];
  return state.boardTodos;
}

function scheduleBoardGoogleSync() {
  if (!state.scriptUrl) return;
  clearTimeout(boardSyncTimer);
  boardSyncTimer = setTimeout(() => {
    syncBoardGoogle();
  }, 700);
}

async function syncBoardGoogle() {
  if (!state.scriptUrl || googleSyncRunning) return;
  try {
    ensureTodayIsCurrent({ rerender: true });
    if (!validateGoogleScriptUrl()) return;
    googleSyncRunning = true;
    els.googleStatus.textContent = 'To-dos werden abgeglichen...';
    const data = await fetchGoogleJson(state.scriptUrl, googlePostOptions({
      action: 'board-sync',
      tasklist: state.tasklistId || '@default',
      boardTodos: getBoardTodos(),
      deletedBoardTodoIds: state.deletedBoardTodoIds || [],
    }));
    state.boardTodos = mergeBoardTodosLatest(getBoardTodos(), data.boardTodos || []);
    state.deletedBoardTodoIds = [];
    saveState();
    renderBoard();
    renderGoogle();
    toast('To-dos nach letzter Änderung synchronisiert.');
  } catch (error) {
    els.googleStatus.textContent = 'To-do-Sync ausstehend';
    toast(`To-do bleibt lokal gespeichert: ${googleConnectionErrorMessage(error)}`);
  } finally {
    googleSyncRunning = false;
  }
}

function aggregateSales(entries) {
  return entries.reduce((totals, entry) => {
    totals.contacts += Number(entry.contacts || 0);
    totals.leads += Number(entry.leads || 0);
    totals.offers += Number(entry.offers || 0);
    totals.testDrives += Number(entry.testDrives || 0);
    totals.sales += Number(entry.sales || 0);
    return totals;
  }, { contacts: 0, leads: 0, offers: 0, testDrives: 0, sales: 0 });
}

function getKpiActualValues() {
  const sales = getSalesState();
  const entries = sales.entries || [];
  const inventory = getInventory();
  const workshop = getWorkshop();
  const salesTeam = getSalesTeam();
  const workshopTotals = workshop.reduce((sum, item) => {
    sum.capacity += Number(item.capacity || 0);
    sum.soldHours += Number(item.soldHours || 0);
    sum.openOrders += Number(item.openOrders || 0);
    sum.missingParts += Number(item.missingParts || 0);
    sum.complaints += Number(item.complaints || 0);
    return sum;
  }, { capacity: 0, soldHours: 0, openOrders: 0, missingParts: 0, complaints: 0 });
  const monthEntries = getSalesReportPeriod(entries).entries;
  const monthTotals = aggregateSales(monthEntries);
  const leadToClose = monthTotals.leads ? `${Math.round((monthTotals.sales / monthTotals.leads) * 100)}%` : '0%';
  const leadToOffer = monthTotals.leads ? `${Math.round((monthTotals.offers / monthTotals.leads) * 100)}%` : '0%';
  const testDriveQuote = monthTotals.offers ? `${Math.round((monthTotals.testDrives / monthTotals.offers) * 100)}%` : '0%';
  const day = getDayState();
  const totalChecks = dailyBlocks.reduce((sum, block) => sum + block.checks.length, 0);
  const doneChecks = Object.values(day.checks).filter(Boolean).length;
  const inventoryDays = inventory.map(vehicle => Number(vehicle.days || 0)).filter(Number.isFinite);
  const inventoryCount = inventory.length;
  const inventoryOnline = inventory.filter(vehicle => vehicle.online).length;
  const inventoryWithoutOnline = inventoryCount - inventoryOnline;
  const inventoryWithPrice = inventory.filter(vehicle => Number(vehicle.price || vehicle.customerPrice || vehicle.kundenpreis || 0) > 0).length;
  const inventoryWithoutPrice = inventoryCount - inventoryWithPrice;
  const inventoryWithAnyPhotos = inventory.filter(vehicle => Number(vehicle.photos || vehicle.bilder || 0) > 0).length;
  const inventoryWithoutPhotos = inventoryCount - inventoryWithAnyPhotos;
  const inventoryWithStandardPhotos = inventory.filter(vehicle => Number(vehicle.photos || vehicle.bilder || 0) >= 15).length;
  const inventoryReady = inventory.filter(vehicle => ['ok', 'verkaufsfertig', 'online'].includes(String(vehicle.status || '').toLowerCase())).length;
  const inventoryNotReady = inventoryCount - inventoryReady;
  const standzeit0Days = numericInventoryValues(inventory, 'standzeit0');
  const standzeit1Days = numericInventoryValues(inventory, 'standzeit1');
  const standzeit2Days = numericInventoryValues(inventory, 'standzeit2');
  const standzeit3Days = numericInventoryValues(inventory, 'standzeit3');
  const stockAge030 = inventory.filter(vehicle => Number(vehicle.days || 0) <= 30).length;
  const stockAge3160 = inventory.filter(vehicle => Number(vehicle.days || 0) > 30 && Number(vehicle.days || 0) <= 60).length;
  const stockAge6190 = inventory.filter(vehicle => Number(vehicle.days || 0) > 60 && Number(vehicle.days || 0) <= 90).length;
  const stockAge91180 = inventory.filter(vehicle => Number(vehicle.days || 0) > 90 && Number(vehicle.days || 0) <= 180).length;
  const stockAgeOver180 = inventory.filter(vehicle => Number(vehicle.days || 0) > 180).length;
  const inventoryOver90 = inventory.filter(vehicle => Number(vehicle.days || 0) > 90).length;
  const avgMarketDelta = inventoryCount ? Math.round(inventory.reduce((sum, vehicle) => sum + Number(vehicle.marketDelta || 0), 0) / inventoryCount) : 0;
  const values = {};
  const setMetric = (area, metric, value) => {
    values[metric] = value;
    values[kpiStorageKey(area, metric, 'actual')] = value;
  };
  [
    ['Verkauf', 'Kontakte', monthTotals.contacts],
    ['Verkauf', 'Leads', monthTotals.leads],
    ['Verkauf', 'Angebote', monthTotals.offers],
    ['Verkauf', 'Probefahrten', monthTotals.testDrives],
    ['Verkauf', 'Abschlüsse', monthTotals.sales],
    ['Verkauf', 'Conversion', leadToClose],
    ['Verkauf', 'Lead->Angebot', leadToOffer],
    ['Verkauf', 'Probefahrtquote', testDriveQuote],
    ['Verkauf', 'DB pro Fahrzeug', '–'],
    ['Fahrzeugbestand', 'Bestand gesamt', inventoryCount],
    ['Fahrzeugbestand', 'Ø Bestandsalter', inventoryDays.length ? Math.round(average(inventoryDays)) : '–'],
    ['Fahrzeugbestand', 'Median Bestandsalter', inventoryDays.length ? median(inventoryDays) : '–'],
    ['Fahrzeugbestand', 'Bestandsalter 0-30 Tage', stockAge030],
    ['Fahrzeugbestand', 'Bestandsalter 31-60 Tage', stockAge3160],
    ['Fahrzeugbestand', 'Bestandsalter 61-90 Tage', stockAge6190],
    ['Fahrzeugbestand', 'Bestandsalter 91-180 Tage', stockAge91180],
    ['Fahrzeugbestand', 'Bestandsalter >180 Tage', stockAgeOver180],
    ['Fahrzeugbestand', 'Standzeit 0', standzeit0Days.length ? `${roundOne(average(standzeit0Days))} Tage` : '–'],
    ['Fahrzeugbestand', 'Standzeit 1', standzeit1Days.length ? `${roundOne(average(standzeit1Days))} Tage` : '–'],
    ['Fahrzeugbestand', 'Standzeit 2', standzeit2Days.length ? `${roundOne(average(standzeit2Days))} Tage` : '–'],
    ['Fahrzeugbestand', 'Standzeit 3', standzeit3Days.length ? `${roundOne(average(standzeit3Days))} Tage` : '–'],
    ['Fahrzeugbestand', 'Anteil >90 Tage', inventoryCount ? `${Math.round((inventoryOver90 / inventoryCount) * 100)}%` : '–'],
    ['Fahrzeugbestand', 'Fahrzeuge mit Bildern', inventoryWithAnyPhotos],
    ['Fahrzeugbestand', 'Fahrzeuge ohne Bilder', inventoryWithoutPhotos],
    ['Fahrzeugbestand', 'Bildquote 15+', inventoryCount ? `${Math.round((inventoryWithStandardPhotos / inventoryCount) * 100)}%` : '–'],
    ['Fahrzeugbestand', 'Fahrzeuge mit Preis', inventoryWithPrice],
    ['Fahrzeugbestand', 'Fahrzeuge ohne Preis', inventoryWithoutPrice],
    ['Fahrzeugbestand', 'Preisquote', inventoryCount ? `${Math.round((inventoryWithPrice / inventoryCount) * 100)}%` : '–'],
    ['Fahrzeugbestand', 'Fahrzeuge online', inventoryOnline],
    ['Fahrzeugbestand', 'Fahrzeuge nicht online', inventoryWithoutOnline],
    ['Fahrzeugbestand', 'Onlinequote', inventoryCount ? `${Math.round((inventoryOnline / inventoryCount) * 100)}%` : '–'],
    ['Fahrzeugbestand', 'Verkaufsfertig', inventoryReady],
    ['Fahrzeugbestand', 'Nicht verkaufsfertig', inventoryNotReady],
    ['Fahrzeugbestand', 'Anteil verkaufsfertig', inventoryCount ? `${Math.round((inventoryReady / inventoryCount) * 100)}%` : '–'],
    ['Fahrzeugbestand', 'Ø Marktpreisabweichung', inventoryCount ? `${avgMarketDelta}%` : '–'],
    ['Gesamtbetrieb', 'Gesamtbestand', inventoryCount],
    ['Gesamtbetrieb', 'Ø Bestandsalter', inventoryDays.length ? Math.round(average(inventoryDays)) : '–'],
    ['Gesamtbetrieb', 'Median Bestandsalter', inventoryDays.length ? median(inventoryDays) : '–'],
    ['Gesamtbetrieb', 'Anteil >90 Tage', inventoryCount ? `${Math.round((inventoryOver90 / inventoryCount) * 100)}%` : '–'],
    ['Gesamtbetrieb', 'Anteil verkaufsfertig', inventoryCount ? `${Math.round((inventoryReady / inventoryCount) * 100)}%` : '–'],
    ['Gesamtbetrieb', 'Preisquote', inventoryCount ? `${Math.round((inventoryWithPrice / inventoryCount) * 100)}%` : '–'],
    ['Gesamtbetrieb', 'Bildquote 15+', inventoryCount ? `${Math.round((inventoryWithStandardPhotos / inventoryCount) * 100)}%` : '–'],
    ['Gesamtbetrieb', 'Umsatz', '–'],
    ['Gesamtbetrieb', 'Ertrag', '–'],
    ['Gesamtbetrieb', 'Liquidität', '–'],
    ['Gesamtbetrieb', 'CSI/Kundenzufriedenheit', '–'],
    ['Gesamtbetrieb', 'Google-Bewertungen', '–'],
    ['Verwaltung', 'Krankenquote', '–'],
    ['Verkauf', 'Bestand', inventoryCount],
    ['Verkauf', 'Standtage', inventoryDays.length ? Math.round(average(inventoryDays)) : '–'],
    ['Verkauf', 'Fahrzeuge online', inventoryOnline],
    ['Verkauf', 'Preisabweichung Markt', inventoryCount ? `${avgMarketDelta}%` : '–'],
    ['Werkstatt', 'Auslastung', workshopTotals.capacity ? `${Math.round((workshopTotals.soldHours / workshopTotals.capacity) * 100)}%` : '–'],
    ['Werkstatt', 'Produktivität', '–'],
    ['Werkstatt', 'Verrechnungssatz', '–'],
    ['Werkstatt', 'Auftragsbestand', workshopTotals.openOrders],
    ['Werkstatt', 'Reklamationen', workshopTotals.complaints],
    ['Werkstatt', 'Stunden verkauft', workshopTotals.soldHours],
    ['Teilelager', 'Lagerumschlag', '–'],
    ['Teilelager', 'Fehlteile', workshopTotals.missingParts],
    ['Teilelager', 'Schwund', '–'],
    ['Teilelager', 'Verfügbarkeit', '–'],
    ['Start', 'Tagesfortschritt', `${Math.round((doneChecks / totalChecks) * 100)}%`],
  ].forEach(([area, metric, value]) => setMetric(area, metric, value));
  return addDerivedKpis({ ...values, ...(state.sheetKpis || {}) });
}

function addDerivedKpis(values) {
  const set = (area, metric, value) => {
    if (value === '' || value === null || value === undefined || Number.isNaN(value)) return;
    const formatted = typeof value === 'number' ? formatMetricValue(value, metric.includes('%') || metric.includes('Quote') || metric.includes('Absorption') || metric.includes('Net-to-Gross') || metric.includes('Produktivität') ? '%' : inferKpiUnit(metric)) : value;
    values[metric] = formatted;
    values[kpiStorageKey(area, metric, 'actual')] = formatted;
  };
  const num = (area, metric) => parseMetricNumber(kpiValue(area, metric, 'actual', values));
  const ratio = (actual, base) => base ? (actual / base) * 100 : null;

  const salesRevenue = num('Verkauf', 'Umsatz NW') + num('Verkauf', 'Umsatz GW');
  const salesCogs = num('Verkauf', 'Wareneinsatz NW') + num('Verkauf', 'Wareneinsatz GW');
  const salesVariableCosts = num('Verkauf', 'Variable Verkaufskosten');
  const salesDb = salesRevenue - salesCogs - salesVariableCosts;
  if (salesRevenue || salesCogs || salesVariableCosts) {
    set('Verkauf', 'DB I Verkauf', salesDb);
    set('Verkauf', 'DB I Verkauf %', ratio(salesDb, salesRevenue));
    const units = num('Verkauf', 'Abschlüsse');
    if (units) set('Verkauf', 'DB pro Fahrzeug', salesDb / units);
  }

  const laborSales = num('Werkstatt', 'Arbeitsumsatz') || num('Werkstatt', 'Stunden verkauft') * num('Werkstatt', 'Verrechnungssatz');
  const productiveWages = num('Werkstatt', 'Produktivlohn');
  const workshopOverhead = num('Werkstatt', 'Werkstatt-Gemeinkosten');
  const workshopDb = laborSales - productiveWages - workshopOverhead;
  if (laborSales || productiveWages || workshopOverhead) {
    set('Werkstatt', 'DB Werkstatt', workshopDb);
    set('Werkstatt', 'DB Werkstatt %', ratio(workshopDb, laborSales));
    if (productiveWages) set('Werkstatt', 'Lohnproduktivität', ratio(laborSales, productiveWages));
  }

  const partsSales = num('Teilelager', 'Teileumsatz');
  const partsCogs = num('Teilelager', 'Teile-Wareneinsatz');
  const partsOverhead = num('Teilelager', 'Teile-Gemeinkosten');
  const partsDb = partsSales - partsCogs - partsOverhead;
  if (partsSales || partsCogs || partsOverhead) {
    set('Teilelager', 'DB Teile', partsDb);
    set('Teilelager', 'DB Teile %', ratio(partsDb, partsSales));
  }

  const prepRevenue = num('Fahrzeugaufbereitung', 'Aufbereitungsumsatz intern');
  const prepCosts = num('Fahrzeugaufbereitung', 'Aufbereitungskosten');
  if (prepRevenue || prepCosts) set('Fahrzeugaufbereitung', 'DB Aufbereitung', prepRevenue - prepCosts);

  const fiGross = num('F&I', 'F&I-Ertrag');
  const fixedGross = workshopDb + partsDb;
  const totalDb = salesDb + workshopDb + partsDb + (prepRevenue - prepCosts) + fiGross;
  const totalRevenue = num('Gesamtbetrieb', 'Umsatz') || salesRevenue + laborSales + partsSales + prepRevenue;
  const fixedCosts = num('Verwaltung', 'Fixkosten gesamt') || num('Gesamtbetrieb', 'Fixkosten gesamt');
  if (totalDb) {
    set('Gesamtbetrieb', 'Gesamtdeckungsbeitrag', totalDb);
    set('Gesamtbetrieb', 'DB-Quote gesamt', ratio(totalDb, totalRevenue));
    set('Gesamtbetrieb', 'Deckungsbeitrag II', totalDb - fixedCosts);
    set('Gesamtbetrieb', 'Absorption', ratio(fixedGross, fixedCosts));
    set('Verwaltung', 'Net-to-Gross', ratio(totalDb - fixedCosts, totalDb));
  }
  if (fixedCosts) {
    set('Gesamtbetrieb', 'Fixkosten gesamt', fixedCosts);
    set('Verwaltung', 'Fixkosten gesamt', fixedCosts);
    set('Verwaltung', 'Overheadquote', ratio(fixedCosts, totalDb));
  }
  return values;
}

function inferKpiUnit(metric) {
  return /(Umsatz|Wareneinsatz|Kosten|Fixkosten|Ertrag|Deckungsbeitrag|DB |DB$|Produktivlohn|Gemeinkosten)/i.test(metric) ? '€' : '';
}

function average(numbers) {
  return numbers.length ? numbers.reduce((sum, value) => sum + value, 0) / numbers.length : 0;
}

function numericInventoryValues(inventory, field) {
  return inventory
    .map(vehicle => Number(vehicle[field]))
    .filter(value => Number.isFinite(value) && value > 0);
}

function roundOne(value) {
  return Number(value.toFixed(1)).toLocaleString('de-DE');
}

function median(numbers) {
  if (!numbers.length) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);
  const value = sorted.length % 2 ? sorted[middle] : (sorted[middle - 1] + sorted[middle]) / 2;
  return Number(value.toFixed(1));
}

function kpiStorageKey(area, metric, kind = 'actual') {
  const base = area ? `${area} · ${metric}` : metric;
  return kind === 'target' ? `Ziel ${base}` : base;
}

function kpiValue(area, metric, kind = 'actual', values = state.sheetKpis || {}) {
  const scoped = kpiStorageKey(area, metric, kind);
  const simple = kind === 'target' ? `Ziel ${metric}` : metric;
  const legacyTarget = kind === 'target' ? `${metric} Ziel` : '';
  return values[scoped] ?? values[simple] ?? (legacyTarget ? values[legacyTarget] : '') ?? '';
}

function getWorkshopRisks(workshop) {
  return workshop.flatMap(item => {
    const risks = [];
    const utilization = item.capacity ? Math.round((Number(item.soldHours || 0) / Number(item.capacity || 0)) * 100) : 0;
    if (utilization > 100) risks.push({ title: `${item.area}: Überlastung`, note: `${utilization}% Auslastung` });
    if (Number(item.missingParts || 0) > 0) risks.push({ title: `${item.area}: Fehlteile`, note: `${item.missingParts} Fälle blockieren Durchlauf` });
    if (Number(item.complaints || 0) > 0) risks.push({ title: `${item.area}: Reklamationen`, note: `${item.complaints} aktiv` });
    return risks;
  });
}

function getEscalations() {
  const actions = getActions();
  const overdueActions = actions
    .filter(action => action.status !== 'done' && action.due && action.due < todayKey)
    .map(action => ({ area: 'Maßnahmen', title: `Überfällig: ${action.title}`, note: `${action.owner} · fällig ${formatDateShort(action.due)}` }));
  const inventoryRisks = getInventory()
    .filter(vehicle => vehicle.days >= 60 || !vehicle.online || Number(vehicle.photos || 0) === 0)
    .map(vehicle => ({ area: 'Bestand', title: `${vehicle.vehicle}`, note: `${vehicle.days} Standtage · ${vehicle.online ? 'online' : 'nicht online'} · ${vehicle.photos} Bilder` }));
  const workshopRisks = getWorkshopRisks(getWorkshop())
    .map(risk => ({ area: 'Werkstatt', title: risk.title, note: risk.note }));
  return [...overdueActions, ...inventoryRisks, ...workshopRisks].slice(0, 20);
}

function buildWeeklyReport(escalations) {
  const values = getKpiActualValues();
  const openActions = getActions().filter(action => action.status !== 'done');
  return [
    `Wochenbericht Standortleitung - KW ${getWeekNumber(new Date())}`,
    '',
    '1. Kennzahlen',
    `- Leads: ${values.Leads}`,
    `- Abschlüsse: ${values.Abschlüsse}`,
    `- Bestand: ${values.Bestand}`,
    `- Werkstattauslastung: ${values.Auslastung}`,
    `- Fehlteile: ${values.Fehlteile}`,
    '',
    '2. Offene Maßnahmen',
    ...(openActions.length ? openActions.slice(0, 8).map(action => `- ${action.title} (${action.owner}, ${action.due || 'ohne Frist'}, ${statusLabel(action.status)})`) : ['- Keine offenen Maßnahmen']),
    '',
    '3. Eskalationen',
    ...(escalations.length ? escalations.slice(0, 10).map(item => `- ${item.area}: ${item.title} - ${item.note}`) : ['- Keine kritischen Punkte']),
    '',
    '4. Fokus nächste Woche',
    '- Langsteher und Fahrzeuge ohne Bilder konsequent abarbeiten',
    '- Fehlteile und Fertigstellungen täglich nachhalten',
    '- Überfällige Maßnahmen vor dem Wochenmeeting schließen',
  ].join('\n');
}

function buildMonthlyReportRows() {
  const values = getKpiActualValues();
  const sales = getSalesState();
  const salesPeriod = getSalesReportPeriod(sales.entries || []);
  const progress = getMonthProgress(salesPeriod.monthKey, salesPeriod.entries);
  const monthTotals = aggregateSales(salesPeriod.entries);
  const inventory = getInventory();
  const workshop = getWorkshop();
  const workshopTotals = workshop.reduce((sum, item) => {
    sum.capacity += Number(item.capacity || 0);
    sum.soldHours += Number(item.soldHours || 0);
    sum.openOrders += Number(item.openOrders || 0);
    sum.missingParts += Number(item.missingParts || 0);
    sum.completions += Number(item.completions || 0);
    sum.complaints += Number(item.complaints || 0);
    return sum;
  }, { capacity: 0, soldHours: 0, openOrders: 0, missingParts: 0, completions: 0, complaints: 0 });
  const salesTargets = getSalesTeam().reduce((sum, person) => {
    sum.contacts += Number(person.monthlyContactTarget || 0);
    sum.sales += Number(person.monthlySalesTarget || 0);
    return sum;
  }, { contacts: 0, sales: 0 });
  const inventoryCount = inventory.length;
  const inventoryOnline = inventory.filter(vehicle => vehicle.online).length;
  const inventoryWithPrice = inventory.filter(vehicle => Number(vehicle.price || vehicle.customerPrice || vehicle.kundenpreis || 0) > 0).length;
  const inventoryWithStandardPhotos = inventory.filter(vehicle => Number(vehicle.photos || vehicle.bilder || 0) >= 15).length;
  const inventoryReady = inventory.filter(vehicle => ['ok', 'verkaufsfertig', 'online'].includes(String(vehicle.status || '').toLowerCase())).length;
  const longStanding = inventory.filter(vehicle => Number(vehicle.days || 0) > 90).length;
  const inventoryWithAnyPhotos = inventory.filter(vehicle => Number(vehicle.photos || vehicle.bilder || 0) > 0).length;
  const inventoryDays = inventory.map(vehicle => Number(vehicle.days || 0)).filter(Number.isFinite);
  const stockAge030 = inventory.filter(vehicle => Number(vehicle.days || 0) <= 30).length;
  const stockAge3160 = inventory.filter(vehicle => Number(vehicle.days || 0) > 30 && Number(vehicle.days || 0) <= 60).length;
  const stockAge6190 = inventory.filter(vehicle => Number(vehicle.days || 0) > 60 && Number(vehicle.days || 0) <= 90).length;
  const stockAge91180 = inventory.filter(vehicle => Number(vehicle.days || 0) > 90 && Number(vehicle.days || 0) <= 180).length;
  const stockAgeOver180 = inventory.filter(vehicle => Number(vehicle.days || 0) > 180).length;
  const standzeit0Avg = average(numericInventoryValues(inventory, 'standzeit0'));
  const standzeit1Avg = average(numericInventoryValues(inventory, 'standzeit1'));
  const standzeit2Avg = average(numericInventoryValues(inventory, 'standzeit2'));
  const standzeit3Avg = average(numericInventoryValues(inventory, 'standzeit3'));
  const leadToOfferPct = monthTotals.leads ? (monthTotals.offers / monthTotals.leads) * 100 : 0;
  const leadToClosePct = monthTotals.leads ? (monthTotals.sales / monthTotals.leads) * 100 : 0;
  const testDriveQuotePct = monthTotals.offers ? (monthTotals.testDrives / monthTotals.offers) * 100 : 0;
  const rows = [
    monthlyRow('Verkauf', 'Kontakte', monthTotals.contacts, monthlyTarget('Kontakte', salesTargets.contacts, 'Verkauf'), progress),
    monthlyRow('Verkauf', 'Leads', monthTotals.leads, monthlyTarget('Leads', 120, 'Verkauf'), progress),
    monthlyRow('Verkauf', 'Angebote', monthTotals.offers, monthlyTarget('Angebote', 65, 'Verkauf'), progress),
    monthlyRow('Verkauf', 'Probefahrten', monthTotals.testDrives, monthlyTarget('Probefahrten', 35, 'Verkauf'), progress),
    monthlyRow('Verkauf', 'Abschlüsse', monthTotals.sales, monthlyTarget('Abschlüsse', salesTargets.sales, 'Verkauf'), progress),
    monthlyRow('Verkauf', 'Lead->Angebot', leadToOfferPct, monthlyTarget('Lead->Angebot', 54, 'Verkauf'), progress, false, '%', true),
    monthlyRow('Verkauf', 'Conversion', leadToClosePct, monthlyTarget('Conversion', 39, 'Verkauf'), progress, false, '%', true),
    monthlyRow('Verkauf', 'Probefahrtquote', testDriveQuotePct, monthlyTarget('Probefahrtquote', 54, 'Verkauf'), progress, false, '%', true),
    monthlyRow('Gesamtbetrieb', 'Fahrzeuge online', percentOf(inventoryOnline, inventoryCount), monthlyTarget('Fahrzeuge online', 100, 'Gesamtbetrieb'), progress, false, '%', true),
    monthlyRow('Gesamtbetrieb', 'Preisquote', percentOf(inventoryWithPrice, inventoryCount), monthlyTarget('Preisquote', 100, 'Gesamtbetrieb'), progress, false, '%', true),
    monthlyRow('Gesamtbetrieb', 'Bildquote 15+', percentOf(inventoryWithStandardPhotos, inventoryCount), monthlyTarget('Bildquote 15+', 100, 'Gesamtbetrieb'), progress, false, '%', true),
    monthlyRow('Gesamtbetrieb', 'Anteil verkaufsfertig', percentOf(inventoryReady, inventoryCount), monthlyTarget('Anteil verkaufsfertig', 85, 'Gesamtbetrieb'), progress, false, '%', true),
    monthlyRow('Gesamtbetrieb', 'Anteil >90 Tage', percentOf(longStanding, inventoryCount), monthlyTarget('Anteil >90 Tage', 10, 'Gesamtbetrieb'), progress, true, '%', true),
    monthlyRow('Fahrzeugbestand', 'Bestand gesamt', inventoryCount, monthlyTarget('Bestand gesamt', inventoryCount, 'Fahrzeugbestand'), progress, false, '', true),
    monthlyRow('Fahrzeugbestand', 'Ø Bestandsalter', inventoryDays.length ? average(inventoryDays) : 0, monthlyTarget('Ø Bestandsalter', 45, 'Fahrzeugbestand'), progress, true, '', true),
    monthlyRow('Fahrzeugbestand', 'Median Bestandsalter', inventoryDays.length ? median(inventoryDays) : 0, monthlyTarget('Median Bestandsalter', 40, 'Fahrzeugbestand'), progress, true, '', true),
    monthlyRow('Fahrzeugbestand', 'Bestandsalter 0-30 Tage', stockAge030, monthlyTarget('Bestandsalter 0-30 Tage', 0, 'Fahrzeugbestand'), progress, false, '', true),
    monthlyRow('Fahrzeugbestand', 'Bestandsalter 31-60 Tage', stockAge3160, monthlyTarget('Bestandsalter 31-60 Tage', 0, 'Fahrzeugbestand'), progress, false, '', true),
    monthlyRow('Fahrzeugbestand', 'Bestandsalter 61-90 Tage', stockAge6190, monthlyTarget('Bestandsalter 61-90 Tage', 0, 'Fahrzeugbestand'), progress, false, '', true),
    monthlyRow('Fahrzeugbestand', 'Bestandsalter 91-180 Tage', stockAge91180, monthlyTarget('Bestandsalter 91-180 Tage', 0, 'Fahrzeugbestand'), progress, true, '', true),
    monthlyRow('Fahrzeugbestand', 'Bestandsalter >180 Tage', stockAgeOver180, monthlyTarget('Bestandsalter >180 Tage', 0, 'Fahrzeugbestand'), progress, true, '', true),
    monthlyRow('Fahrzeugbestand', 'Standzeit 0', standzeit0Avg, monthlyTarget('Standzeit 0', 1, 'Fahrzeugbestand'), progress, true, '', true),
    monthlyRow('Fahrzeugbestand', 'Standzeit 1', standzeit1Avg, monthlyTarget('Standzeit 1', 5, 'Fahrzeugbestand'), progress, true, '', true),
    monthlyRow('Fahrzeugbestand', 'Standzeit 2', standzeit2Avg, monthlyTarget('Standzeit 2', 45, 'Fahrzeugbestand'), progress, true, '', true),
    monthlyRow('Fahrzeugbestand', 'Standzeit 3', standzeit3Avg, monthlyTarget('Standzeit 3', 5, 'Fahrzeugbestand'), progress, true, '', true),
    monthlyRow('Fahrzeugbestand', 'Onlinequote', percentOf(inventoryOnline, inventoryCount), monthlyTarget('Onlinequote', 100, 'Fahrzeugbestand'), progress, false, '%', true),
    monthlyRow('Fahrzeugbestand', 'Preisquote', percentOf(inventoryWithPrice, inventoryCount), monthlyTarget('Preisquote', 100, 'Fahrzeugbestand'), progress, false, '%', true),
    monthlyRow('Fahrzeugbestand', 'Bildquote 15+', percentOf(inventoryWithStandardPhotos, inventoryCount), monthlyTarget('Bildquote 15+', 100, 'Fahrzeugbestand'), progress, false, '%', true),
    monthlyRow('Fahrzeugbestand', 'Fahrzeuge ohne Bilder', inventoryCount - inventoryWithAnyPhotos, monthlyTarget('Fahrzeuge ohne Bilder', 0, 'Fahrzeugbestand'), progress, true, '', true),
    monthlyRow('Fahrzeugbestand', 'Fahrzeuge ohne Preis', inventoryCount - inventoryWithPrice, monthlyTarget('Fahrzeuge ohne Preis', 0, 'Fahrzeugbestand'), progress, true, '', true),
    monthlyRow('Fahrzeugbestand', 'Fahrzeuge nicht online', inventoryCount - inventoryOnline, monthlyTarget('Fahrzeuge nicht online', 0, 'Fahrzeugbestand'), progress, true, '', true),
    monthlyRow('Fahrzeugbestand', 'Anteil >90 Tage', percentOf(longStanding, inventoryCount), monthlyTarget('Anteil >90 Tage', 10, 'Fahrzeugbestand'), progress, true, '%', true),
    monthlyRow('Werkstatt', 'Produktivstunden', workshopTotals.soldHours, monthlyTarget('Produktivstunden', workshopTotals.capacity * progress.totalDays, 'Werkstatt'), progress),
    monthlyRow('Werkstatt', 'Fertigstellungen', workshopTotals.completions, monthlyTarget('Fertigstellungen', 220, 'Werkstatt'), progress),
    monthlyRow('Teilelager', 'Fehlteile', workshopTotals.missingParts, monthlyTarget('Fehlteile', 6, 'Teilelager'), progress, true),
    monthlyRow('Werkstatt', 'Reklamationen', workshopTotals.complaints, monthlyTarget('Reklamationen', 4, 'Werkstatt'), progress, true),
    monthlyRow('Gesamtbetrieb', 'Umsatz', parseMetricNumber(kpiValue('Gesamtbetrieb', 'Umsatz', 'actual', values)), monthlyTarget('Umsatz', 250000, 'Gesamtbetrieb'), progress, false, '€'),
    monthlyRow('Gesamtbetrieb', 'Ertrag', parseMetricNumber(kpiValue('Gesamtbetrieb', 'Ertrag', 'actual', values)), monthlyTarget('Ertrag', 42000, 'Gesamtbetrieb'), progress, false, '€'),
    monthlyRow('Gesamtbetrieb', 'Gesamtdeckungsbeitrag', parseMetricNumber(kpiValue('Gesamtbetrieb', 'Gesamtdeckungsbeitrag', 'actual', values)), monthlyTarget('Gesamtdeckungsbeitrag', 80000, 'Gesamtbetrieb'), progress, false, '€'),
    monthlyRow('Gesamtbetrieb', 'DB-Quote gesamt', parseMetricNumber(kpiValue('Gesamtbetrieb', 'DB-Quote gesamt', 'actual', values)), monthlyTarget('DB-Quote gesamt', 30, 'Gesamtbetrieb'), progress, false, '%', true),
    monthlyRow('Gesamtbetrieb', 'Deckungsbeitrag II', parseMetricNumber(kpiValue('Gesamtbetrieb', 'Deckungsbeitrag II', 'actual', values)), monthlyTarget('Deckungsbeitrag II', 25000, 'Gesamtbetrieb'), progress, false, '€'),
    monthlyRow('Gesamtbetrieb', 'Absorption', parseMetricNumber(kpiValue('Gesamtbetrieb', 'Absorption', 'actual', values)), monthlyTarget('Absorption', 100, 'Gesamtbetrieb'), progress, false, '%', true),
    monthlyRow('Verkauf', 'DB I Verkauf', parseMetricNumber(kpiValue('Verkauf', 'DB I Verkauf', 'actual', values)), monthlyTarget('DB I Verkauf', 40000, 'Verkauf'), progress, false, '€'),
    monthlyRow('Werkstatt', 'DB Werkstatt', parseMetricNumber(kpiValue('Werkstatt', 'DB Werkstatt', 'actual', values)), monthlyTarget('DB Werkstatt', 25000, 'Werkstatt'), progress, false, '€'),
    monthlyRow('Teilelager', 'DB Teile', parseMetricNumber(kpiValue('Teilelager', 'DB Teile', 'actual', values)), monthlyTarget('DB Teile', 15000, 'Teilelager'), progress, false, '€'),
    monthlyRow('Gesamtbetrieb', 'Google-Bewertungen', parseMetricNumber(kpiValue('Gesamtbetrieb', 'Google-Bewertungen', 'actual', values)), monthlyTarget('Google-Bewertungen', 4.6, 'Gesamtbetrieb'), progress),
    monthlyRow('Verwaltung', 'Krankenquote', parseMetricNumber(kpiValue('Verwaltung', 'Krankenquote', 'actual', values)), monthlyTarget('Krankenquote', 4, 'Verwaltung'), progress, true, '%'),
  ];
  return rows;
}

function monthlyRow(area, metric, actual, target, progress, lowerIsBetter = false, unit = '', pointInTime = false) {
  const numericActual = Number(actual || 0);
  const numericTarget = Number(target || 0);
  const expected = lowerIsBetter || pointInTime ? numericTarget : numericTarget * progress.ratio;
  const timePct = expected || lowerIsBetter ? achievementRatio(numericActual, expected, lowerIsBetter) * 100 : 0;
  const targetPct = numericTarget || lowerIsBetter ? achievementRatio(numericActual, numericTarget, lowerIsBetter) * 100 : 0;
  return [
    area,
    metric,
    formatMetricValue(numericActual, unit),
    formatMetricValue(numericTarget, unit),
    formatMetricValue(expected, unit),
    `${Math.round(timePct)}%`,
    `${Math.round(targetPct)}%`,
  ];
}

function achievementRatio(actual, target, lowerIsBetter = false) {
  const numericActual = Number(actual || 0);
  const numericTarget = Number(target || 0);
  if (!numericTarget) return lowerIsBetter ? (numericActual <= 0 ? 1 : 0) : 0;
  if (lowerIsBetter) return numericActual <= numericTarget ? 1 : numericTarget / Math.max(numericActual, 0.01);
  return numericActual / numericTarget;
}

function percentOf(part, total) {
  return total ? (Number(part || 0) / Number(total || 0)) * 100 : 0;
}

function monitorMetric(row) {
  const timePct = parseMetricNumber(row[5]);
  const target = parseMetricNumber(row[3]);
  const score = Math.max(0, Math.min(timePct, 150));
  const status = timePct >= 100 ? 'good' : timePct >= 85 ? 'watch' : 'bad';
  return {
    area: row[0],
    metric: row[1],
    actualLabel: row[2],
    targetLabel: row[3],
    expectedLabel: row[4],
    timePct: Math.round(timePct),
    target,
    status,
    angle: gaugeAngle(score),
  };
}

function gaugeAngle(value) {
  return -140 + (Math.max(0, Math.min(Number(value || 0), 150)) / 150) * 280;
}

function polarPoint(cx, cy, radius, angle) {
  const radians = (angle - 90) * Math.PI / 180;
  return {
    x: Number((cx + radius * Math.cos(radians)).toFixed(2)),
    y: Number((cy + radius * Math.sin(radians)).toFixed(2)),
  };
}

function arcPath(cx, cy, radius, startAngle, endAngle) {
  const start = polarPoint(cx, cy, radius, endAngle);
  const end = polarPoint(cx, cy, radius, startAngle);
  const largeArcFlag = Math.abs(endAngle - startAngle) <= 180 ? 0 : 1;
  return `M ${start.x} ${start.y} A ${radius} ${radius} 0 ${largeArcFlag} 0 ${end.x} ${end.y}`;
}

function monthlyTarget(metric, fallback, area = '') {
  const fromSheet = area
    ? kpiValue(area, metric, 'target')
    : state.sheetKpis?.[`Ziel ${metric}`] ?? state.sheetKpis?.[`${metric} Ziel`];
  const parsed = parseMetricNumber(fromSheet);
  return parsed || Number(fallback || 0);
}

function getSalesReportPeriod(entries) {
  const currentMonth = todayKey.slice(0, 7);
  const currentEntries = entries.filter(entry => entry.date.startsWith(currentMonth));
  if (currentEntries.length) return { monthKey: currentMonth, entries: currentEntries };
  const months = [...new Set(entries.map(entry => String(entry.date || '').slice(0, 7)).filter(Boolean))].sort();
  const latestMonth = months.at(-1) || currentMonth;
  return {
    monthKey: latestMonth,
    entries: entries.filter(entry => entry.date.startsWith(latestMonth)),
  };
}

function getMonthProgress(monthKey = todayKey.slice(0, 7), entries = []) {
  const [year, month] = monthKey.split('-').map(Number);
  const totalDays = countBusinessDaysInMonth(year, month);
  const isCurrentMonth = monthKey === todayKey.slice(0, 7);
  const latestEntryDay = entries.reduce((max, entry) => Math.max(max, Number(String(entry.date || '').slice(8, 10)) || 0), 0);
  const rawElapsedDay = isCurrentMonth ? new Date(`${todayKey}T12:00:00`).getDate() : Math.max(1, latestEntryDay);
  const elapsedDays = countBusinessDaysInMonth(year, month, rawElapsedDay);
  return {
    elapsedDays: Math.max(1, elapsedDays),
    totalDays: Math.max(1, totalDays),
    ratio: Math.max(1, elapsedDays) / Math.max(1, totalDays),
  };
}

function countBusinessDaysInMonth(year, month, untilDay = new Date(year, month, 0).getDate()) {
  let count = 0;
  const lastDay = Math.min(untilDay, new Date(year, month, 0).getDate());
  for (let day = 1; day <= lastDay; day += 1) {
    if (isBusinessDay(new Date(year, month - 1, day, 12, 0, 0))) count += 1;
  }
  return count;
}

function openPrintReport(type) {
  const dataset = getExportDataset(type);
  const html = buildPrintableReport(dataset);
  showPrintPreview(html, dataset.title);
}

window.openPrintReportFromButton = function openPrintReportFromButton(type) {
  openPrintReport(type);
};

function buildInventoryReportRows() {
  return getInventory()
    .slice()
    .sort((a, b) => Number(b.days || 0) - Number(a.days || 0))
    .map(vehicle => [
      vehicle.stock,
      vehicle.vehicle,
      vehicle.days,
      vehicle.standzeit0 || 0,
      vehicle.standzeit1 || 0,
      vehicle.standzeit2 || 0,
      vehicle.standzeit3 || 0,
      vehicle.price,
      `${vehicle.marketDelta}%`,
      vehicle.photos,
      vehicle.online ? 'ja' : 'nein',
      vehicle.margin,
      vehicle.status,
    ]);
}

function buildExecutiveReportHtml() {
  const generated = new Intl.DateTimeFormat('de-DE', { dateStyle: 'full', timeStyle: 'short' }).format(new Date());
  const theme = getCurrentTheme();
  const logo = printableLogoSvg(theme);
  const monthlyRows = buildMonthlyReportRows();
  const kpis = selectExecutiveKpis(monthlyRows);
  const values = getKpiActualValues();
  const escalations = getEscalations().slice(0, 5);
  const actions = getActions().filter(action => action.status !== 'done').slice(0, 5);
  const inventory = getInventory();
  const ageBuckets = [
    ['0-30', inventory.filter(vehicle => Number(vehicle.days || 0) <= 30).length, '#238b63'],
    ['31-60', inventory.filter(vehicle => Number(vehicle.days || 0) > 30 && Number(vehicle.days || 0) <= 60).length, '#76a96c'],
    ['61-90', inventory.filter(vehicle => Number(vehicle.days || 0) > 60 && Number(vehicle.days || 0) <= 90).length, '#d8a62e'],
    ['91-180', inventory.filter(vehicle => Number(vehicle.days || 0) > 90 && Number(vehicle.days || 0) <= 180).length, '#d16b35'],
    ['>180', inventory.filter(vehicle => Number(vehicle.days || 0) > 180).length, '#bd3f3f'],
  ];
  const statusCounts = kpis.reduce((sum, item) => {
    sum[item.status] += 1;
    return sum;
  }, { good: 0, watch: 0, bad: 0 });
  const avgScore = kpis.length ? Math.round(kpis.reduce((sum, item) => sum + item.timePct, 0) / kpis.length) : 0;
  const headline = avgScore >= 100 ? 'Zielkurs stabil' : avgScore >= 85 ? 'Zielkurs aufmerksam steuern' : 'Zielkurs kritisch nachhalten';
  const riskItems = [...escalations.map(item => ({ title: item.title, note: `${item.area} · ${item.note}` })), ...actions.map(action => ({ title: action.title, note: `${action.owner} · ${action.due || 'ohne Frist'} · ${statusLabel(action.status)}` }))].slice(0, 6);
  return `<!doctype html>
    <html lang="de">
      <head>
        <meta charset="utf-8" />
        <title>Bericht für GL</title>
        <style>
          * { box-sizing: border-box; print-color-adjust: exact; -webkit-print-color-adjust: exact; }
          body { margin: 0; color: #202428; font-family: Inter, Arial, sans-serif; background: #f2f4f6; }
          .page { width: 1120px; max-width: 1120px; margin: 0 auto; padding: 30px; background: #fff; min-height: 100vh; }
          header { display: grid; grid-template-columns: 1fr auto; gap: 26px; align-items: start; border-bottom: 4px solid ${escapeHtml(theme.accent)}; padding-bottom: 20px; margin-bottom: 24px; }
          .eyebrow { color: ${escapeHtml(theme.accent)}; font-size: 12px; font-weight: 800; letter-spacing: .08em; text-transform: uppercase; }
          h1 { margin: 5px 0 6px; font-size: 34px; letter-spacing: 0; }
          h2 { margin: 0 0 12px; font-size: 18px; }
          p { margin: 0; color: #68717a; line-height: 1.35; }
          .mark { width: 58px; height: 58px; border-radius: 10px; background: #fff; border: 1px solid ${escapeHtml(theme.accent)}33; overflow: hidden; }
          .mark svg { width: 58px; height: 58px; display: block; }
          .summary { display: grid; grid-template-columns: 1.45fr repeat(3, minmax(120px, .5fr)); gap: 12px; margin-bottom: 18px; }
          .summary-card, .panel, .kpi-card { border: 1px solid #dde2e7; border-radius: 10px; background: #fff; box-shadow: 0 10px 26px rgba(32,36,40,.06); break-inside: avoid; page-break-inside: avoid; }
          .summary-card { padding: 16px; }
          .summary-card strong { display: block; font-size: 28px; margin-bottom: 3px; }
          .summary-card span { color: #68717a; font-size: 12px; text-transform: uppercase; letter-spacing: .04em; }
          .headline { background: #f8f9fa; border-left: 5px solid ${escapeHtml(theme.accent)}; }
          .headline strong { font-size: 24px; }
          .grid { display: grid; grid-template-columns: 1.25fr .75fr; gap: 16px; align-items: start; }
          .panel { padding: 16px; margin-bottom: 16px; }
          .kpi-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
          .kpi-card { padding: 12px; border-top: 4px solid var(--status); }
          .kpi-top { display: flex; justify-content: space-between; gap: 12px; align-items: start; }
          .kpi-card b { font-size: 15px; }
          .kpi-card small { color: #68717a; display: block; margin-top: 2px; }
          .score { font-size: 22px; font-weight: 800; color: var(--status); white-space: nowrap; }
          .bar { height: 8px; border-radius: 999px; background: #eef1f3; overflow: hidden; margin: 12px 0 9px; }
          .fill { width: var(--pct); max-width: 100%; height: 100%; background: var(--status); border-radius: inherit; }
          .kpi-meta { display: grid; grid-template-columns: repeat(3, 1fr); gap: 6px; color: #68717a; font-size: 11px; }
          .kpi-meta strong { display: block; color: #202428; font-size: 13px; }
          .risk { display: grid; gap: 2px; padding: 10px 0; border-bottom: 1px solid #e8edf1; }
          .risk:last-child { border-bottom: 0; }
          .risk strong { font-size: 14px; }
          .risk span { color: #68717a; font-size: 12px; }
          .stack { display: flex; height: 24px; overflow: hidden; border-radius: 999px; background: #eef1f3; margin: 12px 0; }
          .stack span { width: var(--share); background: var(--color); }
          .legend { display: grid; grid-template-columns: repeat(5, 1fr); gap: 8px; font-size: 11px; color: #68717a; }
          .legend b { display: block; color: #202428; font-size: 14px; }
          .pill { display: inline-block; padding: 4px 8px; border-radius: 999px; background: #f1f4f6; color: #68717a; font-size: 11px; font-weight: 750; }
          footer { margin-top: 22px; color: #68717a; font-size: 12px; }
          @page { size: A4 landscape; margin: 8mm; }
          @media print {
            html, body { width: 297mm; min-height: 210mm; background: #fff; }
            .page { width: 281mm; max-width: none; min-height: 194mm; padding: 8mm; }
            .summary-card, .panel, .kpi-card { box-shadow: 0 6px 16px rgba(32,36,40,.04); }
            h1 { font-size: 30px; }
            .kpi-card { padding: 10px; }
            .score { font-size: 20px; }
          }
        </style>
      </head>
      <body>
        <main class="page">
          <header>
            <div>
              <div class="eyebrow">Bericht für Geschäftsleitung</div>
              <h1>Standortleitung · Management Summary</h1>
              <p>${escapeHtml(generated)} · Fokus auf Zielerreichung, Bestandsqualität, Ertrag und operative Risiken.</p>
            </div>
            <div class="mark">${logo}</div>
          </header>
          <section class="summary">
            <div class="summary-card headline"><span>Gesamteinschätzung</span><strong>${escapeHtml(headline)}</strong><p>Top-10-KPI-Schnitt: ${avgScore}% der zeitanteiligen bzw. fachlichen Zielwerte.</p></div>
            <div class="summary-card"><span>Gut</span><strong style="color:#238b63">${statusCounts.good}</strong><p>im Soll</p></div>
            <div class="summary-card"><span>Beobachten</span><strong style="color:#d8a62e">${statusCounts.watch}</strong><p>knapp am Plan</p></div>
            <div class="summary-card"><span>Kritisch</span><strong style="color:#bd3f3f">${statusCounts.bad}</strong><p>Nachsteuerung</p></div>
          </section>
          <section class="grid">
            <div class="panel">
              <h2>Top-10-KPIs</h2>
              <div class="kpi-grid">${kpis.map(executiveKpiCard).join('')}</div>
            </div>
            <aside>
              <div class="panel">
                <h2>Bestandsalter</h2>
                <div class="stack">${ageBuckets.map(([label, count, color]) => `<span title="${label}" style="--share:${percentOf(count, inventory.length)}%;--color:${color}"></span>`).join('')}</div>
                <div class="legend">${ageBuckets.map(([label, count, color]) => `<div><span class="pill" style="border-left:4px solid ${color}">${label}</span><b>${count}</b></div>`).join('')}</div>
              </div>
              <div class="panel">
                <h2>Kernaussagen</h2>
                <div class="risk"><strong>Ertrag</strong><span>DB gesamt: ${escapeHtml(kpiValue('Gesamtbetrieb', 'Gesamtdeckungsbeitrag', 'actual', values) || '–')} · Absorption: ${escapeHtml(kpiValue('Gesamtbetrieb', 'Absorption', 'actual', values) || '–')}</span></div>
                <div class="risk"><strong>Verkauf</strong><span>Leads: ${escapeHtml(kpiValue('Verkauf', 'Leads', 'actual', values) || '–')} · Abschlüsse: ${escapeHtml(kpiValue('Verkauf', 'Abschlüsse', 'actual', values) || '–')}</span></div>
                <div class="risk"><strong>Werkstatt</strong><span>Auslastung: ${escapeHtml(kpiValue('Werkstatt', 'Auslastung', 'actual', values) || '–')} · Fehlteile: ${escapeHtml(kpiValue('Teilelager', 'Fehlteile', 'actual', values) || '–')}</span></div>
              </div>
              <div class="panel">
                <h2>Risiken & Maßnahmen</h2>
                ${riskItems.map(item => `<div class="risk"><strong>${escapeHtml(item.title)}</strong><span>${escapeHtml(item.note)}</span></div>`).join('') || '<p>Keine kritischen Punkte.</p>'}
              </div>
            </aside>
          </section>
          <footer>Operative Steuerung Standortleitung · Bericht automatisch aus App-Daten erstellt · ${escapeHtml(todayKey)}</footer>
        </main>
      </body>
    </html>`;
}

function selectExecutiveKpis(rows) {
  const wanted = [
    ['Gesamtbetrieb', 'Umsatz'],
    ['Gesamtbetrieb', 'Ertrag'],
    ['Gesamtbetrieb', 'Gesamtdeckungsbeitrag'],
    ['Gesamtbetrieb', 'Absorption'],
    ['Verkauf', 'Leads'],
    ['Verkauf', 'Abschlüsse'],
    ['Werkstatt', 'Produktivstunden'],
    ['Werkstatt', 'Reklamationen'],
    ['Fahrzeugbestand', 'Onlinequote'],
    ['Fahrzeugbestand', 'Anteil >90 Tage'],
  ];
  return wanted.map(([area, metric]) => {
    const row = rows.find(item => item[0] === area && item[1] === metric);
    return row ? monitorMetric(row) : monitorMetric([area, metric, '0', '0', '0', '0%', '0%']);
  });
}

function executiveKpiCard(item) {
  const color = item.status === 'good' ? '#238b63' : item.status === 'watch' ? '#d8a62e' : '#bd3f3f';
  return `
    <article class="kpi-card" style="--status:${color}">
      <div class="kpi-top">
        <div><b>${escapeHtml(item.metric)}</b><small>${escapeHtml(item.area)}</small></div>
        <div class="score">${item.timePct}%</div>
      </div>
      <div class="bar"><div class="fill" style="--pct:${Math.max(0, Math.min(item.timePct, 100))}%"></div></div>
      <div class="kpi-meta">
        <span><strong>${escapeHtml(item.actualLabel)}</strong>Ist</span>
        <span><strong>${escapeHtml(item.expectedLabel)}</strong>Soll</span>
        <span><strong>${escapeHtml(item.targetLabel)}</strong>Ziel</span>
      </div>
    </article>
  `;
}

function showPrintPreview(html, title = 'Bericht') {
  const existing = document.querySelector('#print-root');
  if (existing) existing.remove();
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  const page = template.content.querySelector('.page');
  const styleText = [...template.content.querySelectorAll('style')].map(style => style.textContent).join('\n');
  const root = document.createElement('section');
  root.id = 'print-root';
  root.innerHTML = `
    ${styleText ? `<style data-print-preview-style>${styleText}</style>` : ''}
    <div class="print-preview-overlay" role="dialog" aria-modal="true" aria-label="${escapeHtml(title)}">
      <div class="print-preview-shell">
        <div class="print-preview-toolbar">
          <div>
            <strong>${escapeHtml(title)}</strong>
            <span>Vorschau erstellt. Jetzt Druckdialog öffnen und unten als PDF speichern.</span>
          </div>
          <div class="print-preview-actions">
            <button class="ghost-button" type="button" data-print-close>Schließen</button>
            <button class="primary-button" type="button" data-print-dialog>Druckdialog öffnen</button>
          </div>
        </div>
        <div class="print-preview-page">${page ? page.outerHTML : html}</div>
      </div>
    </div>
  `;
  document.body.append(root);
  root.querySelector('[data-print-close]')?.addEventListener('click', () => root.remove());
  root.querySelector('[data-print-dialog]')?.addEventListener('click', () => window.print());
  toast('Berichtsvorschau geöffnet.');
}

function getExportDataset(type) {
  const values = getKpiActualValues();
  const salesPeriod = getSalesReportPeriod(getSalesState().entries || []);
  const reportMonthLabel = new Intl.DateTimeFormat('de-DE', { month: 'long', year: 'numeric' }).format(new Date(`${salesPeriod.monthKey}-01T12:00:00`));
  const datasets = {
    executive: {
      title: 'Bericht für GL',
      filename: `bericht-gl-${todayKey}`,
      headers: [],
      rows: [],
      summary: 'Executive Summary mit Top-10-KPIs, Zielerreichung, Bestandsqualität, Risiken und Maßnahmen.',
      customHtml: buildExecutiveReportHtml(),
    },
    monthly: {
      title: 'Monatsbericht Standortleitung',
      filename: `monatsbericht-${todayKey}`,
      headers: ['Bereich', 'Kennzahl', 'Ist bis heute', 'Monatsziel', 'Soll bis heute', 'Zeitquote', 'Monatszielquote'],
      rows: buildMonthlyReportRows(),
      summary: `Berichtsmonat ${reportMonthLabel}: alle Bereiche mit erreichtem Stand, zeitanteiligem Soll und Zielerreichung zum Monatsziel.`,
    },
    weekly: {
      title: 'Wochenbericht Standortleitung',
      filename: `wochenbericht-${todayKey}`,
      headers: ['Bereich', 'Inhalt'],
      rows: buildWeeklyReport(getEscalations()).split('\n').filter(Boolean).map(line => line.includes(':') ? line.split(/:(.*)/).slice(0, 2) : ['Notiz', line]),
      summary: 'Management-Review mit Kennzahlen, offenen Maßnahmen und Eskalationen.',
    },
    kpi: {
      title: 'KPI-Bericht',
      filename: `kpi-bericht-${todayKey}`,
      headers: ['Bereich', 'KPI', 'Ist-Wert'],
      rows: kpiGroups.flatMap(([area, items]) => items.map(item => [area, item, kpiValue(area, item, 'actual', values) || '–'])),
      summary: 'Aktuelle Kennzahlen der Standortsteuerung.',
    },
    inventory: {
      title: 'Bestandsbericht',
      filename: `fahrzeugbestand-${todayKey}`,
      headers: ['Nr.', 'Fahrzeug', 'Bestandsalter', 'Standzeit 0', 'Standzeit 1', 'Standzeit 2', 'Standzeit 3', 'Preis', 'Marktabweichung', 'Bilder', 'Online', 'DB', 'Status'],
      rows: buildInventoryReportRows(),
      summary: 'Fahrzeugbestand mit Bestandsalter, formaler Prozess-Standzeit 0-3, Online-Qualität und Ertrag.',
    },
    workshop: {
      title: 'Werkstattbericht',
      filename: `werkstatt-${todayKey}`,
      headers: ['Bereich', 'Kapazität', 'Produktivstunden', 'Offene Aufträge', 'Fehlteile', 'Fertigstellungen', 'Reklamationen'],
      rows: getWorkshop().map(item => [item.area, item.capacity, item.soldHours, item.openOrders, item.missingParts, item.completions, item.complaints]),
      summary: 'Werkstattsteuerung mit Engpässen und Tagesleistung.',
    },
    actions: {
      title: 'Maßnahmenbericht',
      filename: `massnahmen-${todayKey}`,
      headers: ['Maßnahme', 'Verantwortlich', 'Fällig', 'Priorität', 'Status'],
      rows: getActions().map(action => [action.title, action.owner, action.due || '', priorityLabel(action.priority), statusLabel(action.status)]),
      summary: 'Offene und erledigte Maßnahmen mit Verantwortlichkeit.',
    },
    meetings: {
      title: 'Meeting-Übersicht',
      filename: `meetings-${todayKey}`,
      headers: ['Datum', 'Meeting', 'Bereich', 'Zeit', 'Status', 'Teilnehmer', 'Entscheidungen', 'Aufgaben'],
      rows: getMeetings().map(meeting => [
        meeting.date,
        meeting.title,
        meeting.area,
        `${meeting.startTime}–${meeting.endTime}`,
        meetingStatusLabel(meeting.status),
        (meeting.participantIds || []).length,
        (meeting.decisions || []).length,
        (meeting.tasks || []).length,
      ]),
      summary: 'Meeting-Übersicht mit Status, Teilnehmern und dokumentierten Ergebnissen.',
    },
    sales: {
      title: 'Verkaufsmeldungen',
      filename: `verkaufsmeldungen-${todayKey}`,
      headers: ['Datum', 'Mitarbeiter', 'Kontakte', 'Leads', 'Angebote', 'Probefahrten', 'Abschlüsse'],
      rows: (getSalesState().entries || []).map(entry => [entry.date, entry.seller, entry.contacts, entry.leads, entry.offers, entry.testDrives, entry.sales]),
      summary: 'Mobile Verkaufsmeldungen aus der Mitarbeiter-App.',
    },
  };
  return datasets[type] || datasets.weekly;
}

function buildPrintableReport(dataset, autoPrint = false) {
  if (dataset.customHtml) return dataset.customHtml;
  const generated = new Intl.DateTimeFormat('de-DE', { dateStyle: 'full', timeStyle: 'short' }).format(new Date());
  const rows = dataset.rows.length ? dataset.rows : [['Keine Daten', '']];
  const theme = getCurrentTheme();
  const logo = printableLogoSvg(theme);
  return `<!doctype html>
    <html lang="de">
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(dataset.title)}</title>
        <style>
          body { margin: 0; color: #202428; font-family: Inter, Arial, sans-serif; background: #f5f6f7; }
          .page { max-width: 1040px; margin: 0 auto; padding: 34px; background: #fff; min-height: 100vh; }
          header { display: flex; justify-content: space-between; gap: 24px; align-items: flex-start; border-bottom: 3px solid ${escapeHtml(theme.accent)}; padding-bottom: 18px; margin-bottom: 24px; }
          h1 { margin: 0 0 8px; font-size: 30px; }
          p { margin: 0; color: #68717a; }
          .mark { width: 54px; height: 54px; display: grid; place-items: center; border-radius: 10px; background: #fff; border: 1px solid ${escapeHtml(theme.accent)}33; box-shadow: 0 8px 18px rgba(32,36,40,.08); overflow: hidden; }
          .mark svg { width: 54px; height: 54px; display: block; }
          .print-action { margin: 18px 0 22px; display: flex; justify-content: flex-end; }
          button { border: 0; border-radius: 8px; padding: 11px 15px; background: ${escapeHtml(theme.accent)}; color: #fff; font-weight: 800; cursor: pointer; }
          .meta { margin: 14px 0 22px; padding: 13px 15px; border: 1px solid #dde2e7; border-radius: 8px; background: #f8f9fa; }
          table { width: 100%; border-collapse: collapse; font-size: 13px; }
          th, td { padding: 10px 9px; border-bottom: 1px solid #dde2e7; text-align: left; vertical-align: top; }
          th { color: #68717a; text-transform: uppercase; font-size: 11px; letter-spacing: .02em; }
          footer { margin-top: 28px; color: #68717a; font-size: 12px; }
          @media print { body { background: #fff; } .page { padding: 20mm; } .print-action { display: none; } }
        </style>
      </head>
      <body>
        <main class="page">
          <header>
            <div>
              <h1>${escapeHtml(dataset.title)}</h1>
              <p>Operative Steuerung · Standortleitung</p>
            </div>
            <div class="mark" aria-label="Logo Standortleitung">${logo}</div>
          </header>
          <section class="meta">
            <strong>Erstellt:</strong> ${escapeHtml(generated)}<br />
            <strong>Zusammenfassung:</strong> ${escapeHtml(dataset.summary)}
          </section>
          <div class="print-action"><button onclick="window.print()">PDF / Drucken</button></div>
          <table>
            <thead><tr>${dataset.headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
            <tbody>${rows.map(row => `<tr>${dataset.headers.map((_, index) => `<td>${escapeHtml(row[index] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody>
          </table>
          <footer>Betriebsleiter Dashboard · ${escapeHtml(todayKey)}</footer>
        </main>
        ${autoPrint ? '<script>window.addEventListener("load", function () { setTimeout(function () { window.print(); }, 300); });<\/script>' : ''}
      </body>
    </html>`;
}

function printableLogoSvg(theme = getCurrentTheme()) {
  const accent = escapeHtml(theme.accent);
  const soft = escapeHtml(theme.soft);
  const ink = escapeHtml(theme.ink);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 96 96" aria-hidden="true">
    <defs>
      <linearGradient id="printLogoOrange" x1="18" x2="78" y1="20" y2="80" gradientUnits="userSpaceOnUse">
        <stop offset="0" stop-color="${accent}"/>
        <stop offset="1" stop-color="${accent}"/>
      </linearGradient>
    </defs>
    <rect width="96" height="96" rx="20" fill="#ffffff"/>
    <rect x="6" y="6" width="84" height="84" rx="18" fill="${soft}"/>
    <path d="M20 58h8l7-15c2-4 5-6 10-6h15c5 0 8 2 11 6l7 15h3c3 0 5 2 5 5v8H10v-8c0-3 2-5 5-5h5Z" fill="url(#printLogoOrange)"/>
    <path d="M37 44h23c3 0 5 1 7 4l4 9H28l4-9c1-3 3-4 5-4Z" fill="#ffffff" opacity=".95"/>
    <path d="M40 47h9v8H34l3-6c1-1 2-2 3-2Zm15 0h7c1 0 3 1 4 2l3 6H55v-8Z" fill="#dde2e7"/>
    <circle cx="29" cy="70" r="8" fill="${ink}"/>
    <circle cx="29" cy="70" r="3" fill="#ffffff"/>
    <circle cx="68" cy="70" r="8" fill="${ink}"/>
    <circle cx="68" cy="70" r="3" fill="#ffffff"/>
    <path d="M21 58h57" stroke="${ink}" stroke-width="3" stroke-linecap="round" opacity=".24"/>
    <path d="M21 27h18" stroke="${accent}" stroke-width="6" stroke-linecap="round"/>
    <path d="M21 37h10" stroke="${ink}" stroke-width="5" stroke-linecap="round" opacity=".82"/>
  </svg>`;
}

function toCsv(headers, rows) {
  return [headers, ...rows].map(row => row.map(cell => `"${String(cell ?? '').replace(/"/g, '""')}"`).join(';')).join('\n');
}

function toXls(title, headers, rows) {
  const table = `
    <table>
      <thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
      <tbody>${rows.map(row => `<tr>${headers.map((_, index) => `<td>${escapeHtml(row[index] ?? '')}</td>`).join('')}</tr>`).join('')}</tbody>
    </table>`;
  return `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(title)}</title></head><body>${table}</body></html>`;
}

function downloadText(filename, content, mimeType) {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function percent(value, target) {
  if (!target) return 0;
  return Math.round((Number(value || 0) / Number(target)) * 100);
}

function normalizeDate(value) {
  if (!value) return '';
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) return trimmed.slice(0, 10);
    const germanMatch = trimmed.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
    if (germanMatch) return `${germanMatch[3]}-${germanMatch[2].padStart(2, '0')}-${germanMatch[1].padStart(2, '0')}`;
  }
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return formatDateKey(date);
}

function isPlaceholderSeller(name) {
  return ['verkäufer', 'verkaeufer', 'seller'].includes(String(name || '').toLowerCase());
}

function priorityLabel(priority) {
  return { hoch: 'Hoch', mittel: 'Mittel', niedrig: 'Niedrig' }[priority] || 'Mittel';
}

function statusLabel(status) {
  return { open: 'Offen', doing: 'In Arbeit', done: 'Erledigt' }[status] || 'Offen';
}

function normalizeStatus(status) {
  const value = String(status || '').toLowerCase();
  if (['done', 'erledigt', 'abgeschlossen'].includes(value)) return 'done';
  if (['doing', 'in arbeit', 'läuft', 'laeuft'].includes(value)) return 'doing';
  return 'open';
}

function formatCurrency(value) {
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(value || 0));
}

function formatMetricValue(value, unit = '') {
  const number = Number(value || 0);
  if (unit === '€') return formatCurrency(number);
  if (unit === '%') return `${formatNumber(number)}%`;
  return formatNumber(number);
}

function formatNumber(value) {
  return new Intl.NumberFormat('de-DE', { maximumFractionDigits: 1 }).format(Number(value || 0));
}

function parseMetricNumber(value) {
  if (typeof value === 'number') return value;
  const normalized = String(value ?? '')
    .replace(/\./g, '')
    .replace(',', '.')
    .replace(/[^0-9.-]/g, '');
  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function formatDateShort(dateKey) {
  if (!dateKey) return 'ohne Datum';
  const date = new Date(`${dateKey}T12:00:00`);
  if (Number.isNaN(date.getTime())) return String(dateKey);
  return new Intl.DateTimeFormat('de-DE', { day: '2-digit', month: '2-digit' }).format(date);
}

function getWeekNumber(date) {
  const target = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNumber = target.getUTCDay() || 7;
  target.setUTCDate(target.getUTCDate() + 4 - dayNumber);
  const yearStart = new Date(Date.UTC(target.getUTCFullYear(), 0, 1));
  return Math.ceil((((target - yearStart) / 86400000) + 1) / 7);
}

function startOfWeek(date) {
  const result = new Date(date);
  const day = (result.getDay() + 6) % 7;
  result.setDate(result.getDate() - day);
  result.setHours(12, 0, 0, 0);
  return result;
}

function addDays(date, amount) {
  const result = new Date(date);
  result.setDate(result.getDate() + amount);
  return result;
}

function nextBusinessDay(date) {
  const result = new Date(date);
  result.setHours(12, 0, 0, 0);
  while (!isBusinessDay(result)) result.setDate(result.getDate() + 1);
  return result;
}

function isBusinessDay(date) {
  const day = date.getDay();
  if (day === 0 || day === 6) return false;
  return !badenWuerttembergHolidays(date.getFullYear()).has(formatDateKey(date));
}

function badenWuerttembergHolidays(year) {
  const easter = easterSunday(year);
  return new Set([
    `${year}-01-01`,
    `${year}-01-06`,
    formatDateKey(addDays(easter, -2)),
    formatDateKey(addDays(easter, 1)),
    `${year}-05-01`,
    formatDateKey(addDays(easter, 39)),
    formatDateKey(addDays(easter, 50)),
    formatDateKey(addDays(easter, 60)),
    `${year}-10-03`,
    `${year}-11-01`,
    `${year}-12-25`,
    `${year}-12-26`,
  ]);
}

function easterSunday(year) {
  const a = year % 19;
  const b = Math.floor(year / 100);
  const c = year % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const month = Math.floor((h + l - 7 * m + 114) / 31);
  const day = ((h + l - 7 * m + 114) % 31) + 1;
  return new Date(year, month - 1, day, 12, 0, 0, 0);
}

function slugify(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function getDayState() {
  state.days[todayKey] ||= { checks: {}, note: '' };
  return state.days[todayKey];
}

function getCurrentBlock() {
  const minutes = new Date().getHours() * 60 + new Date().getMinutes();
  return dailyBlocks.find(block => {
    const [start, end] = block.time.split(' - ').map(toMinutes);
    return minutes >= start && minutes <= end;
  });
}

function toMinutes(value) {
  const [hours, minutes] = value.split(':').map(Number);
  return hours * 60 + minutes;
}

function addMinutesToTime(value, minutesToAdd) {
  const total = toMinutes(value || '09:00') + Number(minutesToAdd || 0);
  const hours = Math.floor((total % (24 * 60)) / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function timeSortValue(value) {
  const match = String(value || '').match(/(\d{1,2}):(\d{2})/);
  if (!match) return 24 * 60;
  return Number(match[1]) * 60 + Number(match[2]);
}

function checkKey(blockId, index) {
  return `${blockId}-${index}`;
}

function kpiCard([label, value, note]) {
  return `<article class="kpi-card"><span>${label}</span><strong>${value}</strong><small>${note}</small></article>`;
}

function listOrEmpty(items = [], emptyLabel) {
  if (!items.length) return `<div class="compact-item"><span class="task-meta">${emptyLabel}</span></div>`;
  if (items.some(item => item.type === 'parent')) return renderTaskTree(items);
  return items.slice(0, 6).map(item => `
    <div class="compact-item">
      <strong>${item.title || item.summary}</strong>
      <span class="task-meta">${item.done ? 'erledigt' : item.time || item.due || 'heute'}</span>
    </div>
  `).join('');
}

function renderTaskTree(items) {
  const childrenByParent = new Map();
  items.filter(item => item.parent).forEach(item => {
    childrenByParent.set(item.parent, [...(childrenByParent.get(item.parent) || []), item]);
  });
  return items
    .filter(item => item.type === 'parent')
    .slice(0, 5)
    .map(parent => {
      const children = childrenByParent.get(parent.id) || [];
      return `
        <div class="compact-item task-parent">
          <strong>${parent.done ? '✓ ' : ''}${parent.title}</strong>
          <span class="task-meta">${children.filter(child => child.done).length}/${children.length} Unteraufgaben erledigt</span>
          <div class="subtask-list">
            ${children.slice(0, 4).map(child => `<span>${child.done ? '✓' : '□'} ${child.title.replace(`${parent.title} - `, '')}</span>`).join('')}
          </div>
        </div>
      `;
    }).join('');
}

function loadState() {
  const saved = localStorage.getItem(storageKey);
  const defaults = {
    days: {},
    calendarEvents: [],
    tasks: [],
    boardTodos: [],
    deletedBoardTodoIds: [],
    actions: [],
    meetings: [],
    activeMeetingId: '',
    customEmployees: [],
    inventory: [],
    workshop: [],
    sheetKpis: {},
    salesData: { entries: [], targets: {}, lastSync: '' },
    lastGoogleWriteSyncAt: 0,
    googleAccount: 'operionix@gmail.com',
    scriptUrl: '',
    tasklistId: '@default',
    meetingDriveBackup: false,
    lastMeetingBackupAt: '',
    backupFolderUrl: '',
    backupConfiguredAt: '',
    theme: 'orange',
  };
  if (!saved) return defaults;
  try {
    return { ...defaults, ...JSON.parse(saved) };
  } catch (error) {
    try {
      localStorage.setItem(`${storageKey}-defekt-${Date.now()}`, saved);
    } catch (backupError) {
      // The app must still start when the browser storage is damaged and full.
    }
    return defaults;
  }
}

function saveState() {
  try {
    localStorage.setItem(storageKey, JSON.stringify(state));
  } catch (error) {
    toast('Lokaler Speicher ist voll. Bitte Google-Sicherung prüfen und alte Browserdaten bereinigen.');
  }
}

function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function toast(message) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const node = document.createElement('div');
  node.className = 'toast';
  node.textContent = message;
  document.body.append(node);
  setTimeout(() => node.remove(), 3200);
}
