/*
  Warnings:

  - You are about to drop the column `times` on the `SchedulerAutoPosting` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SchedulerAutoPosting" DROP COLUMN "times";

-- CreateTable
CREATE TABLE "SchedulerAutoPostingTime" (
    "id" SERIAL NOT NULL,
    "time" TEXT NOT NULL,
    "platforms" "SocialPlatform"[],

    CONSTRAINT "SchedulerAutoPostingTime_pkey" PRIMARY KEY ("id")
);
