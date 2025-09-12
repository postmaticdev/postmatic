/*
  Warnings:

  - You are about to drop the `LibraryRss` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "LibraryRss" DROP CONSTRAINT "LibraryRss_masterRssId_fkey";

-- DropTable
DROP TABLE "LibraryRss";

-- CreateTable
CREATE TABLE "MasterRssArticle" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "summary" TEXT,
    "imageUrl" TEXT,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "masterRssId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasterRssArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MasterRssArticle_url_key" ON "MasterRssArticle"("url");

-- AddForeignKey
ALTER TABLE "MasterRssArticle" ADD CONSTRAINT "MasterRssArticle_masterRssId_fkey" FOREIGN KEY ("masterRssId") REFERENCES "MasterRss"("id") ON DELETE CASCADE ON UPDATE CASCADE;
