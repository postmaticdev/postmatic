/*
  Warnings:

  - The values [linkedin] on the enum `SocialPlatform` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "SocialPlatform_new" AS ENUM ('linked_in', 'facebook_page', 'instagram_business', 'whatsapp_business', 'tiktok', 'youtube', 'twitter', 'pinterest');
ALTER TABLE "AppSocialPlatform" ALTER COLUMN "platform" TYPE "SocialPlatform_new" USING ("platform"::text::"SocialPlatform_new");
ALTER TYPE "SocialPlatform" RENAME TO "SocialPlatform_old";
ALTER TYPE "SocialPlatform_new" RENAME TO "SocialPlatform";
DROP TYPE "SocialPlatform_old";
COMMIT;
