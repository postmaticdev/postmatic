"use client";

import { ReferencePanel } from "@/app/business/[businessId]/content-generate/(components)/reference-panel";
import { GenerationPanel } from "@/app/business/[businessId]/content-generate/(components)/generation-panel";
import { PreviewPanel } from "@/app/business/[businessId]/content-generate/(components)/preview-panel";
import { useContentGenerate } from "@/contexts/content-generate-context";
import { cn } from "@/lib/utils";

export default function ContentGenerate() {
  const { mode, isLoading } = useContentGenerate();
  return (
    <main className="flex-1 flex flex-col relative md:ml-0">
      {/* 3-Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row lg:max-h-screen">
        {/* Column 1: Reference Panel */}

        <div
          className={cn(
            "w-full lg:w-1/3 border-r bg-card overflow-y-auto relative",
            mode === "regenerate" ? "hidden" : "w-full lg:w-1/3"
          )}
        >
          <ReferencePanel />
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 pointer-events-auto" />
          )}
        </div>

        {/* Column 2: Generation Panel */}

        <div
          className={cn(
            "w-full border-r bg-card relative",
            mode === "regenerate" ? "w-full lg:w-3/5" : "w-full lg:w-1/3"
          )}
        >
          <GenerationPanel />
          {isLoading && (
            <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] z-10 pointer-events-auto" />
          )}
        </div>

        {/* Column 3: Preview Panel */}
        <div
          className={cn(
            "w-full bg-card",
            mode === "regenerate" ? "w-full lg:w-2/5" : "w-full lg:w-1/3"
          )}
        >
          <PreviewPanel />
        </div>
      </div>
    </main>
  );
}
