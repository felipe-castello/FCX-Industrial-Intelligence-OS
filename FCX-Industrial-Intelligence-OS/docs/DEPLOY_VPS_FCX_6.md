# Deploy VPS FCX 6.0

## Objetivo

Subir o FCX 6.0 em uma VPS Linux com Docker, Docker Compose, Nginx e dominio `nexusiotenergy.com.br`, mantendo o FCX 5.0 preservado e os modulos externos carregados apenas por feature flags.

## Requisitos da VPS

Minimo recomendado:

- Ubuntu 24.04 LTS
- 4 vCPU
- 8 GB RAM
- 80 GB SSD
- Docker Engine
- Docker Compose plugin
- Dominio apontando para o IP da VPS

Recomendado para producao inicial:

- 8 vCPU
- 16 GB RAM
- 160 GB SSD
- Snapshot automatico da VPS
- Firewall liberando apenas 22, 80, 443 e MQTT se necessario

## Instalacao Docker

```bash
sudo apt update
sudo apt install -y ca-certificates curl gnupg git
sudo install -m 0755 -d /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg
sudo chmod a+r /etc/apt/keyrings/docker.gpg
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(. /etc/os-release && echo "$VERSION_CODENAME") stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null
sudo apt update
sudo apt install -y docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin
sudo usermod -aG docker "$USER"
```

Sair e entrar novamente na sessao SSH apos adicionar o usuario ao grupo Docker.

## Configuracao de dominio

Criar registros DNS:

- `app.nexusiotenergy.com.br` apontando para o IP da VPS
- `api.nexusiotenergy.com.br` apontando para o IP da VPS
- `grafana.nexusiotenergy.com.br` apontando para o IP da VPS
- `mqtt.nexusiotenergy.com.br` apontando para o IP da VPS, se EMQX dashboard for publicado

## Configuracao .env

```bash
cp .env.production.example .env.production
nano .env.production
```

Obrigatorio trocar todos os `CHANGE_ME`.

Variaveis centrais:

```env
NODE_ENV=production
FCX_ENV=production
DOMAIN=nexusiotenergy.com.br
APP_URL=https://app.nexusiotenergy.com.br
API_URL=https://api.nexusiotenergy.com.br
DATABASE_URL=postgresql://fcx:SENHA@postgres:5432/fcx_industrial_os
REDIS_URL=redis://:SENHA@redis:6379
JWT_SECRET=CHANGE_ME_RANDOM_JWT_SECRET_64_CHARS_MIN
OPENAI_API_KEY=
ANTHROPIC_API_KEY=
GOOGLE_API_KEY=
GITHUB_TOKEN=
NANGO_SECRET_KEY=
NANGO_HOST=
```

Feature flags seguras:

```env
ENABLE_AGENT_SKILLS=false
ENABLE_LIBRECHAT=false
ENABLE_LANGCHAIN=true
ENABLE_NANGO=false
ENABLE_QUANTDINGER=false
ENABLE_UNDERSTAND_ANYTHING=false
```

## Build

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml build
```

## Deploy

```bash
chmod +x scripts/*.sh backend/docker-entrypoint.prod.sh
./scripts/deploy.sh
```

O script:

1. Valida Docker e Docker Compose.
2. Exige `.env.production`.
3. Bloqueia deploy se houver `CHANGE_ME`.
4. Renderiza Nginx conforme `SSL_ENABLED`.
5. Executa build.
6. Sobe os containers.
7. Executa healthcheck.

## SSL

Bootstrap HTTP:

```env
SSL_ENABLED=false
```

Depois que DNS estiver apontado:

```bash
./scripts/setup-ssl.sh
```

Ativar SSL:

```env
SSL_ENABLED=true
```

Redeploy:

```bash
./scripts/deploy.sh
```

## Healthcheck

Endpoint:

```http
GET https://api.nexusiotenergy.com.br/api/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "version": "6.0",
  "database": "connected",
  "redis": "connected"
}
```

Comando:

```bash
./scripts/healthcheck.sh
```

## Logs

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f backend
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f frontend
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f nginx
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f postgres
docker compose --env-file .env.production -f docker-compose.prod.yml logs -f redis
```

Tambem existe:

```bash
./scripts/logs-prod.sh
```

## Backup

Backup PostgreSQL:

```bash
./scripts/backup-db.sh
```

Backups sao criados em:

```text
backups/postgres/
```

Redis:

```bash
./scripts/backup-redis.sh
```

## Restore

```bash
./scripts/restore-db.sh ./backups/postgres/fcx_postgres_YYYYMMDD_HHMMSS.sql.gz
```

Executar restore apenas em janela controlada. Validar snapshot da VPS antes.

## Rollback

Rollback simples por Git:

```bash
git log --oneline -5
git checkout <commit_anterior>
docker compose --env-file .env.production -f docker-compose.prod.yml up -d --build
./scripts/healthcheck.sh
```

Rollback por imagem:

1. Identificar tag anterior no registry, se houver.
2. Ajustar imagem no Compose.
3. Rodar `docker compose up -d`.

## Modulos externos

Os modulos FCX 6.0 ficam isolados em:

```text
fcx-6.0/modules/
```

Regras:

- Nao misturar codigo externo no core.
- Nao quebrar FCX 5.0.
- Usar feature flags.
- Se um modulo externo falhar, retornar fallback seguro.
- QuantDinger somente em `research` ou `simulation`.
- Nenhuma ordem financeira real deve ser executada.

## Worker opcional

Existe um worker modular opcional:

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml --profile workers up -d fcx-workers
```

Ele nao sobe por padrao e nao e necessario para o core FCX funcionar.

## Validacao final

```bash
docker compose --env-file .env.production -f docker-compose.prod.yml ps
./scripts/healthcheck.sh
docker compose --env-file .env.production -f docker-compose.prod.yml logs --tail=100 backend
```
