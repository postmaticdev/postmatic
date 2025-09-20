"use client";

import { Button } from "@/components/ui/button";
import { useContentGenerate } from "@/contexts/content-generate-context";
import { ChevronDown as ChevronDownIcon } from "lucide-react";
import { ProductSelectionModal } from "./product-selection-modal";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const GenerateFormBasic = () => {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const { form, isLoading, selectedHistory } = useContentGenerate();
  const { basic, setBasic } = form;
  const disabled = selectedHistory !== null;

  return (
    <div className="space-y-4">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium mb-2">Product Name</label>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal"
          onClick={() => setIsProductModalOpen(true)}
          disabled={isLoading || disabled}
        >
          <span
            className={
              basic?.productKnowledgeId
                ? "text-foreground"
                : "text-muted-foreground"
            }
          >
            {basic?.productKnowledgeId ? basic?.productName : "Select Product"}
          </span>
          <ChevronDownIcon className="h-4 w-4" />
        </Button>
      </div>

      {/* Aspect Ratio */}
      <div>
        <label className="block text-sm font-medium mb-2">Aspect Ratio</label>
        <select
          className={cn(
            "w-full p-2 rounded-md text-sm border border-input bg-background-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
            isLoading ||
              (disabled && "opacity-50 cursor-not-allowed hover:bg-transparent")
          )}
          disabled={isLoading || disabled}
        >
          {RATIO_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium mb-2">Category</label>
        <select
          value={basic?.category}
          disabled={isLoading || disabled}
          onChange={(e) => {
            if (disabled) return;
            setBasic({ ...basic, category: e.target.value });
          }}
          className={cn(
            "w-full p-2 rounded-md text-sm border border-input bg-background-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
            isLoading ||
              (disabled && "opacity-50 cursor-not-allowed hover:bg-transparent")
          )}
        >
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          <option value="other">Other</option>
        </select>
        {basic.category === "other" && (
          <input
            type="text"
            value={basic.customCategory}
            disabled={isLoading || disabled}
            onChange={(e) =>
              setBasic({ ...basic, customCategory: e.target.value })
            }
            placeholder="Enter custom category"
            className={cn(
              "w-full p-2 mt-2 rounded-md text-sm border border-input bg-background-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
              isLoading ||
                (disabled &&
                  "opacity-50 cursor-not-allowed hover:bg-transparent")
            )}
          />
        )}
      </div>

      {/* Design Style */}
      <div>
        <label className="block text-sm font-medium mb-2">Design Style</label>
        <select
          value={basic.designStyle || ""}
          onChange={(e) => setBasic({ ...basic, designStyle: e.target.value })}
          disabled={isLoading || disabled}
          className={cn(
            "w-full p-2 rounded-md text-sm border border-input bg-background-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
            isLoading ||
              (disabled && "opacity-50 cursor-not-allowed hover:bg-transparent")
          )}
        >
          {DESIGN_STYLE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}

          <option value="other">Other</option>
        </select>
        {basic.designStyle === "other" && (
          <input
            type="text"
            value={basic.customDesignStyle}
            disabled={isLoading || disabled}
            onChange={(e) =>
              setBasic({ ...basic, customDesignStyle: e.target.value })
            }
            placeholder="Enter custom design style"
            className={cn(
              "w-full p-2 mt-2 rounded-md text-sm border border-input bg-background-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
              isLoading ||
                (disabled &&
                  "opacity-50 cursor-not-allowed hover:bg-transparent")
            )}
          />
        )}
      </div>
      <ProductSelectionModal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
        }}
      />
    </div>
  );
};

const CATEGORY_OPTIONS = [
  {
    label: "Default",
    value: "Default",
  },
  {
    label: "Promosi & Diskon",
    value: "Promosi & Diskon",
  },
  {
    label: "Product Showcase",
    value: "Product Showcase",
  },
  {
    label: "Testimoni & Review Pelanggan",
    value: "Testimoni & Review Pelanggan",
  },
  {
    label: "Behind the Scenes",
    value: "Behind the Scenes",
  },
  {
    label: "Edukasi & Tips",
    value: "Edukasi & Tips",
  },
  {
    label: "Event & Aktivitas",
    value: "Event & Aktivitas",
  },
  {
    label: "Branding Story",
    value: "Branding Story",
  },
  {
    label: "Tutorial & Cara Pakai",
    value: "Tutorial & Cara Pakai",
  },
  {
    label: "Entertainment & Konten Viral",
    value: "Entertainment & Konten Viral",
  },
  {
    label: "Pengumuman & Pembaruan",
    value: "Pengumuman & Pembaruan",
  },
];

const DESIGN_STYLE_OPTIONS = [
  {
    label: "Default",
    value: "Default",
  },
  {
    label: "Minimalist",
    value: "Minimalist",
  },
  {
    label: "Flat Design",
    value: "Flat Design",
  },
  {
    label: "3D Design",
    value: "3D Design",
  },
  {
    label: "Futuristic",
    value: "Futuristic",
  },
  {
    label: "Retro / Vintage",
    value: "Retro / Vintage",
  },
  {
    label: "Cartoon / Character",
    value: "Cartoon / Character",
  },
  {
    label: "Realistic / Photorealism",
    value: "Realistic / Photorealism",
  },
  {
    label: "Abstract",
    value: "Abstract",
  },
  {
    label: "Typography-based",
    value: "Typography-based",
  },
  {
    label: "Gradient / Colorful",
    value: "Gradient / Colorful",
  },
  {
    label: "Cyberpunk",
    value: "Cyberpunk",
  },
  {
    label: "Line Art",
    value: "Line Art",
  },
  {
    label: "Geometric",
    value: "Geometric",
  },
  {
    label: "Hand-drawn / Sketch",
    value: "Hand-drawn / Sketch",
  },
];

const RATIO_OPTIONS = ["1:1", "2:3", "3:2"];
