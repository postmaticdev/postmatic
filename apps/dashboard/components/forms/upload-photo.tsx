"use client";

import { Label } from "@/components/ui/label";
import { showToast } from "@/helper/show-toast";
import { helperService } from "@/services/helper.api";
import { Image as ImageIcon, Info, Loader2 } from "lucide-react";
import Image from "next/image";
import { Dispatch, SetStateAction, useState } from "react";

interface UploadPhotoProps {
  label: string;
  onImageChange:
    | Dispatch<SetStateAction<string | null>>
    | ((url: string | null) => void);
  currentImage?: string | null;
  error?: string;
  onFocus?: () => void;
}

export function UploadPhoto({
  label,
  onImageChange,
  currentImage,
  error,
  onFocus,
}: UploadPhotoProps) {
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = e.target.files?.[0] || null;
      if (file) {
        setIsUploading(true);
        const response = await helperService.uploadSingleImage({
          image: file,
        });
        onImageChange(response);
        setPreview(response);
      } else {
        setPreview(null);
        onImageChange(null);
      }
    } catch (error) {
      showToast("error", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium text-foreground">{label}</Label>
      <div
        className={`w-62 h-54 md:w-32 md:h-32 border-2 border-dashed rounded-lg flex items-center justify-center bg-muted/20 cursor-pointer hover:bg-muted/30 transition-colors ${
          error ? "border-red-500" : "border-muted-foreground/25"
        }`}
        onClick={() => {
          onFocus?.();
          document
            .getElementById(
              `upload-${label.toLowerCase().replace(/\s+/g, "-")}`
            )
            ?.click();
        }}
      >
        {isUploading ? (
          <div className="flex flex-col items-center gap-2 text-muted-foreground relative">
            <Loader2 className="w-8 h-8 animate-spin" />
            <span className="text-sm">Uploading...</span>
          </div>
        ) : preview ? (
          <Image
            src={preview}
            alt="Preview"
            width={400}
            height={400}
            className="w-full h-full object-cover rounded-lg"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted-foreground">
            <ImageIcon className="w-8 h-8" />
            <span className="text-sm">Upload Photo</span>
          </div>
        )}
      </div>
      <input
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
        id={`upload-${label.toLowerCase().replace(/\s+/g, "-")}`}
      />
      {error && (
        <div className="flex items-center gap-1">
          <Info className="w-4 h-4 text-red-500" />
          <p className="text-sm text-red-500">{error}</p>
        </div>
      )}
    </div>
  );
}
