"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  MoreVertical,
  Plus,
  Edit,
  Trash2,
  Search,
  TrendingUp,
} from "lucide-react";
import Image from "next/image";
import { RSSModal } from "./rss-modal";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  useRssKnowledgeCreate,
  useRssKnowledgeDelete,
  useRssKnowledgeGetById,
  useRssKnowledgeUpdate,
} from "@/services/knowledge.api";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { AddRssPld, RssRes } from "@/models/api/knowledge/rss.type";
import { showToast } from "@/helper/show-toast";
import { NoContent } from "@/components/base/no-content";
import { SearchNotFound } from "@/components/base/search-not-found";
import { getRssSourceImage } from "@/helper/rss-image-helper";
import { rssKnowledgeSchema } from "@/validator/new-business";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";
import { useRole } from "@/contexts/role-context";

const initialRSS: AddRssPld & { id?: string } = {
  title: "",
  masterRssId: "",
  isActive: true,
  id: "",
};

interface RSSTrendSectionProps {
  openRssModal?: boolean;
}

export function RSSTrendSection({
  openRssModal = false,
}: RSSTrendSectionProps) {
  const { businessId } = useParams() as { businessId: string };
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"add" | "edit">("add");
  const [selectedRSS, setSelectedRSS] = useState<
    AddRssPld & { id?: string; masterRssCategoryId?: string }
  >(initialRSS);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { access } = useRole();
  const { rssKnowledge } = access;
  const [searchQuery, setSearchQuery] = useState("");
  const [rssErrors, setRssErrors] = useState<Record<string, string>>({});

  const { data: rssData } = useRssKnowledgeGetById(businessId, {
    search: searchQuery,
    sortBy: "title",
    sort: "asc",
  });

  const rss = rssData?.data.data || [];

  const mRssKnowledgeUpdate = useRssKnowledgeUpdate();
  const mRssKnowledgeCreate = useRssKnowledgeCreate();
  const mRssKnowledgeDelete = useRssKnowledgeDelete();

  const handleAddRSS = () => {
    setModalMode("add");
    setSelectedRSS(initialRSS);
    setRssErrors({});
    setIsModalOpen(true);
  };

  // Auto-open modal when openRssModal prop is true
  useEffect(() => {
    if (openRssModal) {
      handleAddRSS();
      // Clear the URL parameter after opening the modal
      const newSearchParams = new URLSearchParams(searchParams.toString());
      newSearchParams.delete("openRssModal");
      const newUrl = newSearchParams.toString()
        ? `${window.location.pathname}?${newSearchParams.toString()}`
        : window.location.pathname;
      router.replace(newUrl);
    }
  }, [openRssModal, searchParams, router]);

  const handleEditRSS = (rss: RssRes) => {
    console.log("Editing RSS:", rss);
    setModalMode("edit");
    setSelectedRSS({
      isActive: rss.isActive,
      masterRssId: rss.masterRssId,
      title: rss.title,
      id: rss.id,
      masterRssCategoryId: rss.masterRss.masterRssCategory.id,
    });
    setRssErrors({});
    setIsModalOpen(true);
  };

  const handleDeleteRSS = async (rss: RssRes) => {
    try {
      const res = await mRssKnowledgeDelete.mutateAsync(rss.id);
      showToast("success", res.data.responseMessage);
      setIsDeleteModalOpen(false);
      setSelectedRSS(initialRSS); // Reset selectedRSS after deletion
    } catch {}
  };

  const handleOpenDeleteModal = (rss: RssRes) => {
    setSelectedRSS(rss);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedRSS(initialRSS); // Reset selectedRSS when closing modal
  };

  const handleToggleStatus = async (rssKnowledgeId: string) => {
    try {
      const findRss = rss.find((r) => r.id === rssKnowledgeId);
      if (findRss) {
        const res = await mRssKnowledgeUpdate.mutateAsync({
          rssKnId: rssKnowledgeId,
          formData: {
            ...findRss,
            isActive: !findRss.isActive,
          },
        });
        showToast("success", res.data.responseMessage);
      }
    } catch {}
  };

  const handleSaveRSS = async (item: AddRssPld & { id?: string }) => {
    try {
      // Validate form data
      const result = rssKnowledgeSchema.safeParse(item);
      if (!result.success) {
        const validationErrors: Record<string, string> = {};
        result.error.issues.forEach((error) => {
          validationErrors[error.path[0] as string] = error.message;
        });
        setRssErrors(validationErrors);
        throw new Error("Harap perbaiki data yang tidak valid");
      }

      // Clear errors if validation passes
      setRssErrors({});

      if (item.id) {
        const res = await mRssKnowledgeUpdate.mutateAsync({
          rssKnId: item.id,
          formData: item,
        });
        showToast("success", res.data.responseMessage);
      } else {
        const res = await mRssKnowledgeCreate.mutateAsync({
          businessId,
          formData: item,
        });
        showToast("success", res.data.responseMessage);
      }
      setIsModalOpen(false);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Harap perbaiki data yang tidak valid"
      ) {
        // Validation errors are already set, don't show toast
        return;
      }
      showToast("error", "Gagal menyimpan RSS");
    }
  };

  return (
    <>
      <Card>
        <CardContent className="py-6">
          <div className="space-y-4">
            <div className="flex flex-col gap-4">
              <h2 className="text-lg font-semibold text-foreground">
                Sumber Tren RSS
              </h2>

              {/* Search and Add Button */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Cari sumber RSS..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-background"
                  />
                </div>
                {rssKnowledge.write && (
                  <Button
                    className="bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2 whitespace-nowrap"
                    onClick={handleAddRSS}
                  >
                    <Plus className="w-4 h-4" />
                    Tambah Sumber RSS
                  </Button>
                )}
              </div>
            </div>

            {rss.length === 0 && searchQuery === "" ? (
              <NoContent
                icon={TrendingUp}
                title="Belum ada sumber RSS"
                titleDescription="Tambahkan sumber RSS untuk mendapatkan tren terbaru"
                buttonText="Tambah Sumber RSS"
                onButtonClick={handleAddRSS}
              />
            ) : rss.length === 0 ? (
              <SearchNotFound description=" atau tambah sumber RSS baru" />
            ) : (
              <div
                className={`space-y-3 ${
                  rss.length > 3 ? "max-h-[500px] overflow-y-auto " : ""
                }`}
              >
                {rss.map((trend) => (
                  <Card key={trend.id} className="bg-background-secondary">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className=" w-10 h-10  lg:w-16 lg:h-16 rounded-lg overflow-hidden flex-shrink-0">
                          <Image
                            src={getRssSourceImage(trend?.masterRss?.publisher)}
                            alt={trend.title}
                            width={40}
                            height={40}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col lg:flex-row lg:gap-2">
                            <h3 className="font-medium text-foreground mb-1">
                              {trend.title}
                            </h3>

                            <div className="flex items-center gap-2 mb-1">
                              <span className="bg-pink-100 text-pink-800 text-xs px-2 py-1 rounded-full">
                                {trend?.masterRss?.masterRssCategory?.name}
                              </span>
                            </div>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">
                            Source: {trend?.masterRss?.publisher?.toUpperCase()}
                          </p>

                          {/* Status Toggle */}
                          <div className="flex items-center gap-3">
                            {rssKnowledge.write && (
                              <Switch
                                checked={trend.isActive}
                                onCheckedChange={() =>
                                  handleToggleStatus(trend.id)
                                }
                                className="data-[state=checked]:bg-primary"
                              />
                            )}
                            <span className="text-sm font-medium text-foreground">
                              Status:{" "}
                              <span
                                className={
                                  trend.isActive
                                    ? "text-primary"
                                    : "text-muted-foreground"
                                }
                              >
                                {trend.isActive ? "Aktif" : "Tidak Aktif"}
                              </span>
                            </span>
                          </div>
                        </div>

                        {rssKnowledge.write && (
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-8 w-8 p-0"
                              >
                                <MoreVertical className="w-4 h-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem
                                onClick={() =>
                                  handleEditRSS({
                                    ...trend,
                                    id: trend.id,
                                  })
                                }
                              >
                                <Edit className="w-4 h-4 mr-2" />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => handleOpenDeleteModal(trend)}
                                className="text-red-600"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <RSSModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setRssErrors({});
        }}
        onSave={handleSaveRSS}
        mode={modalMode}
        formValue={{
          id: selectedRSS?.id || "",
          masterRssCategoryId: selectedRSS?.masterRssCategoryId || "",
          masterRssId: selectedRSS?.masterRssId || "",
          title: selectedRSS?.title || "",
          isActive: selectedRSS?.isActive || true,
        }}
        onChange={setSelectedRSS}
        errors={rssErrors}
      />
      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDeleteModal}
        onConfirm={() => handleDeleteRSS(selectedRSS as RssRes)}
        title="Hapus Sumber RSS"
        description="Apakah Anda yakin ingin menghapus sumber RSS ini? Tindakan ini tidak dapat dibatalkan."
        itemName={selectedRSS?.title || "RSS"}
        isLoading={mRssKnowledgeDelete.isPending}
      />
    </>
  );
}
