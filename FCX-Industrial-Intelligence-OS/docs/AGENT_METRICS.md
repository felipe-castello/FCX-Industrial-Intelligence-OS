# FCX Agent Metrics Model

## Purpose

Define observability for Agent Master governance without activating new production infrastructure.

Canonical definition: `agents/master/governance/agent-metrics-model.json`.

## Required Metrics

| Metric | Type | Purpose |
| --- | --- | --- |
| `fcx_agent_tasks_total` | Counter | Tasks by agent, domain, and result |
| `fcx_agent_task_duration_seconds` | Histogram | Execution latency and SLA |
| `fcx_agent_task_failures_total` | Counter | Failures and retries |
| `fcx_agent_tokens_total` | Counter | Input/output token consumption |
| `fcx_agent_active_executions` | Gauge | Current active work |
| `fcx_agent_sla_breaches_total` | Counter | SLA violations |
| `fcx_agent_approval_wait_seconds` | Histogram | Time waiting at governance gates |
| `fcx_agent_routing_failures_total` | Counter | Unroutable or policy-blocked tasks |

## Label Safety

Allowed labels include environment, tenant tier, agent ID, domain, and result. Never use tenant IDs, user IDs, task IDs, prompts, secrets, or high-cardinality evidence references as Prometheus labels.

## Proposed SLOs

- Routing availability: 99.9%.
- Task success rate: 99.0%, excluding policy rejections.
- Approval audit coverage: 100%.
- No deployment without human-approval audit event: 100%.

## Storage Model

- Prometheus-compatible metrics: aggregate operational telemetry.
- PostgreSQL `agent_metrics`: bounded tenant-level usage and governance reporting.
- Audit trail: authoritative approval and deployment evidence.

## Alerts

- Routing failure spike.
- Stale task or missing heartbeat.
- Dead-letter queue growth.
- Approval waiting beyond SLA.
- Deployment attempted without valid human approval.
- Audit write failure.
- Token budget or failure-rate threshold exceeded.
