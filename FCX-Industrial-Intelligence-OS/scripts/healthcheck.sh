#!/bin/sh
set -eu

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

ENV_FILE="${ENV_FILE:-.env.production}"

if [ -f "$ENV_FILE" ]; then
  set -a
  . "./$ENV_FILE"
  set +a
fi

API_HEALTH_URL="${API_HEALTH_URL:-${API_URL:-http://localhost:3000}/api/health}"

echo "Verificando $API_HEALTH_URL"

if command -v curl >/dev/null 2>&1; then
  curl -fsS "$API_HEALTH_URL"
elif command -v wget >/dev/null 2>&1; then
  wget -qO- "$API_HEALTH_URL"
else
  echo "curl ou wget sao necessarios para o healthcheck."
  exit 1
fi

echo
echo "Healthcheck concluido."
