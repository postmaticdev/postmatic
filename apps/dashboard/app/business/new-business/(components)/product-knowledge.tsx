"use client";

import { ProductCategoryDropdown } from "@/components/forms/product-category-dropdown";
import { CurrencyDropdown } from "@/components/forms/currency-dropdown";
import { PriceInput } from "@/components/forms/price-input";
import { TextField } from "@/components/forms/text-field";
import { UploadPhoto } from "@/components/forms/upload-photo";
import { useFormNewBusiness } from "@/contexts/form-new-business-context";
import { ProductKnowledgePld } from "@/models/api/knowledge/product.type";

export function ProductKnowledge() {
  const { formData, setFormData, errors, clearFieldError } =
    useFormNewBusiness();
  const { step2 } = formData;

  const updateField = (
    key: keyof ProductKnowledgePld,
    value: ProductKnowledgePld[keyof ProductKnowledgePld]
  ) => {
    setFormData({ ...formData, step2: { ...formData.step2, [key]: value } });
  };

  const defaultLabels = {
    productPhoto: "Foto Produk",
    productName: "Nama Produk",
    productCategory: "Kategori Produk",
    productDescription: "Deskripsi Produk",
    price: "Harga Produk",
    productBenefits: "Manfaat Produk",
    allergenInformation: "Informasi Alergi",
    currency: "Mata Uang",
  };

  const defaultPlaceholders = {
    productName: "Masukkan nama produk",
    productCategory: "Masukkan kategori produk",
    productDescription: "Masukkan deskripsi produk",
    price: "Masukkan harga produk",
    productBenefits: "Masukkan manfaat produk",
    allergenInformation: "Masukkan informasi alergi",
    currency: "Masukkan mata uang",
  };

  const finalLabels = { ...defaultLabels };
  const finalPlaceholders = { ...defaultPlaceholders };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row w-full gap-6 items-start">
        <UploadPhoto
          label={finalLabels.productPhoto}
          onImageChange={(file) => updateField("images", file ? [file] : [])}
          currentImage={step2.images?.[0]}
          error={errors.step2.images}
          onFocus={() => clearFieldError(1, "images")}
        />

        <div className="w-full space-y-4">
          <TextField
            label={finalLabels.productName}
            value={step2.name}
            onChange={(value) => updateField("name", value)}
            placeholder={finalPlaceholders.productName}
            error={errors.step2.name}
            onFocus={() => clearFieldError(1, "name")}
          />

          <ProductCategoryDropdown
            value={step2.category}
            onChange={(value) => updateField("category", value)}
            placeholder="Pilih kategori produk"
            label="Kategori Produk"
            error={errors.step2.category}
            onFocus={() => clearFieldError(1, "category")}
          />
        </div>
      </div>

      <TextField
        label={finalLabels.productDescription}
        value={step2.description}
        onChange={(value) => updateField("description", value)}
        placeholder={finalPlaceholders.productDescription}
        multiline
        rows={3}
        error={errors.step2.description}
        onFocus={() => clearFieldError(1, "description")}
      />

      <CurrencyDropdown
        value={step2.currency}
        onChange={(value) => updateField("currency", value)}
        placeholder="Pilih mata uang"
        label="Mata Uang"
        error={errors.step2.currency}
        onFocus={() => clearFieldError(1, "currency")}
      />

      <PriceInput
        value={step2.price}
        onChange={(value) => updateField("price", value)}
        placeholder="Masukkan harga produk"
        label="Harga Produk"
        currency={step2.currency || "IDR"}
        error={errors.step2.price}
        onFocus={() => clearFieldError(1, "price")}
      />

      <TextField
        label={finalLabels.productBenefits}
        value={step2.benefit}
        onChange={(value) => updateField("benefit", value)}
        placeholder={finalPlaceholders.productBenefits}
        error={errors.step2.benefit}
        onFocus={() => clearFieldError(1, "benefit")}
      />

      <TextField
        label={finalLabels.allergenInformation}
        value={step2.allergen}
        onChange={(value) => updateField("allergen", value)}
        placeholder={finalPlaceholders.allergenInformation}
        error={errors.step2.allergen}
        onFocus={() => clearFieldError(1, "allergen")}
      />
    </div>
  );
}
