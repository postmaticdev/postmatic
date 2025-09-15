import { MacWindow } from "./custom/mac-window";

import { getContainerMargins } from "@/lib/utils";
import { cn } from "@/lib/utils";
import { useTranslations } from "next-intl";

export default function Introduction() {
  const t = useTranslations('introduction');
  
  return (
    <section
      id="about"
      className="relative min-h-screen flex items-center bg-gradient-to-b from-white via-blue-50 to-indigo-50 dark:from-black dark:via-slate-950 dark:to-slate-900 overflow-hidden"
    >
      <div className={cn("relative pt-20 pb-32", getContainerMargins())}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 md:gap-14 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-slate-900 dark:text-slate-100 tracking-tight">
                {t('headline')}{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-sm">
                  {t('brand')}
                </span>
                ?
              </h1>

              <p className="text-base sm:text-lg md:text-xl leading-relaxed text-slate-600 dark:text-slate-400">
                {t('subHeadline')}
              </p>
            </div>

            {/* Hero Video/Dashboard Preview */}
            <div className="relative">
              <MacWindow keepAspectRatio hoverZoom title="POSTMATIC Dashboard">
               
                  <iframe
                    id="player"
                    src="https://www.youtube.com/embed/-SGRFFzN504?autoplay=0&enablejsapi=1&rel=0&modestbranding=1&showinfo=0&iv_load_policy=3"
                    className=" w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  ></iframe>
             
              </MacWindow>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
