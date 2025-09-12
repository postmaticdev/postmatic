-- CreateTable
CREATE TABLE "RssArticle" (
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

    CONSTRAINT "RssArticle_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RssArticle_url_key" ON "RssArticle"("url");

-- AddForeignKey
ALTER TABLE "RssArticle" ADD CONSTRAINT "RssArticle_masterRssId_fkey" FOREIGN KEY ("masterRssId") REFERENCES "MasterRss"("id") ON DELETE CASCADE ON UPDATE CASCADE;
