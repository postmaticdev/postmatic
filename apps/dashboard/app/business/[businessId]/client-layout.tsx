"use client";

import { Header } from "@/components/base/header";
import { Sidebar } from "@/components/sidebar";

export default function BusinessClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />

        {/* 2) Baru baris: Sidebar (kiri) + Main (kanan) */}
        <div className="flex flex-1 md:ml-16">
          <Sidebar />
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
