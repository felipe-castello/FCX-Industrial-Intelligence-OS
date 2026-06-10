const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.sensor.deleteMany();
  await prisma.gateway.deleteMany();
  await prisma.alarmEvent.deleteMany();
  await prisma.telemetryProcessed.deleteMany();
  await prisma.telemetryRaw.deleteMany();
  await prisma.alarm.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.telemetry.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.site.deleteMany();
  await prisma.company.deleteMany();

  const company = await prisma.company.create({
    data: {
      id: 'fcx-demo',
      name: 'FCX Demo',
      document: '00.000.000/0001-00',
      contactName: 'Operação FCX',
      contactEmail: 'operacao@fcx.demo',
      contactPhone: '+55 11 4000-5000',
      status: 'ACTIVE',
    },
  });

  const site = await prisma.site.create({
    data: {
      id: 'mt100-lab',
      companyId: company.id,
      name: 'Loja MT100 Lab',
      address: 'Sala de Máquinas / Rack 01',
      city: 'São Paulo',
      state: 'SP',
      status: 'ACTIVE',
    },
  });

  const asset = await prisma.asset.create({
    data: {
      id: 'mt100',
      siteId: site.id,
      nome: 'Rack MT100',
      tipo: 'RACK',
      fabricante: 'FCX Demo',
      modelo: 'MT100',
      serialNumber: 'MT100-DEMO-001',
      unidade: site.name,
      criticidade: 'HIGH',
      status: 'ONLINE',
    },
  });

  await prisma.sensor.createMany({
    data: [
      {
        id: 'sensor-mt100-temperature',
        assetId: asset.id,
        name: 'Sensor de temperatura MT100',
        type: 'temperature',
        unit: '°C',
        protocol: 'MQTT',
        mqttTopic: 'fcx/telemetry/mt100/temperature',
        status: 'ONLINE',
      },
      {
        id: 'sensor-mt100-vibration',
        assetId: asset.id,
        name: 'Sensor de vibração MT100',
        type: 'vibration',
        unit: 'mm/s',
        protocol: 'MQTT',
        mqttTopic: 'fcx/telemetry/mt100/vibration',
        status: 'ONLINE',
      },
    ],
  });

  await prisma.gateway.create({
    data: {
      id: 'gateway-mqtt-mt100',
      siteId: site.id,
      name: 'Gateway MQTT MT100',
      model: 'FCX Edge 100',
      ipAddress: '192.168.10.100',
      protocol: 'MQTT',
      status: 'ONLINE',
    },
  });

  const telemetry = {
    assetId: asset.id,
    temperatura: 32.4,
    vibracao: 1.82,
    corrente: 38.6,
    tensao: 380,
    potencia: 21.7,
    pressaoSuccao: 3.2,
    pressaoDescarga: 14.8,
  };

  await prisma.telemetry.create({ data: telemetry });
  await prisma.telemetryRaw.create({
    data: {
      assetId: asset.id,
      source: 'fcx-demo-seed',
      protocol: 'MQTT',
      topic: 'fcx/telemetry/mt100',
      payload: {
        temperature: telemetry.temperatura,
        vibration: telemetry.vibracao,
        current: telemetry.corrente,
        power: telemetry.potencia,
        suctionPressure: telemetry.pressaoSuccao,
        dischargePressure: telemetry.pressaoDescarga,
      },
    },
  });

  await prisma.telemetryProcessed.create({
    data: {
      assetId: asset.id,
      source: 'fcx-demo-seed',
      temperatura: telemetry.temperatura,
      vibracao: telemetry.vibracao,
      corrente: telemetry.corrente,
      tensao: telemetry.tensao,
      potencia: telemetry.potencia,
      pressaoSuccao: telemetry.pressaoSuccao,
      pressaoDescarga: telemetry.pressaoDescarga,
      quality: 'GOOD',
    },
  });

  console.log('Seed concluído: FCX Demo, Loja MT100 Lab, Rack MT100, 2 sensores, gateway MQTT e zero alarmes.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
