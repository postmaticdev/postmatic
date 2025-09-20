"use client";

import { BusinessCategoryDropdown } from "@/components/forms/business-category-dropdown";
import { TextField } from "@/components/forms/text-field";
import { UploadPhoto } from "@/components/forms/upload-photo";
import { useManageKnowledge } from "@/contexts/manage-knowledge-context";
import { BusinessKnowledgePld } from "@/models/api/knowledge/business.type";

export function BusinessKnowledgeForm() {
  const { formKnowledge, setFormKnowledge, errors } = useManageKnowledge();

  const updateField = (
    key: keyof BusinessKnowledgePld,
    value: BusinessKnowledgePld[keyof BusinessKnowledgePld]
  ) => {
    setFormKnowledge({
      ...formKnowledge,
      business: { ...formKnowledge.business, [key]: value },
    });
  };

  const defaultLabels = {
    logoBrand: "Logo Bisnis",
    brandName: "Nama Bisnis",
    category: "Kategori Bisnis",
    description: "Deskripsi Bisnis",
    visionMission: "Visi dan Misi",
    uniqueSellingPoint: "Keunikan Bisnis",
    urlWebsite: "Link Website",
    location: "Lokasi Bisnis",
  };

  const defaultPlaceholders = {
    brandName: "Contoh : Postmatic",
    category: "Contoh : Digital Marketing",
    description:
      "Contoh : Bisnis yang menyediakan layanan pembuatan konten untuk media sosial",
    visionMission:
      "Contoh : Menjadi platform pembuatan konten terbaik untuk media sosial",
    uniqueSellingPoint: "Contoh : Automasi pembuatan konten untuk media sosial",
    urlWebsite: "Contoh : https://postmatic.id",
    location: "Contoh : Sleman, Yogyakarta",
  };

  const finalLabels = { ...defaultLabels };
  const finalPlaceholders = { ...defaultPlaceholders };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row w-full gap-6 items-start">
        <UploadPhoto
          label={finalLabels.logoBrand}
          onImageChange={(file: string | null) =>
            setFormKnowledge({
              ...formKnowledge,
              business: { ...formKnowledge.business, primaryLogo: file },
            })
          }
          currentImage={formKnowledge?.business?.primaryLogo}
          error={errors.business.primaryLogo}
        />

        <div className="w-full space-y-4">
          <TextField
            label={finalLabels.brandName}
            value={formKnowledge?.business?.name}
            onChange={(value) => updateField("name", value)}
            placeholder={finalPlaceholders.brandName}
            error={errors.business.name}
          />

          <BusinessCategoryDropdown
            value={formKnowledge?.business?.category}
            onChange={(value) => updateField("category", value)}
            placeholder={finalPlaceholders.category}
            label="Kategori Produk"
            error={errors.business.category}
          />
        </div>
      </div>

      <TextField
        label={finalLabels.description}
        value={formKnowledge?.business?.description}
        onChange={(value) => updateField("description", value)}
        placeholder={finalPlaceholders.description}
        multiline
        rows={3}
        error={errors.business.description}
      />

      <TextField
        label={finalLabels.visionMission}
        value={formKnowledge?.business?.visionMission}
        onChange={(value) => updateField("visionMission", value)}
        placeholder={finalPlaceholders.visionMission}
        multiline
        rows={3}
        error={errors.business.visionMission}
      />

      <TextField
        label={finalLabels.uniqueSellingPoint}
        value={formKnowledge?.business?.uniqueSellingPoint}
        onChange={(value) => updateField("uniqueSellingPoint", value)}
        placeholder={finalPlaceholders.uniqueSellingPoint}
        error={errors.business.uniqueSellingPoint}
      />

      <TextField
        label={finalLabels.urlWebsite}
        value={formKnowledge?.business?.website}
        onChange={(value) => updateField("website", value)}
        placeholder={finalPlaceholders.urlWebsite}
        error={errors.business.website}
      />

      <TextField
        label={finalLabels.location}
        value={formKnowledge?.business?.location}
        onChange={(value) => updateField("location", value)}
        placeholder={finalPlaceholders.location}
        error={errors.business.location}
      />
    </div>
  );
}
