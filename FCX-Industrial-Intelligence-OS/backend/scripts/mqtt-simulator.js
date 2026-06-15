const mqtt = require('mqtt');

const MQTT_URL = process.env.MQTT_URL || 'mqtt://localhost:1883';
const API_URL = process.env.API_URL || 'http://localhost:3000';
const TOPIC_PREFIX = process.env.MQTT_SIMULATOR_TOPIC_PREFIX || 'fcx/telemetry';
const INTERVAL_MS = Number(process.env.MQTT_SIMULATOR_INTERVAL_MS || 5000);

const pick = (items) => items[Math.floor(Math.random() * items.length)];
const range = (min, max, decimals = 2) => Number((min + Math.random() * (max - min)).toFixed(decimals));

async function loadAssets() {
  try {
    const response = await fetch(`${API_URL}/assets`);
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }
    const assets = await response.json();
    return Array.isArray(assets) ? assets : [];
  } catch (error) {
    console.log(`Waiting for backend assets at ${API_URL}: ${error.message}`);
    return [];
  }
}

function createPayload(asset) {
  const corrente = range(10, 115);
  const tensao = range(215, 430);
  const energia = Number(((corrente * tensao * 1.73 * range(0.74, 0.94)) / 1000).toFixed(2));

  return {
    assetId: asset.id,
    externalId: asset.nome,
    timestamp: new Date().toISOString(),
    temperatura: range(-5, asset.criticidade === 'CRITICAL' ? 41 : 32),
    vibracao: range(0.2, asset.criticidade === 'CRITICAL' ? 8.8 : 4.8),
    corrente,
    tensao,
    energia,
    potencia: energia,
    pressaoSuccao: range(1.5, 6.2),
    pressaoDescarga: range(8.5, 23.5),
  };
}

async function start() {
  const client = mqtt.connect(MQTT_URL, { clientId: `fcx-mqtt-simulator-${Date.now()}` });
  let assets = [];

  client.on('connect', () => {
    console.log(`MQTT simulator connected to ${MQTT_URL}`);
  });

  client.on('error', (error) => {
    console.error(`MQTT simulator error: ${error.message}`);
  });

  setInterval(async () => {
    if (assets.length === 0) {
      assets = await loadAssets();
    }

    if (assets.length === 0) {
      return;
    }

    const asset = pick(assets);
    const payload = createPayload(asset);
    const topic = `${TOPIC_PREFIX}/${asset.id}`;
    client.publish(topic, JSON.stringify(payload), { qos: 0 });
    console.log(`Published telemetry to ${topic}`);
  }, INTERVAL_MS);
}

start();
