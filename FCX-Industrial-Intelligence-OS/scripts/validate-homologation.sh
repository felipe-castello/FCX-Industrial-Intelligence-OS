#!/usr/bin/env bash
set -Eeuo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
COMPOSE_FILE="${ROOT_DIR}/docker-compose.homologation.yml"
BACKEND_DIR="${ROOT_DIR}/backend"
ROLLBACK_FILE="${BACKEND_DIR}/prisma/migrations/20260612180000_fcx_52_auth_rbac/rollback.sql"
PROJECT_NAME="fcx-hml"
API_URL="${HML_API_URL:-http://127.0.0.1:53000}"
POSTGRES_CONTAINER="fcx-hml-postgres"
BACKEND_CONTAINER="fcx-hml-backend"
POSTGRES_USER="${HML_POSTGRES_USER:-fcx_hml}"
POSTGRES_DB="${HML_POSTGRES_DB:-fcx_hml}"
MIGRATION_NAME="20260612180000_fcx_52_auth_rbac"

log() {
  printf '\n[FCX HML] %s\n' "$*"
}

fail() {
  printf '\n[FCX HML] ERRO: %s\n' "$*" >&2
  exit 1
}

require_command() {
  command -v "$1" >/dev/null 2>&1 || fail "Comando obrigatorio ausente: $1"
}

compose() {
  docker compose -p "${PROJECT_NAME}" -f "${COMPOSE_FILE}" "$@"
}

psql_hml() {
  docker exec -i "${POSTGRES_CONTAINER}" psql -v ON_ERROR_STOP=1 -U "${POSTGRES_USER}" -d "${POSTGRES_DB}" "$@"
}

wait_for_api() {
  local attempt
  for attempt in $(seq 1 90); do
    if curl --fail --silent --show-error "${API_URL}/health" |
      grep -Eq '"status"[[:space:]]*:[[:space:]]*"ok"'; then
      return 0
    fi
    sleep 2
  done
  fail "API de homologacao nao ficou saudavel em ${API_URL}"
}

run_e2e() {
  (
    cd "${BACKEND_DIR}"
    HML_API_URL="${API_URL}" \
    HML_INITIAL_ADMIN_PASSWORD="${HML_INITIAL_ADMIN_PASSWORD:-FCX-Hml-Admin-ChangeMe!}" \
      node --test test/auth-rbac.homologation.e2e.test.js
  )
}

legacy_counts() {
  psql_hml -Atc \
    "SELECT (SELECT count(*) FROM assets)||','||(SELECT count(*) FROM telemetry)||','||(SELECT count(*) FROM companies);"
}

require_command docker
require_command curl
require_command node

[[ -f "${COMPOSE_FILE}" ]] || fail "Compose de homologacao ausente: ${COMPOSE_FILE}"
[[ -f "${ROLLBACK_FILE}" ]] || fail "Rollback Auth/RBAC ausente: ${ROLLBACK_FILE}"
[[ -f "${BACKEND_DIR}/test/auth-rbac.homologation.e2e.test.js" ]] ||
  fail "Teste E2E de homologacao ausente"

case "${PROJECT_NAME} ${COMPOSE_FILE} ${API_URL} ${POSTGRES_CONTAINER} ${BACKEND_CONTAINER}" in
  *production*|*prod-*|*-prod*|*fcx-postgres*|*fcx-backend*)
    fail "Trava de seguranca: alvo pode apontar para producao"
    ;;
esac

[[ "${POSTGRES_DB}" == fcx_hml* ]] ||
  fail "Trava de seguranca: HML_POSTGRES_DB deve iniciar com fcx_hml"
[[ "${POSTGRES_CONTAINER}" == fcx-hml-* ]] ||
  fail "Trava de seguranca: container PostgreSQL nao e de homologacao"

log "Validando configuracao isolada"
compose config --quiet

log "Criando banco e servicos exclusivos de homologacao"
compose up -d --build postgres-hml redis-hml emqx-hml backend-hml
wait_for_api

log "Executando migrate deploy e seed idempotente"
docker exec "${BACKEND_CONTAINER}" npx prisma migrate deploy
docker exec "${BACKEND_CONTAINER}" npm run db:seed
wait_for_api

log "Validando login, JWT, RBAC, refresh token, auditoria e rotas legadas"
COUNTS_BEFORE="$(legacy_counts)"
run_e2e

log "Executando rollback exclusivo da migration FCX 5.2"
psql_hml <"${ROLLBACK_FILE}"

AUTH_TABLES_AFTER_ROLLBACK="$(
  psql_hml -Atc \
    "SELECT count(*) FROM pg_tables WHERE schemaname='public' AND tablename IN ('roles','permissions','role_permissions','auth_refresh_tokens','password_reset_tokens','audit_logs');"
)"
[[ "${AUTH_TABLES_AFTER_ROLLBACK}" == "0" ]] ||
  fail "Rollback deixou tabelas Auth/RBAC no banco"

COUNTS_AFTER_ROLLBACK="$(legacy_counts)"
[[ "${COUNTS_BEFORE}" == "${COUNTS_AFTER_ROLLBACK}" ]] ||
  fail "Rollback alterou contagens legadas: antes=${COUNTS_BEFORE}, depois=${COUNTS_AFTER_ROLLBACK}"

log "Reaplicando migration e seed"
psql_hml -c "DELETE FROM _prisma_migrations WHERE migration_name='${MIGRATION_NAME}';"
docker exec "${BACKEND_CONTAINER}" npx prisma migrate deploy
docker exec "${BACKEND_CONTAINER}" npm run db:seed
wait_for_api

log "Executando E2E final apos reaplicacao"
run_e2e
COUNTS_AFTER_REAPPLY="$(legacy_counts)"

[[ "${COUNTS_BEFORE}" == "${COUNTS_AFTER_REAPPLY}" ]] ||
  fail "Reaplicacao alterou contagens legadas: antes=${COUNTS_BEFORE}, depois=${COUNTS_AFTER_REAPPLY}"

log "Homologacao concluida com sucesso"
printf '%s\n' \
  "Projeto: ${PROJECT_NAME}" \
  "Migration: ${MIGRATION_NAME}" \
  "Rollback: aprovado" \
  "Reaplicacao: aprovada" \
  "E2E Auth/RBAC: aprovado" \
  "Contagens legadas preservadas: ${COUNTS_AFTER_REAPPLY}" \
  "Ambiente mantido ativo para inspecao: docker compose -p ${PROJECT_NAME} -f ${COMPOSE_FILE} ps"
