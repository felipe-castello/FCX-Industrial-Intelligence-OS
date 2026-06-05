# FCX Industrial Intelligence OS - Go Live Review

## Decisao atual

```text
NO GO
```

Motivo: o projeto foi endurecido para producao, mas ainda precisa de validacao real em VPS antes de liberar para cliente ou operacao industrial. O que falta e externo ao codigo: DNS real, SSL, senhas definitivas, backup testado, smoke test dos containers e politica de acesso.

## Riscos corrigidos nesta revisao

- CORS deixou de ser aberto e agora usa `CORS_ORIGIN`.
- Backend recebeu `helmet` e `compression`.
- Redis em producao passou a exigir senha.
- PostgreSQL e Redis foram limitados a `127.0.0.1` no host da VPS.
- EMQX Dashboard recebeu usuario/senha via env.
- Docker Compose de producao recebeu healthchecks.
- Docker Compose de producao recebeu rotacao de logs.
- Nginx recebeu headers basicos de seguranca e healthcheck.
- Prisma CLI passou para dependencies para migracoes em runtime.
- Script de backup PostgreSQL foi criado.
- `.gitignore` foi criado para proteger `.env.production`, `.env`, backups e artefatos.

## Obrigatorio antes do deploy

□ Definir dominio real para substituir `fcx.local`.

□ Criar registros DNS:

- `app.seudominio.com`
- `api.seudominio.com`
- `grafana.seudominio.com`
- `mqtt.seudominio.com`

□ Copiar `.env.production.example` para `.env.production`.

□ Trocar todas as senhas:

- `POSTGRES_PASSWORD`
- `REDIS_PASSWORD`
- `JWT_SECRET`
- `API_KEY`
- `GRAFANA_ADMIN_PASSWORD`
- `EMQX_DASHBOARD_PASSWORD`

□ Ajustar `DATABASE_URL` com a mesma senha do Postgres.

□ Ajustar `REDIS_URL` com a mesma senha do Redis.

□ Ajustar `PUBLIC_API_URL` para o dominio real da API.

□ Ajustar `CORS_ORIGIN` para o dominio real do frontend.

□ Rodar deploy em VPS:

```bash
chmod +x scripts/deploy.sh scripts/start-prod.sh scripts/backup-postgres.sh backend/docker-entrypoint.prod.sh
./scripts/deploy.sh
```

□ Verificar containers:

```bash
docker compose -f docker-compose.production.yml --env-file .env.production ps
```

□ Testar healthcheck:

```bash
curl http://api.seudominio.com/health
```

□ Configurar SSL com Certbot ou proxy externo da Hostinger/Cloudflare.

□ Fechar no firewall acesso publico a Postgres e Redis. No Compose eles ja estao bindados em `127.0.0.1`, mas confirme com:

```bash
sudo ufw status
```

□ Rodar e restaurar um backup de teste antes do Go Live.

## Recomendado antes do deploy

□ Configurar Cloudflare ou DNS gerenciado com proxy/SSL.

□ Criar job cron para backup diario:

```bash
0 2 * * * cd /caminho/fcx-industrial-os && ./scripts/backup-postgres.sh
```

□ Configurar retencao de backups, por exemplo 7 ou 14 dias.

□ Revisar usuarios padrao do Grafana e EMQX.

□ Revisar dashboards Grafana provisionados e ajustar paineis especificos de negocio.

□ Validar alertas Prometheus/Alertmanager em producao com WhatsApp real.

□ Criar rotina de smoke test apos deploy.

□ Definir politica de logs e volume maximo.

□ Validar latencia MQTT com um gateway real.

## Pode esperar versao 5.1

□ Autenticacao completa no frontend.

□ RBAC granular por cliente/unidade.

□ HTTPS automatizado via container Certbot.

□ Avaliar Tempo/tracing distribuido apos estabilizar Prometheus + Loki.

□ Rate limit no backend.

□ CI/CD automatizado.

□ Backup incremental e offsite.

□ Multi-tenant hardening.

□ Retencao e compressao TimescaleDB.

## Smoke test minimo

```bash
curl http://api.seudominio.com/health
curl http://api.seudominio.com/assets
curl http://api.seudominio.com/predictive/dashboard
curl http://api.seudominio.com/acquisition/architecture
```
