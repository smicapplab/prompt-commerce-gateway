-- CreateIndex
CREATE INDEX "cached_products_title_idx" ON "cached_products"("title");

-- CreateIndex
CREATE INDEX "cached_products_active_price_idx" ON "cached_products"("active", "price");
