"use client";

import { BusinessCategoryDropdown } from "@/components/forms/business-category-dropdown";
import { TextField } from "@/components/forms/text-field";
import { UploadPhoto } from "@/components/forms/upload-photo";
import { useFormNewBusiness } from "@/contexts/form-new-business-context";
import { BusinessKnowledgePld } from "@/models/api/knowledge/business.type";

export function BusinessKnowledge() {
  const { formData, setFormData, errors, clearFieldError } =
    useFormNewBusiness();
  const { step1 } = formData;

  const updateField = (
    key: keyof BusinessKnowledgePld,
    value: BusinessKnowledgePld[keyof BusinessKnowledgePld]
  ) => {
    setFormData({ ...formData, step1: { ...formData.step1, [key]: value } });
  };

  const defaultLabels = {
    logoBrand: "Logo Bisnis",
    brandName: "Nama Bisnis",
    category: "Kategori Bisnis",
    description1: "Deskripsi Bisnis",
    visionMission: "Visi dan Misi",
    uniqueSellingPoint: "Keunikan Bisnis",
    urlWebsite: "Link Website",
    location: "Lokasi Bisnis",
  };

  const defaultPlaceholders = {
    brandName: "Masukkan nama bisnis",
    category: "Masukkan kategori bisnis",
    description1: "Masukkan deskripsi bisnis",
    visionMission: "Masukkan visi dan misi",
    uniqueSellingPoint: "Masukkan keunikan bisnis",
    urlWebsite: "Masukkan link website",
    location: "Masukkan lokasi bisnis",
  };

  const finalLabels = { ...defaultLabels };
  const finalPlaceholders = { ...defaultPlaceholders };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row w-full gap-6 items-start">
        <UploadPhoto
          label={finalLabels.logoBrand}
          // onImageChange={(file) => updateField("primaryLogo", file)}
          onImageChange={(url: string | null) => {
            setFormData((prev) => ({
              ...prev,
              step1: { ...prev.step1, primaryLogo: url },
            }));
          }}
          currentImage={step1.primaryLogo}
          error={errors.step1.primaryLogo}
          onFocus={() => clearFieldError(0, "primaryLogo")}
        />

        <div className="w-full space-y-4">
          <TextField
            label={finalLabels.brandName}
            value={step1.name}
            onChange={(value) => updateField("name", value)}
            placeholder={finalPlaceholders.brandName}
            error={errors.step1.name}
            onFocus={() => clearFieldError(0, "name")}
          />

          <BusinessCategoryDropdown
            value={step1.category}
            onChange={(value) => updateField("category", value)}
            placeholder="Pilih kategori bisnis"
            label="Kategori Bisnis"
            error={errors.step1.category}
            onFocus={() => clearFieldError(0, "category")}
          />
        </div>
      </div>

      <TextField
        label={finalLabels.description1}
        value={step1.description}
        onChange={(value) => updateField("description", value)}
        placeholder={finalPlaceholders.description1}
        multiline
        rows={3}
        error={errors.step1.description}
        onFocus={() => clearFieldError(0, "description")}
      />

      <TextField
        label={finalLabels.visionMission}
        value={step1.visionMission}
        onChange={(value) => updateField("visionMission", value)}
        placeholder={finalPlaceholders.visionMission}
        multiline
        rows={3}
        error={errors.step1.visionMission}
        onFocus={() => clearFieldError(0, "visionMission")}
      />

      <TextField
        label={finalLabels.uniqueSellingPoint}
        value={step1.uniqueSellingPoint}
        onChange={(value) => updateField("uniqueSellingPoint", value)}
        placeholder={finalPlaceholders.uniqueSellingPoint}
        error={errors.step1.uniqueSellingPoint}
        onFocus={() => clearFieldError(0, "uniqueSellingPoint")}
      />

      <TextField
        label={finalLabels.urlWebsite}
        value={step1.website}
        onChange={(value) => updateField("website", value)}
        placeholder={finalPlaceholders.urlWebsite}
        error={errors.step1.website}
        onFocus={() => clearFieldError(0, "website")}
      />

      <TextField
        label={finalLabels.location}
        value={step1.location}
        onChange={(value) => updateField("location", value)}
        placeholder={finalPlaceholders.location}
        error={errors.step1.location}
        onFocus={() => clearFieldError(0, "location")}
      />
    </div>
  );
}
