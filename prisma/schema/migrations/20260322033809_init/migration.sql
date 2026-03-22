-- CreateTable
CREATE TABLE "admin_users" (
    "id" SERIAL NOT NULL,
    "username" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "admin_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cached_categories" (
    "id" SERIAL NOT NULL,
    "store_slug" TEXT NOT NULL,
    "seller_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "parent_id" INTEGER,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cached_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cached_products" (
    "id" SERIAL NOT NULL,
    "store_slug" TEXT NOT NULL,
    "seller_id" INTEGER NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "sku" TEXT,
    "price" DOUBLE PRECISION,
    "stock_quantity" INTEGER NOT NULL DEFAULT 0,
    "category_id" INTEGER,
    "tags" TEXT[],
    "images" TEXT[],
    "active" BOOLEAN NOT NULL DEFAULT true,
    "synced_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cached_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "retailers" (
    "id" SERIAL NOT NULL,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "contact_email" TEXT NOT NULL,
    "mcp_server_url" TEXT NOT NULL,
    "business_permit_url" TEXT,
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "ai_provider" TEXT,
    "ai_api_key" TEXT,
    "ai_model" TEXT,

    CONSTRAINT "retailers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "platform_keys" (
    "id" SERIAL NOT NULL,
    "retailer_id" INTEGER NOT NULL,
    "key" TEXT NOT NULL,
    "issued_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked_at" TIMESTAMP(3),

    CONSTRAINT "platform_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" SERIAL NOT NULL,
    "retailer_id" INTEGER NOT NULL,
    "event" TEXT NOT NULL,
    "meta" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "settings" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "settings_pkey" PRIMARY KEY ("key")
);

-- CreateIndex
CREATE UNIQUE INDEX "admin_users_username_key" ON "admin_users"("username");

-- CreateIndex
CREATE INDEX "cached_categories_store_slug_idx" ON "cached_categories"("store_slug");

-- CreateIndex
CREATE UNIQUE INDEX "cached_categories_store_slug_seller_id_key" ON "cached_categories"("store_slug", "seller_id");

-- CreateIndex
CREATE INDEX "cached_products_store_slug_idx" ON "cached_products"("store_slug");

-- CreateIndex
CREATE INDEX "cached_products_store_slug_category_id_idx" ON "cached_products"("store_slug", "category_id");

-- CreateIndex
CREATE UNIQUE INDEX "cached_products_store_slug_seller_id_key" ON "cached_products"("store_slug", "seller_id");

-- CreateIndex
CREATE UNIQUE INDEX "retailers_slug_key" ON "retailers"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "retailers_name_key" ON "retailers"("name");

-- CreateIndex
CREATE UNIQUE INDEX "platform_keys_retailer_id_key" ON "platform_keys"("retailer_id");

-- CreateIndex
CREATE UNIQUE INDEX "platform_keys_key_key" ON "platform_keys"("key");

-- AddForeignKey
ALTER TABLE "platform_keys" ADD CONSTRAINT "platform_keys_retailer_id_fkey" FOREIGN KEY ("retailer_id") REFERENCES "retailers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_retailer_id_fkey" FOREIGN KEY ("retailer_id") REFERENCES "retailers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
