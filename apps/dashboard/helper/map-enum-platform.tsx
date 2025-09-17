import { cn } from "@/lib/utils";
import { PlatformEnum } from "@/models/api/knowledge/platform.type";
import {
  FaFacebook,
  FaInstagram,
  FaLinkedin,
  FaPinterest,
  FaTiktok,
  FaTwitter,
  FaWhatsapp,
  FaYoutube,
} from "react-icons/fa";

const getPlatformIcon = (platform: PlatformEnum, className?: string) => {
  switch (platform) {
    case "linked_in":
      return <FaLinkedin className={cn("h-5 w-5 text-blue-600", className)} />;
    case "facebook_page":
      return <FaFacebook className={cn("h-5 w-5 text-blue-600", className)} />;
    case "instagram_business":
      return <FaInstagram className={cn("h-5 w-5 text-pink-500", className)} />;
    case "whatsapp_business":
      return <FaWhatsapp className={cn("h-5 w-5 text-green-500", className)} />;
    case "tiktok":
      return <FaTiktok className={cn("h-5 w-5 text-black", className)} />;
    case "youtube":
      return <FaYoutube className={cn("h-5 w-5 text-red-500", className)} />;
    case "twitter":
      return <FaTwitter className={cn("h-5 w-5 text-blue-600", className)} />;
    case "pinterest":
      return <FaPinterest className={cn("h-5 w-5 text-red-500", className)} />;
    default:
      return null;
  }
};

const getPlaformColor = (platform: PlatformEnum) => {
  switch (platform) {
    case "linked_in":
      return "bg-blue-600";
    case "facebook_page":
      return "bg-blue-600";
    case "instagram_business":
      return "bg-pink-500";
    case "whatsapp_business":
      return "bg-green-500";
    case "tiktok":
      return "bg-black";
    case "youtube":
      return "bg-red-500";
    case "twitter":
      return "bg-blue-600";
    case "pinterest":
      return "bg-red-500";
    default:
      return "bg-gray-500";
  }
};

const getPlatformLabel = (platform: PlatformEnum): string => {
  switch (platform) {
    case "linked_in":
      return "LinkedIn";
    case "facebook_page":
      return "Facebook";
    case "instagram_business":
      return "Instagram";
    case "whatsapp_business":
      return "WhatsApp Business";
    case "tiktok":
      return "TikTok";
    case "youtube":
      return "YouTube";
    case "twitter":
      return "X";
    case "pinterest":
      return "Pinterest";
    default:
      return "Tidak Diketahui";
  }
};

const getPlatformGradient = (platform: PlatformEnum) => {
  switch (platform) {
    case "linked_in":
      return "bg-gradient-to-br from-blue-600 to-blue-700";
    case "facebook_page":
      return "bg-gradient-to-br from-blue-500 to-blue-600";
    case "tiktok":
      return "bg-gradient-to-br from-black to-black";
    case "instagram_business":
      return "bg-gradient-to-br from-pink-400 to-purple-500";
    case "whatsapp_business":
      return "bg-gradient-to-br from-green-500 to-green-600";
    case "tiktok":
      return "bg-gradient-to-br from-black to-black";
    case "youtube":
      return "bg-gradient-to-br from-red-500 to-red-600";
    case "twitter":
      return "bg-gradient-to-br from-blue-600 to-blue-700";
    case "pinterest":
      return "bg-gradient-to-br from-red-500 to-red-600";
    default:
      return "bg-gradient-to-br from-gray-500 to-gray-600";
  }
};

const getPlatformCtaLabel = (
  status: "connected" | "unconnected" | "unavailable"
) => {
  switch (status) {
    case "connected":
      return "Putuskan";
    case "unconnected":
      return "Hubungkan";
    case "unavailable":
      return null;
    default:
      return null;
  }
};

const getPlatformHint = (
  status: "connected" | "unconnected" | "unavailable"
) => {
  switch (status) {
    case "connected":
      return null;
    case "unconnected":
      return "Belum terhubung";
    case "unavailable":
      return "Belum tersedia";
    default:
      return "Tidak Diketahui";
  }
};

export const mapEnumPlatform = {
  getPlatformIcon,
  getPlaformColor,
  getPlatformLabel,
  getPlatformGradient,
  getPlatformCtaLabel,
  getPlatformHint,
};
