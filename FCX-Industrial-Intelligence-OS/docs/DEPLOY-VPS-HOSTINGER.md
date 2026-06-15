# Deploy VPS Hostinger - FCX Industrial Intelligence OS

Guia de producao para Ubuntu 24.04 com Docker, Docker Compose, Nginx, PostgreSQL/TimescaleDB, Redis, EMQX, Grafana e SSL Let's Encrypt.

## Arquitetura

```text
Internet
  |
  v
Nginx :80/:443
  |
  |-- APP_DOMAIN              -> frontend:80
  |-- API_DOMAIN              -> backend:3000
  |-- GRAFANA_DOMAIN          -> grafana:3000
  |-- MQTT_DASHBOARD_DOMAIN   -> emqx:18083

MQTT TCP:
  mqtt://MQTT_PUBLIC_BIND:1883 -> emqx:1883

Rede interna Docker:
  backend -> postgres, redis, emqx
```

PostgreSQL e Redis nao sao publicados na internet. O acesso deve ser feito por SSH na VPS, Docker network ou tunel seguro.

## Arquivos de producao

- `docker-compose.production.yml`
- `.env.production`
- `.env.production.example`
- `backend/Dockerfile.prod`
- `frontend/Dockerfile.prod`
- `deployment/nginx/nginx.production.template.conf`
- `deployment/nginx/nginx.bootstrap.template.conf`
- `deployment/nginx/nginx.conf`
- `scripts/deploy.sh`
- `scripts/start-prod.sh`
- `scripts/setup-ssl.sh`
- `scripts/renew-ssl.sh`
- `scripts/backup-postgres.sh`
- `scripts/backup-redis.sh`
- `scripts/logs-prod.sh`
- `scripts/healthcheck-prod.sh`
- `scripts/test-whatsapp-alert.sh`
- `docs/OBSERVABILIDADE-SRE.md`

## 1. Preparar VPS Ubuntu 24.04

