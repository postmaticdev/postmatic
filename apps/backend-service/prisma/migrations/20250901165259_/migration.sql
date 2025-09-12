/*
  Warnings:

  - The `platforms` column on the `SchedulerManualPosting` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "SchedulerManualPosting" DROP COLUMN "platforms",
ADD COLUMN     "platforms" "SocialPlatform"[];
