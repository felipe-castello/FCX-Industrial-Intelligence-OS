CREATE TYPE "RegistryStatus" AS ENUM ('ACTIVE', 'INACTIVE');
CREATE TYPE "DeviceStatus" AS ENUM ('ONLINE', 'OFFLINE', 'MAINTENANCE', 'ALERT');

CREATE TABLE "companies" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "document" TEXT NOT NULL,
  "contact_name" TEXT NOT NULL,
  "contact_email" TEXT NOT NULL,
  "contact_phone" TEXT NOT NULL,
  "status" "RegistryStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "companies_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sites" (
  "id" TEXT NOT NULL,
  "company_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "city" TEXT NOT NULL,
  "state" TEXT NOT NULL,
  "status" "RegistryStatus" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "sensors" (
  "id" TEXT NOT NULL,
  "asset_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "unit" TEXT NOT NULL,
  "protocol" TEXT NOT NULL,
  "mqtt_topic" TEXT,
  "status" "DeviceStatus" NOT NULL DEFAULT 'ONLINE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "sensors_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "gateways" (
  "id" TEXT NOT NULL,
  "site_id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "model" TEXT NOT NULL,
  "ip_address" TEXT NOT NULL,
  "protocol" TEXT NOT NULL,
  "status" "DeviceStatus" NOT NULL DEFAULT 'ONLINE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "gateways_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "assets" ADD COLUMN "site_id" TEXT;
ALTER TABLE "assets" ADD COLUMN "serial_number" TEXT;

CREATE UNIQUE INDEX "companies_document_key" ON "companies"("document");
CREATE INDEX "sites_company_id_status_idx" ON "sites"("company_id", "status");
CREATE INDEX "assets_site_id_status_idx" ON "assets"("site_id", "status");
CREATE INDEX "sensors_asset_id_status_idx" ON "sensors"("asset_id", "status");
CREATE INDEX "gateways_site_id_status_idx" ON "gateways"("site_id", "status");

ALTER TABLE "sites" ADD CONSTRAINT "sites_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "assets" ADD CONSTRAINT "assets_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "sensors" ADD CONSTRAINT "sensors_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "gateways" ADD CONSTRAINT "gateways_site_id_fkey" FOREIGN KEY ("site_id") REFERENCES "sites"("id") ON DELETE CASCADE ON UPDATE CASCADE;
