const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  await prisma.alarmEvent.deleteMany();
  await prisma.telemetryProcessed.deleteMany();
  await prisma.telemetryRaw.deleteMany();
  await prisma.alarm.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.telemetry.deleteMany();
  await prisma.asset.deleteMany();

  const asset = await prisma.asset.create({
    data: {
      id: 'mt100',
      nome: 'Compressor MT100',
      tipo: 'COMPRESSOR',
      fabricante: 'FCX Demo',
      modelo: 'Compressor semi-hermético',
      unidade: 'Sala de Máquinas / Rack 01',
      criticidade: 'HIGH',
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

  console.log('Seed concluído: MT100 criado com telemetria inicial e zero alarmes.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
