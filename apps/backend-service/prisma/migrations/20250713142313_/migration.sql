/*
  Warnings:

  - You are about to drop the column `tokenImage` on the `PaymentPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `tokenLive` on the `PaymentPurchase` table. All the data in the column will be lost.
  - You are about to drop the column `tokenVideo` on the `PaymentPurchase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PaymentPurchase" DROP COLUMN "tokenImage",
DROP COLUMN "tokenLive",
DROP COLUMN "tokenVideo";
