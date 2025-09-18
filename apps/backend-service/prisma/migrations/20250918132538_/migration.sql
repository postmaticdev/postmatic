/*
  Warnings:

  - You are about to drop the column `time` on the `SchedulerAutoPostingTime` table. All the data in the column will be lost.
  - Added the required column `hhmm` to the `SchedulerAutoPostingTime` table without a default value. This is not possible if the table is not empty.
  - Added the required column `schedulerAutoPostingId` to the `SchedulerAutoPostingTime` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "SchedulerAutoPostingTime" DROP COLUMN "time",
ADD COLUMN     "hhmm" TEXT NOT NULL,
ADD COLUMN     "schedulerAutoPostingId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "SchedulerAutoPostingTime" ADD CONSTRAINT "SchedulerAutoPostingTime_schedulerAutoPostingId_fkey" FOREIGN KEY ("schedulerAutoPostingId") REFERENCES "SchedulerAutoPosting"("id") ON DELETE CASCADE ON UPDATE CASCADE;
