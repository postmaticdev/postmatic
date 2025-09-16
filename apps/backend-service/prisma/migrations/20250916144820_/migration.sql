/*
  Warnings:

  - The values [mock_masks] on the enum `ImageGenJobType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ImageGenJobType_new" AS ENUM ('knowledge', 'rss', 'regenerate', 'mask', 'mock_knowledge', 'mock_regenerate', 'mock_rss', 'mock_mask');
ALTER TABLE "HistoryGeneratedImageContent" ALTER COLUMN "type" TYPE "ImageGenJobType_new" USING ("type"::text::"ImageGenJobType_new");
ALTER TYPE "ImageGenJobType" RENAME TO "ImageGenJobType_old";
ALTER TYPE "ImageGenJobType_new" RENAME TO "ImageGenJobType";
DROP TYPE "ImageGenJobType_old";
COMMIT;
