"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { SIGNUP_URL } from "@/constants";
import { getContainerMargins } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";

export default function CTASection() {
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  
  // Handle hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);
  
  // Use resolvedTheme for more accurate theme detection
  const isDark = mounted ? (resolvedTheme === "dark") : false;
  const t = useTranslations('ctaSection');
  
  return (
    <section className="py-20 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-10 w-32 h-32 bg-white/10 rounded-full animate-pulse"></div>
        <div className="absolute bottom-20 right-20 w-24 h-24 bg-white/10 rounded-full animate-pulse delay-1000"></div>
        <div className="absolute top-40 right-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse delay-500"></div>
      </div>

      <div className={cn(getContainerMargins(), "relative z-10")}>
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extrabold text-white mb-6 leading-tight tracking-tight">
            {t('title')} <br />
            <span className="text-yellow-300 drop-shadow-sm">{t('titleHighlight')}</span> {t('subtitle')}?
          </h2>

          <p className="text-base sm:text-lg md:text-xl text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t('cta')}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-row gap-3 sm:gap-4 justify-center items-center mb-8">
            <a
              href="https://mail.google.com/mail/?view=cm&fs=1&to=team@postmatic.id&su=Halo%20Postmatic&body=Halo%20tim%20Postmatic%2C%0A%0ASaya%20tertarik%20untuk%20menggunakan%20layanan%20Anda%2C%20tolong%20berikan%20informasi%20lebih%20lanjut."
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="bg-secondary text-white text-sm sm:text-base font-semibold px-6 sm:px-8 py-3 h-auto rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 border-0 min-w-[140px] sm:min-w-[160px]">
                {t('contactUs')}
              </Button>
            </a>

            <Link href={SIGNUP_URL}>
              <Button className="bg-white text-primary hover:bg-gray-100 text-sm sm:text-base font-semibold px-6 sm:px-8 py-3 h-auto rounded-lg shadow-lg hover:shadow-xl transform transition-all duration-300 hover:scale-105 border-0 min-w-[140px] sm:min-w-[160px]">
                {t('getStarted')}
                <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom wave */}
      <div className="absolute bottom-[-1px] left-0 right-0 z-0">
        <svg
          viewBox="0 0 1440 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {isDark ? (
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#101828"
            />
          ) : (
            <path
              d="M0 120L60 110C120 100 240 80 360 70C480 60 600 60 720 65C840 70 960 80 1080 85C1200 90 1320 90 1380 90L1440 90V120H1380C1320 120 1200 120 1080 120C960 120 840 120 720 120C600 120 480 120 360 120C240 120 120 120 60 120H0Z"
              fill="#f5f5f5"
            />
          )}
        </svg>
      </div>
    </section>
  );
}
