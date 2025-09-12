import "./globals.css";
import type { Metadata } from "next";
import { Inter, Poppins } from "next/font/google";
import {
  Navbar,
  NavbarButton,
  NavbarLogo,
  NavBody,
  NavItems,
} from "@/components/ui/resizable-navbar";
import MobileNavWrapper from "@/components/navbar";
import { LogIn } from "lucide-react";
import { LOGIN_URL, TITLE_APP } from "@/constants";
import Footer from "@/components/Footer";
import CookieConsentPopup from "@/components/cookie-consent-popup";
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
    template: "%s | POSTMATIC",
  },
  description:
    "Platform SaaS berbasis AI/ML yang mengotomasi seluruh proses pemasaran digital bisnis Indonesia.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navItems = [
    { name: "About", link: "/#about" },
    { name: "Features", link: "/#features" },
    { name: "Tutorial", link: "/#tutorial" },
    { name: "Pricing", link: "/#pricing" },
  ];
  return (
    <html lang="id" className={`${inter.variable} ${poppins.variable} dark`}>
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <meta name="theme-color" content="#0066FF" />
      </head>
      <body className={`${poppins.className} antialiased dark`}>
        <Navbar className="top-0">
          <NavBody>
            <NavbarLogo />
            <NavItems items={navItems} />
            <div className="flex items-center gap-4">
              <NavbarButton
                href={LOGIN_URL}
                className="flex items-center gap-2"
                variant="primary"
              >
                <LogIn size="16" />
                Get Started
              </NavbarButton>
            </div>
          </NavBody>

          <MobileNavWrapper items={navItems} />
        </Navbar>
        {children}
        <Footer />
        <CookieConsentPopup />
      </body>
    </html>
  );
}
