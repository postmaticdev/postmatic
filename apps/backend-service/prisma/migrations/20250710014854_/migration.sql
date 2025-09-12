/*
  Warnings:

  - You are about to drop the `MasterRssArticle` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "MasterRssArticle" DROP CONSTRAINT "MasterRssArticle_masterRssId_fkey";

-- DropTable
DROP TABLE "MasterRssArticle";
