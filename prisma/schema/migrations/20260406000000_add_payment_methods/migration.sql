-- Add payment_methods column to retailers table
-- Stores a JSON array of enabled payment method IDs, e.g. ["cod","mock","assisted"]
-- Defaults to empty array (falls back to paymentProvider + allowCod for backward compat)
ALTER TABLE "retailers" ADD COLUMN "payment_methods" TEXT NOT NULL DEFAULT '[]';
