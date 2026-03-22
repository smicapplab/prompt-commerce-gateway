-- AlterTable
ALTER TABLE "retailers" ADD COLUMN     "payment_api_key" TEXT,
ADD COLUMN     "payment_provider" TEXT,
ADD COLUMN     "payment_public_key" TEXT,
ADD COLUMN     "payment_webhook_secret" TEXT;

-- CreateTable
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "reference_id" TEXT NOT NULL,
    "store_slug" TEXT NOT NULL,
    "order_id" INTEGER NOT NULL,
    "buyer_ref" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'PHP',
    "provider" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "payment_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "payments_reference_id_key" ON "payments"("reference_id");

-- CreateIndex
CREATE INDEX "payments_store_slug_idx" ON "payments"("store_slug");

-- CreateIndex
CREATE INDEX "payments_buyer_ref_idx" ON "payments"("buyer_ref");
