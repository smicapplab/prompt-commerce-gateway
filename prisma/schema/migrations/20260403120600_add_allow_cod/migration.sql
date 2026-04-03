/*
  Warnings:

  - A unique constraint covering the columns `[store_slug,order_id]` on the table `payments` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "payments_store_slug_idx";

-- AlterTable
ALTER TABLE "retailers" ADD COLUMN     "allow_cod" BOOLEAN NOT NULL DEFAULT true;

-- CreateIndex
CREATE INDEX "payments_store_slug_order_id_idx" ON "payments"("store_slug", "order_id");

-- CreateIndex
CREATE UNIQUE INDEX "payments_store_slug_order_id_key" ON "payments"("store_slug", "order_id");
