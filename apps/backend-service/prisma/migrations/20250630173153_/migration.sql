/*
  Warnings:

  - You are about to drop the `RssArticle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "RssArticle" DROP CONSTRAINT "RssArticle_masterRssId_fkey";

-- DropTable
DROP TABLE "RssArticle";

-- CreateTable
CREATE TABLE "LibraryRss" (
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

    CONSTRAINT "LibraryRss_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "LibraryRss_url_key" ON "LibraryRss"("url");

-- AddForeignKey
ALTER TABLE "LibraryRss" ADD CONSTRAINT "LibraryRss_masterRssId_fkey" FOREIGN KEY ("masterRssId") REFERENCES "MasterRss"("id") ON DELETE CASCADE ON UPDATE CASCADE;
