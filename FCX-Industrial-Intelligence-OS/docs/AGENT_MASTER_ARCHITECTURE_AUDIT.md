# FCX Agent Master Architecture Audit

Date: 2026-06-15

## Executive Result

- Architecture Score: **58/100**
- Production Readiness: **NOT READY**
- Homologation Readiness: **PARTIALLY READY**

The architecture is a coherent foundation: it is integrated into the existing NestJS module, preserves prior APIs, defines eight runtime agents, documents routing, and passes build, lint, and tests. Production approval is blocked by authorization, tenant isolation, state-machine, persistence, scalability, and DevOps integration gaps.

## Scorecard

| Area | Score | Assessment |
| --- | ---: | --- |
| Folder structure | 82 | Requested folders exist and definitions are readable; schemas and synchronization tooling are missing. |
| Agent Master responsibilities | 62 | Routing and planning exist; coordination, execution, result consolidation, and closure are not implemented. |
| Specialist coverage | 76 | Core FCX domains are covered; QA, Security, SRE/DevOps, Data, and Compliance ownership are missing. |
| QA workflow | 48 | QA-before-deployment is checked once, but transitions are mutable and invalid final states are possible. |
| DevOps deployment workflow | 35 | Approval record exists, but no CI/CD, artifact, environment, rollback, or deployment event integration exists. |
| Decision logging | 42 | Routing and approvals are logged, but only in volatile process memory without tenant or tamper protection. |
| Documentation | 78 | Core architecture is documented; operations, security model, schemas, and ADRs require additions. |
| Scalability | 30 | In-memory state and static routing prevent safe horizontal scaling. |
| Future module compatibility | 58 | Registry pattern is extensible, but domain unions/maps and duplicate definitions require code changes. |
| Security | 28 | Authentication exists globally, but sensitive reads are public and no RBAC/tenant enforcement exists. |

## Critical and High Risks

### 1. Approval and decision reads are publicly accessible

- Severity: **Critical**
- Affected: `backend/src/security/http-security.ts`, `backend/src/modules/agents/agents-api.controller.ts`
- Evidence: Global security allows all GET requests by default. `/api/agents/decisions` and `/api/agents/approvals` are GET endpoints.
- Impact: Anonymous users may read decision history, reviewer names, task goals, and approval status.
- Recommendation: Protect every `/api/agents` endpoint and implement role-based authorization and tenant filtering.

### 2. Reviewer identity is client-controlled

- Severity: **Critical**
- Affected: `backend/src/modules/agents/agents-api.controller.ts`
- Evidence: Approval endpoints accept `reviewer` directly from the request body.
- Impact: Any authenticated API key/JWT holder can impersonate QA or release management.
- Recommendation: Derive reviewer identity and roles from verified authentication claims. Never trust reviewer identity from payloads.

### 3. Client can downgrade risk and choose domain

- Severity: **Critical**
- Affected: `backend/src/modules/agents/task-router.service.ts`
- Evidence: `task.domain` and `task.riskLevel` override classification without authorization or minimum-risk enforcement.
- Validated result: A destructive production-data task supplied with `riskLevel=low` required only QA.
- Recommendation: Treat client values as hints. Compute server-side risk and allow only authorized escalation, never downgrade.

### 4. Documented human gate is absent from runtime

- Severity: **High**
- Affected: `agents/master/routing-policy.json`, `backend/src/modules/agents/agent.types.ts`, `task-router.service.ts`
- Evidence: Policy declares `critical: [qa, deployment, human]`; runtime approvals support only `qa` and `deployment`.
- Impact: Critical industrial, electrical, financial, or irreversible tasks can lack mandatory human authorization.
- Recommendation: Implement a distinct human/compliance gate with role requirements and immutable approval events.

### 5. Approval state machine permits invalid final states

- Severity: **High**
- Affected: `backend/src/modules/agents/approval-workflow.service.ts`
- Evidence: After deployment approval, QA can be changed to rejected while deployment remains approved.
- Validated result: Final state `qa=rejected`, `deployment=approved`.
- Recommendation: Implement explicit state transitions, terminal states, revocation propagation, optimistic locking, and idempotency.

### 6. No tenant isolation

