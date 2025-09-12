/*
  Warnings:

  - You are about to drop the column `alergenInfo` on the `ProductKnowledge` table. All the data in the column will be lost.
  - You are about to drop the column `mainBenefits` on the `ProductKnowledge` table. All the data in the column will be lost.
  - You are about to drop the column `goalContent` on the `RoleKnowledge` table. All the data in the column will be lost.
  - You are about to drop the column `primaryColor` on the `RoleKnowledge` table. All the data in the column will be lost.
  - You are about to drop the column `secondaryColor` on the `RoleKnowledge` table. All the data in the column will be lost.
  - You are about to drop the `RSSKnowledge` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[rootBusinessId]` on the table `RoleKnowledge` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `primaryLogo` to the `BusinessKnowledge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `goals` to the `RoleKnowledge` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "RSSKnowledge" DROP CONSTRAINT "RSSKnowledge_rootBusinessId_fkey";

-- AlterTable
ALTER TABLE "BusinessKnowledge" ADD COLUMN     "primaryLogo" TEXT NOT NULL,
ADD COLUMN     "secondaryLogo" TEXT;

-- AlterTable
ALTER TABLE "ProductKnowledge" DROP COLUMN "alergenInfo",
DROP COLUMN "mainBenefits",
ADD COLUMN     "allergen" TEXT,
ADD COLUMN     "benefit" TEXT;

-- AlterTable
ALTER TABLE "RoleKnowledge" DROP COLUMN "goalContent",
DROP COLUMN "primaryColor",
DROP COLUMN "secondaryColor",
ADD COLUMN     "colors" TEXT[],
ADD COLUMN     "goals" TEXT NOT NULL;

-- DropTable
DROP TABLE "RSSKnowledge";

-- CreateTable
CREATE TABLE "RssKnowledge" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL,
    "masterRssId" TEXT NOT NULL,
    "rootBusinessId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RssKnowledge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterRss" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "masterRssCategoryId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasterRss_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MasterRssCategory" (
    "id" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MasterRssCategory_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "RoleKnowledge_rootBusinessId_key" ON "RoleKnowledge"("rootBusinessId");

-- AddForeignKey
ALTER TABLE "RssKnowledge" ADD CONSTRAINT "RssKnowledge_masterRssId_fkey" FOREIGN KEY ("masterRssId") REFERENCES "MasterRss"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RssKnowledge" ADD CONSTRAINT "RssKnowledge_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterRss" ADD CONSTRAINT "MasterRss_masterRssCategoryId_fkey" FOREIGN KEY ("masterRssCategoryId") REFERENCES "MasterRssCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
