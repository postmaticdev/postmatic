import "./globals.css";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import {
  GOOGLE_SITE_VERIFICATION,
  LANDINGPAGE_URL,
  TITLE_APP,
  YAHOO_SITE_VERIFICATION,
  YANDEX_SITE_VERIFICATION,
} from "@/constants";
import { IMAGE_PATH } from "@/constants/path-file";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const poppins = Poppins({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  icons: {
    icon: IMAGE_PATH,
  },
  title: {
    default: TITLE_APP,
    template: `${TITLE_APP} | %s`,
  },
  description:
    "Platform SaaS berbasis AI/ML yang mengotomasi seluruh proses pemasaran digital bisnis Indonesia.",
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
      "Platform SaaS berbasis AI/ML yang mengotomasi seluruh proses pemasaran digital bisnis Indonesia.",
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
  twitter: {
    card: "summary_large_image",
    title: TITLE_APP,
    description:
      "Platform SaaS berbasis AI/ML yang mengotomasi seluruh proses pemasaran digital bisnis Indonesia.",
    images: ["logo-bg-blue.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className={`${inter.variable} ${poppins.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0066FF" />
      </head>
      <body
        className={`${poppins.className} bg-white dark:bg-[#0A0A0A] antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
