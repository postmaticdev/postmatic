-- AlterTable
ALTER TABLE "AppProductSubscriptionItem" ALTER COLUMN "tokenValidFor" DROP DEFAULT;

-- AlterTable
ALTER TABLE "AppProductToken" ALTER COLUMN "tokenValidFor" DROP DEFAULT;

-- AlterTable
ALTER TABLE "TokenIncome" ALTER COLUMN "tokenValidFor" DROP DEFAULT;
