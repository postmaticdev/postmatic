/*
  Warnings:

  - You are about to drop the column `photo` on the `Profile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[rootBusinessId]` on the table `BusinessKnowledge` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "Profile" DROP COLUMN "photo";

-- CreateIndex
CREATE UNIQUE INDEX "BusinessKnowledge_rootBusinessId_key" ON "BusinessKnowledge"("rootBusinessId");
