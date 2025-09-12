/*
  Warnings:

  - You are about to drop the column `token` on the `AppProductSubscription` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AppProductSubscription" DROP COLUMN "token";

-- AlterTable
ALTER TABLE "AppProductSubscriptionItem" ALTER COLUMN "tokenImage" DROP DEFAULT,
ALTER COLUMN "tokenLive" DROP DEFAULT,
ALTER COLUMN "tokenVideo" DROP DEFAULT;
