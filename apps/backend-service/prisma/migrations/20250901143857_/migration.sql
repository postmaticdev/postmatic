/*
  Warnings:

  - A unique constraint covering the columns `[platform]` on the table `AppSocialPlatform` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "SocialPlatform" ADD VALUE 'tiktok';
ALTER TYPE "SocialPlatform" ADD VALUE 'youtube';
ALTER TYPE "SocialPlatform" ADD VALUE 'twitter';
ALTER TYPE "SocialPlatform" ADD VALUE 'pinterest';

-- CreateIndex
CREATE UNIQUE INDEX "AppSocialPlatform_platform_key" ON "AppSocialPlatform"("platform");
