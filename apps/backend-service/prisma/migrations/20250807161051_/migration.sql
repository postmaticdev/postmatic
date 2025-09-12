/*
  Warnings:

  - You are about to drop the column `tokenValidFor` on the `AppProductToken` table. All the data in the column will be lost.
  - You are about to drop the column `tokenValidFor` on the `TokenIncome` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AppProductSubscriptionItem" ADD COLUMN     "subscriptionValidFor" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "AppProductToken" DROP COLUMN "tokenValidFor";

-- AlterTable
ALTER TABLE "TokenIncome" DROP COLUMN "tokenValidFor";
