/*
  Warnings:

  - You are about to drop the column `schedulerPreferenceId` on the `SchedulerAutoPosting` table. All the data in the column will be lost.
  - You are about to drop the `SchedulerPreference` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "SchedulerAutoPosting" DROP CONSTRAINT "SchedulerAutoPosting_schedulerPreferenceId_fkey";

-- DropForeignKey
ALTER TABLE "SchedulerPreference" DROP CONSTRAINT "SchedulerPreference_rootBusinessId_fkey";

-- AlterTable
ALTER TABLE "SchedulerAutoPosting" DROP COLUMN "schedulerPreferenceId",
ADD COLUMN     "schedulerAutoPreferenceId" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "SchedulerPreference";

-- CreateTable
CREATE TABLE "SchedulerAutoPreference" (
    "id" SERIAL NOT NULL,
    "isAutoPosting" BOOLEAN NOT NULL DEFAULT false,
    "rootBusinessId" TEXT NOT NULL,

    CONSTRAINT "SchedulerAutoPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchedulerManualPosting" (
    "id" SERIAL NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "platforms" TEXT[],
    "rootBusinessId" TEXT NOT NULL,
    "generatedImageContentId" TEXT NOT NULL,

    CONSTRAINT "SchedulerManualPosting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchedulerAutoPreference_rootBusinessId_key" ON "SchedulerAutoPreference"("rootBusinessId");

-- CreateIndex
CREATE UNIQUE INDEX "SchedulerManualPosting_generatedImageContentId_key" ON "SchedulerManualPosting"("generatedImageContentId");

-- AddForeignKey
ALTER TABLE "SchedulerAutoPreference" ADD CONSTRAINT "SchedulerAutoPreference_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchedulerAutoPosting" ADD CONSTRAINT "SchedulerAutoPosting_schedulerAutoPreferenceId_fkey" FOREIGN KEY ("schedulerAutoPreferenceId") REFERENCES "SchedulerAutoPreference"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchedulerManualPosting" ADD CONSTRAINT "SchedulerManualPosting_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchedulerManualPosting" ADD CONSTRAINT "SchedulerManualPosting_generatedImageContentId_fkey" FOREIGN KEY ("generatedImageContentId") REFERENCES "GeneratedImageContent"("id") ON DELETE CASCADE ON UPDATE CASCADE;
