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

  // const handleProductSelect = (product: ProductKnowledgePld & { id?: string }) => {
  //   setProductData({
  //     allergen: product.allergen,
  //     benefit: product.benefit,
  //     category: product.category,
  //     description: product.description,
  //     images: product.images,
  //     name: product.name,
  //     price: product.price,
  //     currency: product.currency,
  //   });
  //   setProductAction("edit");
  // };

  const handleSave = () => {
    onSave(formValue);
  };

  const isEditMode = mode === "edit";
  const title = isEditMode ? "Edit Produk" : "Tambah Produk";
  const description = isEditMode
    ? "Update informasi produk"
    : "Tambah produk baru ke basis pengetahuan";
  const buttonText = isEditMode ? "Ubah Perubahan" : "Tambah";

  // const { businessId } = useParams() as { businessId: string };
  // const { data: resProductData } = useProductKnowledgeGetAll(businessId); // TODO: uncomment jika memang yang tadi perlu
  // const products = resProductData?.data.data || []; // TODO: uncomment jika memang yang tadi perlu

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
                onImageChange={(file) =>
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
                  placeholder="Masukkan nama produk"
                  error={errors.name}
                />

                <ProductCategoryDropdown
                  value={formValue.category}
                  onChange={(value) => updateField("category", value)}
                  placeholder="Pilih kategori produk"
                  label="Kategori Produk"
                  error={errors.category}
                />
              </div>
            </div>

            <TextField
              label="Deskripsi Produk"
              value={formValue.description}
              onChange={(value) => updateField("description", value)}
              placeholder="Masukkan deskripsi produk"
              multiline
              rows={3}
              error={errors.description}
            />

            <CurrencyDropdown
              value={formValue.currency}
              onChange={(value) => updateField("currency", value)}
              placeholder="Pilih mata uang"
              label="Mata Uang"
              error={errors.currency}
            />

            <PriceInput
              value={formValue.price}
              onChange={(value) => updateField("price", value)}
              placeholder="Masukkan harga produk"
              label="Harga Produk"
              currency={formValue.currency || "IDR"}
              error={errors.price}
            />

            <TextField
              label="Manfaat Produk"
              value={formValue.benefit}
              onChange={(value) => updateField("benefit", value)}
              placeholder="Masukkan manfaat produk"
              error={errors.benefit}
            />

            <TextField
              label="Informasi Alergi"
              value={formValue.allergen}
              onChange={(value) => updateField("allergen", value)}
              placeholder="Masukkan informasi alergi"
              error={errors.allergen}
            />
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
