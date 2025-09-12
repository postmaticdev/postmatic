/*
  Warnings:

  - You are about to drop the column `url` on the `PaymentAction` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PaymentAction" DROP COLUMN "url",
ALTER COLUMN "value" DROP DEFAULT;
