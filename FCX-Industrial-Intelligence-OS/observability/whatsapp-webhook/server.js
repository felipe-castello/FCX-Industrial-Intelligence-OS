const http = require('http');
const https = require('https');

const port = Number(process.env.PORT || 8080);
const token = process.env.WHATSAPP_ACCESS_TOKEN;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const to = process.env.WHATSAPP_TO;

const readBody = (request) =>
  new Promise((resolve, reject) => {
    let body = '';
    request.on('data', (chunk) => {
      body += chunk;
      if (body.length > 1024 * 1024) {
        request.destroy();
        reject(new Error('payload too large'));
      }
    });
    request.on('end', () => resolve(body));
    request.on('error', reject);
  });

const formatAlert = (payload) => {
  const alerts = payload.alerts || [];
  const lines = alerts.slice(0, 8).map((alert) => {
    const status = alert.status === 'resolved' ? 'RESOLVIDO' : 'ALERTA';
    const labels = alert.labels || {};
    const annotations = alert.annotations || {};
    return [
      `[${status}] ${labels.severity || 'unknown'} - ${labels.alertname || 'alert'}`,
      `Servico: ${labels.service || labels.job || 'n/a'}`,
      annotations.summary || '',
      annotations.description || '',
    ]
      .filter(Boolean)
      .join('\n');
  });

  return `FCX Industrial OS\n\n${lines.join('\n\n')}`;
};

const sendWhatsApp = (message) =>
  new Promise((resolve, reject) => {
    if (!token || !phoneNumberId || !to) {
      console.log('[whatsapp-alerts] credentials not configured. Message follows:');
      console.log(message);
      resolve();
      return;
    }

    const payload = JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { preview_url: false, body: message.slice(0, 3500) },
    });

    const request = https.request(
      {
        hostname: 'graph.facebook.com',
        path: `/v20.0/${phoneNumberId}/messages`,
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(payload),
        },
      },
      (response) => {
        let responseBody = '';
        response.on('data', (chunk) => {
          responseBody += chunk;
        });
        response.on('end', () => {
          if (response.statusCode >= 200 && response.statusCode < 300) {
            resolve();
          } else {
            reject(new Error(`WhatsApp API returned ${response.statusCode}: ${responseBody}`));
          }
        });
      },
    );

    request.on('error', reject);
    request.write(payload);
    request.end();
  });

const server = http.createServer(async (request, response) => {
  if (request.url === '/health') {
    response.writeHead(200, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ status: 'ok' }));
    return;
  }

  if (request.url !== '/alertmanager' || request.method !== 'POST') {
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'not found' }));
    return;
  }

  try {
    const rawBody = await readBody(request);
    const payload = JSON.parse(rawBody || '{}');
    await sendWhatsApp(formatAlert(payload));
    response.writeHead(202, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ status: 'accepted' }));
  } catch (error) {
    console.error('[whatsapp-alerts]', error.message);
    response.writeHead(500, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ error: 'failed to process alert' }));
  }
});

server.listen(port, () => {
  console.log(`[whatsapp-alerts] listening on ${port}`);
});
