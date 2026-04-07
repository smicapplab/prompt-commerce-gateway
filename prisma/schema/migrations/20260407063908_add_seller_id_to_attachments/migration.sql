/*
  Warnings:

  - A unique constraint covering the columns `[payment_id,seller_id]` on the table `order_files` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[payment_id,seller_id]` on the table `order_notes` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `seller_id` to the `order_files` table without a default value. This is not possible if the table is not empty.
  - Added the required column `seller_id` to the `order_notes` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "order_files" ADD COLUMN     "seller_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "order_notes" ADD COLUMN     "seller_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "order_files_payment_id_seller_id_key" ON "order_files"("payment_id", "seller_id");

-- CreateIndex
CREATE UNIQUE INDEX "order_notes_payment_id_seller_id_key" ON "order_notes"("payment_id", "seller_id");
