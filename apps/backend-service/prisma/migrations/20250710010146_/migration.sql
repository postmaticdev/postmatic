-- CreateTable
CREATE TABLE "SchedulerPreference" (
    "id" SERIAL NOT NULL,
    "isAutoPosting" BOOLEAN NOT NULL DEFAULT false,
    "rootBusinessId" TEXT NOT NULL,

    CONSTRAINT "SchedulerPreference_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SchedulerAutoPosting" (
    "id" SERIAL NOT NULL,
    "day" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "times" TEXT[],
    "rootBusinessId" TEXT NOT NULL,
    "schedulerPreferenceId" INTEGER NOT NULL,

    CONSTRAINT "SchedulerAutoPosting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SchedulerPreference_rootBusinessId_key" ON "SchedulerPreference"("rootBusinessId");

-- AddForeignKey
ALTER TABLE "SchedulerPreference" ADD CONSTRAINT "SchedulerPreference_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchedulerAutoPosting" ADD CONSTRAINT "SchedulerAutoPosting_rootBusinessId_fkey" FOREIGN KEY ("rootBusinessId") REFERENCES "RootBusiness"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SchedulerAutoPosting" ADD CONSTRAINT "SchedulerAutoPosting_schedulerPreferenceId_fkey" FOREIGN KEY ("schedulerPreferenceId") REFERENCES "SchedulerPreference"("id") ON DELETE CASCADE ON UPDATE CASCADE;
