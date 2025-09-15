/* file: components/mac-window.tsx */

import React from "react";
import { cn } from "@/lib/utils";

/* ------------------------------------------------------------
   MacWindow
   - Bisa memilih konten selalu 16:9 atau fleksibel (default)
   - Prop keepAspectRatio untuk kontrol mode
   - Header tetap di atas, area konten:
     - Jika keepAspectRatio = true → aspect-[16/9]
     - Jika false → bebas mengikuti konten
------------------------------------------------------------- */
export function MacWindow({
  children,
  title,
  className = "",
  hoverZoom = false,
  keepAspectRatio = false,
}: {
  children: React.ReactNode;
  title: string;
  titleColor?: string;
  hoverZoom?: boolean;
  className?: string;
  keepAspectRatio?: boolean;
}) {
  return (
    <div
      className={cn(
        hoverZoom
          ? "bg-black rounded-xl shadow-2xl border border-border overflow-hidden transform hover:scale-105 transition-transform duration-500"
          : "bg-black rounded-xl shadow-2xl border border-border overflow-hidden",
        className
      )}
    >
      {/* ------------------------------------------------------
         Window Header
      ------------------------------------------------------- */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-200 dark:bg-slate-900 border-b border-border">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-red-500 rounded-full" />
          <div className="w-3 h-3 bg-yellow-500 rounded-full" />
          <div className="w-3 h-3 bg-green-500 rounded-full" />
        </div>
        <div className={cn("text-xs text-foreground font-mono")}>{title}</div>
        <div className="w-16" />
      </div>

      {/* ------------------------------------------------------
         Window Content
         - Mode rasio 16:9 atau bebas
      ------------------------------------------------------- */}
      {keepAspectRatio ? (
        <div className="relative">
          <div className="relative w-full aspect-[16/9]">
            <div className="absolute inset-0">{children}</div>
          </div>
        </div>
      ) : (
        <div className="relative p-4 bg-white dark:bg-black">{children}</div>
      )}
    </div>
  );
}
