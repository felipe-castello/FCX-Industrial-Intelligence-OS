#!/bin/sh
set -eu

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

ENV_FILE="${ENV_FILE:-.env.production}"
MODE="${1:-production}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Arquivo $ENV_FILE nao encontrado."
  exit 1
fi

set -a
. "./$ENV_FILE"
set +a

case "$MODE" in
  production)
    TEMPLATE="deployment/nginx/nginx.production.template.conf"
    ;;
  bootstrap)
    TEMPLATE="deployment/nginx/nginx.bootstrap.template.conf"
    ;;
  *)
    echo "Modo invalido: $MODE. Use production ou bootstrap."
    exit 1
    ;;
esac

sed \
  -e "s/__APP_DOMAIN__/$APP_DOMAIN/g" \
  -e "s/__API_DOMAIN__/$API_DOMAIN/g" \
  -e "s/__GRAFANA_DOMAIN__/$GRAFANA_DOMAIN/g" \
  -e "s/__MQTT_DASHBOARD_DOMAIN__/$MQTT_DASHBOARD_DOMAIN/g" \
  "$TEMPLATE" > deployment/nginx/nginx.conf

echo "Nginx renderizado em modo $MODE."
