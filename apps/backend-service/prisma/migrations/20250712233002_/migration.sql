/*
  Warnings:

  - Added the required column `rootBusinessId` to the `TokenIncome` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TokenIncome" ADD COLUMN     "rootBusinessId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "TokenIncome" ADD CONSTRAINT "TokenIncome_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
