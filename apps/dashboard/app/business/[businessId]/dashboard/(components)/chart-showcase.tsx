"use client";

import { useState } from "react";
import { TokenUsageChart, TokenUsageLineChart } from "./token-usage-chart";
import { 
  AnalyticsBarChart, 
  AnalyticsPieChart, 
  AnalyticsLineChart, 
  AnalyticsAreaChart 
} from "./analytics-chart-examples";

const chartTypes = [
  { id: "area", name: "Grafik Area", component: TokenUsageChart },
  { id: "line", name: "Grafik Garis", component: TokenUsageLineChart },
  { id: "bar", name: "Grafik Batang", component: AnalyticsBarChart },
  { id: "pie", name: "Grafik Pie", component: AnalyticsPieChart },
  { id: "line-alt", name: "Garis Alternatif", component: AnalyticsLineChart },
  { id: "area-alt", name: "Area Alternatif", component: AnalyticsAreaChart },
];

export function ChartShowcase() {
  const [activeChart, setActiveChart] = useState("area");

  const ActiveComponent = chartTypes.find(chart => chart.id === activeChart)?.component || TokenUsageChart;

  return (
    <div className="w-full space-y-6">
      {/* Chart Type Selector */}
      <div className="flex flex-wrap gap-2">
        {chartTypes.map((chart) => (
          <button
            key={chart.id}
            onClick={() => setActiveChart(chart.id)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
              activeChart === chart.id
                ? "bg-blue-600 text-white shadow-lg"
                : "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            {chart.name}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="bg-white dark:bg-gray-900 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {chartTypes.find(chart => chart.id === activeChart)?.name} - Token Usage Analytics
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Interactive chart dengan tooltip hover dan styling modern
          </p>
        </div>
        
        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <ActiveComponent />
        </div>
      </div>

      {/* Chart Features */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">✨ Modern Design</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Clean, minimalis dengan gradient dan rounded corners
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🎯 Interactive Tooltip</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Hover untuk melihat detail data dengan informasi lengkap
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📱 Responsive</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Otomatis menyesuaikan dengan ukuran layar
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🌙 Dark Mode</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mendukung tema gelap dan terang
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">📊 Multiple Types</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Area, Line, Bar, dan Pie chart tersedia
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-900 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <h4 className="font-semibold text-gray-900 dark:text-white mb-2">🎨 Customizable</h4>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Mudah disesuaikan warna dan styling
          </p>
        </div>
      </div>
    </div>
  );
}
