"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from "recharts";
import { ChartErrorBoundary } from "./chart-error-boundary";

// Type definitions
interface TokenChartData {
  date: string;
  images: number;
  video: number;
  livestream: number;
  total: number;
}

interface TooltipPayload {
  dataKey: string;
  value: number;
  color: string;
  payload: TokenChartData;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
}

interface LegendEntry {
  value: string;
  color: string;
}

interface CustomLegendProps {
  payload?: LegendEntry[];
}

// Data contoh untuk chart
const chartData: TokenChartData[] = [
  { date: "2025-01-01", images: 120, video: 45, livestream: 30, total: 195 },
  { date: "2025-01-02", images: 180, video: 60, livestream: 25, total: 265 },
  { date: "2025-01-03", images: 150, video: 80, livestream: 40, total: 270 },
  { date: "2025-01-04", images: 220, video: 70, livestream: 35, total: 325 },
  { date: "2025-01-05", images: 190, video: 90, livestream: 50, total: 330 },
  { date: "2025-01-06", images: 250, video: 85, livestream: 45, total: 380 },
  { date: "2025-01-07", images: 210, video: 95, livestream: 55, total: 360 },
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {new Date(String(label || '')).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          })}
        </p>
        <div className="space-y-1">
          {payload.map((entry, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {entry.dataKey === 'images' && 'Images'}
                {entry.dataKey === 'video' && 'Video'}
                {entry.dataKey === 'livestream' && 'LiveStream'}
                {entry.dataKey === 'total' && 'Total'}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom legend component
const CustomLegend = ({ payload }: CustomLegendProps) => {
  // Fallback data jika payload undefined
  const legendData: LegendEntry[] = payload || [
    { value: 'images', color: '#3B82F6' },
    { value: 'video', color: '#8B5CF6' },
    { value: 'livestream', color: '#10B981' },
    { value: 'total', color: '#F59E0B' }
  ];

  return (
    <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
      {legendData.map((entry, index: number) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {entry.value === 'images' && 'Images'}
            {entry.value === 'video' && 'Video'}
            {entry.value === 'livestream' && 'LiveStream'}
            {entry.value === 'total' && 'Total'}
          </span>
        </div>
      ))}
    </div>
  );
};

export function TokenUsageChart() {
  return (
    <ChartErrorBoundary>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <defs>
              <linearGradient id="colorImages" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorVideo" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorLivestream" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#F59E0B" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E5E7EB" 
              strokeOpacity={0.3}
            />
            <XAxis 
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="images"
              stroke="#3B82F6"
              strokeWidth={2}
              fill="url(#colorImages)"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="video"
              stroke="#8B5CF6"
              strokeWidth={2}
              fill="url(#colorVideo)"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="livestream"
              stroke="#10B981"
              strokeWidth={2}
              fill="url(#colorLivestream)"
              fillOpacity={1}
            />
            <Area
              type="monotone"
              dataKey="total"
              stroke="#F59E0B"
              strokeWidth={3}
              fill="url(#colorTotal)"
              fillOpacity={1}
              strokeDasharray="5 5"
            />
          </AreaChart>
        </ResponsiveContainer>
        <CustomLegend />
      </div>
    </ChartErrorBoundary>
  );
}

// Alternative Line Chart Component
export function TokenUsageLineChart() {
  return (
    <ChartErrorBoundary>
      <div className="w-full h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={chartData}
            margin={{
              top: 20,
              right: 30,
              left: 20,
              bottom: 20,
            }}
          >
            <CartesianGrid 
              strokeDasharray="3 3" 
              stroke="#E5E7EB" 
              strokeOpacity={0.3}
            />
            <XAxis 
              dataKey="date"
              tickFormatter={(value) => new Date(value).toLocaleDateString('id-ID', { month: 'short', day: 'numeric' })}
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
            />
            <YAxis 
              stroke="#6B7280"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => value.toLocaleString()}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line
              type="monotone"
              dataKey="images"
              stroke="#3B82F6"
              strokeWidth={3}
              dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="video"
              stroke="#8B5CF6"
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="livestream"
              stroke="#10B981"
              strokeWidth={3}
              dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
            />
            <Line
              type="monotone"
              dataKey="total"
              stroke="#F59E0B"
              strokeWidth={4}
              strokeDasharray="5 5"
              dot={{ fill: '#F59E0B', strokeWidth: 2, r: 5 }}
              activeDot={{ r: 7, stroke: '#F59E0B', strokeWidth: 2 }}
            />
          </LineChart>
        </ResponsiveContainer>
        <CustomLegend />
      </div>
    </ChartErrorBoundary>
  );
}