```bash
ssh root@IP_DA_VPS
sudo apt update && sudo apt upgrade -y
sudo apt install -y ca-certificates curl git ufw
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

Saia e entre novamente no SSH. Depois valide:

```bash
docker --version
docker compose version
```

## 2. Firewall

```bash
sudo ufw allow OpenSSH
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 1883/tcp
sudo ufw --force enable
sudo ufw status
```

Nao libere `5432`, `6379`, `3000`, `3001` ou `18083` publicamente.

## 3. Clonar ou enviar o projeto

```bash
git clone URL_DO_REPOSITORIO fcx-industrial-os
cd fcx-industrial-os
```

## 4. Configurar variaveis

```bash
cp .env.production.example .env.production
nano .env.production
```

Obrigatorio trocar:

- `APP_DOMAIN`
- `API_DOMAIN`
- `GRAFANA_DOMAIN`
- `MQTT_DASHBOARD_DOMAIN`
- `LETSENCRYPT_EMAIL`
- `SSL_ENABLED=false` no primeiro deploy
- `POSTGRES_PASSWORD`
- `DATABASE_URL`
- `REDIS_PASSWORD`
- `REDIS_URL`
- `JWT_SECRET`
- `API_KEY`
- `SECURITY_AUTH_ENABLED=true`
- `EMQX_DASHBOARD_PASSWORD`
- `EMQX_NODE_COOKIE`
- `GRAFANA_ADMIN_PASSWORD`
- `PROMETHEUS_RETENTION`
- `WHATSAPP_ACCESS_TOKEN`
- `WHATSAPP_PHONE_NUMBER_ID`
- `WHATSAPP_TO`

Use dominios publicos reais. Dominios `.local` nao emitem certificado Let's Encrypt.

## 5. DNS

Crie registros A apontando para o IP da VPS:

```text
app.seudominio.com      -> IP_DA_VPS
api.seudominio.com      -> IP_DA_VPS
grafana.seudominio.com  -> IP_DA_VPS
mqtt.seudominio.com     -> IP_DA_VPS
```

Aguarde a propagacao antes de emitir SSL.

## 6. Permissoes dos scripts

```bash
chmod +x scripts/*.sh backend/docker-entrypoint.prod.sh
```

## 7. Primeiro deploy sem SSL

O script renderiza Nginx, valida placeholders e sobe os containers.

```bash
./scripts/deploy.sh
```

Verifique:

```bash
./scripts/healthcheck-prod.sh
./scripts/logs-prod.sh backend
```

## 8. Emitir SSL Let's Encrypt

Execute somente depois que DNS estiver apontando para a VPS:

```bash
./scripts/setup-ssl.sh
```

O script sobe Nginx em modo bootstrap HTTP, emite o certificado com Certbot, renderiza o Nginx HTTPS e recarrega o proxy.
Ao concluir, o script altera `SSL_ENABLED=true` em `.env.production`.

## 9. Renovacao SSL

Teste manual:

```bash
./scripts/renew-ssl.sh
```

Agende no cron:

```bash
crontab -e
```

```text
15 3 * * * cd /caminho/fcx-industrial-os && ./scripts/renew-ssl.sh >> backups/ssl-renew.log 2>&1
```

## 10. Backups

Backup PostgreSQL:

```bash
./scripts/backup-postgres.sh
```

Backup Redis:

```bash
./scripts/backup-redis.sh
```

Agendamento diario:

```text
0 2 * * * cd /caminho/fcx-industrial-os && ./scripts/backup-postgres.sh >> backups/postgres-backup.log 2>&1
10 2 * * * cd /caminho/fcx-industrial-os && ./scripts/backup-redis.sh >> backups/redis-backup.log 2>&1
```

Os scripts respeitam `BACKUP_RETENTION_DAYS`.

## 11. Logs

Todos os containers usam rotação `json-file` com limite por arquivo. Para acompanhar:

```bash
./scripts/logs-prod.sh
./scripts/logs-prod.sh nginx
./scripts/logs-prod.sh backend
./scripts/logs-prod.sh postgres
```

Logs do Nginx tambem ficam no volume `nginx_production_logs`.

## 11.1. Observabilidade

O deploy sobe Prometheus, Loki, Alertmanager, exporters e dashboards Grafana.

Guia completo:

```text
docs/OBSERVABILIDADE-SRE.md
```

Teste de WhatsApp:

```bash
./scripts/test-whatsapp-alert.sh
```

## 12. Health checks

```bash
./scripts/healthcheck-prod.sh
docker compose -f docker-compose.production.yml --env-file .env.production ps
```

## 12.1. Autenticacao das APIs sensiveis

Em producao, `SECURITY_AUTH_ENABLED=true` protege:

- Todos os metodos `POST`, `PATCH` e `DELETE`.
- Todas as rotas `/users`.
- Ingestao industrial em `/integrations` e `/acquisition`.

Use uma das opcoes:

```bash
curl -H "X-API-Key: SUA_API_KEY" https://API_DOMAIN/assets
```

Ou gere um JWT HS256 temporario:

```bash
cd backend
JWT_SECRET="valor_do_env" npm run security:jwt -- fcx-admin 3600
```

Depois envie:

```bash
curl -H "Authorization: Bearer TOKEN_GERADO" https://API_DOMAIN/assets
```

URLs esperadas:

- `https://APP_DOMAIN`
- `https://API_DOMAIN/health`
- `https://GRAFANA_DOMAIN`
- `https://MQTT_DASHBOARD_DOMAIN`
- `mqtt://APP_DOMAIN:1883` ou `mqtt://MQTT_DASHBOARD_DOMAIN:1883`

## 13. Atualizacao de producao

```bash
git pull --ff-only
./scripts/start-prod.sh
```

## 14. Restauracao rapida

PostgreSQL:

```bash
gunzip -c backups/postgres/fcx-postgres-YYYYMMDD-HHMMSS.sql.gz | docker compose -f docker-compose.production.yml --env-file .env.production exec -T postgres psql -U "$POSTGRES_USER" -d "$POSTGRES_DB"
```

Redis:

```bash
gunzip -c backups/redis/fcx-redis-YYYYMMDD-HHMMSS.rdb.gz > /tmp/dump.rdb
docker cp /tmp/dump.rdb fcx-production-redis:/data/dump.rdb
docker compose -f docker-compose.production.yml --env-file .env.production restart redis
```

## Checklist antes do Go Live

- Dominios reais configurados no DNS.
- `.env.production` sem nenhum `CHANGE_ME`.
- Firewall liberando apenas `22`, `80`, `443` e `1883` se MQTT externo for necessario.
- SSL emitido e renovacao agendada.
- Backup PostgreSQL e Redis testados.
- `RUN_SEED=false`.
- Grafana com senha forte.
- EMQX Dashboard com senha forte.
- `./scripts/healthcheck-prod.sh` sem falhas.
