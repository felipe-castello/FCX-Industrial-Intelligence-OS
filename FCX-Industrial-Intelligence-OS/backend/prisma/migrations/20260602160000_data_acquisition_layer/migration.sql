CREATE TABLE "telemetry_raw" (
  "id" TEXT NOT NULL,
  "asset_id" TEXT,
  "source" TEXT NOT NULL,
  "protocol" TEXT NOT NULL,
  "topic" TEXT,
  "payload" JSONB NOT NULL,
  "received_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "telemetry_raw_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "telemetry_processed" (
  "id" TEXT NOT NULL,
  "raw_id" TEXT,
  "asset_id" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "temperatura" DOUBLE PRECISION,
  "vibracao" DOUBLE PRECISION,
  "corrente" DOUBLE PRECISION,
  "tensao" DOUBLE PRECISION,
  "potencia" DOUBLE PRECISION,
  "pressao" DOUBLE PRECISION,
  "pressao_succao" DOUBLE PRECISION,
  "pressao_descarga" DOUBLE PRECISION,
  "umidade" DOUBLE PRECISION,
  "quality" TEXT NOT NULL DEFAULT 'GOOD',
  CONSTRAINT "telemetry_processed_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "alarm_events" (
  "id" TEXT NOT NULL,
  "asset_id" TEXT NOT NULL,
  "source" TEXT NOT NULL,
  "severidade" TEXT NOT NULL,
  "titulo" TEXT NOT NULL,
  "descricao" TEXT,
  "metric" TEXT,
  "value" DOUBLE PRECISION,
  "threshold" DOUBLE PRECISION,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "status" TEXT NOT NULL DEFAULT 'ACTIVE',
  CONSTRAINT "alarm_events_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "telemetry_raw_asset_id_received_at_idx" ON "telemetry_raw"("asset_id", "received_at");
CREATE INDEX "telemetry_raw_source_protocol_received_at_idx" ON "telemetry_raw"("source", "protocol", "received_at");
CREATE INDEX "telemetry_processed_asset_id_timestamp_idx" ON "telemetry_processed"("asset_id", "timestamp");
CREATE INDEX "telemetry_processed_source_timestamp_idx" ON "telemetry_processed"("source", "timestamp");
CREATE INDEX "alarm_events_asset_id_status_timestamp_idx" ON "alarm_events"("asset_id", "status", "timestamp");
CREATE INDEX "alarm_events_source_timestamp_idx" ON "alarm_events"("source", "timestamp");

ALTER TABLE "telemetry_raw" ADD CONSTRAINT "telemetry_raw_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "telemetry_processed" ADD CONSTRAINT "telemetry_processed_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "alarm_events" ADD CONSTRAINT "alarm_events_asset_id_fkey" FOREIGN KEY ("asset_id") REFERENCES "assets"("id") ON DELETE CASCADE ON UPDATE CASCADE;
