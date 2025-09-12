import EndToEndClient from "./end-to-end.client";
import texts from "@/content/id/text.json";
import { getContainerMargins } from "@/lib/utils";

export default function EndToEnd() {
  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      <div className={getContainerMargins()}>
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-sm">{texts.endToEnd.highlight}</span>
            <span className="block sm:inline sm:ml-2">{texts.endToEnd.title}</span>
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            {texts.endToEnd.description}
          </p>
        </div>
        
        <EndToEndClient />
      </div>
    </section>
  );
}
