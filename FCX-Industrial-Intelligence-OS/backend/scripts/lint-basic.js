const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const projectRoot = path.resolve(root, '..');
const failures = [];

function walk(dir, callback) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      if (!['node_modules', 'dist', '.git'].includes(entry.name)) {
        walk(fullPath, callback);
      }
      continue;
    }

    callback(fullPath);
  }
}

function assertFileContains(file, pattern, message) {
  const content = fs.readFileSync(file, 'utf8');
  if (!pattern.test(content)) {
    failures.push(message);
  }
}

assertFileContains(
  path.join(root, 'src/security/http-security.ts'),
  /Rate limit exceeded/,
  'Rate limit basico nao encontrado em http-security.ts',
);

assertFileContains(
  path.join(root, 'src/health/health.controller.ts'),
  /api\/health/,
  'Endpoint /api/health nao encontrado.',
);

walk(projectRoot, (file) => {
  const relative = path.relative(projectRoot, file);

  if (relative === 'backend\\scripts\\lint-basic.js' || relative === 'backend\\tests\\predeploy.test.js') {
    return;
  }

  if (!/\.(env|ts|js|json|md|yml|yaml|sh|ps1)$/.test(file)) {
    return;
  }

  const content = fs.readFileSync(file, 'utf8');

  if (/sk-[A-Za-z0-9_-]{20,}/.test(content)) {
    failures.push(`Possivel chave OpenAI real encontrada em ${relative}`);
  }

  if (/ghp_[A-Za-z0-9_]{20,}/.test(content)) {
    failures.push(`Possivel token GitHub real encontrado em ${relative}`);
  }

  if (/executeOrder|placeOrder|live-trading/.test(content)) {
    failures.push(`Possivel execucao financeira real encontrada em ${relative}`);
  }
});

if (failures.length > 0) {
  console.error(failures.join('\n'));
  process.exit(1);
}

console.log('basic lint passed');
