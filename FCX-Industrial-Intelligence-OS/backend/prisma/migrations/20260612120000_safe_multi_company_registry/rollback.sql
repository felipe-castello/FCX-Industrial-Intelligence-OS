DELETE FROM "assets" WHERE "id" = 'fcx-default-asset';
DELETE FROM "sites" WHERE "id" = 'fcx-default-site';
DELETE FROM "clients" WHERE "id" = 'fcx-default-client';

ALTER TABLE "devices" DROP CONSTRAINT IF EXISTS "devices_asset_id_fkey";
ALTER TABLE "sites" DROP CONSTRAINT IF EXISTS "sites_client_id_fkey";
DROP TABLE IF EXISTS "devices";
DROP TABLE IF EXISTS "clients";

DROP INDEX IF EXISTS "telemetry_device_id_timestamp_idx";
DROP INDEX IF EXISTS "telemetry_site_id_timestamp_idx";
DROP INDEX IF EXISTS "telemetry_client_id_timestamp_idx";
DROP INDEX IF EXISTS "sites_client_id_status_idx";

ALTER TABLE "telemetry" DROP COLUMN IF EXISTS "device_id";
ALTER TABLE "telemetry" DROP COLUMN IF EXISTS "site_id";
ALTER TABLE "telemetry" DROP COLUMN IF EXISTS "client_id";
ALTER TABLE "assets" DROP COLUMN IF EXISTS "updated_at";
ALTER TABLE "assets" DROP COLUMN IF EXISTS "location";
ALTER TABLE "assets" DROP COLUMN IF EXISTS "brand";
ALTER TABLE "sites" DROP COLUMN IF EXISTS "updated_at";
ALTER TABLE "sites" DROP COLUMN IF EXISTS "client_id";

ALTER TABLE "sites" DROP CONSTRAINT IF EXISTS "sites_company_id_fkey";
DO $$
DECLARE fallback_company TEXT;
BEGIN
  SELECT "id" INTO fallback_company FROM "companies" ORDER BY "created_at" LIMIT 1;
  IF fallback_company IS NULL AND EXISTS (SELECT 1 FROM "sites" WHERE "company_id" IS NULL) THEN
    RAISE EXCEPTION 'Rollback requires at least one company to backfill sites.company_id';
  END IF;
  UPDATE "sites" SET "company_id" = fallback_company WHERE "company_id" IS NULL;
END $$;
ALTER TABLE "sites" ALTER COLUMN "company_id" SET NOT NULL;
ALTER TABLE "sites" ADD CONSTRAINT "sites_company_id_fkey" FOREIGN KEY ("company_id") REFERENCES "companies"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- PostgreSQL enum values are intentionally retained because removing an enum value is not transaction-safe.
