"use client";

import { useState } from "react";
import { ContentLibrary } from "@/app/business/[businessId]/content-scheduler/(components)/content-library";
import { SchedulePost } from "@/app/business/[businessId]/content-scheduler/(components)/schedule-post";
import { AutoPosting } from "@/app/business/[businessId]/content-scheduler/(components)/auto-posting";
import { TabNavigation } from "@/app/business/[businessId]/content-scheduler/(components)/tab-navigation";
import { WelcomeSection } from "@/components/base/welcome-section";

export default function ContentScheduler() {
  const [activeTab, setActiveTab] = useState("manual");

  const renderTabContent = () => {
    switch (activeTab) {
      case "manual":
        return (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 h-full">
            <div className="xl:col-span-2">
              <ContentLibrary showAddtoQueue={false} type="draft" />
            </div>
            <div className="order-first xl:order-last">
              <SchedulePost />
            </div>
          </div>
        );
      case "auto":
        return (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-4 sm:gap-6 h-full">
            <div className="xl:col-span-2">
              <ContentLibrary
                showPostingNow={false}
                showScheduling={false}
                type="draft"
              />
            </div>
            <div className="order-first xl:order-last">
              <AutoPosting />
            </div>
          </div>
        );
      case "history":
        return (
          <div className="h-full">
            <div className="grid grid-cols-1 gap-4 sm:gap-6 h-full">
              <div className="h-full">
                <ContentLibrary
                  showAddtoQueue={false}
                  showPostingNow={false}
                  showScheduling={false}
                  type="posted"
                />
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-6 md:ml-0">
      {/* Header Section */}
      <WelcomeSection
        title="Penjadwalan Konten"
        message="Kelola Konten Media Sosial Anda Secara Otomatis dengan Postmatic."
        showTimezoneSelector
      />

      {/* Tab Navigation */}
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Tab Content */}
      <div className=" h-full">{renderTabContent()}</div>
    </main>
  );
}
