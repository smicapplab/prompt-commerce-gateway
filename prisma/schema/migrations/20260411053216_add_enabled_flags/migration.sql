-- AlterTable
ALTER TABLE "retailers" ADD COLUMN     "ai_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "telegram_enabled" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "whatsapp_enabled" BOOLEAN NOT NULL DEFAULT false;
