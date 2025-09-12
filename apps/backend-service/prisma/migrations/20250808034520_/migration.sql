-- AlterTable
ALTER TABLE "TemplateImageSaved" ADD COLUMN     "category" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "imageUrl" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Untitled';
