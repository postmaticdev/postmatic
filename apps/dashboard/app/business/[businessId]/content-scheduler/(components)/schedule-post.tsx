"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  MoreVertical,
  Edit,
  X,
  AlertTriangle,
  ClipboardClock,
} from "lucide-react";
import { CreatePostModal } from "./create-post-modal";
import { useContentOverviewGetUpcoming } from "@/services/content/overview";
import { useParams } from "next/navigation";
import { dateFormat } from "@/helper/date-format";
import Image from "next/image";
import { DEFAULT_PLACEHOLDER_IMAGE } from "@/constants";
import {
  FormDataDraft,
  initialDirectForm,
  initialEditForm,
  initialQueueForm,
} from "./content-library";
import { UpcomingPostRes } from "@/models/api/content/overview";
import {
  useContentDraftDirectPostFromDraft,
  useContentDraftSetReadyToPost,
  useContentSchedulerManualEditQueue,
  useContentSchedulerManualRemove,
} from "@/services/content/content.api";
import { showToast } from "@/helper/show-toast";
import { NoContent } from "@/components/base/no-content";
import { UpcomingPostsSkeleton } from "@/components/grid-skeleton/upcoming-posts-skeleton";
import { DeleteConfirmationModal } from "@/components/ui/delete-confirmation-modal";

interface PostToCancel {
  type: "auto" | "manual";
  postId: string;
  schedulerManualPostingId: number | null;
}

interface SchedulePostProps {
  onDashboard?: boolean;
}

