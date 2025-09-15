import {
  CheckCircle,
  Zap,
  Target,
  BarChart3,
  Calendar,
  Megaphone,
} from "lucide-react";
import { useTranslations } from "next-intl";
import { getContainerMargins } from "@/lib/utils";

// Type definitions for the data structures
interface Step {
  icon: string;
  title: string;
  description: string;
  benefit: string;
  colors: string;
}

interface ImpactStat {
  value: string;
  label: string;
}

const icons: Record<string, React.ElementType> = {
  CheckCircle,
  Zap,
  Target,
  BarChart3,
  Calendar,
  Megaphone,
};

export default function SolutionSection() {
  const t = useTranslations('solutionSection');

  return (
    <section className="py-20 bg-gradient-to-b from-indigo-50 via-blue-50 to-white dark:from-slate-900 dark:via-slate-950 dark:to-black">
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
            <p className="text-base sm:text-lg md:text-xl text-gray-600 dark:text-gray-300 max-w-4xl mx-auto leading-relaxed">
              {t('subtitle')}
            </p>
          </div>

          {/* Solution Steps */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {t.raw('steps').map((step: Step, i: number) => {
              const Icon = icons[step.icon];
              return (
                <div
                  key={i}
                  className={`bg-gradient-to-br ${step.colors} p-6 rounded-xl hover:shadow-lg transition-shadow border border-border dark:border-slate-700`}
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
              {t('impactTitle')}
            </h3>
            <div className="grid md:grid-cols-4 gap-6">
              {t.raw('impactStats').map((stat: ImpactStat, i: number) => (
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
