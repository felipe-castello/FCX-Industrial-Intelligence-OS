const assert = require('node:assert/strict');
const fs = require('node:fs');
const Module = require('node:module');
const path = require('node:path');
const test = require('node:test');
const typescript = require('typescript');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');
const loadSecurityMiddleware = () => {
  const filename = path.join(root, 'src/security/http-security.ts');
  const output = typescript.transpileModule(read('src/security/http-security.ts'), {
    compilerOptions: { esModuleInterop: true, module: typescript.ModuleKind.CommonJS, target: typescript.ScriptTarget.ES2022 },
  }).outputText;
  const securityModule = new Module(filename, module);
  securityModule.filename = filename;
  securityModule.paths = Module._nodeModulePaths(path.dirname(filename));
  securityModule._compile(output, filename);
  return securityModule.exports.securityMiddleware;
};

const assertPublicRequest = (method, originalUrl) => {
  const securityMiddleware = loadSecurityMiddleware();
  const previousAuth = process.env.SECURITY_AUTH_ENABLED;
  const previousSecret = process.env.JWT_SECRET;
  let nextCalled = false;
  let responseStatus;

  process.env.SECURITY_AUTH_ENABLED = 'true';
  process.env.JWT_SECRET = 'regression-test-secret';
  securityMiddleware(
    { method, path: '/', originalUrl, headers: {} },
    { status: (code) => ({ json: () => { responseStatus = code; } }) },
    () => { nextCalled = true; },
  );
  if (previousAuth === undefined) delete process.env.SECURITY_AUTH_ENABLED; else process.env.SECURITY_AUTH_ENABLED = previousAuth;
  if (previousSecret === undefined) delete process.env.JWT_SECRET; else process.env.JWT_SECRET = previousSecret;

  assert.equal(nextCalled, true, `${method} ${originalUrl} must reach its controller`);
  assert.equal(responseStatus, undefined, `${method} ${originalUrl} must not be rejected by security middleware`);
};

test('authentication remains optional and auth endpoints stay public', () => {
  const security = read('src/security/http-security.ts');
  assert.match(security, /SECURITY_AUTH_ENABLED \|\| 'false'/);
  assert.match(security, /const requestPath = request\.path \|\| request\.originalUrl \|\| '\/'/);
  assert.doesNotMatch(security, /request\.url/);
  for (const publicPath of ['/auth/login', '/auth/refresh', '/health']) assert.ok(security.includes(`'${publicPath}'`), `missing normalized public security path ${publicPath}`);
  assert.match(security, /requestPath === '\/' && request\.originalUrl/);
  assert.match(security, /replace\(\/\^\\\/api\(\?=\\\/\|\$\)\/, ''\)/);
  assert.match(security, /publicPaths\.has\(requestPath\)/);
  assert.match(security, /requestPath\.startsWith\('\/auth\/'\)/);
  assert.match(security, /return !\['HEAD', 'OPTIONS'\]\.includes\(method\)/);
  assert.match(security, /SECURITY_RBAC_ENABLED \|\| 'false'/);
});

test('public health and login routes bypass security middleware with or without api prefix', () => {
  assertPublicRequest('GET', '/api/health?probe=1');
  assertPublicRequest('GET', '/health');
  assertPublicRequest('POST', '/api/auth/login');
  assertPublicRequest('POST', '/auth/login');
});

