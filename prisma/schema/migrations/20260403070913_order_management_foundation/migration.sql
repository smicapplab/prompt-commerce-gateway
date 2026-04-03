-- AlterTable
ALTER TABLE "payments" ADD COLUMN     "cancellation_reason" TEXT,
ADD COLUMN     "courier_name" TEXT,
ADD COLUMN     "delivery_type" TEXT NOT NULL DEFAULT 'delivery',
ADD COLUMN     "order_created_at" TIMESTAMP(3),
ADD COLUMN     "order_status" TEXT NOT NULL DEFAULT 'pending',
ADD COLUMN     "payment_instructions" TEXT,
ADD COLUMN     "terminal_status_at" TIMESTAMP(3),
ADD COLUMN     "tracking_number" TEXT,
ADD COLUMN     "tracking_url" TEXT;

-- AlterTable
ALTER TABLE "retailers" ADD COLUMN     "allows_pickup" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "order_notes" (
    "id" SERIAL NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "note" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "order_notes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "order_files" (
    "id" SERIAL NOT NULL,
    "payment_id" INTEGER NOT NULL,
    "filename" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size_bytes" INTEGER NOT NULL,
    "uploaded_by" TEXT NOT NULL,
    "uploaded_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" TEXT,

    CONSTRAINT "order_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "order_notes_payment_id_idx" ON "order_notes"("payment_id");

-- CreateIndex
CREATE INDEX "order_files_payment_id_idx" ON "order_files"("payment_id");

-- AddForeignKey
ALTER TABLE "order_notes" ADD CONSTRAINT "order_notes_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "order_files" ADD CONSTRAINT "order_files_payment_id_fkey" FOREIGN KEY ("payment_id") REFERENCES "payments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
