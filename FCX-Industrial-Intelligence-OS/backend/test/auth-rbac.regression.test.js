const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('authentication remains optional and auth endpoints stay public', () => {
  const security = read('src/security/http-security.ts');
  assert.match(security, /SECURITY_AUTH_ENABLED \|\| 'false'/);
  assert.match(security, /path\.startsWith\('\/auth\/'\)/);
  assert.match(security, /path === '\/health' \|\| path === '\/metrics'/);
  assert.match(security, /return !\['HEAD', 'OPTIONS'\]\.includes\(method\)/);
  assert.match(security, /SECURITY_RBAC_ENABLED \|\| 'false'/);
});

test('FCX 5.2 exposes complete authentication lifecycle', () => {
  const controller = read('src/modules/auth/auth.controller.ts');
  for (const route of ["@Post('login')", "@Post('refresh')", "@Post('logout')", "@Post('forgot-password')", "@Post('reset-password')"]) {
    assert.ok(controller.includes(route), `missing ${route}`);
  }
});

test('roles and permissions expose administrative CRUD routes', () => {
  const controller = read('src/modules/auth/auth.controller.ts');
  for (const route of ["@Get('roles')", "@Post('roles')", "@Patch('roles/:id')", "@Delete('roles/:id')", "@Get('permissions')", "@Post('permissions')", "@Patch('permissions/:id')", "@Delete('permissions/:id')"]) {
    assert.ok(controller.includes(route), `missing ${route}`);
  }
});

test('JWT signing secret is loaded through ConfigService', () => {
  const module = read('src/modules/auth/auth.module.ts');
  assert.match(module, /JwtModule\.registerAsync/);
  assert.match(module, /ConfigService/);
});

test('passwords and tokens are stored only as hashes', () => {
  const auth = read('src/modules/auth/auth.service.ts');
  const users = read('src/modules/users/users.service.ts');
  assert.match(auth, /bcrypt\.compare/);
  assert.match(auth, /bcrypt\.hash/);
  assert.match(auth, /hashToken\(refreshToken\)/);
  assert.match(auth, /hashToken\(token\)/);
  assert.match(users, /passwordHash/);
  assert.doesNotMatch(users, /select: \{[^}]*passwordHash/);
});

test('RBAC profiles, roles, permissions and audit models exist', () => {
  const schema = read('prisma/schema.prisma');
  for (const role of ['MASTER_ADMIN', 'FCX_ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'CLIENT']) assert.match(schema, new RegExp(role));
  for (const model of ['Role', 'Permission', 'RolePermission', 'AuthRefreshToken', 'PasswordResetToken', 'AuditLog']) assert.match(schema, new RegExp(`model ${model} \\{`));
});

test('migration has explicit rollback and seed provisions initial admin idempotently', () => {
  const migration = read('prisma/migrations/20260612180000_fcx_52_auth_rbac/migration.sql');
  const rollback = read('prisma/migrations/20260612180000_fcx_52_auth_rbac/rollback.sql');
  const seed = read('prisma/seed.js');
  assert.match(migration, /CREATE TABLE "auth_refresh_tokens"/);
  assert.match(migration, /CREATE TABLE "audit_logs"/);
  assert.match(rollback, /DROP TABLE IF EXISTS "auth_refresh_tokens"/);
  assert.match(rollback, /DROP TABLE IF EXISTS "audit_logs"/);
  assert.match(seed, /admin@nexusiotenergy\.com\.br/);
  assert.match(seed, /existingAdmin/);
  assert.match(seed, /!existingAdmin\.passwordHash/);
  assert.doesNotMatch(seed, /deleteMany/);
});

test('audit covers authentication and write operations', () => {
  const auth = read('src/modules/auth/auth.service.ts');
  const interceptor = read('src/modules/auth/audit.interceptor.ts');
  assert.match(auth, /action: 'login'/);
  assert.match(auth, /action: 'logout'/);
  for (const action of ['create', 'update', 'delete']) assert.match(interceptor, new RegExp(action));
});

test('MQTT, acquisition and dashboards are not imported by auth module', () => {
  const authModule = read('src/modules/auth/auth.module.ts');
  assert.doesNotMatch(authModule, /mqtt|acquisition|dashboard/i);
});

test('frontend authentication remains optional and production image accepts its feature flag', () => {
  const api = read('../frontend/src/api.js');
  const app = read('../frontend/src/App.jsx');
  const dockerfile = read('../frontend/Dockerfile.prod');
  assert.match(api, /VITE_AUTH_ENABLED === 'true'/);
  assert.match(app, /<AuthPage/);
  assert.match(dockerfile, /ARG VITE_AUTH_ENABLED=false/);
});

test('frontend logout clears browser session, invalidates user context and redirects to login', () => {
  const api = read('../frontend/src/api.js');
  const app = read('../frontend/src/App.jsx');
  for (const key of ['ACCESS_TOKEN_KEY', 'REFRESH_TOKEN_KEY', 'USER_KEY']) {
    assert.match(api, new RegExp(`localStorage\\.removeItem\\(${key}\\)`));
  }
  assert.match(api, /sessionStorage\.clear\(\)/);
  assert.match(api, /finally \{\s*clearSession\(\)/);
  assert.match(api, /fetch\(`\$\{API_URL\}\/auth\/refresh`/);
  assert.match(api, /localStorage\.setItem\(REFRESH_TOKEN_KEY, session\.refreshToken\)/);
  assert.match(app, /setAuthState\(\{ authenticated: false, user: null \}\)/);
  assert.match(app, /window\.history\.replaceState\(\{\}, '', '\/login'\)/);
});

test('homologation environment is isolated from production', () => {
  const compose = read('../docker-compose.homologation.yml');
  const script = read('../scripts/validate-homologation.ps1');
  for (const marker of ['fcx-hml-postgres', 'fcx-hml-backend', 'fcx_hml_postgres_data', 'fcx_hml_network', '55432', '53000']) assert.ok(compose.includes(marker), `missing isolated marker ${marker}`);
  assert.doesNotMatch(compose, /fcx-production|postgres_production_data/);
  assert.match(script, /Safety guard/);
  assert.match(script, /20260612180000_fcx_52_auth_rbac/);
});
