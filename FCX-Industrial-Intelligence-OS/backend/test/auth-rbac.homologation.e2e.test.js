const assert = require('node:assert/strict');
const test = require('node:test');

const apiUrl = (process.env.HML_API_URL || 'http://127.0.0.1:53000').replace(/\/$/, '');
const adminEmail = 'admin@nexusiotenergy.com.br';
const adminPassword = process.env.HML_INITIAL_ADMIN_PASSWORD || 'FCX-Hml-Admin-ChangeMe!';

async function request(path, options = {}, expectedStatus = 200) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const body = await response.json().catch(() => null);
  assert.equal(response.status, expectedStatus, `${options.method || 'GET'} ${path}: ${response.status} ${JSON.stringify(body)}`);
  return body;
}

test('FCX 5.2 authentication and legacy compatibility work in isolated homologation', async (t) => {
  await t.test('public and protected route policy', async () => {
    assert.equal((await request('/health')).status, 'ok');
    await request('/companies', {}, 401);
  });

  const session = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email: adminEmail, password: adminPassword }),
  });
  assert.ok(session.accessToken);
  assert.ok(session.refreshToken);
  assert.equal(session.user.role, 'MASTER_ADMIN');
  const auth = { Authorization: `Bearer ${session.accessToken}` };

  await t.test('JWT grants access to protected legacy routes', async () => {
    for (const path of ['/companies', '/assets', '/telemetry', '/dashboards', '/acquisition', '/roles', '/permissions', '/users']) {
      const body = await request(path, { headers: auth });
      assert.notEqual(body, null, `${path} returned null`);
    }
  });

  await t.test('seed creates admin, roles and permissions', async () => {
    const users = await request('/users', { headers: auth });
    const roles = await request('/roles', { headers: auth });
    const permissions = await request('/permissions', { headers: auth });
    assert.ok(users.some((item) => item.email === adminEmail));
    for (const role of ['MASTER_ADMIN', 'FCX_ADMIN', 'SUPERVISOR', 'TECHNICIAN', 'CLIENT']) assert.ok(roles.some((item) => item.name === role));
    for (const permission of ['read', 'create', 'update', 'delete', '*']) assert.ok(permissions.some((item) => item.key === permission));
  });

  await t.test('refresh rotates token and logout revokes it', async () => {
    const refreshed = await request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken: session.refreshToken }) });
    assert.ok(refreshed.accessToken);
    assert.ok(refreshed.refreshToken);
    await request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken: session.refreshToken }) }, 401);
    await request('/auth/logout', { method: 'POST', body: JSON.stringify({ refreshToken: refreshed.refreshToken }) });
    await request('/auth/refresh', { method: 'POST', body: JSON.stringify({ refreshToken: refreshed.refreshToken }) }, 401);
  });

  await t.test('RBAC denies write access to CLIENT role', async () => {
    const suffix = Date.now().toString();
    const clientUser = await request('/users', {
      method: 'POST',
      headers: auth,
      body: JSON.stringify({ nome: 'HML Client', email: `hml-client-${suffix}@fcx.local`, password: 'Hml-Client-Password!', role: 'CLIENT', status: 'ACTIVE' }),
    });
    const clientSession = await request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: clientUser.email, password: 'Hml-Client-Password!' }),
    });
    const clientAuth = { Authorization: `Bearer ${clientSession.accessToken}` };
    await request('/assets', { headers: clientAuth });
    await request('/companies', { method: 'POST', headers: clientAuth, body: JSON.stringify({}) }, 403);
    await request(`/users/${clientUser.id}`, { method: 'DELETE', headers: auth });
  });

  await t.test('audit contains login, logout, create and delete events', async () => {
    let logs = [];
    for (let attempt = 0; attempt < 10; attempt += 1) {
      logs = await request('/audit-logs?limit=200', { headers: auth });
      if (['login', 'logout', 'create', 'delete'].every((action) => logs.some((item) => item.action === action))) break;
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
    for (const action of ['login', 'logout', 'create', 'delete']) assert.ok(logs.some((item) => item.action === action), `missing audit action ${action}`);
  });
});
