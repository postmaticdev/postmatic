"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { BusinessKnowledge } from "@/app/business/new-business/(components)/business-knowledge";
import { ProductKnowledge } from "@/app/business/new-business/(components)/product-knowledge";
import { RoleKnowledge } from "@/app/business/new-business/(components)/role-knowledge";
import { Progress } from "@/components/ui/progress";
import { useFormNewBusiness } from "@/contexts/form-new-business-context";
import { showToast } from "@/helper/show-toast";
import { useBusinessCreate } from "@/services/business.api";
import {
  useBusinessKnowledgeUpsert,
  useProductKnowledgeCreate,
  useRoleKnowledgeUpsert,
} from "@/services/knowledge.api";
import {
  businessKnowledgeSchema,
  productKnowledgeSchema,
  roleKnowledgeSchema,
} from "@/validator/new-business";

const steps = [
  {
    id: 1,
    title: "Pengetahuan Bisnis",
    component: BusinessKnowledge,
    backgroundImage: "/businessknowledge.PNG",
  },
  {
    id: 2,
    title: "Pengetahuan Produk",
    component: ProductKnowledge,
    backgroundImage: "/productknowledge.PNG",
  },
  {
    id: 3,
    title: "Pengetahuan Peran",
    component: RoleKnowledge,
    backgroundImage: "/roleknowledge.PNG",
  },
];

export default function NewBusinessClient() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);

  const { formData, setBusinessId, errors, setErrors } = useFormNewBusiness();
  const { step1, step2, step3 } = formData;

  const mBusiness = useBusinessCreate();
  const mBusinessKnowledge = useBusinessKnowledgeUpsert();
  const mProductKnowledge = useProductKnowledgeCreate();
  const mRoleKnowledge = useRoleKnowledgeUpsert();

  const onSubmit = async () => {
    try {
      if (!step1.primaryLogo) {
        throw new Error("Harap masukkan logo brand");
      }
      const business = await mBusiness.mutateAsync({
        name: step1.name,
        description: step1.description,
        logo: step1.primaryLogo,
      });

      setBusinessId(business.data.data.id);

      const id = business.data.data.id;
      await Promise.all([
        mBusinessKnowledge.mutateAsync({
          businessId: id,
          formData: step1,
        }),
        mProductKnowledge.mutateAsync({
          businessId: id,
          formData: step2,
        }),
        mRoleKnowledge.mutateAsync({
          businessId: id,
          formData: {
            ...step3,
            hashtags: step3.hashtags.map((hashtag) => `#${hashtag}`),
          },
        }),
      ]);

      router.push(`/business/${id}/pricing?isNewBusiness=true`);
    } catch (error) {
      console.log(error);
      showToast("error", error);
    }
  };

  const currentStepData = steps[currentStep];
  const CurrentComponent = currentStepData.component;

  const validateStep = () => {
    const validationErrors = { ...errors };

    if (currentStep === 0) {
      const result = businessKnowledgeSchema.safeParse(step1);
      if (!result.success) {
        const step1Errors: Record<string, string> = {};
        result.error.issues.forEach((error) => {
          step1Errors[error.path[0] as string] = error.message;
        });
        validationErrors.step1 = step1Errors;
        setErrors(validationErrors);
        throw new Error("Harap perbaiki data bisnis yang tidak valid");
      } else {
        validationErrors.step1 = {};
      }
    }

    if (currentStep === 1) {
      const result = productKnowledgeSchema.safeParse(step2);
      if (!result.success) {
        const step2Errors: Record<string, string> = {};
        result.error.issues.forEach((error) => {
          step2Errors[error.path[0] as string] = error.message;
        });
        validationErrors.step2 = step2Errors;
        setErrors(validationErrors);
        throw new Error("Harap perbaiki data produk yang tidak valid");
      } else {
        validationErrors.step2 = {};
      }
    }

    if (currentStep === 2) {
      const result = roleKnowledgeSchema.safeParse(step3);
      if (!result.success) {
        const step3Errors: Record<string, string> = {};
        result.error.issues.forEach((error) => {
          step3Errors[error.path[0] as string] = error.message;
        });
        validationErrors.step3 = step3Errors;
        setErrors(validationErrors);
        throw new Error("Harap perbaiki data role yang tidak valid");
      } else {
        validationErrors.step3 = {};
      }
    }

    setErrors(validationErrors);
  };

  const handleNext = () => {
    try {
      validateStep();
      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        onSubmit();
      }
    } catch (error) {
      showToast("error", error);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-transparent rounded overflow-hidden flex">
      {/* Left Panel */}
      <div className="flex flex-col w-full md:w-2/3 lg:w-2/5  mx-auto mb-22 mt-18 md:mt-22">
        {/* Header */}
        <div className=" p-2 md:p-4 bg-background dark:bg-card border-b border-border fixed top-0 left-0 right-0 z-50 w-full md:w-2/3 lg:w-2/5">
          <div className="flex items-center gap-3 mb-2">
            <Image
              src="/logoblue.png"
              alt="logol"
              width={200}
              height={200}
              className="w-12 h-12"
            />
            <h1 className="text-xl font-bold">{currentStepData.title}</h1>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className=" flex-1 bg-card dark:bg-background p-6 overflow-y-auto">
          <CurrentComponent />
        </div>

        {/* Footer */}
        <div className="bg-background dark:bg-card p-6 border-t border-border rounded-b-lg fixed bottom-0 left-0 right-0 z-50 w-full md:w-2/3 lg:w-2/5">
          <div className="flex justify-between items-center gap-4 mt-2">
            <Progress value={currentStep * 50} />
            <div className="flex flex-row gap-4">
              <Button
                variant="outline"
                onClick={handlePrevious}
                disabled={currentStep === 0}
              >
                Sebelumnya
              </Button>
              <Button
                onClick={handleNext}
                className="bg-primary text-white hover:bg-blue-700 "
              >
                {currentStep === steps.length - 1 ? "Kirim" : "Selanjutnya"}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Background Image (Hidden on Mobile) */}
      <div className="hidden md:block flex-1 relative">
        <Image
          src={currentStepData.backgroundImage}
          alt={`${currentStepData.title} Background`}
          fill
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
