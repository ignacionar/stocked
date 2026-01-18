/*
  Warnings:

  - Made the column `supplier` on table `stock` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "stock" ALTER COLUMN "supplier" SET NOT NULL;
