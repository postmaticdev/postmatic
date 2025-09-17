"use client";

import { Button } from "@/components/ui/button";
import { useContentGenerate } from "@/contexts/content-generate-context";
import { ChevronDown as ChevronDownIcon } from "lucide-react";
import { ProductSelectionModal } from "./product-selection-modal";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const GenerateFormBasic = () => {
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const { form, isLoading } = useContentGenerate();
  const { basic, setBasic } = form;

  return (
    <div className="space-y-4">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium mb-2">Product Name</label>
        <Button
          variant="outline"
          className="w-full justify-between text-left font-normal"
          onClick={() => setIsProductModalOpen(true)}
          disabled={isLoading}
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
            isLoading && "opacity-50 cursor-not-allowed hover:bg-transparent"
          )}
          disabled={isLoading}
        >
          <option value="">Select Ratio</option>
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
          disabled={isLoading}
          onChange={(e) => setBasic({ ...basic, category: e.target.value })}
          className={cn(
            "w-full p-2 rounded-md text-sm border border-input bg-background-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
            isLoading && "opacity-50 cursor-not-allowed hover:bg-transparent"
          )}
        >
          <option value="">Select Category</option>
          {CATEGORY_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
          <option value="other">Other</option>
        </select>
        {basic.category === "other" && (
          <input
            type="text"
            value={basic.customCategory}
            disabled={isLoading}
            onChange={(e) =>
              setBasic({ ...basic, customCategory: e.target.value })
            }
            placeholder="Enter custom category"
            className={cn(
              "w-full p-2 mt-2 rounded-md text-sm border border-input bg-background-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
              isLoading && "opacity-50 cursor-not-allowed hover:bg-transparent"
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
          disabled={isLoading}
          className={cn(
            "w-full p-2 rounded-md text-sm border border-input bg-background-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
            isLoading && "opacity-50 cursor-not-allowed hover:bg-transparent"
          )}
        >
          <option value="">Select Design Style</option>
          {DESIGN_STYLE_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}

          <option value="other">Other</option>
        </select>
        {basic.designStyle === "other" && (
          <input
            type="text"
            value={basic.customDesignStyle}
            disabled={isLoading}
            onChange={(e) =>
              setBasic({ ...basic, customDesignStyle: e.target.value })
            }
            placeholder="Enter custom design style"
            className={cn(
              "w-full p-2 mt-2 rounded-md text-sm border border-input bg-background-secondary text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-ring",
              isLoading && "opacity-50 cursor-not-allowed hover:bg-transparent"
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

const CATEGORY_OPTIONS = ["Product", "Promotion", "Branding", "Social Media"];

const DESIGN_STYLE_OPTIONS = [
  "Minimalist",
  "Modern",
  "Bold",
  "Vintage",
  "Corporate",
  "Social Media",
];

const RATIO_OPTIONS = ["1:1", "2:3", "3:2"];
