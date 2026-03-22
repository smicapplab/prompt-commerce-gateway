/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `retailers` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "retailers_name_key" ON "retailers"("name");
