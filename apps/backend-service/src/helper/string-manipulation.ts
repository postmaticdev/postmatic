/**
 * Transform platform string from snake_case to camelCase
 * @param platform - The platform string to transform
 * @returns The transformed platform string
 */
const transformPlatform = (platform: string) => {
  const splitted = platform.split("_");
  return (
    "social" +
    splitted
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("")
  );
};

/**
 * Transform string from snake_case to readable string
 * @param str - The string to transform
 * @returns The transformed string
 */
const snakeToReadable = (str: string) => {
  const splitted = str.split("_");
  return splitted
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
};

const formatRupiah = (amount: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
  }).format(amount);
};

export const stringManipulation = {
  transformPlatform,
  snakeToReadable,
  formatRupiah,
};
