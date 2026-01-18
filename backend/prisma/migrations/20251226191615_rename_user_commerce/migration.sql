/*
  Warnings:

  - You are about to drop the `UserPremise` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `location` to the `commerce` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserPremise" DROP CONSTRAINT "UserPremise_commerceId_fkey";

-- DropForeignKey
ALTER TABLE "UserPremise" DROP CONSTRAINT "UserPremise_userId_fkey";

-- AlterTable
ALTER TABLE "commerce" ADD COLUMN     "location" TEXT NOT NULL;

-- DropTable
DROP TABLE "UserPremise";

-- CreateTable
CREATE TABLE "user_commerce" (
    "userId" TEXT NOT NULL,
    "commerceId" TEXT NOT NULL,

    CONSTRAINT "user_commerce_pkey" PRIMARY KEY ("userId","commerceId")
);

-- CreateIndex
CREATE INDEX "user_commerce_userId_idx" ON "user_commerce"("userId");

-- CreateIndex
CREATE INDEX "user_commerce_commerceId_idx" ON "user_commerce"("commerceId");

-- AddForeignKey
ALTER TABLE "user_commerce" ADD CONSTRAINT "user_commerce_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_commerce" ADD CONSTRAINT "user_commerce_commerceId_fkey" FOREIGN KEY ("commerceId") REFERENCES "commerce"("id") ON DELETE CASCADE ON UPDATE CASCADE;
