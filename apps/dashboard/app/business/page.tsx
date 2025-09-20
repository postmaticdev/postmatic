"use client";

import { Header } from "@/components/base/header";
import { WelcomeSection } from "@/components/base/welcome-section";
import { ActionBar } from "@/components/base/action-bar";
import { BusinessGrid } from "@/components/base/business-grid";
import { useAuthProfileGetProfile } from "@/services/auth.api";
import { Suspense } from "react";

export default function BusinessPage() {
  const { data: profile } = useAuthProfileGetProfile();
  const userName = profile?.data?.data?.name;
  const greeting = userName ? `Selamat datang, ${userName}` : "Loading...";
  return (
    <div className="min-h-screen bg-background">
      <Suspense fallback={<div>Loading...</div>}>
        <main className="py-4 sm:py-6 px-4 sm:px-6">
          <WelcomeSection
            message="Pilih bisnis anda terlebih dahulu."
            title={greeting}
          />
          <div className="bg-card rounded-lg shadow-sm border border-border">
            <ActionBar />
            <div className="px-4 sm:px-6 pb-4 sm:pb-6">
              <BusinessGrid />
            </div>
          </div>
        </main>
      </Suspense>
    </div>
  );
}
