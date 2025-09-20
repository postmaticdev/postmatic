import { api } from "@/config/api";
import { BaseResponse, FilterQuery } from "@/models/api/base-response.type";
import {
  DeleteContentRes,
  DirectPostContentPld,
  DirectPostContentRes,
  EditContentPld,
  GenerateContentBasicPld as GenerateContentKnowledgePld,
  GenerateContentMaskPld,
  GenerateContentRegeneratePld,
  GenerateContentRssPld,
  ImageContentRes,
  PostedImageRes,
  RepostContentPld,
  SaveContentPld,
  SaveContentRes,
  SetReadyToPostRes,
} from "@/models/api/content/image.type";
import {
  AutoSchedulerPld,
  AutoSchedulerRes,
  AutoSchedulerUpserRes,
  QueuePld,
  QueuePostingRes,
  QueueRes,
  TimezoneSettingPld,
  TimezoneSettingRes,
} from "@/models/api/content/scheduler.type";
import { GetAllJob, JobRes } from "@/models/socket-content";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ============================== DRAFT ==============================

const draftService = {
  getAllDraftImage: (
    businessId: string,
    filterQuery?: Partial<FilterQuery>
  ) => {
    return api.get<BaseResponse<ImageContentRes[]>>(
      `/content/image/draft/${businessId}`,
      { params: filterQuery }
    );
  },

  saveDraftContent: (businessId: string, formData: SaveContentPld) => {
    return api.post<BaseResponse<SaveContentRes>>(
      `/content/image/draft/${businessId}`,
      formData
    );
  },

  editDraftContent: (
    businessId: string,
    generatedImageContentId: string,
    formData: EditContentPld
  ) => {
    return api.put<BaseResponse<SaveContentRes>>(
      `/content/image/draft/${businessId}/${generatedImageContentId}`,
      formData
    );
  },

  setReadyToPost: (businessId: string, generateId: string) => {
    return api.patch<BaseResponse<SetReadyToPostRes>>(
      `/content/image/draft/${businessId}/${generateId}`
    );
  },

  directPostFromDraft: (businessId: string, formData: DirectPostContentPld) => {
    return api.post<BaseResponse<DirectPostContentRes[]>>(
      `/content/image/draft/${businessId}/post`,
      formData
    );
  },
  deleteDraft: (generatedImageContentId: string) => {
    return api.delete<BaseResponse<DeleteContentRes>>(
      `/content/image/draft/${generatedImageContentId}`
    );
  },
};

export const useContentDraftGetAllDraftImage = (
  idData: string,
  filterQuery?: Partial<FilterQuery>
) => {
  return useQuery({
    queryKey: ["contentDraftGetAllDraftImage", idData, filterQuery],
    queryFn: () => draftService.getAllDraftImage(idData, filterQuery),
  });
};

export const useContentDraftSaveDraftContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: SaveContentPld;
    }) => draftService.saveDraftContent(businessId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentDraftGetAllDraftImage"],
      });
    },
  });
};

export const useContentDraftEditDraftContent = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      generatedImageContentId,
      formData,
    }: {
      businessId: string;
      generatedImageContentId: string;
      formData: EditContentPld;
    }) =>
      draftService.editDraftContent(
        businessId,
        generatedImageContentId,
        formData
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentDraftGetAllDraftImage"],
      });
    },
  });
};

export const useContentDraftSetReadyToPost = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      generatedImageContentId,
    }: {
      businessId: string;
      generatedImageContentId: string;
    }) => draftService.setReadyToPost(businessId, generatedImageContentId),
    onSuccess: ({}) => {
      queryClient.invalidateQueries({
        queryKey: ["contentDraftGetAllDraftImage"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentOverviewCountUpcoming"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentOverviewUpcoming"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentPostedGetAllPostedImage"],
      });
    },
  });
};

export const useContentDraftDirectPostFromDraft = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: DirectPostContentPld;
    }) => draftService.directPostFromDraft(businessId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentDraftGetAllDraftImage"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentOverviewCountUpcoming"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentOverviewUpcoming"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentPostedGetAllPostedImage"],
      });
    },
  });
};

export const useContentDraftDeleteDraft = (generatedImageContentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => draftService.deleteDraft(generatedImageContentId),
    onSuccess: ({}) => {
      queryClient.invalidateQueries({
        queryKey: ["contentDraftGetAllDraftImage"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentOverviewCountUpcoming"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentOverviewUpcoming"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentPostedGetAllPostedImage"],
      });
    },
  });
};

