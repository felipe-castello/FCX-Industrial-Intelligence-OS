#!/bin/sh
set -eu

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"

if [ ! -f "$ENV_FILE" ]; then
  echo "Arquivo $ENV_FILE nao encontrado."
  exit 1
fi

set -a
. "./$ENV_FILE"
set +a

case "$APP_DOMAIN $API_DOMAIN $GRAFANA_DOMAIN $MQTT_DASHBOARD_DOMAIN" in
  *fcx.local*)
    echo "Dominios .local nao sao validos para Let's Encrypt. Configure dominios publicos reais no $ENV_FILE."
    exit 1
    ;;
esac

if [ "${LETSENCRYPT_EMAIL:-}" = "admin@fcx.local" ]; then
  echo "Configure LETSENCRYPT_EMAIL com um email real antes de emitir SSL."
  exit 1
fi

sh scripts/render-nginx.sh bootstrap

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d --build nginx
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" run --rm certbot

sh scripts/render-nginx.sh production
if grep -q "^SSL_ENABLED=" "$ENV_FILE"; then
  sed -i "s/^SSL_ENABLED=.*/SSL_ENABLED=true/" "$ENV_FILE"
else
  printf "\nSSL_ENABLED=true\n" >> "$ENV_FILE"
fi
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" up -d nginx
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec nginx nginx -s reload

echo "SSL configurado para:"
echo "- https://$APP_DOMAIN"
echo "- https://$API_DOMAIN"
echo "- https://$GRAFANA_DOMAIN"
echo "- https://$MQTT_DASHBOARD_DOMAIN"
