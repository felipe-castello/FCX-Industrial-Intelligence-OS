# FCX Agent Architecture

This directory is the versioned source of truth for FCX Agent Master policies and specialist definitions.

- `master/`: orchestration contract, routing policy, and approval gates.
- `master/governance/`: Phase 2 RBAC, persistence, Redis, audit, metrics, and deployment governance contracts.
- `master/phase3-executable-orchestration.json`: Phase 3 local executable orchestration contract.
- `specialists/`: specialist responsibilities, tools, constraints, and escalation rules.

Executable orchestration lives in `backend/src/modules/agents`. Definitions in this directory must remain aligned with `agent-registry.ts`.
