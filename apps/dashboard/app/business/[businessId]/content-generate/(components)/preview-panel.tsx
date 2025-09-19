"use client";

import { useRef, useState } from "react";
import { CardNoGap } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import Link from "next/link";
import { Textarea } from "@/components/ui/textarea";
import { HistoryModal } from "@/app/business/[businessId]/content-generate/(components)/history-modal";
import { FullscreenImageModal } from "@/app/business/[businessId]/content-generate/(components)/fullscreen-image-modal";
import { Clock, RotateCcw } from "lucide-react";
import { useContentGenerate } from "@/contexts/content-generate-context";
import { DEFAULT_PLACEHOLDER_IMAGE } from "@/constants";
import { useBusinessGetById } from "@/services/business.api";
import { useParams } from "next/navigation";
import { LogoLoader } from "@/components/base/logo-loader";
import { Progress } from "@/components/ui/progress";

export function PreviewPanel() {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isFullscreenImageOpen, setIsFullscreenImageOpen] = useState(false);
  const previewPanelRef = useRef<HTMLDivElement>(null);
  const {
    form,
    selectedHistory,
    onSelectHistory,
    isLoading,
    onSubmitGenerate,
    onSaveDraft,
    setMode,
    isDraftSaved,
  } = useContentGenerate();
  const { businessId } = useParams() as { businessId: string };
  const { data: businessData } = useBusinessGetById(businessId);
  const businessName = businessData?.data?.data?.name;

  const onOpenFullscreenImage = () => {
    if (selectedHistory?.result?.images.length === 0) {
      return;
    }
    setMode("mask");
    setIsFullscreenImageOpen(true);
    setIsHistoryModalOpen(false);
    form.setMask(null);
    form.setBasic({ ...form.basic, prompt: "" });
  };

  const onCloseFullscreenImage = () => {
    setIsFullscreenImageOpen(false);
    setMode("regenerate");
  };

  const handleGenerateClick = () => {
    onSubmitGenerate({
      mode: selectedHistory ? "regenerate" : undefined,
    });
    // Scroll to preview panel on mobile, with a slight delay to ensure state updates
    setTimeout(() => {
      if (window.innerWidth < 1024) {
        // For mobile and tablet views
        previewPanelRef.current?.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  return (
    <div className="h-full flex flex-col p-4 sm:p-6">
      {/* Instagram Feed Style Card */}
      <CardNoGap className="flex-1 overflow-auto">
        {/* Header - Instagram style */}
        <div className="p-4 border-b flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src="/logoblue.png"
              alt="logol"
              width={200}
              height={200}
              className="w-8 h-8"
            />
            <span className="font-medium text-sm">{businessName}</span>
          </div>
          <Button
            variant="secondary"
            size="sm"
            className=" p-0"
            onClick={() => setIsHistoryModalOpen(true)}
          >
            <span className="font-medium text-sm">History</span>
            <Clock className="h-5 w-5" />
          </Button>
        </div>

        {/* Image Preview - Instagram style */}
        <div
          className="relative w-full h-fit cursor-pointer hover:opacity-95 transition-opacity"
          onClick={onOpenFullscreenImage}
        >
          {/* Business Image Content */}
          {isLoading ? (
            <div className="flex items-center justify-center w-full h-full bg-background-secondary relative !aspect-square">
              <LogoLoader
                hideContentBackground={false}
                className="absolute z-10"
              />
              <div className="absolute bg-black z-0 w-full h-full opacity-50 blur-sm">
                <Image
                  src={
                    selectedHistory?.result?.images[0] ||
                    form.basic.productImage ||
                    DEFAULT_PLACEHOLDER_IMAGE
                  }
                  alt={""}
                  key={
                    selectedHistory?.result?.images[0] ||
                    form.basic.productImage ||
                    DEFAULT_PLACEHOLDER_IMAGE
                  }
                  fill
                  className="object-cover w-full h-full"
                  priority
                />
              </div>
            </div>
          ) : (
            <Image
              src={
                selectedHistory?.result?.images[0] ||
                form.basic.productImage ||
                DEFAULT_PLACEHOLDER_IMAGE
              }
              alt={""}
              key={
                selectedHistory?.result?.images[0] ||
                form.basic.productImage ||
                DEFAULT_PLACEHOLDER_IMAGE
              }
              width={800}
              height={800}
              className="w-full h-auto"
              priority
            />
          )}
        </div>

        {isLoading &&
          typeof selectedHistory?.progress === "number" &&
          selectedHistory?.progress < 100 && (
            <div className="p-4 flex flex-row items-center gap-4 border-b">
              <Progress value={selectedHistory?.progress ?? 0} />
              <span className="text-sm">{selectedHistory?.progress}%</span>
            </div>
          )}

        {/* Caption - Instagram style */}
        <div className="p-4 border-b flex flex-col gap-4">
          <div className="text-sm">
            <span className="font-medium mr-2 mb-6">{businessName}</span>
            <Textarea
              value={form.basic.caption || "Caption akan tampil disini"}
              rows={3}
              onChange={(e) => {
                form.setBasic({ ...form.basic, caption: e.target.value });
              }}
              className="min-h-[60px] max-h-[120px] resize-none border-none p-0 text-sm focus:ring-0"
              placeholder="Write a caption..."
            />
          </div>
        </div>

        {/* Optimize Prompt */}
        <div className="p-4 border-b flex flex-col ">
          <label className="block text-sm font-medium mb-2">
            Optimize Prompt
          </label>
          <Textarea
            value={form?.basic?.prompt || ""}
            rows={3}
            onChange={(e) =>
              form.setBasic({ ...form.basic, prompt: e.target.value })
            }
            className="min-h-[60px] max-h-[120px] resize-none border-border text-sm focus:ring-0 p-4"
            placeholder="Write a optimize prompt..."
          />
          {selectedHistory && (
            <Button
              variant="outline"
              size="sm"
              className="w-fit self-end mt-4"
              onClick={() => onSelectHistory(null)}
            >
              <RotateCcw className="h-5 w-5" />
              Reset Form
            </Button>
          )}
        </div>

        {/* Generate/Regenerate Button */}
        <div className="p-4">
          {/* Save as Draft Button - Only show after generation */}
          {selectedHistory && (
            <>
              {!isDraftSaved ? (
                <Button
                  onClick={onSaveDraft}
                  variant="outline"
                  className="w-full mb-2"
                  disabled={isLoading}
                >
                  Save as a Draft
                </Button>
              ) : (
                <Link href={`/business/${businessId}/content-scheduler`}>
                  <Button variant="outline" className="w-full mt-2">
                    Lihat di Pustaka Konten
                  </Button>
                </Link>
              )}
            </>
          )}
          <Button
            onClick={handleGenerateClick}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            disabled={isLoading}
          >
            {isLoading
              ? "Loading..."
              : selectedHistory
              ? "Regenerate"
              : "Generate"}
          </Button>
        </div>
      </CardNoGap>

      {/* History Modal */}
      <HistoryModal
        isOpen={isHistoryModalOpen}
        onClose={() => setIsHistoryModalOpen(false)}
      />

      {/* Fullscreen Image Modal */}
      <FullscreenImageModal
        isOpen={isFullscreenImageOpen}
        onClose={onCloseFullscreenImage}
      />
    </div>
  );
}
