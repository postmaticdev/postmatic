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
import { ThemeProvider } from "@/components/theme-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { LanguageToggle } from "@/components/language-toggle";
import { getMessages, getTranslations } from "next-intl/server";
import { Locale, routing } from "@/i18n/routing";
import { NextIntlClientProvider } from "next-intl";
import { notFound } from "next/navigation";

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

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: { locale: Locale };
}>) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as Locale)) {
    notFound();
  }
  
  const t = await getTranslations('navigation');
  const tButtons = await getTranslations('buttons');
  const navItems = [
    { name: t('about'), link: "/#about" },
    { name: t('features'), link: "/#features" },
    { name: t('tutorial'), link: "/#tutorial" },
    { name: t('pricing'), link: "/#pricing" },
  ];
  
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();
  return (
    <html
      lang={locale}
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
        <NextIntlClientProvider messages={messages}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Navbar className="top-0">
            <NavBody>
              <NavbarLogo />
              <NavItems items={navItems} />
              <div className="flex items-center gap-2">
                {/* tombol ID / EN */}
                <LanguageToggle />
                <ThemeToggle />
                <NavbarButton
                  href={LOGIN_URL}
                  className="flex items-center gap-2"
                  variant="primary"
                >
                  <LogIn size="16" />
                  {tButtons('getStarted')}
                </NavbarButton>
              </div>
            </NavBody>

            <MobileNavWrapper items={navItems} />
          </Navbar>
          {children}
          <Footer />
          <CookieConsentPopup />
        </ThemeProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
