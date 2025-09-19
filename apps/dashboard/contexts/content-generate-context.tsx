"use client";

import { ACCESS_TOKEN_KEY } from "@/constants";
import { showToast } from "@/helper/show-toast";
import { createSocket, destroySocket, getSocket } from "@/lib/socket";
import { FilterQuery, Pagination } from "@/models/api/base-response.type";
import {
  AdvancedGenerate,
  GenerateContentAdvanceBase,
  GenerateContentBase,
  GenerateContentRes,
  GenerateContentRssBase,
} from "@/models/api/content/image.type";
import { ProductKnowledgeRes } from "@/models/api/knowledge/product.type";
import { RssArticleRes } from "@/models/api/library/rss.type";
import {
  PublishedTemplateRes,
  SavedTemplateRes,
} from "@/models/api/library/template.type";
import {
  GetAllJob,
  JobData,
  JobStage,
  JobStatus,
} from "@/models/socket-content";
import {
  useContentDraftSaveDraftContent,
  useContentJobGetAllJob,
  useContentJobKnowledgeOnJob,
  useContentJobMaskOnJob,
  useContentJobRegenerateOnJob,
  useContentJobRssOnJob,
} from "@/services/content/content.api";
import {
  useProductKnowledgeGetAll,
  useProductKnowledgeGetStatus,
} from "@/services/knowledge.api";
import {
  useLibraryRSSArticle,
  useLibraryTemplateDeleteSaved,
  useLibraryTemplateGetPublished,
  useLibraryTemplateGetSaved,
  useLibraryTemplateSave,
} from "@/services/library.api";
import { useQueryClient } from "@tanstack/react-query";
import { useParams, usePathname, useRouter } from "next/navigation";
import {
  Dispatch,
  SetStateAction,
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { toast } from "sonner";

export interface Template {
  id: string;
  name: string;
  imageUrl: string;
  categories: string[];
  publisher: string;
  createdAt: string;
  updatedAt: string;
  price: 0; // TODO: belum ada price
  type: "saved" | "published";
}

export type ContentMode = "knowledge" | "regenerate" | "mask" | "rss";
export type TabMode = "knowledge" | "rss";

interface BasicForm extends GenerateContentBase {
  productName: string;
  productImage: string;
  customCategory: string;
  customDesignStyle: string;
  referenceImageName: string | null;
  caption: string;
}

interface ContentGenerateContext {
  // FORM
  form: {
    basic: BasicForm;
    advance: GenerateContentAdvanceBase;
    rss: GenerateContentRssBase | null;
    setBasic: (item: BasicForm) => void;
    setAdvance: (item: GenerateContentAdvanceBase) => void;
    onRssSelect: (item: GenerateContentRssBase | null) => void;
    enabledAdvance: AdvancedGenerate;
    setEnabledAdvance: (item: AdvancedGenerate) => void;
    mask: string | null;
    setMask: Dispatch<SetStateAction<string | null>>;
  };

  // SELECTED TEMPLATE
  selectedTemplate: Template | null;
  setSelectedTemplate: (template: Template | null) => void;

  // MODE / HELPER
  mode: ContentMode;
  setMode: (item: "knowledge" | "regenerate" | "mask" | "rss") => void;
  tab: TabMode;
  setTab: (item: TabMode) => void;
  isLoading: boolean;
  setIsLoading: (item: boolean) => void;

  // UNSAVE MODAL
  unsaveModal: {
    isOpen: boolean;
    item: Template | null;
    isLoading: boolean;
  };
  setUnsaveModal: (modal: {
    isOpen: boolean;
    item: Template | null;
    isLoading: boolean;
  }) => void;

  //   // TEMPLATE / LIBRARY
  savedTemplates: {
    contents: Template[];
    pagination: Pagination;
    filterQuery: Partial<FilterQuery>;
    setFilterQuery: (q: Partial<FilterQuery>) => void;
    isLoading: boolean;
  };
  publishedTemplates: {
    contents: Template[];
    pagination: Pagination;
    filterQuery: Partial<FilterQuery>;
    setFilterQuery: (q: Partial<FilterQuery>) => void;
    isLoading: boolean;
  };
  productKnowledges: {
    contents: ProductKnowledgeRes[];
    pagination: Pagination;
    filterQuery: Partial<FilterQuery>;
    setFilterQuery: (q: Partial<FilterQuery>) => void;
  };

  // Library
  rssArticles: RssArticleRes[];

  // History
  histories: GetAllJob[];
  selectedHistory: JobData | null;
  onSelectHistory: (item: JobData | null) => void;

  // Draft saved state
  isDraftSaved: boolean;
  setIsDraftSaved: (saved: boolean) => void;

  //   // HANDLER
  onSaveUnsave: (item: Template) => void;
  onConfirmUnsave: () => void;
  onCloseUnsaveModal: () => void;
  onSelectProduct: (item: ProductKnowledgeRes | null) => void;
  onSelectReferenceImage: (
    imageUrl: string,
    imageName: string | null,
    template?: Template
  ) => void;
  onSubmitGenerate: (overrides?: {
    mode?: ContentMode;
    maskUrl?: string;
  }) => void;
  onSaveDraft: () => void;
  onResetAdvance: () => void;

  // // Socket
  socketEvent: {
    isConnected: boolean;
  };
}

const initialEnabledAdvance: ContentGenerateContext["form"]["enabledAdvance"] =
  {
    businessKnowledge: {
      name: false,
      category: false,
      description: false,
      location: false,
      uniqueSellingPoint: false,
      visionMission: false,
      website: false,
      logo: false,
    },
    productKnowledge: {
      name: false,
      category: false,
      description: false,
      price: false,
    },
    roleKnowledge: {
      hashtags: false,
    },
  };

const initialFormBasic: ContentGenerateContext["form"]["basic"] = {
  category: "Default",
  designStyle: "Default",
  productKnowledgeId: "",
  prompt: "",
  ratio: "1:1",
  referenceImage: null,
  productName: "",
  productImage: "",
  customCategory: "",
  customDesignStyle: "",
  referenceImageName: null,
  caption: "",
};

const initialFormAdvance: GenerateContentAdvanceBase = {
  businessKnowledge: {
    category: false,
    description: false,
    location: false,
    name: false,
    uniqueSellingPoint: false,
    visionMission: false,
    website: false,
    logo: false,
  },
  productKnowledge: {
    category: false,
    description: false,
    name: false,
    price: false,
  },
  roleKnowledge: {
    hashtags: false,
  },
};

const initialPagination: Pagination = {
  limit: 10,
  page: 1,
  total: 0,
  totalPages: 0,
  hasNextPage: false,
  hasPrevPage: false,
};

const ContentGenerateContext = createContext<
  ContentGenerateContext | undefined
>(undefined);

export const ContentGenerateProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  /**
   *
   * GLOBAL
   *
   */
  const { businessId } = useParams() as { businessId: string };
  const queryClient = useQueryClient();
  const pathname = usePathname();
  /**
   *
   * LIBRARY HISTORY
   *
   */

  const { data: historiesRes, refetch: refetchHistories } =
    useContentJobGetAllJob(businessId);

  const [histories, setHistories] = useState<GetAllJob[]>([]);

  //DEBUG
  const flattenedHistories = useMemo(() => {
    return histories.flatMap((item) => item.jobs);
  }, [histories]);
  const findMaskGenerated = useMemo(() => {
    return flattenedHistories.find((item) => item.type === "mask");
  }, [flattenedHistories]);
  console.log("findMaskGenerated", findMaskGenerated);

  useEffect(() => {
    if (historiesRes) {
      setHistories(historiesRes?.data?.data || []);
    }
  }, [historiesRes]);

  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const selectedHistory = useMemo(() => {
    if (!selectedJobId) return null;
    return (
      histories
        .flatMap((item) => item.jobs)
        .find((job) => job.id === selectedJobId) || null
    );
  }, [histories, selectedJobId]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [isDraftSaved, setIsDraftSaved] = useState<boolean>(false);

  const onSelectHistory = useCallback((item: JobData | null) => {
    if (item) {
      setMode("regenerate");
      setFormBasic((prev) => ({
        ...prev,
        prompt: "",
        referenceImageName: "",
        caption: item?.result?.caption || "",
        productKnowledgeId: item?.input?.productKnowledgeId || "",
        productName: item?.product?.name || "",
        productImage: item?.result?.images[0] || "",
        category: item?.input?.category || "other",
        customCategory: item?.input?.category || "",
        designStyle: item?.input?.designStyle || "",
        customDesignStyle: item?.input?.designStyle || "",
        referenceImage: item?.result?.images[0] || "",
        ratio: item?.result?.ratio || "1:1",
      }));
      setSelectedJobId(item.id);
      setFormAdvance(initialFormAdvance);
      setFormRss(null);
      setMode("regenerate");
      setTab("knowledge");
    } else {
      setMode("knowledge");
      setTab("knowledge");
      setSelectedJobId(null);
      form.setBasic(initialFormBasic);
      form.setAdvance(initialFormAdvance);
    }
    setFormRss(null);
    setIsDraftSaved(false); // Reset draft saved state when selecting new history
  }, []);

  /**
   *
   * LIBRARY RSS
   *
   */

  const { data: rssArtRes } = useLibraryRSSArticle(businessId);
  const rssArticles = rssArtRes?.data?.data || [];

  const onRssSelect = (item: GenerateContentRssBase | null) => {
    setSelectedJobId(null);
    setFormRss(item);
    setFormBasic({
      ...formBasic,
    });
    setMode("rss");
    setTab("rss");
  };

  /**
   *
   * FORM
   *
   */
  const [formBasic, setFormBasic] =
    useState<ContentGenerateContext["form"]["basic"]>(initialFormBasic);
  const [formAdvance, setFormAdvance] =
    useState<ContentGenerateContext["form"]["advance"]>(initialFormAdvance);
  const [formRss, setFormRss] =
    useState<ContentGenerateContext["form"]["rss"]>(null);
  const [enabledAdvance, setEnableAdvance] = useState<
    ContentGenerateContext["form"]["enabledAdvance"]
  >(initialEnabledAdvance);
  const [formMask, setFormMask] =
    useState<ContentGenerateContext["form"]["mask"]>(null);
  const { data: productKnowledgeRes } = useProductKnowledgeGetStatus(
    businessId,
    formBasic?.productKnowledgeId
  );

  useEffect(() => {
    if (productKnowledgeRes) {
      setEnableAdvance(productKnowledgeRes.data.data);
    }
  }, [productKnowledgeRes]);

  const form: ContentGenerateContext["form"] = {
    advance: formAdvance,
    basic: formBasic,
    rss: formRss,
    setBasic: setFormBasic,
    setAdvance: setFormAdvance,
    onRssSelect: onRssSelect,
    enabledAdvance: enabledAdvance,
    setEnabledAdvance: setEnableAdvance,
    mask: formMask,
    setMask: setFormMask,
  };

  /**
   *
   * MODE / HELPER
   *
   */
  const [mode, setMode] = useState<ContentGenerateContext["mode"]>("knowledge");
  const [tab, setTab] = useState<ContentGenerateContext["tab"]>("knowledge");
  const [loadingState, setLoadingState] =
    useState<ContentGenerateContext["isLoading"]>(false);
  const setIsLoading = (item: boolean) => {
    setLoadingState(item);
  };

  /**
   *
   * UNSAVE MODAL
   *
   */
  const [unsaveModal, setUnsaveModal] = useState<
    ContentGenerateContext["unsaveModal"]
  >({
    isOpen: false,
    item: null,
    isLoading: false,
  });

  const notLoadingJobStatus: JobStatus[] = ["done", "error"];
  const notLoadingJobStages: JobStage[] = ["done", "error"];
  const isLoading =
    loadingState ||
    !notLoadingJobStatus.includes(selectedHistory?.status || "done") ||
    !notLoadingJobStages.includes(selectedHistory?.stage || "done");

  /**
   *
   * PUBLISHED
   *
   */
  const [publishedPagination, setPublishedPagination] =
    useState<Pagination>(initialPagination);
  const [publishedQuery, setPublishedQuery] = useState<Partial<FilterQuery>>({
    limit: 10,
    page: 1,
    sortBy: "createdAt",
    sort: "desc",
  });
  const { data: publishedRes, isLoading: isLoadingPublished } =
    useLibraryTemplateGetPublished(businessId, publishedQuery);
  useEffect(() => {
    if (publishedRes) {
      setPublishedPagination(publishedRes?.data?.pagination);
      setPublishedQuery({
        ...publishedQuery,
        page: publishedRes?.data?.pagination?.page,
      });
    }
  }, [publishedRes]);
  const publishedData: Template[] = (publishedRes?.data.data || []).map(
    (item) => {
      return {
        id: item?.id,
        name: item?.name,
        imageUrl: item?.imageUrl,
        categories: item?.templateImageCategories.map((cat) => cat.name),
        price: 0,
        publisher: item?.publisher || "Postmatic",
        type: "published",
        createdAt: item?.createdAt,
        updatedAt: item?.updatedAt,
      };
    }
  );

  const publishedTemplates: ContentGenerateContext["publishedTemplates"] = {
    contents: publishedData,
    pagination: publishedPagination,
    filterQuery: publishedQuery,
    setFilterQuery: setPublishedQuery,
    isLoading: isLoadingPublished,
  };

  /**
   *
   * SAVED
   *
   */
  const [savedPagination, setSavedPagination] =
    useState<Pagination>(initialPagination);
  const [savedQuery, setSavedQuery] = useState<Partial<FilterQuery>>({
    limit: 10,
    page: 1,
    sortBy: "createdAt",
    sort: "desc",
  });
  const { data: savedRes, isLoading: isLoadingSaved } =
    useLibraryTemplateGetSaved(businessId, savedQuery);
  useEffect(() => {
    if (savedRes) {
      setSavedPagination(savedRes?.data?.pagination);
      setSavedQuery({
        ...savedQuery,
        page: savedRes?.data?.pagination?.page,
      });
    }
  }, [savedRes]);
  const savedData: Template[] = (savedRes?.data.data || []).map((item) => {
    return {
      id: item?.templateImageContent?.id,
      name: item?.name,
      imageUrl: item?.imageUrl,
      categories: item?.category,
      price: 0,
      publisher: item?.templateImageContent?.publisher || "Postmatic",
      type: "saved",
      createdAt: item?.createdAt,
      updatedAt: item?.updatedAt,
    };
  });

  const savedTemplates: ContentGenerateContext["savedTemplates"] = {
    contents: savedData,
    pagination: savedPagination,
    filterQuery: savedQuery,
    setFilterQuery: setSavedQuery,
    isLoading: isLoadingSaved,
  };

  /**
   *
   * PRODUCT KNOWLEDGES
   *
   */
  const [productPagination, setProductPagination] =
    useState<Pagination>(initialPagination);
  const [productQuery, setProductQuery] = useState<Partial<FilterQuery>>({
    limit: 10,
    page: 1,
    sortBy: "name",
    sort: "asc",
  });
  const { data: productRes } = useProductKnowledgeGetAll(
    businessId,
    productQuery
  );
  useEffect(() => {
    if (productRes) {
      setProductPagination(productRes?.data?.pagination);
      setProductQuery({
        ...savedQuery,
        page: savedRes?.data?.pagination?.page,
      });
    }
  }, [savedRes]);
  const products = productRes?.data?.data || [];

  const productKnowledges: ContentGenerateContext["productKnowledges"] = {
    contents: products,
    pagination: productPagination,
    filterQuery: productQuery,
    setFilterQuery: setProductQuery,
  };

  /**
   *
   * HANDLER
   *
   */

  const mSave = useLibraryTemplateSave();
  const mUnsave = useLibraryTemplateDeleteSaved();
  const onSaveUnsave = async (item: Template) => {
    try {
      switch (item.type) {
        case "published":
          const resPub = await mSave.mutateAsync({
            businessId,
            formData: {
              templateImageContentId: item.id,
            },
          });
          showToast("success", resPub.data.responseMessage);
          break;
        case "saved":
          // Show confirmation modal for saved items
          setUnsaveModal({
            isOpen: true,
            item: item,
            isLoading: false,
          });
          break;
      }
    } catch {}
  };

  const onConfirmUnsave = async () => {
    if (!unsaveModal.item) return;

    try {
      setUnsaveModal((prev) => ({ ...prev, isLoading: true }));

      const resSaved = await mUnsave.mutateAsync({
        businessId,
        templateId: unsaveModal.item.id,
      });

      showToast("success", resSaved.data.responseMessage);

      // Close modal
      setUnsaveModal({
        isOpen: false,
        item: null,
        isLoading: false,
      });
    } catch {
      setUnsaveModal((prev) => ({ ...prev, isLoading: false }));
    }
  };

  const onCloseUnsaveModal = () => {
    setUnsaveModal({
      isOpen: false,
      item: null,
      isLoading: false,
    });
  };

  const onSelectProduct = (item: ProductKnowledgeRes | null) => {
    if (item) {
      form.setBasic({
        ...form.basic,
        productKnowledgeId: item.id,
        productName: item.name,
        productImage: item.images?.[0] || "",
        customCategory: "",
        customDesignStyle: "",
      });
    }
  };

  const onSelectReferenceImage = (
    imageUrl: string,
    imageName: string | null,
    template?: Template
  ) => {
    form.setBasic({
      ...form.basic,
      referenceImage: imageUrl,
      referenceImageName: imageName,
    });

    // Set selected template for visual feedback
    if (template) {
      setSelectedTemplate(template);
    }

    // Add automatic scrolling to generation panel on mobile
    setTimeout(() => {
      const generationPanelElement =
        document.getElementById("generation-panel");
      if (generationPanelElement && window.innerWidth < 768) {
        generationPanelElement.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const onResetAdvance = () => {
    setFormAdvance(initialFormAdvance);
  };

  /**
   *
   * HANDLER GENERATE
   *
   */
  const mGenerateKnowledge = useContentJobKnowledgeOnJob();
  const mGenerateRss = useContentJobRssOnJob();
  const mGenerateRegenerate = useContentJobRegenerateOnJob();
  const mGenerateMask = useContentJobMaskOnJob();

  const onSubmitGenerate = async (overrides?: {
    mode?: ContentMode;
    maskUrl?: string;
  }) => {
    try {
      if (isLoading) return; // tetap cegah spam
      setIsLoading(true);

      const effMode = overrides?.mode ?? mode;

      switch (effMode) {
        case "knowledge":
          const resKnowledge = await mGenerateKnowledge.mutateAsync({
            businessId,
            formData: {
              ...form.basic,
              designStyle:
                form.basic.designStyle === "other"
                  ? form.basic.customDesignStyle
                  : form.basic.designStyle,
              category:
                form.basic.category === "other"
                  ? form.basic.customCategory
                  : form.basic.category,
              advancedGenerate: form.advance,
            },
          });

          await afterSubmitGenerate(resKnowledge.data.data.jobId);

          showToast(
            "success",
            "Harap tunggu, generate content sedang berlangsung"
          );
          break;
        case "rss":
          if (!form.rss) {
            showToast("error", "Harap pilih RSS");
            return;
          }
          const resRss = await mGenerateRss.mutateAsync({
            businessId,
            formData: {
              ...form.basic,
              designStyle:
                form.basic.designStyle === "other"
                  ? form.basic.customDesignStyle
                  : form.basic.designStyle,
              category:
                form.basic.category === "other"
                  ? form.basic.customCategory
                  : form.basic.category,
              advancedGenerate: form.advance,
              rss: form.rss,
            },
          });

          await afterSubmitGenerate(resRss?.data?.data?.jobId);

          showToast(
            "success",
            "Harap tunggu, generate content sedang berlangsung"
          );
          break;
        case "regenerate":
          if (!selectedHistory || !selectedHistory.result?.images[0]) {
            showToast("error", "Harap pilih history");
            return;
          }
          const resRegenerate = await mGenerateRegenerate.mutateAsync({
            businessId,
            formData: {
              productKnowledgeId: selectedHistory.input.productKnowledgeId,
              designStyle:
                (form.basic.designStyle === "other"
                  ? form.basic.customDesignStyle
                  : form.basic.designStyle) || "",
              category:
                (form.basic.category === "other"
                  ? form.basic.customCategory
                  : form.basic.category) || "",
              advancedGenerate: form.advance,
              referenceImage: selectedHistory.result?.images[0],
              caption: form.basic.caption || "",
              prompt: form.basic.prompt || "",
              ratio: selectedHistory.input.ratio,
            },
          });

          await afterSubmitGenerate(resRegenerate?.data?.data?.jobId);

          showToast(
            "success",
            "Harap tunggu, generate content sedang berlangsung"
          );
          break;
        case "mask":
          if (!form.mask && !overrides?.maskUrl) {
            showToast("error", "Harap pilih mask");
            return;
          }
          if (!selectedHistory) {
            showToast("error", "Harap pilih history");
            return;
          }
          const resMask = await mGenerateMask.mutateAsync({
            businessId,
            formData: {
              mask: form.mask || overrides?.maskUrl || "",
              prompt: form.basic.prompt || "",
              referenceImage: selectedHistory?.result?.images[0] || "",
              caption:
                form.basic.caption || selectedHistory?.result?.caption || "",
              ratio: selectedHistory?.input.ratio || "",
              designStyle:
                (form.basic.designStyle === "other"
                  ? form.basic.customDesignStyle
                  : form.basic.designStyle) || "",
              category:
                (form.basic.category === "other"
                  ? form.basic.customCategory
                  : form.basic.category) || "",
              productKnowledgeId:
                selectedHistory?.result?.productKnowledgeId || "",
            },
          });
          await afterSubmitGenerate(resMask?.data?.data?.jobId);
          showToast(
            "success",
            "Harap tunggu, generate content sedang berlangsung"
          );
          break;
        default:
          break;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const afterSubmitGenerate = async (jobId: string) => {
    const refetchHistoriesRes = await refetchHistories();
    const flattenedHistories = refetchHistoriesRes.data?.data?.data?.flatMap(
      (item) => item.jobs
    );
    const findJob: JobData | undefined = flattenedHistories?.find(
      (job) => job.id === jobId
    );
    if (findJob) {
      setSelectedJobId(findJob.id);
      setIsDraftSaved(false); // Reset draft saved state when new content is generated
    }
  };

  /**
   *
   * HANDLER SAVE DRAFT
   *
   */

  const mSaveDraft = useContentDraftSaveDraftContent();
  const onSaveDraft = async () => {
    try {
      if (!selectedHistory) {
        showToast("error", "Harap pilih data yang akan disimpan");
        return;
      }
      const resSaveDraft = await mSaveDraft.mutateAsync({
        businessId,
        formData: {
          caption: form.basic.caption || selectedHistory?.result?.caption || "",
          category:
            selectedHistory?.result?.category ||
            selectedHistory?.input.category ||
            "",
          designStyle:
            selectedHistory?.result?.designStyle ||
            selectedHistory?.input.designStyle ||
            "",
          ratio:
            selectedHistory?.result?.ratio ||
            selectedHistory?.input.ratio ||
            "",
          images: selectedHistory?.result?.images || [],
          productKnowledgeId: selectedHistory?.input.productKnowledgeId || "",
          referenceImages: selectedHistory?.input.referenceImage
            ? [selectedHistory?.input.referenceImage]
            : [],
        },
      });
      showToast("success", resSaveDraft.data.responseMessage);
      setIsDraftSaved(true); // Set draft saved state to true after successful save
    } catch {}
  };

  /**
   *
   * HANDLER SOCKET
   *
   */
  const [isConnected, setIsConnected] = useState(false);
  const rbRef = useRef<string | null>(null);
  const router = useRouter();
  const joinRoom = useCallback((rb?: string | null) => {
    const s = getSocket();
    if (!s || !s.connected) return;
    if (!rb) return;
    s.emit("join:business", rb);
  }, []);

  // private function
  const toastFinal = useCallback(
    (job: JobData) => {
      const phase = job.stage;
      const isFinal = phase === "done" || phase === "error";
      if (!isFinal) return;

      const title =
        phase === "done" ? "Selesai Generate Konten" : "Gagal Generate Konten";
      const desc =
        phase === "error"
          ? job.error?.message ?? "Terjadi kesalahan"
          : `Selesai generate konten ${job.product?.name ?? ""}`;

      toast(title, {
        description: desc,
        action: {
          label: "Open",
          onClick: () => {
            if (!pathname.includes("content-generate")) {
              router.push(`/business/${businessId}/content-generate`);
            }
            onSelectHistory(job);
          },
        },
      });
    },
    [onSelectHistory, businessId, router, pathname]
  );

  const updateJobData = useCallback((incoming: JobData) => {
    setHistories((prev) =>
      prev.map((group) => {
        const exists = group.jobs.some((j) => j.id === incoming.id);
        if (!exists) return group;
        return {
          ...group,
          jobs: group.jobs.map((j) => (j.id === incoming.id ? incoming : j)),
        };
      })
    );
  }, []);

  /** ===== Socket lifecycle ===== */
  useEffect(() => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem(ACCESS_TOKEN_KEY)
        : null;
    const socket = createSocket({ token });

    const onConnect = () => {
      console.log("connect");
      setIsConnected(true);
      const rb = rbRef.current ?? businessId;
      console.log("rb", rb);
      if (rb) joinRoom(rb);
    };
    const onDisconnect = () => {
      console.log("disconnect");
      setIsConnected(false);
    };
    const onReconnect = () => {
      console.log("reconnect");
      setIsConnected(true);
      const rb = rbRef.current ?? businessId;
      if (rb) joinRoom(rb);
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("reconnect", onReconnect);

    /** === EVENT: imagegen:update (SIMPAN SEMUA PROGRESS) === */
    socket.on("imagegen:update", (job: JobData) => {
      updateJobData(job);

      // Toast + notifikasi hanya saat final
      const phase = job.stage;
      if (phase === "done" || phase === "error") {
        queryClient.invalidateQueries({
          queryKey: ["contentJobGetAllJob"],
        });
        if (pathname.includes("content-generate")) {
          onSelectHistory(job);
        } else {
          toastFinal(job);
        }
      }
    });

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("reconnect", onReconnect);
      socket.off("imagegen:update");
      destroySocket();
    };
  }, [businessId, joinRoom, toastFinal, updateJobData]);

  const socketEvent: ContentGenerateContext["socketEvent"] = {
    isConnected,
  };
  return (
    <ContentGenerateContext.Provider
      value={{
        form,
        mode,
        setMode,
        tab,
        setTab,
        publishedTemplates,
        savedTemplates,
        unsaveModal,
        setUnsaveModal,
        onSaveUnsave,
        onConfirmUnsave,
        onCloseUnsaveModal,
        onSelectProduct,
        rssArticles,
        productKnowledges,
        onSelectReferenceImage,
        onSubmitGenerate,
        histories,
        selectedHistory,
        onSelectHistory,
        selectedTemplate,
        setSelectedTemplate,
        isLoading,
        onSaveDraft,
        setIsLoading,
        onResetAdvance,
        isDraftSaved,
        setIsDraftSaved,
        socketEvent,
      }}
    >
      {children}
    </ContentGenerateContext.Provider>
  );
};

export const useContentGenerate = () => {
  const context = useContext(ContentGenerateContext);
  if (!context) {
    throw new Error(
      "useContentGenerate must be used within a CheckoutProvider"
    );
  }
  return context;
};
