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
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { ChevronDown, ChevronUp, Eye, Trash2 } from "lucide-react";
import { useContentGenerate } from "@/contexts/content-generate-context";
import { DEFAULT_PLACEHOLDER_IMAGE } from "@/constants";
import { dateFormat } from "@/helper/date-format";
import { cn } from "@/lib/utils";
import { mapEnumJobStatus } from "@/helper/map-enum-job-status";
import { JobData } from "@/models/socket-content";
import { showToast } from "@/helper/show-toast";
import { mapEnumJobType } from "@/helper/map-enum-job-type";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { useContentJobDeleteHistoryJob } from "@/services/content/content.api";
import { useParams } from "next/navigation";

interface HistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function HistoryModal({ isOpen, onClose }: HistoryModalProps) {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedItemToDelete, setSelectedItemToDelete] =
    useState<JobData | null>(null);
  const { histories, onSelectHistory } = useContentGenerate();

  const toggleExpanded = (itemId: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleView = (item: JobData) => {
    if (item.status === "error") {
      showToast(
        "error",
        "Terdapat kesalahan saat melakukan generate content, silakan coba lagi"
      );
      return;
    }
    onSelectHistory(item);
    onClose();
  };

  const handleDelete = (item: JobData) => {
    setSelectedItemToDelete(item);
    setDeleteModalOpen(true);
  };
  const { businessId } = useParams() as { businessId: string };
  const mutationDelete = useContentJobDeleteHistoryJob();

  const handleDeleteConfirm = async () => {
    if (selectedItemToDelete) {
      // TODO: Implement actual delete logic here
      await mutationDelete.mutateAsync({
        rootBusinessId: businessId,
        jobId: selectedItemToDelete.id,
      });
      showToast("success", "Item berhasil dihapus");
      setDeleteModalOpen(false);
      setSelectedItemToDelete(null);
    }
  };

  const handleDeleteCancel = () => {
    setDeleteModalOpen(false);
    setSelectedItemToDelete(null);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        {/* Header */}
        <DialogHeader>
          <div>
            <DialogTitle>History</DialogTitle>
            <DialogDescription>Lihat history generate anda</DialogDescription>
          </div>
        </DialogHeader>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {histories.map((item, index) => {
            const isExpanded = expandedItems.has(item.productKnowledgeId);

            return (
              <div
                key={item.productKnowledgeId + index}
                className=" pb-3 space-y-4 "
              >
                {/* collapsed header */}
                <div className="border rounded-sm bg-background-secondary">
                  <button
                    onClick={() => toggleExpanded(item.productKnowledgeId)}
                    className="w-full px-3 py-2 flex items-center justify-between text-left"
                  >
                    <div className="flex flex-row items-center space-x-4">
                      <Image
                        src={item.latestImage || DEFAULT_PLACEHOLDER_IMAGE}
                        alt={item.name || ""}
                        width={200}
                        height={200}
                        className="w-12 h-12 rounded-sm"
                      />
                      <div className="flex flex-col gap-1">
                        <span>{item.name}</span>
                        <span className="text-sm text-muted-foreground">
                          Updated at :{" "}
                          {dateFormat.indonesianDate(
                            new Date(item.latestUpdate)
                          )}{" "}
                          {dateFormat.getHhMm(new Date(item.latestUpdate))}
                        </span>
                      </div>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </button>

                  {/* Expanded Content */}
                  {isExpanded && (
                    <div className="border-t border-border space-y-2">
                      {item.jobs.map((item, index) => (
                        <div
                          className="flex p-4 flex-col sm:flex-row sm:items-start gap-3 border-b border-border"
                          key={item.id + index}
                        >
                          <div className="relative w-16 h-16 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            <Image
                              src={
                                item?.result?.images[0] ||
                                item.product?.images[0] ||
                                item?.input?.referenceImage ||
                                item?.input?.rss?.imageUrl ||
                                DEFAULT_PLACEHOLDER_IMAGE
                              }
                              alt={item?.product?.name || ""}
                              fill
                              className="object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <Badge
                                variant={
                                  item.status === "done"
                                    ? "default"
                                    : "secondary"
                                }
                                className={cn(
                                  mapEnumJobStatus.getColor(item.status)
                                )}
                              >
                                {mapEnumJobStatus.getIcon(
                                  item.status,
                                  item.status === "processing"
                                    ? "animate-spin"
                                    : ""
                                )}
                                {mapEnumJobStatus.getLabel(item.status)}
                              </Badge>
                              <Badge variant="outline">
                                {item?.input?.ratio}
                              </Badge>
                              {item?.input?.designStyle && (
                                <Badge variant="outline">
                                  {item?.input?.designStyle}
                                </Badge>
                              )}
                              <Badge variant="outline">
                                {item?.input?.category}
                              </Badge>
                              <Badge variant="outline">
                                {mapEnumJobType.getLabel(item?.type)}
                              </Badge>
                            </div>
                            <div className="flex flex-wrap items-center gap-2 mt-2">
                              <span className="text-sm text-muted-foreground">
                                {dateFormat.indonesianDate(
                                  new Date(item.createdAt)
                                )}{" "}
                                {dateFormat.getHhMm(new Date(item.createdAt))}
                              </span>
                            </div>
                            <div className="mt-2">
                              <span className="text-sm break-words">
                                {item?.input?.caption}
                              </span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center gap-2">
                            <Button
                              variant="outline"
                              className="w-full"
                              size="sm"
                              onClick={() => handleView(item)}
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </Button>
                            <Button
                              variant="destructive"
                              className="w-full"
                              size="sm"
                              onClick={() => handleDelete(item)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Hapus
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <DialogFooterWithButton buttonMessage="Close" onClick={onClose} />
      </DialogContent>

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
        title="Hapus Item"
        description="Apakah Anda yakin ingin menghapus item ini? Tindakan ini tidak dapat dibatalkan."
        itemName={selectedItemToDelete?.product?.name || "Item"}
        withDetailItem={false}
      />
    </Dialog>
  );
}
