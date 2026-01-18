-- AlterTable
ALTER TABLE "user" ALTER COLUMN "emailVerified" DROP NOT NULL,
ALTER COLUMN "emailVerified" SET DEFAULT false;
