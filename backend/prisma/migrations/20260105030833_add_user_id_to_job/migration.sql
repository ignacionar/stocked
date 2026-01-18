/*
  Warnings:

  - Added the required column `userId` to the `invoice_job` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "invoice_job" ADD COLUMN     "userId" TEXT NOT NULL;
