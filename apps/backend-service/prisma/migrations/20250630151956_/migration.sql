-- AlterTable
ALTER TABLE "MasterRss" ADD COLUMN     "publisher" TEXT NOT NULL DEFAULT 'cnbc';

-- AlterTable
ALTER TABLE "MasterRssCategory" ALTER COLUMN "name" DROP DEFAULT;
