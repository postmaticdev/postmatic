-- CreateTable
CREATE TABLE "SocialInstagramBusiness" (
    "id" TEXT NOT NULL,
    "instagramBusinessId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "picture" TEXT,
    "tokenExpiredAt" TIMESTAMP(3),
    "rootBusinessId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialInstagramBusiness_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialInstagramBusiness_instagramBusinessId_key" ON "SocialInstagramBusiness"("instagramBusinessId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialInstagramBusiness_rootBusinessId_key" ON "SocialInstagramBusiness"("rootBusinessId");

-- AddForeignKey
ALTER TABLE "SocialInstagramBusiness" ADD CONSTRAINT "SocialInstagramBusiness_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;
