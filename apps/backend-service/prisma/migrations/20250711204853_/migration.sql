/*
  Warnings:

  - Added the required column `token` to the `AppProductSubscription` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppProductSubscription" ADD COLUMN     "token" DOUBLE PRECISION NOT NULL;
