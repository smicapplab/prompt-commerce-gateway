-- CreateTable
CREATE TABLE "conversations" (
    "id" SERIAL NOT NULL,
    "store_slug" TEXT NOT NULL,
    "buyer_ref" TEXT NOT NULL,
    "buyer_name" TEXT,
    "channel" TEXT NOT NULL DEFAULT 'telegram',
    "mode" TEXT NOT NULL DEFAULT 'ai',
    "assigned_to" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "conversations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "messages" (
    "id" SERIAL NOT NULL,
    "conversation_id" INTEGER NOT NULL,
    "sender_type" TEXT NOT NULL,
    "sender_name" TEXT,
    "body" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "conversations_store_slug_idx" ON "conversations"("store_slug");

-- CreateIndex
CREATE INDEX "conversations_buyer_ref_idx" ON "conversations"("buyer_ref");

-- CreateIndex
CREATE UNIQUE INDEX "conversations_buyer_ref_store_slug_channel_key" ON "conversations"("buyer_ref", "store_slug", "channel");

-- CreateIndex
CREATE INDEX "messages_conversation_id_idx" ON "messages"("conversation_id");

-- AddForeignKey
ALTER TABLE "conversations" ADD CONSTRAINT "conversations_store_slug_fkey" FOREIGN KEY ("store_slug") REFERENCES "retailers"("slug") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "messages" ADD CONSTRAINT "messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
