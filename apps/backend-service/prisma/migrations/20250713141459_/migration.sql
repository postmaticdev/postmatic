/*
  Warnings:

  - You are about to drop the column `token` on the `PaymentPurchase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PaymentPurchase" DROP COLUMN "token",
ADD COLUMN     "tokenImage" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "tokenLive" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "tokenVideo" DOUBLE PRECISION NOT NULL DEFAULT 0;
