import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Utility function for consistent mobile margins
export function getMobileMargins() {
  return "px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16"
}

// Utility function for container with consistent margins
export function getContainerMargins() {
  return "container mx-auto px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16"
}
