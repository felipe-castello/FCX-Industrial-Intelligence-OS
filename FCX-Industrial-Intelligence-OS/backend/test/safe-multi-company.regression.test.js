const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

test('new registry relationships remain optional and legacy telemetry assetId remains intact', () => {
  const schema = read('prisma/schema.prisma');
  assert.match(schema, /model Client \{/);
  assert.match(schema, /model Device \{/);
  assert.match(schema, /clientId\s+String\?/);
  assert.match(schema, /siteId\s+String\?/);
  assert.match(schema, /deviceId\s+String\?/);
  assert.match(schema, /model Telemetry \{[\s\S]*assetId\s+String\s+@map\("asset_id"\)/);
});

test('migration has an explicit rollback and creates compatibility defaults', () => {
  const migration = read('prisma/migrations/20260612120000_safe_multi_company_registry/migration.sql');
  const rollback = read('prisma/migrations/20260612120000_safe_multi_company_registry/rollback.sql');
  assert.match(migration, /FCX DEFAULT/);
  assert.match(migration, /LABORATORIO/);
  assert.match(migration, /GENERICO/);
  assert.match(rollback, /DROP TABLE IF EXISTS "devices"/);
  assert.match(rollback, /DROP TABLE IF EXISTS "clients"/);
});

test('existing ingestion flow still requires assetId and only enriches optional context', () => {
  const ingestion = read('src/modules/integrations/services/data-ingestion.service.ts');
  assert.match(ingestion, /if \(!telemetry\.assetId\)/);
  assert.match(ingestion, /this\.prisma\.telemetry\.create/);
  assert.match(ingestion, /clientId: payload\.clientId/);
  assert.match(ingestion, /siteId: payload\.siteId/);
  assert.match(ingestion, /deviceId: payload\.deviceId/);
});

test('client and device controllers expose complete CRUD routes', () => {
  const controllers = read('src/modules/assets/safe-registry.controllers.ts');
  for (const route of ["@Controller('clients')", "@Controller('devices')", '@Get()', "@Get(':id')", '@Post()', "@Patch(':id')", "@Put(':id')", "@Delete(':id')"]) {
    assert.ok(controllers.includes(route), `missing ${route}`);
  }
});

test('site and asset controllers preserve PATCH and expose PUT compatibility', () => {
  const sites = read('src/modules/assets/asset-registry.controllers.ts');
  const assets = read('src/modules/assets/assets.controller.ts');
  for (const controller of [sites, assets]) {
    assert.match(controller, /@Patch\(':id'\)/);
    assert.match(controller, /@Put\(':id'\)/);
    assert.match(controller, /@Delete\(':id'\)/);
  }
});

test('client, site, asset and device services expose create/update/remove operations', () => {
  const safeRegistry = read('src/modules/assets/safe-registry.service.ts');
  const assetRegistry = read('src/modules/assets/asset-registry.service.ts');
  const assets = read('src/modules/assets/assets.service.ts');
  for (const method of ['createClient', 'updateClient', 'removeClient', 'createDevice', 'updateDevice', 'removeDevice']) assert.match(safeRegistry, new RegExp(method));
  for (const method of ['createSite', 'updateSite', 'removeSite']) assert.match(assetRegistry, new RegExp(method));
  for (const method of ['create\\(', 'update\\(', 'remove\\(']) assert.match(assets, new RegExp(method));
});

test('dashboard keeps no-filter default and accepts optional filters', () => {
  const dashboard = read('src/modules/dashboards/dashboards.service.ts');
  assert.match(dashboard, /overview\(filters: .* = \{\}\)/);
  assert.match(dashboard, /filters\.clientId/);
  assert.match(dashboard, /filters\.siteId/);
  assert.match(dashboard, /filters\.assetId/);
  assert.match(dashboard, /filters\.deviceId/);
});

test('production seed is idempotent and local compose does not seed by default', () => {
  const seed = read('prisma/seed.js');
  const compose = read('../docker-compose.yml');
  assert.doesNotMatch(seed, /deleteMany/);
  assert.match(seed, /\.upsert\(/);
  assert.match(seed, /skipDuplicates: true/);
  assert.match(compose, /RUN_SEED: \$\{RUN_SEED:-false\}/);
});

test('frontend sanitizes registry payloads and dashboard resolves device through asset', () => {
  const registry = read('../frontend/src/pages/RegistryPage.jsx');
  const dashboard = read('src/modules/dashboards/dashboards.service.ts');
  assert.match(registry, /relationshipFields/);
  assert.match(registry, /form\[field\] === '' \? null/);
  assert.doesNotMatch(registry, /JSON\.stringify\(form\)/);
  assert.match(dashboard, /asset: \{ devices: \{ some: \{ id: filters\.deviceId \} \} \}/);
});

test('frontend exposes visible complete CRUD actions for companies, sites, assets and devices', () => {
  const registry = read('../frontend/src/pages/RegistryPage.jsx');
  const companies = read('../frontend/src/pages/CompaniesPage.jsx');
  for (const kind of ['companies', 'sites', 'assets', 'devices']) assert.match(registry, new RegExp(`${kind}: \\{`));
  for (const label of ['Nova Empresa', 'Nova Unidade', 'Novo Ativo', 'Novo Dispositivo', 'Visualizar', 'Editar', 'Ativar/Inativar', 'Excluir']) {
    assert.ok(registry.includes(label), `missing visible action ${label}`);
  }
  assert.match(companies, /<RegistryCrud kind="companies" embedded \/>/);
});
