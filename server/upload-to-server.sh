#!/usr/bin/env bash
set -euo pipefail

SERVER_HOST="${1:-SERVER_ADRESSE_HIER_EINTRAGEN}"
SERVER_USER="andreas"
REMOTE_DIR="/home/andreas/Projekte/Autohaus-App"
LOCAL_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [[ "$SERVER_HOST" == "SERVER_ADRESSE_HIER_EINTRAGEN" ]]; then
  echo "Bitte Server-Adresse angeben:"
  echo "  ./server/upload-to-server.sh deine-domain.de"
  exit 1
fi

ssh "${SERVER_USER}@${SERVER_HOST}" "mkdir -p '${REMOTE_DIR}'"
rsync -avz --delete \
  --exclude='.DS_Store' \
  --exclude='server/upload-to-server.sh' \
  "${LOCAL_DIR}/" "${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}/"

echo "Upload abgeschlossen: ${SERVER_USER}@${SERVER_HOST}:${REMOTE_DIR}"
