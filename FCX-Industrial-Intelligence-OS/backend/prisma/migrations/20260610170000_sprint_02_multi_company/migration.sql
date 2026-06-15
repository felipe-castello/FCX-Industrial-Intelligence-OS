ALTER TABLE "assets" ADD COLUMN "company_id" TEXT;
ALTER TABLE "telemetry" ADD COLUMN "company_id" TEXT;
ALTER TABLE "alarms" ADD COLUMN "company_id" TEXT;
ALTER TABLE "work_orders" ADD COLUMN "company_id" TEXT;
ALTER TABLE "users" ADD COLUMN "company_id" TEXT;

UPDATE "assets" AS a SET "company_id" = s."company_id" FROM "sites" AS s WHERE a."site_id" = s."id";
UPDATE "telemetry" AS t SET "company_id" = a."company_id" FROM "assets" AS a WHERE t."asset_id" = a."id";
UPDATE "alarms" AS al SET "company_id" = a."company_id" FROM "assets" AS a WHERE al."asset_id" = a."id";
UPDATE "work_orders" AS w SET "company_id" = a."company_id" FROM "assets" AS a WHERE w."asset_id" = a."id";

CREATE INDEX "assets_company_id_status_idx" ON "assets"("company_id", "status");
CREATE INDEX "telemetry_company_id_timestamp_idx" ON "telemetry"("company_id", "timestamp");
CREATE INDEX "alarms_company_id_status_timestamp_idx" ON "alarms"("company_id", "status", "timestamp");
CREATE INDEX "work_orders_company_id_status_data_abertura_idx" ON "work_orders"("company_id", "status", "data_abertura");
CREATE INDEX "users_company_id_status_idx" ON "users"("company_id", "status");

ALTER TABLE "assets" ADD CONSTRAINT "assets_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "telemetry" ADD CONSTRAINT "telemetry_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "alarms" ADD CONSTRAINT "alarms_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "work_orders" ADD CONSTRAINT "work_orders_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE SET NULL ON UPDATE CASCADE;
