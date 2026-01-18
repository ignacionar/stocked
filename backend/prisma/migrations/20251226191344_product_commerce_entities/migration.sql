-- CreateTable
CREATE TABLE "product" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "price" DOUBLE PRECISION NOT NULL,
    "quantity" INTEGER NOT NULL,
    "measure" TEXT NOT NULL,
    "supplier" TEXT NOT NULL,
    "commerceId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPremise" (
    "userId" TEXT NOT NULL,
    "commerceId" TEXT NOT NULL,

    CONSTRAINT "UserPremise_pkey" PRIMARY KEY ("userId","commerceId")
);

-- CreateTable
CREATE TABLE "commerce" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commerce_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "UserPremise_userId_idx" ON "UserPremise"("userId");

-- CreateIndex
CREATE INDEX "UserPremise_commerceId_idx" ON "UserPremise"("commerceId");

-- AddForeignKey
ALTER TABLE "product" ADD CONSTRAINT "product_commerceId_fkey" FOREIGN KEY ("commerceId") REFERENCES "commerce"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPremise" ADD CONSTRAINT "UserPremise_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPremise" ADD CONSTRAINT "UserPremise_commerceId_fkey" FOREIGN KEY ("commerceId") REFERENCES "commerce"("id") ON DELETE CASCADE ON UPDATE CASCADE;
