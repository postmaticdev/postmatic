/*
  Warnings:

  - Changed the type of `productType` on the `PaymentPurchase` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "PaymentProductType" AS ENUM ('token', 'subscription');

-- AlterTable
ALTER TABLE "PaymentPurchase" DROP COLUMN "productType",
ADD COLUMN     "productType" "PaymentProductType" NOT NULL;
