/*
  Warnings:

  - Added the required column `generatedImageContentId` to the `PostedImageContent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostedImageContent" ADD COLUMN     "generatedImageContentId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "PostedImageContent" ADD CONSTRAINT "PostedImageContent_generatedImageContentId_fkey" FOREIGN KEY ("generatedImageContentId") REFERENCES "GeneratedImageContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
