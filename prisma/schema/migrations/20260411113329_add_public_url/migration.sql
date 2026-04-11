-- AlterTable
ALTER TABLE "retailers" ADD COLUMN     "public_url" TEXT;

-- CreateTable
CREATE TABLE "rate_limits" (
    "key" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "reset_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "rate_limits_pkey" PRIMARY KEY ("key")
);
