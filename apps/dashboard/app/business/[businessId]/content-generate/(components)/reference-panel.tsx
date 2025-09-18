"use client";

import { useState, useCallback } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, Plus, Loader2 } from "lucide-react";
import { ReferenceFullviewModal } from "./reference-fullview-modal";
import {
  PaginationControls,
  PaginationWithControls,
} from "@/components/ui/pagination";
import {
  Template,
  useContentGenerate,
} from "@/contexts/content-generate-context";
import { TemplateCard } from "./template-card";
import { helperService } from "@/services/helper.api";
import { showToast } from "@/helper/show-toast";
import { TemplateGridSkeleton } from "@/components/grid-skeleton/template-grid-skeleton";

export function ReferencePanel() {
  const [activeTab, setActiveTab] = useState<"reference" | "saved">(
    "reference"
  );

  const [dragActive, setDragActive] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );

  const { publishedTemplates, savedTemplates, form } = useContentGenerate();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setIsUploading(true);
      setUploadProgress(0);
      
      try {
        // Simulate progress
        const progressInterval = setInterval(() => {
          setUploadProgress(prev => Math.min(prev + 20, 90));
        }, 300);
        
        // Handle file upload here
        console.log("Uploading file:", file.name);
        const response = await helperService.uploadSingleImage({
          image: file,
        });
        
        clearInterval(progressInterval);
        setUploadProgress(100);
        
        form.setBasic({
          ...form.basic,
          referenceImage: response,
          referenceImageName: file.name
        });
        
        // Show success message
        showToast("success", "Image uploaded successfully");
        
        // Scroll to the selected reference image after a short delay
        setTimeout(() => {
          const selectedRef = document.getElementById('selected-reference-image');
          if (selectedRef) {
            selectedRef.scrollIntoView({ behavior: 'smooth' });
          }
        }, 500);
      } catch (err) {
        console.error("Upload error:", err);
        showToast("error", "Failed to upload image");
      } finally {
        setTimeout(() => {
          setIsUploading(false);
          setUploadProgress(0);
        }, 1000); // Keep the 100% progress visible briefly
      }
    }
  }, [form]);

  const handleFileInput = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setIsUploading(true);
        setUploadProgress(0);
        
        try {
          // Simulate progress
          const progressInterval = setInterval(() => {
            setUploadProgress(prev => Math.min(prev + 20, 90));
          }, 300);
          
          // Handle file upload here
          console.log("Uploading file:", file.name);
          const response = await helperService.uploadSingleImage({
            image: file,
          });
          
          clearInterval(progressInterval);
          setUploadProgress(100);
          
          form.setBasic({
            ...form.basic,
            referenceImage: response,
            referenceImageName: file.name
          });
          
          // Show success message
          showToast("success", "Image uploaded successfully");
          
          // Scroll to the selected reference image after a short delay
          setTimeout(() => {
            const selectedRef = document.getElementById('selected-reference-image');
            if (selectedRef) {
              selectedRef.scrollIntoView({ behavior: 'smooth' });
            }
          }, 500);
        } catch (err) {
          console.error("Upload error:", err);
          showToast("error", "Failed to upload image");
        } finally {
          setTimeout(() => {
            setIsUploading(false);
            setUploadProgress(0);
          }, 1000); // Keep the 100% progress visible briefly
        }
      }
    },
    [form]
  );

  const onDetail = useCallback((item: Template | null) => {
    setSelectedTemplate(item);
    setIsDetailDialogOpen(true);
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Tab Bar */}
      <div className="p-4 sm:p-6">
        <div className="flex justify-center">
          <div className="flex bg-background rounded-lg  w-full">
            <button
              onClick={() => setActiveTab("reference")}
              className={`px-4 py-3 text-sm font-medium rounded-md transition-colors w-1/2 ${
                activeTab === "reference"
                  ? "bg-blue-500 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Reference
            </button>
            <button
              onClick={() => setActiveTab("saved")}
              className={`px-4 py-3 text-sm font-medium rounded-md transition-colors w-1/2 ${
                activeTab === "saved"
                  ? "bg-blue-500 text-white"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Saved Reference
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 px-4 sm:px-6 pb-6 overflow-y-auto">
        {activeTab === "reference" && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Cari referensi di sini..."
                value={publishedTemplates.filterQuery?.search || ""}
                onChange={(e) =>
                  publishedTemplates.setFilterQuery({
                    ...publishedTemplates?.filterQuery,
                    search: e.target.value,
                  })
                }
                className="pl-10"
              />
            </div>

            {/* Pagination Controls */}
            <PaginationWithControls
              pagination={publishedTemplates.pagination}
              filterQuery={publishedTemplates.filterQuery}
              currData={publishedTemplates.contents.length}
              setFilterQuery={publishedTemplates.setFilterQuery}
              showSort={false}
            />

            {/* Template Grid */}
            {publishedTemplates.isLoading ? (
              <TemplateGridSkeleton />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {publishedTemplates?.contents.map((template, index) => (
                  <TemplateCard
                    item={template}
                    key={index + template.id}
                    onDetail={onDetail}
                  />
                ))}
              </div>
            )}
            <PaginationControls
              pagination={publishedTemplates.pagination}
              filterQuery={publishedTemplates.filterQuery}
              setFilterQuery={publishedTemplates.setFilterQuery}
            />
          </div>
        )}

        {activeTab === "saved" && (
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Telusuri referensi yang disimpan..."
                value={savedTemplates.filterQuery?.search || ""}
                onChange={(e) =>
                  savedTemplates.setFilterQuery({
                    ...savedTemplates?.filterQuery,
                    search: e.target.value,
                  })
                }
                className="pl-10"
              />
            </div>

            <PaginationWithControls
              pagination={savedTemplates.pagination}
              filterQuery={savedTemplates.filterQuery}
              currData={savedTemplates.contents.length}
              setFilterQuery={savedTemplates.setFilterQuery}
            />
            {/* Saved References Grid */}
            {savedTemplates.isLoading ? (
              <TemplateGridSkeleton />
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {/* Upload Card */}
                <Card className="p-3">
                  <div
                    className={`h-65 sm:h-100 xl:h-88 w-full rounded-lg overflow-hidden border-2 border-dashed transition-colors flex items-center justify-center ${
                      dragActive
                        ? "border-blue-500 bg-background"
                        : isUploading
                        ? "border-blue-300 bg-background"
                        : "border-border bg-background-secondary"
                    }`}
                    onDragEnter={!isUploading ? handleDrag : undefined}
                    onDragLeave={!isUploading ? handleDrag : undefined}
                    onDragOver={!isUploading ? handleDrag : undefined}
                    onDrop={!isUploading ? handleDrop : undefined}
                  >
                    <div className="flex flex-col items-center justify-center text-center p-4 w-full">
                      {isUploading ? (
                        <>
                          <Loader2 className="h-8 w-8 text-blue-500 mb-2 animate-spin" />
                          <p className="text-sm text-blue-600 mb-2">
                            Uploading image...
                          </p>
                          <div className="w-full max-w-xs bg-background rounded-full h-2.5 mb-1">
                            <div 
                              className="bg-blue-500 h-2.5 rounded-full transition-all duration-300" 
                              style={{ width: `${uploadProgress}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500">{uploadProgress}%</p>
                        </>
                      ) : (
                        <>
                          <Upload className="h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-muted-foreground mb-2">
                            Drag & drop an image here
                          </p>
                          <p className="text-xs text-muted-foreground mb-3">or</p>
                          <label htmlFor="file-upload" className="cursor-pointer">
                            <Button
                              size="sm"
                              className="bg-blue-500 hover:bg-blue-600 text-white"
                              asChild
                            >
                              <span>
                                <Plus className="h-4 w-4 mr-1" />
                                Browse Files
                              </span>
                            </Button>
                            <input
                              id="file-upload"
                              type="file"
                              accept="image/*"
                              className="hidden"
                              onChange={handleFileInput}
                              disabled={isUploading}
                            />
                          </label>
                        </>
                      )}
                    </div>
                  </div>
                </Card>

                {savedTemplates?.contents?.map((reference, index) => (
                  <TemplateCard
                    item={reference}
                    key={index + reference.id}
                    onDetail={onDetail}
                  />
                ))}
              </div>
            )}
            <PaginationControls
              pagination={savedTemplates.pagination}
              filterQuery={savedTemplates.filterQuery}
              setFilterQuery={savedTemplates.setFilterQuery}
            />
          </div>
        )}
      </div>

      {/* Detail Reference Dialog */}

      <ReferenceFullviewModal
        isOpen={isDetailDialogOpen}
        onClose={() => setIsDetailDialogOpen(false)}
        template={selectedTemplate}
      />
    </div>
  );
}
