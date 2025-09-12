import {
  CheckCircle,
  Zap,
  Target,
  BarChart3,
  Calendar,
  Megaphone,
} from "lucide-react";
import texts from "@/content/id/text.json";
import { getContainerMargins } from "@/lib/utils";
const icons: Record<string, React.ElementType> = {
  CheckCircle,
  Zap,
  Target,
  BarChart3,
  Calendar,
  Megaphone,
};

export default function SolutionSection() {
  const {
    title,
    titleHighlight,
    subtitle,
    steps,
    impactTitle,
    impactStats,
  } = texts.solutionSection;

  return (
    <section className="py-20 bg-gradient-to-b from-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-black">
      <div className={getContainerMargins()}>
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">

            <h2 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white mb-6 leading-tight tracking-tight">
              {title}{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent drop-shadow-sm">
                {titleHighlight}
              </span>
            </h2>
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Solution Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {steps.map((step, i) => {
              const Icon = icons[step.icon];
              return (
                <div
                  key={i}
                  className={`bg-gradient-to-br ${step.colors} p-6 rounded-xl hover:shadow-lg transition-shadow dark:border dark:border-slate-700`}
                >
                  <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-base sm:text-lg font-extrabold text-gray-900 dark:text-white mb-2 leading-tight">
                    {step.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                    {step.description}
                  </p>
                  <div className="text-xs sm:text-sm text-blue-600 dark:text-blue-400 font-semibold">
                    ✓ {step.benefit}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Impact Statistics */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-700 dark:to-indigo-700 rounded-2xl p-8 text-white">
            <h3 className="text-xl sm:text-2xl font-extrabold text-center mb-8 leading-tight">
              {impactTitle}
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              {impactStats.map((stat, i) => (
                <div key={i} className="text-center">
                  <div className="text-2xl sm:text-3xl font-extrabold mb-2 leading-tight">{stat.value}</div>
                  <div className="text-sm sm:text-base text-blue-100 dark:text-blue-200 leading-relaxed">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