// ============================== POSTED ==============================

const postedService = {
  getAllPostedImage: (
    businessId: string,
    filterQuery?: Partial<FilterQuery>
  ) => {
    return api.get<BaseResponse<PostedImageRes[]>>(
      `/content/image/posted/${businessId}`,
      { params: filterQuery }
    );
  },
  repost: (businessId: string, formData: RepostContentPld) => {
    return api.post<BaseResponse<PostedImageRes>>(
      `/content/image/posted/${businessId}`,
      formData
    );
  },
};

export const useContentPostedGetAllPostedImage = (
  businessId: string,
  filterQuery?: Partial<FilterQuery>
) => {
  return useQuery({
    queryKey: ["contentPostedGetAllPostedImage", businessId, filterQuery],
    queryFn: () => postedService.getAllPostedImage(businessId, filterQuery),
  });
};

export const useContentPostedRepost = (businessId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: RepostContentPld) =>
      postedService.repost(businessId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentPostedGetAllPostedImage", businessId],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentOverviewCountUpcoming"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentOverviewUpcoming"],
      });
    },
  });
};

// ============================== SCHEDULER AUTO ==============================

const schedulerAutoService = {
  getSettings: (businessId: string) => {
    return api.get<BaseResponse<AutoSchedulerRes>>(
      `/content/scheduler/auto/${businessId}`
    );
  },
  upsertSetting: (businessId: string, formData: AutoSchedulerPld) => {
    return api.post<BaseResponse<AutoSchedulerUpserRes>>(
      `/content/scheduler/auto/${businessId}`,
      formData
    );
  },
};

export const useContentSchedulerAutoGetSettings = (businessId: string) => {
  return useQuery({
    queryKey: ["contentSchedulerAutoGetSettings", businessId],
    queryFn: () => schedulerAutoService.getSettings(businessId),
    enabled: !!businessId,
  });
};

export const useContentSchedulerAutoUpsertSetting = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: AutoSchedulerPld;
    }) => schedulerAutoService.upsertSetting(businessId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentSchedulerAutoGetSettings"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentOverviewUpcoming"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentOverviewCountUpcoming"],
      });
    },
  });
};

// ============================== SCHEDULER MANUAL ==============================

const schedulerManualService = {
  getAllQueue: (businessId: string) => {
    return api.get<BaseResponse<QueuePostingRes[]>>(
      `/content/scheduler/manual/${businessId}`
    );
  },
  addToQueue: (businessId: string, formData: QueuePld) => {
    return api.post<BaseResponse<QueueRes>>(
      `/content/scheduler/manual/${businessId}`,
      formData
    );
  },
  editFromQueue: (
    businessId: string,
    idScheduler: number,
    formData: QueuePld
  ) => {
    return api.put<BaseResponse<QueueRes>>(
      `/content/scheduler/manual/${businessId}/${idScheduler}`,
      formData
    );
  },
  remove: (businessId: string, idScheduler: number) => {
    return api.delete<BaseResponse<QueueRes>>(
      `/content/scheduler/manual/${businessId}/${idScheduler}`
    );
  },
};

export const useContentSchedulerManualGetAllQueue = (businessId: string) => {
  return useQuery({
    queryKey: ["contentSchedulerManualGetAllQueue", businessId],
    queryFn: () => schedulerManualService.getAllQueue(businessId),
  });
};

export const useContentSchedulerManualAddToQueue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: QueuePld;
    }) => schedulerManualService.addToQueue(businessId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentSchedulerManualGetAllQueue"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentDraftGetAllDraftImage"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentOverviewCountUpcoming"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentOverviewUpcoming"],
      });
    },
  });
};
export const useContentSchedulerManualEditQueue = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      idScheduler,
      formData,
    }: {
      businessId: string;
      idScheduler: number;
      formData: QueuePld;
    }) =>
      schedulerManualService.editFromQueue(businessId, idScheduler, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentSchedulerManualGetAllQueue"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentDraftGetAllDraftImage"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentOverviewCountUpcoming"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentOverviewUpcoming"],
      });
    },
  });
};

