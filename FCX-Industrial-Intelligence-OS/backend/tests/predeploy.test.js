const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const test = require('node:test');

const root = path.resolve(__dirname, '..');
const read = (relativePath) => fs.readFileSync(path.join(root, relativePath), 'utf8');

test('/api/health e /health estao registrados', () => {
  const controller = read('src/health/health.controller.ts');

  assert.match(controller, /Controller\(\['health', 'api\/health'\]\)/);
  assert.match(controller, /this\.healthService\.check\(\)/);
});

test('healthcheck retorna contrato FCX 6.0 com banco e redis', () => {
  const service = read('src/health/health.service.ts');

  assert.match(service, /version: '6\.0'/);
  assert.match(service, /database/);
  assert.match(service, /redis/);
  assert.match(service, /\$queryRaw`SELECT 1`/);
  assert.match(service, /redis\.ping\(\)/);
});

test('AppModule inicializa modulos essenciais e modulos FCX 6', () => {
  const appModule = read('src/app.module.ts');

  [
    'AssetsModule',
    'TelemetryModule',
    'AlarmsModule',
    'WorkOrdersModule',
    'UsersModule',
    'DashboardsModule',
    'IntegrationsModule',
    'PredictiveModule',
    'QuantModule',
    'KnowledgeModule',
    'ChatModule',
  ].forEach((moduleName) => assert.match(appModule, new RegExp(moduleName)));
});

test('feature flags e fallbacks seguros existem', () => {
  const featureFlags = read('src/modules/feature-flags.ts');

  [
    'ENABLE_AGENT_SKILLS',
    'ENABLE_LIBRECHAT',
    'ENABLE_LANGCHAIN',
    'ENABLE_NANGO',
    'ENABLE_QUANTDINGER',
    'ENABLE_UNDERSTAND_ANYTHING',
    'safeModuleFallback',
  ].forEach((token) => assert.match(featureFlags, new RegExp(token)));
});

test('QuantDinger e Quant Intelligence nao habilitam modo financeiro real', () => {
  const quantService = read('src/modules/quant/quant.service.ts');
  const quantDingerAdapter = fs.readFileSync(
    path.resolve(root, '..', 'fcx-6.0/packages/fcx-quantdinger-adapter/src/index.js'),
    'utf8',
  );

  assert.match(quantService, /research/);
  assert.match(quantService, /simulation/);
  assert.doesNotMatch(quantService, /live-trading|executeOrder|placeOrder/);
  assert.match(quantDingerAdapter, /Only research\/simulation modes are allowed/);
  assert.match(quantDingerAdapter, /decision: 'BLOCK'/);
});
