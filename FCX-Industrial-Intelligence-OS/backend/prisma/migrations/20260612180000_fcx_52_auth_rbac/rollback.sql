ALTER TABLE "audit_logs" DROP CONSTRAINT IF EXISTS "audit_logs_user_id_fkey";
ALTER TABLE "password_reset_tokens" DROP CONSTRAINT IF EXISTS "password_reset_tokens_user_id_fkey";
ALTER TABLE "auth_refresh_tokens" DROP CONSTRAINT IF EXISTS "auth_refresh_tokens_user_id_fkey";
ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "role_permissions_permission_id_fkey";
ALTER TABLE "role_permissions" DROP CONSTRAINT IF EXISTS "role_permissions_role_id_fkey";
ALTER TABLE "users" DROP CONSTRAINT IF EXISTS "users_role_id_fkey";

DROP TABLE IF EXISTS "audit_logs";
DROP TABLE IF EXISTS "password_reset_tokens";
DROP TABLE IF EXISTS "auth_refresh_tokens";
DROP TABLE IF EXISTS "role_permissions";
DROP TABLE IF EXISTS "permissions";
DROP TABLE IF EXISTS "roles";

ALTER TABLE "users" DROP COLUMN IF EXISTS "updated_at";
ALTER TABLE "users" DROP COLUMN IF EXISTS "last_login_at";
ALTER TABLE "users" DROP COLUMN IF EXISTS "password_hash";
ALTER TABLE "users" DROP COLUMN IF EXISTS "role_id";

-- Added PostgreSQL enum values are retained because enum value removal is not transaction-safe.
