/*
  Warnings:

  - You are about to drop the `TemplateCategory` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `TemplateImage` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `_TemplateCategoryToTemplateImage` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "TemplateImage" DROP CONSTRAINT "TemplateImage_publisherId_fkey";

-- DropForeignKey
ALTER TABLE "_TemplateCategoryToTemplateImage" DROP CONSTRAINT "_TemplateCategoryToTemplateImage_A_fkey";

-- DropForeignKey
ALTER TABLE "_TemplateCategoryToTemplateImage" DROP CONSTRAINT "_TemplateCategoryToTemplateImage_B_fkey";

-- DropTable
DROP TABLE "TemplateCategory";

-- DropTable
DROP TABLE "TemplateImage";

-- DropTable
DROP TABLE "_TemplateCategoryToTemplateImage";

-- CreateTable
CREATE TABLE "TemplateImageCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TemplateImageCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateImageContent" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL,
    "publisherId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateImageContent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TemplateImageCategoryToTemplateImageContent" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TemplateImageCategoryToTemplateImageContent_AB_unique" ON "_TemplateImageCategoryToTemplateImageContent"("A", "B");

-- CreateIndex
CREATE INDEX "_TemplateImageCategoryToTemplateImageContent_B_index" ON "_TemplateImageCategoryToTemplateImageContent"("B");

-- AddForeignKey
ALTER TABLE "TemplateImageContent" ADD CONSTRAINT "TemplateImageContent_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TemplateImageCategoryToTemplateImageContent" ADD CONSTRAINT "_TemplateImageCategoryToTemplateImageContent_A_fkey" FOREIGN KEY ("A") REFERENCES "TemplateImageCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TemplateImageCategoryToTemplateImageContent" ADD CONSTRAINT "_TemplateImageCategoryToTemplateImageContent_B_fkey" FOREIGN KEY ("B") REFERENCES "TemplateImageContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
