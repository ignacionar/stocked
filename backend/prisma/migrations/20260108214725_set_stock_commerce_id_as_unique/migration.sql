/*
  Warnings:

  - A unique constraint covering the columns `[name,commerceId]` on the table `stock` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "stock_name_key";

-- CreateIndex
CREATE UNIQUE INDEX "stock_name_commerceId_key" ON "stock"("name", "commerceId");
