$ErrorActionPreference = 'Stop'

$root = Split-Path -Parent $PSScriptRoot
$compose = Join-Path $root 'docker-compose.homologation.yml'
$backend = Join-Path $root 'backend'
$rollback = Join-Path $backend 'prisma\migrations\20260612180000_fcx_52_auth_rbac\rollback.sql'
$project = 'fcx-hml'

if ($compose -match 'production' -or $project -match 'production') {
  throw 'Safety guard: homologation validation cannot target production.'
}

function Invoke-HmlCompose {
  & docker compose -p $project -f $compose @args
  if ($LASTEXITCODE -ne 0) { throw "docker compose failed: $args" }
}

function Wait-Api {
  for ($attempt = 1; $attempt -le 60; $attempt++) {
    try {
      $health = Invoke-RestMethod -Uri 'http://127.0.0.1:53000/health' -TimeoutSec 2
      if ($health.status -eq 'ok') { return }
    } catch {}
    Start-Sleep -Seconds 2
  }
  throw 'Homologation API did not become healthy.'
}

function Invoke-E2E {
  Push-Location $backend
  try {
    $env:HML_API_URL = 'http://127.0.0.1:53000'
    $env:HML_INITIAL_ADMIN_PASSWORD = 'FCX-Hml-Admin-ChangeMe!'
    & node --test test/auth-rbac.homologation.e2e.test.js
    if ($LASTEXITCODE -ne 0) { throw 'Homologation E2E failed.' }
  } finally {
    Pop-Location
  }
}

Invoke-HmlCompose config --quiet
Invoke-HmlCompose up -d --build
Wait-Api

$tablesBefore = & docker exec fcx-hml-postgres psql -U fcx_hml -d fcx_hml -Atc "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"
$legacyCountsBefore = & docker exec fcx-hml-postgres psql -U fcx_hml -d fcx_hml -Atc "SELECT (SELECT count(*) FROM assets)||','||(SELECT count(*) FROM telemetry)||','||(SELECT count(*) FROM companies);"
Invoke-E2E

Get-Content -Raw $rollback | & docker exec -i fcx-hml-postgres psql -U fcx_hml -d fcx_hml
if ($LASTEXITCODE -ne 0) { throw 'FCX 5.2 rollback failed.' }

$authTablesAfterRollback = & docker exec fcx-hml-postgres psql -U fcx_hml -d fcx_hml -Atc "SELECT count(*) FROM pg_tables WHERE schemaname='public' AND tablename IN ('roles','permissions','role_permissions','auth_refresh_tokens','password_reset_tokens','audit_logs');"
if ($authTablesAfterRollback -ne '0') { throw 'Rollback left FCX 5.2 authentication tables behind.' }

$legacyCountsAfterRollback = & docker exec fcx-hml-postgres psql -U fcx_hml -d fcx_hml -Atc "SELECT (SELECT count(*) FROM assets)||','||(SELECT count(*) FROM telemetry)||','||(SELECT count(*) FROM companies);"
if ($legacyCountsBefore -ne $legacyCountsAfterRollback) { throw 'Rollback changed legacy data counts.' }

& docker exec fcx-hml-postgres psql -U fcx_hml -d fcx_hml -c "DELETE FROM _prisma_migrations WHERE migration_name='20260612180000_fcx_52_auth_rbac';"
& docker exec fcx-hml-backend npx prisma migrate deploy
& docker exec fcx-hml-backend npm run db:seed
Wait-Api
Invoke-E2E

$tablesAfter = & docker exec fcx-hml-postgres psql -U fcx_hml -d fcx_hml -Atc "SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename;"
$legacyCountsAfter = & docker exec fcx-hml-postgres psql -U fcx_hml -d fcx_hml -Atc "SELECT (SELECT count(*) FROM assets)||','||(SELECT count(*) FROM telemetry)||','||(SELECT count(*) FROM companies);"

[pscustomobject]@{
  Project = $project
  Migration = '20260612180000_fcx_52_auth_rbac'
  Rollback = 'passed'
  Reapply = 'passed'
  LegacyCountsBefore = $legacyCountsBefore
  LegacyCountsAfterRollback = $legacyCountsAfterRollback
  LegacyCountsAfterReapply = $legacyCountsAfter
  TablesBefore = ($tablesBefore -join ',')
  TablesAfter = ($tablesAfter -join ',')
} | Format-List
