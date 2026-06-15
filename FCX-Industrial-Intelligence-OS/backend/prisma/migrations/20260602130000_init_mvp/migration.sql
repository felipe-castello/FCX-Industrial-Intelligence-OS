CREATE TYPE "AssetType" AS ENUM ('COMPRESSOR', 'RACK', 'COLD_ROOM', 'EVAPORATOR', 'CONDENSER', 'PANEL', 'SENSOR', 'PUMP', 'FAN', 'OTHER');
CREATE TYPE "AssetCriticality" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');
CREATE TYPE "AssetStatus" AS ENUM ('ONLINE', 'OFFLINE', 'MAINTENANCE', 'ALARM');
CREATE TYPE "AlarmSeverity" AS ENUM ('INFO', 'WARNING', 'CRITICAL');
CREATE TYPE "AlarmStatus" AS ENUM ('ACTIVE', 'ACKNOWLEDGED', 'RESOLVED');
CREATE TYPE "WorkOrderPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
CREATE TYPE "WorkOrderStatus" AS ENUM ('OPEN', 'IN_PROGRESS', 'WAITING_PARTS', 'CLOSED');
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'MANAGER', 'ENGINEER', 'TECHNICIAN', 'VIEWER');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

CREATE TABLE "assets" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "tipo" "AssetType" NOT NULL,
  "fabricante" TEXT,
  "modelo" TEXT,
  "unidade" TEXT NOT NULL,
  "criticidade" "AssetCriticality" NOT NULL DEFAULT 'MEDIUM',
  "status" "AssetStatus" NOT NULL DEFAULT 'ONLINE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "assets_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "telemetry" (
  "id" TEXT NOT NULL,
  "asset_id" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "temperatura" DOUBLE PRECISION NOT NULL,
  "vibracao" DOUBLE PRECISION NOT NULL,
  "corrente" DOUBLE PRECISION NOT NULL,
  "tensao" DOUBLE PRECISION NOT NULL,
  "potencia" DOUBLE PRECISION NOT NULL,
  "pressao_succao" DOUBLE PRECISION NOT NULL,
  "pressao_descarga" DOUBLE PRECISION NOT NULL,
  CONSTRAINT "telemetry_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "alarms" (
  "id" TEXT NOT NULL,
  "asset_id" TEXT NOT NULL,
  "severidade" "AlarmSeverity" NOT NULL,
  "titulo" TEXT NOT NULL,
  "descricao" TEXT,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" "AlarmStatus" NOT NULL DEFAULT 'ACTIVE',
  CONSTRAINT "alarms_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "work_orders" (
  "id" TEXT NOT NULL,
  "numero_os" TEXT NOT NULL,
  "asset_id" TEXT NOT NULL,
  "tecnico" TEXT NOT NULL,
  "prioridade" "WorkOrderPriority" NOT NULL DEFAULT 'MEDIUM',
  "status" "WorkOrderStatus" NOT NULL DEFAULT 'OPEN',
  "descricao" TEXT NOT NULL,
  "data_abertura" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "data_fechamento" TIMESTAMP(3),
  CONSTRAINT "work_orders_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "users" (
  "id" TEXT NOT NULL,
  "nome" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'VIEWER',
  "status" "UserStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "work_orders_numero_os_key" ON "work_orders"("numero_os");
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");
CREATE INDEX "telemetry_asset_id_timestamp_idx" ON "telemetry"("asset_id", "timestamp");
CREATE INDEX "alarms_asset_id_status_timestamp_idx" ON "alarms"("asset_id", "status", "timestamp");
CREATE INDEX "work_orders_asset_id_status_data_abertura_idx" ON "work_orders"("asset_id", "status", "data_abertura");

ALTER TABLE "telemetry" ADD CONSTRAINT "telemetry_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alarms" ADD CONSTRAINT "alarms_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;

CREATE EXTENSION IF NOT EXISTS timescaledb;
