"use client";

import { useState, useMemo, useEffect } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
} from "recharts";
import { ChartErrorBoundary } from "./chart-error-boundary";
import { 
  getChartData, 
  getDateRangeLabel, 
  formatXAxisLabel,
  type TimePeriod,
  type ChartDataPoint 
} from "../../../../../lib/chart-data-generator";

type ChartType = 'area' | 'bar' | 'line';

// Type definitions for tooltip components
interface TooltipPayload {
  dataKey: string;
  value: number;
  color: string;
  payload: ChartDataPoint;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
  period?: TimePeriod;
  chartType?: ChartType;
}

// Loading component
const ChartLoading = () => (
  <div className="w-full h-80 bg-gray-50 dark:bg-gray-800 rounded-lg flex items-center justify-center">
    <div className="text-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
      <p className="text-sm text-gray-600 dark:text-gray-400">Memuat data chart...</p>
    </div>
  </div>
);

// Custom tooltip component
const CustomTooltip = ({ active, payload, label, period }: CustomTooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[200px]">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          {formatXAxisLabel(String(label || ''), period || '7d')}
        </p>
        <div className="space-y-2">
          {payload.map((entry, index: number) => (
            <div key={index} className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2">
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
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {entry.value.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-3 pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-400">Total:</span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {payload.reduce((sum: number, entry) => sum + entry.value, 0).toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

// Chart type selector
const ChartTypeSelector = ({ 
  chartType, 
  onChartTypeChange 
}: { 
  chartType: ChartType; 
  onChartTypeChange: (type: ChartType) => void;
}) => {
  const chartTypes = [
    { value: 'area', label: 'Area Chart', icon: '📊' },
    { value: 'bar', label: 'Bar Chart', icon: '📈' },
    { value: 'line', label: 'Line Chart', icon: '📉' },
  ] as const;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Tipe Chart:</span>
      <div className="flex gap-1">
        {chartTypes.map((type) => (
          <button
            key={type.value}
            onClick={() => onChartTypeChange(type.value as ChartType)}
            className={`px-3 py-1 rounded-lg text-sm transition-colors ${
              chartType === type.value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
            title={type.label}
          >
            {type.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

// Period selector component
const PeriodSelector = ({ 
  period, 
  onPeriodChange 
}: { 
  period: TimePeriod; 
  onPeriodChange: (period: TimePeriod) => void;
}) => {
  const periods = [
    { value: '7d', label: '7 Hari' },
    { value: '30d', label: '30 Hari' },
    { value: '1y', label: '1 Tahun' },
  ] as const;

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Periode:</span>
      <select
        value={period}
        onChange={(e) => onPeriodChange(e.target.value as TimePeriod)}
        className="text-sm border border-border rounded px-3 py-1 bg-background focus:outline-none focus:ring-2 focus:ring-blue-500"
      >
        {periods.map((p) => (
          <option key={p.value} value={p.value}>
            {p.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Chart renderer based on type
const ChartRenderer = ({ 
  data, 
  period, 
  chartType 
}: { 
  data: ChartDataPoint[]; 
  period: TimePeriod; 
  chartType: ChartType;
}) => {
  const commonProps = {
    data,
    margin: { top: 20, right: 30, left: 20, bottom: 20 },
  };

  const axisProps = {
    XAxis: {
      dataKey: "date",
      tickFormatter: (value: string) => formatXAxisLabel(value, period),
      stroke: "#6B7280",
      fontSize: 12,
      tickLine: false,
      axisLine: false,
    },
    YAxis: {
      stroke: "#6B7280",
      fontSize: 12,
      tickLine: false,
      axisLine: false,
      tickFormatter: (value: number) => value.toLocaleString(),
    },
    CartesianGrid: {
      strokeDasharray: "3 3",
      stroke: "#E5E7EB",
      strokeOpacity: 0.3,
    },
    Tooltip: {
      content: (props: CustomTooltipProps) => <CustomTooltip {...props} period={period} chartType={chartType} />,
    },
  };

  if (chartType === 'area') {
    return (
      <AreaChart {...commonProps}>
        <defs>
          <linearGradient id="colorImages" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorVideo" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
          </linearGradient>
          <linearGradient id="colorLivestream" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
          </linearGradient>
        </defs>
        <CartesianGrid {...axisProps.CartesianGrid} />
        <XAxis {...axisProps.XAxis} />
        <YAxis {...axisProps.YAxis} />
        <Tooltip {...axisProps.Tooltip} />
        <Area
          type="monotone"
          dataKey="images"
          stackId="1"
          stroke="#3B82F6"
          strokeWidth={2}
          fill="url(#colorImages)"
          fillOpacity={1}
        />
        <Area
          type="monotone"
          dataKey="video"
          stackId="1"
          stroke="#8B5CF6"
          strokeWidth={2}
          fill="url(#colorVideo)"
          fillOpacity={1}
        />
        <Area
          type="monotone"
          dataKey="livestream"
          stackId="1"
          stroke="#10B981"
          strokeWidth={2}
          fill="url(#colorLivestream)"
          fillOpacity={1}
        />
      </AreaChart>
    );
  }

  if (chartType === 'bar') {
    return (
      <BarChart {...commonProps}>
        <CartesianGrid {...axisProps.CartesianGrid} />
        <XAxis {...axisProps.XAxis} />
        <YAxis {...axisProps.YAxis} />
        <Tooltip {...axisProps.Tooltip} />
        <Bar dataKey="images" fill="#3B82F6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="video" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
        <Bar dataKey="livestream" fill="#10B981" radius={[4, 4, 0, 0]} />
      </BarChart>
    );
  }

  if (chartType === 'line') {
    return (
      <LineChart {...commonProps}>
        <CartesianGrid {...axisProps.CartesianGrid} />
        <XAxis {...axisProps.XAxis} />
        <YAxis {...axisProps.YAxis} />
        <Tooltip {...axisProps.Tooltip} />
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
      </LineChart>
    );
  }

  return null;
};

// Main interactive chart component
export function InteractiveTokenChart() {
  const [period, setPeriod] = useState<TimePeriod>('7d');
  const [chartType, setChartType] = useState<ChartType>('area');
  const [isLoading, setIsLoading] = useState(false);
  
  const chartData = useMemo(() => getChartData(period), [period]);
  const dateRangeLabel = useMemo(() => getDateRangeLabel(period), [period]);

  // Simulate loading when changing period or chart type
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, [period, chartType]);


  return (
    <ChartErrorBoundary>
      <div className="w-full">
        {/* Header with controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Interactive Token Analytics
            </h3>
            <p className="text-sm text-muted-foreground">
              {dateRangeLabel}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <ChartTypeSelector chartType={chartType} onChartTypeChange={setChartType} />
            <PeriodSelector period={period} onPeriodChange={setPeriod} />
          </div>
        </div>

        {/* Chart container */}
        <div className="bg-white dark:bg-gray-900 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
          <div className="h-80">
            {isLoading ? (
              <ChartLoading />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <ChartRenderer data={chartData} period={period} chartType={chartType} />
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Summary stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { key: 'images', label: 'Images', color: '#3B82F6' },
            { key: 'video', label: 'Video', color: '#8B5CF6' },
            { key: 'livestream', label: 'LiveStream', color: '#10B981' },
            { key: 'total', label: 'Total', color: '#F59E0B' },
          ].map(({ key, label, color }) => {
            const total = chartData.reduce((sum: number, item: ChartDataPoint) => sum + (item[key as keyof ChartDataPoint] as number), 0);
            const average = Math.round(total / chartData.length);
            
            return (
              <div key={key} className="bg-white dark:bg-gray-900 p-4 rounded-lg border border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    {label}
                  </span>
                </div>
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {total.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-500">
                  Rata-rata: {average.toLocaleString()}/hari
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </ChartErrorBoundary>
  );
}
