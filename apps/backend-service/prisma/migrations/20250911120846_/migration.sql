-- CreateEnum
CREATE TYPE "ImageGenJobType" AS ENUM ('genBasedOnKnowledge', 'genBasedOnRss', 'regenerate', 'mask', 'mock', 'mock_regenerate', 'mock_rss');

-- CreateEnum
CREATE TYPE "ImageGenJobStatus" AS ENUM ('queued', 'processing', 'done', 'error', 'retrying', 'waiting_before_retry');

-- CreateEnum
CREATE TYPE "ImageGenJobStage" AS ENUM ('queued', 'processing', 'verifying_business_information', 'preparing_knowledge', 'preparing_assets', 'generating_images', 'uploading', 'generating_caption', 'preparing_rss_image', 'writing_temp', 'error', 'done', 'retrying', 'waiting_before_retry');

-- CreateTable
CREATE TABLE "HistoryGeneratedImageContent" (
    "id" TEXT NOT NULL,
    "type" "ImageGenJobType" NOT NULL,
    "status" "ImageGenJobStatus" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "progress" INTEGER NOT NULL,
    "input" JSONB NOT NULL,
    "result" JSONB,
    "error" JSONB,
    "product" JSONB NOT NULL DEFAULT '{}',
    "stage" "ImageGenJobStage" NOT NULL,
    "attempt" INTEGER NOT NULL,
    "tokenUsed" INTEGER NOT NULL,
    "rootBusinessId" TEXT NOT NULL,

    CONSTRAINT "HistoryGeneratedImageContent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "HistoryGeneratedImageContent" ADD CONSTRAINT "HistoryGeneratedImageContent_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;
