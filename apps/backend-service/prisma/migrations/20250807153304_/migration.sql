-- CreateTable
CREATE TABLE "TemplateImageSaved" (
    "id" TEXT NOT NULL,
    "templateImageContentId" TEXT NOT NULL,
    "rootBusinessId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TemplateImageSaved_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "TemplateImageSaved" ADD CONSTRAINT "TemplateImageSaved_templateImageContentId_fkey" FOREIGN KEY ("templateImageContentId") REFERENCES "TemplateImageContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TemplateImageSaved" ADD CONSTRAINT "TemplateImageSaved_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;
