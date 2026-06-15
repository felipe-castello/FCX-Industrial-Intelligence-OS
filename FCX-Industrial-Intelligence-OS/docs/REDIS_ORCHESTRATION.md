# FCX Agent Master Redis Orchestration Model

## Status

Architecture definition only. No queues, consumer groups, locks, or external Redis services are created by Phase 2.

Canonical definition: `agents/master/governance/redis-orchestration.json`.

## Responsibilities

Redis coordinates temporary execution state:

- Task queues.
- Agent-routing queues.
- Governance and execution events.
- Distributed locks.
- Idempotency records.
- Execution heartbeat and timeout control.
- Dead-letter handling.

PostgreSQL remains authoritative for tasks, decisions, approvals, and audit logs.

## Key Namespace

All keys use the tenant-safe prefix:

`fcx:v2:{tenantId}:<resource>`

Examples:

- `fcx:v2:{tenantId}:stream:tasks`
- `fcx:v2:{tenantId}:stream:agent-routing`
- `fcx:v2:{tenantId}:stream:events`
- `fcx:v2:{tenantId}:lock:task:{taskId}`
- `fcx:v2:{tenantId}:idempotency:{operationId}`
- `fcx:v2:{tenantId}:heartbeat:{agentId}:{executionId}`

## Streams and Consumer Groups

| Stream | Consumers | Purpose |
| --- | --- | --- |
| `stream:tasks` | Master agents | Intake and orchestration |
| `stream:agent-routing` | Specialist agents | Domain execution |
| `stream:events` | Governance consumers | State and approval events |
| `stream:dead-letter` | Operators | Exhausted retries and invalid events |

## Locks and Execution Control

- Locks have short TTLs and require renewal.
- Lock acquisition uses a unique owner token.
- State transitions use idempotency keys.
- Workers emit heartbeats.
- Failed work retries up to policy limits, then moves to dead letter.
- Lock or queue state cannot replace a PostgreSQL governance record.

## Security

- No secrets, full prompts, unrestricted evidence, or personal data.
- Redis ACLs should isolate backend, workers, and operators.
- Transport encryption and credential rotation are production requirements.
- Tenant prefix validation is mandatory before every operation.
