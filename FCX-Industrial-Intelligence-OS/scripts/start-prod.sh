#!/bin/sh
set -eu

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Arquivo $ENV_FILE nao encontrado."
  echo "Copie .env.production.example para $ENV_FILE e ajuste senhas/dominios antes de iniciar."
  exit 1
fi

if grep -q "CHANGE_ME" "$ENV_FILE"; then
  echo "Existem placeholders CHANGE_ME em $ENV_FILE. Ajuste senhas/tokens antes de iniciar."
  exit 1
fi

set -a
. "./$ENV_FILE"
set +a

mkdir -p backups/postgres backups/redis
if [ "${SSL_ENABLED:-false}" = "true" ]; then
  sh scripts/render-nginx.sh production
else
  sh scripts/render-nginx.sh bootstrap
fi

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
