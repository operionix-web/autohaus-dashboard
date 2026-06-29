#!/usr/bin/env bash
set -euo pipefail

APP_DIR="/home/andreas/Projekte/Autohaus-App"
SITE_NAME="autohaus-app"
CONFIG_SOURCE="${APP_DIR}/server/nginx-autohaus-app.conf"
CONFIG_TARGET="/etc/nginx/sites-available/${SITE_NAME}"
CONFIG_LINK="/etc/nginx/sites-enabled/${SITE_NAME}"

if [[ "$(id -u)" -ne 0 ]]; then
  echo "Bitte mit sudo starten:"
  echo "  sudo ${APP_DIR}/server/install-nginx-ubuntu.sh"
  exit 1
fi

apt update
apt install -y nginx

cp "${CONFIG_SOURCE}" "${CONFIG_TARGET}"
ln -sfn "${CONFIG_TARGET}" "${CONFIG_LINK}"
rm -f /etc/nginx/sites-enabled/default

nginx -t
systemctl enable nginx
systemctl reload nginx

echo "Nginx ist eingerichtet."
echo "App: http://167.233.152.145/"
