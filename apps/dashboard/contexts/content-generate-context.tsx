"use client";

import { showToast } from "@/helper/show-toast";
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
import { useParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

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
    setMask: (item: string | null) => void;
  };

  // MODE / HELPER
  mode: ContentMode;
  setMode: (item: "knowledge" | "regenerate" | "mask" | "rss") => void;
  tab: TabMode;
  setTab: (item: TabMode) => void;
  isLoading: boolean;
  setIsLoading: (item: boolean) => void;

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

  //   // HANDLER
  onSaveUnsave: (item: Template) => void;
  onSelectProduct: (item: ProductKnowledgeRes | null) => void;
  onSelectReferenceImage: (imageUrl: string, imageName: string | null) => void;
  onSubmitGenerate: () => void;
  onSaveDraft: () => void;
  //   onClickUser: (item: Content) => void; // 🔴
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
      logo: {
        primaryLogo: false,
        secondaryLogo: false,
      },
    },
    productKnowledge: {
      name: false,
      category: false,
      description: false,
      price: false,
      benefit: false,
      allergen: false,
      composition: false,
    },
    roleKnowledge: {
      hashtags: false,
    },
  };

const initialFormBasic: ContentGenerateContext["form"]["basic"] = {
  category: "",
  designStyle: "",
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
    logo: {
      primaryLogo: false,
      secondaryLogo: false,
    },
  },
  productKnowledge: {
    allergen: false,
    benefit: false,
    category: false,
    composition: false,
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

  /**
   *
   * LIBRARY HISTORY
   *
   */

  const { data: historiesRes, refetch: refetchHistories } =
    useContentJobGetAllJob(businessId);
  const histories = historiesRes?.data?.data || [];
  const [selectedHistory, setSelectedHistory] = useState<JobData | null>(null);
  const onSelectHistory = (item: JobData | null) => {
    if (item) {
      setMode("regenerate");
      setSelectedHistory(item);
      form.setBasic({
        ...form.basic,
        caption: item?.result?.caption || "",
        productKnowledgeId: item?.input?.productKnowledgeId || "",
        productName: item?.product?.name || "",
        productImage: item?.result?.images[0] || "",
        category: "other",
        customCategory: item?.input?.category || "",
        designStyle: "other",
        customDesignStyle: item?.input?.designStyle || "",
        referenceImage: item?.result?.images[0] || "",
        ratio: item?.result?.ratio || "1:1",
      });
      setMode("regenerate");
      setTab("knowledge");
    } else {
      setMode("knowledge");
      setTab("knowledge");
      setSelectedHistory(null);
      form.setBasic(initialFormBasic);
      form.setAdvance(initialFormAdvance);
    }
    setFormRss(null);
  };

  /**
   *
   * LIBRARY RSS
   *
   */

  const { data: rssArtRes } = useLibraryRSSArticle(businessId);
  const rssArticles = rssArtRes?.data?.data || [];

  const onRssSelect = (item: GenerateContentRssBase | null) => {
    setSelectedHistory(null);
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
  const { data: publishedRes, isLoading: isLoadingPublished } = useLibraryTemplateGetPublished(
    businessId,
    publishedQuery
  );
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
  const { data: savedRes, isLoading: isLoadingSaved } = useLibraryTemplateGetSaved(businessId, savedQuery);
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
          const resSaved = await mUnsave.mutateAsync({
            businessId,
            templateId: item.id,
          });
          showToast("success", resSaved.data.responseMessage);
          break;
      }
    } catch {}
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
    imageName: string | null
  ) => {
    form.setBasic({
      ...form.basic,
      referenceImage: imageUrl,
      referenceImageName: imageName,
    });
    
    // Add automatic scrolling to generation panel on mobile
    setTimeout(() => {
      const generationPanelElement = document.getElementById('generation-panel');
      if (generationPanelElement && window.innerWidth < 768) {
        generationPanelElement.scrollIntoView({ behavior: 'smooth' });
      }
    }, 100);
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

  const onSubmitGenerate = async () => {
    try {
      if (isLoading) return;
      setIsLoading(true);
      switch (mode) {
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
            "Harap tunggu, generate content sedang berlangsung [TODO: KNOWLEDGE]"
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
            "Harap tunggu, generate content sedang berlangsung [TODO: RSS]"
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
            "Harap tunggu, generate content sedang berlangsung [TODO: REGENERATE]"
          );
          break;
        case "mask":
          if (!form.mask) {
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
              mask: form.mask,
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
            "Harap tunggu, generate content sedang berlangsung [TODO: MASK]"
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
      setSelectedHistory(findJob || null);
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
    } catch {}
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
        onSaveUnsave,
        onSelectProduct,
        rssArticles,
        productKnowledges,
        onSelectReferenceImage,
        onSubmitGenerate,
        histories,
        selectedHistory,
        onSelectHistory,
        isLoading,
        onSaveDraft,
        setIsLoading,
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
