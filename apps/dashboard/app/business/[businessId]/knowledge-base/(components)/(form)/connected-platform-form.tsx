"use client";

import { Button } from "@/components/ui/button";
import { useManageKnowledge } from "@/contexts/manage-knowledge-context";
import { mapEnumPlatform } from "@/helper/map-enum-platform";
import { showToast } from "@/helper/show-toast";
import { PlatformRes } from "@/models/api/knowledge/platform.type";
import { usePlatformKnowledgeDisconnect } from "@/services/knowledge.api";
import { useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function ConnectedPlatformForm() {
  const { businessId } = useParams() as { businessId: string };
  const queryClient = useQueryClient();
  const { platforms } = useManageKnowledge();
  const mdDisconnectPlatform = usePlatformKnowledgeDisconnect();
  const handleConnect = async (platform: PlatformRes) => {
    try {
      switch (platform.status) {
        case "connected":
          const response = await mdDisconnectPlatform.mutateAsync({
            businessId,
            platform: platform.platform,
          });
          showToast("success", response.data.responseMessage);
          break;
        case "unconnected":
          await queryClient.invalidateQueries({
            queryKey: ["platformKnowledge"],
          });
          const url = platform.connectUrl;
          if (url) {
            // Use location.href for iOS compatibility
            const newWindow = window.open();
            if (newWindow) {
              newWindow.opener = null;
              newWindow.location.href = url;
            } else {
              // Fallback if popup is blocked
              window.location.href = url;
            }
          }
          await queryClient.invalidateQueries({
            queryKey: ["platformKnowledge"],
          });
          break;
        case "unavailable":
          break;
      }
    } catch {}
  };

  // Filter platforms to only show the allowed ones
  const allowedPlatforms = ['linked_in', 'facebook_page', 'instagram_business', 'twitter', 'tiktok'];
  const filteredPlatforms = platforms.filter(platform => 
    allowedPlatforms.includes(platform.platform)
  );

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 gap-4`}>
      {filteredPlatforms.map((platform) => (
        <div key={platform.name} className="p-4 border rounded-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white text-sm flex-shrink-0">
                {mapEnumPlatform.getPlatformIcon(platform.platform)}
              </div>
              <div>
                <h3 className="font-medium text-foreground">{platform.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {mapEnumPlatform.getPlatformHint(platform.status)}
                </p>
              </div>
            </div>
            {mapEnumPlatform.getPlatformCtaLabel(platform.status) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleConnect(platform)}
                disabled={platform.status === "unavailable"}
                className={
                  platform.status === "connected"
                    ? "bg-green-100 text-green-800 border-green-300"
                    : ""
                }
              >
                {mapEnumPlatform.getPlatformCtaLabel(platform.status)}
              </Button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
