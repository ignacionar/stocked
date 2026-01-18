/*
  Warnings:

  - You are about to drop the `InvoiceJob` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "InvoiceJob";

-- CreateTable
CREATE TABLE "invoice_job" (
    "id" TEXT NOT NULL,
    "commerceId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "JobStatus" NOT NULL,
    "response" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "invoice_job_pkey" PRIMARY KEY ("id")
);
