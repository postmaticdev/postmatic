"use client";

import { useRouter, usePathname, useParams } from "next/navigation";
import {
  LayoutGrid,
  BookOpen,
  Sparkles,
  Send,
  Settings,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useAutoSchedulerAutosave } from "@/contexts/auto-scheduler-autosave-context";

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

const helpItems = [
  {
    name: "Laporkan Masalah",
    href: "https://forms.gle/fZAF7zGQZcdvyVzy9",
    icon: AlertTriangle,
    isExternal: true,
  },
];

export function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const { businessId } = useParams() as { businessId: string };
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const { guardedNavigate } = useAutoSchedulerAutosave();

  const handleClick = (href: string) => {
    const fullPath = `/business/${businessId}/${href}`;
    guardedNavigate(fullPath, router.push);
  };

  const handleExternalClick = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };
  return (
    <>
      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.05);
          }
        }

        .animate-pulse-slow {
          animation: pulse 2s ease-in-out infinite;
        }
      `}</style>
      <div className="hidden md:flex w-16 bg-card border-r border-border flex-col items-center py-6 fixed z-49 top-0 left-0 bottom-0 transition-all duration-300 ease-out">
        <div className="h-24"></div>

        {/* Main Navigation Items */}
        <div className="flex flex-col space-y-6">
          {navigationItems.map((item, index) => {
            const isActive = pathname.includes(`${item.href}`);
            const Icon = item.icon;
            const isHovered = hoveredItem === item.href;

            return (
              <div
                key={item.name}
                className="relative group"
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                }}
              >
                <button
                  onClick={() => handleClick(item.href)}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ease-out transform hover:scale-110 active:scale-95 hover:rotate-3",
                    isActive
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-600/25 animate-pulse-slow"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-md hover:shadow-gray-900/10 hover:-translate-y-1"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-transform duration-300",
                      isHovered && "scale-110"
                    )}
                  />
                </button>

                {/* Tooltip */}
                <div
                  className={cn(
                    "absolute left-full ml-3 top-1/2 transform -translate-y-1/2 z-50 transition-all duration-300 ease-out",
                    isHovered
                      ? "opacity-100 scale-100 translate-x-0"
                      : "opacity-0 scale-95 -translate-x-2 pointer-events-none"
                  )}
                >
                  <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap backdrop-blur-sm border border-gray-700/50 hover:bg-gray-800 transition-colors duration-200">
                    {item.name}
                    {/* Arrow pointing to the button */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2">
                      <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Help Items - Positioned at bottom */}
        <div className="flex flex-col space-y-6 mt-auto">
          {helpItems.map((item, index) => {
            const Icon = item.icon;
            const isHovered = hoveredItem === item.href;

            return (
              <div
                key={item.name}
                className="relative group"
                style={{
                  animationDelay: `${(navigationItems.length + index) * 50}ms`,
                  animation: "fadeInUp 0.6s ease-out forwards",
                }}
              >
                <button
                  onClick={() => handleExternalClick(item.href)}
                  onMouseEnter={() => setHoveredItem(item.href)}
                  onMouseLeave={() => setHoveredItem(null)}
                  className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center transition-all duration-300 ease-out transform hover:scale-110 active:scale-95 hover:rotate-3",
                    "text-muted-foreground hover:text-foreground hover:bg-muted hover:shadow-md hover:shadow-gray-900/10 hover:-translate-y-1"
                  )}
                >
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-transform duration-300",
                      isHovered && "scale-110"
                    )}
                  />
                </button>

                {/* Tooltip */}
                <div
                  className={cn(
                    "absolute left-full ml-3 top-1/2 transform -translate-y-1/2 z-50 transition-all duration-300 ease-out",
                    isHovered
                      ? "opacity-100 scale-100 translate-x-0"
                      : "opacity-0 scale-95 -translate-x-2 pointer-events-none"
                  )}
                >
                  <div className="bg-gray-900 text-white text-sm px-3 py-2 rounded-lg shadow-xl whitespace-nowrap backdrop-blur-sm border border-gray-700/50 hover:bg-gray-800 transition-colors duration-200">
                    {item.name}
                    {/* Arrow pointing to the button */}
                    <div className="absolute right-full top-1/2 transform -translate-y-1/2">
                      <div className="w-0 h-0 border-t-4 border-b-4 border-r-4 border-transparent border-r-gray-900"></div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </>
  );
}
