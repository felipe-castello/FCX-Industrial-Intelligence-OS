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

BACKUP_DIR="${BACKUP_DIR:-./backups}/redis"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_RDB="/backups/fcx-redis-$TIMESTAMP.rdb"
BACKUP_FILE="$BACKUP_DIR/fcx-redis-$TIMESTAMP.rdb.gz"

mkdir -p "$BACKUP_DIR"

echo "Gerando backup Redis: $BACKUP_FILE"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T redis \
  env REDISCLI_AUTH="$REDIS_PASSWORD" redis-cli --rdb "$BACKUP_RDB" >/dev/null

gzip -c "$BACKUP_DIR/fcx-redis-$TIMESTAMP.rdb" > "$BACKUP_FILE"
rm -f "$BACKUP_DIR/fcx-redis-$TIMESTAMP.rdb"

find "$BACKUP_DIR" -type f -name "fcx-redis-*.rdb.gz" -mtime +"$RETENTION_DAYS" -delete

echo "Backup Redis concluido."
