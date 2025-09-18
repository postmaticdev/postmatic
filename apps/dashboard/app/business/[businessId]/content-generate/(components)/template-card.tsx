"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { MoreHorizontal, Eye, Save, Heart } from "lucide-react";
import Image from "next/image";
import {
  Template,
  useContentGenerate,
} from "@/contexts/content-generate-context";

// {/* Content */}
interface TemplateCardProps {
  item: Template;
  onDetail: (item: Template | null) => void;
}

export const TemplateCard = ({ item, onDetail }: TemplateCardProps) => {
  const { 
    onSaveUnsave, 
    onSelectReferenceImage, 
    isLoading,
    unsaveModal,
    onConfirmUnsave,
    onCloseUnsaveModal,
    selectedTemplate
  } = useContentGenerate();
  
  const isSelected = selectedTemplate?.id === item.id;
  
  return (
    <Card
      key={item.id}
      className={`p-3 group transition-all duration-300 hover:scale-105 hover:shadow-lg ${
        isSelected ? "border-primary border-2" : ""
      }`}
    >
      <div className="relative">
        <div className="relative aspect-square rounded-lg overflow-hidden">
          {/* Business Image Content */}

          <Image
            src={item.imageUrl}
            alt="Placeholder Colorful"
            fill
            className="object-cover  transform-gpu transition-transform duration-500 ease-out will-change-transform group-hover:scale-110"
            priority
          />
        </div>
        <div className="absolute top-2 right-2">
          <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded">
            {item.categories && item.categories.length > 0 ? (
              item.categories.length === 1 
                ? item.categories[0]
                : `${item.categories[0]} +${item.categories.length - 1}`
            ) : ""}
          </span>
        </div>
      </div>

      <div className="space-y-2 -mt-3">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="font-medium text-sm">{item.name}</h3>
            <p className="text-xs ">Publisher: {item.publisher}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => onDetail(item)}
                className="cursor-pointer"
              >
                <Eye className="mr-2 h-4 w-4" />
                Detail Reference
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onSaveUnsave(item)}
                className="cursor-pointer"
              >
                {item.type === "saved" ? (
                  <Heart className="mr-2 h-4 w-4 fill-current text-red-500" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                {item.type === "saved" ? "Unsave" : "Save"}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Button
          className="w-full my-3 bg-blue-500 hover:bg-blue-600 text-white text-sm"
          disabled={isLoading || isSelected}
          onClick={() => {
            if (isLoading) return;
            onSelectReferenceImage(item.imageUrl, item.name, item);
          }}
        >
          {isSelected ? "Selected" : "Use"}
        </Button>
      </div>
      
      {/* Unsave Confirmation Modal */}
      <DeleteConfirmationModal
        isOpen={unsaveModal.isOpen && unsaveModal.item?.id === item.id}
        onClose={onCloseUnsaveModal}
        onConfirm={onConfirmUnsave}
        title="Hapus dari Saved"
        description="Apakah Anda yakin ingin menghapus template ini dari daftar saved? Tindakan ini tidak dapat dibatalkan."
        itemName={unsaveModal.item?.name || ""}
        isLoading={unsaveModal.isLoading}
      />
    </Card>
  );
};
