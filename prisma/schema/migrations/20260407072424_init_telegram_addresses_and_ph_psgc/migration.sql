-- AlterTable
ALTER TABLE "telegram_users" ADD COLUMN     "saved_email" TEXT,
ADD COLUMN     "saved_first_name" TEXT,
ADD COLUMN     "saved_last_name" TEXT;

-- CreateTable
CREATE TABLE "ph_provinces" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "ph_provinces_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "ph_cities" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "zip_code" TEXT,
    "province_code" TEXT NOT NULL,

    CONSTRAINT "ph_cities_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "ph_barangays" (
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city_code" TEXT NOT NULL,

    CONSTRAINT "ph_barangays_pkey" PRIMARY KEY ("code")
);

-- CreateTable
CREATE TABLE "telegram_addresses" (
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

    CONSTRAINT "telegram_addresses_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "ph_cities_province_code_idx" ON "ph_cities"("province_code");

-- CreateIndex
CREATE INDEX "ph_barangays_city_code_idx" ON "ph_barangays"("city_code");

-- CreateIndex
CREATE INDEX "telegram_addresses_user_id_idx" ON "telegram_addresses"("user_id");

-- AddForeignKey
ALTER TABLE "ph_cities" ADD CONSTRAINT "ph_cities_province_code_fkey" FOREIGN KEY ("province_code") REFERENCES "ph_provinces"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ph_barangays" ADD CONSTRAINT "ph_barangays_city_code_fkey" FOREIGN KEY ("city_code") REFERENCES "ph_cities"("code") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "telegram_addresses" ADD CONSTRAINT "telegram_addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "telegram_users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
