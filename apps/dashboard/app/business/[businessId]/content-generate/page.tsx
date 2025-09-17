"use client";

import { ReferencePanel } from "@/app/business/[businessId]/content-generate/(components)/reference-panel";
import { GenerationPanel } from "@/app/business/[businessId]/content-generate/(components)/generation-panel";
import { PreviewPanel } from "@/app/business/[businessId]/content-generate/(components)/preview-panel";
import { useContentGenerate } from "@/contexts/content-generate-context";
import { cn } from "@/lib/utils";

export default function ContentGenerate() {
  const { mode } = useContentGenerate();
  return (
    <main className="flex-1 flex flex-col relative md:ml-0">
      {/* 3-Column Layout */}
      <div className="flex-1 flex flex-col lg:flex-row lg:max-h-screen">
        {/* Column 1: Reference Panel */}

        <div
          className={cn(
            "w-full lg:w-1/3 border-r bg-card overflow-y-auto",
            mode === "regenerate" ? "hidden" : "w-full lg:w-1/3"
          )}
        >
          <ReferencePanel />
        </div>

        {/* Column 2: Generation Panel */}

        <div
          className={cn(
            "w-full border-r bg-card",
            mode === "regenerate" ? "w-full lg:w-1/2" : "w-full lg:w-1/3"
          )}
        >
          <GenerationPanel />
        </div>

        {/* Column 3: Preview Panel */}
        <div
          className={cn(
            "w-full bg-card",
            mode === "regenerate" ? "w-full lg:w-1/2" : "w-full lg:w-1/3"
          )}
        >
          <PreviewPanel />
        </div>
      </div>
    </main>
  );
}
