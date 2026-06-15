# FCX Agent Master RBAC Model

## Status

Phase 2 architecture definition. No production authorization service or database migration is activated.

## Principles

- Deny by default.
- Authentication establishes identity; RBAC grants permissions.
- Tenant identity and user identity come only from verified authentication claims.
- Request bodies cannot define the actor, reviewer, role, or tenant.
- Every authorization decision is audited.
- Critical operations enforce separation of duties.

## Tenant Isolation

Every governed resource includes `tenantId`. API handlers must compare the authenticated tenant with the resource tenant before reading or writing. PostgreSQL Row Level Security is proposed as defense in depth.

Cross-tenant access is denied except for an audited `platform_admin` break-glass procedure.

## Roles and Permissions

| Role | Core permissions |
| --- | --- |
| `platform_admin` | Platform policy and audited break-glass operations |
| `tenant_admin` | Tenant users, task visibility, governance reads |
| `requester` | Create tasks and read owned tasks |
| `qa_reviewer` | Review QA evidence and approve/reject QA |
| `human_approver` | Approve/reject human gate |
| `devops_approver` | Approve/reject deployment readiness |
| `auditor` | Read audit trail, governance, and metrics |

Canonical policy: `agents/master/governance/rbac-model.json`.

## Endpoint Authorization Matrix

| Operation | Required permission |
| --- | --- |
| Route task | `task.create` |
| Read task/decision | `task.read` or tenant-scoped ownership |
| QA approval | `approval.qa.review` |
| Human approval | `approval.human.review` |
| Deployment approval | `approval.deployment.review` |
| Read audit logs | `audit.read` |
| Read agent metrics | `metrics.read` |

## Separation of Duties

- A requester cannot approve their own task.
- QA, human, and deployment approvals for critical tasks require distinct users.
- Agents may recommend but cannot impersonate human approvers.
- API keys intended for machine integration cannot provide human approval.

## Implementation Contract

Future runtime implementation must provide authenticated principal context:

```json
{
  "tenantId": "verified-tenant-id",
  "userId": "verified-user-id",
  "roles": ["qa_reviewer"],
  "permissions": ["approval.qa.review"],
  "authMethod": "jwt"
}
```

Authorization failures return `403`, are rate-limited, and emit an append-only audit event.
