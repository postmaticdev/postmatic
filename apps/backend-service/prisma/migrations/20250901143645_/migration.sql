-- CreateEnum
CREATE TYPE "SocialPlatform" AS ENUM ('linkedin', 'facebook_page', 'instagram_business', 'whatsapp_business');

-- CreateTable
CREATE TABLE "AppSocialPlatform" (
    "id" TEXT NOT NULL,
    "platform" "SocialPlatform" NOT NULL,
    "logo" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "hint" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppSocialPlatform_pkey" PRIMARY KEY ("id")
);
