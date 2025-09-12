-- DropForeignKey
ALTER TABLE "AppProductSubscriptionItem" DROP CONSTRAINT "AppProductSubscriptionItem_appProductSubscriptionId_fkey";

-- AddForeignKey
ALTER TABLE "AppProductSubscriptionItem" ADD CONSTRAINT "AppProductSubscriptionItem_appProductSubscriptionId_fkey" FOREIGN KEY ("appProductSubscriptionId") REFERENCES "AppProductSubscription"("id") ON DELETE CASCADE ON UPDATE CASCADE;
