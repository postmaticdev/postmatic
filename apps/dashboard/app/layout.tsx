import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { ClientLayoutWrapper } from "./client-layout-wrapper";
import { QueryProvider } from "@/provider/query-provider";
import { Toaster } from "@/components/ui/sonner";
import { FormNewBusinessProvider } from "@/contexts/form-new-business-context";
import { ManageKnowledgeProvider } from "@/contexts/manage-knowledge-context";
import { CheckoutProvider } from "@/contexts/checkout-context";
import { ContentGenerateProvider } from "@/contexts/content-generate-context";
import { Suspense } from "react";
import { BusinessGridFilterProvider } from "@/contexts/business-grid-context";
import { RoleProvider } from "@/contexts/role-context";

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
      <Suspense fallback={<div>loading...</div>}>
        <ClientLayoutWrapper>
          <QueryProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              <RoleProvider>
                <ContentGenerateProvider>
                  <FormNewBusinessProvider>
                    <ManageKnowledgeProvider>
                      <CheckoutProvider>
                        <BusinessGridFilterProvider>
                          <main
                            className={`${geistSans.variable} ${geistMono.variable}`}
                          >
                            {children}
                          </main>
                        </BusinessGridFilterProvider>
                      </CheckoutProvider>
                    </ManageKnowledgeProvider>
                  </FormNewBusinessProvider>
                </ContentGenerateProvider>
              </RoleProvider>
              <Toaster />
            </ThemeProvider>
          </QueryProvider>
        </ClientLayoutWrapper>
      </Suspense>
    </html>
  );
}
