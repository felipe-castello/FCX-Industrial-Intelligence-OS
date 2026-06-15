const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
  const defaultClient = await prisma.client.upsert({
    where: { cnpj: '00.000.000/0000-00' },
    update: { name: 'FCX DEFAULT', status: 'ACTIVE' },
    create: {
      id: 'fcx-default-client',
      name: 'FCX DEFAULT',
      cnpj: '00.000.000/0000-00',
      email: 'default@fcx.local',
      phone: '-',
      address: '-',
      city: '-',
      state: '-',
      status: 'ACTIVE',
    },
  });

  const defaultSite = await prisma.site.upsert({
    where: { id: 'fcx-default-site' },
    update: { clientId: defaultClient.id, name: 'LABORATORIO', status: 'ACTIVE' },
    create: {
      id: 'fcx-default-site',
      clientId: defaultClient.id,
      name: 'LABORATORIO',
      address: '-',
      city: '-',
      state: '-',
      status: 'ACTIVE',
    },
  });

  await prisma.asset.upsert({
    where: { id: 'fcx-default-asset' },
    update: { siteId: defaultSite.id, nome: 'GENERICO', unidade: defaultSite.name },
    create: {
      id: 'fcx-default-asset',
      siteId: defaultSite.id,
      nome: 'GENERICO',
      tipo: 'OTHER',
      unidade: defaultSite.name,
      location: defaultSite.name,
      status: 'OFFLINE',
    },
  });

  const companies = [
    ['1', 'FCX Demo Company'], ['2', 'Extrabom'], ['3', 'Carone'],
    ['4', 'Realmar'], ['5', 'Terca Zilli'], ['6', 'Metal Trade'],
  ];
  for (const [id, name] of companies) {
    const index = Number(id);
    await prisma.company.upsert({
      where: { id },
      update: { name, status: 'ACTIVE' },
      create: {
        id,
        name,
        document: `00.000.00${index}/0001-00`,
        contactName: `Operacao ${name}`,
        contactEmail: `operacao@${name.toLowerCase().replaceAll(' ', '-')}.com.br`,
        contactPhone: '+55 11 4000-5000',
        status: 'ACTIVE',
      },
    });
  }

  const permissions = [
    ['read', 'Read operational resources'],
    ['create', 'Create operational resources'],
    ['update', 'Update operational resources'],
    ['delete', 'Delete operational resources'],
    ['*', 'Full platform access'],
  ];
  for (const [key, description] of permissions) {
    await prisma.permission.upsert({ where: { key }, update: { description }, create: { key, description } });
  }

  const roleDefinitions = {
    MASTER_ADMIN: ['*'],
    FCX_ADMIN: ['read', 'create', 'update', 'delete'],
    SUPERVISOR: ['read', 'create', 'update'],
    TECHNICIAN: ['read', 'update'],
    CLIENT: ['read'],
  };
  for (const [name, permissionKeys] of Object.entries(roleDefinitions)) {
    const role = await prisma.role.upsert({
      where: { name },
      update: { description: `FCX 5.2 ${name}` },
      create: { id: `role-${name.toLowerCase().replaceAll('_', '-')}`, name, description: `FCX 5.2 ${name}` },
    });
    for (const key of permissionKeys) {
      const permission = await prisma.permission.findUniqueOrThrow({ where: { key } });
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permission.id } },
        update: {},
        create: { roleId: role.id, permissionId: permission.id },
      });
    }
  }

  const masterRole = await prisma.role.findUniqueOrThrow({ where: { name: 'MASTER_ADMIN' } });
  const initialAdminPassword = process.env.INITIAL_ADMIN_PASSWORD || 'ChangeMe-FCX-5.2!';
  const existingAdmin = await prisma.user.findUnique({ where: { email: 'admin@nexusiotenergy.com.br' } });
  if (existingAdmin) {
    await prisma.user.update({
      where: { id: existingAdmin.id },
      data: {
        role: 'MASTER_ADMIN',
        roleId: masterRole.id,
        status: 'ACTIVE',
        ...(!existingAdmin.passwordHash ? { passwordHash: await bcrypt.hash(initialAdminPassword, Number(process.env.BCRYPT_ROUNDS || 12)) } : {}),
      },
    });
  } else {
    await prisma.user.create({
      data: {
        companyId: '1',
        roleId: masterRole.id,
        nome: 'FCX Master Admin',
        email: 'admin@nexusiotenergy.com.br',
        passwordHash: await bcrypt.hash(initialAdminPassword, Number(process.env.BCRYPT_ROUNDS || 12)),
        role: 'MASTER_ADMIN',
        status: 'ACTIVE',
      },
    });
  }

  const site = await prisma.site.upsert({
    where: { id: 'mt100-lab' },
    update: { companyId: '1', clientId: defaultClient.id, status: 'ACTIVE' },
    create: {
      id: 'mt100-lab',
      companyId: '1',
      clientId: defaultClient.id,
      name: 'Loja MT100 Lab',
      address: 'Sala de Maquinas / Rack 01',
      city: 'Sao Paulo',
      state: 'SP',
      status: 'ACTIVE',
    },
  });

  const asset = await prisma.asset.upsert({
    where: { id: 'mt100' },
    update: { companyId: '1', siteId: site.id, status: 'ONLINE' },
    create: {
      id: 'mt100',
      companyId: '1',
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
    skipDuplicates: true,
    data: [
      {
        id: 'sensor-mt100-temperature',
        assetId: asset.id,
        name: 'Sensor de temperatura MT100',
        type: 'temperature',
        unit: 'C',
        protocol: 'MQTT',
        mqttTopic: 'fcx/telemetry/mt100/temperature',
        status: 'ONLINE',
      },
      {
        id: 'sensor-mt100-vibration',
        assetId: asset.id,
        name: 'Sensor de vibracao MT100',
        type: 'vibration',
        unit: 'mm/s',
        protocol: 'MQTT',
        mqttTopic: 'fcx/telemetry/mt100/vibration',
        status: 'ONLINE',
      },
    ],
  });

  await prisma.gateway.upsert({
    where: { id: 'gateway-mqtt-mt100' },
    update: { siteId: site.id, status: 'ONLINE' },
    create: {
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
    companyId: '1',
    clientId: defaultClient.id,
    siteId: site.id,
    temperatura: 32.4,
    vibracao: 1.82,
    corrente: 38.6,
    tensao: 380,
    potencia: 21.7,
    pressaoSuccao: 3.2,
    pressaoDescarga: 14.8,
  };
  if (!(await prisma.telemetry.findFirst({ where: { assetId: asset.id } }))) {
    await prisma.telemetry.create({ data: telemetry });
  }
  if (!(await prisma.telemetryRaw.findFirst({ where: { assetId: asset.id, source: 'fcx-demo-seed' } }))) {
    await prisma.telemetryRaw.create({
      data: {
        assetId: asset.id,
        source: 'fcx-demo-seed',
        protocol: 'MQTT',
        topic: 'fcx/telemetry/mt100',
        payload: { temperature: telemetry.temperatura, vibration: telemetry.vibracao },
      },
    });
  }
  if (!(await prisma.telemetryProcessed.findFirst({ where: { assetId: asset.id, source: 'fcx-demo-seed' } }))) {
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
  }

  console.log('Seed idempotente concluido sem remover dados existentes.');
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
