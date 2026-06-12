const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { test } = require('node:test');

const apiUrl = (process.env.E2E_API_URL || 'http://127.0.0.1:3000').replace(/\/$/, '');
const suffix = Date.now().toString();

async function request(path, options = {}) {
  const response = await fetch(`${apiUrl}${path}`, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  });
  const body = response.status === 204 ? null : await response.json();
  assert.ok(response.ok, `${options.method || 'GET'} ${path} failed: ${response.status} ${JSON.stringify(body)}`);
  return body;
}

test('production multi-company flow works against real API and database', async (t) => {
  const health = await request('/health');
  assert.equal(health.status, 'ok');

  const defaults = {
    clients: await request('/clients'),
    sites: await request('/sites'),
    assets: await request('/assets'),
  };
  assert.ok(defaults.clients.some((item) => item.name === 'FCX DEFAULT'));
  assert.ok(defaults.sites.some((item) => item.name === 'LABORATORIO'));
  assert.ok(defaults.assets.some((item) => item.name === 'GENERICO'));

  const created = {};
  await t.test('Client CRUD supports GET POST PUT DELETE', async () => {
    created.client = await request('/clients', {
      method: 'POST',
      body: JSON.stringify({
        name: `E2E Client ${suffix}`, cnpj: `E2E-${suffix}`, email: `e2e-${suffix}@fcx.local`,
        phone: '27999999999', address: 'Rua E2E', city: 'Vitoria', state: 'ES',
      }),
    });
    assert.equal((await request(`/clients/${created.client.id}`)).name, `E2E Client ${suffix}`);
    created.client = await request(`/clients/${created.client.id}`, {
      method: 'PUT', body: JSON.stringify({ name: `E2E Client Updated ${suffix}` }),
    });
    assert.equal(created.client.name, `E2E Client Updated ${suffix}`);
  });

  await t.test('Site CRUD accepts optional relationships and PUT', async () => {
    created.site = await request('/sites', {
      method: 'POST',
      body: JSON.stringify({ clientId: created.client.id, name: `E2E Site ${suffix}`, address: 'Lab', city: 'Vitoria', state: 'ES' }),
    });
    created.site = await request(`/sites/${created.site.id}`, {
      method: 'PUT', body: JSON.stringify({ address: 'Lab Updated' }),
    });
    assert.equal(created.site.address, 'Lab Updated');
  });

  await t.test('Asset CRUD accepts optional relationships and PUT', async () => {
    created.asset = await request('/assets', {
      method: 'POST',
      body: JSON.stringify({ siteId: created.site.id, name: `E2E Asset ${suffix}`, type: 'OTHER', location: 'Lab E2E' }),
    });
    created.asset = await request(`/assets/${created.asset.id}`, {
      method: 'PUT', body: JSON.stringify({ brand: 'FCX E2E' }),
    });
    assert.equal(created.asset.brand, 'FCX E2E');
  });

  await t.test('Device CRUD supports unbound and asset-bound devices', async () => {
    created.unboundDevice = await request('/devices', {
      method: 'POST',
      body: JSON.stringify({ assetId: null, name: `Unbound ${suffix}`, serialNumber: `UNBOUND-${suffix}`, deviceType: 'sensor', protocol: 'MQTT' }),
    });
    assert.equal(created.unboundDevice.assetId, null);
    created.device = await request('/devices', {
      method: 'POST',
      body: JSON.stringify({ assetId: created.asset.id, name: `Device ${suffix}`, serialNumber: `DEVICE-${suffix}`, deviceType: 'gateway', protocol: 'MQTT' }),
    });
    created.device = await request(`/devices/${created.device.id}`, {
      method: 'PUT', body: JSON.stringify({ name: `Device Updated ${suffix}` }),
    });
    assert.equal(created.device.name, `Device Updated ${suffix}`);
  });

  const telemetryBase = {
    assetId: created.asset.id, temperatura: 22.5, vibracao: 1.2, corrente: 5,
    tensao: 220, potencia: 1.1, pressaoSuccao: 2.1, pressaoDescarga: 8.4,
  };
  await t.test('Telemetry accepts optional client, site and device context', async () => {
    created.telemetry = [];
    created.telemetry.push(await request('/telemetry', { method: 'POST', body: JSON.stringify(telemetryBase) }));
    created.telemetry.push(await request('/telemetry', { method: 'POST', body: JSON.stringify({ ...telemetryBase, clientId: created.client.id }) }));
    created.telemetry.push(await request('/telemetry', { method: 'POST', body: JSON.stringify({ ...telemetryBase, siteId: created.site.id }) }));
    created.telemetry.push(await request('/telemetry', { method: 'POST', body: JSON.stringify({ ...telemetryBase, deviceId: created.device.id }) }));
    assert.equal(created.telemetry.length, 4);
    assert.ok(created.telemetry.every((item) => item.assetId === created.asset.id));
  });

  await t.test('Dashboard works without filters and with all optional filters', async () => {
    const paths = [
      '/dashboards',
      `/dashboards?clientId=${created.client.id}`,
      `/dashboards?siteId=${created.site.id}`,
      `/dashboards?assetId=${created.asset.id}`,
      `/dashboards?deviceId=${created.device.id}`,
    ];
    for (const path of paths) {
      const dashboard = await request(path);
      assert.ok(dashboard.kpis.assetsCount >= 1, `${path} did not include the E2E asset`);
      assert.ok(Array.isArray(dashboard.widgets.tendenciaTemperatura));
    }
  });

  await t.test('idempotent seed preserves historical telemetry', async () => {
    const before = await request(`/telemetry?assetId=${created.asset.id}`);
    const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm';
    execFileSync(npm, ['run', 'db:seed'], { cwd: process.cwd(), env: process.env, stdio: 'pipe' });
    execFileSync(npm, ['run', 'db:seed'], { cwd: process.cwd(), env: process.env, stdio: 'pipe' });
    const after = await request(`/telemetry?assetId=${created.asset.id}`);
    assert.equal(after.length, before.length);
    assert.deepEqual(after.map((item) => item.id).sort(), before.map((item) => item.id).sort());
  });

  await t.test('DELETE removes E2E records without touching defaults', async () => {
    for (const item of created.telemetry) await request(`/telemetry/${item.id}`, { method: 'DELETE' });
    await request(`/devices/${created.device.id}`, { method: 'DELETE' });
    await request(`/devices/${created.unboundDevice.id}`, { method: 'DELETE' });
    await request(`/assets/${created.asset.id}`, { method: 'DELETE' });
    await request(`/sites/${created.site.id}`, { method: 'DELETE' });
    await request(`/clients/${created.client.id}`, { method: 'DELETE' });
    assert.ok((await request('/clients')).some((item) => item.name === 'FCX DEFAULT'));
  });
});
