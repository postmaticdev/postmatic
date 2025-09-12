import { AlertTriangle, Clock, DollarSign, TrendingDown } from "lucide-react";
import texts from "@/content/id/text.json";
import { getContainerMargins } from "@/lib/utils";

const icons: Record<string, React.ElementType> = {
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingDown,
};

// Warna gradasi untuk kartu (seperti Contoh 2)
const cardGradients: Record<string, string> = {
  red: "from-red-50 to-red-100 dark:from-red-900/20 dark:to-red-800/20",
  orange: "from-orange-50 to-orange-100 dark:from-orange-900/20 dark:to-orange-800/20",
  yellow: "from-yellow-50 to-yellow-100 dark:from-yellow-900/20 dark:to-yellow-800/20",
  purple: "from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20",
};

// Warna gradasi untuk ikon (seperti Contoh 1)
const iconGradients: Record<string, string> = {
  red: "from-red-500 to-red-600",
  orange: "from-orange-500 to-orange-600",
  yellow: "from-yellow-500 to-yellow-600",
  purple: "from-purple-500 to-purple-600",
};

export default function ProblemSection() {
  const {
    title,
    subtitle,
    stats,
    fakeSolutionsTitle,
    existingTools,
    agencyFreelancer,
  } = texts.problemSection;

  return (
    <section className="py-20 bg-gradient-to-b from-blue-50 via-white to-indigo-50 dark:from-black dark:via-slate-950 dark:to-slate-900">
      <div className={getContainerMargins()}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
              {title}
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {stats.map((s, i) => {
              const Icon = icons[s.icon];
              const cardGradient = cardGradients[s.color];
              const iconGradient = iconGradients[s.color];

              return (
                <div
                  key={i}
                  className={`bg-gradient-to-br ${cardGradient} p-6 rounded-xl shadow-lg border border-gray-100 dark:border-slate-700 text-center hover:shadow-xl transition-shadow`}
                >
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${iconGradient} rounded-full flex items-center justify-center mx-auto mb-4`}
                  >
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <div className={`text-2xl sm:text-3xl font-extrabold mb-2 text-gray-900 dark:text-white leading-tight`}>
                    {s.value}
                  </div>
                  <div className="text-sm sm:text-base text-gray-700 dark:text-gray-300 leading-relaxed">
                    {s.label}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Fake Solutions */}
          <div className="bg-gradient-to-br from-red-50 to-red-100 dark:from-red-900/10 dark:to-red-800/10 rounded-2xl p-8 shadow-xl border border-gray-100 dark:border-slate-700">
            <h3 className="text-xl sm:text-2xl font-extrabold text-gray-900 dark:text-white mb-6 text-center leading-tight">
              {fakeSolutionsTitle}
            </h3>
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {existingTools.title}
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  {existingTools.points.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-red-600 dark:text-red-400">
                  {agencyFreelancer.title}
                </h4>
                <ul className="space-y-2 text-gray-600 dark:text-gray-300">
                  {agencyFreelancer.points.map((p, i) => (
                    <li key={i}>• {p}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}