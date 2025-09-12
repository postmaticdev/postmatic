/*
  Warnings:

  - You are about to drop the column `tokenValidFor` on the `AppProductSubscriptionItem` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AppProductSubscriptionItem" DROP COLUMN "tokenValidFor",
ALTER COLUMN "subscriptionValidFor" DROP DEFAULT;
