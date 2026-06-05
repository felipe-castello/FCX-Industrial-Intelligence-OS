#!/bin/sh
set -eu

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm --entrypoint certbot certbot renew --webroot --webroot-path=/var/www/certbot
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec nginx nginx -s reload

echo "Renovacao SSL concluida."
