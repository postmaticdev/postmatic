import { DEFAULT_PLACEHOLDER_IMAGE } from "@/constants";

/**
 * Get RSS source image based on publisher name
 * @param publisher - The publisher name from RSS data
 * @returns Image path for the specific publisher or default placeholder
 */
export const getRssSourceImage = (publisher?: string): string => {
  if (!publisher) {
    return DEFAULT_PLACEHOLDER_IMAGE;
  }

  const publisherLower = publisher.toLowerCase().trim();

  // CNBC sources
  if (publisherLower.includes("cnbc")) {
    return "/cnbc.png";
  }

  // Antara sources
  if (publisherLower.includes("antara")) {
    return "/antara.png";
  }

  // Add more publishers as needed
  // if (publisherLower.includes("kompas")) {
  //   return "/kompas.png";
  // }

  // Default fallback
  return DEFAULT_PLACEHOLDER_IMAGE;
};
