-- DropForeignKey
ALTER TABLE "BusinessKnowledge" DROP CONSTRAINT "BusinessKnowledge_rootBusinessId_fkey";

-- DropForeignKey
ALTER TABLE "MasterRss" DROP CONSTRAINT "MasterRss_masterRssCategoryId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_profileId_fkey";

-- DropForeignKey
ALTER TABLE "Member" DROP CONSTRAINT "Member_rootBusinessId_fkey";

-- DropForeignKey
ALTER TABLE "ProductKnowledge" DROP CONSTRAINT "ProductKnowledge_rootBusinessId_fkey";

-- DropForeignKey
ALTER TABLE "RoleKnowledge" DROP CONSTRAINT "RoleKnowledge_rootBusinessId_fkey";

-- DropForeignKey
ALTER TABLE "RssKnowledge" DROP CONSTRAINT "RssKnowledge_masterRssId_fkey";

-- DropForeignKey
ALTER TABLE "RssKnowledge" DROP CONSTRAINT "RssKnowledge_rootBusinessId_fkey";

-- DropForeignKey
ALTER TABLE "User" DROP CONSTRAINT "User_profileId_fkey";

-- AddForeignKey
ALTER TABLE "BusinessKnowledge" ADD CONSTRAINT "BusinessKnowledge_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductKnowledge" ADD CONSTRAINT "ProductKnowledge_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoleKnowledge" ADD CONSTRAINT "RoleKnowledge_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RssKnowledge" ADD CONSTRAINT "RssKnowledge_masterRssId_fkey" FOREIGN KEY ("masterRssId") REFERENCES "MasterRss"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RssKnowledge" ADD CONSTRAINT "RssKnowledge_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MasterRss" ADD CONSTRAINT "MasterRss_masterRssCategoryId_fkey" FOREIGN KEY ("masterRssCategoryId") REFERENCES "MasterRssCategory"("id") ON DELETE CASCADE ON UPDATE CASCADE;
