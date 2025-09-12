-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('Pending', 'Success', 'Failed', 'Canceled', 'Refunded');

-- CreateTable
CREATE TABLE "PaymentPurchase" (
    "id" TEXT NOT NULL,
    "productName" TEXT NOT NULL,
    "productType" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "method" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "status" "PaymentStatus" NOT NULL,
    "appProductSubscriptionItemId" TEXT,
    "appProductTokenId" TEXT,
    "profileId" TEXT NOT NULL,
    "rootBusinessId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PaymentPurchase_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentPurchase" ADD CONSTRAINT "PaymentPurchase_appProductSubscriptionItemId_fkey" FOREIGN KEY ("appProductSubscriptionItemId") REFERENCES "AppProductSubscriptionItem"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentPurchase" ADD CONSTRAINT "PaymentPurchase_appProductTokenId_fkey" FOREIGN KEY ("appProductTokenId") REFERENCES "AppProductToken"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentPurchase" ADD CONSTRAINT "PaymentPurchase_profileId_fkey" FOREIGN KEY ("profileId") REFERENCES "Profile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentPurchase" ADD CONSTRAINT "PaymentPurchase_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;
