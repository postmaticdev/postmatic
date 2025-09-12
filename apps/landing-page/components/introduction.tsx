import Image from "next/image";
import { MacWindow } from "./custom/mac-window";
import texts from "@/content/id/text.json";
import { getContainerMargins } from "@/lib/utils";
import { cn } from "@/lib/utils";

export default function Introduction() {
  const { headline, brand, subHeadline } = texts.introduction;

  return (
    <section
      id="about"
      className="relative min-h-screen flex items-center bg-gradient-to-b from-white to-blue-50 dark:from-black dark:via-slate-950 dark:to-slate-900 overflow-hidden"
    >
      <div className={cn("relative pt-20 pb-32", getContainerMargins())}>
        <div className="max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 md:gap-14 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight text-white dark:text-slate-100 tracking-tight">
                {headline}{" "}
                <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-sm">
                  {brand}
                </span>
                ?
              </h1>

              <p className="text-base sm:text-lg md:text-xl leading-relaxed text-slate-300 dark:text-slate-400">
                {subHeadline}
              </p>
            </div>

            {/* Hero Image/Dashboard Preview */}
            <div className="relative">
              <MacWindow keepAspectRatio hoverZoom title="POSTMATIC Dashboard">
                <div className="flex items-center h-[230px]">
                  <Image
                    fill
                    src="/content/dashboard-preview.png"
                    alt="POSTMATIC Dashboard Preview"
                    className="object-cover rounded-b-xl"
                  />
                </div>
              </MacWindow>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
