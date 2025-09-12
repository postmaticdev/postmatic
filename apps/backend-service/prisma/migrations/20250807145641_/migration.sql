-- CreateTable
CREATE TABLE "TemplateCategory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "TemplateCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TemplateImage" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isPublished" BOOLEAN NOT NULL,
    "publisherId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateImage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_TemplateCategoryToTemplateImage" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_TemplateCategoryToTemplateImage_AB_unique" ON "_TemplateCategoryToTemplateImage"("A", "B");

-- CreateIndex
CREATE INDEX "_TemplateCategoryToTemplateImage_B_index" ON "_TemplateCategoryToTemplateImage"("B");

-- AddForeignKey
ALTER TABLE "TemplateImage" ADD CONSTRAINT "TemplateImage_publisherId_fkey" FOREIGN KEY ("publisherId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TemplateCategoryToTemplateImage" ADD CONSTRAINT "_TemplateCategoryToTemplateImage_A_fkey" FOREIGN KEY ("A") REFERENCES "TemplateCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_TemplateCategoryToTemplateImage" ADD CONSTRAINT "_TemplateCategoryToTemplateImage_B_fkey" FOREIGN KEY ("B") REFERENCES "TemplateImage"("id") ON DELETE CASCADE ON UPDATE CASCADE;
