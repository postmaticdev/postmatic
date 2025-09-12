/*
  Warnings:

  - A unique constraint covering the columns `[code]` on the table `AppPaymentMethod` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `AppPaymentMethod` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "AppPaymentMethod" ADD COLUMN     "code" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "AppPaymentMethod_code_key" ON "AppPaymentMethod"("code");
