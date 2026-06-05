#!/bin/sh
set -eu

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"
SERVICE="${1:-}"

if [ -n "$SERVICE" ]; then
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f --tail=200 "$SERVICE"
else
  docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" logs -f --tail=200
fi
