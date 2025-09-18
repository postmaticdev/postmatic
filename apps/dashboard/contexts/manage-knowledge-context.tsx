"use client";

import { BusinessKnowledgePld } from "@/models/api/knowledge/business.type";
import { RoleKnowledgePld } from "@/models/api/knowledge/role.type";
import { useState, createContext, useContext, useEffect } from "react";
import { useParams, usePathname } from "next/navigation";
import {
  useBusinessKnowledgeGetById,
  usePlatformKnowledgeGetAll,
} from "@/services/knowledge.api";
import { useRoleKnowledgeGetById } from "@/services/knowledge.api";
import { PlatformRes } from "@/models/api/knowledge/platform.type";

interface FormKnowledge {
  business: BusinessKnowledgePld;
  role: RoleKnowledgePld;
}

interface ValidationErrors {
  business: Record<string, string>;
  role: Record<string, string>;
}

const initialFormKnowledge: FormKnowledge = {
  business: {
    primaryLogo: null,
    name: "",
    category: "",
    description: "",
    visionMission: "",
    website: "",
    location: "",
    uniqueSellingPoint: "",
  },
  role: {
    targetAudience: "",
    tone: "",
    audiencePersona: "",
    hashtags: [],
    callToAction: "",
    goals: "",
  },
};

interface ManageKnowledgeContext {
  formKnowledge: FormKnowledge;
  setFormKnowledge: (formKnowledge: FormKnowledge) => void;
  platforms: PlatformRes[];
  errors: ValidationErrors;
  setErrors: (errors: ValidationErrors) => void;
}

const ManageKnowledgeContext = createContext<
  ManageKnowledgeContext | undefined
>(undefined);

export function ManageKnowledgeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [formKnowledge, setFormKnowledge] =
    useState<FormKnowledge>(initialFormKnowledge);
  const [errors, setErrors] = useState<ValidationErrors>({
    business: {},
    role: {},
  });
  const { businessId } = useParams() as { businessId: string };
  const pathname = usePathname();
  const { data: businessKnowledgeData } =
    useBusinessKnowledgeGetById(businessId);
  const { data: roleKnowledgeData } = useRoleKnowledgeGetById(businessId);

  const { data: platformsData } = usePlatformKnowledgeGetAll(
    businessId,
    pathname
  );
  const platforms = platformsData?.data.data || [];

  useEffect(() => {
    if (businessKnowledgeData) {
      setFormKnowledge((prev) => ({
        ...prev,
        business: businessKnowledgeData.data.data,
      }));
    }
    if (roleKnowledgeData) {
      setFormKnowledge((prev) => ({
        ...prev,
        role: roleKnowledgeData.data.data,
      }));
    }
  }, [businessKnowledgeData, roleKnowledgeData]);

  return (
    <ManageKnowledgeContext.Provider
      value={{ formKnowledge, setFormKnowledge, platforms, errors, setErrors }}
    >
      {children}
    </ManageKnowledgeContext.Provider>
  );
}

export const useManageKnowledge = () => {
  const context = useContext(ManageKnowledgeContext);
  if (context === undefined) {
    throw new Error(
      "useManageKnowledge must be used within a ManageKnowledgeProvider"
    );
  }
  return context;
};
