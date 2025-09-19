"use client";

import { useState, useMemo } from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { ChartErrorBoundary } from "./chart-error-boundary";
import { formatXAxisLabel, type TimePeriod } from "@/lib/chart-data-generator";
import { FilterQuery } from "@/models/api/base-response.type";
import { useTokenGetAnalyticUsage } from "@/services/tier/token.api";
import { useParams } from "next/navigation";
import { dateManipulation } from "@/helper/date-manipulation";
import { dateFormat } from "@/helper/date-format";
import { Button } from "@/components/ui/button";

interface CustomTooltipPayload {
  color: string;
  dataKey: string;
  value: number;
}

interface CustomTooltipProps {
  active: boolean;
  payload: CustomTooltipPayload[];
  label: string;
  period: TimePeriod;
}

// Custom tooltip component
const CustomTooltip = ({
  active,
  payload,
  label,
  period,
}: CustomTooltipProps) => {
  const total = payload.find((entry) => entry.dataKey === "Total");
  const otherPayload = payload.filter((entry) => entry.dataKey !== "Total");

  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 min-w-[200px]">
        <p className="text-sm font-medium text-gray-900 dark:text-white mb-3">
          {formatXAxisLabel(label, period)}
        </p>
        <div className="space-y-2">
          {otherPayload.map((entry, index) => (
            <div
              key={index}
              className="flex items-center justify-between gap-3"
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: entry.color }}
                />
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  {entry.dataKey === "Image" && "Gambar"}
                  {entry.dataKey === "Video" && "Video"}
                  {entry.dataKey === "LiveStream" && "Siaran Langsung"}
                  {entry.dataKey === "Total" && "Total"}
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
            <span className="text-gray-600 dark:text-gray-400 flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: total?.color }}
              />
              Total:
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {total?.value?.toLocaleString()}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

interface CustomLegendProps {
  payload: CustomLegendPayload[];
}

interface CustomLegendPayload {
  value: string;
  color: string;
}

// Custom legend component
const CustomLegend = ({ payload }: CustomLegendProps) => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-6 mt-4">
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-2">
          <div
            className="w-3 h-3 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-sm text-gray-600 dark:text-gray-300">
            {entry.value === "Gambar" && "Gambar"}
            {entry.value === "Video" && "Video"}
            {entry.value === "Siaran Langsung" && "Siaran Langsung"}
            {entry.value === "Total" && "Total"}
          </span>
        </div>
      ))}
    </div>
  );
};

interface Period {
  value: TimePeriod;
  label: string;
  filterQuery: Partial<FilterQuery>;
  labelStart: string;
  labelEnd: string;
}

const periods: Period[] = [
  {
    value: "7d",
    label: "7 Hari",
    labelStart: dateFormat.indonesianDate(
      new Date(new Date().setDate(new Date().getDate() - 7))
    ),
    labelEnd: dateFormat.indonesianDate(new Date()),
    filterQuery: {
      page: 1,
      dateStart: dateManipulation.ymd(
        new Date(new Date().setDate(new Date().getDate() - 7))
      ),
    },
  },
  {
    value: "30d",
    label: "30 Hari",
    labelStart: dateFormat.indonesianDate(
      new Date(new Date().setDate(new Date().getDate() - 30))
    ),
    labelEnd: dateFormat.indonesianDate(new Date()),
    filterQuery: {
      page: 7,
      dateStart: dateManipulation.ymd(
        new Date(new Date().setDate(new Date().getDate() - 30))
      ),
    },
  },
  {
    value: "1y",
    label: "1 Tahun",
    labelStart: dateFormat.indonesianDate(
      new Date(new Date().setFullYear(new Date().getFullYear() - 1))
    ),
    labelEnd: dateFormat.indonesianDate(new Date()),
    filterQuery: {
      page: 30,
      dateStart: dateManipulation.ymd(
        new Date(new Date().setFullYear(new Date().getFullYear() - 1))
      ),
    },
  },
];

// Period selector component
const PeriodSelector = ({
  period,
  onPeriodChange,
}: {
  period: TimePeriod;
  onPeriodChange: (period: TimePeriod) => void;
}) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">Periode:</span>

      {periods.map((p) => (
        <Button
          key={p.value}
          onClick={() => onPeriodChange(p.value)}
          variant={period === p.value ? "default" : "outline"}
          size="sm"
        >
          {p.label}
        </Button>
      ))}
    </div>
  );
};

// Main chart component
export function AdvancedTokenChart() {
  const [period, setPeriod] = useState<TimePeriod>("7d");

  const { businessId } = useParams() as { businessId: string };
  const findPeriod = periods.find((p) => p.value === period);
  const { data: tokenUsageData } = useTokenGetAnalyticUsage(
    businessId,
    findPeriod?.filterQuery
  );
  const chartData = (tokenUsageData?.data?.data || []).map((item) => ({
    date: item.date,
    Image: item.Image,
    Video: item.Video,
    LiveStream: item.LiveStream,
    Total: item.Image + item.Video + item.LiveStream,
  }));

  const dateRangeLabel = useMemo(
    () => `${findPeriod?.labelStart} - ${findPeriod?.labelEnd}`,
    [findPeriod]
  );

  return (
    <ChartErrorBoundary>
      <div className="w-full">
        {/* Header with controls */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-foreground">
              Analisis Penggunaan Token
            </h3>
            <p className="text-sm text-muted-foreground">{dateRangeLabel}</p>
          </div>
          <div className="flex items-center gap-4">
            <PeriodSelector period={period} onPeriodChange={setPeriod} />
          </div>
        </div>

        {/* Chart container */}
        <div className="bg-card rounded-lg p-4 border border-border">
          <div className="h-80">
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
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorVideo" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient
                    id="colorLivestream"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.1} />
                  </linearGradient>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#F59E0B" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#F59E0B" stopOpacity={0.1} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="var(--grid-color, #E5E7EB)"
                  strokeOpacity={0.3}
                  className="dark:stroke-[#E5E7EB] stroke-[#000000]"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={(value) => formatXAxisLabel(value, period)}
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
                <Tooltip
                  content={(props) => (
                    <CustomTooltip
                      {...props}
                      period={period}
                      label={String(props.label)}
                    />
                  )}
                />
                <Area
                  type="monotone"
                  dataKey="Image"
                  stackId="1"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#colorImages)"
                  fillOpacity={1}
                />
                <Area
                  type="monotone"
                  dataKey="Video"
                  stackId="1"
                  stroke="#8B5CF6"
                  strokeWidth={2}
                  fill="url(#colorVideo)"
                  fillOpacity={1}
                />
                <Area
                  type="monotone"
                  dataKey="LiveStream"
                  stackId="1"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#colorLivestream)"
                  fillOpacity={1}
                />
                <Area
                  type="monotone"
                  dataKey="Total"
                  stroke="#F59E0B"
                  strokeWidth={3}
                  fill="url(#colorTotal)"
                  fillOpacity={0.3}
                  strokeDasharray="5 5"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <CustomLegend
            payload={[
              { value: "Gambar", color: "#3B82F6" },
              { value: "Video", color: "#8B5CF6" },
              { value: "Siaran Langsung", color: "#10B981" },
              { value: "Total", color: "#F59E0B" },
            ]}
          />
        </div>
      </div>
    </ChartErrorBoundary>
  );
}
