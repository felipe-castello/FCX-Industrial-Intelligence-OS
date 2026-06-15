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

BACKUP_DIR="${BACKUP_DIR:-./backups}/postgres"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
TIMESTAMP="$(date +%Y%m%d-%H%M%S)"
BACKUP_FILE="$BACKUP_DIR/fcx-postgres-$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "Gerando backup PostgreSQL: $BACKUP_FILE"
docker compose -f "$COMPOSE_FILE" --env-file "$ENV_FILE" exec -T postgres \
  pg_dump -U "$POSTGRES_USER" -d "$POSTGRES_DB" --clean --if-exists | gzip > "$BACKUP_FILE"

find "$BACKUP_DIR" -type f -name "fcx-postgres-*.sql.gz" -mtime +"$RETENTION_DAYS" -delete

echo "Backup PostgreSQL concluido."
