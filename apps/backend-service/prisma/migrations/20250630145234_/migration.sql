-- AlterTable
ALTER TABLE "MasterRssCategory" ADD COLUMN     "name" TEXT NOT NULL DEFAULT 'Sport';

-- AlterTable
ALTER TABLE "RootBusiness" ALTER COLUMN "description" DROP NOT NULL;
