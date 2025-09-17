/*
  Warnings:

  - You are about to drop the column `secondaryLogo` on the `BusinessKnowledge` table. All the data in the column will be lost.
  - You are about to drop the column `allergen` on the `ProductKnowledge` table. All the data in the column will be lost.
  - You are about to drop the column `benefit` on the `ProductKnowledge` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "BusinessKnowledge" DROP COLUMN "secondaryLogo";

-- AlterTable
ALTER TABLE "ProductKnowledge" DROP COLUMN "allergen",
DROP COLUMN "benefit";
