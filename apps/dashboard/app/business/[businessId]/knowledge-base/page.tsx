"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BusinessKnowledgeSection } from "@/app/business/[businessId]/knowledge-base/(components)/business-knowledge-section";
import { RoleKnowledgeSection } from "@/app/business/[businessId]/knowledge-base/(components)/role-knowledge-section";
import { ProductSection } from "@/app/business/[businessId]/knowledge-base/(components)/product-section";
import { RSSTrendSection } from "@/app/business/[businessId]/knowledge-base/(components)/rss-trend-section";
import { WelcomeSection } from "@/components/base/welcome-section";

export default function KnowledgeBase() {
  const searchParams = useSearchParams();
  const openRssModal = searchParams.get("openRssModal") === "true";

  // Ensure smooth scroll to hashed section on initial load
  useEffect(() => {
    const hash = typeof window !== "undefined" ? window.location.hash : "";
    if (hash) {
      const elementId = hash.replace("#", "");
      const target = document.getElementById(elementId);
      if (target) {
        // Defer to next tick to ensure layout is ready
        setTimeout(() => {
          target.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
      }
    }
  }, []);

  return (
    <main className="flex-1 p-4 sm:p-6 space-y-4 sm:space-y-8 md:ml-0">
      {/* Header Section */}
      <WelcomeSection
        title="Pengetahuan Dasar"
        message="Kelola Media Sosial Anda Secara Otomatis dengan Postmatic."
      />

      {/* Business Knowledge Section */}
      <BusinessKnowledgeSection />

      {/* Role Knowledge Section */}
      <RoleKnowledgeSection />

      {/* Product and RSS Sections - Responsive Layout */}
      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-1">
          <ProductSection />
        </div>
        <div className="flex-1" id="rss-trend-section">
          <RSSTrendSection openRssModal={openRssModal} />
        </div>
      </div>
    </main>
  );
}
