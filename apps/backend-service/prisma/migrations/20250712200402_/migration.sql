/*
  Warnings:

  - You are about to drop the column `paymentToken` on the `PaymentPurchase` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PaymentPurchase" DROP COLUMN "paymentToken";

-- CreateTable
CREATE TABLE "PaymentAction" (
    "id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "method" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "paymentPurchaseId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentAction_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentAction" ADD CONSTRAINT "PaymentAction_paymentPurchaseId_fkey" FOREIGN KEY ("paymentPurchaseId") REFERENCES "PaymentPurchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
