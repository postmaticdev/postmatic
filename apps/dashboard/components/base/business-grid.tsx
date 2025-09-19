"use client";

import { BusinessCard } from "@/components/base/business-card";
import { Member } from "@/models/api/business/index.type";
import { useBusinessGetAll } from "@/services/business.api";
import { useState } from "react";
import { PaginationControls } from "../ui/pagination-controls";
import { useRouter } from "next/navigation";
import { MemberManagementModal } from "@/app/business/[businessId]/settings/(components)/member-management-modal";
import { initialPagination } from "@/models/api/base-response.type";
import { ChartNoAxesCombined } from "lucide-react";
import { NoContent } from "./no-content";
import { BusinessGridSkeleton } from "../grid-skeleton/business-grid-skeleton";
import { useBusinessGridFilter } from "@/contexts/business-grid-context";

export function BusinessGrid() {
  const { filterQuery, setFilterQuery } = useBusinessGridFilter();

  const { data, isLoading } = useBusinessGetAll(filterQuery);
  const businesses = data?.data?.data || [];
  const pagination = data?.data?.pagination || initialPagination;
  const router = useRouter();

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    null
  );

  return (
    <div className="space-y-6">
      {/* Business Grid */}
      {isLoading ? (
        <BusinessGridSkeleton count={8} />
      ) : businesses.length === 0 ? (
        <NoContent
          icon={ChartNoAxesCombined}
          title="Tidak ada bisnis yang ditemukan"
          titleDescription="Tambahkan bisnis baru"
          buttonText="Tambah Bisnis"
          onButtonClick={() => router.push("/business/new-business")}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-4 md:mt-6">
          {businesses.map((business) => (
            <BusinessCard
              key={business.id}
              business={business}
              onClickInvite={() => {
                setSelectedBusinessId(business.id);
                setIsMemberModalOpen(true);
              }}
            />
          ))}
        </div>
      )}

      <PaginationControls
        pagination={pagination}
        filterQuery={filterQuery}
        setFilterQuery={setFilterQuery}
      />

      <MemberManagementModal
        isOpen={isMemberModalOpen && selectedBusinessId !== null}
        onClose={() => {
          setIsMemberModalOpen(false);
          setSelectedBusinessId(null);
        }}
        businessIdFromProps={selectedBusinessId}
      />
    </div>
  );
}
