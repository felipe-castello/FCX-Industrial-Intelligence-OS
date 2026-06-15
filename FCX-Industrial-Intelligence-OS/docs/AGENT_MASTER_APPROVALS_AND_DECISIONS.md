# Agent Master Decisions and Approval Gates

## Decision Logging

The system records these decision types:

- `routing`: selected primary specialist, domain, risk, and supporting agents.
- `qa_approval`: QA approval or rejection and rationale.
- `deployment_approval`: deployment approval or rejection and rationale.

Each entry contains a generated ID, task ID, actor, decision, rationale, timestamp, and bounded metadata.

Do not place source code, secrets, tokens, unrestricted prompts, personal data, or cross-tenant data in decision metadata.

## QA Approval Workflow

QA verifies:

- Goal and success criteria are satisfied.
- Evidence supports the result.
- Existing behavior is preserved unless change was requested.
- Build, lint, tests, and security checks are complete.
- Risks, limitations, and rollback steps are documented.

Example:

```json
{
  "status": "approved",
  "reviewer": "qa-lead",
  "note": "Backend build, lint, and tests passed."
}
```

## Deployment Approval Workflow

Deployment approval is initialized for high-risk, critical, or explicitly deployment-related tasks.

It can only be approved when QA is `approved` or `not_required`. In the current FCX policy, every routed task requires QA, so normal deployment approval always follows QA approval.

Deployment review verifies:

- Approved QA evidence exists.
- Environment configuration and secrets are ready.
- Backup and rollback procedures are ready.
- Health checks, logs, and monitoring are ready.
- Change window and accountable operator are identified.

## Production Hardening Required

Before exposing approval endpoints in production:

- Add authentication and role-based authorization.
- Persist decisions and approvals in PostgreSQL.
- Add tenant ID to every record and query.
- Make decision entries append-only.
- Add signed approval events and retention policy.
- Export audit metrics and alerts.
