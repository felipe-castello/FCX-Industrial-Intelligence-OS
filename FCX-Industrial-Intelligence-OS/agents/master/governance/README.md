# FCX Agent Master Phase 2 Governance

These files are versioned governance contracts. They do not activate PostgreSQL migrations, Redis queues, external services, or deployment infrastructure.

- `rbac-model.json`: tenant RBAC and separation of duties.
- `approval-state-machine.json`: mandatory QA, human, and deployment gates.
- `redis-orchestration.json`: queue, event, lock, and execution-control model.
- `audit-trail-model.json`: append-only audit requirements.
- `agent-metrics-model.json`: metrics, labels, and SLO definitions.
- `deployment-governance.json`: deploy evidence and mandatory approval chain.