export function SchedulePost({ onDashboard = false }: SchedulePostProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [postToCancel, setPostToCancel] = useState<PostToCancel | null>(null);
  const [postType, setPostType] = useState<"now" | "schedule">("schedule");
  const { businessId } = useParams() as { businessId: string };
  const [schedulerManualPostingId, setSchedulerManualPostingId] = useState<
    number | null
  >(null);
  const { data: dataUpcoming, isLoading: isLoadingUpcoming } =
    useContentOverviewGetUpcoming(businessId);
  const upcomings = dataUpcoming?.data.data || [];

  const [formDataDraft, setFormDataDraft] = useState<FormDataDraft>({
    direct: initialDirectForm,
    queue: initialQueueForm,
    edit: initialEditForm,
  });

  const onCloseModal = () => {
    setIsModalOpen(false);
    setFormDataDraft({
      direct: initialDirectForm,
      queue: initialQueueForm,
      edit: initialEditForm,
    });
  };

  const handleEditPost = (item: UpcomingPostRes) => {
    setSchedulerManualPostingId(item.schedulerManualPostingId);
    setIsModalOpen(true);
    setFormDataDraft({
      direct: {
        ...initialDirectForm,
        generatedImageContentId: item?.generatedImageContent?.id,
        caption: item.generatedImageContent.caption,
        platforms: item.platforms,
      },
      queue: {
        ...initialQueueForm,
        generatedImageContentId: item?.generatedImageContent?.id,
        dateTime: item.date,
        date: dateFormat.getDdMmYyyy(new Date(item.date)),
        time: dateFormat.getHhMm(new Date(item.date)),
        caption: item.generatedImageContent.caption,
        platforms: item.platforms,
      },
      edit: {
        ...initialEditForm,
        images: item.generatedImageContent.images,
        category: item.generatedImageContent.category,
        designStyle: item.generatedImageContent.designStyle,
        caption: item.generatedImageContent.caption,
        ratio: item.generatedImageContent.ratio,
      },
    });
  };

  const mDirectPostFromDraft = useContentDraftDirectPostFromDraft();
  // const mSchedulePost = useContentSchedulerManualAddToQueue();
  const mSchedulerEdit = useContentSchedulerManualEditQueue();
  const mRemove = useContentSchedulerManualRemove();
  const mReadyToPost = useContentDraftSetReadyToPost();

  const handleCancelQueue = (
    type: "auto" | "manual",
    postId: string,
    schedulerManualPostingId: number | null
  ) => {
    setPostToCancel({ type, postId, schedulerManualPostingId });
    setIsConfirmDialogOpen(true);
  };

  const handleConfirmCancel = async () => {
    try {
      if (postToCancel) {
        if (
          postToCancel.type === "manual" &&
          postToCancel.schedulerManualPostingId
        ) {
          const res = await mRemove.mutateAsync({
            businessId,
            idScheduler: postToCancel.schedulerManualPostingId,
          });
          showToast("success", res.data.responseMessage);
        } else {
          const res = await mReadyToPost.mutateAsync({
            businessId,
            generatedImageContentId: postToCancel.postId,
          });
          showToast("success", res.data.responseMessage);
        }
      }
      setIsConfirmDialogOpen(false);
    } catch {}
  };

  const handleSubmit = async () => {
    try {
      switch (postType) {
        case "now":
          const resDirect = await mDirectPostFromDraft.mutateAsync({
            businessId,
            formData: formDataDraft.direct,
          });
          showToast("success", resDirect.data.responseMessage);
          onCloseModal();
          break;
        case "schedule":
          if (!schedulerManualPostingId) {
            showToast("error", "Terjadi kesalahan saat mengedit penjadwalan");
            return;
          }
          const resSchedule = await mSchedulerEdit.mutateAsync({
            businessId,
            idScheduler: schedulerManualPostingId,
            formData: {
              ...formDataDraft.queue,
              generatedImageContentId:
                formDataDraft.queue.generatedImageContentId,
              caption: formDataDraft.edit.caption,
              dateTime: new Date(
                formDataDraft.queue.date + "T" + formDataDraft.queue.time
              ).toISOString(),
            },
          });
          showToast("success", resSchedule.data.responseMessage);
          onCloseModal();
          break;
      }
    } catch {}
  };

  return (
    <Card className={onDashboard ? "h-fit" : "h-full"}>
      <CardContent className="p-6">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2
              className={
                onDashboard ? "text-lg font-semibold" : "text-2xl font-bold"
              }
            >
              Penjadwalan Postingan
            </h2>
          </div>

          {isLoadingUpcoming ? (
            <UpcomingPostsSkeleton />
          ) : upcomings.length === 0 ? (
            <NoContent
              icon={ClipboardClock}
              title="Tidak ada postingan yang dijadwalkan"
              titleDescription="Tambahkan konten baru"
            />
          ) : (
            <div className="space-y-3 max-h-[calc(100vh-300px)] overflow-y-auto">
              {upcomings.map((post, index) => (
                <Card key={index} className="bg-card">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-lg flex items-center justify-center overflow-hidden">
                        <Image
                          src={post.images[0] || DEFAULT_PLACEHOLDER_IMAGE}
                          alt={post.type}
                          width={48}
                          height={48}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      </div>

                      <div className="flex-1">
                        <div className="font-medium text-sm">
                          {dateFormat.indonesianDate(new Date(post.date))}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {post.type === "auto"
                            ? "Penjadwalan Otomatis"
                            : "Penjadwalan Manual"}{" "}
                          {dateFormat.getHhMm(new Date(post.date))}
                        </div>
                      </div>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {post.type === "manual" && (
                            <DropdownMenuItem
                              onClick={() => handleEditPost(post)}
                            >
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem
                            onClick={() =>
                              handleCancelQueue(
                                post.type,
                                post.generatedImageContent.id,
                                post.schedulerManualPostingId
                              )
                            }
                            className="text-red-600 focus:text-red-600"
                          >
                            <X className="h-4 w-4 mr-2" />
                            Cancel Queue
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </CardContent>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => onCloseModal()}
        onSave={handleSubmit}
        showScheduling={true}
        postType={postType}
        setPostType={setPostType}
        formData={formDataDraft}
        setFormData={setFormDataDraft}
        isLoading={mDirectPostFromDraft.isPending || mSchedulerEdit.isPending}
      />

      {/* Confirmation Dialog */}

      <DeleteConfirmationModal
        isOpen={isConfirmDialogOpen}
        title="Hapus Jadwal Postingan"
        description="Tindakan ini tidak dapat dibatalkan. Jadwal postingan ini akan dihapus secara permanen dari sistem."
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={handleConfirmCancel}
        withDetailItem={false}
        isLoading={mRemove.isPending || mReadyToPost.isPending}
        itemName={postToCancel?.postId || ""}
      />

      {/* <Dialog open={isConfirmDialogOpen} onOpenChange={setIsConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <DialogTitle>Cancel Queue</DialogTitle>
            </div>
            <DialogDescription>
              Are you sure you want to cancel this scheduled post? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsConfirmDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleConfirmCancel}>
              Yes, Cancel Queue
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog> */}
    </Card>
  );
}
