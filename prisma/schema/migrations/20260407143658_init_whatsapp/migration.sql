-- AlterTable
ALTER TABLE "retailers" ADD COLUMN     "whatsapp_notify_number" TEXT;

-- CreateTable
CREATE TABLE "whatsapp_sessions" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_users" (
    "id" TEXT NOT NULL,
    "display_name" TEXT,
    "saved_first_name" TEXT,
    "saved_last_name" TEXT,
    "saved_email" TEXT,
    "last_order_at" TIMESTAMP(3),
    "last_search_query" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "whatsapp_users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "whatsapp_addresses" (
    "id" SERIAL NOT NULL,
    "user_id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "street_line" TEXT NOT NULL,
    "barangay" TEXT,
    "city" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "postal_code" TEXT,
    "country" TEXT NOT NULL DEFAULT 'Philippines',
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "whatsapp_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "whatsapp_sessions_user_id_idx" ON "whatsapp_sessions"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "whatsapp_sessions_user_id_type_key" ON "whatsapp_sessions"("user_id", "type");

-- CreateIndex
CREATE INDEX "whatsapp_addresses_user_id_idx" ON "whatsapp_addresses"("user_id");

-- AddForeignKey
ALTER TABLE "whatsapp_sessions" ADD CONSTRAINT "whatsapp_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "whatsapp_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "whatsapp_addresses" ADD CONSTRAINT "whatsapp_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "whatsapp_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
