ALTER TYPE "DeviceStatus" ADD VALUE IF NOT EXISTS 'INACTIVE';

CREATE TABLE "clients" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "cnpj" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "phone" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "status" "RegistryStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "devices" (
  "id" TEXT NOT NULL,
  "asset_id" TEXT,
  "name" TEXT NOT NULL,
  "serial_number" TEXT NOT NULL,
  "device_type" TEXT NOT NULL,
  "protocol" TEXT NOT NULL,
  "status" "DeviceStatus" NOT NULL DEFAULT 'ONLINE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "devices_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "sites" ALTER COLUMN "company_id" DROP NOT NULL;
ALTER TABLE "sites" DROP CONSTRAINT IF EXISTS "sites_company_id_fkey";
ALTER TABLE "sites" ADD CONSTRAINT "sites_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sites" ADD COLUMN "client_id" TEXT;
ALTER TABLE "sites" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "assets" ADD COLUMN "brand" TEXT;
ALTER TABLE "assets" ADD COLUMN "location" TEXT;
ALTER TABLE "assets" ADD COLUMN "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;
ALTER TABLE "telemetry" ADD COLUMN "client_id" TEXT;
ALTER TABLE "telemetry" ADD COLUMN "site_id" TEXT;
ALTER TABLE "telemetry" ADD COLUMN "device_id" TEXT;

CREATE UNIQUE INDEX "clients_cnpj_key" ON "clients"("cnpj");
CREATE UNIQUE INDEX "devices_serial_number_key" ON "devices"("serial_number");
CREATE INDEX "sites_client_id_status_idx" ON "sites"("client_id", "status");
CREATE INDEX "devices_asset_id_status_idx" ON "devices"("asset_id", "status");
CREATE INDEX "telemetry_client_id_timestamp_idx" ON "telemetry"("client_id", "timestamp");
CREATE INDEX "telemetry_site_id_timestamp_idx" ON "telemetry"("site_id", "timestamp");
CREATE INDEX "telemetry_device_id_timestamp_idx" ON "telemetry"("device_id", "timestamp");

ALTER TABLE "sites" ADD CONSTRAINT "sites_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "devices" ADD CONSTRAINT "devices_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;

INSERT INTO "clients" ("id", "name", "cnpj", "email", "phone", "address", "city", "state")
VALUES ('fcx-default-client', 'FCX DEFAULT', '00.000.000/0000-00', 'default@fcx.local', '-', '-', '-', '-')
ON CONFLICT ("cnpj") DO NOTHING;

INSERT INTO "sites" ("id", "company_id", "client_id", "name", "address", "city", "state")
VALUES ('fcx-default-site', NULL, (SELECT "id" FROM "clients" WHERE "cnpj" = '00.000.000/0000-00' LIMIT 1), 'LABORATORIO', '-', '-', '-')
ON CONFLICT ("id") DO NOTHING;

INSERT INTO "assets" ("id", "site_id", "nome", "tipo", "unidade", "status")
VALUES ('fcx-default-asset', 'fcx-default-site', 'GENERICO', 'OTHER', 'LABORATORIO', 'OFFLINE')
ON CONFLICT ("id") DO NOTHING;