export const useContentSchedulerManualRemove = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      idScheduler,
    }: {
      businessId: string;
      idScheduler: number;
    }) => schedulerManualService.remove(businessId, idScheduler),
    onSuccess: ({ data }) => {
      queryClient.invalidateQueries({
        queryKey: [
          "contentSchedulerManualGetAllQueue",
          data.data.rootBusinessId,
        ],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentOverviewCountUpcoming"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentOverviewUpcoming"],
      });
      queryClient.invalidateQueries({
        queryKey: ["contentDraftGetAllDraftImage"],
      });
    },
  });
};

// ============================== TIMEZONE ==============================

export const timezoneSchedulerService = {
  getTimezone: (businessId: string) => {
    return api.get<BaseResponse<TimezoneSettingRes>>(
      `/content/scheduler/timezone/${businessId}`
    );
  },
  upsertTimezone: (businessId: string, formData: TimezoneSettingPld) => {
    return api.post<BaseResponse<TimezoneSettingRes>>(
      `/content/scheduler/timezone/${businessId}`,
      formData
    );
  },
};

export const useContentSchedulerTimezoneGetTimezone = (businessId: string) => {
  return useQuery({
    queryKey: ["contentSchedulerTimezoneGetTimezone", businessId],
    queryFn: () => timezoneSchedulerService.getTimezone(businessId),
  });
};

export const useContentSchedulerTimezoneUpsertTimezone = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: TimezoneSettingPld;
    }) => timezoneSchedulerService.upsertTimezone(businessId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentSchedulerTimezoneGetTimezone"],
      });
    },
  });
};

// ============================== JOB ==============================

export const jobContentService = {
  getAllJob: (businessId: string) => {
    return api.get<BaseResponse<GetAllJob[]>>(
      `/content/image/job/${businessId}`
    );
  },
  knowledgeOnJob: (
    businessId: string,
    formData: GenerateContentKnowledgePld
  ) => {
    return api.post<BaseResponse<JobRes>>(
      `/content/image/job/${businessId}/generate`,
      formData
    );
  },
  rssOnJob: (businessId: string, formData: GenerateContentRssPld) => {
    return api.post<BaseResponse<JobRes>>(
      `/content/image/job/${businessId}/rss`,
      formData
    );
  },
  regenerateOnJob: (
    businessId: string,
    formData: GenerateContentRegeneratePld
  ) => {
    return api.post<BaseResponse<JobRes>>(
      `/content/image/job/${businessId}/regenerate`,
      formData
    );
  },

  maskOnJob: (businessId: string, formData: GenerateContentMaskPld) => {
    return api.post<BaseResponse<JobRes>>(
      `/content/image/job/${businessId}/mask`,
      formData
    );
  },
  deleteHistoryJob: (rootBusinessId: string, jobId: string) => {
    return api.delete<BaseResponse<null>>(
      `/content/image/job/${rootBusinessId}/${jobId}`
    );
  },
};

export const useContentJobGetAllJob = (businessId: string) => {
  return useQuery({
    queryKey: ["contentJobGetAllJob"],
    queryFn: () => jobContentService.getAllJob(businessId),
    enabled: !!businessId,
  });
};

export const useContentJobKnowledgeOnJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: GenerateContentKnowledgePld;
    }) => jobContentService.knowledgeOnJob(businessId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentJobGetAllJob"],
      });
    },
  });
};

export const useContentJobRssOnJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: GenerateContentRssPld;
    }) => jobContentService.rssOnJob(businessId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentJobGetAllJob"],
      });
    },
  });
};

export const useContentJobRegenerateOnJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: GenerateContentRegeneratePld;
    }) => jobContentService.regenerateOnJob(businessId, formData),
    onSuccess: ({}) => {
      queryClient.invalidateQueries({
        queryKey: ["contentJobGetAllJob"],
      });
    },
  });
};

export const useContentJobMaskOnJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      businessId,
      formData,
    }: {
      businessId: string;
      formData: GenerateContentMaskPld;
    }) => jobContentService.maskOnJob(businessId, formData),
    onSuccess: ({}) => {
      queryClient.invalidateQueries({
        queryKey: ["contentJobGetAllJob"],
      });
    },
  });
};

export const useContentJobDeleteHistoryJob = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ rootBusinessId, jobId }: { rootBusinessId: string; jobId: string }) => jobContentService.deleteHistoryJob(rootBusinessId, jobId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["contentJobGetAllJob"],
      });
    },
  });
};
