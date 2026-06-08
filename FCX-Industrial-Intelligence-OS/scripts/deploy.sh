#!/bin/sh
set -eu

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.prod.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"

echo "FCX production deploy - Ubuntu VPS"

if ! command -v docker >/dev/null 2>&1; then
  echo "Docker nao encontrado. Instale Docker antes de continuar."
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "Docker Compose plugin nao encontrado. Instale docker compose antes de continuar."
  exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
  echo "Criando $ENV_FILE a partir de .env.production.example"
  cp .env.production.example "$ENV_FILE"
  echo "Edite $ENV_FILE, troque os dominios e substitua todos os CHANGE_ME antes de executar novamente."
  exit 1
fi

if grep -q "CHANGE_ME" "$ENV_FILE"; then
  echo "Existem placeholders CHANGE_ME em $ENV_FILE. Ajuste senhas/tokens antes do deploy."
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

if [ -d .git ]; then
  echo "Atualizando repositorio..."
  git pull --ff-only || true
fi

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" build
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
sh scripts/healthcheck.sh
