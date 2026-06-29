# Server-Umzug Standortleitungs-App

Diese Version ist eine separate Kopie der App fuer den Umzug auf einen eigenen Server. Die bestehende Version `version-3-meeting-integriert` bleibt unveraendert.

## Wichtige Hinweise zu Zugangsdaten

Bitte fuer den Umzug moeglichst keine privaten Hauptpasswoerter dauerhaft verwenden.

Empfohlen:

- separater Server-Benutzer nur fuer diese App
- SSH-Key statt Passwort, wenn moeglich
- Zugang nach dem Umzug wieder einschraenken oder Passwort aendern
- keine Google-Passwoerter weitergeben
- Apps-Script-URL und Google-Berechtigungen bleiben wie bisher getrennt

## Was ich fuer die Einrichtung brauche

Bekannt:

- Betriebssystem: Ubuntu 24.04 LTS
- Benutzer: `andreas`
- Projektordner: `/home/andreas/Projekte`
- App-Ordner: `/home/andreas/Projekte/Autohaus-App`

Noch benoetigt:

1. Server-Adresse oder Domain
2. SSH-Key oder temporaeres Passwort fuer Benutzer `andreas`
3. Soll die App unter einer Domain laufen, z. B. `app.deinedomain.de`, oder nur per Server-IP?
4. Soll HTTPS/SSL eingerichtet werden?
5. Ist Nginx schon installiert oder soll es eingerichtet werden?

## Technischer Stand

Die App ist aktuell eine statische Webapp:

- `index.html`
- `app.js`
- `styles.css`
- `manifest.webmanifest`
- Assets, Druckvorlagen und Importvorlagen

Sie braucht fuer den Betrieb keinen Node-Server. Ein normaler Webserver reicht.

Google Calendar, Google Tasks, Google Sheets und Google Drive laufen weiterhin ueber:

- `google-apps-script.js`
- die in der App gespeicherte Apps-Script-Web-App-URL

## Empfohlene Server-Struktur

```text
/home/andreas/Projekte/Autohaus-App/
  index.html
  app.js
  styles.css
  manifest.webmanifest
  assets/
  druckvorlagen/
  import-vorlagen/
```

## Nginx Beispiel

```nginx
server {
  listen 80;
  server_name app.deinedomain.de;
  root /home/andreas/Projekte/Autohaus-App;
  index index.html;

  location / {
    try_files $uri $uri/ /index.html;
  }

  location ~* \.(js|css|png|jpg|jpeg|svg|webmanifest|pdf)$ {
    expires 7d;
    add_header Cache-Control "public";
  }
}
```

Die vorbereitete Konfiguration liegt in:

```text
server/nginx-autohaus-app.conf
```

Vor dem Einsatz bitte `SERVER_NAME_HIER_EINTRAGEN` durch die echte Domain oder Server-IP ersetzen.

## Ubuntu 24.04 Kurzablauf

Auf dem Server:

```bash
mkdir -p /home/andreas/Projekte/Autohaus-App
```

Falls Nginx noch nicht installiert ist:

```bash
sudo apt update
sudo apt install nginx
```

Nginx-Konfiguration kopieren:

```bash
sudo cp /home/andreas/Projekte/Autohaus-App/server/nginx-autohaus-app.conf /etc/nginx/sites-available/autohaus-app
sudo ln -s /etc/nginx/sites-available/autohaus-app /etc/nginx/sites-enabled/autohaus-app
sudo nginx -t
sudo systemctl reload nginx
```

Falls HTTPS eingerichtet werden soll, nach DNS-Einrichtung:

```bash
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d app.deinedomain.de
```

## Apache Beispiel

Falls Apache genutzt wird, reicht meist ein normaler Webspace. Fuer Direktlinks kann eine `.htaccess` sinnvoll sein:

```apache
DirectoryIndex index.html

<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule ^ index.html [L]
</IfModule>
```

## Nach dem Upload pruefen

- App im Browser oeffnen
- System > Google: Apps-Script-URL pruefen
- Google synchronisieren
- Teamseite testen
- Heute-Seite testen
- Meetingarchiv testen
- Auf iPad und iPhone als Web-App neu zum Home-Bildschirm hinzufuegen, falls die Domain wechselt

## Wichtig bei Domainwechsel

Wenn die App bisher als PWA vom Netlify-Link installiert war, muss sie bei neuer Domain neu installiert werden. Lokale Browserdaten liegen pro Domain getrennt. Die eigentlichen produktiven Daten sollten deshalb in Google Sheets/Tasks/Calendar liegen.
