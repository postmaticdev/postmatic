"use client";

import {
  Dispatch,
  SetStateAction,
  createContext,
  useContext,
  useState,
} from "react";
import { BusinessKnowledgePld } from "@/models/api/knowledge/business.type";
import { ProductKnowledgePld } from "@/models/api/knowledge/product.type";
import { RoleKnowledgePld } from "@/models/api/knowledge/role.type";

export interface FormNewBusiness {
  step1: BusinessKnowledgePld;
  step2: ProductKnowledgePld;
  step3: RoleKnowledgePld;
}

interface FormNewBusinessContext {
  formData: FormNewBusiness;
  setFormData: Dispatch<SetStateAction<FormNewBusiness>>;
  businessId: string | null;
  setBusinessId: (businessId: string | null) => void;
  errors: {
    step1: Record<string, string>;
    step2: Record<string, string>;
    step3: Record<string, string>;
  };
  setErrors: (errors: {
    step1: Record<string, string>;
    step2: Record<string, string>;
    step3: Record<string, string>;
  }) => void;
  clearStepErrors: (step: number) => void;
  clearFieldError: (step: number, field: string) => void;
}

const FormNewBusinessContext = createContext<
  FormNewBusinessContext | undefined
>(undefined);

export function FormNewBusinessProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormNewBusiness>({
    step1: {
      primaryLogo: "",
      name: "",
      category: "",
      description: "",
      visionMission: "",
      website: "",
      location: "",
      uniqueSellingPoint: "",
    },
    step2: {
      name: "",
      category: "",
      description: "",
      currency: "IDR",
      images: [],
      price: 0,
    },
    step3: {
      targetAudience: "",
      tone: "",
      audiencePersona: "",
      hashtags: [],
      callToAction: "",
      goals: "",
    },
  });

  const [errors, setErrors] = useState({
    step1: {} as Record<string, string>,
    step2: {} as Record<string, string>,
    step3: {} as Record<string, string>,
  });

  const clearStepErrors = (step: number) => {
    const newErrors = { ...errors };
    if (step === 0) {
      newErrors.step1 = {};
    } else if (step === 1) {
      newErrors.step2 = {};
    } else if (step === 2) {
      newErrors.step3 = {};
    }
    setErrors(newErrors);
  };

  const clearFieldError = (step: number, field: string) => {
    const newErrors = { ...errors };
    if (step === 0) {
      delete newErrors.step1[field];
    } else if (step === 1) {
      delete newErrors.step2[field];
    } else if (step === 2) {
      delete newErrors.step3[field];
    }
    setErrors(newErrors);
  };

  return (
    <FormNewBusinessContext.Provider
      value={{
        formData,
        setFormData,
        businessId,
        setBusinessId,
        errors,
        setErrors,
        clearStepErrors,
        clearFieldError,
      }}
    >
      {children}
    </FormNewBusinessContext.Provider>
  );
}

export const useFormNewBusiness = () => {
  const context = useContext(FormNewBusinessContext);
  if (context === undefined) {
    throw new Error(
      "useFormNewBusiness must be used within a FormNewBusinessProvider"
    );
  }
  return context;
};
