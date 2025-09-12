"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";

import { ImageComparisonSlider } from "./image-compararison-slider";
import { Button } from "../ui/button";
import Link from "next/link";
import { LOGIN_URL } from "@/constants";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  product: {
    id: number;
    name: string;
    description: string;
    imageBefore: string;
    imageAfter: string;
  };
}

export const ProductModal: React.FC<ProductModalProps> = ({
  isOpen,
  onClose,
  product,
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleEscapeKey);
    }

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className="relative w-full max-w-3xl mx-2 sm:mx-4 md:mx-auto rounded-xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >


            {/* Modal content */}
            <div className="flex flex-col md:flex-row bg-card/95 backdrop-blur-md border border-border text-foreground">
              {/* Image container */}
              <div className="w-full md:w-2/3 relative">
                <div className="aspect-square relative">
                  <ImageComparisonSlider
                    beforeImage={product.imageAfter}
                    afterImage={product.imageBefore}
                    beforeLabel="Original"
                    afterLabel="Enhanced"
                  />
                </div>
              </div>

              {/* Product info */}
              <div className="w-full md:w-1/3 flex flex-col">
                {/* Header */}
                <div className="flex items-center gap-2 sm:gap-3 p-3 sm:p-4 border-b border-border">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-white font-bold text-sm sm:text-base">
                    {product.name.charAt(0)}
                  </div>
                  <h3 className="text-base sm:text-lg font-semibold truncate">{product.name}</h3>
                </div>

                {/* Caption */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                    {product.description}
                  </p>
                </div>

                {/* Actions */}
                <div className="p-3 sm:p-4 border-t border-border space-y-2 sm:space-y-3">
                  <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm">
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5 text-red-500"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span>128</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <svg
                        className="w-4 h-4 sm:w-5 sm:h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                        />
                      </svg>
                      <span>24</span>
                    </div>
                  </div>
                  <Link href={LOGIN_URL}>
                    <Button className="w-full h-9 sm:h-10 px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium bg-gradient-to-r from-primary to-secondary rounded-md hover:from-secondary hover:to-primary hover:scale-[1.02] transition-all text-white shadow-md hover:shadow-lg cursor-pointer">
                      Get Started
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
