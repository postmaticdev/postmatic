-- AlterTable
ALTER TABLE "PostedImageContent" ADD COLUMN     "rootBusinessId" TEXT;

-- AddForeignKey
ALTER TABLE "PostedImageContent" ADD CONSTRAINT "PostedImageContent_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;
