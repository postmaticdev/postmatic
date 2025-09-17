"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Area,
  AreaChart,
} from "recharts";

// Type definitions
interface BarChartData {
  name: string;
  images: number;
  video: number;
  livestream: number;
}

interface PieChartData {
  name: string;
  value: number;
  color: string;
  percent?: number;
}

interface LineChartData {
  name: string;
  usage: number;
  trend: number;
}

interface TooltipPayload {
  dataKey: string;
  value: number;
  color: string;
  payload: BarChartData | PieChartData | LineChartData;
  percent?: number;
}

interface TooltipProps {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string | number;
}

// Data untuk berbagai jenis chart
const barChartData: BarChartData[] = [
  { name: "Jan", images: 400, video: 240, livestream: 200 },
  { name: "Feb", images: 300, video: 139, livestream: 180 },
  { name: "Mar", images: 200, video: 980, livestream: 120 },
  { name: "Apr", images: 278, video: 390, livestream: 160 },
  { name: "May", images: 189, video: 480, livestream: 100 },
  { name: "Jun", images: 239, video: 380, livestream: 140 },
];

const pieChartData: PieChartData[] = [
  { name: "Gambar", value: 400, color: "#3B82F6" },
  { name: "Video", value: 300, color: "#8B5CF6" },
  { name: "Siaran Langsung", value: 300, color: "#10B981" },
  { name: "Lainnya", value: 200, color: "#F59E0B" },
];

const lineChartData: LineChartData[] = [
  { name: "Week 1", usage: 400, trend: 240 },
  { name: "Week 2", usage: 300, trend: 139 },
  { name: "Week 3", usage: 200, trend: 980 },
  { name: "Week 4", usage: 278, trend: 390 },
  { name: "Week 5", usage: 189, trend: 480 },
  { name: "Week 6", usage: 239, trend: 380 },
];

// Custom tooltip untuk bar chart
const BarTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
          {label}
        </p>
        <div className="space-y-1">
          {payload && payload.map((entry, index: number) => (
            <div key={index} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-gray-600 dark:text-gray-300">
                {entry.dataKey === 'images' && 'Images'}
                {entry.dataKey === 'video' && 'Video'}
                {entry.dataKey === 'livestream' && 'LiveStream'}
              </span>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">
                {entry.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

// Custom tooltip untuk pie chart
const PieTooltip = ({ active, payload }: TooltipProps) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: data.color }}
          />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {data.payload.name}
          </span>
        </div>
        <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
          Value: <span className="font-semibold">{data.value}</span>
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-300">
          Percentage: <span className="font-semibold">{data.percent ? (data.percent * 100).toFixed(0) : 0}%</span>
        </p>
      </div>
    );
  }
  return null;
};

// Bar Chart Component
export function AnalyticsBarChart() {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={barChartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.3} />
          <XAxis 
            dataKey="name" 
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
          />
          <Tooltip content={<BarTooltip />} />
          <Bar dataKey="images" fill="#3B82F6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="video" fill="#8B5CF6" radius={[4, 4, 0, 0]} />
          <Bar dataKey="livestream" fill="#10B981" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

// Pie Chart Component
export function AnalyticsPieChart() {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={pieChartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={({ name, percent }: { name?: string; percent?: number }) => `${name || ''} ${percent ? (percent * 100).toFixed(0) : 0}%`}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {pieChartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<PieTooltip />} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

// Line Chart Component
export function AnalyticsLineChart() {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={lineChartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.3} />
          <XAxis 
            dataKey="name" 
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
          />
          <Tooltip 
            content={({ active, payload, label }: TooltipProps) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {label}
                    </p>
                    <div className="space-y-1">
                      {payload && payload.map((entry, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {entry.dataKey === 'usage' && 'Usage'}
                            {entry.dataKey === 'trend' && 'Trend'}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Line
            type="monotone"
            dataKey="usage"
            stroke="#3B82F6"
            strokeWidth={3}
            dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="trend"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

// Area Chart Component
export function AnalyticsAreaChart() {
  return (
    <div className="w-full h-80">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={lineChartData}
          margin={{
            top: 20,
            right: 30,
            left: 20,
            bottom: 20,
          }}
        >
          <defs>
            <linearGradient id="colorUsage" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.3} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" strokeOpacity={0.3} />
          <XAxis 
            dataKey="name" 
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
          />
          <Tooltip 
            content={({ active, payload, label }: TooltipProps) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700">
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                      {label}
                    </p>
                    <div className="space-y-1">
                      {payload && payload.map((entry, index: number) => (
                        <div key={index} className="flex items-center gap-2">
                          <div
                            className="w-3 h-3 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span className="text-sm text-gray-600 dark:text-gray-300">
                            {entry.dataKey === 'usage' && 'Usage'}
                            {entry.dataKey === 'trend' && 'Trend'}
                          </span>
                          <span className="text-sm font-semibold text-gray-900 dark:text-white">
                            {entry.value}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              }
              return null;
            }}
          />
          <Area
            type="monotone"
            dataKey="usage"
            stroke="#3B82F6"
            strokeWidth={2}
            fill="url(#colorUsage)"
            fillOpacity={1}
          />
          <Area
            type="monotone"
            dataKey="trend"
            stroke="#10B981"
            strokeWidth={2}
            fill="url(#colorTrend)"
            fillOpacity={1}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
