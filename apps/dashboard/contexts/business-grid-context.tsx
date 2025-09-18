"use client";
import { FilterQuery } from "@/models/api/base-response.type";
import { createContext, useContext, useState } from "react";

interface BusinessGridFilterContext {
  filterQuery: Partial<FilterQuery>;
  setFilterQuery: (filterQuery: Partial<FilterQuery>) => void;
}

const BusinessGridFilterContext = createContext<BusinessGridFilterContext | undefined>(undefined);

export function BusinessGridFilterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [filterQuery, setFilterQuery] = useState<Partial<FilterQuery>>({
    limit: 8,
    page: 1,
  });
  return (
    <BusinessGridFilterContext.Provider value={{ filterQuery, setFilterQuery }}>
      {children}
    </BusinessGridFilterContext.Provider>
  );
}

export function useBusinessGridFilter() {
  const context = useContext(BusinessGridFilterContext);
  if (!context) {
    throw new Error("useBusinessGridFilter must be used within a BusinessGridFilterProvider");
  }
  return context;
}
