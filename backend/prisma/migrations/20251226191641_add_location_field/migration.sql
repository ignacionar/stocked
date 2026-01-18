/*
  Warnings:

  - Added the required column `location` to the `user_commerce` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "user_commerce" ADD COLUMN     "location" TEXT NOT NULL;
