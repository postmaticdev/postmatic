-- AlterTable
ALTER TABLE "RootBusiness" ADD COLUMN     "socialFacebookPageId" TEXT;

-- CreateTable
CREATE TABLE "SocialFacebookPage" (
    "id" TEXT NOT NULL,
    "facebookPageId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "picture" TEXT,
    "tokenExpiredAt" TIMESTAMP(3),
    "rootBusinessId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialFacebookPage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialFacebookPage_facebookPageId_key" ON "SocialFacebookPage"("facebookPageId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialFacebookPage_rootBusinessId_key" ON "SocialFacebookPage"("rootBusinessId");

-- AddForeignKey
ALTER TABLE "SocialFacebookPage" ADD CONSTRAINT "SocialFacebookPage_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;