- Severity: **High**
- Affected: Agent task, route, approval, and decision models/services.
- Evidence: `tenantId` is accepted but not stored, filtered, or authorized.
- Impact: Cross-tenant routing and audit data exposure.
- Recommendation: Require tenant identity from authentication context and include it in every persistence key and query.

### 7. Volatile and non-distributed governance state

- Severity: **High**
- Affected: `decision-log.service.ts`, `approval-workflow.service.ts`
- Evidence: Decisions use an array capped at 500; approvals use an in-memory Map.
- Impact: State is lost on restart, inconsistent across replicas, and unsuitable for audit/compliance.
- Recommendation: Persist append-only decision events and approval state in PostgreSQL; use Redis for locks, queues, and temporary orchestration.

## Missing Components

- Authenticated identity context and RBAC guards.
- Tenant-scoped task, decision, and approval models.
- Persisted task lifecycle and append-only decision events.
- Human/compliance approval gate for critical operations.
- QA evidence model containing build, test, security, and review artifacts.
- DevOps/SRE agent or service responsible for release readiness.
- CI/CD integration, deployment request, artifact digest, environment, rollback, and deployment result.
- Execution engine, specialist handoff protocol, task result consolidation, retry, timeout, and cancellation.
- Queue/worker orchestration and distributed locking.
- Idempotency keys and concurrency/version checks.
- JSON schema validation and synchronization between `/agents` definitions and runtime registry.
- Agent definition versioning, compatibility policy, and deprecation process.
- Agent-specific metrics, traces, alerts, cost/token budgets, and SLOs.
- Security/compliance specialist and prompt/tool authorization policy.
- Unit/integration tests for negative paths and invalid transitions.

## Documentation Updates Required

- Add an authentication and RBAC matrix for every Agent API endpoint.
- Add tenant isolation and data retention policies.
- Add formal approval state-machine diagram and transition table.
- Add decision-event schema and audit retention requirements.
- Add CI/CD and rollback runbook.
- Add specialist handoff, retry, timeout, cancellation, and failure contracts.
- Add agent definition schema, versioning policy, and registry synchronization procedure.
- Add threat model covering prompt injection, tool abuse, privilege escalation, data leakage, and approval spoofing.
- Add operational SLOs, metrics, alerts, and incident response procedures.
- Add ADRs explaining PostgreSQL/Redis responsibilities and future orchestration technology.

## Recommended Improvement Plan

### P0 - Before any production exposure

1. Protect all Agent APIs with authentication, RBAC, and tenant guards.
2. Remove body-supplied reviewer identity and derive it from authenticated claims.
3. Prevent client-side risk downgrade and domain-routing bypass.
4. Implement a strict approval state machine including human approval.
5. Persist tenant-scoped tasks, decisions, and approvals in PostgreSQL.

### P1 - Before production deployment workflow

1. Integrate QA evidence with CI results, artifact digest, security scans, and reviewer signatures.
2. Integrate deployment approval with environment, release version, rollback plan, and deployment outcome.
3. Add Redis-backed queues, distributed locks, retries, timeouts, and idempotency.
4. Add negative-path integration tests and audit-event tests.
5. Add metrics and alerts for routing failures, rejected gates, stale approvals, and decision-log failures.

### P2 - For FCX 6.0 growth

1. Load versioned agent definitions through a validated registry rather than duplicate static sources.
2. Introduce plugin/module registration so future domains do not require editing unions and routing maps.
3. Add specialist capability matching and policy evaluation instead of keyword-only routing.
4. Add cost/token budgets, model policies, confidence thresholds, and hallucination controls.
5. Add long-running workflow orchestration when task volume and complexity justify it.

## Validation Evidence

- Backend build: passed.
- Backend lint: passed.
- Backend tests: 6/6 passed.
- Versioned agent definitions: eight definitions aligned by count with eight runtime agents.
- Runtime negative test: risk downgrade accepted.
- Runtime negative test: critical task omitted documented human gate.
- Runtime negative test: deployment remained approved after QA rejection.

## Final Opinion

The FCX Agent Master architecture is suitable for controlled development and homologation. It is **not production ready** because approval authority, tenant isolation, audit durability, distributed execution, and CI/CD enforcement are not yet implemented.
