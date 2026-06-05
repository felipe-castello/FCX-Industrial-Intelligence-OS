# FCX Industrial Intelligence OS

MVP de inteligencia industrial para ativos, telemetria, alarmes, ordens de servico e dashboards executivos.

## Stack

- Backend: NestJS
- Banco: PostgreSQL + TimescaleDB
- Cache/Fila: Redis
- Broker: EMQX MQTT
- Frontend: React + Vite
- Dashboards: Grafana
- Deploy futuro: Hostinger VPS com Docker Compose e Nginx

## Modulos do MVP

- Assets
- Telemetry
- Alarms
- Work Orders
- Dashboards
- Users
- Integrations

## Arquitetura industrial

A arquitetura completa de integracoes esta documentada em:

- `docs/ARCHITECTURE.md`
- `docs/PREDICTIVE-ENGINE.md`
- `docs/DATA-ACQUISITION-LAYER.md`
- `docs/DEPLOY-VPS-HOSTINGER.md`
- `docs/GO-LIVE-REVIEW.md`
- `docs/OBSERVABILIDADE-SRE.md`

## Deploy em VPS Hostinger

Arquivos de producao:

- `docker-compose.production.yml`
- `.env.production.example`
- `backend/Dockerfile.prod`
- `frontend/Dockerfile.prod`
- `deployment/nginx/nginx.production.template.conf`
- `deployment/nginx/nginx.bootstrap.template.conf`
- `scripts/deploy.sh`
- `scripts/start-prod.sh`
- `scripts/setup-ssl.sh`
- `scripts/backup-postgres.sh`
- `scripts/backup-redis.sh`

Comando principal na VPS:

```bash
cp .env.production.example .env.production
chmod +x scripts/*.sh backend/docker-entrypoint.prod.sh
nano .env.production
./scripts/deploy.sh
./scripts/setup-ssl.sh
```

Acessos planejados:

- https://app.fcx.local
- https://api.fcx.local
- https://grafana.fcx.local
- https://mqtt.fcx.local

Backups:

```bash
./scripts/backup-postgres.sh
./scripts/backup-redis.sh
```

Observabilidade:

```bash
./scripts/test-whatsapp-alert.sh
```

Dashboards operacionais ficam no Grafana em `FCX Operations`.

APIs sensiveis em producao exigem `X-API-Key` ou `Authorization: Bearer <JWT>`. Para gerar um JWT temporario:

```bash
cd backend
JWT_SECRET="valor_do_env" npm run security:jwt -- fcx-admin 3600
```

## Como rodar no Windows

Guia completo:

- `docs/EXECUCAO-WINDOWS.md`

Resumo rapido:

```powershell
cd "C:\Users\wanderson\Documents\FCX Inteligent OS\FCX-Industrial-Intelligence-OS\FCX-Industrial-Intelligence-OS"
Copy-Item .env.example .env
.\scripts\check-project.ps1
docker compose up -d
```

Backend local:

```powershell
cd backend
npm install
npm run start:dev
```

Frontend local:

```powershell
cd frontend
npm install
npm run dev
```

URLs:

- Frontend: http://localhost:5173
- Predictive Dashboard: http://localhost:5173/predictive
- Backend API: http://localhost:3000
- Backend Health: http://localhost:3000/health
- Grafana: http://localhost:3001
- EMQX Dashboard: http://localhost:18083

## Executar com Docker no Windows

Na raiz do projeto:

```powershell
cd "C:\Users\wanderson\Documents\FCX Inteligent OS\FCX-Industrial-Intelligence-OS\FCX-Industrial-Intelligence-OS"
Copy-Item .env.example .env
docker compose up --build
```

O backend executa automaticamente:

- `prisma generate`
- `prisma migrate deploy`
- `npm run db:seed`, quando `RUN_SEED=true`
- `npm run start:dev`

O servico `mqtt-simulator` tambem sobe no Docker Compose e publica telemetria a cada 5 segundos em `fcx/telemetry/{assetId}`.

## Executar localmente no Windows

Suba primeiro PostgreSQL/TimescaleDB, Redis e EMQX com Docker:

```powershell
docker compose up -d postgres redis emqx grafana
```

Depois rode o backend:

```powershell
cd backend
npm install
npm run prisma:generate
npm run prisma:migrate
npm run db:seed
npm run start:dev
```

Em outro terminal, rode o frontend:

```powershell
cd frontend
npm install
npm run dev
```

## Acessos

- Frontend: http://localhost:5173/dashboard
- Backend API: http://localhost:3000
- Backend Health: http://localhost:3000/health
- Grafana: http://localhost:3001
- EMQX Dashboard: http://localhost:18083

## Endpoints CRUD

Health:

- `GET /health`

Assets:

- `GET /assets`
- `GET /assets/:id`
- `POST /assets`
- `PATCH /assets/:id`
- `DELETE /assets/:id`

Telemetry:

- `GET /telemetry`
- `GET /telemetry/:id`
- `POST /telemetry`
- `PATCH /telemetry/:id`
- `DELETE /telemetry/:id`

Alarms:

- `GET /alarms`
- `GET /alarms/:id`
- `POST /alarms`
- `PATCH /alarms/:id`
- `DELETE /alarms/:id`

Work Orders:

- `GET /work-orders`
- `GET /work-orders/:id`
- `POST /work-orders`
- `PATCH /work-orders/:id`
- `DELETE /work-orders/:id`

Users:

- `GET /users`
- `GET /users/:id`
- `POST /users`
- `PATCH /users/:id`
- `DELETE /users/:id`

Dashboard:

- `GET /dashboards`

Integrations:

- `GET /integrations`
- `GET /integrations/architecture`
- `POST /integrations/ingest`
- `POST /integrations/modbus/read`
- `POST /integrations/carel-boss/pull`
- `POST /integrations/sitrad-pro/pull`
- `POST /integrations/thingsboard/pull`
- `POST /integrations/fcx-gateway/pull`

Predictive:

- `GET /predictive/health`
- `GET /predictive/failure`
- `GET /predictive/anomaly`
- `GET /predictive/anomalies`
- `GET /predictive/forecast`
- `GET /predictive/dashboard`

Data Acquisition:

- `GET /acquisition/architecture`
- `POST /acquisition/ingest`
- `POST /acquisition/mqtt/publish`
- `POST /acquisition/modbus/read`
- `POST /acquisition/carel-boss/pull`
- `POST /acquisition/sitrad-pro/pull`
- `POST /acquisition/thingsboard/pull`

## Dados mock

O seed carrega automaticamente:

- 50 ativos
- 5000+ registros de telemetria com padroes simulados para predicao
- 100 alarmes
- 50 ordens de servico
- 5 usuarios iniciais

Para rodar o seed manualmente:

```powershell
cd backend
npm run db:seed
```
