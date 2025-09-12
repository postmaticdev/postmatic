/*
  Warnings:

  - The `tokenValidFor` column on the `TokenIncome` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "AppProductSubscriptionItem" ADD COLUMN     "tokenValidFor" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "AppProductToken" ADD COLUMN     "tokenValidFor" INTEGER NOT NULL DEFAULT 30;

-- AlterTable
ALTER TABLE "TokenIncome" DROP COLUMN "tokenValidFor",
ADD COLUMN     "tokenValidFor" INTEGER NOT NULL DEFAULT 30;

-- DropEnum
DROP TYPE "TokenValidFor";
