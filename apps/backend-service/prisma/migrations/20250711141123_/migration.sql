-- CreateEnum
CREATE TYPE "TokenType" AS ENUM ('Image', 'Video', 'LiveStream');

-- AlterTable
ALTER TABLE "TokenUsage" ADD COLUMN     "type" "TokenType" NOT NULL DEFAULT 'Image';
