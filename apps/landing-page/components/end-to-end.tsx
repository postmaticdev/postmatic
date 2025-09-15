import EndToEndClient from "./end-to-end.client";
import { useTranslations } from "next-intl";
import { getContainerMargins } from "@/lib/utils";

export default function EndToEnd() {
  const t = useTranslations('endToEnd');
  
  return (
    <section className="py-20 bg-gradient-to-b from-indigo-50 via-blue-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black">
      <div className={getContainerMargins()}>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-sm">{t('highlight')}</span>
            <span className="block sm:inline sm:ml-2">{t('title')}</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {t('description')}
          </p>
        </div>
        
        <EndToEndClient />
      </div>
    </section>
  );
}
