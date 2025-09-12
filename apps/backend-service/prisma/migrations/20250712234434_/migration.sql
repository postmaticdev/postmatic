/*
  Warnings:

  - Added the required column `adminType` to the `AppPaymentMethod` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "AppPaymentAdminType" AS ENUM ('Fixed', 'Percentage');

-- AlterTable
ALTER TABLE "AppPaymentMethod" ADD COLUMN     "adminType" "AppPaymentAdminType" NOT NULL;
