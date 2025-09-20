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
import { TextField } from "@/components/forms/text-field";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Plus } from "lucide-react";
import { AddRssPld } from "@/models/api/knowledge/rss.type";
import {
  useLibraryRSSCategory,
  useLibraryRSSData,
} from "@/services/library.api";

interface RSSModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (rssData: AddRssPld & { id: string }) => void;
  mode: "add" | "edit";
  formValue: AddRssPld & { id: string; masterRssCategoryId: string };
  onChange: (rssData: AddRssPld & { id: string }) => void;
  errors?: Record<string, string>;
}

export function RSSModal({
  isOpen,
  onClose,
  onSave,
  mode,
  formValue,
  onChange,
  errors = {},
}: RSSModalProps) {
  const [rssAction, setRssAction] = useState<"add" | "edit" | "select">(mode);

  const { data: rssCategoryLib } = useLibraryRSSCategory();
  const { data: rssDataLib } = useLibraryRSSData({
    sortBy: "title",
    sort: "asc",
    category: formValue.masterRssCategoryId,
  });

  const categoryLib = rssCategoryLib?.data.data || [];
  const dataLib = rssDataLib?.data.data || [];

  const updateRssField = (
    field: keyof (AddRssPld & { id: string; masterRssCategoryId: string }),
    value: string | boolean
  ) => {
    onChange({ ...formValue, [field]: value });
  };

  const handleSave = () => {
    onSave(formValue);
  };

  const isEditMode = mode === "edit";
  const title = isEditMode ? "Edit RSS" : "Tambah RSS";
  const description = isEditMode
    ? "Update RSS feed information"
    : "Add new RSS feed to your knowledge base";
  const buttonText = isEditMode ? "Simpan Perubahan" : "Tambah";

  const selectedRssUrl =
    dataLib.find((data) => data.id === formValue.masterRssId)?.url || "";

    const placeholders = {
      title: "Contoh : Kesehatan",
      masterRssCategoryId: "Contoh : Health",
      masterRssId: "Contoh : ANTARA News",
      urlPreview: "URL preview akan otomatis tergenerate",
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
          {rssAction === "select" && mode === "add" && (
            <div className="space-y-4">
              <div className="flex gap-4">
                <Button
                  onClick={() => setRssAction("add")}
                  className="bg-blue-600 hover:bg-blue-700 flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Add RSS
                </Button>
                <Button onClick={() => setRssAction("edit")} variant="outline">
                  Edit RSS
                </Button>
              </div>
            </div>
          )}

          {(rssAction === "add" ||
            (rssAction === "edit" && mode === "add") ||
            mode === "edit") && (
            <div className="space-y-6">
              <TextField
                label="Judul Feed"
                value={formValue?.title}
                onChange={(value) => updateRssField("title", value)}
                placeholder={placeholders.title}
                error={errors.title}
              />

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Kategori
                </label>
                <Select
                  value={formValue.masterRssCategoryId}
                  onValueChange={(value) =>
                    updateRssField("masterRssCategoryId", value)
                  }
                >
                  <SelectTrigger className={errors.masterRssCategoryId ? "border-red-500" : ""}>
                    <SelectValue placeholder={placeholders.masterRssCategoryId} />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryLib.map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.masterRssCategoryId && (
                  <p className="text-sm text-red-500">{errors.masterRssCategoryId}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Sumber RSS
                </label>
                <Select
                  value={formValue.masterRssId}
                  onValueChange={(value) =>
                    updateRssField("masterRssId", value)
                  }
                >
                  <SelectTrigger className={errors.masterRssId ? "border-red-500" : ""}>
                    <SelectValue placeholder={placeholders.masterRssId} />
                  </SelectTrigger>
                  <SelectContent>
                    {dataLib.map((data) => (
                      <SelectItem key={data.id} value={data.id}>
                        {data.title} ({data.publisher?.toUpperCase()})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.masterRssId && (
                  <p className="text-sm text-red-500">{errors.masterRssId}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground">
                  Url Preview
                </label>
                <input
                  type="text"
                  value={selectedRssUrl}
                  placeholder={placeholders.urlPreview}
                  disabled
                  className="w-full px-3 py-2 border border-input bg-muted rounded-md text-sm text-muted-foreground cursor-not-allowed"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="rss-active"
                  checked={formValue.isActive}
                  onCheckedChange={(checked) =>
                    updateRssField("isActive", checked)
                  }
                />
                <label
                  htmlFor="rss-active"
                  className="text-sm font-medium text-foreground"
                >
                  Active
                </label>
              </div>
            </div>
          )}
        </div>

        <DialogFooterWithButton
          buttonMessage={buttonText}
          onClick={handleSave}
        />
      </DialogContent>
    </Dialog>
  );
}
