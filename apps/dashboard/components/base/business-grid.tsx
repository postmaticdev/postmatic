"use client";

import { BusinessCard } from "@/components/base/business-card";
import { useFilterQuery } from "@/hooks/use-filter-query";
import { Member } from "@/models/api/business/index.type";
import { useBusinessGetAll } from "@/services/business.api";
import { createContext, useCallback, useContext, useState } from "react";
import { PaginationControls } from "../ui/pagination-controls";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { MemberManagementModal } from "@/app/business/[businessId]/settings/(components)/member-management-modal";
import { initialPagination } from "@/models/api/base-response.type";
import { useQueryClient } from "@tanstack/react-query";
import { ChartNoAxesCombined } from "lucide-react";
import { NoContent } from "./no-content";
import { BusinessGridSkeleton } from "../grid-skeleton/business-grid-skeleton";
import { FilterQuery } from "@/models/api/base-response.type";
import { useBusinessGridFilter } from "@/contexts/business-grid-context";

export function BusinessGrid() {
  // const filterQuery = useFilterQuery();
const { filterQuery, setFilterQuery } = useBusinessGridFilter();

  const { data, isLoading } = useBusinessGetAll(filterQuery);
  const businesses = data?.data?.data || [];
  const pagination = data?.data?.pagination || initialPagination;
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [selectedBusinessId, setSelectedBusinessId] = useState<string | null>(
    null
  );

  const getOwner = (members?: Member[]) => {
    return members?.find((member) => member.role === "Owner")?.profile;
  };



  // const setFilterQuery = useCallback(
  //   (newQuery: Partial<NonNullable<typeof filterQuery>>) => {
  //     const params = new URLSearchParams(searchParams.toString());

  //     // Update all query parameters
  //     Object.entries(newQuery).forEach(([key, value]) => {
  //       if (value !== undefined && value !== null && value !== "") {
  //         params.set(key, value.toString());
  //       } else {
  //         params.delete(key);
  //       }
  //     });

  //     queryClient.invalidateQueries({
  //       queryKey: ["businesses"],
  //     });

  //     router.push(`?${params.toString()}`);
  //   },
  //   [queryClient, router, searchParams]
  // );

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
              description={business.description}
              name={business.name}
              id={business.id}
              imageUrl={business.logo}
              owner={getOwner(business.members)}
              onClickInvite={() => {
                setSelectedBusinessId(business.id);
                setIsMemberModalOpen(true);
              }}
            />
          ))}
        </div>
      )}
      {pagination && (
        <PaginationControls
          pagination={pagination}
          filterQuery={filterQuery}
          setFilterQuery={setFilterQuery}
        />
      )}

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
