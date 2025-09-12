/*
  Warnings:

  - You are about to drop the column `name` on the `SchedulerTimeZone` table. All the data in the column will be lost.
  - You are about to drop the column `utcOffset` on the `SchedulerTimeZone` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "SchedulerTimeZone" DROP COLUMN "name",
DROP COLUMN "utcOffset",
ADD COLUMN     "timezone" TEXT NOT NULL DEFAULT 'Asia/Jakarta';
