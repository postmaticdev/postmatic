-- CreateTable
CREATE TABLE "SocialLinkedIn" (
    "id" TEXT NOT NULL,
    "linkedInId" TEXT NOT NULL,
    "authorUrn" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "picture" TEXT,
    "scopes" TEXT NOT NULL,
    "tokenExpiredAt" TIMESTAMP(3),
    "rootBusinessId" TEXT,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SocialLinkedIn_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SocialLinkedIn_linkedInId_key" ON "SocialLinkedIn"("linkedInId");

-- CreateIndex
CREATE UNIQUE INDEX "SocialLinkedIn_authorUrn_key" ON "SocialLinkedIn"("authorUrn");

-- CreateIndex
CREATE UNIQUE INDEX "SocialLinkedIn_rootBusinessId_key" ON "SocialLinkedIn"("rootBusinessId");

-- AddForeignKey
ALTER TABLE "SocialLinkedIn" ADD CONSTRAINT "SocialLinkedIn_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;
