"use client";

import { useState } from "react";
import { CardNoGap } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Textarea } from "@/components/ui/textarea";
import { HistoryModal } from "@/app/business/[businessId]/content-generate/(components)/history-modal";
import { FullscreenImageModal } from "@/app/business/[businessId]/content-generate/(components)/fullscreen-image-modal";
import { Clock, RotateCcw } from "lucide-react";
import { useContentGenerate } from "@/contexts/content-generate-context";
import { DEFAULT_PLACEHOLDER_IMAGE } from "@/constants";
import { useBusinessGetById } from "@/services/business.api";
import { useParams } from "next/navigation";
import { LogoLoader } from "@/components/base/logo-loader";

export function PreviewPanel() {
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [isFullscreenImageOpen, setIsFullscreenImageOpen] = useState(false);

  const {
    form,
    selectedHistory,
    onSelectHistory,
    isLoading,
    onSubmitGenerate,
    onSaveDraft,
    setMode,
  } = useContentGenerate();
  const { businessId } = useParams() as { businessId: string };
  const { data: businessData } = useBusinessGetById(businessId);
  const businessName = businessData?.data?.data?.name;

  const onOpenFullscreenImage = () => {
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

  return (
    <div className="h-full flex flex-col p-4 sm:p-6">
      {/* Instagram Feed Style Card */}
      <CardNoGap className="flex-1 overflow-hidden">
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
          className="relative aspect-[5/4] overflow-hidden cursor-pointer hover:opacity-95 transition-opacity"
          onClick={onOpenFullscreenImage}
        >
          {/* Business Image Content */}
          {isLoading ? (
            <div className="flex items-center justify-center h-full bg-background-secondary relative">
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
                  className="object-cover"
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
              fill
              className="object-cover"
              priority
            />
          )}
        </div>

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
          {selectedHistory && (
            <Button
              variant="outline"
              size="sm"
              className="w-fit self-end"
              onClick={() => onSelectHistory(null)}
            >
              <RotateCcw className="h-5 w-5" />
              Reset Form
            </Button>
          )}
        </div>

        {/* Optimize Prompt */}
        <div className="p-4 border-b">
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
        </div>

        {/* Generate/Regenerate Button */}
        <div className="p-4">
          <Button
            onClick={onSubmitGenerate}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white"
            disabled={isLoading}
          >
            {isLoading
              ? "Loading..."
              : selectedHistory
              ? "Regenerate"
              : "Generate"}
          </Button>

          {/* Save as Draft Button - Only show after generation */}
          {selectedHistory && (
            <Button
              onClick={onSaveDraft}
              variant="outline"
              className="w-full mt-2"
              disabled={isLoading}
            >
              Save as a Draft
            </Button>
          )}
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
