/*
  Warnings:

  - The `platform` column on the `PostedImageContent` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "PostedImageContent" DROP COLUMN "platform",
ADD COLUMN     "platform" "SocialPlatform" NOT NULL DEFAULT 'linked_in';
