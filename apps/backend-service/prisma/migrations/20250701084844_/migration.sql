/*
  Warnings:

  - Added the required column `rootBusinessId` to the `GeneratedImageContent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "GeneratedImageContent" ADD COLUMN     "rootBusinessId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "GeneratedImageContent" ADD CONSTRAINT "GeneratedImageContent_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;
