import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { QueryProvider } from "@/provider/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { FormNewBusinessProvider } from "@/contexts/form-new-business-context";
import { ManageKnowledgeProvider } from "@/contexts/manage-knowledge-context";
import { CheckoutProvider } from "@/contexts/checkout-context";
import { ContentGenerateProvider } from "@/contexts/content-generate-context";
import { Suspense } from "react";
import { BusinessGridFilterProvider } from "@/contexts/business-grid-context";
import { RoleProvider } from "@/contexts/role-context";
import { AutoSchedulerAutosaveProvider } from "@/contexts/auto-scheduler-autosave-context";
import BusinessClientLayout from "./client-layout";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Postmatic Business",
  description: "Dashboard manajemen bisnis untuk Postmatic",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <Suspense fallback={null}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <QueryProvider>
            <RoleProvider>
              <AutoSchedulerAutosaveProvider>
                <ContentGenerateProvider>
                  <FormNewBusinessProvider>
                    <ManageKnowledgeProvider>
                      <CheckoutProvider>
                        <BusinessGridFilterProvider>
                          <BusinessClientLayout>
                            <main
                              className={`${geistSans.variable} ${geistMono.variable}`}
                            >
                              {children}
                            </main>
                          </BusinessClientLayout>
                        </BusinessGridFilterProvider>
                      </CheckoutProvider>
                    </ManageKnowledgeProvider>
                  </FormNewBusinessProvider>
                </ContentGenerateProvider>
              </AutoSchedulerAutosaveProvider>
            </RoleProvider>
            <Toaster />
          </QueryProvider>
        </ThemeProvider>
      </Suspense>
    </html>
  );
}
