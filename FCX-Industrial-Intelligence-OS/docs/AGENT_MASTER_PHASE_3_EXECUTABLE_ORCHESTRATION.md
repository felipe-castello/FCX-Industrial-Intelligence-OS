# FCX Agent Master Phase 3 Executable Orchestration

## Status

**Executable Orchestration Ready - Local Contract Mode**

Phase 3 prepares the Agent Master to become an executable orchestration system. It does not activate external APIs, Redis workers, production infrastructure, or real deployment.

## Specialist Contracts

Each specialist has:

- `<agent>.prompt.md`: objective, input, output, and success criteria.
- `<agent>.workflow.json`: declarative execution workflow.
- `<agent>.skills.json`: skills, allowed tools, and prohibited actions.

Specialists:

`software-architect`, `backend`, `frontend`, `database`, `iot-mqtt`, `ai-rag`, `qa`, `devops`, and `documentation`.

## Master Capabilities

The local executable dispatcher implements:

1. **Select agent:** keyword/capability matching or explicit preferred specialist.
2. **Generate task:** creates a bounded task contract with expected output and acceptance criteria.
3. **Forward execution:** records a local-contract handoff to the selected specialist.
4. **Register result:** accepts a completed/failed result only after forwarding and records the decision.

All actions are in-memory and bounded to 500 task records. Phase 2 governance remains the target model for persistent/distributed execution.

## API

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `POST` | `/api/agents/orchestrate` | Select specialist, generate task, and forward local execution contract |
| `GET` | `/api/agents/executable-tasks` | List local executable tasks |
| `GET` | `/api/agents/executable-tasks/:taskId` | Read a task contract and result |
| `POST` | `/api/agents/executable-tasks/:taskId/result` | Register specialist result |

## Future Activation Path

- Load prompt/workflow/skills contracts through a validated registry.
- Replace local handoff with Phase 2 Redis streams and consumer groups.
- Persist tasks and results in the proposed PostgreSQL governance schema.
- Enforce tenant RBAC and signed actor identity.
- Connect QA/human/DevOps gates before any real deployment adapter.
