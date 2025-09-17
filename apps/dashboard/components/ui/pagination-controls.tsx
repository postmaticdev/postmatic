"use client";

import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { FilterQuery, Pagination } from "@/models/api/base-response.type";

/**
 * PaginationControls Component
 *
 * A reusable pagination component that provides navigation controls for paginated data.
 * Uses the Pagination interface from base-response.type.ts to ensure consistency with API responses.
 *
 * Features:
 * - First/Previous/Next/Last page navigation
 * - Smart page number display (shows up to 5 page numbers)
 * - Responsive design with mobile-first approach
 * - Accessible with proper ARIA labels and tooltips
 * - Disabled states for navigation buttons
 *
 * @param pagination - Pagination object containing page info
 * @param onPageChange - Callback function when page changes
 * @param className - Optional additional CSS classes
 */

interface PaginationControlsProps {
  pagination: Pagination;
  filterQuery?: Partial<FilterQuery>;
  setFilterQuery: (q: Partial<FilterQuery>) => void;
  className?: string;
}

export function PaginationControls({
  pagination,
  setFilterQuery,
  filterQuery,
  className = "",
}: PaginationControlsProps) {
  const { page, totalPages, hasNextPage, hasPrevPage } = pagination;

  // Don't render if there's only one page or no pages
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div
      className={`flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t ${className}`}
    >
      {/* Page Info */}
      <div className="text-xs text-muted-foreground">
        Halaman {page} dari {totalPages}
      </div>

      {/* Pagination Buttons */}
      <div className="flex items-center gap-2">
        {/* First Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFilterQuery({ ...filterQuery, page: 1 });
          }}
          disabled={!hasPrevPage}
          className="h-8 w-8 p-0"
          title="Halaman Pertama"
        >
          <ChevronLeft className="h-3 w-3" />
          <ChevronLeft className="h-3 w-3 -ml-1" />
        </Button>

        {/* Previous Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFilterQuery({
              ...filterQuery,
              page: (filterQuery?.page || 2) - 1,
            });
          }}
          disabled={!hasPrevPage}
          className="h-8 w-8 p-0"
          title="Halaman Sebelumnya"
        >
          <ChevronLeft className="h-3 w-3" />
        </Button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
            let pageNum: number;

            if (totalPages <= 5) {
              // Show all pages if 5 or fewer
              pageNum = i + 1;
            } else if (page <= 3) {
              // Show first 5 pages when near the beginning
              pageNum = i + 1;
            } else if (page >= totalPages - 2) {
              // Show last 5 pages when near the end
              pageNum = totalPages - 4 + i;
            } else {
              // Show 5 pages around current page
              pageNum = page - 2 + i;
            }

            return (
              <Button
                key={pageNum}
                variant={page === pageNum ? "default" : "outline"}
                size="sm"
                onClick={() => {
                  setFilterQuery({ ...filterQuery, page: pageNum });
                }}
                className="h-8 w-8 p-0 text-xs"
                title={`Halaman ${pageNum}`}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        {/* Next Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFilterQuery({
              ...filterQuery,
              page: (filterQuery?.page || 0) + 1,
            });
          }}
          disabled={!hasNextPage}
          className="h-8 w-8 p-0"
          title="Halaman Selanjutnya"
        >
          <ChevronRight className="h-3 w-3" />
        </Button>

        {/* Last Page Button */}
        <Button
          variant="outline"
          size="sm"
          onClick={() => {
            setFilterQuery({
              ...filterQuery,
              page: pagination?.totalPages || 1,
            });
          }}
          disabled={!hasNextPage}
          className="h-8 w-8 p-0"
          title="Halaman Terakhir"
        >
          <ChevronRight className="h-3 w-3" />
          <ChevronRight className="h-3 w-3 -ml-1" />
        </Button>
      </div>
    </div>
  );
}
