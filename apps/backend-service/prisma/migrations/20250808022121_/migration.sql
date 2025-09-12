/*
  Warnings:

  - You are about to drop the column `productName` on the `PaymentPurchase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PaymentPurchase" DROP COLUMN "productName",
ALTER COLUMN "name" DROP DEFAULT;
