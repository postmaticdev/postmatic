-- CreateEnum
CREATE TYPE "TokenValidFor" AS ENUM ('Monthly', 'Annually');

-- AlterTable
ALTER TABLE "TokenIncome" ADD COLUMN     "tokenValidFor" "TokenValidFor" NOT NULL DEFAULT 'Monthly';
