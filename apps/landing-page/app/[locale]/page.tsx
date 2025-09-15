import type { Metadata } from "next";
import ProblemSection from "@/components/problem-section";
import SolutionSection from "@/components/solution-section";
import FeaturesSection from "@/components/features-section";
import PricingSection from "@/components/pricing-section";
import CTASection from "@/components/cta-section";
import Hero from "@/components/Hero";

import Introduction from "@/components/introduction";
import { Comparison } from "@/components/comparison";
import EndToEnd from "@/components/end-to-end";
import IntroVideoPage from "@/components/intro-video";
import { GOOGLE_SITE_VERIFICATION, LANDINGPAGE_URL, TITLE_APP, YAHOO_SITE_VERIFICATION, YANDEX_SITE_VERIFICATION } from "@/constants";

export const metadata: Metadata = {
  title: TITLE_APP,
  description:
    "Solusi AI/ML terdepan untuk mengotomasi seluruh proses pemasaran digital bisnis...",
  keywords:
    "Bisnis, pemasaran digital, AI marketing, otomasi konten, social media automation, Indonesia, SaaS, artificial intelligence, marketing automation",
  authors: [{ name: "POSTMATIC Team" }],
  creator: "POSTMATIC Team",
  publisher: "POSTMATIC Team",
  formatDetection: { email: false, address: false, telephone: false },
  metadataBase: new URL(LANDINGPAGE_URL),
  alternates: { canonical: "/" },
  openGraph: {
    title: TITLE_APP,
    description:
      "Solusi AI/ML terdepan untuk mengotomasi seluruh proses pemasaran digital bisnis...",
    url: LANDINGPAGE_URL,
    siteName: TITLE_APP,
    images: [
      {
        url: "/logo-bg-blue.png",
        width: 1200,
        height: 630,
        alt: "POSTMATIC - AI Marketing Automation Platform untuk Bisnis Indonesia",
      },
    ],
    locale: "id_ID",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "POSTMATIC - Platform AI untuk Otomasi Pemasaran Digital Bisnis",
    description:
      "Solusi AI/ML terdepan untuk mengotomasi seluruh proses pemasaran digital bisnis...",
    images: ["logo-bg-blue.png"],
    creator: "@postmatic_id",
    site: "@postmatic_id",
  },
  robots: {
    index: true,
    follow: true,
    nocache: true,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: GOOGLE_SITE_VERIFICATION,
    yandex: YANDEX_SITE_VERIFICATION,
    yahoo: YAHOO_SITE_VERIFICATION,
  },
  category: "technology",
};

export default function Home() {
  return (
    <main className="">
      <Hero />
      <Introduction />
      <Comparison />
      <ProblemSection />
      <SolutionSection />
      <FeaturesSection />
      <EndToEnd />
      <IntroVideoPage />
      <PricingSection />
      <CTASection />
    </main>
  );
}
