-- CreateTable
CREATE TABLE "GeneratedImageContent" (
    "id" TEXT NOT NULL,
    "images" TEXT[],
    "ratio" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "designStyle" TEXT NOT NULL,
    "caption" TEXT,
    "productKnowledgeId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "GeneratedImageContent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "GeneratedImageContent" ADD CONSTRAINT "GeneratedImageContent_productKnowledgeId_fkey" FOREIGN KEY ("productKnowledgeId") REFERENCES "ProductKnowledge"("id") ON DELETE CASCADE ON UPDATE CASCADE;