test('FCX 5.2 exposes complete authentication lifecycle', () => {
  const controller = read('src/modules/auth/auth.controller.ts');
  const healthController = read('src/health/health.controller.ts');
  assert.match(controller, /@Controller\(\['auth', 'api\/auth'\]\)/);
  assert.match(healthController, /@Controller\(\['health', 'api\/health'\]\)/);
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

test('users service exposes the UserRole enum instead of the internal roleId relation', () => {
  const users = read('src/modules/users/users.service.ts');
  assert.match(users, /import \{ UserRole \} from '@prisma\/client'/);
  assert.match(users, /Object\.values\(UserRole\)/);
  assert.match(users, /const USER_FIELDS = \['companyId', 'nome', 'email', 'role', 'status'\]/);
  assert.doesNotMatch(users, /roleId/);
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
  assert.match(api, /VITE_AUTH_ENABLED !== 'false'/);
  assert.match(app, /<AuthPage/);
  assert.match(dockerfile, /ARG VITE_AUTH_ENABLED=true/);
});

test('frontend logout clears browser session, invalidates user context and redirects to login', () => {
  const api = read('../frontend/src/api.js');
  const app = read('../frontend/src/App.jsx');
  const layout = read('../frontend/src/components/Layout.jsx');
  const userMenu = read('../frontend/src/components/UserMenu.jsx');
  for (const key of ['ACCESS_TOKEN_KEY', 'REFRESH_TOKEN_KEY', 'USER_KEY']) {
    assert.match(api, new RegExp(`localStorage\\.removeItem\\(${key}\\)`));
  }
  assert.match(api, /sessionStorage\.clear\(\)/);
  assert.match(api, /finally \{\s*clearSession\(\)/);
  assert.match(api, /fetch\(`\$\{API_BASE_URL\}\/auth\/refresh`/);
  assert.match(api, /localStorage\.setItem\(REFRESH_TOKEN_KEY, session\.refreshToken\)/);
  assert.match(app, /setAuthState\(\{ authenticated: false, user: null \}\)/);
  assert.match(app, /window\.history\.replaceState\(\{\}, '', '\/login'\)/);
  assert.match(layout, /<UserMenu user=\{currentUser\} onLogout=\{onLogout\}/);
  assert.match(userMenu, />Sair</);
  assert.match(userMenu, /onClick=\{onLogout\}/);
});

test('frontend authentication calls auth routes without an extra API prefix', () => {
  const api = read('../frontend/src/api.js');
  const productionEnv = read('../.env.production.example');
  assert.match(api, /API_BASE_URL = \(import\.meta\.env\.VITE_API_URL \|\| 'https:\/\/api\.nexusiotenergy\.com\.br'\)/);
  assert.doesNotMatch(api, /configuredApiUrl|endsWith\('\/api'\)|`\$\{configuredApiUrl\}\/api`/);
  for (const route of ['/auth/login', '/auth/logout', '/auth/refresh', '/auth/forgot-password', '/auth/reset-password']) {
    assert.ok(api.includes(route), `missing direct auth client route ${route}`);
  }
  assert.match(productionEnv, /PUBLIC_API_URL=https:\/\/api\.fcx\.local$/m);
  assert.doesNotMatch(productionEnv, /^PUBLIC_API_URL=.*\/api(?:\/|$)/m);
});

test('local compose enables authentication and RBAC by default', () => {
  const compose = read('../docker-compose.yml');
  const env = read('../.env.example');
  assert.match(compose, /SECURITY_AUTH_ENABLED: \$\{SECURITY_AUTH_ENABLED:-true\}/);
  assert.match(compose, /SECURITY_RBAC_ENABLED: \$\{SECURITY_RBAC_ENABLED:-true\}/);
  assert.match(compose, /VITE_AUTH_ENABLED: \$\{VITE_AUTH_ENABLED:-true\}/);
  assert.match(env, /SECURITY_AUTH_ENABLED=true/);
  assert.match(env, /SECURITY_RBAC_ENABLED=true/);
  assert.match(env, /VITE_AUTH_ENABLED=true/);
});

test('homologation environment is isolated from production', () => {
  const compose = read('../docker-compose.homologation.yml');
  const script = read('../scripts/validate-homologation.ps1');
  for (const marker of ['fcx-hml-postgres', 'fcx-hml-backend', 'fcx_hml_postgres_data', 'fcx_hml_network', '55432', '53000']) assert.ok(compose.includes(marker), `missing isolated marker ${marker}`);
  assert.doesNotMatch(compose, /fcx-production|postgres_production_data/);
  assert.match(script, /Safety guard/);
  assert.match(script, /20260612180000_fcx_52_auth_rbac/);
});
