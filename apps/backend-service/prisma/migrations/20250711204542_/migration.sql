-- CreateTable
CREATE TABLE "TokenIncome" (
    "id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TokenIncome_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppProductSubscription" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "benefits" TEXT[],
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppProductSubscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AppProductSubscriptionItem" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "price" DOUBLE PRECISION NOT NULL,
    "appProductSubscriptionId" TEXT NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AppProductSubscriptionItem_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "AppProductSubscriptionItem" ADD CONSTRAINT "AppProductSubscriptionItem_appProductSubscriptionId_fkey" FOREIGN KEY ("appProductSubscriptionId") REFERENCES "AppProductSubscription"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
