#!/bin/sh
set -eu

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T whatsapp-alerts sh -c 'wget -qO- --header="Content-Type: application/json" --post-data="{\"alerts\":[{\"status\":\"firing\",\"labels\":{\"alertname\":\"FCXTestAlert\",\"severity\":\"test\",\"service\":\"sre\"},\"annotations\":{\"summary\":\"Teste de alerta WhatsApp\",\"description\":\"Mensagem enviada pelo stack de observabilidade FCX.\"}}]}" http://localhost:8080/alertmanager'

echo
echo "Teste de alerta enviado."
