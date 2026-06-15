# FCX Agent Master Deployment Governance

## Status

Phase 2 defines governance only. It does not create a production pipeline, external service, or real deployment capability.

## Governance Flow

`Solicitacao -> Agente Master -> QA Agent -> Aprovacao Humana -> DevOps Agent -> Deploy`

Canonical definition: `agents/master/governance/deployment-governance.json`.

## Hard Gate

No deploy may occur without:

1. Approved QA evidence.
2. Registered and unexpired human approval.
3. DevOps readiness assessment.
4. Deployment approval by an authorized, distinct reviewer.
5. Artifact digest and target environment.
6. Tested rollback plan.

## Deployment Request Contract

```json
{
  "tenantId": "verified-tenant-id",
  "taskId": "task-id",
  "releaseVersion": "6.x.y",
  "artifactDigest": "sha256:...",
  "targetEnvironment": "homologation",
  "changeWindow": "ISO-8601 interval",
  "rollbackPlanRef": "artifact://rollback/...",
  "qaApprovalId": "approval-id",
  "humanApprovalId": "approval-id"
}
```

## DevOps Agent Responsibilities

- Verify immutable artifact digest.
- Confirm environment and configuration readiness.
- Validate backups, rollback plan, health checks, logs, monitoring, and alerts.
- Confirm approval chain and separation of duties.
- Produce a readiness decision and bounded evidence.
- Never self-approve or bypass the human gate.

## Failure and Rollback

- Failed readiness returns the task to execution or QA.
- Failed deployment moves the task to `deployment_failed`.
- Rollback emits deployment and audit events.
- Recovery from a terminal state requires an audited administrative procedure.

## Future CI/CD Integration

A future pipeline adapter may consume approved deployment requests. It must validate the approval chain directly from PostgreSQL, use idempotency keys, report status events, and remain unable to manufacture approvals.
