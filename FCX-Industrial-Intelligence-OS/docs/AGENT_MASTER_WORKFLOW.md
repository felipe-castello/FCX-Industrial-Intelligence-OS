# Agent Master Workflow

## Vibe Coding Lifecycle

1. **Intake:** Receive a bounded user goal and identify tenant, requester, scope, and success criteria.
2. **Route:** Classify domain and risk. Select one primary specialist and the smallest useful support set.
3. **Plan:** Produce explicit evidence, implementation, validation, and rollback steps.
4. **Execute:** Specialists operate only within registered tools and constraints.
5. **Validate:** Run relevant build, lint, tests, security checks, and behavior review.
6. **QA gate:** A reviewer approves or rejects the validated result.
7. **Deployment gate:** Required only for high-risk, critical, or deployment tasks; QA must already be approved.
8. **Close:** Record the final decision, limitations, and follow-up work.

## Routing Rules

| Domain | Primary specialist | Typical inputs |
| --- | --- | --- |
| Engineering | FCX Software Engineering Agent | code, builds, bugs, features, refactors |
| Strategy | FCX Strategic Council | architecture, roadmap, governance |
| Industrial | FCX Industrial Agent | assets, telemetry, alarms, maintenance |
| Trade | FCX Trade Intelligence Agent | market and financial research |
| Sports | FCX Sports Quant Agent | sports datasets and backtests |
| Electronics | FCX Electronics Lab Agent | sensors, gateways, Modbus, firmware |
| Knowledge | FCX Knowledge Vault Agent | manuals, documents, procedures |

Explicit `domain` and `riskLevel` values in a route request override keyword classification. The Agent Master records the resulting rationale.

## Route Request Example

```json
{
  "goal": "Implement and validate a new alarm dashboard",
  "requestedBy": "engineering-lead",
  "tenantId": "tenant-fcx",
  "riskLevel": "medium"
}
```

## Route Response Contract

The response contains:

- Stable task ID.
- Domain and risk.
- Primary and supporting agents.
- Required approval gates.
- Execution plan.
- Next gate.

## Failure and Escalation

- Missing goal: reject the request.
- No registered specialist: reject and require registry correction.
- Insufficient evidence: return to planning.
- Specialist conflict: escalate to Strategic Council.
- QA rejection: return to execution/rework.
- Deployment approval requested before QA: block.
- Critical action: require explicit human review.
