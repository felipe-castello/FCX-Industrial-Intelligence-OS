#!/bin/sh
set -eu

PROJECT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
cd "$PROJECT_DIR"

COMPOSE_FILE="${COMPOSE_FILE:-docker-compose.production.yml}"
ENV_FILE="${ENV_FILE:-.env.production}"

docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" ps
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T backend node -e "fetch('http://127.0.0.1:3000/health').then(r=>r.text()).then(t=>{console.log(t.trim()); process.exit(0)}).catch(e=>{console.error(e.message); process.exit(1)})"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T backend node -e "fetch('http://127.0.0.1:3000/metrics').then(r=>{console.log('metrics', r.status); process.exit(r.ok?0:1)}).catch(e=>{console.error(e.message); process.exit(1)})"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T whatsapp-alerts wget -qO- http://localhost:8080/health >/dev/null
