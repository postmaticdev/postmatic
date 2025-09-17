"use client";

import { GenerateFormBase } from "./generate-form-base";
import { GenerateFormSelectRss } from "./generate-form-select-rss";
import {
  TabMode,
  useContentGenerate,
} from "@/contexts/content-generate-context";

import { SelectedArticleRss } from "./selected-article-rss";
import { SelectedReferenceImage } from "./selected-reference-image";
import { cn } from "@/lib/utils";

export function GenerationPanel() {
  const { setMode, tab, setTab, mode } = useContentGenerate();

  const onClickTab = (mode: TabMode) => {
    setMode(mode);
    setTab(mode);
  };

  return (
    <div id="generation-panel" className="h-full flex flex-col">
      {/* Tab Bar */}
      <div className="p-4 sm:p-6">
        <div className="flex justify-center">
          <div className="flex bg-background rounded-lg  w-full">
            <button
              onClick={() => onClickTab("knowledge")}
              className={cn(
                "px-4 py-3 text-sm font-medium rounded-md transition-colors w-1/2 ",
                tab === "knowledge"
                  ? "bg-blue-500 text-white"
                  : "text-muted-foreground hover:text-foreground",
                mode === "regenerate" ? "w-full" : "w-1/2"
              )}
            >
              Basic Generate
            </button>

            <button
              onClick={() => onClickTab("rss")}
              className={cn(
                "px-4 py-3 text-sm font-medium rounded-md transition-colors w-1/2",
                tab === "rss"
                  ? "bg-blue-500 text-white"
                  : "text-muted-foreground hover:text-foreground",
                mode === "regenerate" ? "hidden" : "w-1/2"
              )}
            >
              Generate by Trend
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 sm:px-6 pb-6 overflow-y-auto space-y-4">
        {tab === "rss" && (
          <div>
            <GenerateFormSelectRss />
            <SelectedReferenceImage />
            <SelectedArticleRss />
            <div className="space-y-4 mt-4">
              <GenerateFormBase />
            </div>
          </div>
        )}

        {tab === "knowledge" && (
          <>
            <SelectedReferenceImage />
            <GenerateFormBase />
          </>
        )}

        {/* Form Controls */}
      </div>
    </div>
  );
}
