# Observabilidade SRE - FCX Industrial Intelligence OS

Stack implementada:

- Grafana
- Prometheus
- Loki
- Promtail
- Alertmanager
- Node Exporter
- cAdvisor
- PostgreSQL Exporter
- Redis Exporter
- Blackbox Exporter
- WhatsApp Alert Webhook

## Arquitetura

```text
Backend /metrics
PostgreSQL Exporter
Redis Exporter
EMQX Prometheus endpoint
Node Exporter
cAdvisor
Blackbox Exporter
        |
        v
    Prometheus
        |
        +--> Grafana dashboards
        +--> Alertmanager --> whatsapp-alerts --> WhatsApp Cloud API

Docker logs --> Promtail --> Loki --> Grafana logs
```

## O que esta sendo monitorado

- CPU da VPS: `node_cpu_seconds_total`
- RAM da VPS: `node_memory_MemAvailable_bytes`
- Disco da VPS: `node_filesystem_*`
- Docker/containers: `container_cpu_usage_seconds_total`, `container_memory_usage_bytes`
- API NestJS: `/metrics`, `fcx_api_up`, `fcx_api_http_requests_total`, memoria e uptime
- PostgreSQL: `pg_up`, conexoes, atividade e estatisticas de banco
- Redis: `redis_up`, memoria e limite
- MQTT/EMQX: endpoint Prometheus `/api/v5/prometheus/stats`
- Health HTTP: backend, frontend, Grafana e EMQX via Blackbox
- Logs: containers `fcx-*` via Loki

## Dashboards Grafana

Provisionados automaticamente:

- `FCX Operations Overview`
- `FCX Data Services - PostgreSQL Redis MQTT`

Acesso:

```text
https://GRAFANA_DOMAIN
```

## Alertas

Regras em:

```text
observability/prometheus/rules/fcx-alerts.yml
```

Alertas criados:

- API indisponivel
- Taxa de erro HTTP 5xx alta
- CPU alta
- RAM alta
- Disco acima de 85%
- PostgreSQL indisponivel
- PostgreSQL com muitas conexoes
- Redis indisponivel
- Redis com memoria alta
- EMQX/MQTT indisponivel
- Container reiniciando

## WhatsApp

O Alertmanager envia alertas para:

```text
whatsapp-alerts:8080/alertmanager
```

Configure no `.env.production`:

```text
WHATSAPP_ACCESS_TOKEN=token_da_meta_cloud_api
WHATSAPP_PHONE_NUMBER_ID=id_do_numero
WHATSAPP_TO=5511999999999
```

Sem essas variaveis, o serviço nao falha; ele registra os alertas em log.

Teste:

```bash
./scripts/test-whatsapp-alert.sh
```

## Comandos uteis

Ver status:

```bash
docker compose -f docker-compose.production.yml --env-file .env.production ps
```

Ver targets do Prometheus:

```text
Grafana -> Explore -> Prometheus -> up
```

Ver logs:

```text
Grafana -> Explore -> Loki -> {container=~"fcx-production-.+"}
```

Recarregar regras Prometheus:

```bash
docker compose -f docker-compose.production.yml --env-file .env.production kill -s HUP prometheus
```

## Retencao

- Prometheus: `PROMETHEUS_RETENTION=15d`
- Loki: 168h configurado em `observability/loki/loki.yml`
- Docker logs: rotacao no Compose com `max-size=20m` e `max-file=7`

## Observacoes operacionais

- Prometheus, Loki e Alertmanager nao sao expostos publicamente; o acesso principal e via Grafana.
- O WhatsApp usa a Cloud API da Meta. Para producao real, use template aprovado se a conta exigir mensagens iniciadas por template.
- cAdvisor exige acesso privilegiado ao host Docker para coletar metricas de containers.
