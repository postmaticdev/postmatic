/*
  Warnings:

  - Added the required column `paymentToken` to the `PaymentPurchase` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `token` on the `PaymentPurchase` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "PaymentPurchase" ADD COLUMN     "paymentToken" TEXT NOT NULL,
DROP COLUMN "token",
ADD COLUMN     "token" DOUBLE PRECISION NOT NULL;
