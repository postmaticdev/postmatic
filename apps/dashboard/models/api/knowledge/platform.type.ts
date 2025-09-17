/* payload for disconnect platform */
export interface PlatformPld {
  platform: string;
}

/* response for get platform */
export interface PlatformRes {
  name: string;
  platform: PlatformEnum;
  image: string;
  status: "connected" | "unconnected" | "unavailable";
  accountDisplayName: string | null;
  accountDisplayImage: string | null;
  connectUrl: string | null;
  disconnectUrl: string | null;
}

export type PlatformEnum =
  | "linked_in"
  | "facebook_page"
  | "instagram_business"
  | "whatsapp_business"
  | "tiktok"
  | "youtube"
  | "twitter"
  | "pinterest";
