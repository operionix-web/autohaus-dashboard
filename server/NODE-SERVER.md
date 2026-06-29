# Node-Testserver

Falls Nginx noch nicht eingerichtet ist, kann die App direkt mit Node.js laufen.

## Starten

Auf dem Server:

```bash
cd /home/andreas/Projekte/Autohaus-App
nohup node server/static-server.js > server/app.log 2>&1 &
```

Danach ist die App erreichbar unter:

```text
http://167.233.152.145:8080/
```

## Stoppen

```bash
pkill -f "server/static-server.js"
```

## Status pruefen

```bash
ps aux | grep static-server
tail -n 50 /home/andreas/Projekte/Autohaus-App/server/app.log
```

## Hinweis

Das ist eine gute Zwischenloesung. Fuer den dauerhaften Produktivbetrieb ist Nginx mit HTTPS weiterhin besser.
