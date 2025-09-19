"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooterWithButton,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Clock } from "lucide-react";

import { FormDataDraft } from "./content-library";
import Image from "next/image";
import { DEFAULT_PLACEHOLDER_IMAGE } from "@/constants";
import { usePlatformKnowledgeGetAll } from "@/services/knowledge.api";
import { useParams } from "next/navigation";
import { mapEnumPlatform } from "@/helper/map-enum-platform";
import { PlatformEnum } from "@/models/api/knowledge/platform.type";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  showScheduling?: boolean;
  postType: "now" | "schedule";
  setPostType: (postType: "now" | "schedule") => void;
  formData: FormDataDraft;
  setFormData: (formData: FormDataDraft) => void;
  onSave: () => void;
  isLoading: boolean;
}

export function CreatePostModal({
  isOpen,
  onClose,
  showScheduling = false,
  postType,
  setPostType,
  formData,
  setFormData,
  onSave,
  isLoading,
}: CreatePostModalProps) {
  const { businessId } = useParams() as { businessId: string };
  const { data: dataPlatforms } = usePlatformKnowledgeGetAll(businessId);
  const platforms = dataPlatforms?.data.data || [];
  const mappedPlatforms = platforms.map((platform) => ({
    id: platform.platform,
    name: platform.name,
    isActive: platform.status === "connected",
    hint:
      platform.status === "connected"
        ? null
        : platform.status === "unconnected"
        ? "Belum terhubung"
        : "Tidak tersedia",
  }));

  const togglePlatform = (platformId: PlatformEnum) => {
    const platformsData = isSelectedPlatform(platformId)
      ? formData?.queue?.platforms?.filter((p) => p !== platformId)
      : [...formData?.queue?.platforms, platformId];
    setFormData({
      ...formData,
      queue: {
        ...formData?.queue,
        platforms: platformsData,
      },
      direct: {
        ...formData?.direct,
        platforms: platformsData,
      },
    });
  };

  const isSelectedPlatform = (platformId: PlatformEnum) => {
    return formData?.direct?.platforms?.includes(platformId) || false;
  };

  const handleSave = () => {
    onSave();
  };

  const enabledCount =
    formData?.direct?.platforms?.length ||
    formData?.queue?.platforms?.length ||
    0;
  const disabled =
    (postType === "schedule" &&
      (!formData?.queue?.date ||
        !formData?.queue?.time ||
        !formData?.edit?.caption ||
        !formData?.queue?.platforms?.length)) ||
    (postType === "now" &&
      (!formData?.edit?.caption || !formData?.direct?.platforms?.length));

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {/* Header */}
        <DialogHeader>
          <DialogTitle>Create Post</DialogTitle>
          <DialogDescription>
            Share your content across multiple social media platforms
          </DialogDescription>

          {/* Post Type Tab Bar - Only show if showScheduling is true */}
          {showScheduling && (
            <div className="flex bg-muted rounded-lg p-1">
              <button
                onClick={() => setPostType("now")}
                className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  postType === "now"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Post Now</span>
                <span className="sm:hidden">Now</span>
              </button>
              <button
                onClick={() => setPostType("schedule")}
                className={`flex-1 flex items-center justify-center space-x-1 sm:space-x-2 px-2 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-all ${
                  postType === "schedule"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Calendar className="h-3 w-3 sm:h-4 sm:w-4" />
                <span className="hidden sm:inline">Schedule</span>
                <span className="sm:hidden">Later</span>
              </button>
            </div>
          )}
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Media Upload Area */}
          <Image
            src={formData?.edit?.images[0] || DEFAULT_PLACEHOLDER_IMAGE}
            alt="Media"
            width={800}
            height={400}
            className="w-full h-auto object-cover rounded-lg"
          />

          {/* Caption Section */}
          <div className="space-y-2">
            <label className=" font-medium">Caption</label>
            <Textarea
              value={
                (showScheduling
                  ? formData?.queue?.caption
                  : formData?.direct?.caption) ||
                formData?.edit?.caption ||
                ""
              }
              onChange={(e) => {
                setFormData({
                  ...formData,
                  edit: { ...formData.edit, caption: e.target.value },
                  queue: { ...formData.queue, caption: e.target.value },
                  direct: { ...formData.direct, caption: e.target.value },
                });
              }}
              className="bg-card min-h-24 resize-none"
              placeholder="Tulis caption disini..."
            />
          </div>

          {/* Choose Platforms Section */}
          <div className="space-y-3">
            <label className=" font-medium">Choose platforms</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
              {mappedPlatforms.map((platform) => (
                <Button
                  key={platform.id}
                  variant={platform.isActive ? "default" : "outline"}
                  className={`h-10 sm:h-12 justify-start space-x-2 sm:space-x-3 text-xs sm:text-sm ${
                    isSelectedPlatform(platform.id)
                      ? "bg-blue-600 hover:bg-blue-700 "
                      : "bg-card text-muted- hover:bg-background"
                  } ${
                    !platform.isActive ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                  onClick={() => togglePlatform(platform.id)}
                  disabled={!platform.isActive}
                >
                  <div className="bg-card p-1 rounded-md">
                    
                  {mapEnumPlatform.getPlatformIcon(platform.id)}
                    </div>
                  <span className="font-medium truncate">
                    {mapEnumPlatform.getPlatformLabel(platform.id)}
                  </span>
                  {platform.hint && (
                    <span className="ml-auto bg-gray-600 text-gray-300 text-xs px-2 py-1 rounded">
                      {platform.hint}
                    </span>
                  )}
                </Button>
              ))}
            </div>
            {enabledCount === 0 && (
              <p className="text-red-400 text-sm">
                Silahkan pilih setidaknya satu platform
              </p>
            )}
          </div>

          {/* Scheduling Section - Only show if showScheduling is true and schedule is selected */}
          {showScheduling && postType === "schedule" && (
            <div className="space-y-3 sm:space-y-4">
              {/* Date Selection */}
              <div className="space-y-2">
                <label className=" font-medium text-sm sm:text-base">
                  Select Date
                </label>
                <Input
                  type="date"
                  value={formData?.queue?.date}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      queue: { ...formData?.queue, date: e.target.value },
                    })
                  }
                  min={new Date().toISOString().split("T")[0]}
                  className="bg-card text-sm sm:text-base"
                />
              </div>

              {/* Time Selection */}
              <div className="space-y-2">
                <label className=" font-medium text-sm sm:text-base">
                  Select Time
                </label>
                <Input
                  type="time"
                  value={formData?.queue?.time}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      queue: { ...formData?.queue, time: e.target.value },
                    })
                  }
                  className="bg-card text-sm sm:text-base"
                />
              </div>
            </div>
          )}
        </div>

        <DialogFooterWithButton
          buttonMessage={
            isLoading
              ? "Memuat..."
              : showScheduling && postType === "schedule"
              ? "Jadwalkan"
              : "Posting Sekarang"
          }
          onClick={handleSave}
          disabled={disabled || isLoading}
        />
      </DialogContent>
    </Dialog>
  );
}
