"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Globe, MapPin, Plus } from "lucide-react";
import Image from "next/image";
import { EditKnowledgeModal } from "./edit-knowledge-modal";
import { PlatformModal } from "./platform-modal";
import { useBusinessGetById } from "@/services/business.api";
import { useParams } from "next/navigation";
import {
  useBusinessKnowledgeGetById,
  usePlatformKnowledgeGetAll,
} from "@/services/knowledge.api";
import { DEFAULT_BUSINESS_IMAGE } from "@/constants";
import { mapEnumPlatform } from "@/helper/map-enum-platform";
import { cn } from "@/lib/utils";

export function BusinessKnowledgeSection() {
  const { businessId } = useParams() as { businessId: string };
  const { data: businessData } = useBusinessGetById(businessId);
  const { data: businessKnowledgeData } =
    useBusinessKnowledgeGetById(businessId);

  const { data: platformData } = usePlatformKnowledgeGetAll(businessId);
  const connectedPlatforms = platformData?.data.data.filter(
    (platform) => platform.status === "connected"
  );

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPlatformModalOpen, setIsPlatformModalOpen] = useState(false);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handlePlatformClick = () => {
    setIsPlatformModalOpen(true);
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className=" pb-6">
          <div className="flex items-center justify-between my-3">
            <h1 className="text-xl font-semibold text-foreground">
              Pengetahuan Bisnis
            </h1>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 w-8 p-0"
              onClick={handleEditClick}
            >
              <Edit className="w-4 h-4" />
            </Button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Image Card - 4:3 ratio */}
            <div className="rounded-lg xl:h-5/6 xl:w-5/6 overflow-hidden">
              <div className="overflow-hidden relative aspect-[4/3] rounded-lg ">
                <Image
                  src={
                    businessKnowledgeData?.data?.data?.primaryLogo ||
                    businessKnowledgeData?.data?.data?.secondaryLogo ||
                    businessData?.data?.data?.logo ||
                    DEFAULT_BUSINESS_IMAGE
                  }
                  alt="Business Image"
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Company Information */}
            <div>
              <h3 className="font-semibold text-foreground mb-2">{businessKnowledgeData?.data?.data?.name || "Tidak tersedia"}</h3>
              <p className="text-sm text-muted-foreground mb-3">
                {businessKnowledgeData?.data?.data?.category}
              </p>

              <div className="flex flex-wrap gap-2 mb-3">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs"
                >
                  <Globe className="w-3 h-3 mr-1" />
                  {businessKnowledgeData?.data?.data?.website ||
                    "Tidak tersedia"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-6 px-2 text-xs bg-pink-50 border-pink-200 text-pink-700"
                >
                  <MapPin className="w-3 h-3 mr-1" />
                  {businessKnowledgeData?.data?.data?.location ||
                    "Tidak tersedia"}
                </Button>
              </div>

              <p className="text-sm text-muted-foreground mb-3">
                {businessKnowledgeData?.data?.data?.description ||
                  "Tidak tersedia"}
              </p>
              <h3 className="font-semibold text-foreground mb-2">
                Social Media
              </h3>
              <div className="flex gap-6">
                {/* Instagram */}
                {connectedPlatforms?.map((platform, index) => (
                  <div
                    className={cn(
                      "w-12 h-12 bg-gradient-to-br Í rounded-full flex flex-shrink-0 items-center justify-center",
                      mapEnumPlatform.getPlatformGradient(platform.platform)
                    )}
                    key={index}
                  >
                    {mapEnumPlatform.getPlatformIcon(
                      platform.platform,
                      "w-6 h-6 text-white"
                    )}
                  </div>
                ))}
                {/* Plus Button */}
                <button
                  onClick={handlePlatformClick}
                  className="w-12 h-12 bg-gradient-to-br from-gray-400 to-gray-500 rounded-full flex flex-shrink-0 items-center justify-center hover:from-gray-500 hover:to-gray-600 transition-colors"
                >
                  <Plus className="w-6 h-6 text-white" />
                </button>
              </div>
            </div>

            {/* Unique Selling Point & Vision/Mission */}
            <div className="space-y-4">
              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Keunikan Bisnis
                </h3>
                <p className="text-sm text-muted-foreground">
                  {businessKnowledgeData?.data?.data?.uniqueSellingPoint ||
                    "Tidak tersedia"}
                </p>
              </div>

              <div>
                <h3 className="font-semibold text-foreground mb-2">
                  Visi & Misi
                </h3>
                <p className="text-sm text-muted-foreground">
                  {businessKnowledgeData?.data?.data?.visionMission ||
                    "Tidak tersedia"}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      <EditKnowledgeModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        initialTab={"business"}
      />
      <PlatformModal
        isOpen={isPlatformModalOpen}
        onClose={() => setIsPlatformModalOpen(false)}
      />
    </div>
  );
}
