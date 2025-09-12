/*
  Warnings:

  - Added the required column `caption` to the `PostedImageContent` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PostedImageContent" ADD COLUMN     "caption" TEXT NOT NULL,
ADD COLUMN     "images" TEXT[];
