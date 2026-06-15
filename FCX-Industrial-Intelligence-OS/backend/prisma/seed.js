const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const pick = (items) => items[Math.floor(Math.random() * items.length)];
const range = (min, max, decimals = 2) => Number((min + Math.random() * (max - min)).toFixed(decimals));
const hoursAgo = (hours) => new Date(Date.now() - hours * 60 * 60 * 1000);

async function main() {
  await prisma.alarmEvent.deleteMany();
  await prisma.telemetryProcessed.deleteMany();
  await prisma.telemetryRaw.deleteMany();
  await prisma.alarm.deleteMany();
  await prisma.workOrder.deleteMany();
  await prisma.telemetry.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.user.deleteMany();

  const tipos = ['COMPRESSOR', 'RACK', 'COLD_ROOM', 'EVAPORATOR', 'CONDENSER', 'PANEL', 'PUMP', 'FAN'];
  const fabricantes = ['Bitzer', 'Danfoss', 'Copeland', 'Carel', 'Schneider', 'Siemens', 'WEG'];
  const unidades = ['Unidade SP-01', 'Unidade SP-02', 'CD Recife', 'CD Curitiba', 'Loja Campinas'];
  const criticidades = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  const statuses = ['ONLINE', 'ONLINE', 'ONLINE', 'MAINTENANCE', 'ALARM', 'OFFLINE'];

  const assets = [];
  for (let i = 1; i <= 50; i += 1) {
    assets.push(
      await prisma.asset.create({
        data: {
          nome: `FCX-${String(i).padStart(3, '0')} ${pick(['Compressor', 'Rack', 'Camara', 'Condensador', 'Bomba'])}`,
          tipo: pick(tipos),
          fabricante: pick(fabricantes),
          modelo: `MVP-${1000 + i}`,
          unidade: pick(unidades),
          criticidade: pick(criticidades),
          status: pick(statuses),
          createdAt: hoursAgo(range(100, 2000, 0)),
        },
      }),
    );
  }

  const telemetryBatch = [];
  for (let i = 0; i < 5000; i += 1) {
    const asset = pick(assets);
    const temperatura = range(-8, 42);
    const vibracao = range(0.1, asset.criticidade === 'CRITICAL' ? 8.5 : 4.5);
    const corrente = range(8, 120);
    const tensao = range(210, 440);
    telemetryBatch.push({
      assetId: asset.id,
      timestamp: hoursAgo(range(0, 720, 0)),
      temperatura,
      vibracao,
      corrente,
      tensao,
      potencia: Number(((corrente * tensao * 1.73 * range(0.72, 0.96)) / 1000).toFixed(2)),
      pressaoSuccao: range(1.2, 6.5),
      pressaoDescarga: range(8, 24),
    });
  }

  assets.slice(0, 8).forEach((asset, assetIndex) => {
    for (let hour = 96; hour >= 1; hour -= 1) {
      const trend = (96 - hour) / 96;
      const corrente = range(70, 118);
      const tensao = range(360, 430);
      telemetryBatch.push({
        assetId: asset.id,
        timestamp: hoursAgo(hour),
        temperatura: Number((24 + trend * 17 + range(-1.5, 2.2)).toFixed(2)),
        vibracao: Number((2 + trend * (assetIndex % 2 === 0 ? 6.8 : 3.6) + range(-0.25, 0.55)).toFixed(2)),
        corrente,
        tensao,
        potencia: Number(((corrente * tensao * 1.73 * range(0.82, 0.98)) / 1000).toFixed(2)),
        pressaoSuccao: range(1.4, 5.8),
        pressaoDescarga: Number((13 + trend * 9 + range(-1.1, 1.5)).toFixed(2)),
      });
    }
  });
  await prisma.telemetry.createMany({ data: telemetryBatch });

  const acquisitionRawBatch = assets.slice(0, 20).map((asset) => ({
    assetId: asset.id,
    source: 'seed-realistic-acquisition',
    protocol: 'mqtt',
    topic: `fcx/telemetry/${asset.id}`,
    payload: {
      assetId: asset.id,
      temperatura: range(18, 38),
      vibracao: range(0.4, 6.8),
      corrente: range(12, 105),
      tensao: range(220, 440),
      potencia: range(8, 82),
      pressao: range(4, 24),
      umidade: range(45, 88),
    },
  }));
  await prisma.telemetryRaw.createMany({ data: acquisitionRawBatch });

  const acquisitionProcessedBatch = assets.slice(0, 20).map((asset) => ({
    assetId: asset.id,
    source: 'seed-realistic-acquisition',
    timestamp: hoursAgo(range(0, 24, 0)),
    temperatura: range(18, 38),
    vibracao: range(0.4, 6.8),
    corrente: range(12, 105),
    tensao: range(220, 440),
    potencia: range(8, 82),
    pressao: range(4, 24),
    pressaoSuccao: range(1.8, 6.2),
    pressaoDescarga: range(8, 24),
    umidade: range(45, 88),
    quality: 'GOOD',
  }));
  await prisma.telemetryProcessed.createMany({ data: acquisitionProcessedBatch });

  const alarmTitles = [
    'Temperatura fora da faixa',
    'Vibracao elevada',
    'Corrente acima do limite',
    'Pressao de descarga alta',
    'Ativo sem comunicacao',
  ];

  const alarmBatch = [];
  for (let i = 0; i < 100; i += 1) {
    const asset = pick(assets);
    alarmBatch.push({
      assetId: asset.id,
      severidade: pick(['INFO', 'WARNING', 'CRITICAL']),
      titulo: pick(alarmTitles),
      descricao: `Alarme simulado para validacao operacional do ativo ${asset.nome}.`,
      timestamp: hoursAgo(range(0, 300, 0)),
      status: pick(['ACTIVE', 'ACTIVE', 'ACKNOWLEDGED', 'RESOLVED']),
    });
  }
  await prisma.alarm.createMany({ data: alarmBatch });

  await prisma.alarmEvent.createMany({
    data: assets.slice(0, 10).map((asset) => ({
      assetId: asset.id,
      source: 'seed-realistic-acquisition',
      severidade: pick(['WARNING', 'CRITICAL']),
      titulo: pick(['Temperatura critica', 'Vibracao critica', 'Potencia elevada', 'Umidade elevada']),
      descricao: `Evento de aquisicao simulado para validacao do ativo ${asset.nome}.`,
      metric: pick(['temperatura', 'vibracao', 'potencia', 'umidade']),
      value: range(35, 95),
      threshold: range(30, 80),
      timestamp: hoursAgo(range(0, 48, 0)),
      status: pick(['ACTIVE', 'ACKNOWLEDGED']),
    })),
  });

  const workOrderBatch = [];
  for (let i = 1; i <= 50; i += 1) {
    const asset = pick(assets);
    const status = pick(['OPEN', 'IN_PROGRESS', 'WAITING_PARTS', 'CLOSED']);
    workOrderBatch.push({
      numeroOs: `OS-${new Date().getFullYear()}-${String(i).padStart(4, '0')}`,
      assetId: asset.id,
      tecnico: pick(['Carlos Lima', 'Renata Alves', 'Marcos Silva', 'Ana Ribeiro', 'Equipe FCX']),
      prioridade: pick(['LOW', 'MEDIUM', 'HIGH', 'URGENT']),
      status,
      descricao: `Ordem simulada para inspecao, diagnostico e manutencao do ativo ${asset.nome}.`,
      dataAbertura: hoursAgo(range(24, 600, 0)),
      dataFechamento: status === 'CLOSED' ? hoursAgo(range(1, 20, 0)) : null,
    });
  }
  await prisma.workOrder.createMany({ data: workOrderBatch });

  await prisma.user.createMany({
    data: [
      { nome: 'Administrador FCX', email: 'admin@fcx.local', role: 'ADMIN' },
      { nome: 'Gestor Industrial', email: 'gestor@fcx.local', role: 'MANAGER' },
      { nome: 'Engenharia FCX', email: 'engenharia@fcx.local', role: 'ENGINEER' },
      { nome: 'Tecnico Campo', email: 'tecnico@fcx.local', role: 'TECHNICIAN' },
      { nome: 'Visualizador Operacao', email: 'viewer@fcx.local', role: 'VIEWER' },
    ],
  });

  console.log('Seed concluido: 50 ativos, 5000+ telemetrias, dados de aquisicao, 100 alarmes, 50 ordens de servico e 5 usuarios.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
