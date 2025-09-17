"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";
import Image from "next/image";
import { FormDataView } from "./content-library";
import { PlatformEnum } from "@/models/api/knowledge/platform.type";
import { PostedImageContent } from "@/models/api/content/image.type";
import { DEFAULT_PLACEHOLDER_IMAGE } from "@/constants";
import { mapEnumPlatform } from "@/helper/map-enum-platform";
import { usePlatformKnowledgeGetAll } from "@/services/knowledge.api";
import { useParams } from "next/navigation";

interface ViewPostModalProps {
  isOpen: boolean;
  onClose: () => void;
  formData: FormDataView;
  setFormData: (formData: FormDataView) => void;
  onPostNow: () => void;
}

export function ViewPostModal({
  isOpen,
  onClose,
  onPostNow,
  formData,
  setFormData,
}: ViewPostModalProps) {
  const { businessId } = useParams() as { businessId: string };
  const { data: platformData } = usePlatformKnowledgeGetAll(businessId);
  const platforms = platformData?.data.data || [];
  const mappedPlatforms = platforms.map((platform) => ({
    id: platform.platform,
    name: platform.name,
    isActive: platform.status === "connected",
    status: platform.status,
    hint:
      platform.status === "connected"
        ? null
        : platform.status === "unconnected"
        ? "Belum terhubung"
        : "Tidak tersedia",
  }));

  const unavailablePlatforms = mappedPlatforms.filter(
    (platform) => !platform.isActive
  );

  const unPostedPlatforms = mappedPlatforms.filter(
    (platform) => !formData?.data?.platforms.includes(platform.id)
  );

  const handleShowPosted = (item: PostedImageContent) => {
    window.open(item.url, "_blank");
  };

  const handlePostNow = () => {
    onPostNow();
  };

  const handleSelectUnpostedPlatform = (platform: PlatformEnum) => {
    if (isDisabledPlatform(platform)) return;
    const isExist = isSelectedPlatform(platform);
    setFormData({
      ...formData,
      selectedPlatforms: isExist
        ? formData?.selectedPlatforms?.filter((p) => p !== platform)
        : [...formData?.selectedPlatforms, platform],
    });
  };

  const isSelectedPlatform = (platform: PlatformEnum) => {
    return formData?.selectedPlatforms?.includes(platform);
  };

  const isDisabledPlatform = (platform: PlatformEnum) => {
    return unavailablePlatforms.some((p) => p.id === platform);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>View Post</DialogTitle>
          <DialogDescription>
            View post details and manage social media publishing
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Post Image */}
          <div className="bg-card rounded-lg p-4 h-fit  flex items-center justify-center relative">
            <Image
              src={formData?.data?.images[0] || DEFAULT_PLACEHOLDER_IMAGE}
              alt="Post content"
              className="w-full h-auto object-cover rounded-lg"
              width={500}
              height={500}
            />
            <div className="absolute top-2 right-2">
              <span className="bg-blue-600 text-white text-xs px-2 py-1 rounded">
                {formData?.data?.category}
              </span>
            </div>
          </div>

          {/* Post Details */}
          <div className="space-y-4">
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Caption</h3>
              <p className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                {formData?.data?.caption}
              </p>
            </div>

            {/* {postData.scheduledDate && postData.scheduledTime && (
              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                <div className="flex items-center space-x-1">
                  <Calendar className="h-4 w-4" />
                  <span>{postData.scheduledDate}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-4 w-4" />
                  <span>{postData.scheduledTime}</span>
                </div>
              </div>
            )} */}
          </div>

          {/* Posted Platforms */}
          {formData?.data?.postedImageContents.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Posted to</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {formData?.data?.postedImageContents.map((platform) => (
                  <Button
                    key={platform.id}
                    variant="outline"
                    className="h-10 justify-start space-x-2 text-green-600 border-green-600 hover:bg-green-50"
                    onClick={() => handleShowPosted(platform)}
                  >
                    {mapEnumPlatform.getPlatformIcon(platform.platform)}
                    <span className="text-xs font-medium">
                      {mapEnumPlatform.getPlatformLabel(platform.platform)}
                    </span>
                    <ExternalLink className="h-3 w-3 ml-auto" />
                  </Button>
                ))}
              </div>
            </div>
          )}

          {unPostedPlatforms.length > 0 && (
            <div className="space-y-3">
              <h3 className="font-medium text-sm">Available to post</h3>
              <div className="grid grid-cols-2 sm:grid-cols-2 gap-2">
                {unPostedPlatforms.map((platform) => (
                  <Button
                    key={platform.id}
                    variant="outline"
                    className={`h-10 justify-start space-x-2 ${
                      isSelectedPlatform(platform.id)
                        ? "bg-blue-600 text-white border-blue-600"
                        : "hover:bg-muted"
                    }`}
                    disabled={isDisabledPlatform(platform.id)}
                    onClick={() => handleSelectUnpostedPlatform(platform.id)}
                  >
                    {mapEnumPlatform.getPlatformIcon(platform.id)}
                    <span className="text-xs font-medium">
                      {mapEnumPlatform.getPlatformLabel(platform.id)}
                    </span>
                    {platform.hint && (
                      <span className="ml-auto bg-gray-600 text-gray-300 text-xs px-1 py-0.5 rounded">
                        {platform.hint}
                      </span>
                    )}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer with Post Now Button */}

        <div className="border-t p-4 sm:p-6">
          <Button
            onClick={handlePostNow}
            disabled={formData?.selectedPlatforms?.length === 0}
            className="w-full"
          >
            Repost Now{" "}
            {formData?.selectedPlatforms?.length > 0 &&
              `(${formData?.selectedPlatforms?.length})`}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
