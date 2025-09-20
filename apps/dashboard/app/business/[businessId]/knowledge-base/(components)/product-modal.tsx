"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooterWithButton,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { ProductKnowledgePld } from "@/models/api/knowledge/product.type";
import { UploadPhoto } from "@/components/forms/upload-photo";
import { TextField } from "@/components/forms/text-field";
import { ProductCategoryDropdown } from "@/components/forms/product-category-dropdown";
import { PriceInput } from "@/components/forms/price-input";
import { CurrencyDropdown } from "@/components/forms/currency-dropdown";
import { Label } from "@/components/ui/label";

interface ProductModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (productData: ProductKnowledgePld & { id?: string }) => void;
  mode: "add" | "edit";
  formValue: ProductKnowledgePld & { id?: string };
  onChange: (productData: ProductKnowledgePld & { id?: string }) => void;
  errors?: Record<string, string>;
}

export function ProductModal({
  isOpen,
  onClose,
  onSave,
  mode,
  formValue,
  onChange,
  errors = {},
}: ProductModalProps) {
  const [productAction, setProductAction] = useState<"add" | "edit" | "select">(
    mode
  );

  const updateField = (
    key: keyof ProductKnowledgePld,
    value: ProductKnowledgePld[keyof ProductKnowledgePld]
  ) => {
    onChange({ ...formValue, [key]: value });
  };

  const handleSave = () => {
    onSave(formValue);
  };

  const isEditMode = mode === "edit";
  const title = isEditMode ? "Edit Produk" : "Tambah Produk";
  const description = isEditMode
    ? "Update informasi produk"
    : "Tambah produk baru ke basis pengetahuan";
  const buttonText = isEditMode ? "Simpan Perubahan" : "Tambah";

  const placeholders = {
    productName: "Kopi Kapal Langit",
    productCategory: "Contoh : Makanan & Minuman",
    productDescription: "Kopi Kapal adalah kopi yang berasal dari Kapal",
    price: "100000",
    currency: "IDR",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {productAction === "select" && mode === "add" && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={() => setProductAction("add")}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add Product
                </Button>
                <Button
                  onClick={() => setProductAction("edit")}
                  variant="outline"
                >
                  Edit Product
                </Button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            <div className="flex flex-col md:flex-row w-full gap-6 items-start">
              <UploadPhoto
                label="Foto Produk"
                onImageChange={(file: string | null) =>
                  updateField("images", file ? [file] : [])
                }
                currentImage={formValue.images?.[0]}
                error={errors.images}
              />

              <div className="w-full space-y-4">
                <TextField
                  label="Nama Produk"
                  value={formValue.name}
                  onChange={(value) => updateField("name", value)}
                  placeholder={placeholders.productName}
                  error={errors.name}
                />

                <ProductCategoryDropdown
                  value={formValue.category}
                  onChange={(value) => updateField("category", value)}
                  placeholder={placeholders.productCategory}
                  label="Kategori Produk"
                  error={errors.category}
                />
              </div>
            </div>

            <TextField
              label="Deskripsi Produk"
              value={formValue.description}
              onChange={(value) => updateField("description", value)}
              placeholder={placeholders.productDescription}
              multiline
              rows={3}
              error={errors.description}
            />
            <Label className="text-sm font-medium text-foreground mb-1">
              Harga Produk
            </Label>
            <div className="flex w-full gap-6 items-start justify-between">
              <CurrencyDropdown
                value={formValue.currency}
                onChange={(value) => updateField("currency", value)}
                placeholder={placeholders.currency}
                error={errors.currency}
              />

              <PriceInput
                value={formValue.price}
                onChange={(value) => updateField("price", value)}
                placeholder={placeholders.price}
                currency={formValue.currency || "IDR"}
                error={errors.price}
              />
            </div>
          </div>
        </div>

        <DialogFooterWithButton
          buttonMessage={buttonText}
          onClick={handleSave}
        />
      </DialogContent>
    </Dialog>
  );
}
