/*
  Warnings:

  - Made the column `rootBusinessId` on table `PostedImageContent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "PostedImageContent" ALTER COLUMN "rootBusinessId" SET NOT NULL;
