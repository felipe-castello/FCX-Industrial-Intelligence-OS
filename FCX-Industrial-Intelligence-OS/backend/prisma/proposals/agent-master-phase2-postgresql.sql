-- FCX Agent Master Phase 2 PostgreSQL proposal.
-- Architecture-only: do not apply automatically.

CREATE SCHEMA IF NOT EXISTS fcx_governance;
CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE fcx_governance.tenants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE fcx_governance.users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES fcx_governance.tenants(id),
  external_subject text NOT NULL,
  email text,
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended', 'inactive')),
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, external_subject)
);

CREATE TABLE fcx_governance.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid REFERENCES fcx_governance.tenants(id),
  code text NOT NULL,
  description text,
  is_system boolean NOT NULL DEFAULT false,
  UNIQUE (tenant_id, code)
);

CREATE TABLE fcx_governance.permissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  description text NOT NULL
);

CREATE TABLE fcx_governance.user_roles (
  tenant_id uuid NOT NULL REFERENCES fcx_governance.tenants(id),
  user_id uuid NOT NULL REFERENCES fcx_governance.users(id),
  role_id uuid NOT NULL REFERENCES fcx_governance.roles(id),
  assigned_by uuid REFERENCES fcx_governance.users(id),
  assigned_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (tenant_id, user_id, role_id)
);

CREATE TABLE fcx_governance.role_permissions (
  role_id uuid NOT NULL REFERENCES fcx_governance.roles(id),
  permission_id uuid NOT NULL REFERENCES fcx_governance.permissions(id),
  PRIMARY KEY (role_id, permission_id)
);

CREATE TABLE fcx_governance.tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES fcx_governance.tenants(id),
  requested_by uuid NOT NULL REFERENCES fcx_governance.users(id),
  correlation_id uuid NOT NULL DEFAULT gen_random_uuid(),
  idempotency_key text NOT NULL,
  goal text NOT NULL,
  domain text NOT NULL,
  risk_level text NOT NULL CHECK (risk_level IN ('low', 'medium', 'high', 'critical')),
  state text NOT NULL DEFAULT 'requested',
  assigned_agent_id text,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, idempotency_key)
);

CREATE TABLE fcx_governance.decisions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES fcx_governance.tenants(id),
  task_id uuid NOT NULL REFERENCES fcx_governance.tasks(id),
  actor_type text NOT NULL CHECK (actor_type IN ('user', 'agent', 'system')),
  actor_id text NOT NULL,
  decision_type text NOT NULL,
  decision text NOT NULL,
  rationale text NOT NULL,
  bounded_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE fcx_governance.approvals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES fcx_governance.tenants(id),
  task_id uuid NOT NULL REFERENCES fcx_governance.tasks(id),
  gate text NOT NULL CHECK (gate IN ('qa', 'human', 'deployment')),
  status text NOT NULL CHECK (status IN ('pending', 'approved', 'rejected', 'expired', 'revoked')),
  reviewer_user_id uuid REFERENCES fcx_governance.users(id),
  evidence_ref text,
  reason text,
  expires_at timestamptz,
  version integer NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (tenant_id, task_id, gate)
);

CREATE TABLE fcx_governance.audit_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tenant_id uuid NOT NULL REFERENCES fcx_governance.tenants(id),
  correlation_id uuid NOT NULL,
  actor_type text NOT NULL,
  actor_id text NOT NULL,
  action text NOT NULL,
  resource_type text NOT NULL,
  resource_id text NOT NULL,
  result text NOT NULL,
  reason text,
  source_ip inet,
  user_agent text,
  bounded_metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  previous_hash text,
  event_hash text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE fcx_governance.agent_metrics (
  id bigserial PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES fcx_governance.tenants(id),
  agent_id text NOT NULL,
  task_id uuid REFERENCES fcx_governance.tasks(id),
  metric_name text NOT NULL,
  metric_value double precision NOT NULL,
  unit text NOT NULL,
  bounded_labels jsonb NOT NULL DEFAULT '{}'::jsonb,
  observed_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX governance_tasks_tenant_state_idx ON fcx_governance.tasks (tenant_id, state, created_at);
CREATE INDEX governance_decisions_task_idx ON fcx_governance.decisions (tenant_id, task_id, created_at);
CREATE INDEX governance_approvals_task_idx ON fcx_governance.approvals (tenant_id, task_id, gate, status);
CREATE INDEX governance_audit_tenant_time_idx ON fcx_governance.audit_logs (tenant_id, created_at);
CREATE INDEX governance_audit_resource_idx ON fcx_governance.audit_logs (tenant_id, resource_type, resource_id);
CREATE INDEX governance_metrics_agent_time_idx ON fcx_governance.agent_metrics (tenant_id, agent_id, observed_at);

-- Proposed tenant isolation. Application transactions must set:
-- SET LOCAL app.tenant_id = '<verified tenant uuid>';
ALTER TABLE fcx_governance.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE fcx_governance.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE fcx_governance.decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE fcx_governance.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE fcx_governance.audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE fcx_governance.agent_metrics ENABLE ROW LEVEL SECURITY;

CREATE POLICY users_tenant_isolation ON fcx_governance.users
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);
CREATE POLICY tasks_tenant_isolation ON fcx_governance.tasks
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);
CREATE POLICY decisions_tenant_isolation ON fcx_governance.decisions
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);
CREATE POLICY approvals_tenant_isolation ON fcx_governance.approvals
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);
CREATE POLICY audit_logs_tenant_isolation ON fcx_governance.audit_logs
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);
CREATE POLICY agent_metrics_tenant_isolation ON fcx_governance.agent_metrics
  USING (tenant_id = current_setting('app.tenant_id', true)::uuid);

-- Production implementation must add:
-- 1. Append-only triggers for decisions and audit_logs.
-- 2. Approval transition validation and separation-of-duties checks.
-- 3. Hash-chain generation in a trusted transaction.
-- 4. Partitioning/retention for audit_logs and agent_metrics.
