# FCX Agent Master Audit Trail

## Purpose

The audit trail provides tenant-scoped, append-only evidence of authorization, routing, decisions, approvals, policy changes, and deployment governance.

Canonical definition: `agents/master/governance/audit-trail-model.json`.

## Audited Events

- Authentication and authorization results.
- Task creation, routing, execution state, cancellation, and closure.
- Agent selection and decision rationale.
- QA, human, and deployment approval transitions.
- Deployment readiness, start, result, rollback, and recovery.
- RBAC, policy, and agent-definition changes.
- Security denials and break-glass activity.

## Event Contract

Every event includes:

- Event ID, tenant ID, correlation ID.
- Verified actor type and actor ID.
- Action, resource type, and resource ID.
- Result and bounded reason.
- Previous hash, event hash, and timestamp.
- Bounded metadata with no secrets, full prompts, tokens, or unrestricted payloads.

## Storage and Integrity

- PostgreSQL is the source of truth.
- Audit events are append-only.
- Hash chaining makes unauthorized mutation detectable.
- Redis events are transport signals, not audit evidence.
- Export and retention are tenant-aware.
- Production implementation should partition by time and define legal retention.

## Access

Only users with `audit.read` may query audit events. Queries are tenant-scoped and themselves audited. Break-glass access requires justification and a security alert.

## Proposed Schema

See `backend/prisma/proposals/agent-master-phase2-postgresql.sql`. The proposal is not an active migration.
