-- AlterEnum
ALTER TYPE "PaymentStatus" ADD VALUE 'Expired';

-- AlterTable
ALTER TABLE "PaymentPurchase" ADD COLUMN     "expiredAt" TIMESTAMP(3),
ALTER COLUMN "paymentToken" DROP NOT NULL;
