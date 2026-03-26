-- CreateTable
CREATE TABLE "carts" (
    "id"         SERIAL NOT NULL,
    "user_id"    TEXT NOT NULL,
    "store_slug" TEXT NOT NULL,
    "product_id" INTEGER NOT NULL,
    "title"      TEXT NOT NULL,
    "price"      DOUBLE PRECISION NOT NULL,
    "quantity"   INTEGER NOT NULL DEFAULT 1,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "carts_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "carts_user_id_store_slug_product_id_key" ON "carts"("user_id", "store_slug", "product_id");

-- CreateIndex
CREATE INDEX "carts_user_id_store_slug_idx" ON "carts"("user_id", "store_slug");
