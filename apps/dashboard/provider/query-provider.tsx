"use client";

import { errorString } from "@/helper/error-handler";
import { showToast } from "@/helper/show-toast";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const MINUTE = 1000 * 60;
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: MINUTE * 5,
      refetchOnWindowFocus: false,
      gcTime: MINUTE * 10,
      retry: false,
    },
    mutations: {
      retry: false,
      onError: (error) => {
        showToast("error", error);
        console.error(error);
        throw error;
      },
    },
  },
});

export const QueryProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};
