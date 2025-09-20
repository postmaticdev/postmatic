"use client";

import { useState } from "react";
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Info, Plus } from "lucide-react";
import { useFormNewBusiness } from "@/contexts/form-new-business-context";
import { RoleKnowledgePld } from "@/models/api/knowledge/role.type";

export function RoleKnowledge() {
  const { formData, setFormData, errors } = useFormNewBusiness();
  const { step3 } = formData;

  const updateField = (
    key: keyof RoleKnowledgePld,
    value: RoleKnowledgePld[keyof RoleKnowledgePld]
  ) => {
    setFormData({ ...formData, step3: { ...formData.step3, [key]: value } });
  };

  const [currentHashtag, setCurrentHashtag] = useState("");

  const addHashtag = () => {
    if (currentHashtag.trim()) {
      let hashtag = currentHashtag.trim();
      if (hashtag?.startsWith("#")) {
        hashtag = hashtag.slice(1);
      }
      updateField("hashtags", [...step3.hashtags, hashtag]);
      setCurrentHashtag("");
    }
  };

  const removeHashtag = (index: number) => {
    updateField(
      "hashtags",
      step3.hashtags.filter((_, i) => i !== index)
    );
  };

  const defaultLabels = {
    targetAudience: "Sasaran Audiens",
    contentTone: "Nuansa Konten",
    persona: "Persona",
    hashtags: "Hashtag",
    callToAction: "Ajakan Bertindak",
    goals: "Tujuan Konten",
  };

  const defaultPlaceholders = {
    targetAudience: "Contoh : Pemilik UMKM",
    contentTone: "Contoh : Intuitif",
    persona: "Contoh : Pemilik UMKM",
    hashtagInput: "Contoh : #UMKM, #Bisnis, #DigitalMarketing",
    callToAction: "Contoh : Klik untuk melihat produk",
    goals: "Contoh : Meningkatkan penjualan",
  };

  const finalLabels = { ...defaultLabels };
  const finalPlaceholders = { ...defaultPlaceholders };

  return (
    <div className="space-y-4">
      <TextField
        label={finalLabels.targetAudience}
        value={step3.targetAudience}
        onChange={(value) => updateField("targetAudience", value)}
        placeholder={finalPlaceholders.targetAudience}
        error={errors.step3.targetAudience}
      />

      <TextField
        label={finalLabels.contentTone}
        value={step3.tone}
        onChange={(value) => updateField("tone", value)}
        placeholder={finalPlaceholders.contentTone}
        error={errors.step3.tone}
      />

      <TextField
        label={finalLabels.persona}
        value={step3.audiencePersona}
        onChange={(value) => updateField("audiencePersona", value)}
        placeholder={finalPlaceholders.persona}
        error={errors.step3.audiencePersona}
      />

      <div className="">
        <label className="text-sm font-medium text-foreground">
          {finalLabels.hashtags}
        </label>
        <div className="flex gap-2 mt-1">
          <Input
            value={currentHashtag}
            onChange={(e) => setCurrentHashtag(e.target.value)}
            placeholder={finalPlaceholders.hashtagInput}
            className={`flex-1 bg-background-secondary ${
              errors.step3.hashtags ? "border-red-500 focus:border-red-500" : ""
            }`}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " " || e.key === ",") {
                e.preventDefault();
                addHashtag();
              }
            }}
          />
          <Button type="button" onClick={addHashtag} className="px-3">
            <Plus className="w-4 h-4" color="white" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2 ">
          {step3.hashtags.map((hashtag, index) => (
            <span
              key={index}
              className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm flex items-center gap-1"
            >
              #{hashtag}
              <button
                type="button"
                onClick={() => removeHashtag(index)}
                className="text-blue-600 hover:text-blue-800"
              >
                ×
              </button>
            </span>
          ))}
        </div>
        {errors.step3.hashtags && (
          <div className="flex items-center mt-1 gap-1">
            <Info className="w-4 h-4 text-red-500" />
            <p className="text-sm text-red-500">{errors.step3.hashtags}</p>
          </div>
        )}
      </div>

      <TextField
        label={finalLabels.callToAction}
        value={step3.callToAction}
        onChange={(value) => updateField("callToAction", value)}
        placeholder={finalPlaceholders.callToAction}
        error={errors.step3.callToAction}
      />

      <TextField
        label={finalLabels.goals}
        value={step3.goals}
        onChange={(value) => updateField("goals", value)}
        placeholder={finalPlaceholders.goals}
        error={errors.step3.goals}
      />
    </div>
  );
}
