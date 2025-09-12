/*
  Warnings:

  - You are about to drop the column `method` on the `PaymentAction` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ActionType" AS ENUM ('image', 'redirect', 'text');

-- AlterTable
ALTER TABLE "PaymentAction" DROP COLUMN "method",
ADD COLUMN     "type" "ActionType" NOT NULL DEFAULT 'redirect';
