"use client";

import { Header } from "@/components/base/header";
import { Sidebar } from "@/components/sidebar";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

const SKIP_HEADER_PATHS = ["checkout", "new-business"];
const SKIP_SIDEBAR_PATHS = ["profile", "new-business", "checkout"];

export default function BusinessClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isSkipHeader = SKIP_HEADER_PATHS.some((path) =>
    pathname.includes(path)
  );
  const isSkipSidebar = SKIP_SIDEBAR_PATHS.some((path) =>
    pathname.includes(path)
  );
  return (
    <div>
      <div className="min-h-screen bg-background flex flex-col">
        {!isSkipHeader && <Header />}
        <div
          className={cn("flex flex-1", isSkipHeader ? "" : "mt-22", isSkipSidebar ? "" : "md:ml-16")}
        >
          {!isSkipSidebar && <Sidebar />}
          <div className="flex-1">{children}</div>
        </div>
      </div>
    </div>
  );
}
