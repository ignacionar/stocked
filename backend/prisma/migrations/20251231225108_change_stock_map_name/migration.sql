/*
  Warnings:

  - You are about to drop the `product` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "product" DROP CONSTRAINT "product_commerceId_fkey";

-- DropTable
DROP TABLE "product";

-- CreateTable
CREATE TABLE "stock" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "measure" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "commerceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stock_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "stock" ADD CONSTRAINT "stock_commerceId_fkey" FOREIGN KEY ("commerceId") REFERENCES "commerce"("id") ON DELETE CASCADE ON UPDATE CASCADE;
