import {
  Bot,
  Zap,
  BarChart3,
  Calendar,
  Target,
  Megaphone,
  Shield,
  Users,
} from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { IMAGE_PATH } from "@/constants/path-file";
import { getContainerMargins } from "@/lib/utils";

// Type definitions for the data structures
interface Feature {
  icon: string;
  title: string;
  description: string;
  color: string;
}

interface HighlightPoint {
  title: string;
  description: string;
}

const icons: Record<string, React.ElementType> = {
  Bot,
  Zap,
  BarChart3,
  Calendar,
  Target,
  Megaphone,
  Shield,
  Users,
};

// Gradasi untuk kartu (seperti Contoh 2)
const cardGradients: Record<string, string> = {
  blue: "from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20",
  purple: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
  green: "from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20",
  orange: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20",
  pink: "from-pink-50 to-pink-100 dark:from-pink-900/20 dark:to-pink-800/20",
  indigo: "from-indigo-50 to-indigo-100 dark:from-indigo-900/20 dark:to-indigo-800/20",
  teal: "from-teal-50 to-teal-100 dark:from-teal-900/20 dark:to-teal-800/20",
  rose: "from-rose-50 to-rose-100 dark:from-rose-900/20 dark:to-rose-800/20",
};



export default function FeaturesSection() {
  const t = useTranslations('featuresSection');

  return (
    <section
      id="features"
      className="py-20 bg-gradient-to-b from-white via-blue-50 to-indigo-50 dark:from-black dark:via-slate-950 dark:to-slate-900"
    >
      <div className={getContainerMargins()}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
              {t('title')}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-sm">
                {t('titleHighlight')}
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {t.raw('features').map((feature: Feature, index: number) => {
              const Icon = icons[feature.icon];
              const cardGradient = cardGradients[feature.color];
              const isComingSoon = feature.title === "Chat AI Assistant" || feature.title === "Auto Advertising";

              return (
                <div
                  key={index}
                  className={`bg-gradient-to-br ${cardGradient} p-6 rounded-xl shadow-lg border border-border dark:border-slate-700 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group relative`}
                >
                  {/* Coming Soon Badge */}
                  {isComingSoon && (
                    <div className="absolute -top-3 -right-3 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg z-10">
                      Coming Soon
                    </div>
                  )}
                  
                  <div
                    className={`w-14 h-14 bg-gradient-to-r ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}
                  >
                    <Icon className="h-7 w-7 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white mb-3 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Feature Highlight */}
          <div className="mt-16 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-900/5 dark:to-indigo-900/5 rounded-2xl p-8 shadow-xl border border-border dark:border-slate-700">
            <div className="grid lg:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                  {t('highlight.title')}
                </h3>
                <div className="space-y-4">
                  {t.raw('highlight.points').map((p: HighlightPoint, i: number) => (
                    <div key={i} className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                        <span className="text-green-600 dark:text-green-300 text-sm">
                          ✓
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900 dark:text-white">
                          {p.title}
                        </div>
                        <div className="text-gray-700 dark:text-gray-300 text-sm">
                          {p.description}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="relative">
                <div className="bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-2xl p-8 h-64 flex items-center justify-center">
                  <div className="text-center">
                    <Image
                      src={IMAGE_PATH}
                      alt="AI Marketing Assistant"
                      className="h-16 w-16 text-blue-600 dark:text-blue-400 mx-auto mb-4"
                      width={40}
                      height={40}
                    />
                    <div className="text-lg font-semibold text-gray-900 dark:text-white">
                      AI Marketing Assistant
                    </div>
                    <div className="text-gray-600 dark:text-gray-300">
                      Bekerja 24/7 untuk bisnis Anda
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}