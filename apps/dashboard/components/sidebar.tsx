"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import { LayoutGrid, BookOpen, Sparkles, Send, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const navigationItems = [
  {
    name: "Dashboard",
    href: "dashboard",
    icon: LayoutGrid,
  },
  {
    name: "Basis Pengetahuan",
    href: "knowledge-base",
    icon: BookOpen,
  },
  {
    name: "Studio AI",
    href: "content-generate",
    icon: Sparkles,
  },
  {
    name: "Penjadwal Konten",
    href: "content-scheduler",
    icon: Send,
  },
  {
    name: "Pengaturan",
    href: "settings",
    icon: Settings,
  },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { businessId } = useParams() as { businessId: string };

  const handleClick = (href: string) => {
    const fullPath = `/business/${businessId}/${href}`;
    router.push(fullPath);
  };
  return (
    <div className="hidden md:flex w-16 bg-card border-r border-border flex-col items-center py-6 space-y-6 fixed z-49 top-0 left-0 bottom-0">
      <div className="h-24"></div>
      {navigationItems.map((item) => {
        const isActive = pathname.includes(`${item.href}`);
        const Icon = item.icon;
        return (
          <button
            key={item.name}
            onClick={() => handleClick(item.href)}
            className={cn(
              "w-10 h-10 rounded-lg flex items-center justify-center transition-colors",
              isActive
                ? "bg-blue-600 text-white"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )}
            title={item.name}
          >
            <Icon className="w-5 h-5" />
          </button>
        );
      })}
    </div>
  );
}
